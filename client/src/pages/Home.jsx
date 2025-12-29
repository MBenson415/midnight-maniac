export default function Home() {
  return (
    <div className="container">
      <div className="hero">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src="https://squarespacemusic.blob.core.windows.net/$web/midnightmaniac.png" alt="Midnight Maniac" />
        </div>
        <h1>MIDNIGHT MANIAC</h1>
        <p>Progressive Pop / Electronic / Hard Rock</p>
      </div>
      
      <section>
        <h2>WHO IS MIDNIGHT MANIAC?</h2>
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
    </div>
  );
}