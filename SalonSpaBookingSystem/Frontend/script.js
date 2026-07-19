// Base API URL config
const API_BASE = window.location.origin;

// State helper: Retrieve user from localStorage
function getLoggedInUser() {
    try {
        const u = localStorage.getItem("aura_user");
        return u ? JSON.parse(u) : null;
    } catch (e) {
        return null;
    }
}

// Global initialization
document.addEventListener("DOMContentLoaded", () => {
    setupNavbar();
    
    // Page router execution based on DOM indicators
    if (document.getElementById("featuredServicesGrid")) {
        initHomePage();
    }
    if (document.getElementById("loginForm")) {
        initLoginPage();
    }
    if (document.getElementById("registerForm")) {
        initRegisterPage();
    }
    if (document.getElementById("servicesCatalogGrid")) {
        initServicesPage();
    }
    if (document.getElementById("stylistsCatalogGrid")) {
        initStylistsPage();
    }
    if (document.getElementById("appointmentForm")) {
        initBookingPage();
    }
    if (document.getElementById("invoiceService")) {
        initPaymentPage();
    }
    if (document.getElementById("recentBookingsTableBody")) {
        initCustomerDashboard();
    }
    if (document.getElementById("adminServicesTableBody")) {
        initAdminDashboard();
    }
});

// Setup responsive navbar & session controls
function setupNavbar() {
    const navToggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");
    if (navToggle && navLinks) {
        navToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }

    const user = getLoggedInUser();
    const dashboardLink = document.getElementById("navDashboardLink");
    const adminLink = document.getElementById("navAdminLink");
    const authLinkContainer = document.getElementById("authLinkContainer");

    if (user) {
        if (user.role === "admin") {
            if (adminLink) adminLink.style.display = "block";
            if (dashboardLink) dashboardLink.style.display = "none";
        } else {
            if (dashboardLink) dashboardLink.style.display = "block";
            if (adminLink) adminLink.style.display = "none";
        }
        if (authLinkContainer) {
            authLinkContainer.innerHTML = `<button class="nav-logout-btn" onclick="logout()">Logout</button>`;
        }
    } else {
        if (dashboardLink) dashboardLink.style.display = "none";
        if (adminLink) adminLink.style.display = "none";
        if (authLinkContainer) {
            authLinkContainer.innerHTML = `<a href="login.html" class="nav-auth-btn">Login</a>`;
        }
    }
}

function logout() {
    localStorage.removeItem("aura_user");
    sessionStorage.clear();
    window.location.href = "index.html";
}

// ----------------- HOME PAGE -----------------
async function initHomePage() {
    try {
        // Fetch Services and show first 3
        const resServices = await fetch(`${API_BASE}/services/`);
        const services = await resServices.json();
        const featuredContainer = document.getElementById("featuredServicesGrid");
        
        services.slice(0, 3).forEach(s => {
            featuredContainer.innerHTML += `
                <div class="card">
                    <div class="card-img-container">
                        <div class="card-img-placeholder">${s.service_name.charAt(0)}</div>
                    </div>
                    <div class="card-body">
                        <span class="card-category">${s.category}</span>
                        <h3 class="card-title">${s.service_name}</h3>
                        <p class="card-desc">${s.description}</p>
                        <div class="card-meta">
                            <span class="card-price">₹${s.price}</span>
                            <span class="card-duration"><i class="fa-regular fa-clock"></i> ${s.duration} min</span>
                        </div>
                        <button class="btn-primary" style="width:100%; margin-top:1rem;" onclick="location.href='booking.html?service=${encodeURIComponent(s.service_name)}'">Book Now</button>
                    </div>
                </div>
            `;
        });

        // Fetch Stylists and show first 3
        const resStylists = await fetch(`${API_BASE}/stylists/`);
        const stylists = await resStylists.json();
        const popularContainer = document.getElementById("popularStylistsGrid");
        
        stylists.slice(0, 3).forEach(st => {
            const statusClass = st.availability.toLowerCase();
            popularContainer.innerHTML += `
                <div class="card">
                    <span class="badge-status ${statusClass}">${st.availability}</span>
                    <div class="card-img-container">
                        <div class="card-img-placeholder">${st.stylist_name.charAt(0)}</div>
                    </div>
                    <div class="card-body">
                        <h3 class="card-title" style="margin-bottom:0.3rem;">${st.stylist_name}</h3>
                        <span class="card-category" style="color:var(--text-muted); font-size:0.9rem; margin-bottom:1rem; display:block;">${st.specialization}</span>
                        <div class="card-meta">
                            <span style="font-size:0.9rem; font-weight:600;"><i class="fa-solid fa-graduation-cap" style="color:var(--primary);"></i> ${st.experience} Yrs Exp</span>
                            <div class="card-rating">
                                <i class="fa-solid fa-star"></i> 4.9
                            </div>
                        </div>
                        <button class="btn-outline" style="width:100%; margin-top:1.2rem; margin-left:0;" onclick="location.href='booking.html?stylist=${encodeURIComponent(st.stylist_name)}'">Request Appointment</button>
                    </div>
                </div>
            `;
        });

        // Fetch Testimonials / Reviews
        const resReviews = await fetch(`${API_BASE}/reviews/`);
        const reviews = await resReviews.json();
        const reviewsContainer = document.getElementById("testimonialsGrid");
        
        reviews.slice(0, 3).forEach(r => {
            let stars = "";
            for (let i = 0; i < r.rating; i++) stars += `<i class="fa-solid fa-star" style="margin-right:2px;"></i>`;
            reviewsContainer.innerHTML += `
                <div class="testimonial-card">
                    <div style="color:var(--primary); margin-bottom:1rem;">${stars}</div>
                    <p class="testimonial-quote">"${r.comment}"</p>
                    <div class="testimonial-author">
                        <span class="author-name">${r.customer_name}</span>
                        <span class="author-target">${r.target_name}</span>
                    </div>
                </div>
            `;
        });

    } catch (e) {
        console.error("Home initialization failed: ", e);
    }
}

// ----------------- LOGIN PAGE -----------------
function initLoginPage() {
    const form = document.getElementById("loginForm");
    const errorBox = document.getElementById("loginErrorMsg");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorBox.style.display = "none";

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        try {
            const res = await fetch(`${API_BASE}/auth/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                // Success: store credentials and redirect
                localStorage.setItem("aura_user", JSON.stringify(data.user));
                if (data.role === "admin") {
                    window.location.href = "admin_dashboard.html";
                } else {
                    window.location.href = "customer_dashboard.html";
                }
            } else {
                errorBox.innerText = data.error || "Login failed. Please check your credentials.";
                errorBox.style.display = "block";
            }
        } catch (err) {
            errorBox.innerText = "Connection error. Please try again later.";
            errorBox.style.display = "block";
        }
    });
}

// ----------------- REGISTER PAGE -----------------
function initRegisterPage() {
    const form = document.getElementById("registerForm");
    const errorBox = document.getElementById("registerErrorMsg");
    const successBox = document.getElementById("registerSuccessMsg");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorBox.style.display = "none";
        successBox.style.display = "none";

        const full_name = document.getElementById("regFullName").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const phone = document.getElementById("regPhone").value.trim();
        const gender = document.getElementById("regGender").value;
        const password = document.getElementById("regPassword").value;

        try {
            const res = await fetch(`${API_BASE}/customers/add/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name, email, phone, gender, password })
            });
            const data = await res.json();

            if (res.ok) {
                successBox.innerText = "Registration successful! Redirecting to login...";
                successBox.style.display = "block";
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            } else {
                errorBox.innerText = data.error || "Registration failed. Try again.";
                errorBox.style.display = "block";
            }
        } catch (err) {
            errorBox.innerText = "Connection error. Please check your network.";
            errorBox.style.display = "block";
        }
    });
}

// ----------------- SERVICES CATALOG PAGE -----------------
async function initServicesPage() {
    const grid = document.getElementById("servicesCatalogGrid");
    const searchInput = document.getElementById("serviceSearchInput");
    const tagsContainer = document.getElementById("categoryTagsContainer");
    
    let allServices = [];
    let activeCategory = "All";
    let activeSearch = "";

    try {
        const res = await fetch(`${API_BASE}/services/`);
        allServices = await res.json();
        renderFilteredServices();
    } catch (e) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center;">Could not load services lists.</div>`;
    }

    // Bind Category Filter tag actions
    tagsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("tag")) {
            Array.from(tagsContainer.children).forEach(t => t.classList.remove("active"));
            e.target.classList.add("active");
            activeCategory = e.target.getAttribute("data-category");
            renderFilteredServices();
        }
    });

    // Bind Search input action
    searchInput.addEventListener("input", (e) => {
        activeSearch = e.target.value.toLowerCase().trim();
        renderFilteredServices();
    });

    function renderFilteredServices() {
        grid.innerHTML = "";
        const filtered = allServices.filter(s => {
            const matchesCat = (activeCategory === "All" || s.category === activeCategory);
            const matchesSearch = s.service_name.toLowerCase().includes(activeSearch) || 
                                  s.description.toLowerCase().includes(activeSearch);
            return matchesCat && matchesSearch;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding: 3rem; color:var(--text-muted);">No services found matching filters.</div>`;
            return;
        }

        filtered.forEach(s => {
            grid.innerHTML += `
                <div class="card">
                    <div class="card-img-container">
                        <div class="card-img-placeholder">${s.service_name.charAt(0)}</div>
                    </div>
                    <div class="card-body">
                        <span class="card-category">${s.category}</span>
                        <h3 class="card-title">${s.service_name}</h3>
                        <p class="card-desc">${s.description}</p>
                        <div class="card-meta">
                            <span class="card-price">₹${s.price}</span>
                            <span class="card-duration"><i class="fa-regular fa-clock"></i> ${s.duration} min</span>
                        </div>
                        <button class="btn-primary" style="width:100%; margin-top:1rem;" onclick="location.href='booking.html?service=${encodeURIComponent(s.service_name)}'">Book Now</button>
                    </div>
                </div>
            `;
        });
    }
}

// ----------------- STYLISTS CATALOG PAGE -----------------
async function initStylistsPage() {
    const grid = document.getElementById("stylistsCatalogGrid");
    try {
        const res = await fetch(`${API_BASE}/stylists/`);
        const stylists = await res.json();
        
        if (stylists.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem;">No stylists records present.</div>`;
            return;
        }

        stylists.forEach(st => {
            const statusClass = st.availability.toLowerCase();
            grid.innerHTML += `
                <div class="card">
                    <span class="badge-status ${statusClass}">${st.availability}</span>
                    <div class="card-img-container">
                        <div class="card-img-placeholder">${st.stylist_name.charAt(0)}</div>
                    </div>
                    <div class="card-body">
                        <h3 class="card-title" style="margin-bottom:0.3rem;">${st.stylist_name}</h3>
                        <span class="card-category" style="color:var(--text-muted); font-size:0.9rem; margin-bottom:1rem; display:block;">${st.specialization}</span>
                        <div class="card-meta">
                            <span style="font-size:0.9rem; font-weight:600;"><i class="fa-solid fa-graduation-cap" style="color:var(--primary);"></i> ${st.experience} Yrs Exp</span>
                            <div class="card-rating">
                                <i class="fa-solid fa-star"></i> 4.9
                            </div>
                        </div>
                        <button class="btn-outline" style="width:100%; margin-top:1.2rem; margin-left:0;" onclick="location.href='booking.html?stylist=${encodeURIComponent(st.stylist_name)}'">Request Appointment</button>
                    </div>
                </div>
            `;
        });
    } catch (e) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center;">Could not load stylists lists.</div>`;
    }
}

// ----------------- DYNAMIC BOOKING & CALENDAR CHECKER -----------------
async function initBookingPage() {
    const selectService = document.getElementById("bookService");
    const selectStylist = document.getElementById("bookStylist");
    const bookDateInput = document.getElementById("bookDate");
    const alertBox = document.getElementById("bookingAlertMsg");
    const stylistNote = document.getElementById("stylistStatusNote");

    // Summary Elements
    const sumService = document.getElementById("summaryService");
    const sumStylist = document.getElementById("summaryStylist");
    const sumDate = document.getElementById("summaryDate");
    const sumTime = document.getElementById("summaryTime");
    const sumDuration = document.getElementById("summaryDuration");
    const sumTotal = document.getElementById("summaryTotal");
    const confirmBtn = document.getElementById("confirmBookingBtn");

    let services = [];
    let stylists = [];
    let appointments = [];
    let selectedTimeSlot = "";

    // Set minimum date to today (YYYY-MM-DD)
    const todayStr = new Date().toISOString().split("T")[0];
    bookDateInput.min = todayStr;
    bookDateInput.value = todayStr;

    // Retrieve URL search queries
    const urlParams = new URLSearchParams(window.location.search);
    const preService = urlParams.get("service");
    const preStylist = urlParams.get("stylist");

    try {
        // Fetch dropdown options & all appointments for schedule check
        const [resServ, resStyl, resAppt] = await Promise.all([
            fetch(`${API_BASE}/services/`),
            fetch(`${API_BASE}/stylists/`),
            fetch(`${API_BASE}/appointments/`)
        ]);

        services = await resServ.json();
        stylists = await resStyl.json();
        appointments = await resAppt.json();

        // Populate Services Dropdown
        services.forEach(s => {
            const opt = document.createElement("option");
            opt.value = s.service_name;
            opt.text = `${s.service_name} (₹${s.price})`;
            opt.dataset.price = s.price;
            opt.dataset.duration = s.duration;
            selectService.appendChild(opt);
        });

        // Populate Stylists Dropdown
        stylists.forEach(st => {
            const opt = document.createElement("option");
            opt.value = st.stylist_name;
            opt.text = `${st.stylist_name} (${st.specialization})`;
            opt.dataset.availability = st.availability;
            selectStylist.appendChild(opt);
        });

        // Parse query params if available
        if (preService) {
            selectService.value = decodeURIComponent(preService);
        }
        if (preStylist) {
            selectStylist.value = decodeURIComponent(preStylist);
        }

        updateSummary();
        checkStylistAvailability();

    } catch (e) {
        console.error("Failed to load selectors: ", e);
    }

    // Event Listeners
    selectService.addEventListener("change", () => {
        updateSummary();
        checkButtonState();
    });
    
    selectStylist.addEventListener("change", () => {
        updateSummary();
        checkStylistAvailability();
        checkButtonState();
    });

    bookDateInput.addEventListener("change", () => {
        updateSummary();
        checkStylistAvailability();
        checkButtonState();
    });

    // Time slots selection
    const timeSlots = document.querySelectorAll(".time-slot");
    timeSlots.forEach(slot => {
        slot.addEventListener("click", () => {
            if (slot.classList.contains("disabled")) return;
            
            timeSlots.forEach(s => s.classList.remove("selected"));
            slot.classList.add("selected");
            selectedTimeSlot = slot.getAttribute("data-time");
            
            sumTime.innerText = selectedTimeSlot;
            checkButtonState();
        });
    });

    confirmBtn.addEventListener("click", () => {
        const user = getLoggedInUser();
        if (!user) {
            // Redirect guests to login, saving state
            alertBox.innerText = "Please log in or register to complete appointment bookings.";
            alertBox.style.display = "block";
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2500);
            return;
        }

        // Store selected variables in session storage for invoice page
        const selectedOpt = selectService.options[selectService.selectedIndex];
        const price = parseFloat(selectedOpt.dataset.price);

        const checkoutData = {
            service_name: selectService.value,
            stylist_name: selectStylist.value,
            appointment_date: bookDateInput.value,
            appointment_time: selectedTimeSlot,
            total_amount: price
        };

        sessionStorage.setItem("aura_checkout", JSON.stringify(checkoutData));
        window.location.href = "payment.html";
    });

    // Helper: Update Text Summary Fields
    function updateSummary() {
        const serviceVal = selectService.value;
        const stylistVal = selectStylist.value;
        const dateVal = bookDateInput.value;

        sumService.innerText = serviceVal || "-";
        sumStylist.innerText = stylistVal || "-";
        sumDate.innerText = dateVal || "-";

        if (serviceVal) {
            const opt = selectService.options[selectService.selectedIndex];
            sumDuration.innerText = `${opt.dataset.duration} min`;
            sumTotal.innerText = `₹${parseFloat(opt.dataset.price).toFixed(2)}`;
        } else {
            sumDuration.innerText = "-";
            sumTotal.innerText = "₹0.00";
        }
    }

    // Helper: Enable button only when inputs are correct
    function checkButtonState() {
        const serviceOk = selectService.value !== "";
        const stylistOk = selectStylist.value !== "";
        const dateOk = bookDateInput.value !== "";
        const timeOk = selectedTimeSlot !== "";

        confirmBtn.disabled = !(serviceOk && stylistOk && dateOk && timeOk);
    }

    // Helper: Check Stylist Availability Calendar
    function checkStylistAvailability() {
        alertBox.style.display = "none";
        stylistNote.style.display = "none";
        
        const stylistVal = selectStylist.value;
        const dateVal = bookDateInput.value;
        
        if (!stylistVal) return;

        const stylistOpt = selectStylist.options[selectStylist.selectedIndex];
        const baseAvailability = stylistOpt.dataset.availability;

        // Reset slots disable status
        timeSlots.forEach(s => s.classList.remove("disabled", "selected"));
        selectedTimeSlot = "";
        sumTime.innerText = "-";
        confirmBtn.disabled = true;

        if (baseAvailability !== "Available") {
            stylistNote.innerText = `Note: This stylist availability status is currently '${baseAvailability}'.`;
            stylistNote.style.display = "block";
            
            if (baseAvailability === "Leave") {
                alertBox.innerText = `${stylistVal} is currently on leave. Please select another stylist.`;
                alertBox.style.display = "block";
                timeSlots.forEach(s => s.classList.add("disabled"));
                return;
            }
        }

        if (!dateVal) return;

        // Calendar check: Match dates and time slots for selected stylist
        const busySlots = appointments
            .filter(a => a.stylist_name === stylistVal && 
                         a.appointment_date === dateVal && 
                         a.appointment_status !== "Cancelled")
            .map(a => a.appointment_time);

        timeSlots.forEach(slot => {
            const val = slot.getAttribute("data-time");
            if (busySlots.includes(val)) {
                slot.classList.add("disabled");
            }
        });
    }
}

// ----------------- CHECKOUT & PAYMENTS -----------------
function initPaymentPage() {
    const rawCheckout = sessionStorage.getItem("aura_checkout");
    if (!rawCheckout) {
        window.location.href = "booking.html";
        return;
    }

    const user = getLoggedInUser();
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const checkout = JSON.parse(rawCheckout);
    
    // Fill invoice fields
    document.getElementById("invoiceService").innerText = checkout.service_name;
    document.getElementById("invoiceStylist").innerText = checkout.stylist_name;
    document.getElementById("invoiceDateTime").innerText = `${checkout.appointment_date} at ${checkout.appointment_time}`;
    document.getElementById("invoiceAmount").innerText = `₹${parseFloat(checkout.total_amount).toFixed(2)}`;

    // Payment Methods toggler
    const methodCards = document.querySelectorAll(".payment-method-card");
    const upiPanel = document.getElementById("upiPanel");
    const cardPanel = document.getElementById("cardPanel");
    let selectedMethod = "UPI";

    methodCards.forEach(c => {
        c.addEventListener("click", () => {
            methodCards.forEach(mc => mc.classList.remove("selected"));
            c.classList.add("selected");
            selectedMethod = c.getAttribute("data-method");

            if (selectedMethod === "UPI") {
                upiPanel.style.display = "block";
                cardPanel.style.display = "none";
            } else if (selectedMethod === "Credit Card" || selectedMethod === "Debit Card") {
                cardPanel.style.display = "block";
                upiPanel.style.display = "none";
            } else {
                upiPanel.style.display = "none";
                cardPanel.style.display = "none";
            }
        });
    });

    const alertBox = document.getElementById("paymentAlertMsg");
    const successBox = document.getElementById("paymentSuccessMsg");
    const payBtn = document.getElementById("payNowBtn");

    payBtn.addEventListener("click", async () => {
        alertBox.style.display = "none";
        payBtn.disabled = true;
        payBtn.innerText = "Processing Transaction...";

        // 1. Create the appointment record via POST
        const apptPayload = {
            customer_name: user.full_name,
            stylist_name: checkout.stylist_name,
            service_name: checkout.service_name,
            appointment_date: checkout.appointment_date,
            appointment_time: checkout.appointment_time,
            total_amount: checkout.total_amount,
            appointment_status: "Booked"
        };

        try {
            const apptRes = await fetch(`${API_BASE}/appointments/add/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(apptPayload)
            });
            const apptData = await apptRes.json();

            if (!apptRes.ok) {
                throw new Error(apptData.error || "Failed to create appointment scheduling.");
            }

            // 2. Create the payment record
            const payPayload = {
                customer_name: user.full_name,
                appointment_id: apptData.appointment_id,
                amount: checkout.total_amount,
                payment_method: selectedMethod,
                payment_status: (selectedMethod === "Cash" ? "Pending" : "Paid"),
                payment_date: new Date().toISOString().split("T")[0]
            };

            const payRes = await fetch(`${API_BASE}/payments/add/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payPayload)
            });

            if (!payRes.ok) {
                const payData = await payRes.json();
                throw new Error(payData.error || "Failed to log transaction.");
            }

            successBox.innerText = "Payment completed and booking confirmed!";
            successBox.style.display = "block";
            sessionStorage.removeItem("aura_checkout");

            setTimeout(() => {
                window.location.href = "customer_dashboard.html";
            }, 2000);

        } catch (e) {
            alertBox.innerText = e.message || "An unexpected error occurred.";
            alertBox.style.display = "block";
            payBtn.disabled = false;
            payBtn.innerText = "Confirm Payment & Book";
        }
    });
}

// ----------------- CUSTOMER DASHBOARD & FEEDBACK & REMINDERS -----------------
async function initCustomerDashboard() {
    const user = getLoggedInUser();
    if (!user || user.role !== "customer") {
        window.location.href = "login.html";
        return;
    }

    // Set profile info
    document.getElementById("userAvatar").innerText = user.full_name.charAt(0).toUpperCase();
    document.getElementById("userFullName").innerText = user.full_name;
    document.getElementById("userRoleBadge").innerText = `${user.gender} Customer | ID: ${user.customer_id}`;

    // Sidebar tab bindings
    const sideMenu = document.querySelectorAll(".sidebar-menu li");
    const tabPanes = document.querySelectorAll(".tab-pane");

    sideMenu.forEach(item => {
        item.addEventListener("click", () => {
            sideMenu.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            
            const tabId = item.getAttribute("data-tab");
            tabPanes.forEach(pane => {
                pane.style.display = (pane.id === `tab-${tabId}`) ? "block" : "none";
            });
        });
    });

    // Populate feedback dropdown options
    const targetSelect = document.getElementById("reviewTarget");
    try {
        const [resS, resSt] = await Promise.all([
            fetch(`${API_BASE}/services/`),
            fetch(`${API_BASE}/stylists/`)
        ]);
        const services = await resS.json();
        const stylists = await resSt.json();

        const grpServ = document.createElement("optgroup");
        grpServ.label = "Services";
        services.forEach(s => {
            grpServ.innerHTML += `<option value="${s.service_name}">${s.service_name}</option>`;
        });
        targetSelect.appendChild(grpServ);

        const grpStyl = document.createElement("optgroup");
        grpStyl.label = "Stylists";
        stylists.forEach(st => {
            grpStyl.innerHTML += `<option value="${st.stylist_name}">${st.stylist_name}</option>`;
        });
        targetSelect.appendChild(grpStyl);

    } catch (e) {
        console.error(e);
    }

    // Star Selection bind
    const stars = document.querySelectorAll("#starRatingSelect .star");
    const ratingInput = document.getElementById("reviewRatingInput");

    stars.forEach(star => {
        star.addEventListener("click", () => {
            const val = parseInt(star.getAttribute("data-val"));
            ratingInput.value = val;
            stars.forEach(s => {
                const sVal = parseInt(s.getAttribute("data-val"));
                s.style.color = (sVal <= val) ? "var(--primary)" : "var(--text-muted)";
            });
        });
    });
    // Trigger default color for 5 stars
    stars[4].click();

    // Review Form submit
    const reviewForm = document.getElementById("reviewSubmitForm");
    const revAlert = document.getElementById("reviewAlertMsg");
    const revSuccess = document.getElementById("reviewSuccessMsg");

    reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        revAlert.style.display = "none";
        revSuccess.style.display = "none";

        const payload = {
            customer_name: user.full_name,
            target_name: targetSelect.value,
            rating: parseInt(ratingInput.value),
            comment: document.getElementById("reviewComment").value.trim(),
            review_date: new Date().toISOString().split("T")[0]
        };

        try {
            const res = await fetch(`${API_BASE}/reviews/add/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                revSuccess.innerText = "Review submitted successfully! Thank you for your feedback.";
                revSuccess.style.display = "block";
                reviewForm.reset();
                stars[4].click();
            } else {
                const err = await res.json();
                revAlert.innerText = err.error || "Failed to submit review.";
                revAlert.style.display = "block";
            }
        } catch (err) {
            revAlert.innerText = "Connection error.";
            revAlert.style.display = "block";
        }
    });

    // Load tables data
    await loadCustomerDataTables(user.full_name);
}

async function loadCustomerDataTables(customerName) {
    try {
        const [resAppts, resPays] = await Promise.all([
            fetch(`${API_BASE}/appointments/`),
            fetch(`${API_BASE}/payments//`)
        ]);

        const appointments = await resAppts.json();
        const payments = await resPays.json();

        // Filters matching this specific customer
        const userAppts = appointments.filter(a => a.customer_name === customerName);
        const userPayments = payments.filter(p => p.customer_name === customerName);

        // Stats updates
        const upcomingCount = userAppts.filter(a => a.appointment_status === "Booked").length;
        const completedCount = userAppts.filter(a => a.appointment_status === "Completed").length;
        const totalSpent = userPayments
            .filter(p => p.payment_status === "Paid")
            .reduce((sum, p) => sum + p.amount, 0);

        document.getElementById("statUpcoming").innerText = upcomingCount;
        document.getElementById("statCompleted").innerText = completedCount;
        document.getElementById("statTotalSpent").innerText = `₹${totalSpent.toFixed(2)}`;

        // Populate reminders banner (Bonus Feature: Appointments within 24 hours)
        const reminderContainer = document.getElementById("dashboardReminderContainer");
        reminderContainer.innerHTML = "";
        reminderContainer.style.display = "none";

        const now = new Date();
        const upcomingBooked = userAppts.filter(a => a.appointment_status === "Booked");
        
        let nearestAppt = null;
        for (let a of upcomingBooked) {
            const apptDateTime = new Date(`${a.appointment_date}T${a.appointment_time}`);
            const diffHours = (apptDateTime - now) / (1000 * 60 * 60);
            
            // Check if appointment is in the future and within 24 hours
            if (diffHours >= 0 && diffHours <= 24) {
                nearestAppt = a;
                break;
            }
        }

        if (nearestAppt) {
            reminderContainer.innerHTML = `
                <div class="reminder-banner">
                    <div class="reminder-content">
                        <div class="reminder-icon"><i class="fa-solid fa-bell"></i></div>
                        <div class="reminder-text">
                            <h5>Upcoming Booking Reminder</h5>
                            <p>You have a <strong>${nearestAppt.service_name}</strong> booked with <strong>${nearestAppt.stylist_name}</strong> today at <strong>${nearestAppt.appointment_time}</strong>.</p>
                        </div>
                    </div>
                </div>
            `;
            reminderContainer.style.display = "block";
        }

        // Tables bindings
        const recentBody = document.getElementById("recentBookingsTableBody");
        const allBody = document.getElementById("allBookingsTableBody");
        const payBody = document.getElementById("paymentHistoryTableBody");

        recentBody.innerHTML = "";
        allBody.innerHTML = "";
        payBody.innerHTML = "";

        // Build recent upcoming list (first 3 booked appointments)
        const upcomingList = userAppts.filter(a => a.appointment_status === "Booked");
        if (upcomingList.length === 0) {
            recentBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No upcoming appointments.</td></tr>`;
        } else {
            upcomingList.slice(0, 3).forEach(a => {
                recentBody.innerHTML += `
                    <tr>
                        <td>#${a.appointment_id}</td>
                        <td>${a.service_name}</td>
                        <td>${a.stylist_name}</td>
                        <td>${a.appointment_date} @ ${a.appointment_time}</td>
                        <td>₹${a.total_amount}</td>
                        <td><span class="badge warning">${a.appointment_status}</span></td>
                        <td><button class="btn-outline btn-small" onclick="cancelAppointment(${a.appointment_id}, '${a.customer_name}', '${a.stylist_name}', '${a.service_name}', '${a.appointment_date}', '${a.appointment_time}', ${a.total_amount})">Cancel</button></td>
                    </tr>
                `;
            });
        }

        // Build all bookings list
        if (userAppts.length === 0) {
            allBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No bookings found.</td></tr>`;
        } else {
            userAppts.forEach(a => {
                let statusBadge = `<span class="badge warning">${a.appointment_status}</span>`;
                if (a.appointment_status === "Completed") statusBadge = `<span class="badge success">${a.appointment_status}</span>`;
                if (a.appointment_status === "Cancelled") statusBadge = `<span class="badge danger">${a.appointment_status}</span>`;

                let cancelBtn = "";
                if (a.appointment_status === "Booked") {
                    cancelBtn = `<button class="btn-outline btn-small" onclick="cancelAppointment(${a.appointment_id}, '${a.customer_name}', '${a.stylist_name}', '${a.service_name}', '${a.appointment_date}', '${a.appointment_time}', ${a.total_amount})">Cancel</button>`;
                }

                allBody.innerHTML += `
                    <tr>
                        <td>#${a.appointment_id}</td>
                        <td>${a.service_name}</td>
                        <td>${a.stylist_name}</td>
                        <td>${a.appointment_date}</td>
                        <td>${a.appointment_time}</td>
                        <td>₹${a.total_amount}</td>
                        <td>${statusBadge}</td>
                        <td>${cancelBtn}</td>
                    </tr>
                `;
            });
        }

        // Build Payments List
        if (userPayments.length === 0) {
            payBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No transactions found.</td></tr>`;
        } else {
            userPayments.forEach(p => {
                let statusBadge = `<span class="badge success">${p.payment_status}</span>`;
                if (p.payment_status === "Failed") statusBadge = `<span class="badge danger">${p.payment_status}</span>`;
                if (p.payment_status === "Pending") statusBadge = `<span class="badge warning">${p.payment_status}</span>`;

                payBody.innerHTML += `
                    <tr>
                        <td>#${p.payment_id}</td>
                        <td>#${p.appointment_id}</td>
                        <td>${p.payment_method}</td>
                        <td>₹${p.amount}</td>
                        <td>${statusBadge}</td>
                        <td>${p.payment_date}</td>
                    </tr>
                `;
            });
        }

    } catch (e) {
        console.error(e);
    }
}

// Action helper to cancel appointment
async function cancelAppointment(id, cname, sname, srvname, date, time, amt) {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
        const payload = {
            customer_name: cname,
            stylist_name: sname,
            service_name: srvname,
            appointment_date: date,
            appointment_time: time,
            total_amount: amt,
            appointment_status: "Cancelled"
        };
        const res = await fetch(`${API_BASE}/appointments/update/${id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Appointment cancelled successfully.");
            const user = getLoggedInUser();
            if (user) loadCustomerDataTables(user.full_name);
        } else {
            alert("Could not cancel appointment.");
        }
    } catch (e) {
        alert("Network error.");
    }
}

// ----------------- ADMIN DASHBOARD & CRUD MANAGEMENT -----------------
async function initAdminDashboard() {
    const user = getLoggedInUser();
    if (!user || user.role !== "admin") {
        window.location.href = "login.html";
        return;
    }

    // Tab switcher layout bindings
    const sideMenu = document.querySelectorAll(".sidebar-menu li");
    const tabPanes = document.querySelectorAll(".tab-pane");

    sideMenu.forEach(item => {
        item.addEventListener("click", () => {
            sideMenu.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            
            const tabId = item.getAttribute("data-tab");
            tabPanes.forEach(pane => {
                pane.style.display = (pane.id === `tab-${tabId}`) ? "block" : "none";
            });
        });
    });

    // Populate data
    loadAdminTables();
}

async function loadAdminTables() {
    try {
        const [resS, resSt, resC, resA, resP] = await Promise.all([
            fetch(`${API_BASE}/services/`),
            fetch(`${API_BASE}/stylists/`),
            fetch(`${API_BASE}/customers/`),
            fetch(`${API_BASE}/appointments/`),
            fetch(`${API_BASE}/payments/`)
        ]);

        const services = await resS.json();
        const stylists = await resSt.json();
        const customers = await resC.json();
        const appointments = await resA.json();
        const payments = await resP.json();

        // 1. Services manager
        const sBody = document.getElementById("adminServicesTableBody");
        sBody.innerHTML = "";
        services.forEach(s => {
            sBody.innerHTML += `
                <tr>
                    <td>#${s.service_id}</td>
                    <td><strong>${s.service_name}</strong></td>
                    <td>${s.category}</td>
                    <td>${s.duration} min</td>
                    <td>₹${s.price}</td>
                    <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s.description}</td>
                    <td>
                        <div class="actions-cell">
                            <button class="btn-icon" onclick="openEditModal('service', ${s.service_id})"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-icon delete" onclick="deleteAdminEntity('service', ${s.service_id})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        // 2. Stylists manager
        const stBody = document.getElementById("adminStylistsTableBody");
        stBody.innerHTML = "";
        stylists.forEach(st => {
            let badgeClass = st.availability.toLowerCase();
            stBody.innerHTML += `
                <tr>
                    <td>#${st.stylist_id}</td>
                    <td><strong>${st.stylist_name}</strong></td>
                    <td>${st.specialization}</td>
                    <td>${st.experience} Years</td>
                    <td>${st.phone}</td>
                    <td><span class="badge-status ${badgeClass}" style="position:static; padding:0.25rem 0.5rem; font-size:0.7rem;">${st.availability}</span></td>
                    <td>
                        <div class="actions-cell">
                            <button class="btn-icon" onclick="openEditModal('stylist', ${st.stylist_id})"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-icon delete" onclick="deleteAdminEntity('stylist', ${st.stylist_id})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        // 3. Customers manager
        const cBody = document.getElementById("adminCustomersTableBody");
        cBody.innerHTML = "";
        customers.forEach(c => {
            cBody.innerHTML += `
                <tr>
                    <td>#${c.customer_id}</td>
                    <td><strong>${c.full_name}</strong></td>
                    <td>${c.email}</td>
                    <td>${c.phone}</td>
                    <td>${c.gender}</td>
                    <td>
                        <div class="actions-cell">
                            <button class="btn-icon" onclick="openEditModal('customer', ${c.customer_id})"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-icon delete" onclick="deleteAdminEntity('customer', ${c.customer_id})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        // 4. Appointments manager
        const aBody = document.getElementById("adminAppointmentsTableBody");
        aBody.innerHTML = "";
        appointments.forEach(a => {
            let statusBadge = `<span class="badge warning">${a.appointment_status}</span>`;
            if (a.appointment_status === "Completed") statusBadge = `<span class="badge success">${a.appointment_status}</span>`;
            if (a.appointment_status === "Cancelled") statusBadge = `<span class="badge danger">${a.appointment_status}</span>`;

            aBody.innerHTML += `
                <tr>
                    <td>#${a.appointment_id}</td>
                    <td>${a.customer_name}</td>
                    <td>${a.stylist_name}</td>
                    <td>${a.service_name}</td>
                    <td>${a.appointment_date}</td>
                    <td>${a.appointment_time}</td>
                    <td>₹${a.total_amount}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="actions-cell">
                            <button class="btn-icon" onclick="openEditModal('appointment', ${a.appointment_id})"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-icon delete" onclick="deleteAdminEntity('appointment', ${a.appointment_id})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        // 5. Payments manager
        const pBody = document.getElementById("adminPaymentsTableBody");
        pBody.innerHTML = "";
        payments.forEach(p => {
            let statusBadge = `<span class="badge success">${p.payment_status}</span>`;
            if (p.payment_status === "Failed") statusBadge = `<span class="badge danger">${p.payment_status}</span>`;
            if (p.payment_status === "Pending") statusBadge = `<span class="badge warning">${p.payment_status}</span>`;

            pBody.innerHTML += `
                <tr>
                    <td>#${p.payment_id}</td>
                    <td>${p.customer_name}</td>
                    <td>#${p.appointment_id}</td>
                    <td>₹${p.amount}</td>
                    <td>${p.payment_method}</td>
                    <td>${statusBadge}</td>
                    <td>${p.payment_date}</td>
                    <td>
                        <div class="actions-cell">
                            <button class="btn-icon" onclick="openEditModal('payment', ${p.payment_id})"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-icon delete" onclick="deleteAdminEntity('payment', ${p.payment_id})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

    } catch (e) {
        showGlobalAlert("Failed to load tables.", true);
    }
}

// Global alert utility
function showGlobalAlert(msg, isError = false) {
    const alert = document.getElementById("adminGlobalAlert");
    alert.innerText = msg;
    alert.className = isError ? "badge danger" : "badge success";
    alert.style.display = "block";
    setTimeout(() => {
        alert.style.display = "none";
    }, 4000);
}

// Modal actions
function openAdminModal() {
    document.getElementById("adminModalOverlay").style.display = "flex";
}

function closeAdminModal() {
    document.getElementById("adminModalOverlay").style.display = "none";
    document.getElementById("adminModalForm").reset();
}

function openAddModal(entity) {
    document.getElementById("modalAction").value = "add";
    document.getElementById("modalEntity").value = entity;
    document.getElementById("modalId").value = "";
    document.getElementById("modalTitle").innerText = `Add New ${entity.toUpperCase()}`;
    
    generateFormFields(entity);
    openAdminModal();
}

async function openEditModal(entity, id) {
    document.getElementById("modalAction").value = "edit";
    document.getElementById("modalEntity").value = entity;
    document.getElementById("modalId").value = id;
    document.getElementById("modalTitle").innerText = `Edit ${entity.toUpperCase()} #${id}`;

    generateFormFields(entity);
    openAdminModal();

    // Fetch details and populate form
    try {
        const res = await fetch(`${API_BASE}/${entity}s/`);
        const list = await res.json();
        const item = list.find(x => x[`${entity}_id`] === id);
        
        if (item) {
            populateFormFields(entity, item);
        } else {
            showGlobalAlert(`Could not retrieve ${entity} details.`, true);
            closeAdminModal();
        }
    } catch (e) {
        showGlobalAlert("Network error.", true);
        closeAdminModal();
    }
}

function generateFormFields(entity) {
    const container = document.getElementById("dynamicFormFields");
    container.innerHTML = "";

    if (entity === "service") {
        container.innerHTML = `
            <div class="form-group">
                <label>Service Name</label>
                <input type="text" id="field_service_name" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="field_category" class="form-control" required>
                    <option value="Hair Cut">Hair Cut</option>
                    <option value="Hair Styling">Hair Styling</option>
                    <option value="Hair Coloring">Hair Coloring</option>
                    <option value="Facial">Facial</option>
                    <option value="Spa">Spa</option>
                    <option value="Massage">Massage</option>
                    <option value="Manicure">Manicure</option>
                    <option value="Pedicure">Pedicure</option>
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Duration (Minutes)</label>
                    <input type="number" id="field_duration" class="form-control" required min="1">
                </div>
                <div class="form-group">
                    <label>Price (₹)</label>
                    <input type="number" id="field_price" class="form-control" required min="0">
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="field_description" class="form-control" rows="3" required></textarea>
            </div>
        `;
    } else if (entity === "stylist") {
        container.innerHTML = `
            <div class="form-group">
                <label>Stylist Name</label>
                <input type="text" id="field_stylist_name" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Specialization</label>
                <input type="text" id="field_specialization" class="form-control" placeholder="e.g. Hair Cut & Spa" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Experience (Years)</label>
                    <input type="number" id="field_experience" class="form-control" required min="0">
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" id="field_phone" class="form-control" required>
                </div>
            </div>
            <div class="form-group">
                <label>Availability</label>
                <select id="field_availability" class="form-control" required>
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Leave">Leave</option>
                </select>
            </div>
        `;
    } else if (entity === "customer") {
        container.innerHTML = `
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="field_full_name" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="field_email" class="form-control" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" id="field_phone" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Gender</label>
                    <select id="field_gender" class="form-control" required>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="text" id="field_password" class="form-control" required>
            </div>
        `;
    } else if (entity === "appointment") {
        container.innerHTML = `
            <div class="form-group">
                <label>Customer Name</label>
                <input type="text" id="field_customer_name" class="form-control" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Stylist Name</label>
                    <input type="text" id="field_stylist_name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Service Name</label>
                    <input type="text" id="field_service_name" class="form-control" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Date (YYYY-MM-DD)</label>
                    <input type="date" id="field_appointment_date" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Time (HH:MM)</label>
                    <input type="text" id="field_appointment_time" class="form-control" placeholder="e.g. 11:30" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Total Amount (₹)</label>
                    <input type="number" id="field_total_amount" class="form-control" required min="0">
                </div>
                <div class="form-group">
                    <label>Appointment Status</label>
                    <select id="field_appointment_status" class="form-control" required>
                        <option value="Booked">Booked</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
        `;
    } else if (entity === "payment") {
        container.innerHTML = `
            <div class="form-group">
                <label>Customer Name</label>
                <input type="text" id="field_customer_name" class="form-control" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Appointment ID</label>
                    <input type="number" id="field_appointment_id" class="form-control" required min="1">
                </div>
                <div class="form-group">
                    <label>Amount (₹)</label>
                    <input type="number" id="field_amount" class="form-control" required min="0">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Payment Method</label>
                    <select id="field_payment_method" class="form-control" required>
                        <option value="UPI">UPI</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="Cash">Cash</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Payment Status</label>
                    <select id="field_payment_status" class="form-control" required>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Transaction Date (YYYY-MM-DD)</label>
                <input type="date" id="field_payment_date" class="form-control" required>
            </div>
        `;
    }
}

function populateFormFields(entity, data) {
    if (entity === "service") {
        document.getElementById("field_service_name").value = data.service_name;
        document.getElementById("field_category").value = data.category;
        document.getElementById("field_duration").value = data.duration;
        document.getElementById("field_price").value = data.price;
        document.getElementById("field_description").value = data.description;
    } else if (entity === "stylist") {
        document.getElementById("field_stylist_name").value = data.stylist_name;
        document.getElementById("field_specialization").value = data.specialization;
        document.getElementById("field_experience").value = data.experience;
        document.getElementById("field_phone").value = data.phone;
        document.getElementById("field_availability").value = data.availability;
    } else if (entity === "customer") {
        document.getElementById("field_full_name").value = data.full_name;
        document.getElementById("field_email").value = data.email;
        document.getElementById("field_phone").value = data.phone;
        document.getElementById("field_gender").value = data.gender;
        document.getElementById("field_password").value = data.password;
    } else if (entity === "appointment") {
        document.getElementById("field_customer_name").value = data.customer_name;
        document.getElementById("field_stylist_name").value = data.stylist_name;
        document.getElementById("field_service_name").value = data.service_name;
        document.getElementById("field_appointment_date").value = data.appointment_date;
        document.getElementById("field_appointment_time").value = data.appointment_time;
        document.getElementById("field_total_amount").value = data.total_amount;
        document.getElementById("field_appointment_status").value = data.appointment_status;
    } else if (entity === "payment") {
        document.getElementById("field_customer_name").value = data.customer_name;
        document.getElementById("field_appointment_id").value = data.appointment_id;
        document.getElementById("field_amount").value = data.amount;
        document.getElementById("field_payment_method").value = data.payment_method;
        document.getElementById("field_payment_status").value = data.payment_status;
        document.getElementById("field_payment_date").value = data.payment_date;
    }
}

// Modal save submission
async function submitAdminForm() {
    const action = document.getElementById("modalAction").value;
    const entity = document.getElementById("modalEntity").value;
    const id = document.getElementById("modalId").value;
    const form = document.getElementById("adminModalForm");

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Assemble payload
    let payload = {};
    if (entity === "service") {
        payload = {
            service_name: document.getElementById("field_service_name").value.trim(),
            category: document.getElementById("field_category").value,
            duration: parseInt(document.getElementById("field_duration").value),
            price: parseFloat(document.getElementById("field_price").value),
            description: document.getElementById("field_description").value.trim()
        };
    } else if (entity === "stylist") {
        payload = {
            stylist_name: document.getElementById("field_stylist_name").value.trim(),
            specialization: document.getElementById("field_specialization").value.trim(),
            experience: parseInt(document.getElementById("field_experience").value),
            phone: document.getElementById("field_phone").value.trim(),
            availability: document.getElementById("field_availability").value
        };
    } else if (entity === "customer") {
        payload = {
            full_name: document.getElementById("field_full_name").value.trim(),
            email: document.getElementById("field_email").value.trim(),
            phone: document.getElementById("field_phone").value.trim(),
            gender: document.getElementById("field_gender").value,
            password: document.getElementById("field_password").value
        };
    } else if (entity === "appointment") {
        payload = {
            customer_name: document.getElementById("field_customer_name").value.trim(),
            stylist_name: document.getElementById("field_stylist_name").value.trim(),
            service_name: document.getElementById("field_service_name").value.trim(),
            appointment_date: document.getElementById("field_appointment_date").value,
            appointment_time: document.getElementById("field_appointment_time").value.trim(),
            total_amount: parseFloat(document.getElementById("field_total_amount").value),
            appointment_status: document.getElementById("field_appointment_status").value
        };
    } else if (entity === "payment") {
        payload = {
            customer_name: document.getElementById("field_customer_name").value.trim(),
            appointment_id: parseInt(document.getElementById("field_appointment_id").value),
            amount: parseFloat(document.getElementById("field_amount").value),
            payment_method: document.getElementById("field_payment_method").value,
            payment_status: document.getElementById("field_payment_status").value,
            payment_date: document.getElementById("field_payment_date").value
        };
    }

    let url = `${API_BASE}/${entity}s/add/`;
    let method = "POST";

    if (action === "edit") {
        url = `${API_BASE}/${entity}s/update/${id}/`;
        method = "PUT";
    }

    try {
        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showGlobalAlert(`${entity.toUpperCase()} saved successfully!`);
            closeAdminModal();
            loadAdminTables();
        } else {
            const err = await res.json();
            alert(err.error || "Save operation failed.");
        }
    } catch (e) {
        alert("Connection error.");
    }
}

// Delete item helper
async function deleteAdminEntity(entity, id) {
    if (!confirm(`Are you sure you want to permanently delete ${entity} #${id}?`)) return;

    try {
        const res = await fetch(`${API_BASE}/${entity}s/delete/${id}/`, {
            method: "DELETE"
        });

        if (res.ok) {
            showGlobalAlert(`${entity.toUpperCase()} #${id} deleted successfully.`);
            loadAdminTables();
        } else {
            const err = await res.json();
            alert(err.error || `Could not delete ${entity}.`);
        }
    } catch (e) {
        alert("Connection error.");
    }
}
