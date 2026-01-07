import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', subject: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      await emailjs.send(
        'service_04st149',    // Get from EmailJS dashboard
        'template_3x6j6u7',   // Get from EmailJS dashboard
        {
          from_name: formData.name,
          subject: formData.subject,
          message: formData.message,
          to_email: 'MidnightManiacBand@gmail.com',
        },
        '99fEtoSIVwzTE1CEy'     // Get from EmailJS dashboard
      );

      setStatus('Message sent successfully!');
      setFormData({ name: '', subject: '', message: '' });
    } catch (error) {
      setStatus('Failed to send message. Please try again.');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: '8px',
    border: '1px solid #444',
    background: '#1a1a1a',
    color: '#fff',
    fontSize: '16px', // Prevents zoom on iOS
    boxSizing: 'border-box',
  };

  const buttonStyle = {
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    border: 'none',
    background: '#f9166f',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
    width: '100%',
    maxWidth: '200px',
  };

  return (
    <div className="container" style={{ textAlign: 'center', padding: '1rem' }}>
      <h1>Contact Us</h1>


      <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'left', padding: '0 1rem' }}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={6}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
        <div style={{ textAlign: 'center' }}>
          <button 
            type="submit" 
            style={buttonStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#d11359')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#f9166f')}
          >
            Send Message
          </button>
        </div>
        {status && <p style={{ marginTop: '1rem', textAlign: 'center', color: status.includes('success') ? '#4ade80' : '#f87171' }}>{status}</p>}
      </form>


      <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
        <img 
          src="https://squarespacemusic.blob.core.windows.net/$web/mm%20studio.jpg" 
          alt="Midnight Maniac Studio" 
          style={{ maxWidth: '50%', borderRadius: '12px' }} 
        />
      </div>
    </div>
  );
}
