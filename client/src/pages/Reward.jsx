import React, { useState } from 'react';
import usePageTitle from '../hooks/usePageTitle';

const FB_PAGE_URL = 'https://www.facebook.com/midnightmaniacband/';

export default function Reward() {
  usePageTitle('Free Download');

  const [email, setEmail] = useState('');
  const [attested, setAttested] = useState(false);
  const [subscribe, setSubscribe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setStatus(null);

    const trimmedEmail = email.trim();
    const subscribePromise = subscribe
      ? fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail, source: 'reward_signup' }),
        }).catch(() => null)
      : Promise.resolve(null);

    try {
      const [claimRes] = await Promise.all([
        fetch('/api/invite-claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail, attested }),
        }),
        subscribePromise,
      ]);
      const data = await claimRes.json().catch(() => ({}));
      if (!claimRes.ok) {
        setStatus({ ok: false, message: data.error || 'Something went wrong. Please try again.' });
      } else {
        const message = subscribe
          ? `${data.message || 'Check your email for your download link.'} You'll also get a separate email to confirm your mailing-list subscription.`
          : data.message || 'Check your email for your download link.';
        setStatus({ ok: true, message });
        setEmail('');
        setAttested(false);
        setSubscribe(false);
      }
    } catch (err) {
      setStatus({ ok: false, message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
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
    fontSize: '16px',
    boxSizing: 'border-box',
  };

  const buttonStyle = {
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    border: 'none',
    background: submitting ? '#7a0c3a' : '#f9166f',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: submitting ? 'default' : 'pointer',
    transition: 'background 0.2s',
    width: '100%',
    maxWidth: '260px',
  };

  return (
    <div className="container" style={{ padding: '1rem' }}>
      <h1 style={{ textAlign: 'center' }}>Free Song Download</h1>
      <p style={{ textAlign: 'center', color: '#bbb', maxWidth: '560px', margin: '1rem auto' }}>
        Help us grow the Midnight Maniac community and we'll send you a free download of
        <strong> "Sunlit Streets"</strong> as a thank-you.
      </p>

      <ol style={{ maxWidth: '560px', margin: '2rem auto', color: '#ddd', lineHeight: 1.8, paddingLeft: '1.2rem' }}>
        <li>
          Open the{' '}
          <a href={FB_PAGE_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#f9166f' }}>
            Midnight Maniac Facebook page
          </a>.
        </li>
        <li>Tap the three-dot menu and choose <strong>Invite friends</strong>.</li>
        <li>Invite people you think would enjoy the music.</li>
        <li>Come back here and enter your email — we'll send you a one-time download link.</li>
      </ol>

      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'left', padding: '0 1rem' }}
      >
        <label htmlFor="reward-email" style={{ display: 'block', marginBottom: '0.5rem', color: '#ddd' }}>
          Email
        </label>
        <input
          id="reward-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            margin: '0.5rem 0 1.5rem',
            color: '#ddd',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={attested}
            onChange={(e) => setAttested(e.target.checked)}
            required
            style={{ marginTop: '0.25rem' }}
          />
          <span>I invited friends to the Midnight Maniac Facebook page.</span>
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            margin: '0 0 1.5rem',
            color: '#ddd',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={subscribe}
            onChange={(e) => setSubscribe(e.target.checked)}
            style={{ marginTop: '0.25rem' }}
          />
          <span>Also add me to the Midnight Maniac mailing list for news about shows and new music.</span>
        </label>

        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            disabled={submitting || !attested}
            style={{ ...buttonStyle, opacity: !attested ? 0.6 : 1 }}
          >
            {submitting ? 'Sending...' : 'Send me the download link'}
          </button>
        </div>

        {status && (
          <p
            style={{
              marginTop: '1.25rem',
              textAlign: 'center',
              color: status.ok ? '#4ade80' : '#f87171',
            }}
          >
            {status.message}
          </p>
        )}

        <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#888', textAlign: 'center' }}>
          One claim per email. The download link arrives by email and works once.
        </p>
      </form>
    </div>
  );
}
