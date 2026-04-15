const sql = require('mssql');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const EMAIL_MAX_LENGTH = 254;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function buildConfirmEmail(confirmUrl) {
    const safeUrl = escapeHtml(confirmUrl);
    const text = [
        'Welcome to the Midnight Maniac mailing list!',
        '',
        'Please confirm your subscription by clicking the link below:',
        confirmUrl,
        '',
        "If you didn't sign up, you can safely ignore this email — we won't add you to the list without your confirmation.",
        '',
        '- Midnight Maniac',
    ].join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Confirm your Midnight Maniac subscription</title>
</head>
<body style="margin:0; padding:0; background-color:#0f0f12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color:#e8e8ea;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f12; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#18181d; border:1px solid #2a2a31; border-radius:8px; overflow:hidden;">
          <tr>
            <td style="padding:28px 32px; background:linear-gradient(135deg, #1a1a20 0%, #2a1020 100%); border-bottom:1px solid #2a2a31;">
              <div style="font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#a02040; font-weight:700; margin-bottom:6px;">Midnight Maniac</div>
              <div style="font-size:22px; font-weight:700; color:#ffffff; line-height:1.3;">Confirm your subscription</div>
              <div style="font-size:14px; color:#9a9aa3; margin-top:8px;">One more step and you're on the list.</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px; font-size:15px; color:#e8e8ea; line-height:1.6;">
              Thanks for signing up for Midnight Maniac updates. Click the button below to confirm your email address and start receiving news about shows, new music, and merch drops.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 32px 28px 32px;">
              <a href="${safeUrl}"
                 style="display:inline-block; padding:14px 32px; background-color:#d04060; color:#ffffff; text-decoration:none; font-size:14px; font-weight:700; letter-spacing:1px; text-transform:uppercase; border-radius:6px;">
                Confirm subscription
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
            <td style="padding:16px 32px 24px 32px; background-color:#141418; border-top:1px solid #2a2a31;">
              <div style="font-size:12px; color:#9a9aa3; line-height:1.6;">
                If you didn't sign up for the Midnight Maniac mailing list, you can safely ignore this email. We won't add you unless you click the confirm button above.
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

async function sendConfirmationEmail(toEmail, confirmUrl) {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) {
        throw new Error('Missing GMAIL_USER or GMAIL_APP_PASSWORD');
    }
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
    });
    const { text, html } = buildConfirmEmail(confirmUrl);
    await transporter.sendMail({
        from: `"Midnight Maniac" <${user}>`,
        to: toEmail,
        subject: 'Confirm your Midnight Maniac subscription',
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
    const source = (req.body && req.body.source) || 'footer_signup';

    const email = String(rawEmail).trim().toLowerCase();
    if (!email || email.length > EMAIL_MAX_LENGTH || !EMAIL_REGEX.test(email)) {
        context.res = { status: 400, body: { error: 'Please provide a valid email address.' } };
        return;
    }

    const fwd = req.headers['x-forwarded-for'] || '';
    const consentIp = fwd.split(',')[0].trim().split(':')[0] || null;
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');
    const confirmationToken = crypto.randomBytes(32).toString('hex');

    // Build confirm URL from the request origin so dev and prod both work.
    const origin = process.env.SITE_URL || req.headers.origin || `https://${req.headers.host}`;
    const confirmUrl = `${origin.replace(/\/$/, '')}/api/confirm-subscribe?token=${confirmationToken}`;

    try {
        const pool = await getPool();

        // Check current state before writing so we can respond appropriately.
        const existing = await pool.request()
            .input('email', sql.NVarChar(254), email)
            .query('SELECT is_subscribed, confirmed_at FROM dbo.Midnight_Maniac_Subscribers WHERE email = @email');

        if (existing.recordset.length && existing.recordset[0].is_subscribed) {
            context.res = { status: 200, body: { ok: true, message: "You're already subscribed." } };
            return;
        }

        // Upsert: refresh the confirmation token on re-signup so old links die.
        await pool.request()
            .input('email', sql.NVarChar(254), email)
            .input('consent_ip', sql.VarChar(45), consentIp)
            .input('consent_source', sql.NVarChar(100), String(source).slice(0, 100))
            .input('unsubscribe_token', sql.VarChar(64), unsubscribeToken)
            .input('confirmation_token', sql.VarChar(64), confirmationToken)
            .query(`
                MERGE dbo.Midnight_Maniac_Subscribers AS target
                USING (SELECT @email AS email) AS src
                   ON target.email = src.email
                WHEN MATCHED THEN
                    UPDATE SET
                        confirmation_token = @confirmation_token,
                        confirmation_sent_at = SYSDATETIMEOFFSET(),
                        consent_ip = @consent_ip,
                        consent_source = @consent_source
                WHEN NOT MATCHED THEN
                    INSERT (email, consent_given_at, consent_ip, consent_source,
                            unsubscribe_token, confirmation_token, confirmation_sent_at, is_subscribed)
                    VALUES (@email, SYSDATETIMEOFFSET(), @consent_ip, @consent_source,
                            @unsubscribe_token, @confirmation_token, SYSDATETIMEOFFSET(), 0);
            `);

        await sendConfirmationEmail(email, confirmUrl);

        context.res = {
            status: 200,
            body: { ok: true, message: 'Check your email to confirm your subscription.' }
        };
    } catch (error) {
        context.log.error('Subscribe error:', error);
        context.res = { status: 500, body: { error: 'Could not save subscription. Please try again.' } };
    }
};
