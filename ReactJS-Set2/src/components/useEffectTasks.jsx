import React, { useState, useEffect } from 'react';

export default function UseEffectTasks({ activeSubTask }) {
  switch (activeSubTask) {
    case 0: return <ApiRefreshCounter />;
    case 1: return <OnlineOfflineDetector />;
    case 2: return <ScreenWidthTracker />;
    case 3: return <RandomQuoteGenerator />;
    case 4: return <BackgroundColorChanger />;
    default: return <div>Select a task</div>;
  }
}

// Task 1: API Refresh Counter
function ApiRefreshCounter() {
  const [apiCalls, setApiCalls] = useState(0);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    // Increment on mount and when trigger is fired
    setApiCalls(prev => prev + 1);
  }, [trigger]);

  return (
    <div className="card">
      <h3>Task 1: API Refresh Counter</h3>
      <p style={{ margin: '1.5rem 0', fontSize: '1.1rem' }}>
        <strong>API Calls Made:</strong> <span className="badge completed" style={{ fontSize: '1.2rem', padding: '0.5rem 1rem' }}>{apiCalls}</span>
      </p>
      <button className="btn-primary" onClick={() => setTrigger(prev => prev + 1)}>
        Simulate Refresh (Call API)
      </button>
    </div>
  );
}

// Task 2: Online/Offline Detector
function OnlineOfflineDetector() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h3>Task 2: Network Connection Detector</h3>
      <div style={{ margin: '2rem 0' }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          margin: '0 auto 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justify品质: 'center',
          background: isOnline ? 'var(--success-glow)' : 'var(--danger-glow)',
          border: `3px solid ${isOnline ? 'var(--success)' : 'var(--danger)'}`,
          boxShadow: `0 0 20px ${isOnline ? 'var(--success-glow)' : 'var(--danger-glow)'}`,
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '3rem'
        }}>
          {isOnline ? '📶' : '❌'}
        </div>
        <h4 style={{ fontSize: '1.4rem' }}>
          You are <span style={{ color: isOnline ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>{isOnline ? 'Online' : 'Offline'}</span>
        </h4>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Toggle your browser network in devtools to test.
        </p>
      </div>
    </div>
  );
}

// Task 3: Screen Width Tracker
function ScreenWidthTracker() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="card">
      <h3>Task 3: Window Width Monitor</h3>
      <p style={{ margin: '2rem 0', fontSize: '1.2rem', textAlign: 'center' }}>
        <strong>Current Viewport Width:</strong> <br />
        <span className="badge pass" style={{ fontSize: '1.8rem', padding: '0.6rem 1.5rem', marginTop: '1rem' }}>
          {width}px
        </span>
      </p>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
        Resize your browser window to observe changes.
      </p>
    </div>
  );
}

// Task 4: Random Quote Generator
const QUOTES_BANK = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Do not wait to strike till the iron is hot; but make it hot by striking.", author: "William Butler Yeats" },
  { text: "Great minds discuss ideas; average minds discuss events; small minds discuss people.", author: "Eleanor Roosevelt" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" }
];

function RandomQuoteGenerator() {
  const [quote, setQuote] = useState(QUOTES_BANK[0]);

  const selectRandomQuote = () => {
    const randomIdx = Math.floor(Math.random() * QUOTES_BANK.length);
    setQuote(QUOTES_BANK[randomIdx]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      selectRandomQuote();
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card" style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <h3>Task 4: Quote Ticker (Auto-refresh 5s)</h3>
        <figure style={{ marginTop: '2rem', paddingLeft: '1.5rem', borderLeft: '4px solid var(--secondary)' }}>
          <blockquote style={{ fontSize: '1.2rem', fontStyle: 'italic', marginBottom: '0.8rem', lineHeight: '1.5' }}>
            "{quote.text}"
          </blockquote>
          <figcaption style={{ color: 'var(--secondary)', fontWeight: '600' }}>
            — {quote.author}
          </figcaption>
        </figure>
      </div>
      <button className="btn-secondary" style={{ alignSelf: 'flex-start', marginTop: '1.5rem' }} onClick={selectRandomQuote}>
        🎲 Next Quote Now
      </button>
    </div>
  );
}

// Task 5: Background Color Changer
const COLOR_PALETTE = [
  '#1e1b4b', // Indigo dark
  '#062f4f', // Deep teal
  '#14532d', // Forest dark
  '#4c1d95', // Purple dark
  '#311b92', // Violet dark
  '#5c0632'  // Wine dark
];

function BackgroundColorChanger() {
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex(prev => (prev + 1) % COLOR_PALETTE.length);
    }, 3000); // every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const currentColor = COLOR_PALETTE[colorIndex];

  return (
    <div className="card" style={{
      backgroundColor: currentColor,
      transition: 'background-color 1s ease',
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: `0 10px 30px ${currentColor}`
    }}>
      <h3>Task 5: Background Color Rotator</h3>
      <p style={{ margin: '2rem 0', fontSize: '1.1rem', lineHeight: '1.6' }}>
        This card background changes automatically every <strong>3 seconds</strong> using a `useEffect` interval hook.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'white' }}></div>
        <span style={{ fontSize: '0.9rem', fontFamily: 'monospace', opacity: '0.8' }}>Active Color: {currentColor}</span>
      </div>
    </div>
  );
}
