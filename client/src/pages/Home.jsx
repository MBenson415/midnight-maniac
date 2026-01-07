export default function Home() {
  return (
    <div className="container">
      <div className="hero">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img 
            src="https://squarespacemusic.blob.core.windows.net/$web/midnightmaniac_trans.png" 
            alt="Midnight Maniac"
            style={{ transition: 'filter 0.3s ease' }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = 'drop-shadow(0 0 1px #f9166f) drop-shadow(0 0 40px #f9166f)')}
            onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
          />
        </div>
      </div>

      
      <section>
        <h1>WHO IS MIDNIGHT MANIAC?</h1>
        <h2>Progressive Pop / Electronic / Hard Rock</h2>
        <p>
          Midnight Maniac is a progressive pop act that combines electronic and upbeat
          hard rock elements to create a fresh and darkly compelling sound. Established in
          2023 in Austin, TX by Jake Allard and Marshall Benson, the multi-instrumentalist
          duo shares songwriting duties; with Allard taking on lead vocals and Benson
          helming lead guitar and studio production.
        </p>
        <p>
          Unsatisfied with traditional rock ‘n roll, Midnight Maniac emerges as a beacon
          of change with an energetic and adventurous departure from the predictable, often
          indulging in unexpected key signature and time changes while delivering
          memorable hooks.
        </p>
      </section>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <img src="https://squarespacemusic.blob.core.windows.net/$web/mm-full.jpg" alt="Midnight Maniac Band" style={{ maxWidth: '100%', borderRadius: '12px' }} />
      </div>
    </div>
  );
}