const sql = require('mssql');
const crypto = require('crypto');
const { sendRewardEmail } = require('../shared/reward-email');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const EMAIL_MAX_LENGTH = 254;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CLAIM_TTL_DAYS = 30;

let poolPromise;

function getPool() {
    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool({
            server: process.env.DB_SERVER,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            options: {
                encrypt: true,
                trustServerCertificate: process.env.DB_TRUST_CERT === 'true'
            },
            pool: { max: 5, min: 0, idleTimeoutMillis: 30000 }
        }).connect().catch((err) => {
            poolPromise = undefined;
            throw err;
        });
    }
    return poolPromise;
}

module.exports = async function (context, req) {
    const required = ['DB_SERVER', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length) {
        context.log.error(`Missing DB env vars: ${missing.join(', ')}`);
        context.res = { status: 500, body: { error: 'Server configuration error' } };
        return;
    }

    const rawEmail = (req.body && req.body.email) || '';
    const attested = !!(req.body && req.body.attested);

    const email = String(rawEmail).trim().toLowerCase();
    if (!email || email.length > EMAIL_MAX_LENGTH || !EMAIL_REGEX.test(email)) {
        context.res = { status: 400, body: { error: 'Please provide a valid email address.' } };
        return;
    }
    if (!attested) {
        context.res = { status: 400, body: { error: 'Please confirm you invited friends to the page.' } };
        return;
    }

    const fwd = req.headers['x-forwarded-for'] || '';
    const attestedIp = fwd.split(',')[0].trim().split(':')[0] || null;

    const origin = process.env.SITE_URL || req.headers.origin || `https://${req.headers.host}`;
    const baseUrl = origin.replace(/\/$/, '');

    try {
        const pool = await getPool();

        // Try to find an existing claim. If one exists for this email, resend that token.
        const existing = await pool.request()
            .input('email', sql.NVarChar(254), email)
            .query('SELECT claim_token, claimed_at, expires_at FROM dbo.Midnight_Maniac_Invite_Claims WHERE email = @email');

        let claimToken;
        if (existing.recordset.length) {
            const row = existing.recordset[0];
            if (row.claimed_at) {
                // Already downloaded once — don't email a dead link, just tell them.
                context.res = {
                    status: 200,
                    body: { ok: true, message: 'This email has already redeemed its download. Reach out if you need help.' }
                };
                return;
            }
            claimToken = row.claim_token;
        } else {
            claimToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + CLAIM_TTL_DAYS * 24 * 60 * 60 * 1000);
            await pool.request()
                .input('email', sql.NVarChar(254), email)
                .input('claim_token', sql.VarChar(64), claimToken)
                .input('attested_ip', sql.VarChar(45), attestedIp)
                .input('expires_at', sql.DateTimeOffset(3), expiresAt)
                .query(`
                    INSERT INTO dbo.Midnight_Maniac_Invite_Claims
                        (email, claim_token, attested_at, attested_ip, expires_at)
                    VALUES
                        (@email, @claim_token, SYSDATETIMEOFFSET(), @attested_ip, @expires_at);
                `);
        }

        const downloadUrl = `${baseUrl}/api/invite-claim-download?token=${claimToken}`;
        await sendRewardEmail(email, downloadUrl);

        context.res = {
            status: 200,
            body: { ok: true, message: 'Check your email for your download link.' }
        };
    } catch (error) {
        context.log.error('Invite-claim error:', error);
        context.res = { status: 500, body: { error: 'Could not process your claim. Please try again.' } };
    }
};
