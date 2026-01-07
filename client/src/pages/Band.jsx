import React from 'react';
import usePageTitle from '../hooks/usePageTitle';

const members = [
  {
    name: 'Jake Allard',
    instruments: 'Vocals, Bass, Synthesizers',
    description: 'Songwriter and harmonically rich vocalist, Jake brings a dynamic range and emotional depth to Midnight Maniac\'s sound.',
    image: 'https://squarespacemusic.blob.core.windows.net/$web/jake_mm.jpg', // Add image path when available
  },
  {
    name: 'Marshall Benson',
    instruments: 'Guitar, Synthesizers, Backup Vocals, Production',
    description: 'Multi-instrumentalist and producer, Marshall shapes the sound and direction of Midnight Maniac with his versatile sound vision.',
    image: 'https://squarespacemusic.blob.core.windows.net/$web/mbpic.png', // Add image path when available
  },
];

const featuredArtists = [
  { 
    name: 'Derek Sherinian', 
    contribution: "Keyboards on 'Heresy'",
    description: 'World renowned keyboardist of Dream Theater, Derek laid down a fiery solo on \'Heresy\'.',
    image: 'https://squarespacemusic.blob.core.windows.net/$web/derek%20sherinian.jpg',
  },
  { 
    name: 'Dicki Fliszar', 
    contribution: "Drums on 'Heresy'",
    description: 'Dicki, of Jack Russell\'s Great White, brings powerful and precise drumming to \'Heresy\'.',
    image: 'https://squarespacemusic.blob.core.windows.net/$web/dicki.jpg',
  },
  { 
    name: 'Kriz DK', 
    contribution: "Drums on 'Sunlit Streets'",
    description: 'Kriz (Genitorturers, Enuff Z Nuff) lays down massives grooves on an upcoming track \'Sunlit Streets\'.',
    image: 'https://squarespacemusic.blob.core.windows.net/$web/krizdk.jpg',
  },
];

const productionTeam = [
  {
    name: 'Kevin 131 Gutierrez',
    role: 'Mix Engineer',
    description: 'Based in Dripping Springs, TX, Kevin 131 provides pristine mixing on Midnight Maniac tracks.',
    image: 'https://squarespacemusic.blob.core.windows.net/$web/131kevin.jpg',
  },
  {
    name: 'Gene Freeman (The Machine)',
    role: 'Mastering Engineer',
    description: 'Gene Freeman (Lamb of God, Rob Zombie) provides the final touch.',
    image: 'https://squarespacemusic.blob.core.windows.net/$web/gene%20freeman.jpg',
  },
];

function MemberCard({ member }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.5rem',
        background: '#1a1a1a',
        borderRadius: '12px',
        maxWidth: '400px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '250px',
          aspectRatio: '1/1',
          borderRadius: '12px',
          background: member.image ? `url(${member.image}) center/cover` : '#333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: '0.9rem',
        }}
      >
        {!member.image && 'Photo coming soon'}
      </div>
      <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#fff', fontSize: 'clamp(1.2rem, 4vw, 1.5rem)' }}>
        {member.name}
      </h2>
      <p style={{ color: '#f9166f', fontWeight: '500', marginBottom: '1rem', textAlign: 'center', fontSize: 'clamp(0.85rem, 3vw, 1rem)' }}>
        {member.instruments}
      </p>
      <p style={{ color: '#aaa', textAlign: 'center', lineHeight: '1.6', fontSize: 'clamp(0.85rem, 3vw, 1rem)' }}>
        {member.description}
      </p>
    </div>
  );
}

export default function Band() {
  usePageTitle('The Band');

  return (
    <div className="container">
      <h1>The Band</h1>

      {/* Members Section */}
      <p style={{ color: '#888', marginTop: '0.5rem', marginBottom: '2rem' }}>
          Midnight Maniac consists of two core members: Jake Allard (songwriting) and Marshall Benson (production).
        </p>
      <section style={{ marginTop: '2rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '2rem',
          }}
        >
          {members.map((member, index) => (
            <MemberCard key={index} member={member} />
          ))}
        </div>
      </section>

      {/* Featured Artists Section */}
      <section style={{ marginTop: '4rem' }}>
        <h2>Featured Artists</h2>
        <p style={{ color: '#888', marginTop: '0.5rem', marginBottom: '2rem' }}>
          Several well-known (sometimes world-wide) artists have contributed to Midnight Maniac's studio releases
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '2rem',
          }}
        >
          {featuredArtists.map((artist, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '2rem',
                background: '#1a1a1a',
                borderRadius: '12px',
                maxWidth: '300px',
                width: '100%',
              }}
            >
              <div
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  background: artist.image ? `url(${artist.image}) center/cover` : '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                }}
              >
                {!artist.image && 'Photo coming soon'}
              </div>
              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>
                {artist.name}
              </h3>
              <p style={{ color: '#f9166f', fontWeight: '500', marginBottom: '1rem', textAlign: 'center' }}>
                {artist.contribution}
              </p>
              <p style={{ color: '#aaa', textAlign: 'center', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {artist.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Production Section */}
      <section style={{ marginTop: '4rem' }}>
        <h2>Production</h2>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '2rem',
            marginTop: '2rem',
          }}
        >
          {productionTeam.map((person, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '2rem',
                background: '#1a1a1a',
                borderRadius: '12px',
                maxWidth: '300px',
                width: '100%',
              }}
            >
              <div
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  background: person.image ? `url(${person.image}) center/cover` : '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                }}
              >
                {!person.image && 'Photo coming soon'}
              </div>
              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>
                {person.name || 'Name coming soon'}
              </h3>
              <p style={{ color: '#f9166f', fontWeight: '500', marginBottom: '1rem', textAlign: 'center' }}>
                {person.role || 'Role coming soon'}
              </p>
              <p style={{ color: '#aaa', textAlign: 'center', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {person.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
