import React from 'react';

export default function Video() {
  return (
    <div className="container">
      <h1>Videos</h1>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/videoseries?si=MNrYmS836GAcfDf2&amp;list=PLLK0y8gjDW3qmaleO6yi6rwr6nG-BonFp" 
          title="YouTube video player" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerPolicy="strict-origin-when-cross-origin" 
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
