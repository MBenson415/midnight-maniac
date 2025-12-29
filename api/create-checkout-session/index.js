const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function (context, req) {
    const { items } = req.body;

    if (!items) {
        context.res = {
            status: 400,
            body: "Please pass items in the request body"
        };
        return;
    }

    try {
        const line_items = items.map(item => {
            if (item.priceId) {
                return {
                    price: item.priceId,
                    quantity: item.quantity,
                };
            } else {
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: item.name,
                        },
                        unit_amount: Math.round(item.price * 100),
                    },
                    quantity: item.quantity,
                };
            }
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            success_url: `${req.headers.origin}/success`,
            cancel_url: `${req.headers.origin}/cancel`,
        });

        context.res = {
            body: { id: session.id, url: session.url }
        };
    } catch (error) {
        context.log.error("Stripe error: ", error);
        context.res = {
            status: 500,
            body: { error: error.message }
        };
    }
};