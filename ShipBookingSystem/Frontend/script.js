const API_BASE = 'http://127.0.0.1:8000';

// Authentication Helper
const Auth = {
    getCurrentUser() {
        const user = localStorage.getItem('currentPassenger');
        return user ? JSON.parse(user) : null;
    },
    setCurrentUser(user) {
        localStorage.setItem('currentPassenger', JSON.stringify(user));
    },
    logout() {
        localStorage.removeItem('currentPassenger');
        showToast('Logged out successfully', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    },
    requireAuth(allowedRoles = []) {
        const user = this.getCurrentUser();
        if (!user) {
            showToast('Please login to book tickets', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
            return false;
        }
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            showToast('Access Denied: Admin role required', 'danger');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            return false;
        }
        return true;
    }
};

// Generic Toast Alert
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 4500);
}

// Date formatter
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

// Header Navigation Menu Injector
function renderNavbar() {
    const nav = document.getElementById('navbar-container');
    if (!nav) return;
    
    const user = Auth.getCurrentUser();
    let dashboardLink = '';
    
    if (user) {
        if (user.role === 'Admin') {
            dashboardLink = '<li><a href="admin_dashboard.html">Admin Panel</a></li>';
        } else {
            dashboardLink = '<li><a href="passenger_dashboard.html">My Dashboard</a></li>';
        }
    }
    
    nav.innerHTML = `
        <a href="index.html" class="nav-brand">🚢 OceanWave</a>
        <ul class="nav-links">
            <li><a href="index.html" id="nav-home">Home</a></li>
            <li><a href="ships.html" id="nav-ships">Vessels &amp; Routes</a></li>
            ${user ? `
                ${dashboardLink}
                <li><a href="booking_history.html">Trips</a></li>
                <li><span style="color: var(--text-secondary); font-size: 0.9rem;">Welcome, ${user.full_name}</span></li>
                <li><a href="#" class="btn btn-secondary btn-nav" id="nav-logout">Logout</a></li>
            ` : `
                <li><a href="login.html" class="btn btn-secondary btn-nav" style="padding: 0.5rem 1.2rem;">Sign In</a></li>
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
}

// Dynamic Weather Departure Status Check (Bonus Feature)
function checkWeatherAndReminders() {
    const user = Auth.getCurrentUser();
    if (!user || user.role !== 'Passenger') return;
    
    fetch(`${API_BASE}/bookings/?passenger_name=${encodeURIComponent(user.full_name)}`)
        .then(res => res.json())
        .then(bookings => {
            const today = new Date('2026-07-19'); // mocked system date
            const upcoming = bookings.find(b => b.booking_status === 'Confirmed' && new Date(b.journey_date) >= today);
            
            if (upcoming) {
                const departure = new Date(upcoming.journey_date);
                const diffTime = departure - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays >= 0 && diffDays <= 7) {
                    // Inject a weather alert banner dynamically if warning-banner container exists
                    const banner = document.getElementById('weather-reminder-banner');
                    if (banner) {
                        banner.style.display = 'flex';
                        banner.innerHTML = `
                            <span>📢 <strong>Departure Reminder:</strong> Your voyage on <strong>${upcoming.ship_name}</strong> is in ${diffDays} days (${formatDate(upcoming.journey_date)}).</span>
                            <span style="margin-left: auto; font-weight: bold; color: var(--color-success);">🌤️ Weather: Calm Seas & Clear Skies. Voyage is cleared for departure!</span>
                        `;
                    }
                    showToast(`⛵ Your upcoming voyage on ${upcoming.ship_name} departs in ${diffDays} days! Clear weather forecast.`, 'luxury');
                }
            }
        })
        .catch(err => console.error("Error checking weather", err));
}

// Page Initializer Switch
document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);
    
    if (Auth.getCurrentUser()) {
        checkWeatherAndReminders();
    }
    
    if (page === 'index.html' || page === '') {
        initHome();
    } else if (page === 'login.html') {
        initLogin();
    } else if (page === 'register.html') {
        initRegister();
    } else if (page === 'ships.html') {
        initShips();
    } else if (page === 'ship_details.html') {
        initShipDetails();
    } else if (page === 'booking.html') {
        initBooking();
    } else if (page === 'payment.html') {
        initPayment();
    } else if (page === 'booking_history.html') {
        initBookingHistory();
    } else if (page === 'passenger_dashboard.html') {
        initPassengerDashboard();
    } else if (page === 'admin_dashboard.html') {
        initAdminDashboard();
    }
});

// Helper: Make ship card html block
function makeShipCardHTML(sched) {
    return `
        <div class="ship-card">
            <div class="ship-poster-container">
                <span class="ship-category-badge">Fare: ₹${sched.fare}</span>
                <h3 style="color: var(--color-secondary); padding: 1rem; font-family: var(--font-heading); text-align: center;">${sched.ship_name}</h3>
            </div>
            <div class="ship-card-content">
                <h3 class="ship-card-title">${sched.ship_name}</h3>
                <div class="ship-meta-info">
                    <div class="ship-meta-item">🌊 Route: <span>${sched.source_port} &rarr; ${sched.destination_port}</span></div>
                    <div class="ship-meta-item">📅 Departs: <span>${formatDate(sched.departure_date)} at ${sched.departure_time}</span></div>
                    <div class="ship-meta-item">🕒 Arrives: <span>${formatDate(sched.arrival_date)} at ${sched.arrival_time}</span></div>
                </div>
                <div class="ship-price-booking">
                    <span style="font-size: 1.25rem; font-weight: bold; color: var(--color-accent);">₹${sched.fare} <span style="font-size: 0.75rem; font-weight: normal; color: var(--text-secondary);">base</span></span>
                    <a href="ship_details.html?id=${sched.schedule_id}" class="btn btn-primary" style="padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.85rem;">View Details</a>
                </div>
            </div>
        </div>
    `;
}

// 1. HOME PAGE
function initHome() {
    const grid = document.getElementById('featured-cruises-grid');
    const searchForm = document.getElementById('search-voyage-form');
    
    if (grid) {
        fetch(`${API_BASE}/schedules/`)
            .then(res => res.json())
            .then(schedules => {
                if (schedules.length === 0) {
                    grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color: var(--text-secondary);">No voyages scheduled yet.</p>`;
                    return;
                }
                grid.innerHTML = schedules.slice(0, 3).map(makeShipCardHTML).join('');
            })
            .catch(err => {
                grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:var(--color-danger);">Failed to load schedules. Ensure server is online.</p>`;
            });
    }
    
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const source = document.getElementById('source-port').value;
            const dest = document.getElementById('dest-port').value;
            window.location.href = `ships.html?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(dest)}`;
        });
    }
}

// 2. LOGIN PAGE
function initLogin() {
    const form = document.getElementById('login-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        fetch(`${API_BASE}/passengers/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(res => {
            if (!res.ok) throw new Error('Invalid credentials');
            return res.json();
        })
        .then(user => {
            Auth.setCurrentUser(user);
            showToast(`Welcome aboard, ${user.full_name}!`, 'success');
            setTimeout(() => {
                if (user.role === 'Admin') window.location.href = 'admin_dashboard.html';
                else window.location.href = 'passenger_dashboard.html';
            }, 1000);
        })
        .catch(err => showToast(err.message, 'danger'));
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
        const nationality = document.getElementById('nationality').value;
        const passport_number = document.getElementById('passport').value;
        const password = document.getElementById('password').value;
        
        fetch(`${API_BASE}/passengers/add/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name, email, phone, nationality, passport_number, password })
        })
        .then(res => {
            if (!res.ok) return res.json().then(d => { throw new Error(d.error || 'Registration failed') });
            return res.json();
        })
        .then(() => {
            showToast('Registration Successful! Please login.', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        })
        .catch(err => showToast(err.message, 'danger'));
    });
}

// 4. SHIPS LISTINGS PAGE (With Port and Date Search Filtering)
function initShips() {
    const grid = document.getElementById('ships-grid');
    if (!grid) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const sourceQuery = urlParams.get('source') || '';
    const destQuery = urlParams.get('destination') || '';
    
    const sourceInp = document.getElementById('search-source');
    const destInp = document.getElementById('search-dest');
    const dateInp = document.getElementById('search-date');
    
    if (sourceInp) sourceInp.value = sourceQuery;
    if (destInp) destInp.value = destQuery;
    
    function loadSchedules() {
        const source = sourceInp ? sourceInp.value : '';
        const dest = destInp ? destInp.value : '';
        const date = dateInp ? dateInp.value : '';
        
        let url = `${API_BASE}/schedules/?`;
        if (source) url += `source=${encodeURIComponent(source)}&`;
        if (dest) url += `destination=${encodeURIComponent(dest)}&`;
        if (date) url += `date=${encodeURIComponent(date)}&`;
        
        fetch(url)
            .then(res => res.json())
            .then(schedules => {
                if (schedules.length === 0) {
                    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No voyages matching search parameters found.</p>`;
                    return;
                }
                grid.innerHTML = schedules.map(makeShipCardHTML).join('');
            })
            .catch(err => console.error("Error loading schedules", err));
    }
    
    if (sourceInp) sourceInp.addEventListener('input', loadSchedules);
    if (destInp) destInp.addEventListener('input', loadSchedules);
    if (dateInp) dateInp.addEventListener('change', loadSchedules);
    
    loadSchedules();
}

// 5. SHIP DETAILS PAGE (Details & Reviews/Ratings)
function initShipDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const schedId = urlParams.get('id');
    if (!schedId) {
        window.location.href = 'ships.html';
        return;
    }
    
    const content = document.getElementById('ship-details-content');
    const sidebar = document.getElementById('ship-details-sidebar');
    const reviewForm = document.getElementById('ship-review-form');
    const reviewListContainer = document.getElementById('ship-reviews-list');
    const ratingBig = document.getElementById('avg-rating-value');
    const avgStars = document.getElementById('avg-stars-list');
    
    if (!content) return;
    
    let targetShipId = 0;
    
    function fetchDetails() {
        fetch(`${API_BASE}/schedules/`)
            .then(res => res.json())
            .then(schedules => {
                const sched = schedules.find(s => s.schedule_id === parseInt(schedId));
                if (!sched) {
                    content.innerHTML = `<p style="color:var(--color-danger);">Voyage details not found.</p>`;
                    return;
                }
                
                // Fetch Ship metadata
                fetch(`${API_BASE}/ships/`)
                    .then(res => res.json())
                    .then(ships => {
                        const ship = ships.find(s => s.ship_name === sched.ship_name);
                        if (!ship) return;
                        
                        targetShipId = ship.ship_id;
                        fetchReviews(ship.ship_id);
                        
                        content.innerHTML = `
                            <span class="details-header-badge">${ship.ship_type}</span>
                            <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">${ship.ship_name}</h1>
                            <p style="color: var(--color-accent); font-weight:bold; margin-bottom:2rem;">Operated by ${ship.operator_name} | Status: ${ship.status}</p>
                            
                            <div class="details-block">
                                <h3>Voyage Description</h3>
                                <p style="color: var(--text-secondary);">Set sail on the luxurious ${ship.ship_name} for a breath-taking cruise across clear waters. Enjoy premium dining halls, swimming pools, deck lounges, live bands, and luxury spas. All cabins are equipped with smart-control air conditioning, high speed Wi-Fi, and 24/7 room service.</p>
                            </div>
                            
                            <div class="details-block">
                                <h3>Voyage Itinerary</h3>
                                <p style="font-weight:bold; color: white;">🌊 ${sched.source_port} &rarr; ${sched.destination_port}</p>
                                <p style="color: var(--text-secondary); margin-top:0.3rem;">📅 Departure: ${formatDate(sched.departure_date)} at ${sched.departure_time}</p>
                                <p style="color: var(--text-secondary);">⏰ Expected Arrival: ${formatDate(sched.arrival_date)} at ${sched.arrival_time}</p>
                            </div>
                            
                            <div class="details-block">
                                <h3>Cabin Categories Available</h3>
                                <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">⭐ <strong>Economy Class:</strong> Comfortable deck cabins with sea views (Base Fare)</p>
                                <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">⭐ <strong>Deluxe Class:</strong> Spacious mid-deck suites with private balconies (1.4x fare)</p>
                                <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">⭐ <strong>Suite Class:</strong> Premium state-rooms with separate living areas and bar (2.0x fare)</p>
                                <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">⭐ <strong>Family Cabin:</strong> Inter-connected multi-room layout for up to 6 members (1.8x fare)</p>
                                <p style="color: var(--text-secondary);">⭐ <strong>VIP Cabin:</strong> Penthouse top-deck suite with private jacuzzi and butler (3.0x fare)</p>
                            </div>
                        `;
                        
                        if (sidebar) {
                            sidebar.innerHTML = `
                                <h3 style="text-align:center; color: var(--color-secondary); margin-bottom: 1.5rem;">Voyage Summary</h3>
                                <div style="display:flex; justify-content:space-between; margin-bottom: 1rem;">
                                    <span style="color: var(--text-secondary);">Base Fare:</span>
                                    <span style="color: var(--color-success); font-weight:bold; font-size: 1.4rem;">₹${sched.fare}</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; margin-bottom: 2rem;">
                                    <span style="color: var(--text-secondary);">Ship capacity:</span>
                                    <span>${ship.capacity} Passengers</span>
                                </div>
                                <a href="booking.html?id=${sched.schedule_id}" class="btn btn-luxury" style="width: 100%; text-align:center;">Book Voyage Ticket</a>
                            `;
                        }
                    });
            });
    }
    
    function fetchReviews(shipId) {
        if (!reviewListContainer) return;
        fetch(`${API_BASE}/ships/reviews/${shipId}/`)
            .then(res => res.json())
            .then(reviews => {
                if (reviews.length === 0) {
                    reviewListContainer.innerHTML = `<p style="color: var(--text-muted); text-align:center; padding: 2rem 0;">No passenger reviews posted yet.</p>`;
                    if (ratingBig) ratingBig.innerText = '0.0';
                    if (avgStars) avgStars.innerHTML = '☆☆☆☆☆';
                    return;
                }
                
                const total = reviews.reduce((acc, c) => acc + c.rating, 0);
                const avg = (total / reviews.length).toFixed(1);
                if (ratingBig) ratingBig.innerText = avg;
                if (avgStars) {
                    const stars = Math.round(avg);
                    avgStars.innerHTML = '★'.repeat(stars) + '☆'.repeat(5 - stars);
                }
                
                reviewListContainer.innerHTML = reviews.map(r => `
                    <div class="review-feed-item">
                        <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:0.5rem;">
                            <span style="font-weight:bold; color:var(--color-secondary);">${r.passenger_name}</span>
                            <span style="color:var(--text-muted);">${r.review_date}</span>
                        </div>
                        <div style="color: var(--color-accent); margin-bottom:0.5rem;">
                            ${'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}
                        </div>
                        <p style="color: var(--text-secondary); font-size:0.95rem;">${r.comment || ''}</p>
                    </div>
                `).join('');
            });
    }
    
    // Star rating picker
    let selectedRating = 5;
    const ratingSelector = document.getElementById('rating-selector');
    if (ratingSelector) {
        const stars = ratingSelector.querySelectorAll('span');
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
    
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = Auth.getCurrentUser();
            if (!user) {
                showToast('Please sign in to submit a review', 'warning');
                return;
            }
            
            const comment = document.getElementById('review-comment').value;
            const todayStr = new Date('2026-07-19').toISOString().split('T')[0];
            
            fetch(`${API_BASE}/ships/reviews/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ship_id: targetShipId,
                    passenger_name: user.full_name,
                    rating: selectedRating,
                    comment: comment,
                    review_date: todayStr
                })
            })
            .then(res => {
                if (!res.ok) throw new Error('Failed to post review');
                return res.json();
            })
            .then(() => {
                showToast('Review submitted successfully!', 'success');
                document.getElementById('review-comment').value = '';
                fetchReviews(targetShipId);
            })
            .catch(err => showToast(err.message, 'danger'));
        });
    }
    
    fetchDetails();
}

// 6. JOURNEY BOOKING PAGE (With Visual Cabin Seating Map Layout - Bonus)
function initBooking() {
    if (!Auth.requireAuth()) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const schedId = urlParams.get('id');
    if (!schedId) {
        window.location.href = 'ships.html';
        return;
    }
    
    const shipNameEl = document.getElementById('book-ship-name');
    const routeEl = document.getElementById('book-route');
    const dateEl = document.getElementById('book-date');
    const fareUnitEl = document.getElementById('book-fare-unit');
    const cabinClassSelect = document.getElementById('cabin-class-select');
    const totalAmountEl = document.getElementById('total-fare-amount');
    
    const deckPlanContainer = document.getElementById('interactive-deck-plan');
    const submitBtn = document.getElementById('confirm-booking-btn');
    
    let baseFare = 0;
    let shipName = '';
    let sourcePort = '';
    let destPort = '';
    let journeyDate = '';
    let selectedCabin = '';
    
    fetch(`${API_BASE}/schedules/`)
        .then(res => res.json())
        .then(schedules => {
            const sched = schedules.find(s => s.schedule_id === parseInt(schedId));
            if (!sched) {
                showToast('Schedule not found', 'danger');
                return;
            }
            
            baseFare = sched.fare;
            shipName = sched.ship_name;
            sourcePort = sched.source_port;
            destPort = sched.destination_port;
            journeyDate = sched.departure_date;
            
            if (shipNameEl) shipNameEl.innerText = sched.ship_name;
            if (routeEl) routeEl.innerText = `${sched.source_port} ➔ ${sched.destination_port}`;
            if (dateEl) dateEl.innerText = formatDate(sched.departure_date);
            if (fareUnitEl) fareUnitEl.innerText = `₹${sched.fare}`;
            
            generateDeckPlan();
            updateTotal();
        });
        
    function generateDeckPlan() {
        if (!deckPlanContainer) return;
        deckPlanContainer.innerHTML = '';
        
        const cabinType = cabinClassSelect.value;
        let prefix = 'E'; // Economy
        if (cabinType === 'Deluxe') prefix = 'D';
        else if (cabinType === 'Suite') prefix = 'S';
        else if (cabinType === 'Family Cabin') prefix = 'F';
        else if (cabinType === 'VIP Cabin') prefix = 'V';
        
        const rows = ['1', '2', '3'];
        for (let r = 0; r < rows.length; r++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'deck-row';
            for (let c = 1; c <= 6; c++) {
                const cabinNum = `${prefix}-${rows[r]}${c}`;
                const cabinNode = document.createElement('div');
                cabinNode.className = 'cabin-node';
                cabinNode.innerText = cabinNum;
                cabinNode.title = `Cabin ${cabinNum}`;
                
                // Mock a few occupied cabins dynamically
                if (c === 3 && r === 1) {
                    cabinNode.classList.add('occupied');
                    cabinNode.innerText = 'X';
                }
                
                cabinNode.addEventListener('click', () => {
                    if (cabinNode.classList.contains('occupied')) return;
                    
                    // Clear previous selection
                    const active = deckPlanContainer.querySelector('.cabin-node.selected');
                    if (active) active.classList.remove('selected');
                    
                    if (selectedCabin === cabinNum) {
                        selectedCabin = '';
                    } else {
                        cabinNode.classList.add('selected');
                        selectedCabin = cabinNum;
                    }
                    updateTotal();
                });
                rowDiv.appendChild(cabinNode);
            }
            deckPlanContainer.appendChild(rowDiv);
        }
    }
    
    function updateTotal() {
        const cabinType = cabinClassSelect.value;
        let mult = 1.0;
        if (cabinType === 'Deluxe') mult = 1.4;
        else if (cabinType === 'Suite') mult = 2.0;
        else if (cabinType === 'Family Cabin') mult = 1.8;
        else if (cabinType === 'VIP Cabin') mult = 3.0;
        
        const total = baseFare * mult;
        if (totalAmountEl) {
            totalAmountEl.innerText = `₹${total.toFixed(0)}`;
        }
    }
    
    if (cabinClassSelect) {
        cabinClassSelect.addEventListener('change', () => {
            selectedCabin = '';
            generateDeckPlan();
            updateTotal();
        });
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const user = Auth.getCurrentUser();
            if (!selectedCabin) {
                showToast('Please select a cabin code from the deck plan layout', 'warning');
                return;
            }
            
            fetch(`${API_BASE}/bookings/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    passenger_name: user.full_name,
                    ship_name: shipName,
                    cabin_type: cabinClassSelect.value,
                    journey_date: journeyDate,
                    source_port: sourcePort,
                    destination_port: destPort
                })
            })
            .then(res => {
                if (!res.ok) return res.json().then(d => { throw new Error(d.error || 'Failed to make booking') });
                return res.json();
            })
            .then(booking => {
                showToast('Cabin reserved successfully. Forwarding to check-out...', 'success');
                sessionStorage.setItem(`cabin_code_${booking.booking_id}`, selectedCabin);
                setTimeout(() => {
                    window.location.href = `payment.html?booking_id=${booking.booking_id}`;
                }, 1000);
            })
            .catch(err => showToast(err.message, 'danger'));
        });
    }
}

// 7. PAYMENT SECURE PAGE (Checkout & QR Boarding Pass - Bonus)
function initPayment() {
    if (!Auth.requireAuth()) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('booking_id');
    if (!bookingId) {
        window.location.href = 'index.html';
        return;
    }
    
    const user = Auth.getCurrentUser();
    
    const shipNameEl = document.getElementById('pay-ship-name');
    const cabinEl = document.getElementById('pay-cabin');
    const routeEl = document.getElementById('pay-route');
    const dateEl = document.getElementById('pay-date');
    const amountEl = document.getElementById('pay-total-amount');
    
    const paymentForm = document.getElementById('pay-form');
    const passBox = document.getElementById('boarding-pass-receipt');
    const qrPassImg = document.getElementById('boarding-pass-qr');
    
    let bookingAmount = 0;
    let shipName = '';
    let cabinType = '';
    let routePorts = '';
    let journeyDate = '';
    
    fetch(`${API_BASE}/bookings/`)
        .then(res => res.json())
        .then(bookings => {
            const booking = bookings.find(b => b.booking_id === parseInt(bookingId));
            if (!booking) {
                showToast('Booking details not found', 'danger');
                return;
            }
            
            bookingAmount = booking.total_amount;
            shipName = booking.ship_name;
            cabinType = booking.cabin_type;
            routePorts = `${booking.source_port} to ${booking.destination_port}`;
            journeyDate = booking.journey_date;
            
            const savedCabin = sessionStorage.getItem(`cabin_code_${bookingId}`) || 'Allocated';
            
            if (shipNameEl) shipNameEl.innerText = booking.ship_name;
            if (cabinEl) cabinEl.innerText = `${booking.cabin_type} (${savedCabin})`;
            if (routeEl) routeEl.innerText = `${booking.source_port} ➔ ${booking.destination_port}`;
            if (dateEl) dateEl.innerText = formatDate(booking.journey_date);
            if (amountEl) amountEl.innerText = `₹${booking.total_amount}`;
        });
        
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const method = document.getElementById('pay-method').value;
            const txnId = 'TXN' + Math.floor(Math.random() * 900000000 + 100000000);
            const todayStr = new Date('2026-07-19').toISOString().split('T')[0];
            
            fetch(`${API_BASE}/payments/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    booking_id: parseInt(bookingId),
                    passenger_name: user.full_name,
                    amount: bookingAmount,
                    payment_method: method,
                    payment_status: 'Success',
                    transaction_id: txnId,
                    payment_date: todayStr
                })
            })
            .then(res => {
                if (!res.ok) throw new Error('Transaction failed');
                return res.json();
            })
            .then(() => {
                showToast('Payment Successful! Boarding Pass Issued.', 'success');
                paymentForm.style.display = 'none';
                if (passBox) {
                    passBox.style.display = 'block';
                    document.getElementById('receipt-txn').innerText = txnId;
                }
                
                // QR Boarding Pass code (Bonus)
                if (qrPassImg) {
                    const savedCabin = sessionStorage.getItem(`cabin_code_${bookingId}`) || 'Allocated';
                    const passData = `OceanWave BoardingPass\nID: ${bookingId}\nName: ${user.full_name}\nPassport: ${user.passport_number || 'N/A'}\nShip: ${shipName}\nCabin: ${cabinType} (${savedCabin})\nRoute: ${routePorts}\nDate: ${journeyDate}\nTXN: ${txnId}`;
                    qrPassImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(passData)}`;
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
    
    const upcomingGrid = document.getElementById('upcoming-trips');
    const completedGrid = document.getElementById('completed-trips');
    
    if (!upcomingGrid || !completedGrid) return;
    
    fetch(`${API_BASE}/bookings/?passenger_name=${encodeURIComponent(user.full_name)}`)
        .then(res => res.json())
        .then(bookings => {
            const today = new Date('2026-07-19');
            let upcomingHTML = '';
            let completedHTML = '';
            
            bookings.forEach(b => {
                const depDate = new Date(b.journey_date);
                const isUpcoming = depDate >= today;
                
                const statusClass = b.booking_status === 'Confirmed' ? 'status-confirmed' : (b.booking_status === 'Waiting' ? 'status-waiting' : 'status-cancelled');
                
                const card = `
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 16px; margin-bottom: 1.5rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                            <h3 style="color:var(--color-secondary);">${b.ship_name}</h3>
                            <span class="status-tag ${statusClass}">${b.booking_status}</span>
                        </div>
                        <p style="color: var(--text-secondary); font-size:0.95rem;">🌊 Voyage: ${b.source_port} to ${b.destination_port}</p>
                        <p style="color: var(--text-secondary); font-size:0.95rem;">📅 Date: ${formatDate(b.journey_date)}</p>
                        <p style="color: var(--text-secondary); font-size:0.95rem;">🚪 Cabin Class: ${b.cabin_type} | Total Fare: ₹${b.total_amount}</p>
                        ${b.booking_status === 'Confirmed' ? `
                            <div style="margin-top:1rem;">
                                <a href="payment.html?booking_id=${b.booking_id}" class="btn btn-secondary" style="padding:0.4rem 1rem; font-size:0.85rem;">Boarding Pass QR</a>
                            </div>
                        ` : ''}
                        ${b.booking_status === 'Waiting' ? `
                            <div style="margin-top:1rem; display:flex; gap:1rem;">
                                <a href="payment.html?booking_id=${b.booking_id}" class="btn btn-primary" style="padding:0.4rem 1rem; font-size:0.85rem;">Complete Payment</a>
                                <button class="btn btn-secondary" style="padding:0.4rem 1rem; font-size:0.85rem;" onclick="cancelVoyage(${b.booking_id})">Cancel Trip</button>
                            </div>
                        ` : ''}
                    </div>
                `;
                
                if (isUpcoming) upcomingHTML += card;
                else completedHTML += card;
            });
            
            upcomingGrid.innerHTML = upcomingHTML || `<p style="color: var(--text-muted); text-align:center;">No upcoming scheduled voyages.</p>`;
            completedGrid.innerHTML = completedHTML || `<p style="color: var(--text-muted); text-align:center;">No past completed journeys.</p>`;
        });
}

// Global Cancel voyage handler
window.cancelVoyage = function(bookingId) {
    if (!confirm('Are you sure you want to cancel this ticket?')) return;
    
    fetch(`${API_BASE}/bookings/update/${bookingId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_status: 'Cancelled' })
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to cancel ticket');
        showToast('Ticket cancelled and cabin released', 'success');
        initBookingHistory();
    })
    .catch(err => showToast(err.message, 'danger'));
};

// 9. PASSENGER DASHBOARD
function initPassengerDashboard() {
    if (!Auth.requireAuth(['Passenger'])) return;
    const user = Auth.getCurrentUser();
    
    const countBookings = document.getElementById('pass-total-bookings');
    const countUpcoming = document.getElementById('pass-upcoming-trips');
    const countSpent = document.getElementById('pass-total-spent');
    const tableBody = document.getElementById('pass-history-rows');
    
    fetch(`${API_BASE}/bookings/?passenger_name=${encodeURIComponent(user.full_name)}`)
        .then(res => res.json())
        .then(bookings => {
            const today = new Date('2026-07-19');
            let upcoming = 0;
            let totalSpent = 0;
            
            bookings.forEach(b => {
                if (new Date(b.journey_date) >= today && b.booking_status === 'Confirmed') {
                    upcoming++;
                }
                if (b.booking_status === 'Confirmed') {
                    totalSpent += b.total_amount;
                }
            });
            
            if (countBookings) countBookings.innerText = bookings.length;
            if (countUpcoming) countUpcoming.innerText = upcoming;
            if (countSpent) countSpent.innerText = `₹${totalSpent.toFixed(0)}`;
            
            if (tableBody) {
                if (bookings.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No cruise logs yet.</td></tr>`;
                    return;
                }
                tableBody.innerHTML = bookings.map(b => {
                    const statusClass = b.booking_status === 'Confirmed' ? 'status-confirmed' : (b.booking_status === 'Waiting' ? 'status-waiting' : 'status-cancelled');
                    return `
                        <tr>
                            <td>${b.booking_id}</td>
                            <td>${b.ship_name}</td>
                            <td>${formatDate(b.journey_date)}</td>
                            <td>₹${b.total_amount}</td>
                            <td><span class="status-tag ${statusClass}">${b.booking_status}</span></td>
                        </tr>
                    `;
                }).join('');
            }
        });
}

// 10. ADMIN DASHBOARD
function initAdminDashboard() {
    if (!Auth.requireAuth(['Admin'])) return;
    
    const passengersTable = document.getElementById('admin-passengers-rows');
    const shipsTable = document.getElementById('admin-ships-rows');
    const schedulesTable = document.getElementById('admin-schedules-rows');
    const bookingsTable = document.getElementById('admin-bookings-rows');
    const paymentsTable = document.getElementById('admin-payments-rows');
    
    const addShipForm = document.getElementById('add-ship-form');
    const addScheduleForm = document.getElementById('add-schedule-form');
    const shipSelect = document.getElementById('sched-ship-select');
    
    function loadShipDropdown() {
        if (!shipSelect) return;
        fetch(`${API_BASE}/ships/`)
            .then(res => res.json())
            .then(ships => {
                shipSelect.innerHTML = `<option value="">Select Vessel</option>` + 
                    ships.map(s => `<option value="${s.ship_name}">${s.ship_name} (${s.ship_type})</option>`).join('');
            });
    }
    
    function loadAdminTables() {
        // Passengers Table
        fetch(`${API_BASE}/passengers/`)
            .then(res => res.json())
            .then(passengers => {
                if (passengersTable) {
                    passengersTable.innerHTML = passengers.map(p => `
                        <tr>
                            <td>${p.passenger_id}</td>
                            <td>${p.full_name}</td>
                            <td>${p.email}</td>
                            <td>${p.phone || ''}</td>
                            <td>${p.nationality || ''}</td>
                            <td>
                                <button class="btn btn-danger" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="adminDeletePassenger(${p.passenger_id})">Delete</button>
                            </td>
                        </tr>
                    `).join('');
                }
            });
            
        // Ships Table
        fetch(`${API_BASE}/ships/`)
            .then(res => res.json())
            .then(ships => {
                if (shipsTable) {
                    shipsTable.innerHTML = ships.map(s => `
                        <tr>
                            <td>${s.ship_id}</td>
                            <td>${s.ship_name}</td>
                            <td>${s.ship_type}</td>
                            <td>${s.capacity} Pax</td>
                            <td><span class="status-tag ${s.status === 'Active' ? 'status-active' : (s.status === 'Maintenance' ? 'status-maintenance' : 'status-inactive')}">${s.status}</span></td>
                            <td>
                                <button class="btn btn-danger" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="adminDeleteShip(${s.ship_id})">Delete</button>
                            </td>
                        </tr>
                    `).join('');
                }
            });
            
        // Schedules Table
        fetch(`${API_BASE}/schedules/`)
            .then(res => res.json())
            .then(schedules => {
                if (schedulesTable) {
                    schedulesTable.innerHTML = schedules.map(sc => `
                        <tr>
                            <td>${sc.schedule_id}</td>
                            <td>${sc.ship_name}</td>
                            <td>${sc.source_port} &rarr; ${sc.destination_port}</td>
                            <td>${formatDate(sc.departure_date)} at ${sc.departure_time}</td>
                            <td>₹${sc.fare}</td>
                            <td>
                                <button class="btn btn-danger" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="adminDeleteSchedule(${sc.schedule_id})">Delete</button>
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
                        const statusClass = b.booking_status === 'Confirmed' ? 'status-confirmed' : (b.booking_status === 'Waiting' ? 'status-waiting' : 'status-cancelled');
                        return `
                            <tr>
                                <td>${b.booking_id}</td>
                                <td>${b.passenger_name}</td>
                                <td>${b.ship_name}</td>
                                <td>${b.cabin_type}</td>
                                <td>₹${b.total_amount}</td>
                                <td>
                                    <select onchange="adminUpdateBookingStatus(${b.booking_id}, this.value)" style="background:var(--bg-primary); color:white; border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:0.25rem;">
                                        <option value="Confirmed" ${b.booking_status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                                        <option value="Waiting" ${b.booking_status === 'Waiting' ? 'selected' : ''}>Waiting</option>
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
                            <td>${p.passenger_name}</td>
                            <td>₹${p.amount}</td>
                            <td>${p.payment_method}</td>
                            <td>${p.transaction_id}</td>
                            <td><span class="status-tag ${p.payment_status === 'Success' ? 'status-success' : 'status-failed'}">${p.payment_status}</span></td>
                            <td>
                                <button class="btn btn-danger" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="adminDeletePayment(${p.payment_id})">Delete</button>
                            </td>
                        </tr>
                    `).join('');
                }
            });
    }
    
    // Add Ship Submit
    if (addShipForm) {
        addShipForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const ship_name = document.getElementById('ship-name').value;
            const ship_type = document.getElementById('ship-type').value;
            const capacity = document.getElementById('ship-capacity').value;
            const operator_name = document.getElementById('ship-operator').value;
            const status = document.getElementById('ship-status').value;
            
            fetch(`${API_BASE}/ships/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ship_name, ship_type, capacity, operator_name, status })
            })
            .then(res => {
                if (!res.ok) return res.json().then(d => { throw new Error(d.error) });
                return res.json();
            })
            .then(() => {
                showToast('Vessel created successfully', 'success');
                addShipForm.reset();
                loadAdminTables();
                loadShipDropdown();
            })
            .catch(err => showToast(err.message, 'danger'));
        });
    }
    
    // Add Schedule Submit
    if (addScheduleForm) {
        addScheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const ship_name = document.getElementById('sched-ship-select').value;
            const source_port = document.getElementById('sched-source').value;
            const destination_port = document.getElementById('sched-dest').value;
            const departure_date = document.getElementById('sched-dep-date').value;
            const departure_time = document.getElementById('sched-dep-time').value;
            const arrival_date = document.getElementById('sched-arr-date').value;
            const arrival_time = document.getElementById('sched-arr-time').value;
            const fare = document.getElementById('sched-fare').value;
            
            fetch(`${API_BASE}/schedules/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ship_name, source_port, destination_port, departure_date, departure_time, arrival_date, arrival_time, fare })
            })
            .then(res => {
                if (!res.ok) return res.json().then(d => { throw new Error(d.error) });
                return res.json();
            })
            .then(() => {
                showToast('Voyage schedule published successfully', 'success');
                addScheduleForm.reset();
                loadAdminTables();
            })
            .catch(err => showToast(err.message, 'danger'));
        });
    }
    
    // Deletes
    window.adminDeletePassenger = function(id) {
        if (!confirm('Delete passenger?')) return;
        fetch(`${API_BASE}/passengers/delete/${id}/`, { method: 'DELETE' }).then(() => { showToast('Passenger deleted'); loadAdminTables(); });
    };
    window.adminDeleteShip = function(id) {
        if (!confirm('Delete vessel?')) return;
        fetch(`${API_BASE}/ships/delete/${id}/`, { method: 'DELETE' }).then(() => { showToast('Ship deleted'); loadAdminTables(); loadShipDropdown(); });
    };
    window.adminDeleteSchedule = function(id) {
        if (!confirm('Delete voyage schedule?')) return;
        fetch(`${API_BASE}/schedules/delete/${id}/`, { method: 'DELETE' }).then(() => { showToast('Schedule deleted'); loadAdminTables(); });
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
        if (!confirm('Delete booking?')) return;
        fetch(`${API_BASE}/bookings/delete/${id}/`, { method: 'DELETE' }).then(() => { showToast('Booking deleted'); loadAdminTables(); });
    };
    window.adminDeletePayment = function(id) {
        if (!confirm('Delete payment ledger log?')) return;
        fetch(`${API_BASE}/payments/delete/${id}/`, { method: 'DELETE' }).then(() => { showToast('Payment deleted'); loadAdminTables(); });
    };
    
    loadShipDropdown();
    loadAdminTables();
}
