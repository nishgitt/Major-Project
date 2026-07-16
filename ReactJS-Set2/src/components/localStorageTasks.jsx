import React, { useState, useEffect } from 'react';

export default function LocalStorageTasks({ activeSubTask, globalTheme, setGlobalTheme }) {
  switch (activeSubTask) {
    case 0: return <SaveUsername />;
    case 1: return <ThemePersistence globalTheme={globalTheme} setGlobalTheme={setGlobalTheme} />;
    case 2: return <TodoList />;
    case 3: return <NotesApp />;
    case 4: return <ShoppingCart />;
    default: return <div>Select a task</div>;
  }
}

// Task 1: Save Username
function SaveUsername() {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('storedUsername') || '';
  });
  const [inputVal, setInputVal] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      localStorage.setItem('storedUsername', inputVal.trim());
      setUsername(inputVal.trim());
      setInputVal('');
      alert("Username saved to LocalStorage!");
    }
  };

  const handleClear = () => {
    localStorage.removeItem('storedUsername');
    setUsername('');
  };

  return (
    <div className="card">
      <h3>Task 1: Persistent Username Greeting</h3>
      
      {username ? (
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <h4>👋 Welcome Back, <span style={{ color: 'var(--secondary)' }}>{username}</span>!</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            This name is retrieved from local storage and persists across page reloads.
          </p>
          <button className="btn-secondary" style={{ marginTop: '1.5rem', padding: '0.4rem 1rem' }} onClick={handleClear}>
            Clear Username
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} style={{ marginTop: '1.5rem' }}>
          <div className="form-group">
            <label>Save Your Name</label>
            <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)} placeholder="e.g. Rahul" required />
          </div>
          <button type="submit" className="btn-primary">Save to LocalStorage</button>
        </form>
      )}
    </div>
  );
}

// Task 2: Theme Persistence
function ThemePersistence({ globalTheme, setGlobalTheme }) {
  const toggleTheme = () => {
    const nextTheme = globalTheme === 'dark' ? 'light' : 'dark';
    setGlobalTheme(nextTheme);
  };

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h3>Task 2: Theme Persistence Controller</h3>
      <p style={{ margin: '1.5rem 0', color: 'var(--text-muted)' }}>
        Toggle the global system theme. The chosen preference is saved in local storage and maintained on refresh.
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={toggleTheme}>
          {globalTheme === 'dark' ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
        </button>
      </div>

      <p style={{ fontSize: '0.9rem' }}>
        Active Mode: <span className="badge completed" style={{ textTransform: 'capitalize' }}>{globalTheme} Mode</span>
      </p>
    </div>
  );
}

// Task 3: Todo List
function TodoList() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('storedTodos');
    return saved ? JSON.parse(saved) : ['Buy milk', 'Complete React Task Sheet'];
  });
  const [input, setInput] = useState('');

  useEffect(() => {
    localStorage.setItem('storedTodos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setTodos([...todos, input.trim()]);
      setInput('');
    }
  };

  const deleteTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  return (
    <div className="card">
      <h3>Task 3: Persistent Todo List</h3>
      <form onSubmit={addTodo} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Add a new task..." required />
        <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>+ Task</button>
      </form>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {todos.map((todo, idx) => (
          <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <span>📝 {todo}</span>
            <button className="btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => deleteTodo(idx)}>Delete</button>
          </li>
        ))}
        {todos.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No tasks. Add one above!</p>
        )}
      </ul>
    </div>
  );
}

// Task 4: Notes Application
function NotesApp() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('storedNotes');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Ideas', content: 'Explore Next.js server actions.' }
    ];
  });
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    localStorage.setItem('storedNotes', JSON.stringify(notes));
  }, [notes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noteForm.title || !noteForm.content) return;

    if (editId) {
      // Edit mode
      setNotes(notes.map(n => n.id === editId ? { ...n, ...noteForm } : n));
      setEditId(null);
    } else {
      // Add mode
      setNotes([...notes, { id: Date.now(), ...noteForm }]);
    }
    setNoteForm({ title: '', content: '' });
  };

  const startEdit = (note) => {
    setEditId(note.id);
    setNoteForm({ title: note.title, content: note.content });
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
    if (editId === id) {
      setEditId(null);
      setNoteForm({ title: '', content: '' });
    }
  };

  return (
    <div className="card">
      <h3>Task 4: Notes Workstation</h3>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', marginTop: '1.5rem' }}>
        <div className="form-group">
          <label>Note Title</label>
          <input type="text" value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} placeholder="Title" required />
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea rows="2" value={noteForm.content} onChange={e => setNoteForm({...noteForm, content: e.target.value})} placeholder="Details..." required></textarea>
        </div>
        <button type="submit" className="btn-primary">
          {editId ? '💾 Save Note Changes' : '📝 Create Note'}
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {notes.map(n => (
          <div key={n.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h5 style={{ margin: 0 }}>📌 {n.title}</h5>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.4' }}>{n.content}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button className="btn-secondary" style={{ flex: 1, padding: '0.3rem 0', fontSize: '0.8rem' }} onClick={() => startEdit(n)}>Edit</button>
              <button className="btn-danger" style={{ flex: 1, padding: '0.3rem 0', fontSize: '0.8rem' }} onClick={() => deleteNote(n.id)}>Delete</button>
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1/-1' }}>No notes created.</p>
        )}
      </div>
    </div>
  );
}

// Task 5: Shopping Cart
const PRODUCTS_IN_STORE = [
  { id: 1, name: 'Vite Developer T-Shirt', price: 20 },
  { id: 2, name: 'React Glowing Sticker', price: 3 },
  { id: 3, name: 'Premium Hydro Mug', price: 15 }
];

function ShoppingCart() {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('storedCart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('storedCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (prod) => {
    const existing = cart.find(item => item.id === prod.id);
    if (existing) {
      setCart(cart.map(item => item.id === prod.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...prod, qty: 1 }]);
    }
  };

  const updateQty = (id, change) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const nextQty = item.qty + change;
        return nextQty > 0 ? { ...item, qty: nextQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeProduct = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
  const totalQty = cart.reduce((acc, curr) => acc + curr.qty, 0);

  return (
    <div className="card">
      <h3>Task 5: Persistent Shopping Cart</h3>
      
      {/* Store Listing */}
      <h5 style={{ margin: '1.5rem 0 0.8rem' }}>Available Products</h5>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {PRODUCTS_IN_STORE.map(prod => (
          <div key={prod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <span>🛒 {prod.name} — <strong>${prod.price}</strong></span>
            <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => addToCart(prod)}>
              Add
            </button>
          </div>
        ))}
      </div>

      {/* Cart Listing */}
      <h5 style={{ margin: '2rem 0 0.8rem' }}>Your Basket ({totalQty} items)</h5>
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Item</th><th>Price</th><th>Qty</th><th style={{ textAlign: 'right' }}>Action</th></tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: '500' }}>{item.name}</td>
                <td>${item.price}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button className="btn-secondary" style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem' }} onClick={() => updateQty(item.id, -1)}>-</button>
                    <strong>{item.qty}</strong>
                    <button className="btn-secondary" style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem' }} onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => removeProduct(item.id)}>Remove</button>
                </td>
              </tr>
            ))}
            {cart.length === 0 && (
              <tr><td colspan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Cart is empty.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {cart.length > 0 && (
        <div style={{ marginTop: '1.5rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>
          Total Price: <span style={{ color: 'var(--secondary)' }}>${total}</span>
        </div>
      )}
    </div>
  );
}
