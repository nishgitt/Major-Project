import React, { useState } from 'react';

export default function UseStateTasks({ activeSubTask }) {
  switch (activeSubTask) {
    case 0: return <MarksCalculator />;
    case 1: return <EmployeeForm />;
    case 2: return <MultipleCounters />;
    case 3: return <FavoriteMovies />;
    case 4: return <ExpenseTracker />;
    default: return <div>Select a task</div>;
  }
}

// Task 1: Marks Calculator
function MarksCalculator() {
  const [marks, setMarks] = useState({ math: '', science: '', english: '' });
  const [result, setResult] = useState(null);

  const calculate = (e) => {
    e.preventDefault();
    const m = parseFloat(marks.math || 0);
    const s = parseFloat(marks.science || 0);
    const eng = parseFloat(marks.english || 0);
    
    const total = m + s + eng;
    const avg = parseFloat((total / 3).toFixed(2));
    
    let grade = 'F (Fail)';
    if (m >= 40 && s >= 40 && eng >= 40) {
      if (avg >= 80) grade = 'A (Excellent)';
      else if (avg >= 60) grade = 'B (Good)';
      else if (avg >= 40) grade = 'C (Pass)';
    } else {
      grade = 'F (Fail - Failed in one or more subjects)';
    }

    setResult({ total, average: avg, grade });
  };

  return (
    <div className="card">
      <h3>Task 1: Marks Calculator</h3>
      <form onSubmit={calculate}>
        <div className="form-group">
          <label>Math Marks</label>
          <input type="number" min="0" max="100" value={marks.math} onChange={e => setMarks({...marks, math: e.target.value})} required placeholder="0-100" />
        </div>
        <div className="form-group">
          <label>Science Marks</label>
          <input type="number" min="0" max="100" value={marks.science} onChange={e => setMarks({...marks, science: e.target.value})} required placeholder="0-100" />
        </div>
        <div className="form-group">
          <label>English Marks</label>
          <input type="number" min="0" max="100" value={marks.english} onChange={e => setMarks({...marks, english: e.target.value})} required placeholder="0-100" />
        </div>
        <button type="submit" className="btn-primary">Calculate Results</button>
      </form>

      {result && (
        <div className="result-box" style={{ marginTop: '1.5rem' }}>
          <p><strong>Total Marks:</strong> {result.total} / 300</p>
          <p><strong>Average Marks:</strong> {result.average}%</p>
          <p><strong>Final Grade:</strong> <span className={`badge ${result.grade.includes('F') ? 'fail' : 'pass'}`}>{result.grade}</span></p>
        </div>
      )}
    </div>
  );
}

// Task 2: Employee Form
function EmployeeForm() {
  const [form, setForm] = useState({ name: '', dept: '', salary: '' });
  const [employee, setEmployee] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setEmployee({ ...form });
    setForm({ name: '', dept: '', salary: '' });
  };

  return (
    <div className="card">
      <h3>Task 2: Employee Registration Card</h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <div className="form-group">
          <label>Employee Name</label>
          <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. John Doe" />
        </div>
        <div className="form-group">
          <label>Department</label>
          <select value={form.dept} onChange={e => setForm({...form, dept: e.target.value})} required>
            <option value="">-- Choose Dept --</option>
            <option value="Engineering">Engineering</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">Human Resources</option>
            <option value="Finance">Finance</option>
          </select>
        </div>
        <div className="form-group">
          <label>Salary (USD)</label>
          <input type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} required placeholder="e.g. 75000" />
        </div>
        <button type="submit" className="btn-primary">Generate Card</button>
      </form>

      {employee && (
        <div className="result-box" style={{ background: 'rgba(99, 102, 241, 0.05)', borderColor: 'var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {employee.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 style={{ margin: 0 }}>{employee.name}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: #{Math.floor(Math.random() * 9000 + 1000)}</p>
            </div>
          </div>
          <p><strong>Department:</strong> {employee.dept}</p>
          <p><strong>Annual Salary:</strong> ${parseFloat(employee.salary).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

// Task 3: Multiple Counters
function MultipleCounters() {
  const [c1, setC1] = useState(0);
  const [c2, setC2] = useState(0);
  const [c3, setC3] = useState(0);

  return (
    <div className="card">
      <h3>Task 3: Independent Multi-Counters</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
        
        <div className="counter-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontWeight: '600' }}>Counter Alpha</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => setC1(c1 - 1)}>-</button>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '30px', textAlign: 'center' }}>{c1}</span>
            <button className="btn-primary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => setC1(c1 + 1)}>+</button>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setC1(0)}>Reset</button>
          </div>
        </div>

        <div className="counter-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontWeight: '600' }}>Counter Beta</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => setC2(c2 - 1)}>-</button>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '30px', textAlign: 'center' }}>{c2}</span>
            <button className="btn-primary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => setC2(c2 + 1)}>+</button>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setC2(0)}>Reset</button>
          </div>
        </div>

        <div className="counter-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontWeight: '600' }}>Counter Gamma</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => setC3(c3 - 1)}>-</button>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '30px', textAlign: 'center' }}>{c3}</span>
            <button className="btn-primary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => setC3(c3 + 1)}>+</button>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setC3(0)}>Reset</button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Task 4: Favorite Movies
function FavoriteMovies() {
  const [movies, setMovies] = useState(['Inception', 'Interstellar', 'The Dark Knight']);
  const [newMovie, setNewMovie] = useState('');

  const addMovie = (e) => {
    e.preventDefault();
    if (newMovie.trim()) {
      setMovies([...movies, newMovie.trim()]);
      setNewMovie('');
    }
  };

  const removeMovie = (index) => {
    setMovies(movies.filter((_, i) => i !== index));
  };

  return (
    <div className="card">
      <h3>Task 4: Favorite Movies List</h3>
      <form onSubmit={addMovie} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input type="text" value={newMovie} onChange={e => setNewMovie(e.target.value)} placeholder="Enter movie title..." required />
        <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>+ Add Movie</button>
      </form>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {movies.map((movie, index) => (
          <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontWeight: '500' }}>🎬 {movie}</span>
            <button className="btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => removeMovie(index)}>Remove</button>
          </li>
        ))}
        {movies.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No movies in your favorites yet.</p>
        )}
      </ul>
    </div>
  );
}

// Task 5: Expense Tracker
function ExpenseTracker() {
  const [expenses, setExpenses] = useState([
    { name: 'Hosting Server', amount: 15 },
    { name: 'Coffee', amount: 5 }
  ]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const addExpense = (e) => {
    e.preventDefault();
    if (name.trim() && amount) {
      setExpenses([...expenses, { name: name.trim(), amount: parseFloat(amount) }]);
      setName('');
      setAmount('');
    }
  };

  const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="card">
      <h3>Task 5: Expense Ledger</h3>
      
      <div class="stats-grid" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-details">
            <h4>Total Outflow</h4>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-details">
            <h4>Transactions</h4>
            <span>{expenses.length}</span>
          </div>
        </div>
      </div>

      <form onSubmit={addExpense} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Expense Name" required style={{ flex: '2' }} />
        <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount ($)" required style={{ flex: '1' }} />
        <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>Add</button>
      </form>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Expense Name</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp, index) => (
              <tr key={index}>
                <td style={{ fontWeight: '500' }}>💸 {exp.name}</td>
                <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--danger)' }}>-${exp.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
