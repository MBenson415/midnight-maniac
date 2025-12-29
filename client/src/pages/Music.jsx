import React from 'react';

export default function Music() {
  return (
    <div className="container">
      <h1>Music</h1>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <iframe 
          data-testid="embed-iframe" 
          style={{ borderRadius: '12px' }} 
          src="https://open.spotify.com/embed/artist/4cybofvMhNCcdfGKkGrV5C?utm_source=generator" 
          width="100%" 
          height="352" 
          frameBorder="0" 
          allowFullScreen="" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
}
