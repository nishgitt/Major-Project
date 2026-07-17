import React, { useState } from 'react';

export default function NavigationTasks({ activeSubTask }) {
  switch (activeSubTask) {
    case 0: return <QuizApp />;
    case 1: return <BankingApp />;
    case 2: return <HospitalApp />;
    case 3: return <LmsApp />;
    case 4: return <FoodOrderingApp />;
    default: return <div>Select a task</div>;
  }
}

// ==================== Task 1: Quiz Application ====================
function QuizApp() {
  const [step, setStep] = useState('login'); // login -> instructions -> quiz -> result
  const [username, setUsername] = useState('');
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);

  const quizQuestions = [
    { q: 'Which is the virtual DOM engine used by default in Vite?', a: 'React', choices: ['React', 'Vue', 'Angular', 'Svelte'] },
    { q: 'Which hook manages side-effects in functional components?', a: 'useEffect', choices: ['useState', 'useRef', 'useEffect', 'useMemo'] },
    { q: 'What compiles jsx into standard javascript?', a: 'Babel', choices: ['Webpack', 'Babel', 'Node', 'Vite'] }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) setStep('instructions');
  };

  const handleAnswerSelect = (choice) => {
    setAnswers({ ...answers, [currentQ]: choice });
  };

  const handleNextQuestion = () => {
    if (currentQ < quizQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setStep('result');
    }
  };

  const score = quizQuestions.reduce((acc, curr, idx) => {
    return acc + (answers[idx] === curr.a ? 1 : 0);
  }, 0);

  return (
    <div className="card">
      <h3>Task 1: Quiz Application Wizard</h3>
      
      {step === 'login' && (
        <form onSubmit={handleLogin} style={{ marginTop: '1.5rem' }}>
          <div className="form-group">
            <label>Student Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter name" required />
          </div>
          <button type="submit" className="btn-primary">Enter Dashboard</button>
        </form>
      )}

      {step === 'instructions' && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4>Instructions for {username}</h4>
          <ul style={{ paddingLeft: '1.5rem', margin: '1rem 0', lineHeight: '1.8', color: 'var(--text-muted)' }}>
            <li>There are 3 multiple-choice questions.</li>
            <li>Each question holds equal weight.</li>
            <li>Press next to proceed. No back tracking allowed.</li>
          </ul>
          <button className="btn-primary" onClick={() => setStep('quiz')}>Start Assessment</button>
        </div>
      )}

      {step === 'quiz' && (
        <div style={{ marginTop: '1.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: '600' }}>Question {currentQ + 1} of {quizQuestions.length}</span>
          <h4 style={{ margin: '0.5rem 0 1.5rem' }}>{quizQuestions[currentQ].q}</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
            {quizQuestions[currentQ].choices.map((choice, i) => (
              <button 
                key={i} 
                className={`sidebar-btn ${answers[currentQ] === choice ? 'active' : ''}`}
                style={{ textAlign: 'left', padding: '0.8rem 1.2rem', justifyContent: 'flex-start' }}
                onClick={() => handleAnswerSelect(choice)}
              >
                {choice}
              </button>
            ))}
          </div>

          <button 
            className="btn-primary" 
            disabled={!answers[currentQ]} 
            onClick={handleNextQuestion}
          >
            {currentQ === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      )}

      {step === 'result' && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <div style={{ fontSize: '3rem' }}>🏆</div>
          <h4>Quiz Scorecard</h4>
          <p style={{ margin: '1rem 0' }}>Student: <strong>{username}</strong></p>
          <span className="badge pass" style={{ fontSize: '1.4rem', padding: '0.5rem 1.2rem' }}>
            Score: {score} / {quizQuestions.length} ({Math.round((score / quizQuestions.length) * 100)}%)
          </span>
          <div style={{ marginTop: '2rem' }}>
            <button className="btn-secondary" onClick={() => { setStep('login'); setAnswers({}); setCurrentQ(0); setUsername(''); }}>Retake Quiz</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Task 2: Banking Application ====================
function BankingApp() {
  const [balance, setBalance] = useState(5000);
  const [tab, setTab] = useState('dash'); // dash -> deposit -> withdraw -> transactions
  const [transactions, setTransactions] = useState([
    { type: 'Deposit', amount: 5000, date: '2026-07-16 10:00:00', balance: 5000 }
  ]);
  const [amount, setAmount] = useState('');

  const handleDeposit = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    
    const newBal = balance + val;
    setBalance(newBal);
    setTransactions([
      { type: 'Deposit', amount: val, date: new Date().toLocaleString(), balance: newBal },
      ...transactions
    ]);
    setAmount('');
    alert("Deposit successful!");
    setTab('dash');
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    if (val > balance) {
      alert("Insufficient balance!");
      return;
    }

    const newBal = balance - val;
    setBalance(newBal);
    setTransactions([
      { type: 'Withdraw', amount: val, date: new Date().toLocaleString(), balance: newBal },
      ...transactions
    ]);
    setAmount('');
    alert("Withdrawal successful!");
    setTab('dash');
  };

  return (
    <div className="card">
      <h3>Task 2: Retail Banking Ledger</h3>
      
      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0 1.5rem' }}>
        <button className={`btn-secondary ${tab === 'dash' ? 'active' : ''}`} style={{ flex: 1, padding: '0.4rem 0' }} onClick={() => setTab('dash')}>Dashboard</button>
        <button className={`btn-secondary ${tab === 'deposit' ? 'active' : ''}`} style={{ flex: 1, padding: '0.4rem 0' }} onClick={() => setTab('deposit')}>Deposit</button>
        <button className={`btn-secondary ${tab === 'withdraw' ? 'active' : ''}`} style={{ flex: 1, padding: '0.4rem 0' }} onClick={() => setTab('withdraw')}>Withdraw</button>
        <button className={`btn-secondary ${tab === 'txs' ? 'active' : ''}`} style={{ flex: 1, padding: '0.4rem 0' }} onClick={() => setTab('txs')}>History</button>
      </div>

      {tab === 'dash' && (
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Available Balance</p>
          <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--success)' }}>${balance.toLocaleString()}</span>
        </div>
      )}

      {tab === 'deposit' && (
        <form onSubmit={handleDeposit}>
          <div className="form-group">
            <label>Amount to Deposit ($)</label>
            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="e.g. 500" />
          </div>
          <button type="submit" className="btn-primary">Execute Deposit</button>
        </form>
      )}

      {tab === 'withdraw' && (
        <form onSubmit={handleWithdraw}>
          <div className="form-group">
            <label>Amount to Withdraw ($)</label>
            <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="e.g. 200" />
          </div>
          <button type="submit" className="btn-primary">Execute Withdrawal</button>
        </form>
      )}

      {tab === 'txs' && (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Date</th><th>Type</th><th>Amount</th><th>Post Balance</th></tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={i}>
                  <td style={{ fontSize: '0.85rem' }}>{tx.date}</td>
                  <td style={{ fontWeight: '600', color: tx.type === 'Deposit' ? 'var(--success)' : 'var(--danger)' }}>{tx.type}</td>
                  <td>${tx.amount.toLocaleString()}</td>
                  <td style={{ fontWeight: '700' }}>${tx.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==================== Task 3: Hospital Management ====================
function HospitalApp() {
  const [tab, setTab] = useState('patients'); // patients -> doctors -> appointments -> billing
  
  const [patients, setPatients] = useState([
    { id: 1, name: 'Rahul Sharma', age: 24, gender: 'Male' }
  ]);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: '' });

  const [doctors, setDoctors] = useState([
    { id: 1, name: 'Dr. C. Kamal', specialty: 'Cardiology' }
  ]);

  const [appointments, setAppointments] = useState([
    { patient: 'Rahul Sharma', doctor: 'Dr. C. Kamal', time: '2026-07-20 10:30' }
  ]);
  const [newApp, setNewApp] = useState({ patient: '', doctor: '', time: '' });

  const [bills, setBills] = useState([
    { patient: 'Rahul Sharma', amount: 1200, status: 'Paid' }
  ]);

  const addPatient = (e) => {
    e.preventDefault();
    if (newPatient.name && newPatient.age) {
      setPatients([...patients, { id: patients.length + 1, ...newPatient }]);
      setNewPatient({ name: '', age: '', gender: '' });
      alert("Patient registered successfully!");
    }
  };

  const bookApp = (e) => {
    e.preventDefault();
    if (newApp.patient && newApp.doctor) {
      setAppointments([...appointments, newApp]);
      // Also generate bill
      setBills([...bills, { patient: newApp.patient, amount: 250, status: 'Pending' }]);
      setNewApp({ patient: '', doctor: '', time: '' });
      alert("Appointment scheduled and bill generated!");
    }
  };

  return (
    <div className="card">
      <h3>Task 3: Hospital Operations Simulator</h3>
      
      <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0 1.5rem', flexWrap: 'wrap' }}>
        <button className={`btn-secondary ${tab === 'patients' ? 'active' : ''}`} onClick={() => setTab('patients')}>Patients</button>
        <button className={`btn-secondary ${tab === 'doctors' ? 'active' : ''}`} onClick={() => setTab('doctors')}>Doctors</button>
        <button className={`btn-secondary ${tab === 'appointments' ? 'active' : ''}`} onClick={() => setTab('appointments')}>Appointments</button>
        <button className={`btn-secondary ${tab === 'billing' ? 'active' : ''}`} onClick={() => setTab('billing')}>Billing</button>
      </div>

      {tab === 'patients' && (
        <div>
          <form onSubmit={addPatient} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input type="text" placeholder="Patient Name" value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} required />
            <input type="number" placeholder="Age" value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} required style={{ width: '80px' }} />
            <select value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})} required>
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>+ Reg</button>
          </form>
          <div className="table-container">
            <table>
              <thead><tr><th>ID</th><th>Patient</th><th>Age</th><th>Gender</th></tr></thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}><td>{p.id}</td><td style={{ fontWeight: '600' }}>{p.name}</td><td>{p.age}</td><td>{p.gender}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'doctors' && (
        <div className="table-container">
          <table>
            <thead><tr><th>ID</th><th>Doctor</th><th>Specialty</th></tr></thead>
            <tbody>
              {doctors.map(d => (
                <tr key={d.id}><td>{d.id}</td><td style={{ fontWeight: '600' }}>{d.name}</td><td>{d.specialty}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'appointments' && (
        <div>
          <form onSubmit={bookApp} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
            <select value={newApp.patient} onChange={e => setNewApp({...newApp, patient: e.target.value})} required>
              <option value="">Select Patient</option>
              {patients.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <select value={newApp.doctor} onChange={e => setNewApp({...newApp, doctor: e.target.value})} required>
              <option value="">Select Doctor</option>
              {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
            <input type="datetime-local" value={newApp.time} onChange={e => setNewApp({...newApp, time: e.target.value})} required />
            <button type="submit" className="btn-primary">Schedule Booking</button>
          </form>
          <div className="table-container">
            <table>
              <thead><tr><th>Patient</th><th>Doctor</th><th>Scheduled Time</th></tr></thead>
              <tbody>
                {appointments.map((a, i) => (
                  <tr key={i}><td>{a.patient}</td><td>{a.doctor}</td><td>{a.time}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'billing' && (
        <div className="table-container">
          <table>
            <thead><tr><th>Patient</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {bills.map((b, i) => (
                <tr key={i}>
                  <td>{b.patient}</td>
                  <td>${b.amount}</td>
                  <td><span className={`badge ${b.status === 'Paid' ? 'pass' : 'pending'}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==================== Task 4: Learning Management System ====================
function LmsApp() {
  const [tab, setTab] = useState('courses'); // courses -> assignments -> progress -> certs
  
  const [courses] = useState([
    { id: 1, title: 'React Hooks Mastery', progress: 100 },
    { id: 2, title: 'Advanced Django Architecture', progress: 40 },
    { id: 3, title: 'Database Optimization Guide', progress: 0 }
  ]);

  const [assignments, setAssignments] = useState([
    { title: 'Task Sheet Set 2', course: 'React Hooks Mastery', status: 'Submitted' },
    { title: 'Django Views CRUD APIs', course: 'Advanced Django Architecture', status: 'Pending' }
  ]);

  const handleHandIn = (index) => {
    const list = [...assignments];
    list[index].status = 'Submitted';
    setAssignments(list);
    alert("Assignment submitted successfully!");
  };

  return (
    <div className="card">
      <h3>Task 4: LMS Dashboard Workspace</h3>
      
      <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0 1.5rem', flexWrap: 'wrap' }}>
        <button className={`btn-secondary ${tab === 'courses' ? 'active' : ''}`} onClick={() => setTab('courses')}>Courses</button>
        <button className={`btn-secondary ${tab === 'assignments' ? 'active' : ''}`} onClick={() => setTab('assignments')}>Assignments</button>
        <button className={`btn-secondary ${tab === 'progress' ? 'active' : ''}`} onClick={() => setTab('progress')}>Progress</button>
        <button className={`btn-secondary ${tab === 'certs' ? 'active' : ''}`} onClick={() => setTab('certs')}>Certificates</button>
      </div>

      {tab === 'courses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {courses.map(c => (
            <div key={c.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <h5 style={{ margin: 0 }}>{c.title}</h5>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.8rem' }}>
                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${c.progress}%`, height: '100%', background: 'var(--primary)' }}></div>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{c.progress}% Completed</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'assignments' && (
        <div className="table-container">
          <table>
            <thead><tr><th>Assignment Title</th><th>Course</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {assignments.map((ass, i) => (
                <tr key={i}>
                  <td>{ass.title}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{ass.course}</td>
                  <td><span className={`badge ${ass.status === 'Submitted' ? 'pass' : 'pending'}`}>{ass.status}</span></td>
                  <td>
                    {ass.status !== 'Submitted' && (
                      <button className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleHandIn(i)}>Hand In</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'progress' && (
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <h4>Your Global Academic Stats</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <h6>Enrolled Courses</h6>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>3</p>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <h6>Pending Tasks</h6>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>1</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'certs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {courses.filter(c => c.progress === 100).map(c => (
            <div key={c.id} style={{ padding: '1.2rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--success)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h5 style={{ margin: 0, color: 'var(--success)' }}>🎓 {c.title}</h5>
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Certification Unlocked</p>
              </div>
              <button className="btn-primary" style={{ background: 'var(--success)', border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => alert('Certificate downloaded!')}>
                Download
              </button>
            </div>
          ))}
          {courses.filter(c => c.progress === 100).length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Complete a course 100% to earn certificates.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== Task 5: Food Ordering Application ====================
function FoodOrderingApp() {
  const [step, setStep] = useState('restaurants'); // restaurants -> menu -> cart -> payment
  const [activeRest, setActiveRest] = useState(null);
  const [cart, setCart] = useState([]);

  const restaurants = [
    { id: 1, name: 'Burger Bistro', cuisine: 'Fast Food', menu: [{ item: 'Cheeseburger', price: 8 }, { item: 'Fries', price: 3 }] },
    { id: 2, name: 'Pizza Piazza', cuisine: 'Italian', menu: [{ item: 'Pepperoni Pizza', price: 12 }, { item: 'Garlic Bread', price: 4 }] }
  ];

  const handleSelectRest = (rest) => {
    setActiveRest(rest);
    setStep('menu');
  };

  const handleAddToCart = (foodItem) => {
    setCart([...cart, foodItem]);
  };

  const checkout = () => {
    if (cart.length === 0) return;
    setStep('cart');
  };

  const total = cart.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="card">
      <h3>Task 5: Food Order Application</h3>
      
      {step === 'restaurants' && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4>Local Restaurants</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {restaurants.map(r => (
              <div key={r.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h5 style={{ margin: 0 }}>🍔 {r.name}</h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.cuisine}</p>
                </div>
                <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleSelectRest(r)}>Browse Menu</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'menu' && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h4>Menu - {activeRest.name}</h4>
            <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => setStep('restaurants')}>Back</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeRest.menu.map((food, i) => (
              <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h6 style={{ margin: 0 }}>{food.item}</h6>
                  <p style={{ margin: 0, fontWeight: '700' }}>${food.price}</p>
                </div>
                <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleAddToCart(food)}>+ Add</button>
              </div>
            ))}
          </div>
          
          {cart.length > 0 && (
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
              <span>Items in Cart: <strong>{cart.length}</strong></span>
              <button className="btn-primary" onClick={checkout}>Checkout (${total})</button>
            </div>
          )}
        </div>
      )}

      {step === 'cart' && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4>Checkout Ledger</h4>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', margin: '1rem 0' }}>
            {cart.map((item, i) => (
              <p key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.item}</span>
                <strong>${item.price}</strong>
              </p>
            ))}
            <p style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Total Price:</span>
              <span>${total}</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-secondary" onClick={() => setStep('menu')}>Add Items</button>
            <button className="btn-primary" onClick={() => setStep('payment')}>Simulate Payment</button>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <div style={{ fontSize: '3rem' }}>🏍️</div>
          <h4>Order Placed!</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 1.5rem' }}>
            Your delivery from <strong>{activeRest.name}</strong> is on its way.
          </p>
          <button className="btn-secondary" onClick={() => { setStep('restaurants'); setCart([]); setActiveRest(null); }}>Place Another Order</button>
        </div>
      )}
    </div>
  );
}
