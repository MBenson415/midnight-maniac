import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { cart } = useCart();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/music">Music</Link>
      <Link to="/images">Images</Link>
      <Link to="/video">Video</Link>
      <Link to="/store">Store</Link>
      <Link to="/contact">Contact</Link>
      <Link to="/cart">Cart ({itemCount})</Link>
    </nav>
  );
}