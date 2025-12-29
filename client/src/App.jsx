import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Store from './pages/Store';
import Cart from './pages/Cart';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import Placeholder from './pages/Placeholder';

function App() {
  return (
    <CartProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/music" element={<Placeholder title="Music" />} />
        <Route path="/images" element={<Placeholder title="Images" />} />
        <Route path="/video" element={<Placeholder title="Video" />} />
        <Route path="/contact" element={<Placeholder title="Contact" />} />
      </Routes>
    </CartProvider>
  );
}

export default App;
