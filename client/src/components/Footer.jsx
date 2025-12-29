export default function Footer() {
  return (
    <footer style={{ marginTop: 'auto', padding: '2rem', borderTop: '1px solid #333', textAlign: 'center', color: '#888' }}>
      <p>&copy; Midnight Maniac {new Date().getFullYear()}</p>
    </footer>
  );
}
