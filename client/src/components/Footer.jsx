import { FaInstagram, FaSpotify, FaYoutube, FaTiktok, FaFacebook } from 'react-icons/fa';

export default function Footer() {
  const socials = [
    { icon: FaInstagram, url: 'https://www.instagram.com/midnightmaniacband', label: 'Instagram' },
    { icon: FaSpotify, url: 'https://open.spotify.com/artist/4cybofvMhNCcdfGKkGrV5C?si=HmnVcK2eQpe0e1HpGPpP9Q', label: 'Spotify' },
    { icon: FaYoutube, url: 'https://www.youtube.com/@MidnightManiacBand', label: 'YouTube' },
    { icon: FaTiktok, url: 'https://www.tiktok.com/@midnightmaniacband', label: 'TikTok' },
    { icon: FaFacebook, url: 'https://www.facebook.com/midnightmaniacband/', label: 'Facebook' },
  ];

  return (
    <footer style={{ marginTop: 'auto', padding: '1.5rem 1rem', borderTop: '1px solid #333', textAlign: 'center', color: '#888' }}>
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
