// Core Configuration
const API_BASE = window.location.origin;

// State Management
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let wishlist = [];
let compareCart = JSON.parse(localStorage.getItem("compareCart")) || [];

// Page Initializer
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initAuthUI();
    initComparisonDrawer();
    
    // Page-specific initializers based on present DOM elements
    if (document.getElementById("featured-properties-grid")) {
        initHomePage();
    }
    if (document.getElementById("properties-grid")) {
        initPropertiesPage();
    }
    if (document.getElementById("details-container")) {
        initPropertyDetailsPage();
    }
    if (document.getElementById("booking-page-form")) {
        initBookingsPage();
    }
    if (document.getElementById("inquiry-page-form")) {
        initInquiriesPage();
    }
    if (document.getElementById("welcome-message")) {
        initCustomerDashboard();
    }
    if (document.getElementById("admin-properties-table-body")) {
        initAdminDashboard();
    }
    if (document.getElementById("login-form")) {
        initLoginForm();
    }
    if (document.getElementById("register-form")) {
        initRegisterForm();
    }
});

// ==================== THEME MANAGEMENT ====================
function initTheme() {
    const themeToggleBtn = document.getElementById("theme-toggle");
    if (!themeToggleBtn) return;
    
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
        themeToggleBtn.innerHTML = `<i class="fa-solid fa-sun"></i>`;
    }
    
    themeToggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
        const isDark = document.body.classList.contains("dark-theme");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        themeToggleBtn.innerHTML = isDark ? `<i class="fa-solid fa-sun"></i>` : `<i class="fa-solid fa-moon"></i>`;
    });
}

// ==================== AUTHENTICATION UI ====================
function initAuthUI() {
    const authButtons = document.getElementById("auth-buttons");
    const userMenu = document.getElementById("user-menu");
    const userDisplayName = document.getElementById("user-display-name");
    
    const navBookingsLink = document.getElementById("nav-bookings-link");
    const navInquiriesLink = document.getElementById("nav-inquiries-link");
    const navDashboardLi = document.getElementById("nav-dashboard-li");
    const navDashboardLink = document.getElementById("nav-dashboard-link");
    
    if (currentUser) {
        if (authButtons) authButtons.style.display = "none";
        if (userMenu) {
            userMenu.style.display = "inline-flex";
            if (userDisplayName) userDisplayName.textContent = currentUser.full_name.split(" ")[0];
        }
        
        // Show dashboard link in nav
        if (navDashboardLi && navDashboardLink) {
            navDashboardLi.style.display = "inline-block";
            navDashboardLink.href = currentUser.role === "admin" ? "admin_dashboard.html" : "customer_dashboard.html";
        }
        
        // Set user drop-down menu links
        const userDashboardBtn = document.getElementById("user-dashboard-btn");
        if (userDashboardBtn) {
            userDashboardBtn.href = currentUser.role === "admin" ? "admin_dashboard.html" : "customer_dashboard.html";
        }
        
        // Load wishlist from database if customer
        if (currentUser.role === "customer") {
            fetchWishlist();
        }
    } else {
        if (authButtons) authButtons.style.display = "flex";
        if (userMenu) userMenu.style.display = "none";
        if (navDashboardLi) navDashboardLi.style.display = "none";
    }
    
    // Dropdown toggle
    if (userMenu) {
        userMenu.addEventListener("click", (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById("user-dropdown");
            dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
        });
        
        document.addEventListener("click", () => {
            const dropdown = document.getElementById("user-dropdown");
            if (dropdown) dropdown.style.display = "none";
        });
    }
    
    // Logout button handler
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("currentUser");
            showToast("Logged out successfully");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        });
    }
}

// Fetch wishlist properties from server
async function fetchWishlist() {
    if (!currentUser || currentUser.role !== "customer") return;
    try {
        const res = await fetch(`${API_BASE}/favorites/${currentUser.customer_id}/`);
        if (res.ok) {
            const data = await res.json();
            wishlist = data.map(p => p.property_id);
            // Refresh property cards favorited icons if present
            updateFavoriteIcons();
        }
    } catch (err) {
        console.error("Error fetching wishlist", err);
    }
}

function updateFavoriteIcons() {
    document.querySelectorAll(".card-favorite-btn").forEach(btn => {
        const propId = parseInt(btn.dataset.id);
        if (wishlist.includes(propId)) {
            btn.classList.add("active");
            btn.innerHTML = `<i class="fa-solid fa-heart"></i>`;
        } else {
            btn.classList.remove("active");
            btn.innerHTML = `<i class="fa-regular fa-heart"></i>`;
        }
    });
}

// ==================== TOAST NOTIFICATION HELPERS ====================
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = `<i class="fa-solid fa-circle-check"></i>`;
    if (type === "error") {
        icon = `<i class="fa-solid fa-circle-exclamation"></i>`;
    }
    
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = "slideIn 0.3s reverse forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== HOME PAGE VIEW ====================
async function initHomePage() {
    try {
        const res = await fetch(`${API_BASE}/properties/`);
        if (res.ok) {
            const properties = await res.json();
            renderFeaturedProperties(properties.slice(0, 3)); // show first 3
        } else {
            showFeaturedPropertiesError();
        }
    } catch (err) {
        showFeaturedPropertiesError();
    }
    
    // Home quick search form submission
    const searchForm = document.getElementById("home-search-form");
    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const location = document.getElementById("search-location").value.trim();
            const type = document.getElementById("search-type").value;
            const price = document.getElementById("search-price").value;
            
            // Redirect to listings page with params
            const params = new URLSearchParams();
            if (location) params.append("location", location);
            if (type) params.append("type", type);
            if (price) params.append("price", price);
            
            window.location.href = `properties.html?${params.toString()}`;
        });
    }
}

function renderFeaturedProperties(properties) {
    const grid = document.getElementById("featured-properties-grid");
    grid.innerHTML = "";
    
    if (properties.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">No property listings available.</div>`;
        return;
    }
    
    properties.forEach(p => {
        grid.appendChild(createPropertyCard(p));
    });
    updateFavoriteIcons();
}

function showFeaturedPropertiesError() {
    const grid = document.getElementById("featured-properties-grid");
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--status-cancelled);"><i class="fa-solid fa-circle-exclamation fa-2x"></i><p style="margin-top:1rem;">Could not connect to server. Check server connection.</p></div>`;
}

// Helper to format currency in Indian format
function formatPrice(num) {
    if (num >= 10000000) {
        return `₹ ${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) {
        return `₹ ${(num / 100000).toFixed(2)} Lakh`;
    }
    return `₹ ${num.toLocaleString('en-IN')}`;
}

// Helper to create a single card DOM element
function createPropertyCard(p) {
    const card = document.createElement("div");
    card.className = "property-card";
    
    const isFavorited = wishlist.includes(p.property_id);
    const inCompare = compareCart.some(item => item.property_id === p.property_id);
    
    card.innerHTML = `
        <div class="card-img-wrapper">
            <img src="${p.image_url}" alt="${p.property_title}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';">
            <span class="badge badge-${p.status.toLowerCase()}">${p.status}</span>
            <button class="card-favorite-btn ${isFavorited ? 'active' : ''}" data-id="${p.property_id}" title="Save to Favorites">
                <i class="${isFavorited ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
        </div>
        <div class="card-content">
            <div class="card-type">${p.property_type}</div>
            <h3 class="card-title">${p.property_title}</h3>
            <div class="card-location"><i class="fa-solid fa-location-dot"></i> ${p.location}</div>
            <div class="card-specs">
                <div class="spec-item"><i class="fa-solid fa-bed"></i> <span>${p.bedrooms || 0} Beds</span></div>
                <div class="spec-item"><i class="fa-solid fa-bath"></i> <span>${p.bathrooms || 0} Baths</span></div>
                <div class="spec-item"><i class="fa-solid fa-ruler-combined"></i> <span>${p.area_sqft} sqft</span></div>
            </div>
            <div class="card-footer">
                <div class="card-price">${formatPrice(p.price)}</div>
                <div style="display:flex; flex-direction:column; gap:0.5rem; align-items:flex-end;">
                    <a href="property_details.html?id=${p.property_id}" class="btn btn-outline" style="padding:0.4rem 0.8rem; font-size:0.8rem;">Details</a>
                    <label class="compare-checkbox-label">
                        <input type="checkbox" class="compare-checkbox" data-id="${p.property_id}" ${inCompare ? 'checked' : ''}>
                        Compare
                    </label>
                </div>
            </div>
        </div>
    `;
    
    // Bind click events directly
    card.querySelector(".card-favorite-btn").addEventListener("click", (e) => {
        e.preventDefault();
        toggleFavorite(p.property_id);
    });
    
    card.querySelector(".compare-checkbox").addEventListener("change", (e) => {
        toggleCompare(p, e.target.checked);
    });
    
    return card;
}

// Toggle Wishlist Status
async function toggleFavorite(propertyId) {
    if (!currentUser) {
        showToast("Please log in to save properties", "error");
        setTimeout(() => window.location.href = "login.html", 1500);
        return;
    }
    
    const isFavorited = wishlist.includes(propertyId);
    try {
        if (isFavorited) {
            // Delete from database
            const res = await fetch(`${API_BASE}/favorites/delete/${currentUser.customer_id}/${propertyId}/`, {
                method: "DELETE"
            });
            if (res.ok) {
                wishlist = wishlist.filter(id => id !== propertyId);
                showToast("Property removed from wishlist");
            }
        } else {
            // Add to database
            const res = await fetch(`${API_BASE}/favorites/add/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customer_id: currentUser.customer_id, property_id: propertyId })
            });
            if (res.ok) {
                wishlist.push(propertyId);
                showToast("Property added to wishlist!");
            }
        }
        updateFavoriteIcons();
        
        // If on Customer Dashboard page, refresh saved listing view
        if (document.getElementById("saved-properties-grid")) {
            loadCustomerSavedProperties();
        }
    } catch (err) {
        showToast("Error processing wishlist action", "error");
    }
}

// ==================== PROPERTIES LISTING PAGE ====================
let allProperties = [];

async function initPropertiesPage() {
    const grid = document.getElementById("properties-grid");
    
    try {
        const res = await fetch(`${API_BASE}/properties/`);
        if (res.ok) {
            allProperties = await res.json();
            
            // Check for home search redirect params
            const params = new URLSearchParams(window.location.search);
            const initLocation = params.get("location") || "";
            const initType = params.get("type") || "";
            const initPrice = params.get("price") || "";
            
            if (initLocation) document.getElementById("filter-location").value = initLocation;
            if (initType) document.getElementById("filter-type").value = initType;
            if (initPrice) document.getElementById("filter-max-price").value = initPrice;
            
            // Apply filtering logic
            filterAndRenderProperties();
            
            // Register input events
            document.querySelectorAll("#filter-form input, #filter-form select").forEach(elem => {
                elem.addEventListener("input", filterAndRenderProperties);
            });
            
            document.getElementById("filter-reset-btn").addEventListener("click", () => {
                document.getElementById("filter-form").reset();
                filterAndRenderProperties();
            });
        } else {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--status-cancelled);">Could not retrieve property database.</div>`;
        }
    } catch (err) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--status-cancelled);">Error: Unable to connect to backend APIs.</div>`;
    }
}

function filterAndRenderProperties() {
    const location = document.getElementById("filter-location").value.toLowerCase().trim();
    const type = document.getElementById("filter-type").value;
    const minPrice = parseFloat(document.getElementById("filter-min-price").value) || 0;
    const maxPrice = parseFloat(document.getElementById("filter-max-price").value) || Infinity;
    const bedrooms = document.getElementById("filter-bedrooms").value;
    const status = document.getElementById("filter-status").value;
    
    const filtered = allProperties.filter(p => {
        const matchLoc = !location || p.location.toLowerCase().includes(location) || p.property_title.toLowerCase().includes(location);
        const matchType = !type || p.property_type === type;
        const matchMinPrice = p.price >= minPrice;
        const matchMaxPrice = p.price <= maxPrice;
        const matchBeds = !bedrooms || (bedrooms === "4" ? p.bedrooms >= 4 : p.bedrooms === parseInt(bedrooms));
        const matchStatus = !status || p.status === status;
        
        return matchLoc && matchType && matchMinPrice && matchMaxPrice && matchBeds && matchStatus;
    });
    
    const grid = document.getElementById("properties-grid");
    grid.innerHTML = "";
    
    document.getElementById("listings-count").textContent = `Showing ${filtered.length} of ${allProperties.length} listings`;
    
    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 5rem; color: var(--text-muted);"><i class="fa-solid fa-house-circle-xmark fa-3x"></i><p style="margin-top: 1rem; font-weight: 500;">No properties match your filter preferences.</p></div>`;
        return;
    }
    
    filtered.forEach(p => {
        grid.appendChild(createPropertyCard(p));
    });
    updateFavoriteIcons();
}

// ==================== PROPERTY DETAILS VIEW ====================
let currentProperty = null;
let mapInstance = null;

async function initPropertyDetailsPage() {
    const params = new URLSearchParams(window.location.search);
    const propId = parseInt(params.get("id"));
    const container = document.getElementById("details-container");
    
    if (!propId) {
        container.innerHTML = `<div style="text-align:center; padding:5rem; color:var(--status-cancelled);"><i class="fa-solid fa-circle-exclamation fa-3x"></i><p style="margin-top:1rem;">Invalid property selection.</p></div>`;
        return;
    }
    
    try {
        // Fetch properties list
        const res = await fetch(`${API_BASE}/properties/`);
        if (res.ok) {
            const properties = await res.json();
            currentProperty = properties.find(p => p.property_id === propId);
            
            if (!currentProperty) {
                container.innerHTML = `<div style="text-align:center; padding:5rem; color:var(--status-cancelled);"><i class="fa-solid fa-circle-exclamation fa-3x"></i><p style="margin-top:1rem;">Property listing not found.</p></div>`;
                return;
            }
            
            // Fetch agents
            const agentRes = await fetch(`${API_BASE}/agents/`);
            let agents = [];
            if (agentRes.ok) {
                agents = await agentRes.json();
            }
            
            // Choose an agent matching their specialization or pick default
            let assignedAgent = agents[0] || {
                agent_name: "Anil Kumar",
                phone: "9876541230",
                email: "anil@realestate.com",
                experience: 8,
                specialization: "Residential Properties"
            };
            
            if (currentProperty.property_type === "Commercial" && agents.length > 2) {
                assignedAgent = agents[2]; // Rajesh Khanna
            } else if (agents.length > 1) {
                assignedAgent = agents[1]; // Sarah D'Souza
            }
            
            renderPropertyDetails(currentProperty, assignedAgent, agents);
            
            // Initialize Leaflet map
            initMap(currentProperty.location, currentProperty.property_title);
            
            // Initialize gallery image carousel
            initGalleryCarousel();
            
        } else {
            container.innerHTML = `<div style="text-align:center; padding:5rem; color:var(--status-cancelled);"><p>Error connecting to database views.</p></div>`;
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div style="text-align:center; padding:5rem; color:var(--status-cancelled);"><p>Unable to fetch listing details. Backend might be down.</p></div>`;
    }
}

function renderPropertyDetails(p, agent, allAgents) {
    const container = document.getElementById("details-container");
    const isFavorited = wishlist.includes(p.property_id);
    
    // We will generate multiple sample images for the premium carousel slide
    const images = [
        p.image_url,
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=600&q=80"
    ];
    
    container.innerHTML = `
        <div class="details-grid">
            <!-- Main Content Area -->
            <div>
                <!-- Premium Sliding Gallery -->
                <div class="gallery-container">
                    <button class="carousel-btn carousel-btn-prev" id="prev-slide"><i class="fa-solid fa-angle-left"></i></button>
                    <button class="carousel-btn carousel-btn-next" id="next-slide"><i class="fa-solid fa-angle-right"></i></button>
                    <div class="gallery-carousel" id="carousel-track">
                        ${images.map(img => `
                            <div class="gallery-slide">
                                <img src="${img}" alt="${p.property_title}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';">
                            </div>
                        `).join("")}
                    </div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <span class="card-type" style="font-size:1rem;">${p.property_type}</span>
                        <h1>${p.property_title}</h1>
                        <div class="details-location"><i class="fa-solid fa-location-dot"></i> ${p.location}</div>
                    </div>
                    <button class="btn btn-outline" onclick="toggleFavorite(${p.property_id})" style="border-radius:50%; width:50px; height:50px; display:inline-flex; align-items:center; justify-content:center; font-size:1.3rem;">
                        <i class="${isFavorited ? 'fa-solid active' : 'fa-regular'}" style="color:${isFavorited ? '#ef4444' : 'inherit'}" id="details-fav-icon">♥</i>
                    </button>
                </div>

                <div class="details-price-badge">
                    <div class="details-price">${formatPrice(p.price)}</div>
                    <span class="badge badge-${p.status.toLowerCase()}" style="position:static; font-size:1rem; padding:0.5rem 1rem;">${p.status}</span>
                </div>

                <div class="details-specs">
                    <div class="details-spec-item">
                        <span class="details-spec-val">${p.bedrooms || 0}</span>
                        <span class="details-spec-lbl">Bedrooms</span>
                    </div>
                    <div class="details-spec-item">
                        <span class="details-spec-val">${p.bathrooms || 0}</span>
                        <span class="details-spec-lbl">Bathrooms</span>
                    </div>
                    <div class="details-spec-item">
                        <span class="details-spec-val">${p.area_sqft}</span>
                        <span class="details-spec-lbl">SqFt Area</span>
                    </div>
                    <div class="details-spec-item">
                        <span class="details-spec-val">₹ ${(p.price / p.area_sqft).toFixed(0)}</span>
                        <span class="details-spec-lbl">Price / SqFt</span>
                    </div>
                </div>

                <div class="details-section">
                    <h3>Description</h3>
                    <p style="color: var(--text-muted);">This luxury real estate offering boasts premium architecture, open floor design, modern bathroom layouts, and a prime location in one of India's fast-growing business centers. Features include top-tier utility fittings, abundant natural light, and immediate access to transit links.</p>
                </div>

                <div class="details-section">
                    <h3>Key Features</h3>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.75rem; color:var(--text-muted);">
                        <div><i class="fa-solid fa-circle-check" style="color:var(--primary);"></i> 24/7 Security & CCTV Monitoring</div>
                        <div><i class="fa-solid fa-circle-check" style="color:var(--primary);"></i> Covered Reserved Parking Space</div>
                        <div><i class="fa-solid fa-circle-check" style="color:var(--primary);"></i> Premium Hardwood & Marble Flooring</div>
                        <div><i class="fa-solid fa-circle-check" style="color:var(--primary);"></i> Fully Air Conditioned Rooms</div>
                        <div><i class="fa-solid fa-circle-check" style="color:var(--primary);"></i> Modern Modular Kitchen Layout</div>
                        <div><i class="fa-solid fa-circle-check" style="color:var(--primary);"></i> Beautiful Terrace / Garden Deck</div>
                    </div>
                </div>

                <div class="details-section">
                    <h3>Geographic Location</h3>
                    <div class="details-map" id="map"></div>
                </div>
            </div>

            <!-- Sidebar Forms & Agent Card -->
            <div class="details-sidebar">
                
                <!-- Agent Info Card -->
                <div class="sidebar-widget">
                    <h3>Listing Agent</h3>
                    <div class="agent-profile">
                        <div class="agent-avatar">${agent.agent_name.split(" ").map(n=>n[0]).join("")}</div>
                        <div class="agent-info">
                            <h4>${agent.agent_name}</h4>
                            <p>${agent.specialization}</p>
                            <p style="font-weight:600; color:var(--primary);">${agent.experience} Years Experience</p>
                        </div>
                    </div>
                    <div style="font-size:0.9rem; display:flex; flex-direction:column; gap:0.5rem; color:var(--text-muted);">
                        <div><i class="fa-solid fa-phone"></i> ${agent.phone}</div>
                        <div><i class="fa-solid fa-envelope"></i> ${agent.email}</div>
                    </div>
                </div>

                <!-- Visit Scheduling Widget -->
                <div class="sidebar-widget">
                    <h3>Schedule Property Visit</h3>
                    <form id="widget-booking-form" style="display:flex; flex-direction:column; gap:1rem; margin-top:1rem;">
                        <div class="form-group">
                            <label for="w-book-name">Your Name</label>
                            <input type="text" id="w-book-name" required value="${currentUser ? currentUser.full_name : ''}">
                        </div>
                        <div class="form-group">
                            <label for="w-book-date">Visit Date</label>
                            <input type="date" id="w-book-date" required>
                        </div>
                        <div class="form-group">
                            <label for="w-book-time">Visit Time</label>
                            <input type="time" id="w-book-time" required>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width:100%;">Book Visit Visit</button>
                    </form>
                </div>

                <!-- Inquiry Widget -->
                <div class="sidebar-widget">
                    <h3>Send Inquiry</h3>
                    <form id="widget-inquiry-form" style="display:flex; flex-direction:column; gap:1rem; margin-top:1rem;">
                        <div class="form-group">
                            <label for="w-inq-name">Your Name</label>
                            <input type="text" id="w-inq-name" required value="${currentUser ? currentUser.full_name : ''}">
                        </div>
                        <div class="form-group">
                            <label for="w-inq-msg">Message</label>
                            <textarea id="w-inq-msg" required placeholder="Is this property open for negotiations?"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width:100%;">Submit Message</button>
                    </form>
                </div>

            </div>
        </div>
    `;
    
    // Bind form submissions
    document.getElementById("widget-booking-form").addEventListener("submit", (e) => {
        e.preventDefault();
        submitVisitBooking({
            customer_name: document.getElementById("w-book-name").value.trim(),
            property_title: p.property_title,
            visit_date: document.getElementById("w-book-date").value,
            visit_time: document.getElementById("w-book-time").value,
            agent_name: agent.agent_name,
            booking_status: "Scheduled"
        });
    });

    document.getElementById("widget-inquiry-form").addEventListener("submit", (e) => {
        e.preventDefault();
        submitInquiry({
            customer_name: document.getElementById("w-inq-name").value.trim(),
            property_title: p.property_title,
            message: document.getElementById("w-inq-msg").value.trim(),
            inquiry_date: new Date().toISOString().split("T")[0],
            response_status: "Pending"
        });
    });
}

// Leaflet Map Initialization
function initMap(locationName, title) {
    // Map default coordinates mapping for tech hub locations
    let coords = [12.9716, 77.5946]; // Bangalore default
    
    const locLower = locationName.toLowerCase();
    if (locLower.includes("hyderabad")) {
        coords = [17.3850, 78.4867];
    } else if (locLower.includes("chennai")) {
        coords = [13.0827, 80.2707];
    } else if (locLower.includes("mumbai")) {
        coords = [19.0760, 72.8777];
    } else if (locLower.includes("delhi")) {
        coords = [28.7041, 77.1025];
    }
    
    try {
        mapInstance = L.map('map').setView(coords, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);
        
        L.marker(coords).addTo(mapInstance)
            .bindPopup(`<b>${title}</b><br><i class="fa-solid fa-location-dot"></i> ${locationName}`)
            .openPopup();
    } catch (err) {
        console.error("Map initialization failed", err);
    }
}

// Image Carousel Logic
function initGalleryCarousel() {
    const track = document.getElementById("carousel-track");
    const prevBtn = document.getElementById("prev-slide");
    const nextBtn = document.getElementById("next-slide");
    if (!track || !prevBtn || !nextBtn) return;
    
    let currentIndex = 0;
    const slidesCount = track.children.length;
    
    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    
    prevBtn.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + slidesCount) % slidesCount;
        updateCarousel();
    });
    
    nextBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % slidesCount;
        updateCarousel();
    });
    
    // Auto-slide every 5 seconds
    setInterval(() => {
        currentIndex = (currentIndex + 1) % slidesCount;
        updateCarousel();
    }, 5000);
}

// Post booking helper
async function submitVisitBooking(payload) {
    if (!currentUser) {
        showToast("Log in to book a visit", "error");
        setTimeout(() => window.location.href = "login.html", 1000);
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/bookings/add/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            showToast("Visit scheduled successfully! You can manage it in your dashboard.");
            document.getElementById("widget-booking-form")?.reset();
        } else {
            const err = await res.json();
            showToast(err.error || "Booking failed", "error");
        }
    } catch (err) {
        showToast("Network error. Please try again.", "error");
    }
}

// Post inquiry helper
async function submitInquiry(payload) {
    if (!currentUser) {
        showToast("Log in to submit inquiries", "error");
        setTimeout(() => window.location.href = "login.html", 1000);
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/inquiries/add/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            showToast("Inquiry submitted successfully!");
            document.getElementById("widget-inquiry-form")?.reset();
        } else {
            const err = await res.json();
            showToast(err.error || "Inquiry failed", "error");
        }
    } catch (err) {
        showToast("Network error. Please try again.", "error");
    }
}

// ==================== STANDALONE BOOKINGS PAGE ====================
async function initBookingsPage() {
    const propSelect = document.getElementById("book-property-title");
    const agentSelect = document.getElementById("book-agent-name");
    
    // Fetch properties and agents
    try {
        const [propRes, agentRes] = await Promise.all([
            fetch(`${API_BASE}/properties/`),
            fetch(`${API_BASE}/agents/`)
        ]);
        
        if (propRes.ok) {
            const properties = await propRes.json();
            properties.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.property_title;
                opt.textContent = `${p.property_title} (${p.location})`;
                propSelect.appendChild(opt);
            });
        }
        
        if (agentRes.ok) {
            const agents = await agentRes.json();
            agents.forEach(a => {
                const opt = document.createElement("option");
                opt.value = a.agent_name;
                opt.textContent = `${a.agent_name} (${a.specialization})`;
                agentSelect.appendChild(opt);
            });
        }
    } catch (err) {
        console.error(err);
    }
    
    // Pre-fill fields if user logged in
    if (currentUser) {
        document.getElementById("book-customer-name").value = currentUser.full_name;
        loadBookingsHistory();
    }
    
    document.getElementById("booking-page-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            customer_name: document.getElementById("book-customer-name").value.trim(),
            property_title: propSelect.value,
            visit_date: document.getElementById("book-date").value,
            visit_time: document.getElementById("book-time").value,
            agent_name: agentSelect.value,
            booking_status: "Scheduled"
        };
        
        await submitVisitBooking(payload);
        if (currentUser) {
            loadBookingsHistory();
        }
    });
}

async function loadBookingsHistory() {
    const container = document.getElementById("booking-page-history-container");
    if (!currentUser) return;
    
    try {
        const res = await fetch(`${API_BASE}/bookings/?customer_name=${encodeURIComponent(currentUser.full_name)}`);
        if (res.ok) {
            const bookings = await res.json();
            container.innerHTML = "";
            
            if (bookings.length === 0) {
                container.innerHTML = `<div style="text-align:center; padding:1.5rem; color:var(--text-muted);">No visits scheduled yet.</div>`;
                return;
            }
            
            bookings.forEach(b => {
                const card = document.createElement("div");
                card.style.cssText = `
                    background-color: var(--bg-surface-elevated);
                    border: 1px solid var(--border-color);
                    padding: 1rem;
                    border-radius: var(--radius-sm);
                `;
                
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                        <h4 style="font-weight:600; font-size:0.95rem;">${b.property_title}</h4>
                        <span class="status-tag status-${b.booking_status.toLowerCase()}">${b.booking_status}</span>
                    </div>
                    <div style="font-size:0.8rem; color:var(--text-muted); display:flex; flex-direction:column; gap:0.25rem;">
                        <div><i class="fa-solid fa-calendar"></i> ${b.visit_date} at ${b.visit_time}</div>
                        <div><i class="fa-solid fa-user-tie"></i> Agent: ${b.agent_name}</div>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

// ==================== STANDALONE INQUIRIES PAGE ====================
async function initInquiriesPage() {
    const propSelect = document.getElementById("inq-property-title");
    
    try {
        const propRes = await fetch(`${API_BASE}/properties/`);
        if (propRes.ok) {
            const properties = await propRes.json();
            properties.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.property_title;
                opt.textContent = p.property_title;
                propSelect.appendChild(opt);
            });
        }
    } catch (err) {
        console.error(err);
    }
    
    if (currentUser) {
        document.getElementById("inq-customer-name").value = currentUser.full_name;
        loadInquiriesHistory();
    }
    
    document.getElementById("inquiry-page-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            customer_name: document.getElementById("inq-customer-name").value.trim(),
            property_title: propSelect.value,
            message: document.getElementById("inq-message").value.trim(),
            inquiry_date: new Date().toISOString().split("T")[0],
            response_status: "Pending"
        };
        
        await submitInquiry(payload);
        if (currentUser) {
            loadInquiriesHistory();
        }
    });
}

async function loadInquiriesHistory() {
    const container = document.getElementById("inquiry-page-history-container");
    if (!currentUser) return;
    
    try {
        const res = await fetch(`${API_BASE}/inquiries/?customer_name=${encodeURIComponent(currentUser.full_name)}`);
        if (res.ok) {
            const inquiries = await res.json();
            container.innerHTML = "";
            
            if (inquiries.length === 0) {
                container.innerHTML = `<div style="text-align:center; padding:1.5rem; color:var(--text-muted);">No inquiries submitted yet.</div>`;
                return;
            }
            
            inquiries.forEach(inq => {
                const card = document.createElement("div");
                card.style.cssText = `
                    background-color: var(--bg-surface-elevated);
                    border: 1px solid var(--border-color);
                    padding: 1rem;
                    border-radius: var(--radius-sm);
                `;
                
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                        <h4 style="font-weight:600; font-size:0.95rem;">${inq.property_title}</h4>
                        <span class="status-tag status-${inq.response_status.toLowerCase()}">${inq.response_status}</span>
                    </div>
                    <p style="font-size:0.85rem; color:var(--text-main); margin-bottom:0.5rem; border-left:2px solid var(--border-color); padding-left:0.5rem;">"${inq.message}"</p>
                    <div style="font-size:0.75rem; color:var(--text-muted);"><i class="fa-solid fa-clock"></i> Sent on ${inq.inquiry_date}</div>
                `;
                container.appendChild(card);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

// ==================== CUSTOMER DASHBOARD MANAGEMENT ====================
function initCustomerDashboard() {
    if (!currentUser || currentUser.role !== "customer") {
        window.location.href = "login.html";
        return;
    }
    
    document.getElementById("welcome-message").textContent = `Welcome, ${currentUser.full_name}!`;
    document.getElementById("user-display-name").textContent = currentUser.full_name.split(" ")[0];
    
    // Tab toggling triggers
    document.querySelectorAll(".dashboard-sidebar button").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".dashboard-sidebar button").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".dashboard-tab-content").forEach(tab => tab.classList.remove("active"));
            
            btn.classList.add("active");
            document.getElementById(btn.dataset.tab).classList.add("active");
        });
    });
    
    // Load initial listings
    loadCustomerSavedProperties();
    loadCustomerBookings();
    loadCustomerInquiries();
    
    // Profile settings pre-fill
    document.getElementById("prof-name").value = currentUser.full_name;
    document.getElementById("prof-email").value = currentUser.email;
    document.getElementById("prof-phone").value = currentUser.phone;
    document.getElementById("prof-city").value = currentUser.city;
    
    document.getElementById("profile-update-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            full_name: document.getElementById("prof-name").value.trim(),
            email: document.getElementById("prof-email").value.trim(),
            phone: document.getElementById("prof-phone").value.trim(),
            city: document.getElementById("prof-city").value.trim(),
            password: document.getElementById("prof-password").value
        };
        
        try {
            const res = await fetch(`${API_BASE}/customers/update/${currentUser.customer_id}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                // Update local storage object
                const updatedUser = { ...currentUser, ...payload };
                localStorage.setItem("currentUser", JSON.stringify(updatedUser));
                currentUser = updatedUser;
                showToast("Account details updated successfully!");
                document.getElementById("welcome-message").textContent = `Welcome, ${currentUser.full_name}!`;
                document.getElementById("user-display-name").textContent = currentUser.full_name.split(" ")[0];
            } else {
                showToast("Failed to update profile", "error");
            }
        } catch (err) {
            showToast("Network connection error", "error");
        }
    });
}

async function loadCustomerSavedProperties() {
    const grid = document.getElementById("saved-properties-grid");
    const badge = document.getElementById("saved-count-badge");
    try {
        const res = await fetch(`${API_BASE}/favorites/${currentUser.customer_id}/`);
        if (res.ok) {
            const properties = await res.json();
            grid.innerHTML = "";
            badge.textContent = `${properties.length} Saved`;
            
            if (properties.length === 0) {
                grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No properties saved yet. <a href="properties.html" style="color: var(--primary); font-weight: 600;">Browse listings</a> to add favorites.</div>`;
                return;
            }
            
            properties.forEach(p => {
                grid.appendChild(createPropertyCard(p));
            });
            updateFavoriteIcons();
            
            // Also populate the Purchased/Rented properties list (e.g. status is Sold or Rented)
            const purchasedGrid = document.getElementById("purchased-properties-grid");
            purchasedGrid.innerHTML = "";
            const purchased = properties.filter(p => p.status === "Sold" || p.status === "Rented");
            
            if (purchased.length === 0) {
                purchasedGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No purchased or rented listings recorded.</div>`;
            } else {
                purchased.forEach(p => {
                    purchasedGrid.appendChild(createPropertyCard(p));
                });
            }
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadCustomerBookings() {
    const body = document.getElementById("bookings-table-body");
    try {
        const res = await fetch(`${API_BASE}/bookings/?customer_name=${encodeURIComponent(currentUser.full_name)}`);
        if (res.ok) {
            const bookings = await res.json();
            body.innerHTML = "";
            
            if (bookings.length === 0) {
                body.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No bookings scheduled yet.</td></tr>`;
                return;
            }
            
            bookings.forEach(b => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${b.booking_id}</td>
                    <td><strong>${b.property_title}</strong></td>
                    <td>${b.agent_name}</td>
                    <td>${b.visit_date}</td>
                    <td>${b.visit_time}</td>
                    <td><span class="status-tag status-${b.booking_status.toLowerCase()}">${b.booking_status}</span></td>
                    <td>
                        ${b.booking_status === "Scheduled" ? 
                          `<button class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.75rem; border-color:#ef4444; color:#ef4444;" onclick="cancelBooking(${b.booking_id}, '${b.customer_name}', '${b.property_title}', '${b.visit_date}', '${b.visit_time}', '${b.agent_name}')">Cancel</button>` : 
                          `<span style="color:var(--text-muted); font-size:0.8rem;">-</span>`}
                    </td>
                `;
                body.appendChild(tr);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

async function cancelBooking(id, cust, title, date, time, agent) {
    if (!confirm("Are you sure you want to cancel this visit booking?")) return;
    try {
        const res = await fetch(`${API_BASE}/bookings/update/${id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                customer_name: cust,
                property_title: title,
                visit_date: date,
                visit_time: time,
                agent_name: agent,
                booking_status: "Cancelled"
            })
        });
        if (res.ok) {
            showToast("Booking cancelled successfully");
            loadCustomerBookings();
        } else {
            showToast("Failed to cancel booking", "error");
        }
    } catch (err) {
        showToast("Error processing cancellation request", "error");
    }
}

async function loadCustomerInquiries() {
    const body = document.getElementById("inquiries-table-body");
    try {
        const res = await fetch(`${API_BASE}/inquiries/?customer_name=${encodeURIComponent(currentUser.full_name)}`);
        if (res.ok) {
            const inquiries = await res.json();
            body.innerHTML = "";
            
            if (inquiries.length === 0) {
                body.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No inquiries submitted yet.</td></tr>`;
                return;
            }
            
            inquiries.forEach(inq => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${inq.inquiry_id}</td>
                    <td><strong>${inq.property_title}</strong></td>
                    <td><em>"${inq.message}"</em></td>
                    <td>${inq.inquiry_date}</td>
                    <td><span class="status-tag status-${inq.response_status.toLowerCase()}">${inq.response_status}</span></td>
                `;
                body.appendChild(tr);
            });
        }
    } catch (err) {
        console.error(err);
    }
}


// ==================== ADMIN DASHBOARD CONTROL ====================
async function initAdminDashboard() {
    if (!currentUser || currentUser.role !== "admin") {
        window.location.href = "login.html";
        return;
    }
    
    // Tab switching
    document.querySelectorAll(".dashboard-sidebar button").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".dashboard-sidebar button").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".dashboard-tab-content").forEach(tab => tab.classList.remove("active"));
            
            btn.classList.add("active");
            document.getElementById(btn.dataset.tab).classList.add("active");
        });
    });
    
    // Load lists
    loadAdminProperties();
    loadAdminAgents();
    loadAdminBookings();
    loadAdminInquiries();
    loadAdminCustomers();
    
    // Wire Modals triggers
    document.getElementById("admin-add-property-btn").addEventListener("click", () => {
        document.getElementById("admin-property-form").reset();
        document.getElementById("form-property-id").value = "";
        document.getElementById("property-modal-title").textContent = "Create Property Listing";
        openAdminModal("property-modal-overlay");
    });
    
    document.getElementById("admin-add-agent-btn").addEventListener("click", () => {
        document.getElementById("admin-agent-form").reset();
        document.getElementById("form-agent-id").value = "";
        document.getElementById("agent-modal-title").textContent = "Add Property Agent";
        openAdminModal("agent-modal-overlay");
    });
    
    document.getElementById("admin-add-customer-btn").addEventListener("click", () => {
        document.getElementById("admin-customer-form").reset();
        document.getElementById("form-customer-id").value = "";
        document.getElementById("customer-password-group").style.display = "block";
        document.getElementById("customer-modal-title").textContent = "Create Customer Profile";
        openAdminModal("customer-modal-overlay");
    });
    
    // Submit forms
    document.getElementById("admin-property-form").addEventListener("submit", saveAdminProperty);
    document.getElementById("admin-agent-form").addEventListener("submit", saveAdminAgent);
    document.getElementById("admin-customer-form").addEventListener("submit", saveAdminCustomer);
    document.getElementById("admin-booking-update-form").addEventListener("submit", saveAdminBookingStatus);
    document.getElementById("admin-inquiry-update-form").addEventListener("submit", saveAdminInquiryStatus);
}

function openAdminModal(id) {
    document.getElementById(id).classList.add("open");
}
function closeAdminModal(id) {
    document.getElementById(id).classList.remove("open");
}
// Make close utility global for HTML button triggers
window.closeAdminModal = closeAdminModal;

// CRUD: PROPERTIES
async function loadAdminProperties() {
    const body = document.getElementById("admin-properties-table-body");
    try {
        const res = await fetch(`${API_BASE}/properties/`);
        if (res.ok) {
            const properties = await res.json();
            body.innerHTML = "";
            properties.forEach(p => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${p.property_id}</td>
                    <td><strong>${p.property_title}</strong></td>
                    <td>${p.property_type}</td>
                    <td>${p.location}</td>
                    <td>₹ ${p.price.toLocaleString('en-IN')}</td>
                    <td><span class="status-tag status-${p.status.toLowerCase()}">${p.status}</span></td>
                    <td>
                        <button class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="editAdminProperty(${p.property_id})"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.75rem; border-color:#ef4444; color:#ef4444;" onclick="deleteAdminProperty(${p.property_id})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                body.appendChild(tr);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

async function saveAdminProperty(e) {
    e.preventDefault();
    const id = document.getElementById("form-property-id").value;
    const payload = {
        property_title: document.getElementById("form-property-title").value.trim(),
        property_type: document.getElementById("form-property-type").value,
        location: document.getElementById("form-property-location").value.trim(),
        price: parseFloat(document.getElementById("form-property-price").value),
        bedrooms: parseInt(document.getElementById("form-property-bedrooms").value) || 0,
        bathrooms: parseInt(document.getElementById("form-property-bathrooms").value) || 0,
        area_sqft: parseFloat(document.getElementById("form-property-area").value),
        status: document.getElementById("form-property-status").value,
        image_url: document.getElementById("form-property-image").value.trim()
    };
    
    try {
        const url = id ? `${API_BASE}/properties/update/${id}/` : `${API_BASE}/properties/add/`;
        const method = id ? "PUT" : "POST";
        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            showToast("Property listing saved successfully!");
            closeAdminModal("property-modal-overlay");
            loadAdminProperties();
        } else {
            showToast("Failed to save property parameters", "error");
        }
    } catch (err) {
        showToast("Error connecting to server", "error");
    }
}

async function editAdminProperty(id) {
    try {
        const res = await fetch(`${API_BASE}/properties/`);
        if (res.ok) {
            const properties = await res.json();
            const p = properties.find(item => item.property_id === id);
            if (p) {
                document.getElementById("form-property-id").value = p.property_id;
                document.getElementById("form-property-title").value = p.property_title;
                document.getElementById("form-property-type").value = p.property_type;
                document.getElementById("form-property-location").value = p.location;
                document.getElementById("form-property-price").value = p.price;
                document.getElementById("form-property-bedrooms").value = p.bedrooms;
                document.getElementById("form-property-bathrooms").value = p.bathrooms;
                document.getElementById("form-property-area").value = p.area_sqft;
                document.getElementById("form-property-status").value = p.status;
                document.getElementById("form-property-image").value = p.image_url;
                
                document.getElementById("property-modal-title").textContent = "Edit Property Listing";
                openAdminModal("property-modal-overlay");
            }
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteAdminProperty(id) {
    if (!confirm("Are you sure you want to permanently delete this property listing?")) return;
    try {
        const res = await fetch(`${API_BASE}/properties/delete/${id}/`, {
            method: "DELETE"
        });
        if (res.ok) {
            showToast("Listing deleted successfully");
            loadAdminProperties();
        } else {
            showToast("Error deleting property", "error");
        }
    } catch (err) {
        showToast("Network error", "error");
    }
}
window.editAdminProperty = editAdminProperty;
window.deleteAdminProperty = deleteAdminProperty;

// CRUD: AGENTS
async function loadAdminAgents() {
    const body = document.getElementById("admin-agents-table-body");
    try {
        const res = await fetch(`${API_BASE}/agents/`);
        if (res.ok) {
            const agents = await res.json();
            body.innerHTML = "";
            agents.forEach(a => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${a.agent_id}</td>
                    <td><strong>${a.agent_name}</strong></td>
                    <td>${a.phone}</td>
                    <td>${a.email}</td>
                    <td>${a.experience} Yrs</td>
                    <td>${a.specialization}</td>
                    <td>
                        <button class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="editAdminAgent(${a.agent_id})"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.75rem; border-color:#ef4444; color:#ef4444;" onclick="deleteAdminAgent(${a.agent_id})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                body.appendChild(tr);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

async function saveAdminAgent(e) {
    e.preventDefault();
    const id = document.getElementById("form-agent-id").value;
    const payload = {
        agent_name: document.getElementById("form-agent-name").value.trim(),
        phone: document.getElementById("form-agent-phone").value.trim(),
        email: document.getElementById("form-agent-email").value.trim(),
        experience: parseInt(document.getElementById("form-agent-experience").value) || 0,
        specialization: document.getElementById("form-agent-specialization").value.trim()
    };
    
    try {
        const url = id ? `${API_BASE}/agents/update/${id}/` : `${API_BASE}/agents/add/`;
        const method = id ? "PUT" : "POST";
        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            showToast("Agent profile saved successfully!");
            closeAdminModal("agent-modal-overlay");
            loadAdminAgents();
        } else {
            showToast("Error details: Make sure email address is unique", "error");
        }
    } catch (err) {
        showToast("Error connecting to server", "error");
    }
}

async function editAdminAgent(id) {
    try {
        const res = await fetch(`${API_BASE}/agents/`);
        if (res.ok) {
            const agents = await res.json();
            const a = agents.find(item => item.agent_id === id);
            if (a) {
                document.getElementById("form-agent-id").value = a.agent_id;
                document.getElementById("form-agent-name").value = a.agent_name;
                document.getElementById("form-agent-phone").value = a.phone;
                document.getElementById("form-agent-experience").value = a.experience;
                document.getElementById("form-agent-email").value = a.email;
                document.getElementById("form-agent-specialization").value = a.specialization;
                
                document.getElementById("agent-modal-title").textContent = "Edit Agent profile";
                openAdminModal("agent-modal-overlay");
            }
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteAdminAgent(id) {
    if (!confirm("Are you sure you want to remove this agent from directory?")) return;
    try {
        const res = await fetch(`${API_BASE}/agents/delete/${id}/`, {
            method: "DELETE"
        });
        if (res.ok) {
            showToast("Agent deleted successfully");
            loadAdminAgents();
        } else {
            showToast("Error deleting agent record", "error");
        }
    } catch (err) {
        showToast("Network error", "error");
    }
}
window.editAdminAgent = editAdminAgent;
window.deleteAdminAgent = deleteAdminAgent;

// CRUD: BOOKINGS
async function loadAdminBookings() {
    const body = document.getElementById("admin-bookings-table-body");
    try {
        const res = await fetch(`${API_BASE}/bookings/`);
        if (res.ok) {
            const bookings = await res.json();
            body.innerHTML = "";
            bookings.forEach(b => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${b.booking_id}</td>
                    <td><strong>${b.customer_name}</strong></td>
                    <td>${b.property_title}</td>
                    <td>${b.agent_name}</td>
                    <td>${b.visit_date}</td>
                    <td>${b.visit_time}</td>
                    <td><span class="status-tag status-${b.booking_status.toLowerCase()}">${b.booking_status}</span></td>
                    <td>
                        <button class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="editAdminBookingStatus(${b.booking_id}, '${b.booking_status}')"><i class="fa-solid fa-arrows-spin"></i> Status</button>
                        <button class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.75rem; border-color:#ef4444; color:#ef4444;" onclick="deleteAdminBooking(${b.booking_id})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                body.appendChild(tr);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

let activeBookingObject = null;
async function editAdminBookingStatus(id, currentStatus) {
    try {
        const res = await fetch(`${API_BASE}/bookings/`);
        if (res.ok) {
            const bookings = await res.json();
            activeBookingObject = bookings.find(b => b.booking_id === id);
            if (activeBookingObject) {
                document.getElementById("form-booking-id").value = id;
                document.getElementById("form-booking-status").value = currentStatus;
                openAdminModal("booking-modal-overlay");
            }
        }
    } catch (err) {
        console.error(err);
    }
}

async function saveAdminBookingStatus(e) {
    e.preventDefault();
    if (!activeBookingObject) return;
    
    const id = document.getElementById("form-booking-id").value;
    const status = document.getElementById("form-booking-status").value;
    
    const payload = {
        ...activeBookingObject,
        booking_status: status
    };
    
    try {
        const res = await fetch(`${API_BASE}/bookings/update/${id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            showToast("Booking status updated successfully!");
            closeAdminModal("booking-modal-overlay");
            loadAdminBookings();
        } else {
            showToast("Failed to save booking status", "error");
        }
    } catch (err) {
        showToast("Error updating status", "error");
    }
}

async function deleteAdminBooking(id) {
    if (!confirm("Are you sure you want to cancel and delete this booking log?")) return;
    try {
        const res = await fetch(`${API_BASE}/bookings/delete/${id}/`, {
            method: "DELETE"
        });
        if (res.ok) {
            showToast("Booking record removed");
            loadAdminBookings();
        } else {
            showToast("Failed to delete booking", "error");
        }
    } catch (err) {
        showToast("Network error", "error");
    }
}
window.editAdminBookingStatus = editAdminBookingStatus;
window.deleteAdminBooking = deleteAdminBooking;

// CRUD: INQUIRIES
async function loadAdminInquiries() {
    const body = document.getElementById("admin-inquiries-table-body");
    try {
        const res = await fetch(`${API_BASE}/inquiries/`);
        if (res.ok) {
            const inquiries = await res.json();
            body.innerHTML = "";
            inquiries.forEach(inq => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${inq.inquiry_id}</td>
                    <td><strong>${inq.customer_name}</strong></td>
                    <td>${inq.property_title}</td>
                    <td><em>"${inq.message}"</em></td>
                    <td>${inq.inquiry_date}</td>
                    <td><span class="status-tag status-${inq.response_status.toLowerCase()}">${inq.response_status}</span></td>
                    <td>
                        <button class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="editAdminInquiryStatus(${inq.inquiry_id}, '${inq.response_status}')"><i class="fa-solid fa-reply"></i> Reply</button>
                        <button class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.75rem; border-color:#ef4444; color:#ef4444;" onclick="deleteAdminInquiry(${inq.inquiry_id})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                body.appendChild(tr);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

let activeInquiryObject = null;
async function editAdminInquiryStatus(id, currentStatus) {
    try {
        const res = await fetch(`${API_BASE}/inquiries/`);
        if (res.ok) {
            const inquiries = await res.json();
            activeInquiryObject = inquiries.find(inq => inq.inquiry_id === id);
            if (activeInquiryObject) {
                document.getElementById("form-inquiry-id").value = id;
                document.getElementById("form-inquiry-status").value = currentStatus;
                openAdminModal("inquiry-modal-overlay");
            }
        }
    } catch (err) {
        console.error(err);
    }
}

async function saveAdminInquiryStatus(e) {
    e.preventDefault();
    if (!activeInquiryObject) return;
    
    const id = document.getElementById("form-inquiry-id").value;
    const status = document.getElementById("form-inquiry-status").value;
    
    const payload = {
        ...activeInquiryObject,
        response_status: status
    };
    
    try {
        const res = await fetch(`${API_BASE}/inquiries/update/${id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            showToast("Inquiry status updated successfully!");
            closeAdminModal("inquiry-modal-overlay");
            loadAdminInquiries();
        } else {
            showToast("Failed to save inquiry status", "error");
        }
    } catch (err) {
        showToast("Error updating status", "error");
    }
}

async function deleteAdminInquiry(id) {
    if (!confirm("Are you sure you want to delete this customer inquiry?")) return;
    try {
        const res = await fetch(`${API_BASE}/inquiries/delete/${id}/`, {
            method: "DELETE"
        });
        if (res.ok) {
            showToast("Inquiry deleted successfully");
            loadAdminInquiries();
        } else {
            showToast("Failed to delete inquiry", "error");
        }
    } catch (err) {
        showToast("Network error", "error");
    }
}
window.editAdminInquiryStatus = editAdminInquiryStatus;
window.deleteAdminInquiry = deleteAdminInquiry;

// CRUD: CUSTOMERS
async function loadAdminCustomers() {
    const body = document.getElementById("admin-customers-table-body");
    try {
        const res = await fetch(`${API_BASE}/customers/`);
        if (res.ok) {
            const customers = await res.json();
            body.innerHTML = "";
            customers.forEach(c => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${c.customer_id}</td>
                    <td><strong>${c.full_name}</strong></td>
                    <td>${c.email}</td>
                    <td>${c.phone}</td>
                    <td>${c.city}</td>
                    <td>
                        <button class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="editAdminCustomer(${c.customer_id})"><i class="fa-solid fa-user-pen"></i></button>
                        <button class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.75rem; border-color:#ef4444; color:#ef4444;" onclick="deleteAdminCustomer(${c.customer_id})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                body.appendChild(tr);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

async function saveAdminCustomer(e) {
    e.preventDefault();
    const id = document.getElementById("form-customer-id").value;
    const payload = {
        full_name: document.getElementById("form-customer-name").value.trim(),
        email: document.getElementById("form-customer-email").value.trim(),
        phone: document.getElementById("form-customer-phone").value.trim(),
        city: document.getElementById("form-customer-city").value.trim(),
        password: document.getElementById("form-customer-password").value || "password123"
    };
    
    try {
        const url = id ? `${API_BASE}/customers/update/${id}/` : `${API_BASE}/customers/add/`;
        const method = id ? "PUT" : "POST";
        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            showToast("Customer account saved successfully!");
            closeAdminModal("customer-modal-overlay");
            loadAdminCustomers();
        } else {
            showToast("Registration failed. Ensure email address is unique.", "error");
        }
    } catch (err) {
        showToast("Error connecting to server APIs", "error");
    }
}

async function editAdminCustomer(id) {
    try {
        const res = await fetch(`${API_BASE}/customers/`);
        if (res.ok) {
            const customers = await res.json();
            const c = customers.find(item => item.customer_id === id);
            if (c) {
                document.getElementById("form-customer-id").value = c.customer_id;
                document.getElementById("form-customer-name").value = c.full_name;
                document.getElementById("form-customer-email").value = c.email;
                document.getElementById("form-customer-phone").value = c.phone;
                document.getElementById("form-customer-city").value = c.city;
                document.getElementById("form-customer-password").value = c.password;
                
                document.getElementById("customer-password-group").style.display = "none"; // Hide password field on edit to avoid leakage
                document.getElementById("customer-modal-title").textContent = "Edit Customer profile";
                openAdminModal("customer-modal-overlay");
            }
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteAdminCustomer(id) {
    if (!confirm("Are you sure you want to permanently delete this customer profile and access?")) return;
    try {
        const res = await fetch(`${API_BASE}/customers/delete/${id}/`, {
            method: "DELETE"
        });
        if (res.ok) {
            showToast("Customer profile deleted successfully");
            loadAdminCustomers();
        } else {
            showToast("Error deleting customer profile", "error");
        }
    } catch (err) {
        showToast("Network error", "error");
    }
}
window.editAdminCustomer = editAdminCustomer;
window.deleteAdminCustomer = deleteAdminCustomer;

// ==================== AUTHENTICATION FORMS ====================
function initLoginForm() {
    const form = document.getElementById("login-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            email: document.getElementById("login-email").value.trim(),
            password: document.getElementById("login-password").value
        };
        
        try {
            const res = await fetch(`${API_BASE}/auth/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("currentUser", JSON.stringify(data.user));
                showToast(data.message);
                
                setTimeout(() => {
                    if (data.role === "admin") {
                        window.location.href = "admin_dashboard.html";
                    } else {
                        window.location.href = "customer_dashboard.html";
                    }
                }, 1000);
            } else {
                const err = await res.json();
                showToast(err.error || "Login credentials invalid", "error");
            }
        } catch (err) {
            showToast("Backend Server is unreachable", "error");
        }
    });
}

function initRegisterForm() {
    const form = document.getElementById("register-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            full_name: document.getElementById("reg-name").value.trim(),
            email: document.getElementById("reg-email").value.trim(),
            phone: document.getElementById("reg-phone").value.trim(),
            city: document.getElementById("reg-city").value.trim(),
            password: document.getElementById("reg-password").value
        };
        
        try {
            const res = await fetch(`${API_BASE}/customers/add/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                showToast("Account created successfully! Redirecting to login...");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);
            } else {
                const err = await res.json();
                showToast(err.error || "Registration failed", "error");
            }
        } catch (err) {
            showToast("Server unreachable. Please try again.", "error");
        }
    });
}

// ==================== PROPERTY COMPARISON DRAWER ====================
function initComparisonDrawer() {
    const drawer = document.getElementById("comparison-drawer");
    const closeBtn = document.getElementById("compare-modal-close");
    const modalOverlay = document.getElementById("compare-modal-overlay");
    const compareBtn = document.getElementById("compare-btn");
    const clearBtn = document.getElementById("compare-clear-btn");
    
    if (!drawer) return;
    
    // Wire modal closure
    if (closeBtn) closeBtn.addEventListener("click", () => modalOverlay.classList.remove("open"));
    if (modalOverlay) modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.remove("open");
    });
    
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            compareCart = [];
            localStorage.setItem("compareCart", JSON.stringify([]));
            updateComparisonDrawer();
            
            // Uncheck all compare checkboxes on properties pages
            document.querySelectorAll(".compare-checkbox").forEach(chk => chk.checked = false);
        });
    }
    
    if (compareBtn) {
        compareBtn.addEventListener("click", () => {
            if (compareCart.length < 2) {
                showToast("Select at least 2 properties to compare", "error");
                return;
            }
            renderComparisonMatrix();
            modalOverlay.classList.add("open");
        });
    }
    
    updateComparisonDrawer();
}

function toggleCompare(property, isChecked) {
    if (isChecked) {
        if (compareCart.length >= 3) {
            showToast("You can compare a maximum of 3 properties", "error");
            // Find and uncheck checkbox
            document.querySelectorAll(`.compare-checkbox[data-id="${property.property_id}"]`).forEach(chk => chk.checked = false);
            return;
        }
        if (!compareCart.some(item => item.property_id === property.property_id)) {
            compareCart.push(property);
        }
    } else {
        compareCart = compareCart.filter(item => item.property_id !== property.property_id);
    }
    
    localStorage.setItem("compareCart", JSON.stringify(compareCart));
    updateComparisonDrawer();
}

function updateComparisonDrawer() {
    const drawer = document.getElementById("comparison-drawer");
    const container = document.getElementById("comparison-drawer-items");
    if (!drawer) return;
    
    container.innerHTML = "";
    
    if (compareCart.length === 0) {
        drawer.classList.remove("open");
        return;
    }
    
    compareCart.forEach(p => {
        const item = document.createElement("div");
        item.className = "drawer-item";
        item.innerHTML = `
            <img src="${p.image_url}" alt="${p.property_title}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';">
            <div>
                <div class="drawer-item-title">${p.property_title}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${p.location}</div>
            </div>
            <button class="drawer-item-remove" data-id="${p.property_id}">&times;</button>
        `;
        
        item.querySelector(".drawer-item-remove").addEventListener("click", () => {
            toggleCompare(p, false);
            // Sync listing checkboxes if visible
            document.querySelectorAll(`.compare-checkbox[data-id="${p.property_id}"]`).forEach(chk => chk.checked = false);
        });
        
        container.appendChild(item);
    });
    
    drawer.classList.add("open");
}

function renderComparisonMatrix() {
    const content = document.getElementById("compare-modal-content");
    if (!content) return;
    
    content.innerHTML = `
        <table class="compare-table">
            <thead>
                <tr>
                    <th>Feature</th>
                    ${compareCart.map(p => `<th>${p.property_title}</th>`).join("")}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Image</td>
                    ${compareCart.map(p => `<td><img src="${p.image_url}" style="width:120px;height:80px;object-fit:cover;border-radius:4px;" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';"></td>`).join("")}
                </tr>
                <tr>
                    <td>Type</td>
                    ${compareCart.map(p => `<td>${p.property_type}</td>`).join("")}
                </tr>
                <tr>
                    <td>Location</td>
                    ${compareCart.map(p => `<td>${p.location}</td>`).join("")}
                </tr>
                <tr>
                    <td>Price</td>
                    ${compareCart.map(p => `<td style="font-weight:700; color:var(--primary);">${formatPrice(p.price)}</td>`).join("")}
                </tr>
                <tr>
                    <td>Bedrooms</td>
                    ${compareCart.map(p => `<td>${p.bedrooms || 0} BHK</td>`).join("")}
                </tr>
                <tr>
                    <td>Bathrooms</td>
                    ${compareCart.map(p => `<td>${p.bathrooms || 0}</td>`).join("")}
                </tr>
                <tr>
                    <td>Area (SqFt)</td>
                    ${compareCart.map(p => `<td>${p.area_sqft} SqFt</td>`).join("")}
                </tr>
                <tr>
                    <td>Status</td>
                    ${compareCart.map(p => `<td><span class="status-tag status-${p.status.toLowerCase()}">${p.status}</span></td>`).join("")}
                </tr>
            </tbody>
        </table>
    `;
}
