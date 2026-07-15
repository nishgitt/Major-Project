const API_URL = "http://127.0.0.1:8000";

// Global Session Status Check
document.addEventListener("DOMContentLoaded", () => {
    initSession();
    
    // Page specific initialization
    const path = window.location.pathname;
    if (path.includes("index.html") || path.endsWith("/")) {
        loadFeaturedCourses();
    } else if (path.includes("login.html")) {
        initLoginPage();
    } else if (path.includes("register.html")) {
        initRegisterPage();
    } else if (path.includes("courses.html")) {
        initCoursesPage();
    } else if (path.includes("enrollments.html")) {
        initEnrollmentsPage();
    } else if (path.includes("assignments.html")) {
        initAssignmentsPage();
    } else if (path.includes("dashboard.html")) {
        initDashboardPage();
    } else if (path.includes("admin.html")) {
        initAdminPage();
    }
});

// Session Management
function getSessionUser() {
    const userStr = localStorage.getItem("lms_user");
    return userStr ? JSON.parse(userStr) : null;
}

function initSession() {
    const user = getSessionUser();
    const authButtons = document.getElementById("auth-buttons");
    
    // Manage tab visibility depending on authorization
    const studentOnly = document.querySelectorAll(".student-only");
    const adminOnly = document.querySelectorAll(".admin-only");
    
    if (user) {
        // Logged In navbar view
        if (authButtons) {
            authButtons.innerHTML = `
                <div class="user-menu">
                    <span class="user-tag">${user.name} (${user.role})</span>
                    <button onclick="logout()" class="btn-secondary" style="padding: 0.5rem 1.2rem; font-size: 0.9rem;">Logout</button>
                </div>
            `;
        }
        
        if (user.role === "student") {
            studentOnly.forEach(el => el.style.display = "block");
            adminOnly.forEach(el => el.style.display = "none");
        } else if (user.role === "instructor") {
            studentOnly.forEach(el => el.style.display = "none");
            adminOnly.forEach(el => el.style.display = "block");
        }
    } else {
        // Logged Out navbar view
        studentOnly.forEach(el => el.style.display = "none");
        adminOnly.forEach(el => el.style.display = "none");
    }
}

function logout() {
    localStorage.removeItem("lms_user");
    window.location.href = "index.html";
}

// -------------------- LANDING PAGE --------------------
async function loadFeaturedCourses() {
    const grid = document.getElementById("featured-courses-list");
    if (!grid) return;
    
    try {
        const res = await fetch(`${API_URL}/courses/`);
        const courses = await res.json();
        
        // Show up to 3 featured courses
        const featured = courses.slice(0, 3);
        grid.innerHTML = "";
        
        if (featured.length === 0) {
            grid.innerHTML = "<p style='grid-column:1/-1; text-align:center; color:var(--text-muted);'>No courses available at this time.</p>";
            return;
        }
        
        featured.forEach(c => {
            grid.innerHTML += createCourseCard(c);
        });
    } catch (err) {
        console.error("Error loading featured courses:", err);
        grid.innerHTML = "<p style='grid-column:1/-1; text-align:center; color:var(--danger);'>Error communicating with Django server.</p>";
    }
}

function createCourseCard(c) {
    const user = getSessionUser();
    const enrollBtnText = user && user.role === "student" ? "Enroll Now" : "Login to Enroll";
    
    // Check level for custom badges
    let levelClass = "badge-beginner";
    if (c.level === "Intermediate") levelClass = "badge-intermediate";
    if (c.level === "Advanced") levelClass = "badge-advanced";
    
    return `
        <div class="glass-container glass-card course-card">
            <div class="course-header">
                <span class="course-badge ${levelClass}">${c.level}</span>
                <span class="course-level">${c.category}</span>
            </div>
            <h3 class="course-title">${c.course_name}</h3>
            <ul class="course-info-list">
                <li>👥 Instructor: ${c.instructor_name}</li>
                <li>⏱️ Duration: ${c.duration}</li>
            </ul>
            <div class="course-footer">
                <span class="course-price">${c.price > 0 ? '₹' + c.price : 'Free'}</span>
                <button class="btn-accent" style="padding: 0.5rem 1.2rem; font-size: 0.9rem;" onclick="handleCourseEnrollment('${c.course_name}')">${enrollBtnText}</button>
            </div>
        </div>
    `;
}

// -------------------- ENROLLMENT ACTION --------------------
async function handleCourseEnrollment(courseName) {
    const user = getSessionUser();
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    if (user.role !== "student") {
        alert("Instructors/Admins cannot enroll in courses.");
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const data = {
        student_name: user.name,
        course_name: courseName,
        enrollment_date: today,
        payment_status: "Paid",
        course_status: "Active"
    };
    
    try {
        const res = await fetch(`${API_URL}/enrollments/add/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            const modal = document.getElementById("enrollment-modal");
            const modalText = document.getElementById("enrollment-modal-text");
            if (modalText) modalText.innerText = `You are now enrolled in "${courseName}"!`;
            if (modal) modal.classList.add("show");
        } else {
            const err = await res.json();
            alert(`Enrollment failed: ${err.error}`);
        }
    } catch (err) {
        alert("Connection error. Ensure your Backend server is active.");
    }
}

function closeEnrollmentModal() {
    const modal = document.getElementById("enrollment-modal");
    if (modal) modal.classList.remove("show");
}

// -------------------- LOGIN PAGE --------------------
function initLoginPage() {
    const form = document.getElementById("login-form");
    if (!form) return;
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const role = document.getElementById("role-select").value;
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        const errorMsg = document.getElementById("login-error-msg");
        
        errorMsg.innerText = "";
        
        try {
            const res = await fetch(`${API_URL}/auth/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role, email, password })
            });
            
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("lms_user", JSON.stringify(data.user));
                if (data.user.role === "student") {
                    window.location.href = "dashboard.html";
                } else {
                    window.location.href = "admin.html";
                }
            } else {
                errorMsg.innerText = data.error || "Invalid credentials.";
            }
        } catch (err) {
            errorMsg.innerText = "Cannot connect to server. Check Django instance.";
        }
    });
}

// -------------------- REGISTER PAGE --------------------
function initRegisterPage() {
    const form = document.getElementById("register-form");
    if (!form) return;
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("reg-name").value;
        const email = document.getElementById("reg-email").value;
        const phone = document.getElementById("reg-phone").value;
        const qualification = document.getElementById("reg-qualification").value;
        const password = document.getElementById("reg-password").value;
        const errorMsg = document.getElementById("reg-error-msg");
        
        errorMsg.innerText = "";
        
        if (password.length < 6) {
            errorMsg.innerText = "Password must be at least 6 characters.";
            return;
        }
        
        const data = {
            full_name: name,
            email,
            phone,
            qualification,
            password
        };
        
        try {
            const res = await fetch(`${API_URL}/students/add/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            
            const resData = await res.json();
            if (res.ok) {
                alert("Account created successfully! Please login.");
                window.location.href = "login.html";
            } else {
                errorMsg.innerText = resData.error || "Registration failed.";
            }
        } catch (err) {
            errorMsg.innerText = "Cannot connect to server. Check Django instance.";
        }
    });
}

// -------------------- COURSES CATALOG PAGE --------------------
let allCourses = [];
function initCoursesPage() {
    const search = document.getElementById("course-search");
    const levelFilter = document.getElementById("course-level-filter");
    const priceFilter = document.getElementById("course-price-filter");
    
    if (search) search.addEventListener("input", filterAndRenderCourses);
    if (levelFilter) levelFilter.addEventListener("change", filterAndRenderCourses);
    if (priceFilter) priceFilter.addEventListener("change", filterAndRenderCourses);
    
    loadCatalogCourses();
}

async function loadCatalogCourses() {
    const grid = document.getElementById("courses-catalog-grid");
    if (!grid) return;
    
    try {
        const res = await fetch(`${API_URL}/courses/`);
        allCourses = await res.json();
        filterAndRenderCourses();
    } catch (err) {
        grid.innerHTML = "<p style='color:var(--danger);'>Error loading courses. Please check connection.</p>";
    }
}

function filterAndRenderCourses() {
    const grid = document.getElementById("courses-catalog-grid");
    if (!grid) return;
    
    const searchVal = document.getElementById("course-search").value.toLowerCase();
    const levelVal = document.getElementById("course-level-filter").value;
    const priceVal = document.getElementById("course-price-filter").value;
    
    let filtered = allCourses;
    
    if (searchVal) {
        filtered = filtered.filter(c => 
            c.course_name.toLowerCase().includes(searchVal) || 
            c.category.toLowerCase().includes(searchVal)
        );
    }
    
    if (levelVal !== "all") {
        filtered = filtered.filter(c => c.level === levelVal);
    }
    
    if (priceVal !== "all") {
        if (priceVal === "free") {
            filtered = filtered.filter(c => c.price === 0);
        } else {
            filtered = filtered.filter(c => c.price > 0);
        }
    }
    
    grid.innerHTML = "";
    if (filtered.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--text-muted);'>No courses match your filter options.</p>";
        return;
    }
    
    filtered.forEach(c => {
        grid.innerHTML += createCourseCard(c);
    });
}

// -------------------- ENROLLMENTS PAGE --------------------
async function initEnrollmentsPage() {
    const user = getSessionUser();
    const unauth = document.getElementById("enrollments-unauthorized");
    const list = document.getElementById("enrollments-list");
    const noEnroll = document.getElementById("no-enrollments-msg");
    
    if (!user || user.role !== "student") {
        if (unauth) unauth.style.display = "block";
        return;
    }
    
    if (list) list.style.display = "block";
    
    try {
        const res = await fetch(`${API_URL}/enrollments/`);
        const enrollments = await res.json();
        
        // Filter student specific enrollments
        const myEnrollments = enrollments.filter(e => e.student_name === user.name);
        
        if (myEnrollments.length === 0) {
            if (noEnroll) noEnroll.style.display = "block";
            if (list) list.style.display = "none";
            return;
        }
        
        list.innerHTML = "";
        myEnrollments.forEach(e => {
            // Determine percentage progress based on course status (Completed=100%, Active=50%, Cancelled=0%)
            let progressPct = 50;
            let barColor = "var(--secondary)";
            if (e.course_status === "Completed") {
                progressPct = 100;
                barColor = "var(--success)";
            } else if (e.course_status === "Cancelled") {
                progressPct = 0;
            }
            
            list.innerHTML += `
                <div class="glass-container progress-card" style="margin-bottom: 2rem;">
                    <div class="progress-meta">
                        <h3 style="font-size:1.4rem;">${e.course_name}</h3>
                        <span class="assignment-status ${e.course_status === 'Completed' ? 'status-evaluated' : e.course_status === 'Active' ? 'status-submitted' : 'status-pending'}">${e.course_status}</span>
                    </div>
                    <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom: 1rem;">Enrolled: ${e.enrollment_date} | Payment: <strong>${e.payment_status}</strong></p>
                    
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.4rem;">
                        <span>Course Completion Progress</span>
                        <span>${progressPct}%</span>
                    </div>
                    <div class="progress-bar-outer">
                        <div class="progress-bar-inner" style="width: ${progressPct}%; background:${barColor};"></div>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        if (list) list.innerHTML = "<p style='color:var(--danger);'>Error communicating with backend.</p>";
    }
}

// -------------------- ASSIGNMENTS PAGE --------------------
let availableCoursesForSubmission = [];

async function initAssignmentsPage() {
    const user = getSessionUser();
    const unauth = document.getElementById("assignments-unauthorized");
    const container = document.getElementById("assignments-container");
    
    if (!user || user.role !== "student") {
        if (unauth) unauth.style.display = "block";
        return;
    }
    
    if (container) container.style.display = "block";
    
    // Load student enrollments to allow submitting assignments to those courses
    try {
        const enrollRes = await fetch(`${API_URL}/enrollments/`);
        const enrolls = await enrollRes.json();
        availableCoursesForSubmission = enrolls.filter(e => e.student_name === user.name).map(e => e.course_name);
    } catch (err) {
        console.error("Error fetching courses for assignments:", err);
    }
    
    loadStudentAssignments();
}

async function loadStudentAssignments() {
    const user = getSessionUser();
    const container = document.getElementById("assignments-container");
    const noAss = document.getElementById("no-assignments-msg");
    if (!container) return;
    
    try {
        const res = await fetch(`${API_URL}/assignments/`);
        const assignments = await res.json();
        
        const myAssignments = assignments.filter(a => a.student_name === user.name);
        
        container.innerHTML = "";
        
        // Form to submit new assignment
        let formSection = `
            <div class="glass-container submit-form" style="margin-bottom: 3rem;">
                <h3 style="margin-bottom: 1.2rem; font-size: 1.3rem;">Submit Assignment Files</h3>
                <form id="new-assignment-form">
                    <div class="form-group">
                        <label for="ass-course-name">Course Name</label>
                        <select id="ass-course-name" class="form-control" required>
                            ${availableCoursesForSubmission.map(c => `<option value="${c}">${c}</option>`).join("")}
                            ${availableCoursesForSubmission.length === 0 ? `<option value="">No enrolled courses available</option>` : ""}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="ass-title">Assignment Title</label>
                        <input type="text" id="ass-title" class="form-control" placeholder="e.g. Django REST Setup" required>
                    </div>
                    <button type="submit" class="btn-primary" style="margin-top:0.5rem;" ${availableCoursesForSubmission.length === 0 ? 'disabled' : ''}>Submit Files</button>
                </form>
            </div>
        `;
        
        container.innerHTML = formSection;
        
        // Add event listener to form
        setTimeout(() => {
            const form = document.getElementById("new-assignment-form");
            if (form) {
                form.addEventListener("submit", handleNewAssignmentSubmit);
            }
        }, 100);
        
        if (myAssignments.length === 0) {
            container.innerHTML += `
                <div class="glass-container" style="padding:3rem; text-align:center;">
                    <h4>No submitted assignments yet</h4>
                    <p style="color:var(--text-muted); margin-top:0.5rem;">Use the form above to submit your first project files.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML += `<h3 style="margin-bottom:1.5rem;">Submission History</h3>`;
        
        myAssignments.forEach(a => {
            let badgeClass = "status-pending";
            if (a.status === "Submitted") badgeClass = "status-submitted";
            if (a.status === "Evaluated") badgeClass = "status-evaluated";
            
            container.innerHTML += `
                <div class="glass-container glass-card assignment-item">
                    <div class="assignment-head">
                        <h4 style="font-size:1.3rem;">${a.assignment_title}</h4>
                        <span class="assignment-status ${badgeClass}">${a.status}</span>
                    </div>
                    <div class="assignment-details">
                        <div>📚 Course: <strong>${a.course_name}</strong></div>
                        <div>📅 Submitted: ${a.submission_date}</div>
                        <div>💯 Marks: <strong>${a.status === 'Evaluated' ? a.marks + '/100' : 'Pending Evaluation'}</strong></div>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        container.innerHTML = "<p style='color:var(--danger);'>Error loading assignment information.</p>";
    }
}

async function handleNewAssignmentSubmit(e) {
    e.preventDefault();
    const user = getSessionUser();
    const course_name = document.getElementById("ass-course-name").value;
    const assignment_title = document.getElementById("ass-title").value;
    
    if (!course_name) {
        alert("Please enroll in a course first.");
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const data = {
        course_name,
        student_name: user.name,
        assignment_title,
        submission_date: today,
        marks: 0,
        status: "Submitted"
    };
    
    try {
        const res = await fetch(`${API_URL}/assignments/add/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            alert("Assignment submitted successfully!");
            loadStudentAssignments();
        } else {
            const err = await res.json();
            alert(`Failed: ${err.error}`);
        }
    } catch (err) {
        alert("Error connecting to server.");
    }
}

// -------------------- STUDENT DASHBOARD PAGE --------------------
async function initDashboardPage() {
    const user = getSessionUser();
    const unauth = document.getElementById("dashboard-unauthorized");
    const content = document.getElementById("dashboard-content");
    
    if (!user || user.role !== "student") {
        if (unauth) unauth.style.display = "block";
        return;
    }
    
    if (content) content.style.display = "grid";
    
    // Load student credentials details
    document.getElementById("student-profile-name").innerText = user.name;
    document.getElementById("student-email").innerText = user.email;
    document.getElementById("student-avatar-letter").innerText = user.name[0].toUpperCase();
    
    try {
        // Fetch student records from database to fetch phone/qualification details
        const studRes = await fetch(`${API_URL}/students/`);
        const students = await studRes.json();
        const me = students.find(s => s.email === user.email);
        if (me) {
            document.getElementById("student-phone").innerText = me.phone;
            document.getElementById("student-qualification").innerText = me.qualification;
        }
    } catch (err) {
        console.error("Error reading full student meta:", err);
    }
    
    loadDashboardStats();
}

async function loadDashboardStats() {
    const user = getSessionUser();
    const cardsContainer = document.getElementById("student-progress-cards");
    if (!cardsContainer) return;
    
    try {
        const [enrollRes, assignRes] = await Promise.all([
            fetch(`${API_URL}/enrollments/`),
            fetch(`${API_URL}/assignments/`)
        ]);
        
        const enrollments = await enrollRes.json();
        const assignments = await assignRes.json();
        
        const myEnrollments = enrollments.filter(e => e.student_name === user.name);
        const myAssignments = assignments.filter(a => a.student_name === user.name);
        
        const total = myEnrollments.length;
        const active = myEnrollments.filter(e => e.course_status === "Active").length;
        const completed = myEnrollments.filter(e => e.course_status === "Completed").length;
        const submittedAss = myAssignments.length;
        
        document.getElementById("stat-total-courses").innerText = total;
        document.getElementById("stat-active-courses").innerText = active;
        document.getElementById("stat-completed-courses").innerText = completed;
        document.getElementById("stat-assignments-done").innerText = submittedAss;
        
        cardsContainer.innerHTML = "";
        
        if (myEnrollments.length === 0) {
            cardsContainer.innerHTML = "<p style='color:var(--text-muted); text-align:center; padding: 2rem 0;'>You have not registered for any courses yet.</p>";
            return;
        }
        
        myEnrollments.forEach(e => {
            let progress = 50;
            if (e.course_status === "Completed") progress = 100;
            if (e.course_status === "Cancelled") progress = 0;
            
            let actionBtn = "";
            if (progress === 100) {
                actionBtn = `<button class="btn-accent" style="padding: 0.4rem 1rem; font-size: 0.85rem;" onclick="generateCertificate('${e.course_name}', '${e.enrollment_date}')">View Certificate</button>`;
            } else {
                actionBtn = `<span style="font-size:0.85rem; color:var(--text-muted);">In Progress</span>`;
            }
            
            cardsContainer.innerHTML += `
                <div class="glass-container progress-card">
                    <div class="progress-meta">
                        <h4>${e.course_name}</h4>
                        <span>${progress}% Complete</span>
                    </div>
                    <div class="progress-bar-outer">
                        <div class="progress-bar-inner" style="width: ${progress}%;"></div>
                    </div>
                    <div class="progress-actions">
                        <span style="font-size:0.85rem; color:var(--text-muted);">Status: ${e.course_status}</span>
                        ${actionBtn}
                    </div>
                </div>
            `;
        });
    } catch (err) {
        cardsContainer.innerHTML = "<p style='color:var(--danger);'>Error calculating stats.</p>";
    }
}

function generateCertificate(courseName, completionDate) {
    const user = getSessionUser();
    document.getElementById("cert-student-name").innerText = user.name;
    document.getElementById("cert-course-name").innerText = courseName;
    document.getElementById("cert-date").innerText = completionDate;
    
    const modal = document.getElementById("certificate-modal");
    if (modal) modal.classList.add("show");
}

function closeCertificateModal() {
    const modal = document.getElementById("certificate-modal");
    if (modal) modal.classList.remove("show");
}

// -------------------- INSTRUCTOR ADMIN PAGE --------------------
let activeTab = "students";
let editingId = null;

function initAdminPage() {
    const user = getSessionUser();
    const unauth = document.getElementById("admin-unauthorized");
    const content = document.getElementById("admin-content");
    
    if (!user || user.role !== "instructor") {
        if (unauth) unauth.style.display = "block";
        return;
    }
    
    if (content) content.style.display = "grid";
    
    // Load default tab
    switchAdminTab("students");
    
    // Add form submit listener
    const form = document.getElementById("crud-form");
    if (form) {
        form.addEventListener("submit", handleCrudFormSubmit);
    }
}

function switchAdminTab(tabName) {
    activeTab = tabName;
    
    // Manage sidebar buttons
    const btns = document.querySelectorAll(".admin-sidebar .admin-tab-btn");
    btns.forEach(btn => {
        if (btn.innerText.toLowerCase() === tabName) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
    
    // Manage title
    const title = document.getElementById("admin-panel-title");
    title.innerText = `Manage ${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
    
    loadAdminGrid();
}

async function loadAdminGrid() {
    const table = document.getElementById("admin-data-table");
    if (!table) return;
    
    try {
        const res = await fetch(`${API_URL}/${activeTab}/`);
        const data = await res.json();
        
        table.innerHTML = "";
        
        if (data.length === 0) {
            table.innerHTML = `<tr><td style="text-align:center; padding:3rem; color:var(--text-muted);">No records found in database.</td></tr>`;
            return;
        }
        
        // Dynamic headers depending on active tab
        let headers = [];
        let rowBuilder = null;
        
        if (activeTab === "students") {
            headers = ["ID", "Name", "Email", "Phone", "Qualification", "Actions"];
            rowBuilder = (s) => `
                <tr>
                    <td>${s.student_id}</td>
                    <td><strong>${s.full_name}</strong></td>
                    <td>${s.email}</td>
                    <td>${s.phone}</td>
                    <td>${s.qualification}</td>
                    <td class="actions-cell">
                        <button class="btn-icon btn-edit" onclick="openCrudModal('edit', ${s.student_id}, ${JSON.stringify(s).replace(/"/g, '&quot;')})">Edit</button>
                        <button class="btn-icon btn-delete" onclick="handleCrudDelete(${s.student_id})">Delete</button>
                    </td>
                </tr>
            `;
        } else if (activeTab === "instructors") {
            headers = ["ID", "Instructor Name", "Specialization", "Experience (Yrs)", "Email", "Phone", "Actions"];
            rowBuilder = (i) => `
                <tr>
                    <td>${i.instructor_id}</td>
                    <td><strong>${i.instructor_name}</strong></td>
                    <td>${i.specialization}</td>
                    <td>${i.experience}</td>
                    <td>${i.email}</td>
                    <td>${i.phone}</td>
                    <td class="actions-cell">
                        <button class="btn-icon btn-edit" onclick="openCrudModal('edit', ${i.instructor_id}, ${JSON.stringify(i).replace(/"/g, '&quot;')})">Edit</button>
                        <button class="btn-icon btn-delete" onclick="handleCrudDelete(${i.instructor_id})">Delete</button>
                    </td>
                </tr>
            `;
        } else if (activeTab === "courses") {
            headers = ["ID", "Course Title", "Instructor", "Category", "Duration", "Price", "Level", "Actions"];
            rowBuilder = (c) => `
                <tr>
                    <td>${c.course_id}</td>
                    <td><strong>${c.course_name}</strong></td>
                    <td>${c.instructor_name}</td>
                    <td>${c.category}</td>
                    <td>${c.duration}</td>
                    <td>₹${c.price}</td>
                    <td><span class="course-badge">${c.level}</span></td>
                    <td class="actions-cell">
                        <button class="btn-icon btn-edit" onclick="openCrudModal('edit', ${c.course_id}, ${JSON.stringify(c).replace(/"/g, '&quot;')})">Edit</button>
                        <button class="btn-icon btn-delete" onclick="handleCrudDelete(${c.course_id})">Delete</button>
                    </td>
                </tr>
            `;
        } else if (activeTab === "enrollments") {
            headers = ["ID", "Student", "Course Name", "Enrollment Date", "Payment Status", "Course Status", "Actions"];
            rowBuilder = (e) => `
                <tr>
                    <td>${e.enrollment_id}</td>
                    <td><strong>${e.student_name}</strong></td>
                    <td>${e.course_name}</td>
                    <td>${e.enrollment_date}</td>
                    <td>${e.payment_status}</td>
                    <td><span class="course-badge">${e.course_status}</span></td>
                    <td class="actions-cell">
                        <button class="btn-icon btn-edit" onclick="openCrudModal('edit', ${e.enrollment_id}, ${JSON.stringify(e).replace(/"/g, '&quot;')})">Edit</button>
                        <button class="btn-icon btn-delete" onclick="handleCrudDelete(${e.enrollment_id})">Delete</button>
                    </td>
                </tr>
            `;
        } else if (activeTab === "assignments") {
            headers = ["ID", "Assignment Title", "Course Name", "Student", "Submission Date", "Marks", "Status", "Actions"];
            rowBuilder = (a) => `
                <tr>
                    <td>${a.assignment_id}</td>
                    <td><strong>${a.assignment_title}</strong></td>
                    <td>${a.course_name}</td>
                    <td>${a.student_name}</td>
                    <td>${a.submission_date}</td>
                    <td>${a.status === 'Evaluated' ? a.marks + '/100' : 'Pending'}</td>
                    <td><span class="course-badge">${a.status}</span></td>
                    <td class="actions-cell">
                        <button class="btn-icon btn-edit" onclick="openCrudModal('edit', ${a.assignment_id}, ${JSON.stringify(a).replace(/"/g, '&quot;')})">Grade/Edit</button>
                        <button class="btn-icon btn-delete" onclick="handleCrudDelete(${a.assignment_id})">Delete</button>
                    </td>
                </tr>
            `;
        }
        
        let headerRow = `<tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>`;
        table.innerHTML = `<thead>${headerRow}</thead><tbody></tbody>`;
        
        const tbody = table.querySelector("tbody");
        data.forEach(item => {
            tbody.innerHTML += rowBuilder(item);
        });
    } catch (err) {
        table.innerHTML = `<tr><td style="color:var(--danger); text-align:center; padding:2rem;">Connection Error to APIs.</td></tr>`;
    }
}

// Open CRUD modal (Add/Edit)
function openCrudModal(mode, id = null, itemData = null) {
    const modal = document.getElementById("crud-modal");
    const modalTitle = document.getElementById("crud-modal-title");
    const fieldsContainer = document.getElementById("crud-form-fields");
    
    editingId = id;
    modalTitle.innerText = mode === "add" ? `Add New ${activeTab.slice(0, -1)}` : `Modify ${activeTab.slice(0, -1)}`;
    
    fieldsContainer.innerHTML = "";
    
    if (activeTab === "students") {
        fieldsContainer.innerHTML = `
            <div class="form-group">
                <label>Student ID (Optional)</label>
                <input type="number" id="field-student_id" class="form-control" placeholder="Automatic if empty" ${mode === 'edit' ? 'readonly' : ''} value="${itemData ? itemData.student_id : ''}">
            </div>
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="field-full_name" class="form-control" required value="${itemData ? itemData.full_name : ''}">
            </div>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="field-email" class="form-control" required value="${itemData ? itemData.email : ''}">
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" id="field-phone" class="form-control" required value="${itemData ? itemData.phone : ''}">
            </div>
            <div class="form-group">
                <label>Qualification</label>
                <input type="text" id="field-qualification" class="form-control" required value="${itemData ? itemData.qualification : ''}">
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="field-password" class="form-control" required value="${itemData ? itemData.password : ''}">
            </div>
        `;
    } else if (activeTab === "instructors") {
        fieldsContainer.innerHTML = `
            <div class="form-group">
                <label>Instructor ID (Optional)</label>
                <input type="number" id="field-instructor_id" class="form-control" placeholder="Automatic if empty" ${mode === 'edit' ? 'readonly' : ''} value="${itemData ? itemData.instructor_id : ''}">
            </div>
            <div class="form-group">
                <label>Instructor Name</label>
                <input type="text" id="field-instructor_name" class="form-control" required value="${itemData ? itemData.instructor_name : ''}">
            </div>
            <div class="form-group">
                <label>Specialization</label>
                <input type="text" id="field-specialization" class="form-control" required value="${itemData ? itemData.specialization : ''}">
            </div>
            <div class="form-group">
                <label>Experience (Years)</label>
                <input type="number" id="field-experience" class="form-control" required value="${itemData ? itemData.experience : ''}">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="field-email" class="form-control" required value="${itemData ? itemData.email : ''}">
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="tel" id="field-phone" class="form-control" required value="${itemData ? itemData.phone : ''}">
            </div>
        `;
    } else if (activeTab === "courses") {
        fieldsContainer.innerHTML = `
            <div class="form-group">
                <label>Course ID (Optional)</label>
                <input type="number" id="field-course_id" class="form-control" placeholder="Automatic if empty" ${mode === 'edit' ? 'readonly' : ''} value="${itemData ? itemData.course_id : ''}">
            </div>
            <div class="form-group">
                <label>Course Name</label>
                <input type="text" id="field-course_name" class="form-control" required value="${itemData ? itemData.course_name : ''}">
            </div>
            <div class="form-group">
                <label>Instructor Name</label>
                <input type="text" id="field-instructor_name" class="form-control" required value="${itemData ? itemData.instructor_name : ''}">
            </div>
            <div class="form-group">
                <label>Category</label>
                <input type="text" id="field-category" class="form-control" required value="${itemData ? itemData.category : ''}">
            </div>
            <div class="form-group">
                <label>Duration</label>
                <input type="text" id="field-duration" class="form-control" placeholder="e.g. 6 Months" required value="${itemData ? itemData.duration : ''}">
            </div>
            <div class="form-group">
                <label>Price (₹)</label>
                <input type="number" id="field-price" class="form-control" required value="${itemData ? itemData.price : ''}">
            </div>
            <div class="form-group">
                <label>Level</label>
                <select id="field-level" class="form-control" required>
                    <option value="Beginner" ${itemData && itemData.level === 'Beginner' ? 'selected' : ''}>Beginner</option>
                    <option value="Intermediate" ${itemData && itemData.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                    <option value="Advanced" ${itemData && itemData.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
                </select>
            </div>
        `;
    } else if (activeTab === "enrollments") {
        fieldsContainer.innerHTML = `
            <div class="form-group">
                <label>Enrollment ID (Optional)</label>
                <input type="number" id="field-enrollment_id" class="form-control" placeholder="Automatic if empty" ${mode === 'edit' ? 'readonly' : ''} value="${itemData ? itemData.enrollment_id : ''}">
            </div>
            <div class="form-group">
                <label>Student Name</label>
                <input type="text" id="field-student_name" class="form-control" required value="${itemData ? itemData.student_name : ''}">
            </div>
            <div class="form-group">
                <label>Course Name</label>
                <input type="text" id="field-course_name" class="form-control" required value="${itemData ? itemData.course_name : ''}">
            </div>
            <div class="form-group">
                <label>Enrollment Date</label>
                <input type="date" id="field-enrollment_date" class="form-control" required value="${itemData ? itemData.enrollment_date : ''}">
            </div>
            <div class="form-group">
                <label>Payment Status</label>
                <select id="field-payment_status" class="form-control" required>
                    <option value="Paid" ${itemData && itemData.payment_status === 'Paid' ? 'selected' : ''}>Paid</option>
                    <option value="Pending" ${itemData && itemData.payment_status === 'Pending' ? 'selected' : ''}>Pending</option>
                </select>
            </div>
            <div class="form-group">
                <label>Course Status</label>
                <select id="field-course_status" class="form-control" required>
                    <option value="Active" ${itemData && itemData.course_status === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="Completed" ${itemData && itemData.course_status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="Cancelled" ${itemData && itemData.course_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
        `;
    } else if (activeTab === "assignments") {
        fieldsContainer.innerHTML = `
            <div class="form-group">
                <label>Assignment ID (Optional)</label>
                <input type="number" id="field-assignment_id" class="form-control" placeholder="Automatic if empty" ${mode === 'edit' ? 'readonly' : ''} value="${itemData ? itemData.assignment_id : ''}">
            </div>
            <div class="form-group">
                <label>Assignment Title</label>
                <input type="text" id="field-assignment_title" class="form-control" required value="${itemData ? itemData.assignment_title : ''}">
            </div>
            <div class="form-group">
                <label>Course Name</label>
                <input type="text" id="field-course_name" class="form-control" required value="${itemData ? itemData.course_name : ''}">
            </div>
            <div class="form-group">
                <label>Student Name</label>
                <input type="text" id="field-student_name" class="form-control" required value="${itemData ? itemData.student_name : ''}">
            </div>
            <div class="form-group">
                <label>Submission Date</label>
                <input type="date" id="field-submission_date" class="form-control" required value="${itemData ? itemData.submission_date : ''}">
            </div>
            <div class="form-group">
                <label>Marks</label>
                <input type="number" id="field-marks" class="form-control" min="0" max="100" required value="${itemData ? itemData.marks : 0}">
            </div>
            <div class="form-group">
                <label>Grading Status</label>
                <select id="field-status" class="form-control" required>
                    <option value="Pending" ${itemData && itemData.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Submitted" ${itemData && itemData.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
                    <option value="Evaluated" ${itemData && itemData.status === 'Evaluated' ? 'selected' : ''}>Evaluated</option>
                </select>
            </div>
        `;
    }
    
    if (modal) modal.classList.add("show");
}

function closeCrudModal() {
    const modal = document.getElementById("crud-modal");
    if (modal) modal.classList.remove("show");
}

// Handle Add/Edit Form submit
async function handleCrudFormSubmit(e) {
    e.preventDefault();
    
    let data = {};
    const fields = document.querySelectorAll("#crud-form-fields input, #crud-form-fields select");
    fields.forEach(f => {
        let key = f.id.replace("field-", "");
        data[key] = f.value;
    });
    
    const isEdit = (editingId !== null);
    const endpoint = isEdit 
        ? `${API_URL}/${activeTab}/update/${editingId}/`
        : `${API_URL}/${activeTab}/add/`;
        
    const method = isEdit ? "PUT" : "POST";
    
    try {
        const res = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            closeCrudModal();
            loadAdminGrid();
        } else {
            const err = await res.json();
            alert(`Execution failed: ${err.error}`);
        }
    } catch (err) {
        alert("API connection failed. Check your Django instance status.");
    }
}

// Handle deletion
async function handleCrudDelete(id) {
    if (!confirm(`Are you sure you want to delete entry ${id}?`)) return;
    
    try {
        const res = await fetch(`${API_URL}/${activeTab}/delete/${id}/`, {
            method: "DELETE"
        });
        
        if (res.ok) {
            loadAdminGrid();
        } else {
            alert("Delete failed.");
        }
    } catch (err) {
        alert("API connection failed.");
    }
}
