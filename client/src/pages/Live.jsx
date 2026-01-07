import { Link } from 'react-router-dom';

export default function Live() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1>Live</h1>
      <p style={{ fontSize: '1.2rem', color: '#aaa', marginTop: '2rem' }}>
        Some day... Send us a message on the <Link to="/contact" style={{ color: '#f9166f' }}>Contact page</Link> if you'd like to see us play live.
      </p>
    </div>
  );
}
