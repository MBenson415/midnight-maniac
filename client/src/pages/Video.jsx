import React, { useState } from 'react';
import usePageTitle from '../hooks/usePageTitle';

const videos = [
  { id: 'vBHvpq8jJrk', si: '-00-U6r5OrQjZona', title: 'Video 1' },
  { id: 'zp-Q_c3p6Cc', si: 'KgUZ4FvURamYM5zy', title: 'Video 2' },
  { id: 'bWR73eA90Nk', si: 'CX99Xdg3dLS9Egyn', title: 'Video 3' },
  { id: 'jUZCTqpViCQ', si: 'OtlTIC8OIx1uS40o', title: 'Video 4' },
];

export default function Video() {
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);
  usePageTitle('Video');

  return (
    <div className="container">
      <h1>Videos</h1>
      
      {/* Main Video Player */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        marginTop: '2rem' 
      }}>
        <div style={{ width: '100%', maxWidth: '900px', aspectRatio: '16/9' }}>
          <iframe 
            width="100%" 
            height="100%" 
            src={`https://www.youtube.com/embed/${selectedVideo.id}${selectedVideo.si ? `?si=${selectedVideo.si}` : ''}`}
            title="YouTube video player"
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            style={{ borderRadius: '12px' }}
          ></iframe>
        </div>
      </div>

      {/* Thumbnail Carousel */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        gap: '0.5rem',
        marginTop: '1.5rem',
        flexWrap: 'wrap',
        padding: '0 1rem',
      }}>
        {videos.map((video) => (
          <div 
            key={video.id}
            onClick={() => setSelectedVideo(video)}
            style={{ 
              cursor: 'pointer',
              border: selectedVideo.id === video.id ? '3px solid #f9166f' : '3px solid transparent',
              borderRadius: '8px',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
              opacity: selectedVideo.id === video.id ? 1 : 0.6,
              flex: '0 0 auto',
            }}
            onMouseEnter={(e) => {
              if (selectedVideo.id !== video.id) e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              if (selectedVideo.id !== video.id) e.currentTarget.style.opacity = '0.6';
            }}
          >
            <img 
              src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
              alt={video.title}
              style={{ 
                width: 'clamp(100px, 20vw, 160px)', 
                height: 'auto',
                aspectRatio: '16/9',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
