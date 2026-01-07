import React, { useState } from 'react';

const tracks = [
  { title: 'I Heard It In A Nightmare', lyrics: `Can't turn my head, I'm falling
I hear the silence calling like a nightmare

I lie awake, I never think of you
But in the void I hear your call
Yeah, yeah
And every note it plays the perfect tune

Can't turn my head, I'm falling
I hear the silence calling like a nightmare

It made more sense to me when I was sleeping
Heard it in a nightmare
I fell awake and found it lost its meaning

Another day, another chance to live
But you can't take what I can't give
It's life that's calling
And every night I want to be with you, and I do

Can't turn my head, I'm falling
I hear the silence calling like a nightmare

It made more sense to me when I was sleeping
Heard it in a nightmare
A never-ending nightmare
You know I heard it in my

--Solo--
` },
  { title: 'Flying High', lyrics: `We'll be Flying High
All night

Another situation, can't deny the truth
Still have the vision
I dreamt it in my youth
No time for antics
I only want to have it all
Can you see me reach the sky
Or rather watch me fall

I hate to say these words
Because it fills my heart with dread
And as the days go by
Regret will fill my head

Alright
Hold tight
Pull up the reigns
We'll be Flying High
All night

Standing on the edge of fear
Where I'll fly or fall
No time to hesitate
Hit the gas or stall
I'll be
King of a Music Empire
Or еsquire to the Lord of Pain
But if I had it my way
My loaded dicе would end the game

Still hate to say these words
Because it fills my heart with dread
And as the days go by
Regret will fill my head

Alright
Hold tight
Pull up the reigns
We'll be Flying High
All night
In the hot lights
And crank up the gain
Still I'm Flying High with you

Alright
Hold tight
Pull up the reigns
We'll be Flying High
Alright
Hold tight
Pull up the reigns
We'll be Flying High
All night
In the hot lights
And crank up the gain
Still I'm Flying High with you
Alright
Pull up the reigns
We'll be Flying High
Alright
In the hot lights
Crank up the gain
Still I'm Flying High with you` },
  { title: "Azrael's Vines", lyrics: `
    The night's getting longer
    The air's getting cold
    The terror grows stronger
    But this fear's getting old

    No chance that it's done for
    I see them coming for you
    It's just a sign that the ending is near
    But the truth is it's already here

    Stare into the reflection
    Keep the starlight by your side
    Tear through total darkness
    So your other self can't hide

    Thoughts ablaze with fury
    Hearts consumed by yearning fire
    Lost within the shadows
    And the depths of your desire

    Curiosity kills if you let this
    Closed eyes and you'll live to regret this
    Ain't fate just a cruel, evil temptress?
    Azrael's calling...

    Look to the skies
    Infernal ashes fallin'
    Nowhere to hide
    Azrael is calling your 

    Name your price for pleasure
    Do the crime in the light of day
    As long as no one's looking
    Impulsivity prevails

    Final judgment's looming
    Do the time if you are damned
    Cosmic gears are turning
    Double standards is your plan

    Curiosity kills if you let this
    Closed eyes and you'll live to regret this

    Look to the skies
    Infernal ashes fallin'
    Watch evil stride
    Let them masquerade as Gods
    Nowhere to hide
    Your destiny's tormented
    Who will you blame?
    Azrael is calling your name
    
    --Solo--
    
    Look to the skies
    Infernal ashes fallin'
    Watch evil stride
    Let them masquerade as Gods
    Nowhere to hide
    Your destiny's tormented
    Who will you blame?
    Azrael is calling your name

    Look to the skies
    Watch evil stride
    As you masquerade as God
    ` },
  { title: 'Heresy (feat. Derek Sherinian)', lyrics: `
    I know you, I know you

    Hold on, hold on
    I can't face the night when you're gone
    Too bad, so sad
    I can't change the life we're meant to have
    'Cause it's Heresy

    So here we stand
    On the edge of goodbye
    The cut runs deep
    Still hear the voice in my sleep
    The memories haunt me
    Another night 'til I see you again
    And again, and again...
    Now get out of my head, out of my head

    Hod on, hold on
    I can't face the night when you're gone
    Too bad, so sad
    I can't change the life we're meant to have
    'Cause it's Heresy

    Yeah yeah, oh oh
    This burning I have
    Has got me feeling alright
    It cuts so deep
    Still voice in my sleep (Heard it in a nightmare)

    The memories haunt me
    Another night 'til I see you again
    And again, and again...
    Now get out of my head, out of my head

    Hold on, hold on
    I can't face the night when you're gone
    Too bad, so sad
    I can't change the life we're meant to have
    'Cause it's Heresy

    So now that you're gone
    And face the oncoming dawn
    A things are burning within
    Inside a world of sign

    --Solo--

    Hold on, hold on
    I can't face the night when you're gone
    Too bad, so sad
    I can't change the life we're meant to have
    'Cause it's Heresy

    Hold on, hold on
    I can't face the night when you're gone
    Too bad, so sad
    I can't change the life we're meant to have anymore

    Hold on, hold on
    Yeah, yeah
    Nothing can last forever
    Too bad, so sad
    Oh no, I said nothing can last forever

    Hold on, hold
    I can't face the night when you're gone
    Too bad, so sad
    I can't change the life we're meant to have
    'Cause it's Heresy

    Hold on
    I can't face the night when you're gone
    Too bad, so sad
    I can't change the life that we're meant to have
    I can't change 'cause it's Heresy
    ` },
  { title: 'Sunlit Streets (Coming Soon!)', lyrics: ``, comingSoon: true },
];

function LyricsAccordion({ track }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ borderBottom: '1px solid #333' }}>
      <button
        onClick={() => !track.comingSoon && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '1rem',
          background: 'transparent',
          border: 'none',
          color: track.comingSoon ? '#666' : '#fff',
          fontSize: '1.1rem',
          fontWeight: '500',
          textAlign: 'left',
          cursor: track.comingSoon ? 'default' : 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{track.title}</span>
        {!track.comingSoon && <span>{isOpen ? '−' : '+'}</span>}
      </button>
      {isOpen && !track.comingSoon && (
        <div
          style={{
            padding: '1rem',
            paddingTop: '0',
            color: '#ccc',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.8',
          }}
        >
          {track.lyrics || 'Lyrics coming soon...'}
        </div>
      )}
    </div>
  );
}

export default function Music() {
  return (
    <div className="container">
      <h1>Music</h1>
      
      {/* Spotify Embed */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', padding: '0 1rem' }}>
        <iframe 
          data-testid="embed-iframe" 
          style={{ borderRadius: '12px', maxWidth: '100%' }} 
          src="https://open.spotify.com/embed/artist/4cybofvMhNCcdfGKkGrV5C?utm_source=generator" 
          width="100%" 
          height="420" 
          frameBorder="0" 
          allowFullScreen="" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
        ></iframe>
      </div>

      <section style={{ marginTop: '3rem' }}>
        <h2>Lyrics</h2>
        <div style={{ marginTop: '1rem', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
          {tracks.map((track, index) => (
            <LyricsAccordion key={index} track={track} />
          ))}
        </div>
      </section>
    </div>
  );
}
