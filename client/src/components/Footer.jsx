import { useState } from 'react';
import { FaInstagram, FaSpotify, FaYoutube, FaTiktok, FaFacebook } from 'react-icons/fa';

export default function Footer() {
  const socials = [
    { icon: FaInstagram, url: 'https://www.instagram.com/midnightmaniacband', label: 'Instagram' },
    { icon: FaSpotify, url: 'https://open.spotify.com/artist/4cybofvMhNCcdfGKkGrV5C?si=HmnVcK2eQpe0e1HpGPpP9Q', label: 'Spotify' },
    { icon: FaYoutube, url: 'https://www.youtube.com/@MidnightManiacBand', label: 'YouTube' },
    { icon: FaTiktok, url: 'https://www.tiktok.com/@midnightmaniacband', label: 'TikTok' },
    { icon: FaFacebook, url: 'https://www.facebook.com/midnightmaniacband/', label: 'Facebook' },
  ];

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  async function handleSubscribe(e) {
    e.preventDefault();
    if (status.state === 'loading') return;
    setStatus({ state: 'loading', message: '' });
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer_signup' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus({ state: 'success', message: "Thanks! You're on the list." });
      setEmail('');
    } catch (err) {
      setStatus({ state: 'error', message: err.message });
    }
  }

  return (
    <footer style={{ marginTop: 'auto', padding: '1.5rem 1rem', borderTop: '1px solid #333', textAlign: 'center', color: '#888' }}>
      <form
        onSubmit={handleSubscribe}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}
      >
        <label htmlFor="footer-subscribe-email" style={{ fontSize: 'clamp(0.85rem, 3vw, 1rem)', color: '#ccc', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Join the mailing list
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '420px' }}>
          <input
            id="footer-subscribe-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            style={{
              flex: '1 1 220px',
              padding: '0.6rem 0.75rem',
              background: '#111',
              border: '1px solid #333',
              color: '#fff',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
          <button
            type="submit"
            disabled={status.state === 'loading'}
            style={{
              padding: '0.6rem 1.1rem',
              background: '#f9166f',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: status.state === 'loading' ? 'wait' : 'pointer',
              opacity: status.state === 'loading' ? 0.7 : 1,
            }}
          >
            {status.state === 'loading' ? '...' : 'Subscribe'}
          </button>
        </div>
        {status.message && (
          <p
            role="status"
            style={{
              margin: 0,
              fontSize: '0.85rem',
              color: status.state === 'error' ? '#f9166f' : '#7CFC7C',
            }}
          >
            {status.message}
          </p>
        )}
        <p style={{ margin: 0, fontSize: '0.7rem', color: '#666', maxWidth: '420px' }}>
          By subscribing you agree to receive email updates from Midnight Maniac. Unsubscribe any time.
        </p>
      </form>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(1rem, 4vw, 1.5rem)', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {socials.map(({ icon: Icon, url, label }) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            style={{ color: '#888', transition: 'color 0.2s', padding: '0.5rem' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
          >
            <Icon size={24} />
          </a>
        ))}
      </div>
      <p style={{ fontSize: 'clamp(0.85rem, 3vw, 1rem)' }}>&copy; Midnight Maniac {new Date().getFullYear()}</p>
    </footer>
  );
}
