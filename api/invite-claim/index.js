const sql = require('mssql');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildRewardEmail(downloadUrl) {
    const safeUrl = escapeHtml(downloadUrl);
    const text = [
        'Thanks for inviting your friends to Midnight Maniac!',
        '',
        'Your free download of "Sunlit Streets" is ready. Click the link below to grab it:',
        downloadUrl,
        '',
        'This link works once, so save the file when you download it.',
        '',
        '- Midnight Maniac',
    ].join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Your Midnight Maniac download</title>
</head>
<body style="margin:0; padding:0; background-color:#0f0f12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color:#e8e8ea;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f12; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#18181d; border:1px solid #2a2a31; border-radius:8px; overflow:hidden;">
          <tr>
            <td style="padding:28px 32px; background:linear-gradient(135deg, #1a1a20 0%, #2a1020 100%); border-bottom:1px solid #2a2a31;">
              <div style="font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#a02040; font-weight:700; margin-bottom:6px;">Midnight Maniac</div>
              <div style="font-size:22px; font-weight:700; color:#ffffff; line-height:1.3;">Your free download is ready</div>
              <div style="font-size:14px; color:#9a9aa3; margin-top:8px;">Thanks for spreading the word.</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px; font-size:15px; color:#e8e8ea; line-height:1.6;">
              Grab your free download of <strong>Sunlit Streets</strong> using the button below. This link works once, so make sure to save the file when it downloads.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 32px 28px 32px;">
              <a href="${safeUrl}"
                 style="display:inline-block; padding:14px 32px; background-color:#d04060; color:#ffffff; text-decoration:none; font-size:14px; font-weight:700; letter-spacing:1px; text-transform:uppercase; border-radius:6px;">
                Download song
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px 32px;">
              <div style="font-size:12px; color:#7a7a85; line-height:1.6;">
                Or paste this link into your browser:<br>
                <a href="${safeUrl}" style="color:#d04060; text-decoration:none; word-break:break-all;">${safeUrl}</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px; text-align:center; background-color:#0f0f12; border-top:1px solid #2a2a31;">
              <div style="font-size:11px; color:#6a6a75;">&copy; Midnight Maniac</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    return { text, html };
}

async function sendRewardEmail(toEmail, downloadUrl) {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) {
        throw new Error('Missing GMAIL_USER or GMAIL_APP_PASSWORD');
    }
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
    });
    const { text, html } = buildRewardEmail(downloadUrl);
    await transporter.sendMail({
        from: `"Midnight Maniac" <${user}>`,
        to: toEmail,
        subject: 'Your Midnight Maniac download is ready',
        text,
        html,
    });
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
