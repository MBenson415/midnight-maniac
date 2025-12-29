import React from 'react';

export default function Contact() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Contact Us</h1>
      <div style={{ fontSize: '1.2rem', lineHeight: '2' }}>
        <p>
          Email us at <a href="mailto:MidnightManiacBand@gmail.com">MidnightManiacBand@gmail.com</a>
        </p>
        <p>
          Or message us on Facebook! <a href="https://www.facebook.com/midnightmaniacband" target="_blank" rel="noopener noreferrer">https://www.facebook.com/midnightmaniacband</a>
        </p>
      </div>
    </div>
  );
}
