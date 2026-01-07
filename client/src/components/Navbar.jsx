import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navStyle = {
    background: 'linear-gradient(to right, #f9166f, black)',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  };

  const linksContainerStyle = {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  };

  const mobileMenuStyle = {
    display: 'none',
    flexDirection: 'column',
    gap: '1rem',
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'linear-gradient(to bottom, black, #1a1a1a)',
    padding: '1.5rem',
    zIndex: 1000,
  };

  const linkStyle = {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'text-shadow 0.3s ease',
  };

  const hamburgerStyle = {
    display: 'none',
    flexDirection: 'column',
    gap: '5px',
    cursor: 'pointer',
    padding: '5px',
  };

  const barStyle = {
    width: '25px',
    height: '3px',
    background: '#fff',
    borderRadius: '2px',
    transition: 'all 0.3s ease',
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.textShadow = '0 0 8px rgba(255, 255, 255, 0.6), 0 0 15px rgba(255, 255, 255, 0.3)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.textShadow = 'none';
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav style={navStyle}>
      {/* Hamburger Menu Button */}
      <div 
        className="hamburger"
        style={hamburgerStyle}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ ...barStyle, transform: isOpen ? 'rotate(45deg) translate(6px, 6px)' : 'none' }}></span>
        <span style={{ ...barStyle, opacity: isOpen ? 0 : 1 }}></span>
        <span style={{ ...barStyle, transform: isOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none' }}></span>
      </div>

      {/* Desktop Links */}
      <div className="nav-links" style={linksContainerStyle}>
        <Link to="/" style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>Home</Link>
        <Link to="/band" style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>The Band</Link>
        <Link to="/music" style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>Music</Link>
        <Link to="/video" style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>Video</Link>
        <Link to="/contact" style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>Contact</Link>
        <Link to="/store" style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>Store</Link>
        <Link to="/cart" style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>Cart ({itemCount})</Link>
      </div>

      {/* Logo on right */}
      <Link to="/" className="nav-logo">
        <img 
          src="https://squarespacemusic.blob.core.windows.net/$web/midnightmaniac_trans.png" 
          alt="Midnight Maniac"
          style={{ height: '40px', width: 'auto' }}
        />
      </Link>

      {/* Mobile Menu */}
      <div 
        className="mobile-menu" 
        style={{ 
          ...mobileMenuStyle, 
          display: isOpen ? 'flex' : 'none' 
        }}
      >
        <Link to="/" style={linkStyle} onClick={handleLinkClick}>Home</Link>
        <Link to="/band" style={linkStyle} onClick={handleLinkClick}>The Band</Link>
        <Link to="/music" style={linkStyle} onClick={handleLinkClick}>Music</Link>
        <Link to="/video" style={linkStyle} onClick={handleLinkClick}>Video</Link>
        <Link to="/contact" style={linkStyle} onClick={handleLinkClick}>Contact</Link>
        <Link to="/store" style={linkStyle} onClick={handleLinkClick}>Store</Link>
        <Link to="/cart" style={linkStyle} onClick={handleLinkClick}>Cart ({itemCount})</Link>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hamburger {
            display: flex !important;
          }
          .nav-links {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}