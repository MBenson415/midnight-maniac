const sql = require('mssql');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

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

function htmlPage({ title, heading, message, isError }) {
    const accent = isError ? '#a02040' : '#d04060';
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:#0f0f12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color:#e8e8ea; min-height:100vh;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f12; padding:64px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="540" cellpadding="0" cellspacing="0" style="max-width:540px; width:100%; background-color:#18181d; border:1px solid #2a2a31; border-radius:8px; overflow:hidden;">
          <tr>
            <td style="padding:36px 36px 28px 36px; background:linear-gradient(135deg, #1a1a20 0%, #2a1020 100%); border-bottom:1px solid #2a2a31; text-align:center;">
              <div style="font-size:12px; letter-spacing:2px; text-transform:uppercase; color:${accent}; font-weight:700; margin-bottom:10px;">Midnight Maniac</div>
              <div style="font-size:26px; font-weight:700; color:#ffffff; line-height:1.3;">${heading}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px 36px 36px; font-size:15px; color:#e8e8ea; line-height:1.7; text-align:center;">
              ${message}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 36px 36px 36px;">
              <a href="/"
                 style="display:inline-block; padding:12px 28px; background-color:${accent}; color:#ffffff; text-decoration:none; font-size:13px; font-weight:700; letter-spacing:1px; text-transform:uppercase; border-radius:6px;">
                Back to site
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function respondHtml(context, status, page) {
    context.res = {
        status,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        body: page,
    };
}

module.exports = async function (context, req) {
    const required = ['DB_SERVER', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length) {
        context.log.error(`Missing DB env vars: ${missing.join(', ')}`);
        respondHtml(context, 500, htmlPage({
            title: 'Server error',
            heading: 'Something went wrong',
            message: "We couldn't confirm your subscription right now. Please try again later.",
            isError: true,
        }));
        return;
    }

    const token = (req.query && req.query.token) || '';
    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
        respondHtml(context, 400, htmlPage({
            title: 'Invalid link',
            heading: 'Invalid confirmation link',
            message: 'This confirmation link looks invalid or malformed. Try signing up again from the site.',
            isError: true,
        }));
        return;
    }

    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('token', sql.VarChar(64), token)
            .query(`
                UPDATE dbo.Midnight_Maniac_Subscribers
                   SET is_subscribed    = 1,
                       confirmed_at     = SYSDATETIMEOFFSET(),
                       confirmation_token = NULL,
                       unsubscribed_at  = NULL
                OUTPUT inserted.email
                 WHERE confirmation_token = @token;
            `);

        if (result.recordset.length === 0) {
            // Either already confirmed (token was cleared) or never existed.
            respondHtml(context, 404, htmlPage({
                title: 'Link not found',
                heading: "Link already used or expired",
                message: "This confirmation link is no longer valid. If you're already subscribed, you're all set. Otherwise, sign up again from the site.",
                isError: true,
            }));
            return;
        }

        respondHtml(context, 200, htmlPage({
            title: 'Subscription confirmed',
            heading: "You're on the list!",
            message: "Thanks for confirming. You'll hear from Midnight Maniac when there's news about shows, music, and merch drops.",
            isError: false,
        }));
    } catch (error) {
        context.log.error('Confirm-subscribe error:', error);
        respondHtml(context, 500, htmlPage({
            title: 'Server error',
            heading: 'Something went wrong',
            message: "We couldn't confirm your subscription right now. Please try again later.",
            isError: true,
        }));
    }
};
