const sql = require('mssql');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const DOWNLOAD_FILENAME = 'Midnight Maniac - Sunlit Streets.mp3';

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
    const required = ['DB_SERVER', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'INVITE_REWARD_BLOB_URL'];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length) {
        context.log.error(`Missing env vars: ${missing.join(', ')}`);
        respondHtml(context, 500, htmlPage({
            title: 'Server error',
            heading: 'Something went wrong',
            message: "We couldn't process your download right now. Please try again later.",
            isError: true,
        }));
        return;
    }

    const token = (req.query && req.query.token) || '';
    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
        respondHtml(context, 400, htmlPage({
            title: 'Invalid link',
            heading: 'Invalid download link',
            message: 'This download link looks invalid. Try submitting the form again.',
            isError: true,
        }));
        return;
    }

    let row;
    try {
        const pool = await getPool();
        // Atomically mark the claim used. Only succeeds if not already claimed
        // and not expired, so concurrent clicks can't double-claim.
        const result = await pool.request()
            .input('token', sql.VarChar(64), token)
            .query(`
                UPDATE dbo.Midnight_Maniac_Invite_Claims
                   SET claimed_at = SYSDATETIMEOFFSET()
                OUTPUT inserted.email, inserted.expires_at
                 WHERE claim_token = @token
                   AND claimed_at IS NULL
                   AND expires_at > SYSDATETIMEOFFSET();
            `);

        if (result.recordset.length === 0) {
            // Look up the row to give a more specific error.
            const lookup = await pool.request()
                .input('token', sql.VarChar(64), token)
                .query('SELECT claimed_at, expires_at FROM dbo.Midnight_Maniac_Invite_Claims WHERE claim_token = @token');

            if (!lookup.recordset.length) {
                respondHtml(context, 404, htmlPage({
                    title: 'Link not found',
                    heading: 'Link not found',
                    message: "This download link isn't valid. If you think this is a mistake, submit the form again.",
                    isError: true,
                }));
                return;
            }
            if (lookup.recordset[0].claimed_at) {
                respondHtml(context, 410, htmlPage({
                    title: 'Already used',
                    heading: 'Link already used',
                    message: "This download link has already been used. If you didn't get the file, reach out and we'll sort it out.",
                    isError: true,
                }));
                return;
            }
            respondHtml(context, 410, htmlPage({
                title: 'Link expired',
                heading: 'Link expired',
                message: 'This download link has expired. Submit the form again to get a new one.',
                isError: true,
            }));
            return;
        }
        row = result.recordset[0];
    } catch (error) {
        context.log.error('Invite-claim-download DB error:', error);
        respondHtml(context, 500, htmlPage({
            title: 'Server error',
            heading: 'Something went wrong',
            message: "We couldn't process your download right now. Please try again later.",
            isError: true,
        }));
        return;
    }

    // Stream the blob through the function so the underlying URL stays server-side.
    try {
        const upstream = await fetch(new URL(process.env.INVITE_REWARD_BLOB_URL));
        if (!upstream.ok || !upstream.body) {
            context.log.error(`Upstream blob fetch failed: ${upstream.status}`);
            // Roll back the claim so the user can retry.
            try {
                const pool = await getPool();
                await pool.request()
                    .input('token', sql.VarChar(64), token)
                    .query('UPDATE dbo.Midnight_Maniac_Invite_Claims SET claimed_at = NULL WHERE claim_token = @token');
            } catch (rollbackErr) {
                context.log.error('Failed to roll back claim after upstream error:', rollbackErr);
            }
            respondHtml(context, 502, htmlPage({
                title: 'Download unavailable',
                heading: 'Download unavailable',
                message: "We couldn't fetch the file right now. Try the link again in a minute.",
                isError: true,
            }));
            return;
        }
        const buffer = Buffer.from(await upstream.arrayBuffer());
        context.res = {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': `attachment; filename="${DOWNLOAD_FILENAME}"`,
                'Content-Length': String(buffer.length),
                'Cache-Control': 'no-store',
            },
            body: buffer,
            isRaw: true,
        };
    } catch (error) {
        context.log.error('Invite-claim-download stream error:', error);
        try {
            const pool = await getPool();
            await pool.request()
                .input('token', sql.VarChar(64), token)
                .query('UPDATE dbo.Midnight_Maniac_Invite_Claims SET claimed_at = NULL WHERE claim_token = @token');
        } catch (rollbackErr) {
            context.log.error('Failed to roll back claim after stream error:', rollbackErr);
        }
        respondHtml(context, 500, htmlPage({
            title: 'Server error',
            heading: 'Something went wrong',
            message: "We couldn't process your download right now. Please try again later.",
            isError: true,
        }));
    }
};
