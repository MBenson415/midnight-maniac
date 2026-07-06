const nodemailer = require('nodemailer');

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildRewardEmail(downloadUrl) {
    const safeUrl = escapeHtml(downloadUrl);
  const artworkUrl = 'https://squarespacemusic.blob.core.windows.net/$web/Sunlit%20Streets%20Cover.png';
    const text = [
    'Your download is ready.',
    '',
    'Your download of "Sunlit Streets" is ready. Click the link below to grab it:',
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
<title>Your download is ready</title>
</head>
<body style="margin:0; padding:0; background-color:#0f0f12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color:#e8e8ea;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f12; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#18181d; border:1px solid #2a2a31; border-radius:8px; overflow:hidden;">
          <tr>
            <td style="padding:28px 32px; background:linear-gradient(135deg, #1a1a20 0%, #2a1020 100%); border-bottom:1px solid #2a2a31;">
              <div style="font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#a02040; font-weight:700; margin-bottom:6px;">Midnight Maniac</div>
              <div style="font-size:22px; font-weight:700; color:#ffffff; line-height:1.3;">Your download is ready</div>
              <div style="font-size:14px; color:#9a9aa3; margin-top:8px;">Thanks for supporting Midnight Maniac.</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px; font-size:15px; color:#e8e8ea; line-height:1.6;">
              Grab your download of <strong>Sunlit Streets</strong> using the button below. This link works once, so make sure to save the file when it downloads.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 32px 20px 32px;">
              <img src="${artworkUrl}"
                   alt="Sunlit Streets album artwork"
                   width="220"
                   style="display:block; width:220px; max-width:100%; height:auto; border-radius:8px; border:1px solid #2a2a31;">
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

module.exports = {
    buildRewardEmail,
    sendRewardEmail,
};
