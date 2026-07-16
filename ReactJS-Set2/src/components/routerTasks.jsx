import React, { useState, useEffect } from 'react';
import { 
  MemoryRouter, 
  Routes, 
  Route, 
  Link, 
  useLocation, 
  useNavigate, 
  useParams, 
  Navigate 
} from 'react-router-dom';

export default function RouterTasks({ activeSubTask }) {
  const [addressBar, setAddressBar] = useState('/');

  // Reset address bar when subtask changes
  useEffect(() => {
    if (activeSubTask === 0) setAddressBar('/college/home');
    if (activeSubTask === 1) setAddressBar('/dashboard/students');
    if (activeSubTask === 2) setAddressBar('/blogs');
    if (activeSubTask === 3) setAddressBar('/products');
    if (activeSubTask === 4) setAddressBar('/dashboard');
  }, [activeSubTask]);

  return (
    <div className="card" style={{ padding: '1rem' }}>
      <h3>Router Tasks Simulator</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
        Runs inside a <strong>Virtual Browser Container</strong> using a local `MemoryRouter`.
      </p>

      {/* Virtual Browser Mockup */}
      <div style={{
        background: '#0d121f',
        borderRadius: '12px',
        border: '1px solid var(--border-color-hover)',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Browser Address Bar */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid var(--border-color)',
          padding: '0.6rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <span style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%' }}></span>
            <span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '50%' }}></span>
            <span style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '50%' }}></span>
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            flex: '1',
            padding: '0.3rem 1rem',
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ color: 'var(--success)' }}>🔒 https://mits-virtual-app.net</span>
            <span style={{ color: 'white' }}>{addressBar}</span>
          </div>
        </div>

        {/* Browser Viewport */}
        <div style={{ padding: '2rem', flex: '1', display: 'flex', flexDirection: 'column' }}>
          <MemoryRouter initialEntries={
            activeSubTask === 0 ? ['/college/home'] :
            activeSubTask === 1 ? ['/dashboard/students'] :
            activeSubTask === 2 ? ['/blogs'] :
            activeSubTask === 3 ? ['/products'] :
            ['/dashboard']
          }>
            <AddressSync setAddress={setAddressBar} />
            <Routes>
              {/* 1. College Website Routes */}
              <Route path="/college/home" element={<CollegeHome />} />
              <Route path="/college/departments" element={<CollegeDepts />} />
              <Route path="/college/faculty" element={<CollegeFaculty />} />
              <Route path="/college/placements" element={<CollegePlacements />} />
              <Route path="/college/contact" element={<CollegeContact />} />

              {/* 2. Nested Routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route path="students" element={<DashboardStudents />} />
                <Route path="faculty" element={<DashboardFaculty />} />
                <Route path="reports" element={<DashboardReports />} />
              </Route>

              {/* 3. Blog Application Routes */}
              <Route path="/blogs" element={<BlogHome />} />
              <Route path="/blog/:id" element={<BlogDetails />} />

              {/* 4. E-Commerce Routing */}
              <Route path="/products" element={<ShopProducts />} />
              <Route path="/cart" element={<ShopCart />} />
              <Route path="/checkout" element={<ShopCheckout />} />
              <Route path="/orders" element={<ShopOrders />} />

              {/* 5. Protected Routes */}
              <Route path="/protected-login" element={<ProtectedLogin />} />
              <Route path="/dashboard-protected" element={
                <ProtectedRoute>
                  <ProtectedDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </MemoryRouter>
        </div>
      </div>
    </div>
  );
}

// Synchronization Helper
function AddressSync({ setAddress }) {
  const location = useLocation();
  useEffect(() => {
    setAddress(location.pathname + location.search);
  }, [location, setAddress]);
  return null;
}


// ==================== 1. College Website Views ====================
function CollegeNav() {
  return (
    <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
      <Link to="/college/home" style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>MITS Home</Link>
      <Link to="/college/departments">Departments</Link>
      <Link to="/college/faculty">Faculty</Link>
      <Link to="/college/placements">Placements</Link>
      <Link to="/college/contact">Contact Us</Link>
    </div>
  );
}

function CollegeHome() {
  return (
    <div>
      <CollegeNav />
      <h4>Welcome to MITS</h4>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.8rem', lineHeight: '1.6' }}>
        Madanapalle Institute of Technology & Science (MITS) is a premier engineering college dedicated to academic excellence, innovative research, and student empowerment.
      </p>
    </div>
  );
}

function CollegeDepts() {
  return (
    <div>
      <CollegeNav />
      <h4>Academic Departments</h4>
      <ul style={{ paddingLeft: '1.5rem', marginTop: '0.8rem', lineHeight: '2' }}>
        <li>Computer Science & Engineering (CSE)</li>
        <li>Electronics & Communication Engineering (ECE)</li>
        <li>Electrical & Electronics Engineering (EEE)</li>
        <li>Mechanical Engineering (ME)</li>
      </ul>
    </div>
  );
}

function CollegeFaculty() {
  return (
    <div>
      <CollegeNav />
      <h4>Our Eminent Faculty</h4>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.8rem' }}>
        <li>👨‍🏫 <strong>Dr. C. Kamal</strong> - Principal (CSE Dept)</li>
        <li>👩‍🏫 <strong>Dr. S. Priya</strong> - Dean (ECE Dept)</li>
        <li>👨‍🏫 <strong>Prof. R. Anand</strong> - Head of Placements</li>
      </ul>
    </div>
  );
}

function CollegePlacements() {
  return (
    <div>
      <CollegeNav />
      <h4>Placement Records</h4>
      <p style={{ color: 'var(--text-muted)', margin: '0.8rem 0' }}>
        We are proud of our 95% placement record in leading software and infrastructure multinationals.
      </p>
      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <p>⭐ <strong>Highest Package:</strong> 24 LPA</p>
        <p>⭐ <strong>Average Package:</strong> 5.5 LPA</p>
        <p>⭐ <strong>Key Recruiters:</strong> Cognizant, TCS, Infosys, Wipro</p>
      </div>
    </div>
  );
}

function CollegeContact() {
  return (
    <div>
      <CollegeNav />
      <h4>Contact Administration</h4>
      <form onSubmit={e => { e.preventDefault(); alert('Message sent!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
        <input type="text" placeholder="Your Name" required />
        <input type="email" placeholder="Your Email" required />
        <textarea placeholder="Message details" required rows="2"></textarea>
        <button type="submit" className="btn-primary" style={{ width: 'fit-content' }}>Submit Inquiry</button>
      </form>
    </div>
  );
}


// ==================== 2. Nested Routing Views ====================
function DashboardLayout() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1.5rem', height: '100%' }}>
      <aside style={{ borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}>
        <h5 style={{ textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '1rem' }}>Dashboard</h5>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li><Link to="/dashboard/students">👨‍🎓 Students</Link></li>
          <li><Link to="/dashboard/faculty">👩‍🏫 Faculty</Link></li>
          <li><Link to="/dashboard/reports">📊 Reports</Link></li>
        </ul>
      </aside>
      <div>
        {/* Render nested views manually based on path or let memory router handle it */}
        <Routes>
          <Route path="students" element={<DashboardStudents />} />
          <Route path="faculty" element={<DashboardFaculty />} />
          <Route path="reports" element={<DashboardReports />} />
        </Routes>
      </div>
    </div>
  );
}

function DashboardStudents() {
  return (
    <div>
      <h4>Student Rosters</h4>
      <table style={{ marginTop: '1rem' }}>
        <thead>
          <tr><th>ID</th><th>Student</th><th>GPA</th></tr>
        </thead>
        <tbody>
          <tr><td>101</td><td>Rahul Sharma</td><td>9.2</td></tr>
          <tr><td>102</td><td>Priya Patel</td><td>8.8</td></tr>
        </tbody>
      </table>
    </div>
  );
}

function DashboardFaculty() {
  return (
    <div>
      <h4>Faculty Records</h4>
      <table style={{ marginTop: '1rem' }}>
        <thead>
          <tr><th>ID</th><th>Professor</th><th>Role</th></tr>
        </thead>
        <tbody>
          <tr><td>201</td><td>Dr. C. Kamal</td><td>Dean</td></tr>
          <tr><td>202</td><td>Dr. S. Priya</td><td>HOD ECE</td></tr>
        </tbody>
      </table>
    </div>
  );
}

function DashboardReports() {
  return (
    <div>
      <h4>Academic Reports</h4>
      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', marginTop: '1rem' }}>
        <p>📈 <strong>Total Enrollments:</strong> 1,240</p>
        <p>📈 <strong>Graduation Rate:</strong> 97.4%</p>
      </div>
    </div>
  );
}


// ==================== 3. Blog Application Views ====================
const BLOG_POSTS = [
  { id: 1, title: 'Getting Started with React Hooks', content: 'React hooks revolutionized state management in functional components...' },
  { id: 2, title: 'Vite vs Webpack Comparison', content: 'Vite leverages native ES modules to compile code up to 10x faster...' }
];

function BlogHome() {
  return (
    <div>
      <h4>Technical Web Blog</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        {BLOG_POSTS.map(post => (
          <div key={post.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <h5>{post.title}</h5>
            <Link to={`/blog/${post.id}`} style={{ color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '0.5rem', display: 'inline-block' }}>
              Read Article &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = BLOG_POSTS.find(p => p.id === parseInt(id));

  if (!post) {
    return <div>Post not found! <Link to="/blogs">Back to Blogs</Link></div>;
  }

  return (
    <div>
      <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', marginBottom: '1rem' }} onClick={() => navigate('/blogs')}>
        &larr; Back to Blogs
      </button>
      <h4>{post.title}</h4>
      <p style={{ color: 'var(--text-muted)', marginTop: '1rem', lineHeight: '1.6' }}>
        {post.content}
      </p>
    </div>
  );
}


// ==================== 4. E-Commerce Routing Views ====================
function ShopProducts() {
  const navigate = useNavigate();
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
        <h4>Products Shop</h4>
        <Link to="/cart" style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>🛒 View Cart</Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <h6>Mechanical Keyboard</h6>
          <p>$89.99</p>
          <button className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', marginTop: '0.5rem' }} onClick={() => navigate('/cart')}>
            Buy Now
          </button>
        </div>
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <h6>Gaming Mouse</h6>
          <p>$49.99</p>
          <button className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', marginTop: '0.5rem' }} onClick={() => navigate('/cart')}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

function ShopCart() {
  const navigate = useNavigate();
  return (
    <div>
      <h4>Your Shopping Cart</h4>
      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', margin: '1rem 0' }}>
        <p>📦 1x Mechanical Keyboard — $89.99</p>
        <p style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem', fontWeight: 'bold' }}>Total: $89.99</p>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn-secondary" onClick={() => navigate('/products')}>Keep Shopping</button>
        <button className="btn-primary" onClick={() => navigate('/checkout')}>Checkout</button>
      </div>
    </div>
  );
}

function ShopCheckout() {
  const navigate = useNavigate();
  return (
    <div>
      <h4>Checkout Shipping</h4>
      <form onSubmit={e => { e.preventDefault(); navigate('/orders'); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
        <input type="text" placeholder="Shipping Address" required />
        <input type="text" placeholder="Card Number" required />
        <button type="submit" className="btn-primary">Pay $89.99</button>
      </form>
    </div>
  );
}

function ShopOrders() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
      <h4>Order Placed Successfully!</h4>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 1.5rem' }}>
        Order ID: #ORD-{Math.floor(Math.random() * 90000 + 10000)}
      </p>
      <button className="btn-secondary" onClick={() => navigate('/products')}>Return to Shop</button>
    </div>
  );
}


// ==================== 5. Protected Routing Views ====================
// Mock authentication status (session storage)
function getAuthToken() {
  return sessionStorage.getItem('mockRouterAuth') === 'true';
}

function ProtectedRoute({ children }) {
  const auth = getAuthToken();
  return auth ? children : <Navigate to="/protected-login" replace />;
}

function ProtectedLogin() {
  const navigate = useNavigate();
  const [pass, setPass] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (pass === 'admin') {
      sessionStorage.setItem('mockRouterAuth', 'true');
      navigate('/dashboard-protected');
    } else {
      alert("Wrong password! Use 'admin'.");
    }
  };

  return (
    <div style={{ maxWidth: '320px', margin: '1rem auto' }}>
      <h4 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Login Required</h4>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <label style={{ fontSize: '0.85rem' }}>Enter Password (Hint: 'admin')</label>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••" required />
        <button type="submit" className="btn-primary">Sign In</button>
      </form>
    </div>
  );
}

function ProtectedDashboard() {
  const navigate = useNavigate();
  const handleLogout = () => {
    sessionStorage.removeItem('mockRouterAuth');
    navigate('/protected-login');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h4>🔒 Protected Console</h4>
        <button className="btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }} onClick={handleLogout}>
          Sign Out
        </button>
      </div>
      <p style={{ color: 'var(--text-muted)' }}>
        Welcome back to the encrypted dashboard workspace! Only accessible through authenticated sessions.
      </p>
    </div>
  );
}
