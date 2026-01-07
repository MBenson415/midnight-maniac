import { useCart } from '../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import usePageTitle from '../hooks/usePageTitle';

// Replace with your actual publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function Cart() {
  usePageTitle('Cart');
  const { cart, removeFromCart, updateQuantity } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('Backend error:', data.error);
        alert('Payment failed to initiate: ' + data.error);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL received');
        alert('Payment failed to initiate. Please try again.');
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('An error occurred. Please check your connection.');
    }
  };

  return (
    <div className="container">
      <h1>Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cart-container">
          <ul className="cart-list">
            {cart.map((item) => (
              <li key={`${item.id}-${item.priceId}`} className="cart-item">
                <img src={item.image || 'https://via.placeholder.com/300x300?text=No+Image'} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3>{item.name} {item.variantName && <span style={{fontSize: '0.8em', color: '#aaa'}}>({item.variantName})</span>}</h3>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem'}}>
                    <p style={{margin: 0}}>${item.price.toFixed(2)}</p>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <label htmlFor={`qty-${item.id}-${item.priceId}`} style={{fontSize: '0.9em'}}>Qty:</label>
                        <input 
                            id={`qty-${item.id}-${item.priceId}`}
                            type="number" 
                            min="1" 
                            value={item.quantity} 
                            onChange={(e) => updateQuantity(item.id, item.priceId, e.target.value)}
                            style={{width: '50px', padding: '0.3rem', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#222', color: 'white'}}
                        />
                    </div>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id, item.priceId)}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="cart-summary">
            <h2>Total: ${total.toFixed(2)}</h2>
            <button onClick={handleCheckout} className="checkout-button">
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}