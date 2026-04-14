const Stripe = require('stripe');
const nodemailer = require('nodemailer');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const NOTIFY_TO = 'jallard530@gmail.com';
const STRIPE_ACCOUNT_ID = 'acct_1Rtryb2QdlAL5W5A';

function formatAmount(amount, currency) {
    if (amount == null) return '';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: (currency || 'usd').toUpperCase(),
    }).format(amount / 100);
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

function formatAddressHtml(addr) {
    if (!addr) return 'N/A';
    const cityLine = [addr.city, addr.state, addr.postal_code].filter(Boolean).join(', ');
    return [addr.line1, addr.line2, cityLine, addr.country]
        .filter(Boolean)
        .map(escapeHtml)
        .join('<br>');
}

function formatAddressText(addr) {
    if (!addr) return 'N/A';
    return [
        addr.line1,
        addr.line2,
        [addr.city, addr.state, addr.postal_code].filter(Boolean).join(', '),
        addr.country,
    ].filter(Boolean).join('\n');
}

function extractSessionContext(session) {
    const shipping = session.shipping_details || session.collected_information?.shipping_details;
    const customerName = shipping?.name || session.customer_details?.name || 'Customer';
    const customerEmail = session.customer_details?.email || 'N/A';
    const customerPhone = session.customer_details?.phone || 'N/A';
    const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || null;
    const stripeUrl = paymentIntentId
        ? `https://dashboard.stripe.com/${STRIPE_ACCOUNT_ID}/payments/${paymentIntentId}`
        : null;
    return { shipping, customerName, customerEmail, customerPhone, paymentIntentId, stripeUrl };
}

function buildTextBody(session, lineItems) {
    const { shipping, customerName, customerEmail, customerPhone, paymentIntentId, stripeUrl } =
        extractSessionContext(session);
    const currency = session.currency;

    const itemLines = (lineItems?.data || []).map(item => {
        const name = item.description || item.price?.product?.name || 'Item';
        const qty = item.quantity;
        const total = formatAmount(item.amount_total, currency);
        return `  - ${qty} x ${name} — ${total}`;
    }).join('\n');

    const subtotal = formatAmount(session.amount_subtotal, currency);
    const shippingCost = formatAmount(session.shipping_cost?.amount_total ?? 0, currency);
    const discount = session.total_details?.amount_discount
        ? formatAmount(session.total_details.amount_discount, currency)
        : null;
    const total = formatAmount(session.amount_total, currency);

    return [
        `A new Midnight Maniac order just came in. Time to ship!`,
        ``,
        `=== Customer ===`,
        `Name:  ${customerName}`,
        `Email: ${customerEmail}`,
        `Phone: ${customerPhone}`,
        ``,
        `=== Ship to ===`,
        `${customerName}`,
        formatAddressText(shipping?.address),
        ``,
        `=== Items ===`,
        itemLines || '  (no line items)',
        ``,
        `=== Totals ===`,
        `Subtotal: ${subtotal}`,
        `Shipping: ${shippingCost}`,
        discount ? `Discount: -${discount}` : null,
        `Total paid: ${total}`,
        ``,
        `Stripe Checkout Session: ${session.id}`,
        `Payment Intent: ${paymentIntentId || 'N/A'}`,
        stripeUrl ? `View in Stripe: ${stripeUrl}` : null,
    ].filter(Boolean).join('\n');
}

function buildHtmlBody(session, lineItems) {
    const { shipping, customerName, customerEmail, customerPhone, paymentIntentId, stripeUrl } =
        extractSessionContext(session);
    const currency = session.currency;

    const itemRows = (lineItems?.data || []).map(item => {
        const product = item.price?.product;
        const name = escapeHtml(product?.name || item.description || 'Item');
        const description = escapeHtml(product?.description || '');
        const qty = item.quantity;
        const total = escapeHtml(formatAmount(item.amount_total, currency));
        return `
                  <tr>
                    <td style="padding:14px 0; border-bottom:1px solid #242429; vertical-align:top;">
                      <div style="color:#ffffff; font-weight:600;">${name}</div>
                      ${description ? `<div style="color:#9a9aa3; font-size:12px; margin-top:2px;">${description}</div>` : ''}
                    </td>
                    <td align="center" style="padding:14px 0; border-bottom:1px solid #242429; vertical-align:top; color:#e8e8ea;">${qty}</td>
                    <td align="right" style="padding:14px 0; border-bottom:1px solid #242429; vertical-align:top; color:#ffffff; font-weight:600;">${total}</td>
                  </tr>`;
    }).join('');

    const subtotal = escapeHtml(formatAmount(session.amount_subtotal, currency));
    const shippingCost = escapeHtml(formatAmount(session.shipping_cost?.amount_total ?? 0, currency));
    const discountAmount = session.total_details?.amount_discount;
    const discountRow = discountAmount
        ? `<tr>
             <td align="right" style="padding:4px 0; color:#9a9aa3;">Discount</td>
             <td align="right" style="padding:4px 0; width:90px; color:#e8e8ea;">-${escapeHtml(formatAmount(discountAmount, currency))}</td>
           </tr>`
        : '';
    const total = escapeHtml(formatAmount(session.amount_total, currency));

    const stripeButton = stripeUrl
        ? `<div style="margin-top:14px;">
             <a href="${escapeHtml(stripeUrl)}"
                style="display:inline-block; padding:10px 18px; background-color:#635bff; color:#ffffff; text-decoration:none; font-size:13px; font-weight:600; border-radius:6px;">
               View payment in Stripe &rarr;
             </a>
           </div>`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>New Midnight Maniac order from ${escapeHtml(customerName)}</title>
</head>
<body style="margin:0; padding:0; background-color:#0f0f12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color:#e8e8ea;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f12; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#18181d; border:1px solid #2a2a31; border-radius:8px; overflow:hidden;">
          <tr>
            <td style="padding:28px 32px; background:linear-gradient(135deg, #1a1a20 0%, #2a1020 100%); border-bottom:1px solid #2a2a31;">
              <div style="font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#a02040; font-weight:700; margin-bottom:6px;">Midnight Maniac</div>
              <div style="font-size:22px; font-weight:700; color:#ffffff; line-height:1.3;">New order — it's time to ship!</div>
              <div style="font-size:14px; color:#9a9aa3; margin-top:8px;">A new merchandise order just came in from <strong style="color:#e8e8ea;">${escapeHtml(customerName)}</strong>.</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 8px 32px;">
              <div style="font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:#7a7a85; font-weight:700; margin-bottom:10px;">Customer</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#e8e8ea; line-height:1.6;">
                <tr><td style="padding:2px 0;"><strong style="color:#9a9aa3; font-weight:500;">Name:</strong> ${escapeHtml(customerName)}</td></tr>
                <tr><td style="padding:2px 0;"><strong style="color:#9a9aa3; font-weight:500;">Email:</strong> <a href="mailto:${escapeHtml(customerEmail)}" style="color:#d04060; text-decoration:none;">${escapeHtml(customerEmail)}</a></td></tr>
                <tr><td style="padding:2px 0;"><strong style="color:#9a9aa3; font-weight:500;">Phone:</strong> ${escapeHtml(customerPhone)}</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 8px 32px;">
              <div style="font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:#7a7a85; font-weight:700; margin-bottom:10px;">Ship to</div>
              <div style="font-size:14px; color:#e8e8ea; line-height:1.6;">
                ${escapeHtml(customerName)}<br>
                ${formatAddressHtml(shipping?.address)}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 8px 32px;">
              <div style="font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:#7a7a85; font-weight:700; margin-bottom:10px;">Items</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#e8e8ea; border-collapse:collapse;">
                <thead>
                  <tr style="font-size:11px; color:#7a7a85; text-transform:uppercase; letter-spacing:1px;">
                    <th align="left" style="padding:8px 0; border-bottom:1px solid #2a2a31; font-weight:600;">Item</th>
                    <th align="center" style="padding:8px 0; border-bottom:1px solid #2a2a31; font-weight:600; width:50px;">Qty</th>
                    <th align="right" style="padding:8px 0; border-bottom:1px solid #2a2a31; font-weight:600; width:90px;">Amount</th>
                  </tr>
                </thead>
                <tbody>${itemRows}
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 32px 24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#e8e8ea;">
                <tr>
                  <td align="right" style="padding:4px 0; color:#9a9aa3;">Subtotal</td>
                  <td align="right" style="padding:4px 0; width:90px; color:#e8e8ea;">${subtotal}</td>
                </tr>
                <tr>
                  <td align="right" style="padding:4px 0; color:#9a9aa3;">Shipping</td>
                  <td align="right" style="padding:4px 0; width:90px; color:#e8e8ea;">${shippingCost}</td>
                </tr>
                ${discountRow}
                <tr>
                  <td align="right" style="padding:10px 0 4px 0; border-top:1px solid #2a2a31; font-size:16px; font-weight:700; color:#ffffff;">Total paid</td>
                  <td align="right" style="padding:10px 0 4px 0; border-top:1px solid #2a2a31; width:90px; font-size:16px; font-weight:700; color:#d04060;">${total}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 24px 32px; background-color:#141418; border-top:1px solid #2a2a31;">
              <div style="font-size:11px; letter-spacing:1.5px; text-transform:uppercase; color:#7a7a85; font-weight:700; margin-bottom:10px;">Stripe references</div>
              <div style="font-size:12px; color:#9a9aa3; font-family: 'SF Mono', Menlo, Consolas, monospace; line-height:1.6;">
                Session: ${escapeHtml(session.id)}<br>
                Payment Intent: ${escapeHtml(paymentIntentId || 'N/A')}
              </div>
              ${stripeButton}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px; text-align:center; background-color:#0f0f12; border-top:1px solid #2a2a31;">
              <div style="font-size:11px; color:#6a6a75;">This is an automated notification from the Midnight Maniac store.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendOrderEmail(session, lineItems) {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) {
        throw new Error('Missing GMAIL_USER or GMAIL_APP_PASSWORD');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
    });

    const { customerName } = extractSessionContext(session);

    await transporter.sendMail({
        from: `"Midnight Maniac Orders" <${user}>`,
        to: NOTIFY_TO,
        subject: `Midnight Maniac merchandise order from ${customerName} - It's time to ship!`,
        text: buildTextBody(session, lineItems),
        html: buildHtmlBody(session, lineItems),
    });
}

module.exports = async function (context, req) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secretKey || !webhookSecret) {
        context.log.error('Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
        context.res = { status: 500, body: 'Server configuration error' };
        return;
    }

    const stripe = Stripe(secretKey);
    const signature = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
    } catch (err) {
        context.log.error('Webhook signature verification failed:', err.message);
        context.res = { status: 400, body: `Webhook Error: ${err.message}` };
        return;
    }

    if (event.type !== 'checkout.session.completed') {
        context.res = { status: 200, body: { received: true } };
        return;
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(event.data.object.id, {
            expand: ['line_items.data.price.product', 'shipping_cost', 'customer_details', 'total_details'],
        });
        const lineItems = session.line_items;

        await sendOrderEmail(session, lineItems);
        context.log('Order notification email sent for session', session.id);
        context.res = { status: 200, body: { received: true } };
    } catch (err) {
        context.log.error('Failed to process order webhook:', err);
        context.res = { status: 500, body: { error: err.message } };
    }
};