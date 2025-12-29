const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function (context, req) {
    try {
        const [productsResponse, pricesResponse] = await Promise.all([
            stripe.products.list({ active: true, limit: 100 }),
            stripe.prices.list({ active: true, limit: 100 })
        ]);

        const pricesByProduct = {};
        pricesResponse.data.forEach(price => {
            if (!pricesByProduct[price.product]) {
                pricesByProduct[price.product] = [];
            }
            pricesByProduct[price.product].push({
                id: price.id,
                unit_amount: price.unit_amount,
                currency: price.currency,
                nickname: price.nickname,
                description: price.nickname || 'Standard', // Fallback if no nickname
                lookup_key: price.lookup_key
            });
        });

        const formattedProducts = productsResponse.data.map(product => {
            const productPrices = pricesByProduct[product.id] || [];
            
            // Sort prices by lookup_key if available, otherwise by amount
            productPrices.sort((a, b) => {
                if (a.lookup_key && b.lookup_key) {
                    return a.lookup_key.localeCompare(b.lookup_key, undefined, { numeric: true, sensitivity: 'base' });
                }
                // Items with lookup_key come first
                if (a.lookup_key) return -1;
                if (b.lookup_key) return 1;
                
                return a.unit_amount - b.unit_amount;
            });

            // Determine default price (lowest or first)
            const defaultPrice = productPrices[0] || null;

            return {
                id: product.id,
                name: product.name,
                description: product.description,
                image: product.images[0] || '',
                prices: productPrices,
                // Keep these for backward compatibility or simple display
                price: defaultPrice ? defaultPrice.unit_amount / 100 : 0,
                currency: defaultPrice ? defaultPrice.currency : 'usd',
                priceId: defaultPrice ? defaultPrice.id : null
            };
        });

        context.res = {
            body: formattedProducts
        };
    } catch (error) {
        context.log.error("Stripe error: ", error);
        context.res = {
            status: 500,
            body: { error: error.message }
        };
    }
};