import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import usePageTitle from '../hooks/usePageTitle';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  // Default to the first price if available
  const [selectedPriceId, setSelectedPriceId] = useState(
    product.prices && product.prices.length > 0 ? product.prices[0].id : null
  );
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    if (!selectedPriceId) return;
    
    const selectedPrice = product.prices.find(p => p.id === selectedPriceId);
    if (!selectedPrice) return;

    addToCart({
      ...product,
      price: selectedPrice.unit_amount / 100,
      priceId: selectedPrice.id,
      variantName: selectedPrice.nickname || selectedPrice.description
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const currentPrice = product.prices.find(p => p.id === selectedPriceId);

  return (
    <div className="product-card">
      <img src={product.image || 'https://via.placeholder.com/300x300?text=No+Image'} alt={product.name} />
      <h3>{product.name}</h3>
      
      {product.prices && product.prices.length > 1 ? (
        <div style={{marginBottom: '1rem'}}>
          <select 
            value={selectedPriceId} 
            onChange={(e) => setSelectedPriceId(e.target.value)}
            style={{padding: '0.5rem', borderRadius: '4px', backgroundColor: '#333', color: 'white', border: '1px solid #555'}}
          >
            {product.prices.map(price => (
              <option key={price.id} value={price.id}>
                {price.description} - ${(price.unit_amount / 100).toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p>${currentPrice ? (currentPrice.unit_amount / 100).toFixed(2) : 'N/A'}</p>
      )}
      
      <button onClick={handleAddToCart} disabled={!currentPrice}>
        {isAdded ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            Added to cart!
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              borderRadius: '50%', 
              fontSize: '14px',
              fontWeight: 'bold'
            }}>✓</span>
          </span>
        ) : (
          "Add to Cart"
        )}
      </button>
    </div>
  );
}

export default function Store() {
  usePageTitle('Store');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/get-products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError('Could not load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) return <div className="container"><p>Loading products...</p></div>;
  if (error) return <div className="container"><p>{error}</p></div>;

  return (
    <div className="container">
      <h1>Store</h1>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}