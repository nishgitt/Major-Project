import React, { useState } from 'react';

export default function EventHandlingTasks({ activeSubTask }) {
  switch (activeSubTask) {
    case 0: return <Calculator />;
    case 1: return <ColorPicker />;
    case 2: return <CharacterCounter />;
    case 3: return <AgeChecker />;
    case 4: return <ImageSwitcher />;
    default: return <div>Select a task</div>;
  }
}

// Task 1: Calculator
function Calculator() {
  const [inputs, setInputs] = useState({ n1: '', n2: '' });
  const [result, setResult] = useState(null);

  const calculate = (operator) => {
    const val1 = parseFloat(inputs.n1);
    const val2 = parseFloat(inputs.n2);
    
    if (isNaN(val1) || isNaN(val2)) {
      alert("Please enter two numbers first.");
      return;
    }

    let res = 0;
    if (operator === '+') res = val1 + val2;
    if (operator === '-') res = val1 - val2;
    if (operator === '*') res = val1 * val2;
    if (operator === '/') {
      if (val2 === 0) {
        alert("Cannot divide by zero!");
        return;
      }
      res = val1 / val2;
    }
    setResult(res);
  };

  return (
    <div className="card">
      <h3>Task 1: Basic Operations Calculator</h3>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <input type="number" value={inputs.n1} onChange={e => setInputs({...inputs, n1: e.target.value})} placeholder="Num 1" required />
        <input type="number" value={inputs.n2} onChange={e => setInputs({...inputs, n2: e.target.value})} placeholder="Num 2" required />
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <button className="btn-secondary" style={{ flex: '1', fontSize: '1.2rem', fontWeight: 'bold' }} onClick={() => calculate('+')}>+</button>
        <button className="btn-secondary" style={{ flex: '1', fontSize: '1.2rem', fontWeight: 'bold' }} onClick={() => calculate('-')}>-</button>
        <button className="btn-secondary" style={{ flex: '1', fontSize: '1.2rem', fontWeight: 'bold' }} onClick={() => calculate('*')}>×</button>
        <button className="btn-secondary" style={{ flex: '1', fontSize: '1.2rem', fontWeight: 'bold' }} onClick={() => calculate('/')}>÷</button>
      </div>

      {result !== null && (
        <div className="result-box" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Calculation Result</p>
          <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--secondary)' }}>{result}</span>
        </div>
      )}
    </div>
  );
}

// Task 2: Color Picker
function ColorPicker() {
  const [bg, setBg] = useState('transparent');

  return (
    <div className="card" style={{ backgroundColor: bg, transition: 'background 0.3s ease' }}>
      <h3>Task 2: Interactive Color Canvas</h3>
      <p style={{ color: bg !== 'transparent' ? 'white' : 'var(--text-muted)', margin: '1.5rem 0' }}>
        Click any of the buttons below to change this container's background color in real-time.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button class="btn-primary" style={{ background: '#ef4444', border: 'none', flex: 1 }} onClick={() => setBg('#7f1d1d')}>Red</button>
        <button class="btn-primary" style={{ background: '#3b82f6', border: 'none', flex: 1 }} onClick={() => setBg('#1e3a8a')}>Blue</button>
        <button class="btn-primary" style={{ background: '#10b981', border: 'none', flex: 1 }} onClick={() => setBg('#064e3b')}>Green</button>
        <button class="btn-secondary" style={{ flex: 1 }} onClick={() => setBg('transparent')}>Reset</button>
      </div>
    </div>
  );
}

// Task 3: Character Counter
function CharacterCounter() {
  const [text, setText] = useState('');

  return (
    <div className="card">
      <h3>Task 3: Character Counter</h3>
      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label>Type anything here</label>
        <textarea rows="4" value={text} onChange={e => setText(e.target.value)} placeholder="Start typing..."></textarea>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>Character count</span>
        <span className="badge completed" style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}>
          Characters: {text.length}
        </span>
      </div>
    </div>
  );
}

// Task 4: Age Checker
function AgeChecker() {
  const [age, setAge] = useState('');
  const [status, setStatus] = useState(null);

  const checkEligibility = (e) => {
    e.preventDefault();
    const val = parseInt(age);
    if (isNaN(val)) return;

    if (val >= 18) {
      setStatus({ text: "Eligible to Vote", valid: true });
    } else {
      setStatus({ text: "Not Eligible (Must be 18 or older)", valid: false });
    }
  };

  return (
    <div className="card">
      <h3>Task 4: Voting Age Checker</h3>
      <form onSubmit={checkEligibility}>
        <div className="form-group">
          <label>Enter Age</label>
          <input type="number" min="0" max="150" value={age} onChange={e => setAge(e.target.value)} required placeholder="e.g. 21" />
        </div>
        <button type="submit" className="btn-primary">Verify Eligibility</button>
      </form>

      {status && (
        <div className={`result-box`} style={{
          marginTop: '1.5rem',
          background: status.valid ? 'var(--success-glow)' : 'var(--danger-glow)',
          borderColor: status.valid ? 'var(--success)' : 'var(--danger)',
          textAlign: 'center'
        }}>
          <h4 style={{ color: status.valid ? 'var(--success)' : 'var(--danger)' }}>{status.text}</h4>
        </div>
      )}
    </div>
  );
}

// Task 5: Image Switcher
const CAROUSEL_IMAGES = [
  { gradient: 'linear-gradient(135deg, #6366f1, #a855f7)', title: 'Cosmic Violet Aurora' },
  { gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)', title: 'Deep Cyber Blue' },
  { gradient: 'linear-gradient(135deg, #10b981, #059669)', title: 'Emerald Oasis Green' },
  { gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', title: 'Neon Sunset Flare' }
];

function ImageSwitcher() {
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    setIndex(prev => (prev + 1) % CAROUSEL_IMAGES.length);
  };

  const handlePrev = () => {
    setIndex(prev => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
  };

  const currentImage = CAROUSEL_IMAGES[index];

  return (
    <div className="card">
      <h3>Task 5: CSS Image Carousel Switcher</h3>
      
      {/* Mock Image Display Card */}
      <div style={{
        height: '200px',
        width: '100%',
        background: currentImage.gradient,
        borderRadius: '12px',
        margin: '1.5rem 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.4rem',
        fontWeight: 'bold',
        textShadow: '0 2px 10px rgba(0,0,0,0.3)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <span>{currentImage.title}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 'normal', opacity: 0.8 }}>Graphic {index + 1} of {CAROUSEL_IMAGES.length}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={handlePrev}>Previous</button>
        <button className="btn-primary" style={{ flex: 1 }} onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}
