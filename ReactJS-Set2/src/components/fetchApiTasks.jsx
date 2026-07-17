import React, { useState, useEffect } from 'react';

export default function FetchApiTasks({ activeSubTask }) {
  switch (activeSubTask) {
    case 0: return <FetchComments />;
    case 1: return <FetchAlbums />;
    case 2: return <FetchPhotos />;
    case 3: return <FetchRandomUser />;
    case 4: return <FetchCountries />;
    default: return <div>Select a task</div>;
  }
}

// Loading Spinner Component
function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0' }}>
      <div style={{
        width: '35px',
        height: '35px',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: 'var(--secondary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// Error Card
function ErrorMsg({ msg }) {
  return (
    <div className="result-box" style={{ background: 'var(--danger-glow)', borderColor: 'var(--danger)', color: 'var(--danger)', margin: '1rem 0' }}>
      Error loading API: {msg}
    </div>
  );
}

// Task 1: Fetch Comments
function FetchComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('https://jsonplaceholder.typicode.com/comments')
      .then(res => {
        if (!res.ok) throw new Error("Network issues");
        return res.json();
      })
      .then(data => {
        setComments(data.slice(0, 5)); // Limit to first 5
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="card">
      <h3>Task 1: Fetch Comments API</h3>
      {loading && <Spinner />}
      {error && <ErrorMsg msg={error} />}
      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          {comments.map(c => (
            <div key={c.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <h5 style={{ margin: 0, color: 'var(--secondary)' }}>👤 {c.name}</h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0.5rem' }}>{c.email}</p>
              <p style={{ fontSize: '0.95rem', fontStyle: 'italic', lineHeight: '1.4' }}>"{c.body}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Task 2: Fetch Albums
function FetchAlbums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('https://jsonplaceholder.typicode.com/albums')
      .then(res => {
        if (!res.ok) throw new Error("Network issues");
        return res.json();
      })
      .then(data => {
        setAlbums(data.slice(0, 5));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="card">
      <h3>Task 2: Fetch Albums API</h3>
      {loading && <Spinner />}
      {error && <ErrorMsg msg={error} />}
      {!loading && !error && (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
          {albums.map(a => (
            <li key={a.id} style={{ padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: '500' }}>
              📁 {a.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Task 3: Fetch Photos
function FetchPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('https://jsonplaceholder.typicode.com/photos')
      .then(res => {
        if (!res.ok) throw new Error("Network issues");
        return res.json();
      })
      .then(data => {
        setPhotos(data.slice(0, 5));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="card">
      <h3>Task 3: Fetch Photos API</h3>
      {loading && <Spinner />}
      {error && <ErrorMsg msg={error} />}
      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          {photos.map(p => (
            <div key={p.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <img src={p.thumbnailUrl} alt={p.title} style={{ width: '65px', height: '65px', borderRadius: '6px', objectFit: 'cover' }} />
              <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>{p.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Task 4: Random User API
function FetchRandomUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch('https://randomuser.me/api/')
      .then(res => {
        if (!res.ok) throw new Error("Network issues");
        return res.json();
      })
      .then(data => {
        setUser(data.results[0]);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [trigger]);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <h3>Task 4: Random User Profile Generator</h3>
      
      {loading && <Spinner />}
      {error && <ErrorMsg msg={error} />}
      
      {!loading && !error && user && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0' }}>
          <img src={user.picture.large} alt="avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid var(--primary)', boxShadow: '0 8px 20px var(--primary-glow)', marginBottom: '1.2rem' }} />
          <h4 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '0 0 0.3rem' }}>
            {user.name.first} {user.name.last}
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{user.email}</p>
          <span className="badge pass" style={{ fontSize: '0.8rem' }}>{user.location.country}</span>
        </div>
      )}

      <button className="btn-primary" style={{ alignSelf: 'center' }} onClick={() => setTrigger(prev => prev + 1)}>
        🎲 Load Another User
      </button>
    </div>
  );
}

// Task 5: Country API
function FetchCountries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('https://restcountries.com/v3.1/all')
      .then(res => {
        if (!res.ok) throw new Error("Network issues");
        return res.json();
      })
      .then(data => {
        // Sort alphabetically and store
        const sorted = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        setCountries(sorted);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = countries.filter(c => 
    c.name.common.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5); // Show first 5 matches

  return (
    <div className="card">
      <h3>Task 5: REST Countries Explorer</h3>
      
      <input 
        type="text" 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        placeholder="Filter countries by name..." 
        style={{ margin: '1.5rem 0 1rem' }} 
      />

      {loading && <Spinner />}
      {error && <ErrorMsg msg={error} />}
      
      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(c => (
            <div key={c.cca3} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{c.flag}</span>
                <div>
                  <h5 style={{ margin: 0 }}>{c.name.common}</h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Capital: {c.capital ? c.capital[0] : 'N/A'}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Population</span>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>{c.population.toLocaleString()}</p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No countries match your search.</p>
          )}
        </div>
      )}
    </div>
  );
}
