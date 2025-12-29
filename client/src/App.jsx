import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Store from './pages/Store';
import Cart from './pages/Cart';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import Contact from './pages/Contact';
import Images from './pages/Images';
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
        <Route path="/images" element={<Images />} />
        <Route path="/video" element={<Placeholder title="Video" />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </CartProvider>
  );
}

export default App;
