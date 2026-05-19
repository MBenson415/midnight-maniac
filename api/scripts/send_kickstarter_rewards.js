#!/usr/bin/env node
// One-time send: emails Kickstarter backers a unique download link for "Sunlit Streets".
// Reuses the existing Midnight_Maniac_Invite_Claims table and /api/invite-claim-download endpoint.
//
// Usage (from repo root):
//   node api/scripts/send_kickstarter_rewards.js           # dry run, no DB writes, no emails
//   node api/scripts/send_kickstarter_rewards.js --send    # writes claim rows and sends emails

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const sql = require('mssql');
const nodemailer = require('nodemailer');

const settingsPath = path.join(__dirname, '..', 'local.settings.json');
if (fs.existsSync(settingsPath)) {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    for (const [k, v] of Object.entries(settings.Values || {})) {
        if (process.env[k] === undefined) process.env[k] = v;
    }
}

const RECIPIENTS = [
    'smick2424@live.com',
    'melineh@aol.com',
    'theandreafurber@gmail.com',
    'kimcorwin@comcast.net',
    'cnickel6767@gmail.com',
    'jsolo41515@aol.com',
    'awkwardmama101@gmail.com',
    'isabeldelwel@gmail.com',
    'pncombies@yahoo.com',
];

const SITE_URL = (process.env.SITE_URL || 'https://midnightmaniacband.com').replace(/\/$/, '');
const CLAIM_TTL_DAYS = 30;
const DRY_RUN = !process.argv.includes('--send');
const COVER_IMAGE_PATH = path.join(__dirname, '..', '..', 'assets', 'Sunlit Streets Cover.png');
const COVER_CID = 'sunlit-streets-cover';

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildEmail(downloadUrl) {
    const safeUrl = escapeHtml(downloadUrl);

    const text = [
        'Hey there,',
        '',
        'Thank you so much for backing Midnight Maniac on Kickstarter. Without supporters like you, none of this would exist.',
        '',
        'Your reward is ready — here is your private download link for "Sunlit Streets":',
        downloadUrl,
        '',
        'A couple of things to know:',
        '- The link only works one time. Make sure to save the file when it downloads.',
        '- It is personal to you. Please do not share the link.',
        '',
        'Thanks again for believing in this. Hope you love the song.',
        '',
        '- Midnight Maniac',
    ].join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Your Midnight Maniac Kickstarter reward</title>
</head>
<body style="margin:0; padding:0; background-color:#0f0f12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color:#e8e8ea;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f12; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#18181d; border:1px solid #2a2a31; border-radius:8px; overflow:hidden;">
          <tr>
            <td align="center" style="padding:32px 32px 16px 32px; background-color:#18181d;">
              <img src="cid:${COVER_CID}" alt="Sunlit Streets cover art" width="360" style="display:block; width:100%; max-width:360px; height:auto; border-radius:6px; border:1px solid #2a2a31;">
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px 32px; background-color:#18181d; border-bottom:1px solid #2a2a31; text-align:center;">
              <div style="font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#a02040; font-weight:700; margin-bottom:6px;">Midnight Maniac &middot; Kickstarter Reward</div>
              <div style="font-size:22px; font-weight:700; color:#ffffff; line-height:1.3;">Thank you for backing us.</div>
              <div style="font-size:14px; color:#9a9aa3; margin-top:8px;">Your download is ready.</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px; font-size:15px; color:#e8e8ea; line-height:1.7;">
              Without backers like you, none of this would exist. As a thank-you for supporting Midnight Maniac on Kickstarter, here&rsquo;s your private download of <strong>Sunlit Streets</strong>.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 32px 20px 32px;">
              <a href="${safeUrl}"
                 style="display:inline-block; padding:14px 32px; background-color:#d04060; color:#ffffff; text-decoration:none; font-size:14px; font-weight:700; letter-spacing:1px; text-transform:uppercase; border-radius:6px;">
                Download song
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px 32px;">
              <div style="font-size:13px; color:#9a9aa3; line-height:1.7;">
                A few things to know:<br>
                &middot; This link works one time only &mdash; save the file when it downloads.<br>
                &middot; It&rsquo;s personal to you. Please don&rsquo;t share the link.
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px 32px;">
              <div style="font-size:12px; color:#7a7a85; line-height:1.6;">
                Or paste this link into your browser:<br>
                <a href="${safeUrl}" style="color:#d04060; text-decoration:none; word-break:break-all;">${safeUrl}</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px 32px; font-size:14px; color:#e8e8ea; line-height:1.6;">
              Thanks again for believing in this. Hope you love the song.<br><br>
              &mdash; Midnight Maniac
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

function getPool() {
    return new sql.ConnectionPool({
        server: process.env.DB_SERVER,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        options: {
            encrypt: true,
            trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
        },
        pool: { max: 5, min: 0, idleTimeoutMillis: 30000 },
    }).connect();
}

async function getOrCreateClaimToken(pool, email) {
    const existing = await pool.request()
        .input('email', sql.NVarChar(254), email)
        .query('SELECT claim_token, claimed_at FROM dbo.Midnight_Maniac_Invite_Claims WHERE email = @email');

    if (existing.recordset.length) {
        const row = existing.recordset[0];
        if (row.claimed_at) return { token: row.claim_token, status: 'already_claimed' };
        return { token: row.claim_token, status: 'reused' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + CLAIM_TTL_DAYS * 24 * 60 * 60 * 1000);
    await pool.request()
        .input('email', sql.NVarChar(254), email)
        .input('claim_token', sql.VarChar(64), token)
        .input('expires_at', sql.DateTimeOffset(3), expiresAt)
        .query(`
            INSERT INTO dbo.Midnight_Maniac_Invite_Claims
                (email, claim_token, attested_at, attested_ip, expires_at)
            VALUES
                (@email, @claim_token, SYSDATETIMEOFFSET(), NULL, @expires_at);
        `);
    return { token, status: 'created' };
}

async function sendOne(transporter, fromUser, toEmail, downloadUrl) {
    const { text, html } = buildEmail(downloadUrl);
    await transporter.sendMail({
        from: `"Midnight Maniac" <${fromUser}>`,
        to: toEmail,
        subject: 'Your Midnight Maniac Kickstarter reward is ready -- Download "Sunlit Streets"!',
        text,
        html,
        attachments: [{
            filename: 'Sunlit Streets Cover.png',
            path: COVER_IMAGE_PATH,
            cid: COVER_CID,
        }],
    });
}

async function main() {
    const required = ['DB_SERVER', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'GMAIL_USER', 'GMAIL_APP_PASSWORD'];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length) {
        console.error(`Missing env vars: ${missing.join(', ')}`);
        process.exit(1);
    }
    if (!fs.existsSync(COVER_IMAGE_PATH)) {
        console.error(`Cover image not found: ${COVER_IMAGE_PATH}`);
        process.exit(1);
    }

    console.log(`Mode:        ${DRY_RUN ? 'DRY RUN (no DB writes, no emails)' : 'LIVE SEND'}`);
    console.log(`Site URL:    ${SITE_URL}`);
    console.log(`From:        ${process.env.GMAIL_USER}`);
    console.log(`Recipients:  ${RECIPIENTS.length}`);
    console.log('');

    if (DRY_RUN) {
        for (const email of RECIPIENTS) {
            console.log(`[dry] would create claim + email ${email.toLowerCase()}`);
        }
        console.log('');
        console.log('Re-run with --send to actually create claims and send emails.');
        return;
    }

    const pool = await getPool();
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });

    const summary = { created: 0, reused: 0, already_claimed: 0, sent: 0, failed: 0 };

    for (const rawEmail of RECIPIENTS) {
        const email = String(rawEmail).trim().toLowerCase();
        try {
            const { token, status } = await getOrCreateClaimToken(pool, email);
            const downloadUrl = `${SITE_URL}/api/invite-claim-download?token=${token}`;

            if (status === 'already_claimed') {
                console.log(`[skip] ${email} — already redeemed, not emailing dead link`);
                summary.already_claimed++;
                continue;
            }
            summary[status]++;

            await sendOne(transporter, process.env.GMAIL_USER, email, downloadUrl);
            console.log(`[sent] ${email} — ${status}`);
            summary.sent++;
        } catch (err) {
            summary.failed++;
            console.error(`[fail] ${email}:`, err.message);
        }
    }

    await pool.close();
    console.log('');
    console.log('Summary:', summary);
}

main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});
