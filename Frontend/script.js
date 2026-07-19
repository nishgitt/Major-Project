const API_BASE = 'http://127.0.0.1:8000';

// Global State / Session Helper
const Auth = {
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },
    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    },
    logout() {
        localStorage.removeItem('currentUser');
        showToast('Logged out successfully', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    },
    requireAuth(allowedRoles = []) {
        const user = this.getCurrentUser();
        if (!user) {
            showToast('Please login to access this page', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
            return false;
        }
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            showToast('Access Denied: Insufficient Permissions', 'danger');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            return false;
        }
        return true;
    }
};

// General Toast Notification
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// Format Date/Time helper
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

// Generate Common Navbar based on auth state
function renderNavbar() {
    const navContainer = document.getElementById('navbar-container');
    if (!navContainer) return;
    
    const user = Auth.getCurrentUser();
    let dashboardLink = '';
    
    if (user) {
        if (user.role === 'Admin') {
            dashboardLink = '<li><a href="admin_dashboard.html">Admin Panel</a></li>';
        } else if (user.role === 'Organizer') {
            dashboardLink = '<li><a href="organizer_dashboard.html">Organizer Panel</a></li>';
        } else {
            dashboardLink = '<li><a href="user_dashboard.html">Dashboard</a></li>';
        }
    }
    
    navContainer.innerHTML = `
        <a href="index.html" class="nav-brand">🎫 Eventify</a>
        <ul class="nav-links">
            <li><a href="index.html" id="nav-home">Home</a></li>
            <li><a href="events.html" id="nav-events">Events</a></li>
            ${user ? `
                ${dashboardLink}
                <li><a href="booking_history.html">My Bookings</a></li>
                <li><span style="color: var(--text-secondary); font-size: 0.9rem;">Hi, ${user.full_name} (${user.role})</span></li>
                <li><a href="#" class="btn btn-secondary btn-nav" id="nav-logout">Logout</a></li>
            ` : `
                <li><a href="login.html" class="btn btn-secondary btn-nav" style="padding: 0.5rem 1.2rem;">Login</a></li>
                <li><a href="register.html" class="btn btn-primary btn-nav" style="padding: 0.5rem 1.2rem;">Register</a></li>
            `}
        </ul>
    `;
    
    const logoutBtn = document.getElementById('nav-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
        });
    }
    
    // Set active link style
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);
    if (page === 'index.html' || page === '') {
        document.getElementById('nav-home')?.classList.add('active');
    } else if (page === 'events.html') {
        document.getElementById('nav-events')?.classList.add('active');
    }
}

// Check Upcoming Event Reminders (Bonus feature)
function checkEventReminders() {
    const user = Auth.getCurrentUser();
    if (!user || user.role !== 'User') return;
    
    fetch(`${API_BASE}/bookings/?user_name=${encodeURIComponent(user.full_name)}`)
        .then(res => res.json())
        .then(bookings => {
            const today = new Date('2026-07-19'); // setting today mock date as system date
            bookings.forEach(b => {
                if (b.booking_status === 'Confirmed') {
                    const eventDate = new Date(b.event_date);
                    const diffTime = eventDate - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays >= 0 && diffDays <= 7) {
                        showToast(`📢 Reminder: ${b.event_name} is coming up in ${diffDays} days! (${formatDate(b.event_date)} at ${b.event_time})`, 'warning');
                    }
                }
            });
        })
        .catch(err => console.error("Error loading reminders", err));
}

// ----------------------------------------------------
// PAGE SPECIFIC INITIALIZERS
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);
    
    if (Auth.getCurrentUser()) {
        checkEventReminders();
    }
    
    if (page === 'index.html' || page === '') {
        initHome();
    } else if (page === 'login.html') {
        initLogin();
    } else if (page === 'register.html') {
        initRegister();
    } else if (page === 'events.html') {
        initEvents();
    } else if (page === 'event_details.html') {
        initEventDetails();
    } else if (page === 'booking.html') {
        initBooking();
    } else if (page === 'payment.html') {
        initPayment();
    } else if (page === 'booking_history.html') {
        initBookingHistory();
    } else if (page === 'user_dashboard.html') {
        initUserDashboard();
    } else if (page === 'organizer_dashboard.html') {
        initOrganizerDashboard();
    } else if (page === 'admin_dashboard.html') {
        initAdminDashboard();
    }
});

// Helper to create HTML Event Card
function createEventCardHTML(event) {
    return `
        <div class="event-card">
            <div class="event-poster-container">
                <span class="event-category-badge">${event.category}</span>
                <h3 style="padding: 1rem; text-align: center; font-family: var(--font-heading); color: var(--color-secondary);">${event.event_name}</h3>
            </div>
            <div class="event-card-content">
                <h3 class="event-card-title">${event.event_name}</h3>
                <div class="event-meta-info">
                    <div class="event-meta-item">📅 <span>${formatDate(event.event_date)} at ${event.event_time}</span></div>
                    <div class="event-meta-item">📍 <span>${event.venue}</span></div>
                    <div class="event-meta-item">👤 <span>Org: ${event.organizer_name}</span></div>
                    <div class="event-meta-item">🎫 <span>Tickets left: ${event.available_tickets}</span></div>
                </div>
                <div class="event-price-booking">
                    <span class="event-price">₹${event.ticket_price}</span>
                    <a href="event_details.html?id=${event.event_id}" class="btn btn-primary" style="padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.85rem;">View Details</a>
                </div>
            </div>
        </div>
    `;
}

// 1. HOME PAGE
function initHome() {
    const container = document.getElementById('featured-events-grid');
    if (!container) return;
    
    fetch(`${API_BASE}/events/`)
        .then(res => res.json())
        .then(events => {
            if (events.length === 0) {
                container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No events published yet.</p>`;
                return;
            }
            // Display featured (take first 3)
            container.innerHTML = events.slice(0, 3).map(createEventCardHTML).join('');
        })
        .catch(err => {
            container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--color-danger);">Failed to load events. Ensure backend is running.</p>`;
            console.error(err);
        });
}

// 2. LOGIN PAGE
function initLogin() {
    const form = document.getElementById('login-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        fetch(`${API_BASE}/users/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(res => {
            if (!res.ok) throw new Error('Invalid email or password');
            return res.json();
        })
        .then(user => {
            Auth.setCurrentUser(user);
            showToast(`Welcome back, ${user.full_name}!`, 'success');
            setTimeout(() => {
                if (user.role === 'Admin') window.location.href = 'admin_dashboard.html';
                else if (user.role === 'Organizer') window.location.href = 'organizer_dashboard.html';
                else window.location.href = 'user_dashboard.html';
            }, 1000);
        })
        .catch(err => {
            showToast(err.message, 'danger');
        });
    });
}

// 3. REGISTER PAGE
function initRegister() {
    const form = document.getElementById('register-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const full_name = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const city = document.getElementById('city').value;
        const password = document.getElementById('password').value;
        
        fetch(`${API_BASE}/users/add/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name, email, phone, city, password })
        })
        .then(res => {
            if (!res.ok) return res.json().then(d => { throw new Error(d.error || 'Registration failed') });
            return res.json();
        })
        .then(user => {
            showToast('Registration Successful! Please login.', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        })
        .catch(err => {
            showToast(err.message, 'danger');
        });
    });
}

// 4. EVENTS PAGE (With Filters & Search - Bonus)
function initEvents() {
    const grid = document.getElementById('events-grid');
    const searchInput = document.getElementById('event-search');
    const categoryFilter = document.getElementById('category-filter');
    const cityFilter = document.getElementById('city-filter');
    
    if (!grid) return;
    
    function loadFilteredEvents() {
        const search = searchInput ? searchInput.value : '';
        const category = categoryFilter ? categoryFilter.value : '';
        const city = cityFilter ? cityFilter.value : '';
        
        let url = `${API_BASE}/events/?`;
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (category) url += `category=${encodeURIComponent(category)}&`;
        if (city) url += `city=${encodeURIComponent(city)}&`;
        
        fetch(url)
            .then(res => res.json())
            .then(events => {
                if (events.length === 0) {
                    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No events found matching your search criteria.</p>`;
                    return;
                }
                grid.innerHTML = events.map(createEventCardHTML).join('');
            })
            .catch(err => {
                grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--color-danger);">Failed to search events.</p>`;
                console.error(err);
            });
    }
    
    if (searchInput) searchInput.addEventListener('input', loadFilteredEvents);
    if (categoryFilter) categoryFilter.addEventListener('change', loadFilteredEvents);
    if (cityFilter) cityFilter.addEventListener('change', loadFilteredEvents);
    
    // Initial fetch
    loadFilteredEvents();
}

// 5. EVENT DETAILS PAGE (With Reviews & Ratings - Bonus)
function initEventDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    if (!eventId) {
        window.location.href = 'events.html';
        return;
    }
    
    const container = document.getElementById('event-detail-container');
    const reviewForm = document.getElementById('add-review-form');
    const reviewListContainer = document.getElementById('reviews-list');
    const ratingBig = document.getElementById('avg-rating-value');
    const avgStars = document.getElementById('avg-stars-list');
    
    if (!container) return;
    
    let eventName = '';
    
    function fetchEventDetails() {
        fetch(`${API_BASE}/events/`)
            .then(res => res.json())
            .then(events => {
                const event = events.find(e => e.event_id === parseInt(eventId));
                if (!event) {
                    container.innerHTML = `<p style="color: var(--color-danger);">Event details not found.</p>`;
                    return;
                }
                eventName = event.event_name;
                container.innerHTML = `
                    <span class="details-badge">${event.category}</span>
                    <h1 class="details-title">${event.event_name}</h1>
                    <p style="color: var(--color-secondary); font-size: 1.1rem; margin-bottom: 2rem;">By ${event.organizer_name}</p>
                    
                    <div class="details-section">
                        <h3>Event Description</h3>
                        <p style="color: var(--text-secondary);">Join us for the most anticipated ${event.category} of the year! Experience immersive sessions, top-tier networking options, and state-of-the-art interactive modules. Complete presentation slide decks and session materials will be provided to all registered ticket holders.</p>
                    </div>
                    
                    <div class="details-section">
                        <h3>Venue & Location</h3>
                        <p style="font-weight: 600; color: white;">📍 ${event.venue}</p>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.2rem;">Location: ${event.venue_location}, ${event.venue_city} | Seating Capacity: ${event.venue_capacity} seats</p>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.2rem;">Venue Manager: ${event.venue_contact}</p>
                    </div>
                    
                    <div class="details-section">
                        <h3>Timing details</h3>
                        <p style="color: var(--text-secondary);">📅 Date: ${formatDate(event.event_date)}</p>
                        <p style="color: var(--text-secondary);">⏰ Time: ${event.event_time}</p>
                    </div>
                `;
                
                // Render Sidebar Card
                const sidebar = document.getElementById('details-sidebar-card');
                if (sidebar) {
                    sidebar.innerHTML = `
                        <h3 style="margin-bottom: 1.5rem; text-align: center; color: var(--color-secondary);">Ticket Summary</h3>
                        <div style="display:flex; justify-content:space-between; margin-bottom:1rem;">
                            <span style="color: var(--text-secondary);">Price:</span>
                            <span style="font-weight:bold; color: var(--color-success); font-size: 1.3rem;">₹${event.ticket_price}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:2rem;">
                            <span style="color: var(--text-secondary);">Availability:</span>
                            <span>${event.available_tickets} tickets left</span>
                        </div>
                        ${event.available_tickets > 0 ? `
                            <a href="booking.html?id=${event.event_id}" class="btn btn-primary" style="width: 100%; text-align: center;">Book Tickets Now</a>
                        ` : `
                            <button class="btn btn-secondary" style="width: 100%; cursor: not-allowed;" disabled>Sold Out</button>
                        `}
                    `;
                }
            })
            .catch(err => console.error(err));
    }
    
    // Reviews details
    function fetchReviews() {
        if (!reviewListContainer) return;
        fetch(`${API_BASE}/events/reviews/${eventId}/`)
            .then(res => res.json())
            .then(reviews => {
                if (reviews.length === 0) {
                    reviewListContainer.innerHTML = `<p style="color: var(--text-muted); text-align: center;">No reviews yet. Be the first to review!</p>`;
                    if (ratingBig) ratingBig.innerText = '0.0';
                    if (avgStars) avgStars.innerHTML = '☆☆☆☆☆';
                    return;
                }
                
                // Calculate average rating
                const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
                const avg = (sum / reviews.length).toFixed(1);
                if (ratingBig) ratingBig.innerText = avg;
                if (avgStars) {
                    const filled = Math.round(avg);
                    avgStars.innerHTML = '★'.repeat(filled) + '☆'.repeat(5 - filled);
                }
                
                reviewListContainer.innerHTML = reviews.map(r => `
                    <div class="review-item">
                        <div class="review-header">
                            <span style="font-weight: 600; color: var(--color-secondary);">${r.user_name}</span>
                            <span style="color: var(--text-muted);">${r.review_date}</span>
                        </div>
                        <div style="color: var(--color-warning); margin-bottom: 0.5rem;">
                            ${'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}
                        </div>
                        <p style="color: var(--text-secondary); font-size: 0.95rem;">${r.comment || ''}</p>
                    </div>
                `).join('');
            })
            .catch(err => console.error(err));
    }
    
    // Review Star click handler
    let selectedRating = 5;
    const starContainer = document.getElementById('star-select');
    if (starContainer) {
        const stars = starContainer.querySelectorAll('span');
        stars.forEach((star, idx) => {
            star.addEventListener('click', () => {
                selectedRating = idx + 1;
                stars.forEach((s, sIdx) => {
                    if (sIdx <= idx) {
                        s.classList.add('selected');
                        s.innerText = '★';
                    } else {
                        s.classList.remove('selected');
                        s.innerText = '☆';
                    }
                });
            });
        });
    }
    
    // Handle Review Form Submission
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = Auth.getCurrentUser();
            if (!user) {
                showToast('Please login to post a review', 'warning');
                return;
            }
            
            const comment = document.getElementById('review-comment').value;
            const todayStr = new Date('2026-07-19').toISOString().split('T')[0];
            
            fetch(`${API_BASE}/events/reviews/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_id: parseInt(eventId),
                    user_name: user.full_name,
                    rating: selectedRating,
                    comment: comment,
                    review_date: todayStr
                })
            })
            .then(res => {
                if (!res.ok) throw new Error('Failed to submit review');
                return res.json();
            })
            .then(data => {
                showToast('Review submitted successfully!', 'success');
                document.getElementById('review-comment').value = '';
                fetchReviews();
            })
            .catch(err => showToast(err.message, 'danger'));
        });
    }
    
    fetchEventDetails();
    fetchReviews();
}

// 6. TICKET BOOKING PAGE (With Interactive Seat Selection Layout - Bonus)
function initBooking() {
    if (!Auth.requireAuth()) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    if (!eventId) {
        window.location.href = 'events.html';
        return;
    }
    
    const eventNameEl = document.getElementById('booking-event-name');
    const ticketPriceEl = document.getElementById('booking-price-unit');
    const availTicketsEl = document.getElementById('booking-available-tickets');
    const selectedSeatsTextEl = document.getElementById('selected-seats-text');
    const numTicketsInput = document.getElementById('num-tickets');
    const totalAmountEl = document.getElementById('total-amount');
    
    const seatGrid = document.getElementById('interactive-seat-grid');
    const confirmBtn = document.getElementById('confirm-booking-btn');
    
    let ticketPrice = 0;
    let eventName = '';
    let selectedSeats = [];
    
    fetch(`${API_BASE}/events/`)
        .then(res => res.json())
        .then(events => {
            const event = events.find(e => e.event_id === parseInt(eventId));
            if (!event) {
                showToast('Event not found', 'danger');
                return;
            }
            eventName = event.event_name;
            ticketPrice = event.ticket_price;
            
            if (eventNameEl) eventNameEl.innerText = event.event_name;
            if (ticketPriceEl) ticketPriceEl.innerText = `₹${event.ticket_price}`;
            if (availTicketsEl) availTicketsEl.innerText = event.available_tickets;
            
            // Build seat selection grid (visual of 40 seats: 4 rows, 10 columns)
            if (seatGrid) {
                seatGrid.innerHTML = '';
                const rows = ['A', 'B', 'C', 'D'];
                for (let r = 0; r < rows.length; r++) {
                    for (let c = 1; c <= 10; c++) {
                        const seatId = `${rows[r]}${c}`;
                        const seatNode = document.createElement('div');
                        seatNode.className = 'seat';
                        seatNode.title = `Seat ${seatId}`;
                        
                        // Fake a few occupied seats randomly for visuals
                        if (c % 4 === 0 && r % 2 === 0) {
                            seatNode.classList.add('occupied');
                        }
                        
                        seatNode.addEventListener('click', () => {
                            if (seatNode.classList.contains('occupied')) return;
                            
                            if (seatNode.classList.contains('selected')) {
                                seatNode.classList.remove('selected');
                                selectedSeats = selectedSeats.filter(s => s !== seatId);
                            } else {
                                seatNode.classList.add('selected');
                                selectedSeats.push(seatId);
                            }
                            
                            // Update ticket inputs and totals
                            if (selectedSeatsTextEl) {
                                selectedSeatsTextEl.innerText = selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None';
                            }
                            if (numTicketsInput) {
                                numTicketsInput.value = selectedSeats.length;
                            }
                            updateTotal();
                        });
                        seatGrid.appendChild(seatNode);
                    }
                }
            }
        });
        
    function updateTotal() {
        const count = selectedSeats.length;
        const total = count * ticketPrice;
        if (totalAmountEl) {
            totalAmountEl.innerText = `₹${total}`;
        }
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            const user = Auth.getCurrentUser();
            if (selectedSeats.length === 0) {
                showToast('Please select at least one seat from the seating map', 'warning');
                return;
            }
            
            const todayStr = new Date('2026-07-19').toISOString().split('T')[0];
            
            fetch(`${API_BASE}/bookings/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_name: user.full_name,
                    event_name: eventName,
                    booking_date: todayStr,
                    number_of_tickets: selectedSeats.length,
                    booking_status: 'Pending' // Initial state
                })
            })
            .then(res => {
                if (!res.ok) return res.json().then(d => { throw new Error(d.error || 'Failed to book tickets') });
                return res.json();
            })
            .then(booking => {
                showToast('Booking initiated. Redirecting to payment screen...', 'success');
                // Store seats in session to render in ticket summary
                sessionStorage.setItem(`booking_seats_${booking.booking_id}`, selectedSeats.join(', '));
                setTimeout(() => {
                    window.location.href = `payment.html?booking_id=${booking.booking_id}`;
                }, 1000);
            })
            .catch(err => showToast(err.message, 'danger'));
        });
    }
}

// 7. PAYMENT PAGE (With QR Code Generation - Bonus)
function initPayment() {
    if (!Auth.requireAuth()) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('booking_id');
    if (!bookingId) {
        window.location.href = 'index.html';
        return;
    }
    
    const user = Auth.getCurrentUser();
    const eventNameEl = document.getElementById('payment-event-name');
    const ticketsEl = document.getElementById('payment-tickets-count');
    const amountEl = document.getElementById('payment-total-amount');
    const paymentForm = document.getElementById('payment-form');
    const receiptBox = document.getElementById('payment-receipt-box');
    const qrCodeContainer = document.getElementById('ticket-qr-code');
    
    let bookingAmount = 0;
    let eventName = '';
    let ticketCount = 0;
    
    // Fetch bookings to get matching details
    fetch(`${API_BASE}/bookings/`)
        .then(res => res.json())
        .then(bookings => {
            const booking = bookings.find(b => b.booking_id === parseInt(bookingId));
            if (!booking) {
                showToast('Booking details not found', 'danger');
                return;
            }
            
            eventName = booking.event_name;
            ticketCount = booking.number_of_tickets;
            bookingAmount = booking.total_amount;
            
            if (eventNameEl) eventNameEl.innerText = booking.event_name;
            if (ticketsEl) ticketsEl.innerText = booking.number_of_tickets;
            if (amountEl) amountEl.innerText = `₹${booking.total_amount}`;
        });
        
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const method = document.getElementById('payment-method').value;
            const txnId = 'TXN' + Math.floor(Math.random() * 900000000 + 100000000);
            const todayStr = new Date('2026-07-19').toISOString().split('T')[0];
            
            fetch(`${API_BASE}/payments/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    booking_id: parseInt(bookingId),
                    user_name: user.full_name,
                    amount: bookingAmount,
                    payment_method: method,
                    payment_status: 'Success', // Mock successful completion
                    transaction_id: txnId,
                    payment_date: todayStr
                })
            })
            .then(res => {
                if (!res.ok) throw new Error('Payment processing failed');
                return res.json();
            })
            .then(payment => {
                showToast('Payment Successful! Ticket Confirmed.', 'success');
                
                // Hide payment form and show receipt
                paymentForm.style.display = 'none';
                if (receiptBox) {
                    receiptBox.style.display = 'block';
                    document.getElementById('receipt-txn').innerText = txnId;
                }
                
                // Generate QR Code (Bonus)
                if (qrCodeContainer) {
                    const savedSeats = sessionStorage.getItem(`booking_seats_${bookingId}`) || 'Allocated';
                    const qrData = `Eventify Ticket\nID: ${bookingId}\nUser: ${user.full_name}\nEvent: ${eventName}\nTickets: ${ticketCount}\nSeats: ${savedSeats}\nTotal: ₹${bookingAmount}\nTXN: ${txnId}`;
                    qrCodeContainer.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
                }
            })
            .catch(err => showToast(err.message, 'danger'));
        });
    }
}

// 8. BOOKING HISTORY PAGE
function initBookingHistory() {
    if (!Auth.requireAuth()) return;
    const user = Auth.getCurrentUser();
    
    const upcomingContainer = document.getElementById('upcoming-bookings');
    const pastContainer = document.getElementById('past-bookings');
    
    if (!upcomingContainer || !pastContainer) return;
    
    fetch(`${API_BASE}/bookings/?user_name=${encodeURIComponent(user.full_name)}`)
        .then(res => res.json())
        .then(bookings => {
            const today = new Date('2026-07-19');
            let upcomingHTML = '';
            let pastHTML = '';
            
            bookings.forEach(b => {
                const eventDate = new Date(b.event_date);
                const isUpcoming = eventDate >= today;
                
                const statusClass = b.booking_status === 'Confirmed' ? 'status-confirmed' : (b.booking_status === 'Pending' ? 'status-pending' : 'status-cancelled');
                
                const card = `
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 16px; margin-bottom: 1.5rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
                            <h3 style="color: var(--color-secondary);">${b.event_name}</h3>
                            <span class="status-badge ${statusClass}">${b.booking_status}</span>
                        </div>
                        <p style="color: var(--text-secondary); font-size: 0.95rem;">📅 Event Date: ${formatDate(b.event_date)} at ${b.event_time}</p>
                        <p style="color: var(--text-secondary); font-size: 0.95rem;">📍 Location: ${b.venue}</p>
                        <p style="color: var(--text-secondary); font-size: 0.95rem;">🎫 Number of Tickets: ${b.number_of_tickets} | Total Amount: ₹${b.total_amount}</p>
                        <p style="color: var(--text-secondary); font-size: 0.95rem;">🕒 Booked on: ${formatDate(b.booking_date)}</p>
                        ${b.booking_status === 'Confirmed' ? `
                            <div style="margin-top: 1rem;">
                                <a href="payment.html?booking_id=${b.booking_id}" class="btn btn-secondary" style="padding:0.4rem 1rem; font-size:0.85rem;">View QR Ticket</a>
                            </div>
                        ` : ''}
                        ${b.booking_status === 'Pending' ? `
                            <div style="margin-top: 1rem; display:flex; gap:1rem;">
                                <a href="payment.html?booking_id=${b.booking_id}" class="btn btn-primary" style="padding:0.4rem 1rem; font-size:0.85rem;">Pay Now</a>
                                <button class="btn btn-secondary" style="padding:0.4rem 1rem; font-size:0.85rem;" onclick="cancelBooking(${b.booking_id})">Cancel Booking</button>
                            </div>
                        ` : ''}
                    </div>
                `;
                
                if (isUpcoming) {
                    upcomingHTML += card;
                } else {
                    pastHTML += card;
                }
            });
            
            upcomingContainer.innerHTML = upcomingHTML || `<p style="color: var(--text-muted); text-align: center;">No upcoming booked events.</p>`;
            pastContainer.innerHTML = pastHTML || `<p style="color: var(--text-muted); text-align: center;">No past bookings.</p>`;
        });
}

// Global Cancel booking helper
window.cancelBooking = function(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    fetch(`${API_BASE}/bookings/update/${bookingId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_status: 'Cancelled' })
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to cancel booking');
        return res.json();
    })
    .then(data => {
        showToast('Booking cancelled and tickets released', 'success');
        initBookingHistory();
    })
    .catch(err => showToast(err.message, 'danger'));
};

// 9. USER DASHBOARD
function initUserDashboard() {
    if (!Auth.requireAuth(['User'])) return;
    const user = Auth.getCurrentUser();
    
    const totalBookingsVal = document.getElementById('dash-total-bookings');
    const upcomingEventsVal = document.getElementById('dash-upcoming-events');
    const totalSpendVal = document.getElementById('dash-total-spend');
    const historyTableBody = document.getElementById('dash-history-rows');
    
    fetch(`${API_BASE}/bookings/?user_name=${encodeURIComponent(user.full_name)}`)
        .then(res => res.json())
        .then(bookings => {
            const today = new Date('2026-07-19');
            let upcomingCount = 0;
            let totalSpend = 0;
            
            bookings.forEach(b => {
                if (new Date(b.event_date) >= today && b.booking_status === 'Confirmed') {
                    upcomingCount++;
                }
                if (b.booking_status === 'Confirmed') {
                    totalSpend += b.total_amount;
                }
            });
            
            if (totalBookingsVal) totalBookingsVal.innerText = bookings.length;
            if (upcomingEventsVal) upcomingEventsVal.innerText = upcomingCount;
            if (totalSpendVal) totalSpendVal.innerText = `₹${totalSpend}`;
            
            if (historyTableBody) {
                if (bookings.length === 0) {
                    historyTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No bookings yet.</td></tr>`;
                    return;
                }
                
                historyTableBody.innerHTML = bookings.map(b => {
                    const statusClass = b.booking_status === 'Confirmed' ? 'status-confirmed' : (b.booking_status === 'Pending' ? 'status-pending' : 'status-cancelled');
                    return `
                        <tr>
                            <td>${b.booking_id}</td>
                            <td>${b.event_name}</td>
                            <td>${formatDate(b.event_date)}</td>
                            <td>₹${b.total_amount}</td>
                            <td><span class="status-badge ${statusClass}">${b.booking_status}</span></td>
                        </tr>
                    `;
                }).join('');
            }
        });
}

// 10. ORGANIZER DASHBOARD
function initOrganizerDashboard() {
    if (!Auth.requireAuth(['Organizer'])) return;
    const user = Auth.getCurrentUser();
    
    const totalEventsVal = document.getElementById('org-total-events');
    const ticketsSoldVal = document.getElementById('org-tickets-sold');
    const revenueVal = document.getElementById('org-revenue');
    
    const eventsTableBody = document.getElementById('org-events-rows');
    const venueSelect = document.getElementById('event-venue');
    const addEventForm = document.getElementById('add-event-form');
    const addVenueForm = document.getElementById('add-venue-form');
    
    function loadVenues() {
        if (!venueSelect) return;
        fetch(`${API_BASE}/venues/`)
            .then(res => res.json())
            .then(venues => {
                venueSelect.innerHTML = `<option value="">Select Venue</option>` + 
                    venues.map(v => `<option value="${v.venue_name}">${v.venue_name} (Max ${v.capacity})</option>`).join('');
            });
    }
    
    function loadOrganizerData() {
        // Fetch all events
        fetch(`${API_BASE}/events/`)
            .then(res => res.json())
            .then(events => {
                // Filter events created by this organizer
                const orgEvents = events.filter(e => e.organizer_name === user.full_name);
                if (totalEventsVal) totalEventsVal.innerText = orgEvents.length;
                
                if (eventsTableBody) {
                    if (orgEvents.length === 0) {
                        eventsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No events published yet.</td></tr>`;
                    } else {
                        eventsTableBody.innerHTML = orgEvents.map(e => `
                            <tr>
                                <td>${e.event_id}</td>
                                <td>${e.event_name}</td>
                                <td>${e.category}</td>
                                <td>${formatDate(e.event_date)}</td>
                                <td>${e.available_tickets} / ₹${e.ticket_price}</td>
                                <td>
                                    <button class="btn btn-danger" style="padding:0.25rem 0.5rem; font-size:0.8rem;" onclick="deleteEvent(${e.event_id})">Delete</button>
                                </td>
                            </tr>
                        `).join('');
                    }
                }
                
                // Fetch bookings to calculate ticket sales and revenue
                fetch(`${API_BASE}/bookings/`)
                    .then(res => res.json())
                    .then(bookings => {
                        let ticketsSold = 0;
                        let revenue = 0;
                        
                        bookings.forEach(b => {
                            // Find if booking is for one of the organizer's events
                            const isOrgEvent = orgEvents.some(oe => oe.event_name === b.event_name);
                            if (isOrgEvent && b.booking_status === 'Confirmed') {
                                ticketsSold += b.number_of_tickets;
                                revenue += b.total_amount;
                            }
                        });
                        
                        if (ticketsSoldVal) ticketsSoldVal.innerText = ticketsSold;
                        if (revenueVal) revenueVal.innerText = `₹${revenue}`;
                    });
            });
    }
    
    // Add Venue
    if (addVenueForm) {
        addVenueForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const venue_name = document.getElementById('venue-name').value;
            const location = document.getElementById('venue-location').value;
            const city = document.getElementById('venue-city').value;
            const capacity = document.getElementById('venue-capacity').value;
            const contact_person = document.getElementById('venue-contact').value;
            
            fetch(`${API_BASE}/venues/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ venue_name, location, city, capacity, contact_person })
            })
            .then(res => {
                if (!res.ok) return res.json().then(d => { throw new Error(d.error || 'Failed to add venue') });
                return res.json();
            })
            .then(data => {
                showToast('Venue registered successfully!', 'success');
                addVenueForm.reset();
                loadVenues();
            })
            .catch(err => showToast(err.message, 'danger'));
        });
    }
    
    // Add Event
    if (addEventForm) {
        addEventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const event_name = document.getElementById('event-name').value;
            const category = document.getElementById('event-category').value;
            const event_date = document.getElementById('event-date').value;
            const event_time = document.getElementById('event-time').value;
            const venue = document.getElementById('event-venue').value;
            const ticket_price = document.getElementById('event-price').value;
            const available_tickets = document.getElementById('event-tickets').value;
            
            fetch(`${API_BASE}/events/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_name,
                    category,
                    organizer_name: user.full_name,
                    event_date,
                    event_time,
                    venue,
                    ticket_price: parseFloat(ticket_price),
                    available_tickets: parseInt(available_tickets)
                })
            })
            .then(res => {
                if (!res.ok) return res.json().then(d => { throw new Error(d.error || 'Failed to create event') });
                return res.json();
            })
            .then(data => {
                showToast('Event published successfully!', 'success');
                addEventForm.reset();
                loadOrganizerData();
            })
            .catch(err => showToast(err.message, 'danger'));
        });
    }
    
    window.deleteEvent = function(id) {
        if (!confirm('Are you sure you want to delete this event?')) return;
        fetch(`${API_BASE}/events/delete/${id}/`, { method: 'DELETE' })
            .then(res => {
                if (!res.ok) throw new Error('Failed to delete event');
                showToast('Event deleted successfully', 'success');
                loadOrganizerData();
            })
            .catch(err => showToast(err.message, 'danger'));
    };
    
    loadVenues();
    loadOrganizerData();
}

// 11. ADMIN DASHBOARD (Manage Users, Events, Venues, Bookings, Payments)
function initAdminDashboard() {
    if (!Auth.requireAuth(['Admin'])) return;
    
    const usersTable = document.getElementById('admin-users-rows');
    const eventsTable = document.getElementById('admin-events-rows');
    const venuesTable = document.getElementById('admin-venues-rows');
    const bookingsTable = document.getElementById('admin-bookings-rows');
    const paymentsTable = document.getElementById('admin-payments-rows');
    
    function loadAdminTables() {
        // Users Table
        fetch(`${API_BASE}/users/`)
            .then(res => res.json())
            .then(users => {
                if (usersTable) {
                    usersTable.innerHTML = users.map(u => `
                        <tr>
                            <td>${u.user_id}</td>
                            <td>${u.full_name}</td>
                            <td>${u.email}</td>
                            <td>${u.phone || ''}</td>
                            <td>${u.city || ''}</td>
                            <td>
                                <button class="btn btn-danger" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="adminDeleteUser(${u.user_id})">Delete</button>
                            </td>
                        </tr>
                    `).join('');
                }
            });
            
        // Events Table
        fetch(`${API_BASE}/events/`)
            .then(res => res.json())
            .then(events => {
                if (eventsTable) {
                    eventsTable.innerHTML = events.map(e => `
                        <tr>
                            <td>${e.event_id}</td>
                            <td>${e.event_name}</td>
                            <td>${e.category}</td>
                            <td>${e.venue}</td>
                            <td>${e.available_tickets} / ₹${e.ticket_price}</td>
                            <td>
                                <button class="btn btn-danger" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="adminDeleteEvent(${e.event_id})">Delete</button>
                            </td>
                        </tr>
                    `).join('');
                }
            });
            
        // Venues Table
        fetch(`${API_BASE}/venues/`)
            .then(res => res.json())
            .then(venues => {
                if (venuesTable) {
                    venuesTable.innerHTML = venues.map(v => `
                        <tr>
                            <td>${v.venue_id}</td>
                            <td>${v.venue_name}</td>
                            <td>${v.location}, ${v.city}</td>
                            <td>${v.capacity}</td>
                            <td>${v.contact_person}</td>
                            <td>
                                <button class="btn btn-danger" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="adminDeleteVenue(${v.venue_id})">Delete</button>
                            </td>
                        </tr>
                    `).join('');
                }
            });
            
        // Bookings Table
        fetch(`${API_BASE}/bookings/`)
            .then(res => res.json())
            .then(bookings => {
                if (bookingsTable) {
                    bookingsTable.innerHTML = bookings.map(b => {
                        const statusClass = b.booking_status === 'Confirmed' ? 'status-confirmed' : (b.booking_status === 'Pending' ? 'status-pending' : 'status-cancelled');
                        return `
                            <tr>
                                <td>${b.booking_id}</td>
                                <td>${b.user_name}</td>
                                <td>${b.event_name}</td>
                                <td>${b.number_of_tickets}</td>
                                <td>₹${b.total_amount}</td>
                                <td>
                                    <select onchange="adminUpdateBookingStatus(${b.booking_id}, this.value)" style="background:var(--bg-primary); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:0.25rem;">
                                        <option value="Confirmed" ${b.booking_status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                                        <option value="Pending" ${b.booking_status === 'Pending' ? 'selected' : ''}>Pending</option>
                                        <option value="Cancelled" ${b.booking_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                    </select>
                                </td>
                                <td>
                                    <button class="btn btn-danger" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="adminDeleteBooking(${b.booking_id})">Delete</button>
                                </td>
                            </tr>
                        `;
                    }).join('');
                }
            });
            
        // Payments Table
        fetch(`${API_BASE}/payments/`)
            .then(res => res.json())
            .then(payments => {
                if (paymentsTable) {
                    paymentsTable.innerHTML = payments.map(p => `
                        <tr>
                            <td>${p.payment_id}</td>
                            <td>${p.booking_id}</td>
                            <td>${p.user_name}</td>
                            <td>₹${p.amount}</td>
                            <td>${p.payment_method}</td>
                            <td>${p.transaction_id}</td>
                            <td><span class="status-badge ${p.payment_status === 'Success' ? 'status-success' : 'status-failed'}">${p.payment_status}</span></td>
                            <td>
                                <button class="btn btn-danger" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="adminDeletePayment(${p.payment_id})">Delete</button>
                            </td>
                        </tr>
                    `).join('');
                }
            });
    }
    
    // CRUD handlers
    window.adminDeleteUser = function(id) {
        if (!confirm('Are you sure you want to delete this user?')) return;
        fetch(`${API_BASE}/users/delete/${id}/`, { method: 'DELETE' })
            .then(() => { showToast('User deleted'); loadAdminTables(); });
    };
    window.adminDeleteEvent = function(id) {
        if (!confirm('Are you sure you want to delete this event?')) return;
        fetch(`${API_BASE}/events/delete/${id}/`, { method: 'DELETE' })
            .then(() => { showToast('Event deleted'); loadAdminTables(); });
    };
    window.adminDeleteVenue = function(id) {
        if (!confirm('Are you sure you want to delete this venue?')) return;
        fetch(`${API_BASE}/venues/delete/${id}/`, { method: 'DELETE' })
            .then(() => { showToast('Venue deleted'); loadAdminTables(); });
    };
    window.adminUpdateBookingStatus = function(id, status) {
        fetch(`${API_BASE}/bookings/update/${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking_status: status })
        })
        .then(res => {
            if (!res.ok) return res.json().then(d => { throw new Error(d.error) });
            showToast('Booking status updated');
            loadAdminTables();
        })
        .catch(err => showToast(err.message, 'danger'));
    };
    window.adminDeleteBooking = function(id) {
        if (!confirm('Delete booking? Tickets will be released.')) return;
        fetch(`${API_BASE}/bookings/delete/${id}/`, { method: 'DELETE' })
            .then(() => { showToast('Booking deleted'); loadAdminTables(); });
    };
    window.adminDeletePayment = function(id) {
        if (!confirm('Delete payment record?')) return;
        fetch(`${API_BASE}/payments/delete/${id}/`, { method: 'DELETE' })
            .then(() => { showToast('Payment deleted'); loadAdminTables(); });
    };
    
    loadAdminTables();
}
