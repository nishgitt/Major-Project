const API_BASE_URL = 'http://127.0.0.1:8000';

// Global state
let currentUser = null;
let userRole = null; // 'candidate', 'employer', 'admin'

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initSession();
    renderNavigation();
    initPageRouter();
    initToast();
});

// Toast notification setup
function initToast() {
    if (!document.getElementById('toast-notification')) {
        const toast = document.createElement('div');
        toast.id = 'toast-notification';
        document.body.appendChild(toast);
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    
    let emoji = 'ℹ️';
    if (type === 'success') emoji = '✅';
    if (type === 'danger') emoji = '❌';
    if (type === 'warning') emoji = '⚠️';
    
    toast.innerHTML = `<span>${emoji}</span> <span>${message}</span>`;
    toast.style.display = 'flex';
    
    // Set colors based on type
    if (type === 'success') {
        toast.style.borderColor = 'var(--color-success)';
        toast.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.3)';
    } else if (type === 'danger') {
        toast.style.borderColor = 'var(--color-danger)';
        toast.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.3)';
    } else {
        toast.style.borderColor = 'var(--accent-cyan)';
        toast.style.boxShadow = 'var(--glow-cyan)';
    }
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 4000);
}

// Session Helpers
function initSession() {
    const userStr = localStorage.getItem('job_portal_user');
    const roleStr = localStorage.getItem('job_portal_role');
    
    if (userStr && roleStr) {
        currentUser = JSON.parse(userStr);
        userRole = roleStr;
    }
}

function setCurrentUser(user, role) {
    currentUser = user;
    userRole = role;
    localStorage.setItem('job_portal_user', JSON.stringify(user));
    localStorage.setItem('job_portal_role', role);
}

function logout() {
    currentUser = null;
    userRole = null;
    localStorage.removeItem('job_portal_user');
    localStorage.removeItem('job_portal_role');
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// REST API Request Wrappers
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Add default headers for json requests
    if (options.body && typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
        options.headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
    }
    
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Fetch API Error: ${error.message}`);
        throw error;
    }
}

// Render dynamic navbar based on user role
function renderNavigation() {
    const container = document.querySelector('.nav-container');
    if (!container) return;
    
    const activePage = window.location.pathname.split('/').pop() || 'index.html';
    
    let linksHTML = `
        <ul class="nav-links">
            <li><a href="index.html" class="${activePage === 'index.html' ? 'active' : ''}">Home</a></li>
            <li><a href="jobs.html" class="${activePage === 'jobs.html' ? 'active' : ''}">Jobs</a></li>
    `;
    
    if (userRole === 'candidate') {
        linksHTML += `
            <li><a href="applications.html" class="${activePage === 'applications.html' ? 'active' : ''}">My Applications</a></li>
            <li><a href="interviews.html" class="${activePage === 'interviews.html' ? 'active' : ''}">Interviews</a></li>
            <li><a href="candidate_dashboard.html" class="${activePage === 'candidate_dashboard.html' ? 'active' : ''}">Dashboard</a></li>
        `;
    } else if (userRole === 'employer') {
        linksHTML += `
            <li><a href="interviews.html" class="${activePage === 'interviews.html' ? 'active' : ''}">Manage Interviews</a></li>
            <li><a href="employer_dashboard.html" class="${activePage === 'employer_dashboard.html' ? 'active' : ''}">Employer Panel</a></li>
        `;
    } else if (userRole === 'admin') {
        linksHTML += `
            <li><a href="admin_dashboard.html" class="${activePage === 'admin_dashboard.html' ? 'active' : ''}">Admin Control</a></li>
        `;
    }
    
    linksHTML += `</ul>`;
    
    let authHTML = '';
    if (currentUser) {
        authHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span style="font-size: 0.9rem; color: var(--text-secondary);">
                    Hi, <strong style="color: #fff;">${userRole === 'employer' ? currentUser.company_name : currentUser.full_name || 'User'}</strong>
                    <span style="font-size: 0.75rem; text-transform: uppercase; padding: 0.15rem 0.5rem; background: rgba(255,255,255,0.08); border-radius: 4px; margin-left: 0.3rem;">${userRole}</span>
                </span>
                <button onclick="logout()" class="btn btn-secondary btn-sm" style="padding: 0.4rem 1rem;">Logout</button>
            </div>
        `;
    } else {
        authHTML = `
            <div style="display: flex; gap: 0.8rem;">
                <a href="login.html" class="btn btn-secondary">Login</a>
                <a href="register.html" class="btn btn-primary">Register</a>
            </div>
        `;
    }
    
    container.innerHTML = `
        <a href="index.html" class="logo">CareerZap</a>
        ${linksHTML}
        ${authHTML}
    `;
}

// Router to match current page to code logic
function initPageRouter() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    
    if (path === 'index.html') {
        initHome();
    } else if (path === 'login.html') {
        initLogin();
    } else if (path === 'register.html') {
        initRegister();
    } else if (path === 'jobs.html') {
        initJobs();
    } else if (path === 'applications.html') {
        initApplications();
    } else if (path === 'interviews.html') {
        initInterviews();
    } else if (path === 'candidate_dashboard.html') {
        initCandidateDashboard();
    } else if (path === 'employer_dashboard.html') {
        initEmployerDashboard();
    } else if (path === 'admin_dashboard.html') {
        initAdminDashboard();
    }
}

// ==================== 1. HOME PAGE LOGIC ====================
async function initHome() {
    // Implement Search redirection
    const searchForm = document.getElementById('home-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const keyword = document.getElementById('search-keyword').value;
            const location = document.getElementById('search-location').value;
            window.location.href = `jobs.html?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`;
        });
    }
    
    // Load Latest Jobs (Limit to 6)
    try {
        const jobs = await fetchAPI('/jobs/');
        const latestJobsGrid = document.getElementById('latest-jobs-grid');
        if (latestJobsGrid) {
            // Sort by ID descending
            const sortedJobs = jobs.sort((a, b) => b.job_id - a.job_id).slice(0, 6);
            if (sortedJobs.length === 0) {
                latestJobsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No job vacancies found.</p>`;
            } else {
                latestJobsGrid.innerHTML = sortedJobs.map(job => renderJobCard(job)).join('');
            }
        }
    } catch (err) {
        showToast('Failed to load latest jobs', 'danger');
    }
    
    // Load Featured Companies profile details click
    const companyCards = document.querySelectorAll('.company-card');
    companyCards.forEach(card => {
        card.addEventListener('click', async () => {
            const compName = card.dataset.company;
            if (!compName) return;
            
            // Get all jobs for this company
            try {
                const allJobs = await fetchAPI('/jobs/');
                const companyJobs = allJobs.filter(j => j.company_name.toLowerCase() === compName.toLowerCase());
                
                // Get company profile details from employers
                const employers = await fetchAPI('/employers/');
                const employer = employers.find(e => e.company_name.toLowerCase() === compName.toLowerCase()) || {
                    company_name: compName,
                    hr_name: 'HR Team',
                    email: `hr@${compName.toLowerCase()}.com`,
                    phone: 'N/A',
                    location: 'Multiple Locations',
                    industry: 'Tech Industry'
                };
                
                openCompanyModal(employer, companyJobs);
            } catch (err) {
                showToast('Failed to load company details', 'danger');
            }
        });
    });
}

function openCompanyModal(employer, jobs) {
    // Create modal element if it doesn't exist
    let modal = document.getElementById('company-details-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'company-details-modal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }
    
    const jobsListHTML = jobs.map(j => `
        <div style="padding: 0.8rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong style="color: #fff;">${j.job_title}</strong><br>
                <span style="font-size: 0.8rem; color: var(--text-secondary);">${j.location} • ${j.job_type}</span>
            </div>
            <a href="jobs.html?job_id=${j.job_id}" class="btn btn-outline" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">View</a>
        </div>
    `).join('') || '<p style="color: var(--text-muted); font-size: 0.9rem;">No active job openings.</p>';

    modal.innerHTML = `
        <div class="modal-content company-details-popup">
            <button class="modal-close" onclick="closeModal('company-details-modal')">&times;</button>
            <div class="company-logo-placeholder" style="margin: 0 auto 1rem; width: 70px; height: 70px; font-size: 2rem;">
                ${employer.company_name.charAt(0)}
            </div>
            <h2>${employer.company_name}</h2>
            <div class="industry">${employer.industry}</div>
            
            <div class="company-details-info">
                <p><span class="label">Headquarters:</span> <span class="value">${employer.location}</span></p>
                <p><span class="label">Contact Email:</span> <span class="value">${employer.email}</span></p>
                <p><span class="label">HR Partner:</span> <span class="value">${employer.hr_name}</span></p>
                <p><span class="label">Phone:</span> <span class="value">${employer.phone}</span></p>
            </div>
            
            <div style="text-align: left;">
                <h4 style="font-family: var(--font-outfit); margin-bottom: 1rem; color: #fff;">Open Positions (${jobs.length})</h4>
                ${jobsListHTML}
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function renderJobCard(job) {
    const isLoggedOut = !currentUser;
    const isCandidate = userRole === 'candidate';
    
    let actionBtnHTML = '';
    if (isLoggedOut) {
        actionBtnHTML = `<a href="login.html" class="btn btn-outline btn-sm" style="padding: 0.4rem 1rem; font-size: 0.85rem;">Login to Apply</a>`;
    } else if (isCandidate) {
        actionBtnHTML = `<button onclick="applyForJob(${job.job_id}, '${job.job_title}', '${job.company_name}')" class="btn btn-primary btn-sm" style="padding: 0.4rem 1rem; font-size: 0.85rem;">Apply Now</button>`;
    } else {
        actionBtnHTML = `<span style="font-size: 0.8rem; color: var(--text-muted);">Employer View</span>`;
    }

    return `
        <div class="job-card">
            <span class="job-badge">${job.job_type}</span>
            <div class="company">${job.company_name}</div>
            <h3>${job.job_title}</h3>
            <div class="details">
                <span>📍 ${job.location}</span>
                <span>💼 Min. ${job.experience_required} yrs exp</span>
            </div>
            <div class="salary">₹${job.salary.toLocaleString()}/yr</div>
            <div class="footer">
                <div class="deadline">Ends: ${job.last_date}</div>
                ${actionBtnHTML}
            </div>
        </div>
    `;
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

async function applyForJob(jobId, jobTitle, companyName) {
    if (!currentUser || userRole !== 'candidate') {
        showToast('Please login as a Candidate to apply', 'warning');
        return;
    }
    
    // Check if already applied
    try {
        const apps = await fetchAPI('/applications/');
        const exists = apps.some(a => a.candidate_name === currentUser.full_name && a.job_title === jobTitle && a.company_name === companyName);
        if (exists) {
            showToast('You have already applied to this job vacancy!', 'warning');
            return;
        }
        
        // Add job application
        const payload = {
            candidate_name: currentUser.full_name,
            company_name: companyName,
            job_title: jobTitle,
            applied_date: new Date().toISOString().split('T')[0],
            resume: currentUser.full_name.toLowerCase().replace(' ', '_') + '_resume.pdf',
            application_status: 'Applied'
        };
        
        await fetchAPI('/applications/add/', {
            method: 'POST',
            body: payload
        });
        
        showToast('Applied successfully! Track status in My Applications.', 'success');
    } catch (err) {
        showToast('Application submission failed: ' + err.message, 'danger');
    }
}


// ==================== 2. LOGIN LOGIC ====================
function initLogin() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    // Tab switching logic
    const tabs = document.querySelectorAll('.tab-btn');
    let activeRole = 'candidate';
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeRole = tab.dataset.role;
        });
    });
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (activeRole === 'admin') {
            // Admin Static Login Check
            if (email === 'admin@careerzap.com' && password === 'admin123') {
                setCurrentUser({ full_name: 'Administrator', email: email }, 'admin');
                showToast('Welcome back, Admin!', 'success');
                setTimeout(() => { window.location.href = 'admin_dashboard.html'; }, 1000);
            } else {
                showToast('Invalid Administrator credentials', 'danger');
            }
            return;
        }
        
        const endpoint = activeRole === 'candidate' ? '/candidates/login/' : '/employers/login/';
        
        try {
            const data = await fetchAPI(endpoint, {
                method: 'POST',
                body: { email, password }
            });
            
            setCurrentUser(data.user, data.role);
            showToast(`Welcome, ${data.role === 'employer' ? data.user.company_name : data.user.full_name}!`, 'success');
            
            setTimeout(() => {
                if (data.role === 'candidate') {
                    window.location.href = 'candidate_dashboard.html';
                } else {
                    window.location.href = 'employer_dashboard.html';
                }
            }, 1000);
        } catch (err) {
            showToast(err.message, 'danger');
        }
    });
}


// ==================== 3. REGISTER LOGIC ====================
function initRegister() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;
    
    const tabs = document.querySelectorAll('.tab-btn');
    const candidateFields = document.getElementById('candidate-register-fields');
    const employerFields = document.getElementById('employer-register-fields');
    let activeRole = 'candidate';
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeRole = tab.dataset.role;
            
            if (activeRole === 'candidate') {
                candidateFields.style.display = 'block';
                employerFields.style.display = 'none';
                // Add required property
                candidateFields.querySelectorAll('input, select').forEach(el => el.setAttribute('required', ''));
                employerFields.querySelectorAll('input, select').forEach(el => el.removeAttribute('required'));
            } else {
                candidateFields.style.display = 'none';
                employerFields.style.display = 'block';
                // Add required property
                candidateFields.querySelectorAll('input, select').forEach(el => el.removeAttribute('required'));
                employerFields.querySelectorAll('input, select').forEach(el => el.setAttribute('required', ''));
            }
        });
    });
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const password = document.getElementById('reg-password').value;
        
        let payload = {};
        let endpoint = '';
        
        if (activeRole === 'candidate') {
            payload = {
                full_name: document.getElementById('reg-fullname').value,
                email: email,
                phone: phone,
                qualification: document.getElementById('reg-qualification').value,
                skills: document.getElementById('reg-skills').value,
                experience: parseInt(document.getElementById('reg-experience').value) || 0,
                password: password
            };
            endpoint = '/candidates/add/';
        } else {
            payload = {
                company_name: document.getElementById('reg-companyname').value,
                hr_name: document.getElementById('reg-hrname').value,
                email: email,
                phone: phone,
                location: document.getElementById('reg-location').value,
                industry: document.getElementById('reg-industry').value,
                password: password
            };
            endpoint = '/employers/add/';
        }
        
        try {
            await fetchAPI(endpoint, {
                method: 'POST',
                body: payload
            });
            showToast('Registration successful! Please login.', 'success');
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        } catch (err) {
            showToast('Registration failed: ' + err.message, 'danger');
        }
    });
}


// ==================== 4. JOBS SEARCH PAGE LOGIC ====================
let allJobsList = [];

async function initJobs() {
    // Handle specific job_id parameter from Home modal
    const urlParams = new URLSearchParams(window.location.search);
    const filterKeyword = urlParams.get('keyword') || '';
    const filterLocation = urlParams.get('location') || '';
    const targetJobId = urlParams.get('job_id') || '';
    
    try {
        allJobsList = await fetchAPI('/jobs/');
        
        // Initial setup for search fields if present in url
        if (document.getElementById('job-keyword')) {
            document.getElementById('job-keyword').value = filterKeyword;
        }
        if (document.getElementById('job-location')) {
            document.getElementById('job-location').value = filterLocation;
        }
        
        // Add event listeners to filter fields
        const filters = ['job-keyword', 'job-location', 'job-type-filter', 'job-salary-filter'];
        filters.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', applyJobFilters);
            if (el) el.addEventListener('change', applyJobFilters);
        });
        
        // Setup Recommendation Section
        renderJobRecommendations();
        
        // Initial apply
        applyJobFilters();
        
        // Highlight specific job if requested
        if (targetJobId) {
            setTimeout(() => {
                const targetCard = document.querySelector(`.job-card[data-job-id="${targetJobId}"]`);
                if (targetCard) {
                    targetCard.scrollIntoView({ behavior: 'smooth' });
                    targetCard.style.boxShadow = '0 0 30px var(--accent-violet)';
                    targetCard.style.borderColor = 'var(--accent-violet)';
                }
            }, 500);
        }
        
    } catch (err) {
        showToast('Error loading jobs: ' + err.message, 'danger');
    }
}

function applyJobFilters() {
    const keyword = document.getElementById('job-keyword').value.toLowerCase();
    const location = document.getElementById('job-location').value.toLowerCase();
    const type = document.getElementById('job-type-filter').value;
    const salaryMax = parseInt(document.getElementById('job-salary-filter').value) || Infinity;
    
    const filtered = allJobsList.filter(job => {
        const matchesKeyword = job.job_title.toLowerCase().includes(keyword) || job.company_name.toLowerCase().includes(keyword);
        const matchesLocation = job.location.toLowerCase().includes(location);
        const matchesType = type === 'all' || job.job_type === type;
        const matchesSalary = job.salary >= salaryMax; // Salary filter is "Min Salary"
        
        return matchesKeyword && matchesLocation && matchesType && matchesSalary;
    });
    
    const jobsListGrid = document.getElementById('jobs-list-grid');
    if (!jobsListGrid) return;
    
    if (filtered.length === 0) {
        jobsListGrid.innerHTML = `<p style="text-align: center; color: var(--text-secondary); width:100%; grid-column: 1/-1;">No jobs match your search filters.</p>`;
    } else {
        jobsListGrid.innerHTML = filtered.map(job => {
            const cardStr = renderJobCard(job);
            // Append data-job-id attribute
            return cardStr.replace('<div class="job-card">', `<div class="job-card" data-job-id="${job.job_id}">`);
        }).join('');
    }
}

async function renderJobRecommendations() {
    const recSection = document.getElementById('job-recommendations-wrapper');
    if (!recSection) return;
    
    if (!currentUser || userRole !== 'candidate') {
        recSection.style.display = 'none';
        return;
    }
    
    // candidate's details
    const candidateSkills = currentUser.skills ? currentUser.skills.toLowerCase().split(',').map(s => s.trim()) : [];
    const candidateExp = currentUser.experience || 0;
    
    // Find matching jobs
    const recommended = allJobsList.filter(job => {
        // Experience matches
        if (job.experience_required > candidateExp) return false;
        
        // Skill check: Does job title match candidate skills
        const matchTitle = candidateSkills.some(skill => job.job_title.toLowerCase().includes(skill));
        
        return matchTitle;
    }).slice(0, 3);
    
    if (recommended.length === 0) {
        recSection.style.display = 'none';
    } else {
        recSection.style.display = 'block';
        const grid = document.getElementById('recommended-jobs-grid');
        grid.innerHTML = recommended.map(job => renderJobCard(job)).join('');
    }
}


// ==================== 5. APPLICATIONS TRACKING LOGIC ====================
async function initApplications() {
    if (!currentUser || userRole !== 'candidate') {
        window.location.href = 'login.html';
        return;
    }
    
    const appsListDiv = document.getElementById('my-applications-list');
    if (!appsListDiv) return;
    
    try {
        const apps = await fetchAPI('/applications/');
        const myApps = apps.filter(a => a.candidate_name.toLowerCase() === currentUser.full_name.toLowerCase());
        
        if (myApps.length === 0) {
            appsListDiv.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">You haven't submitted any job applications yet.</p>`;
            return;
        }
        
        appsListDiv.innerHTML = `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Job Title</th>
                            <th>Company</th>
                            <th>Applied Date</th>
                            <th>Resume Name</th>
                            <th>Application Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${myApps.map(app => `
                            <tr>
                                <td><strong>${app.job_title}</strong></td>
                                <td>${app.company_name}</td>
                                <td>${app.applied_date}</td>
                                <td>
                                    <span style="cursor: pointer; text-decoration: underline; color: var(--accent-cyan);" onclick="downloadResume('${app.resume}', '${app.candidate_name}')">
                                        📄 ${app.resume}
                                    </span>
                                </td>
                                <td>
                                    <span class="status-badge ${getStatusClass(app.application_status)}">
                                        ${app.application_status}
                                    </span>
                                </td>
                                <td>
                                    <button onclick="withdrawApplication(${app.application_id})" class="btn btn-danger btn-sm" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">Withdraw</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        showToast('Error loading applications', 'danger');
    }
}

function getStatusClass(status) {
    switch (status) {
        case 'Applied': return 'status-applied';
        case 'Shortlisted': return 'status-shortlisted';
        case 'Interview Scheduled': return 'status-scheduled';
        case 'Selected': return 'status-selected';
        case 'Rejected': return 'status-rejected';
        default: return 'status-applied';
    }
}

function downloadResume(filename, candidateName) {
    // Dynamic Resume Generation
    const element = document.createElement('a');
    const fileContent = `RESUME DOCUMENT FOR ${candidateName.toUpperCase()}\nFilename: ${filename}\n\nObjective:\nTo secure a challenging role and contribute skills towards organizational success.\n\nKey Skills:\n- Python, Django REST framework\n- Frontend Development (HTML5, CSS3, Javascript ES6, Fetch API)\n- Database management (SQLite, PostgreSQL)\n\nEducation:\n- Professional Certification in Full Stack Development\n\nGenerated by CareerZap Portal.`;
    
    const file = new Blob([fileContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename.endsWith('.pdf') ? filename : filename + '.pdf';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast(`Downloading mock resume: ${filename}`, 'success');
}

async function withdrawApplication(id) {
    if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) return;
    
    try {
        await fetchAPI(`/applications/delete/${id}/`, {
            method: 'DELETE'
        });
        showToast('Application withdrawn successfully', 'success');
        initApplications();
    } catch (err) {
        showToast('Failed to withdraw application', 'danger');
    }
}


// ==================== 6. INTERVIEWS PAGE LOGIC ====================
async function initInterviews() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const interviews = await fetchAPI('/interviews/');
        
        // Filter interviews
        let myInterviews = [];
        if (userRole === 'candidate') {
            myInterviews = interviews.filter(i => i.candidate_name.toLowerCase() === currentUser.full_name.toLowerCase());
        } else if (userRole === 'employer') {
            myInterviews = interviews.filter(i => i.company_name.toLowerCase() === currentUser.company_name.toLowerCase());
        } else {
            myInterviews = interviews; // Admin views all
        }
        
        // Render Interviews List
        const listDiv = document.getElementById('interviews-list-container');
        if (listDiv) {
            if (myInterviews.length === 0) {
                listDiv.innerHTML = `<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No upcoming interviews scheduled.</p>`;
            } else {
                listDiv.innerHTML = myInterviews.map(i => `
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: 12px; padding: 1.2rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <div>
                            <span class="status-badge ${i.interview_mode === 'Online' ? 'status-applied' : 'status-shortlisted'}" style="margin-bottom: 0.5rem;">
                                ${i.interview_mode}
                            </span>
                            <h4 style="font-family: var(--font-outfit); font-size: 1.15rem; color:#fff; margin-bottom: 0.3rem;">
                                ${userRole === 'candidate' ? i.company_name : i.candidate_name}
                            </h4>
                            <p style="font-size: 0.85rem; color: var(--text-secondary);">
                                📅 ${i.interview_date} at ⏰ ${i.interview_time}
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <span class="status-badge ${getInterviewStatusClass(i.interview_status)}" style="margin-bottom: 0.5rem;">
                                ${i.interview_status}
                            </span>
                            ${userRole === 'employer' ? `
                                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                                    <button onclick="updateInterviewStatus(${i.interview_id}, 'Completed')" class="btn btn-outline" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; min-height:0;">Complete</button>
                                    <button onclick="cancelInterview(${i.interview_id})" class="btn btn-danger" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; min-height:0;">Cancel</button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('');
            }
        }
        
        // Render Interactive Calendar
        renderInterviewCalendar(myInterviews);
        
    } catch (err) {
        showToast('Failed to load interviews', 'danger');
    }
}

function getInterviewStatusClass(status) {
    switch (status) {
        case 'Scheduled': return 'status-scheduled';
        case 'Completed': return 'status-selected';
        case 'Selected': return 'status-selected';
        case 'Rejected': return 'status-rejected';
        default: return 'status-scheduled';
    }
}

async function cancelInterview(id) {
    if (!confirm('Are you sure you want to cancel this interview?')) return;
    try {
        await fetchAPI(`/interviews/delete/${id}/`, {
            method: 'DELETE'
        });
        showToast('Interview cancelled successfully', 'success');
        initInterviews();
    } catch (err) {
        showToast('Failed to cancel interview', 'danger');
    }
}

async function updateInterviewStatus(id, status) {
    try {
        const interviews = await fetchAPI('/interviews/');
        const interview = interviews.find(i => i.interview_id === id);
        if (!interview) return;
        
        interview.interview_status = status;
        await fetchAPI(`/interviews/update/${id}/`, {
            method: 'PUT',
            body: interview
        });
        
        showToast('Interview status updated', 'success');
        initInterviews();
    } catch (err) {
        showToast('Failed to update status', 'danger');
    }
}

function renderInterviewCalendar(interviews) {
    const calendarContainer = document.getElementById('interview-calendar-grid');
    if (!calendarContainer) return;
    
    // Clear and set columns
    calendarContainer.innerHTML = '';
    
    // We will render the current month days
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Month name title
    const monthTitle = document.getElementById('calendar-month-title');
    if (monthTitle) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        monthTitle.innerText = `${months[month]} ${year}`;
    }
    
    // First day of current month
    const firstDay = new Date(year, month, 1).getDay();
    // Days in current month
    const totalDays = new Date(year, month + 1, 0).getDate();
    // Days in previous month
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    // Render previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day other-month';
        dayDiv.innerHTML = `<span>${prevMonthDays - i}</span>`;
        calendarContainer.appendChild(dayDiv);
    }
    
    // Render current month days
    for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        
        const isToday = day === now.getDate();
        if (isToday) dayDiv.classList.add('today');
        
        dayDiv.innerHTML = `<span>${day}</span>`;
        
        // Find interviews matching this date (Format: YYYY-MM-DD)
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayInterviews = interviews.filter(i => i.interview_date === dateStr);
        
        dayInterviews.forEach(i => {
            const eventDiv = document.createElement('div');
            eventDiv.className = `calendar-event ${i.interview_mode.toLowerCase()}`;
            eventDiv.title = `${i.interview_time} - ${i.candidate_name}`;
            eventDiv.innerText = `${i.interview_time} ${userRole === 'candidate' ? i.company_name : i.candidate_name}`;
            
            eventDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                openInterviewDetailsModal(i);
            });
            
            dayDiv.appendChild(eventDiv);
        });
        
        calendarContainer.appendChild(dayDiv);
    }
}

function openInterviewDetailsModal(interview) {
    let modal = document.getElementById('interview-details-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'interview-details-modal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center;">
            <button class="modal-close" onclick="closeModal('interview-details-modal')">&times;</button>
            <h3 style="font-family: var(--font-outfit); font-size: 1.5rem; color:#fff; margin-bottom: 1rem;">Interview Details</h3>
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 12px; padding: 1.5rem; text-align: left; display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 1.5rem;">
                <p><strong style="color: var(--text-muted);">Candidate:</strong> <span style="color:#fff; float:right;">${interview.candidate_name}</span></p>
                <p><strong style="color: var(--text-muted);">Company Name:</strong> <span style="color:#fff; float:right;">${interview.company_name}</span></p>
                <p><strong style="color: var(--text-muted);">Date:</strong> <span style="color:#fff; float:right;">${interview.interview_date}</span></p>
                <p><strong style="color: var(--text-muted);">Time Slot:</strong> <span style="color:#fff; float:right;">${interview.interview_time}</span></p>
                <p><strong style="color: var(--text-muted);">Interview Mode:</strong> <span class="status-badge ${interview.interview_mode === 'Online' ? 'status-applied' : 'status-shortlisted'}" style="float:right;">${interview.interview_mode}</span></p>
                <p><strong style="color: var(--text-muted);">Status:</strong> <span class="status-badge ${getInterviewStatusClass(interview.interview_status)}" style="float:right;">${interview.interview_status}</span></p>
            </div>
            <button class="btn btn-secondary" onclick="closeModal('interview-details-modal')">Close</button>
        </div>
    `;
    modal.style.display = 'flex';
}


// ==================== 7. CANDIDATE DASHBOARD LOGIC ====================
async function initCandidateDashboard() {
    if (!currentUser || userRole !== 'candidate') {
        window.location.href = 'login.html';
        return;
    }
    
    // Fill static text details
    document.getElementById('card-fullname').innerText = currentUser.full_name;
    document.getElementById('card-email').innerText = currentUser.email;
    document.getElementById('card-phone').innerText = currentUser.phone;
    
    const avatar = document.getElementById('card-avatar');
    if (avatar) avatar.innerText = currentUser.full_name.charAt(0);
    
    // Fill edit fields
    document.getElementById('profile-fullname').value = currentUser.full_name;
    document.getElementById('profile-email').value = currentUser.email;
    document.getElementById('profile-phone').value = currentUser.phone;
    document.getElementById('profile-qualification').value = currentUser.qualification || '';
    document.getElementById('profile-skills').value = currentUser.skills || '';
    document.getElementById('profile-experience').value = currentUser.experience || 0;
    
    // Render brief stats
    try {
        const apps = await fetchAPI('/applications/');
        const myApps = apps.filter(a => a.candidate_name.toLowerCase() === currentUser.full_name.toLowerCase());
        document.getElementById('stat-total-applications').innerText = myApps.length;
        
        // Render brief application lists
        const appList = document.getElementById('candidate-brief-applications');
        if (appList) {
            if (myApps.length === 0) {
                appList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No applications submitted.</p>`;
            } else {
                appList.innerHTML = myApps.slice(0, 3).map(a => `
                    <div style="padding: 0.8rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color:#fff;">${a.job_title}</strong><br>
                            <span style="font-size: 0.75rem; color: var(--text-secondary);">${a.company_name}</span>
                        </div>
                        <span class="status-badge ${getStatusClass(a.application_status)}">${a.application_status}</span>
                    </div>
                `).join('');
            }
        }
        
        // Upcoming interviews count and list
        const interviews = await fetchAPI('/interviews/');
        const myInterviews = interviews.filter(i => i.candidate_name.toLowerCase() === currentUser.full_name.toLowerCase() && i.interview_status === 'Scheduled');
        document.getElementById('stat-upcoming-interviews').innerText = myInterviews.length;
        
        const intList = document.getElementById('candidate-brief-interviews');
        if (intList) {
            if (myInterviews.length === 0) {
                intList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No upcoming interviews scheduled.</p>`;
            } else {
                intList.innerHTML = myInterviews.slice(0, 3).map(i => `
                    <div style="padding: 0.8rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color:#fff;">${i.company_name}</strong><br>
                            <span style="font-size: 0.75rem; color: var(--text-secondary);">${i.interview_date} at ${i.interview_time} (${i.interview_mode})</span>
                        </div>
                        <span class="status-badge status-scheduled">Scheduled</span>
                    </div>
                `).join('');
            }
        }
    } catch (err) {
        console.error(err);
    }
    
    // Profile Update handler
    const profileForm = document.getElementById('candidate-profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updatedProfile = {
                full_name: document.getElementById('profile-fullname').value,
                email: document.getElementById('profile-email').value,
                phone: document.getElementById('profile-phone').value,
                qualification: document.getElementById('profile-qualification').value,
                skills: document.getElementById('profile-skills').value,
                experience: parseInt(document.getElementById('profile-experience').value) || 0,
                password: currentUser.password // Keep password intact
            };
            
            try {
                await fetchAPI(`/candidates/update/${currentUser.candidate_id}/`, {
                    method: 'PUT',
                    body: updatedProfile
                });
                
                // Keep session updated
                const fullUser = {
                    candidate_id: currentUser.candidate_id,
                    ...updatedProfile
                };
                setCurrentUser(fullUser, 'candidate');
                showToast('Profile updated successfully!', 'success');
                
                // Refresh texts
                document.getElementById('card-fullname').innerText = fullUser.full_name;
                document.getElementById('card-email').innerText = fullUser.email;
                document.getElementById('card-phone').innerText = fullUser.phone;
            } catch (err) {
                showToast('Failed to update profile: ' + err.message, 'danger');
            }
        });
    }
}


// ==================== 8. EMPLOYER DASHBOARD LOGIC ====================
async function initEmployerDashboard() {
    if (!currentUser || userRole !== 'employer') {
        window.location.href = 'login.html';
        return;
    }
    
    // Fill text details
    document.getElementById('card-companyname').innerText = currentUser.company_name;
    document.getElementById('card-industry').innerText = currentUser.industry;
    document.getElementById('card-hrname').innerText = currentUser.hr_name;
    
    const avatar = document.getElementById('card-avatar');
    if (avatar) avatar.innerText = currentUser.company_name.charAt(0);
    
    // Load posted jobs, applications, and interviews
    loadEmployerDashboardData();
    
    // Handle Add Job Form Submit
    const addJobForm = document.getElementById('employer-add-job-form');
    if (addJobForm) {
        // Preset company name
        const compNameField = document.getElementById('job-company-name');
        if (compNameField) {
            compNameField.value = currentUser.company_name;
            compNameField.setAttribute('readonly', '');
        }
        
        addJobForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const payload = {
                job_title: document.getElementById('job-title').value,
                company_name: currentUser.company_name,
                location: document.getElementById('job-location').value,
                job_type: document.getElementById('job-type').value,
                experience_required: parseInt(document.getElementById('job-experience').value) || 0,
                salary: parseFloat(document.getElementById('job-salary').value) || 0.0,
                last_date: document.getElementById('job-deadline').value
            };
            
            try {
                await fetchAPI('/jobs/add/', {
                    method: 'POST',
                    body: payload
                });
                showToast('Job post created successfully!', 'success');
                addJobForm.reset();
                if (compNameField) compNameField.value = currentUser.company_name;
                
                // Refresh dashboard listings
                loadEmployerDashboardData();
            } catch (err) {
                showToast('Failed to post job: ' + err.message, 'danger');
            }
        });
    }
}

async function loadEmployerDashboardData() {
    try {
        const jobs = await fetchAPI('/jobs/');
        const myJobs = jobs.filter(j => j.company_name.toLowerCase() === currentUser.company_name.toLowerCase());
        
        // Count stats
        document.getElementById('stat-total-jobs').innerText = myJobs.length;
        
        const postedJobsList = document.getElementById('employer-jobs-list');
        if (postedJobsList) {
            if (myJobs.length === 0) {
                postedJobsList.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No job listings posted yet.</td></tr>`;
            } else {
                postedJobsList.innerHTML = myJobs.map(j => `
                    <tr>
                        <td><strong>${j.job_title}</strong></td>
                        <td>${j.location}</td>
                        <td>${j.job_type}</td>
                        <td>₹${j.salary.toLocaleString()}/yr</td>
                        <td>
                            <button onclick="deleteJobByEmployer(${j.job_id})" class="btn btn-danger btn-sm" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        }
        
        // Applications received
        const apps = await fetchAPI('/applications/');
        const myApps = apps.filter(a => a.company_name.toLowerCase() === currentUser.company_name.toLowerCase());
        
        document.getElementById('stat-received-applications').innerText = myApps.length;
        
        const appsList = document.getElementById('employer-received-applications-list');
        if (appsList) {
            if (myApps.length === 0) {
                appsList.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No job applications received yet.</td></tr>`;
            } else {
                appsList.innerHTML = myApps.map(a => `
                    <tr>
                        <td>
                            <span style="cursor: pointer; text-decoration: underline; color: var(--accent-cyan); font-weight:600;" onclick="viewCandidateProfile('${a.candidate_name}')">
                                ${a.candidate_name}
                            </span>
                        </td>
                        <td><strong>${a.job_title}</strong></td>
                        <td>${a.applied_date}</td>
                        <td>
                            <span class="status-badge ${getStatusClass(a.application_status)}">${a.application_status}</span>
                        </td>
                        <td>
                            <div style="display: flex; gap: 0.3rem;">
                                <select onchange="updateApplicationStatusByEmployer(${a.application_id}, this.value)" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; border-radius: 4px; background: rgba(0,0,0,0.3); color:#fff; border: 1px solid var(--border-glass);">
                                    <option value="">Update Status</option>
                                    <option value="Applied" ${a.application_status === 'Applied' ? 'selected' : ''}>Applied</option>
                                    <option value="Shortlisted" ${a.application_status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
                                    <option value="Interview Scheduled" ${a.application_status === 'Interview Scheduled' ? 'selected' : ''}>Interview Scheduled</option>
                                    <option value="Selected" ${a.application_status === 'Selected' ? 'selected' : ''}>Selected</option>
                                    <option value="Rejected" ${a.application_status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                                </select>
                                <button onclick="openScheduleInterviewModal('${a.candidate_name}', '${a.job_title}')" class="btn btn-primary btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border-radius:4px; min-height:0;">Schedule</button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        }
        
        // Selected Candidates count
        const selectedApps = myApps.filter(a => a.application_status === 'Selected');
        document.getElementById('stat-selected-candidates').innerText = selectedApps.length;
        
    } catch (err) {
        console.error(err);
    }
}

async function viewCandidateProfile(candidateName) {
    try {
        const candidates = await fetchAPI('/candidates/');
        const candidate = candidates.find(c => c.full_name.toLowerCase() === candidateName.toLowerCase());
        
        if (!candidate) {
            showToast('Profile details not found.', 'warning');
            return;
        }
        
        let modal = document.getElementById('candidate-profile-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'candidate-profile-modal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = `
            <div class="modal-content" style="text-align: center;">
                <button class="modal-close" onclick="closeModal('candidate-profile-modal')">&times;</button>
                <div class="profile-avatar" style="width: 70px; height: 70px; font-size: 2rem; margin: 0 auto 1rem;">
                    ${candidate.full_name.charAt(0)}
                </div>
                <h3 style="font-family: var(--font-outfit); font-size: 1.5rem; color:#fff; margin-bottom: 0.2rem;">${candidate.full_name}</h3>
                <p style="font-size: 0.85rem; color: var(--accent-cyan); margin-bottom: 1.5rem;">${candidate.qualification}</p>
                
                <div style="text-align: left; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 12px; padding: 1.2rem; display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 1.5rem;">
                    <p><strong style="color: var(--text-muted);">Email:</strong> <span style="color:#fff; float:right;">${candidate.email}</span></p>
                    <p><strong style="color: var(--text-muted);">Phone:</strong> <span style="color:#fff; float:right;">${candidate.phone}</span></p>
                    <p><strong style="color: var(--text-muted);">Work Experience:</strong> <span style="color:#fff; float:right;">${candidate.experience} years</span></p>
                    <p><strong style="color: var(--text-muted);">Skills Portfolio:</strong> <span style="color:#fff; float:right;">${candidate.skills}</span></p>
                </div>
                
                <button class="btn btn-secondary" onclick="closeModal('candidate-profile-modal')">Close</button>
            </div>
        `;
        modal.style.display = 'flex';
    } catch (err) {
        showToast('Error fetching profile', 'danger');
    }
}

async function updateApplicationStatusByEmployer(appId, newStatus) {
    if (!newStatus) return;
    try {
        const apps = await fetchAPI('/applications/');
        const app = apps.find(a => a.application_id === appId);
        if (!app) return;
        
        app.application_status = newStatus;
        await fetchAPI(`/applications/update/${appId}/`, {
            method: 'PUT',
            body: app
        });
        showToast('Application status updated successfully', 'success');
        loadEmployerDashboardData();
    } catch (err) {
        showToast('Failed to update status', 'danger');
    }
}

function openScheduleInterviewModal(candidateName, jobTitle) {
    let modal = document.getElementById('schedule-interview-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'schedule-interview-modal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal('schedule-interview-modal')">&times;</button>
            <h3 style="font-family: var(--font-outfit); margin-bottom: 1.5rem; text-align: center;">Schedule Interview</h3>
            <form id="schedule-interview-form">
                <div class="form-group">
                    <label>Candidate Name</label>
                    <input type="text" id="int-candidate-name" value="${candidateName}" readonly required>
                </div>
                <div class="form-group">
                    <label>Job Title</label>
                    <input type="text" id="int-job-title" value="${jobTitle}" readonly required>
                </div>
                <div class="form-group">
                    <label>Interview Date</label>
                    <input type="date" id="int-date" required>
                </div>
                <div class="form-group">
                    <label>Time Slot</label>
                    <input type="time" id="int-time" required>
                </div>
                <div class="form-group">
                    <label>Interview Mode</label>
                    <select id="int-mode" required>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                    </select>
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="closeModal('schedule-interview-modal')">Cancel</button>
                    <button type="submit" class="btn btn-primary" style="flex: 1;">Schedule</button>
                </div>
            </form>
        </div>
    `;
    modal.style.display = 'flex';
    
    const form = document.getElementById('schedule-interview-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            candidate_name: candidateName,
            company_name: currentUser.company_name,
            interview_date: document.getElementById('int-date').value,
            interview_time: document.getElementById('int-time').value,
            interview_mode: document.getElementById('int-mode').value,
            interview_status: 'Scheduled'
        };
        
        try {
            await fetchAPI('/interviews/add/', {
                method: 'POST',
                body: payload
            });
            showToast('Interview scheduled successfully!', 'success');
            closeModal('schedule-interview-modal');
            loadEmployerDashboardData();
        } catch (err) {
            showToast('Failed to schedule: ' + err.message, 'danger');
        }
    });
}

async function deleteJobByEmployer(jobId) {
    if (!confirm('Are you sure you want to delete this job listing?')) return;
    try {
        await fetchAPI(`/jobs/delete/${jobId}/`, {
            method: 'DELETE'
        });
        showToast('Job listing deleted successfully', 'success');
        loadEmployerDashboardData();
    } catch (err) {
        showToast('Failed to delete job vacancy', 'danger');
    }
}


// ==================== 9. ADMIN DASHBOARD LOGIC ====================
async function initAdminDashboard() {
    if (!currentUser || userRole !== 'admin') {
        window.location.href = 'login.html';
        return;
    }
    
    const tabButtons = document.querySelectorAll('.admin-tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const table = btn.dataset.table;
            loadAdminTableData(table);
        });
    });
    
    // Load first table by default
    loadAdminTableData('candidates');
}

async function loadAdminTableData(table) {
    const headerRow = document.getElementById('admin-table-header');
    const bodyRow = document.getElementById('admin-table-body');
    const listTitle = document.getElementById('admin-list-title');
    const addBtn = document.getElementById('admin-add-new-btn');
    
    if (!headerRow || !bodyRow) return;
    
    // Clear rows
    headerRow.innerHTML = '';
    bodyRow.innerHTML = '';
    
    listTitle.innerText = `Manage ${table.charAt(0).toUpperCase() + table.slice(1)}`;
    
    // Configure Add New button onclick
    addBtn.setAttribute('onclick', `openAdminAddModal('${table}')`);
    
    try {
        if (table === 'candidates') {
            const data = await fetchAPI('/candidates/');
            headerRow.innerHTML = `
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Qualification</th>
                <th>Skills</th>
                <th>Exp (Yrs)</th>
                <th>Actions</th>
            `;
            bodyRow.innerHTML = data.map(c => `
                <tr>
                    <td>${c.candidate_id}</td>
                    <td>${c.full_name}</td>
                    <td>${c.email}</td>
                    <td>${c.phone}</td>
                    <td>${c.qualification}</td>
                    <td>${c.skills}</td>
                    <td>${c.experience}</td>
                    <td>
                        <div style="display:flex; gap:0.3rem;">
                            <button onclick="openAdminEditModal('candidates', ${c.candidate_id}, ${JSON.stringify(c).replace(/"/g, '&quot;')})" class="btn btn-outline btn-sm" style="padding:0.2rem 0.5rem; font-size:0.75rem;">Edit</button>
                            <button onclick="adminDeleteEntity('candidates', ${c.candidate_id})" class="btn btn-danger btn-sm" style="padding:0.2rem 0.5rem; font-size:0.75rem;">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
        } else if (table === 'employers') {
            const data = await fetchAPI('/employers/');
            headerRow.innerHTML = `
                <th>ID</th>
                <th>Company Name</th>
                <th>HR Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Industry</th>
                <th>Actions</th>
            `;
            bodyRow.innerHTML = data.map(e => `
                <tr>
                    <td>${e.employer_id}</td>
                    <td><strong>${e.company_name}</strong></td>
                    <td>${e.hr_name}</td>
                    <td>${e.email}</td>
                    <td>${e.phone}</td>
                    <td>${e.location}</td>
                    <td>${e.industry}</td>
                    <td>
                        <div style="display:flex; gap:0.3rem;">
                            <button onclick="openAdminEditModal('employers', ${e.employer_id}, ${JSON.stringify(e).replace(/"/g, '&quot;')})" class="btn btn-outline btn-sm" style="padding:0.2rem 0.5rem; font-size:0.75rem;">Edit</button>
                            <button onclick="adminDeleteEntity('employers', ${e.employer_id})" class="btn btn-danger btn-sm" style="padding:0.2rem 0.5rem; font-size:0.75rem;">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
        } else if (table === 'jobs') {
            const data = await fetchAPI('/jobs/');
            headerRow.innerHTML = `
                <th>ID</th>
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Type</th>
                <th>Min Exp</th>
                <th>Salary (₹)</th>
                <th>Deadline</th>
                <th>Actions</th>
            `;
            bodyRow.innerHTML = data.map(j => `
                <tr>
                    <td>${j.job_id}</td>
                    <td><strong>${j.job_title}</strong></td>
                    <td>${j.company_name}</td>
                    <td>${j.location}</td>
                    <td>${j.job_type}</td>
                    <td>${j.experience_required} yrs</td>
                    <td>₹${j.salary.toLocaleString()}</td>
                    <td>${j.last_date}</td>
                    <td>
                        <div style="display:flex; gap:0.3rem;">
                            <button onclick="openAdminEditModal('jobs', ${j.job_id}, ${JSON.stringify(j).replace(/"/g, '&quot;')})" class="btn btn-outline btn-sm" style="padding:0.2rem 0.5rem; font-size:0.75rem;">Edit</button>
                            <button onclick="adminDeleteEntity('jobs', ${j.job_id})" class="btn btn-danger btn-sm" style="padding:0.2rem 0.5rem; font-size:0.75rem;">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
        } else if (table === 'applications') {
            const data = await fetchAPI('/applications/');
            headerRow.innerHTML = `
                <th>ID</th>
                <th>Candidate</th>
                <th>Company</th>
                <th>Job Title</th>
                <th>Applied Date</th>
                <th>Resume</th>
                <th>Status</th>
                <th>Actions</th>
            `;
            bodyRow.innerHTML = data.map(a => `
                <tr>
                    <td>${a.application_id}</td>
                    <td>${a.candidate_name}</td>
                    <td>${a.company_name}</td>
                    <td><strong>${a.job_title}</strong></td>
                    <td>${a.applied_date}</td>
                    <td>${a.resume}</td>
                    <td><span class="status-badge ${getStatusClass(a.application_status)}">${a.application_status}</span></td>
                    <td>
                        <div style="display:flex; gap:0.3rem;">
                            <button onclick="openAdminEditModal('applications', ${a.application_id}, ${JSON.stringify(a).replace(/"/g, '&quot;')})" class="btn btn-outline btn-sm" style="padding:0.2rem 0.5rem; font-size:0.75rem;">Edit</button>
                            <button onclick="adminDeleteEntity('applications', ${a.application_id})" class="btn btn-danger btn-sm" style="padding:0.2rem 0.5rem; font-size:0.75rem;">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
        } else if (table === 'interviews') {
            const data = await fetchAPI('/interviews/');
            headerRow.innerHTML = `
                <th>ID</th>
                <th>Candidate</th>
                <th>Company</th>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Actions</th>
            `;
            bodyRow.innerHTML = data.map(i => `
                <tr>
                    <td>${i.interview_id}</td>
                    <td>${i.candidate_name}</td>
                    <td>${i.company_name}</td>
                    <td>${i.interview_date}</td>
                    <td>${i.interview_time}</td>
                    <td>${i.interview_mode}</td>
                    <td><span class="status-badge ${getInterviewStatusClass(i.interview_status)}">${i.interview_status}</span></td>
                    <td>
                        <div style="display:flex; gap:0.3rem;">
                            <button onclick="openAdminEditModal('interviews', ${i.interview_id}, ${JSON.stringify(i).replace(/"/g, '&quot;')})" class="btn btn-outline btn-sm" style="padding:0.2rem 0.5rem; font-size:0.75rem;">Edit</button>
                            <button onclick="adminDeleteEntity('interviews', ${i.interview_id})" class="btn btn-danger btn-sm" style="padding:0.2rem 0.5rem; font-size:0.75rem;">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        showToast('Error loading admin list data', 'danger');
    }
}

async function adminDeleteEntity(table, id) {
    if (!confirm(`Are you sure you want to delete ID ${id} from ${table}?`)) return;
    
    // Resolve endpoint
    let endpoint = `/${table}/delete/${id}/`;
    if (table === 'applications') endpoint = `/applications/delete/${id}/`;
    if (table === 'interviews') endpoint = `/interviews/delete/${id}/`;
    
    try {
        await fetchAPI(endpoint, {
            method: 'DELETE'
        });
        showToast('Record deleted successfully', 'success');
        loadAdminTableData(table);
    } catch (err) {
        showToast('Deletion failed: ' + err.message, 'danger');
    }
}

function openAdminAddModal(table) {
    let modal = document.getElementById('admin-crud-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'admin-crud-modal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal('admin-crud-modal')">&times;</button>
            <h3 style="font-family: var(--font-outfit); margin-bottom: 1.5rem; text-align: center;">Add New ${table.slice(0, -1)}</h3>
            <form id="admin-crud-add-form">
                ${getFieldsHTMLForTable(table)}
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="closeModal('admin-crud-modal')">Cancel</button>
                    <button type="submit" class="btn btn-primary" style="flex: 1;">Create</button>
                </div>
            </form>
        </div>
    `;
    modal.style.display = 'flex';
    
    const form = document.getElementById('admin-crud-add-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = extractFormData(table);
        const endpoint = `/${table}/add/`;
        
        try {
            await fetchAPI(endpoint, {
                method: 'POST',
                body: payload
            });
            showToast('Record created successfully!', 'success');
            closeModal('admin-crud-modal');
            loadAdminTableData(table);
        } catch (err) {
            showToast('Creation failed: ' + err.message, 'danger');
        }
    });
}

function openAdminEditModal(table, id, currentData) {
    let modal = document.getElementById('admin-crud-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'admin-crud-modal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal('admin-crud-modal')">&times;</button>
            <h3 style="font-family: var(--font-outfit); margin-bottom: 1.5rem; text-align: center;">Edit ${table.slice(0, -1)} (ID: ${id})</h3>
            <form id="admin-crud-edit-form">
                ${getFieldsHTMLForTable(table, currentData)}
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="closeModal('admin-crud-modal')">Cancel</button>
                    <button type="submit" class="btn btn-primary" style="flex: 1;">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    modal.style.display = 'flex';
    
    const form = document.getElementById('admin-crud-edit-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = extractFormData(table);
        const endpoint = `/${table}/update/${id}/`;
        
        try {
            await fetchAPI(endpoint, {
                method: 'PUT',
                body: payload
            });
            showToast('Record updated successfully!', 'success');
            closeModal('admin-crud-modal');
            loadAdminTableData(table);
        } catch (err) {
            showToast('Update failed: ' + err.message, 'danger');
        }
    });
}

function getFieldsHTMLForTable(table, data = {}) {
    if (table === 'candidates') {
        return `
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="crud-fullname" value="${data.full_name || ''}" required>
            </div>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="crud-email" value="${data.email || ''}" required>
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="crud-phone" value="${data.phone || ''}" required>
            </div>
            <div class="form-group">
                <label>Highest Qualification</label>
                <input type="text" id="crud-qualification" value="${data.qualification || ''}" required>
            </div>
            <div class="form-group">
                <label>Skills Portfolio (comma separated)</label>
                <input type="text" id="crud-skills" value="${data.skills || ''}" required>
            </div>
            <div class="form-group">
                <label>Years of Experience</label>
                <input type="number" id="crud-experience" value="${data.experience || 0}" required>
            </div>
            <div class="form-group">
                <label>Account Password</label>
                <input type="text" id="crud-password" value="${data.password || ''}" required>
            </div>
        `;
    } else if (table === 'employers') {
        return `
            <div class="form-group">
                <label>Company Name</label>
                <input type="text" id="crud-companyname" value="${data.company_name || ''}" required>
            </div>
            <div class="form-group">
                <label>HR Representative Name</label>
                <input type="text" id="crud-hrname" value="${data.hr_name || ''}" required>
            </div>
            <div class="form-group">
                <label>Corporate Email</label>
                <input type="email" id="crud-email" value="${data.email || ''}" required>
            </div>
            <div class="form-group">
                <label>Contact Phone</label>
                <input type="text" id="crud-phone" value="${data.phone || ''}" required>
            </div>
            <div class="form-group">
                <label>Location (City)</label>
                <input type="text" id="crud-location" value="${data.location || ''}" required>
            </div>
            <div class="form-group">
                <label>Industry Segment</label>
                <input type="text" id="crud-industry" value="${data.industry || ''}" required>
            </div>
            <div class="form-group">
                <label>Account Password (optional)</label>
                <input type="text" id="crud-password" value="${data.password || ''}">
            </div>
        `;
    } else if (table === 'jobs') {
        return `
            <div class="form-group">
                <label>Job Vacancy Title</label>
                <input type="text" id="crud-jobtitle" value="${data.job_title || ''}" required>
            </div>
            <div class="form-group">
                <label>Company Name</label>
                <input type="text" id="crud-companyname" value="${data.company_name || ''}" required>
            </div>
            <div class="form-group">
                <label>Work Location</label>
                <input type="text" id="crud-location" value="${data.location || ''}" required>
            </div>
            <div class="form-group">
                <label>Job Classification</label>
                <select id="crud-jobtype" required>
                    <option value="Full Time" ${data.job_type === 'Full Time' ? 'selected' : ''}>Full Time</option>
                    <option value="Part Time" ${data.job_type === 'Part Time' ? 'selected' : ''}>Part Time</option>
                    <option value="Internship" ${data.job_type === 'Internship' ? 'selected' : ''}>Internship</option>
                    <option value="Remote" ${data.job_type === 'Remote' ? 'selected' : ''}>Remote</option>
                </select>
            </div>
            <div class="form-group">
                <label>Min Experience Required (yrs)</label>
                <input type="number" id="crud-experience" value="${data.experience_required || 0}" required>
            </div>
            <div class="form-group">
                <label>Salary (₹ per annum)</label>
                <input type="number" id="crud-salary" value="${data.salary || 0}" required>
            </div>
            <div class="form-group">
                <label>Application Close Date</label>
                <input type="date" id="crud-deadline" value="${data.last_date || ''}" required>
            </div>
        `;
    } else if (table === 'applications') {
        return `
            <div class="form-group">
                <label>Candidate Name</label>
                <input type="text" id="crud-candidatename" value="${data.candidate_name || ''}" required>
            </div>
            <div class="form-group">
                <label>Company Name</label>
                <input type="text" id="crud-companyname" value="${data.company_name || ''}" required>
            </div>
            <div class="form-group">
                <label>Job Title</label>
                <input type="text" id="crud-jobtitle" value="${data.job_title || ''}" required>
            </div>
            <div class="form-group">
                <label>Submission Date</label>
                <input type="date" id="crud-applieddate" value="${data.applied_date || ''}" required>
            </div>
            <div class="form-group">
                <label>Resume File Name</label>
                <input type="text" id="crud-resume" value="${data.resume || ''}" required>
            </div>
            <div class="form-group">
                <label>Application Status</label>
                <select id="crud-status" required>
                    <option value="Applied" ${data.application_status === 'Applied' ? 'selected' : ''}>Applied</option>
                    <option value="Shortlisted" ${data.application_status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
                    <option value="Interview Scheduled" ${data.application_status === 'Interview Scheduled' ? 'selected' : ''}>Interview Scheduled</option>
                    <option value="Selected" ${data.application_status === 'Selected' ? 'selected' : ''}>Selected</option>
                    <option value="Rejected" ${data.application_status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                </select>
            </div>
        `;
    } else if (table === 'interviews') {
        return `
            <div class="form-group">
                <label>Candidate Name</label>
                <input type="text" id="crud-candidatename" value="${data.candidate_name || ''}" required>
            </div>
            <div class="form-group">
                <label>Company Name</label>
                <input type="text" id="crud-companyname" value="${data.company_name || ''}" required>
            </div>
            <div class="form-group">
                <label>Interview Date</label>
                <input type="date" id="crud-intdate" value="${data.interview_date || ''}" required>
            </div>
            <div class="form-group">
                <label>Time Slot</label>
                <input type="time" id="crud-inttime" value="${data.interview_time || ''}" required>
            </div>
            <div class="form-group">
                <label>Interview Mode</label>
                <select id="crud-mode" required>
                    <option value="Online" ${data.interview_mode === 'Online' ? 'selected' : ''}>Online</option>
                    <option value="Offline" ${data.interview_mode === 'Offline' ? 'selected' : ''}>Offline</option>
                </select>
            </div>
            <div class="form-group">
                <label>Interview Status</label>
                <select id="crud-status" required>
                    <option value="Scheduled" ${data.interview_status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
                    <option value="Completed" ${data.interview_status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="Selected" ${data.interview_status === 'Selected' ? 'selected' : ''}>Selected</option>
                    <option value="Rejected" ${data.interview_status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                </select>
            </div>
        `;
    }
    return '';
}

function extractFormData(table) {
    if (table === 'candidates') {
        return {
            full_name: document.getElementById('crud-fullname').value,
            email: document.getElementById('crud-email').value,
            phone: document.getElementById('crud-phone').value,
            qualification: document.getElementById('crud-qualification').value,
            skills: document.getElementById('crud-skills').value,
            experience: parseInt(document.getElementById('crud-experience').value) || 0,
            password: document.getElementById('crud-password').value
        };
    } else if (table === 'employers') {
        return {
            company_name: document.getElementById('crud-companyname').value,
            hr_name: document.getElementById('crud-hrname').value,
            email: document.getElementById('crud-email').value,
            phone: document.getElementById('crud-phone').value,
            location: document.getElementById('crud-location').value,
            industry: document.getElementById('crud-industry').value,
            password: document.getElementById('crud-password').value || 'hr123'
        };
    } else if (table === 'jobs') {
        return {
            job_title: document.getElementById('crud-jobtitle').value,
            company_name: document.getElementById('crud-companyname').value,
            location: document.getElementById('crud-location').value,
            job_type: document.getElementById('crud-jobtype').value,
            experience_required: parseInt(document.getElementById('crud-experience').value) || 0,
            salary: parseFloat(document.getElementById('crud-salary').value) || 0,
            last_date: document.getElementById('crud-deadline').value
        };
    } else if (table === 'applications') {
        return {
            candidate_name: document.getElementById('crud-candidatename').value,
            company_name: document.getElementById('crud-companyname').value,
            job_title: document.getElementById('crud-jobtitle').value,
            applied_date: document.getElementById('crud-applieddate').value,
            resume: document.getElementById('crud-resume').value,
            application_status: document.getElementById('crud-status').value
        };
    } else if (table === 'interviews') {
        return {
            candidate_name: document.getElementById('crud-candidatename').value,
            company_name: document.getElementById('crud-companyname').value,
            interview_date: document.getElementById('crud-intdate').value,
            interview_time: document.getElementById('crud-inttime').value,
            interview_mode: document.getElementById('crud-mode').value,
            interview_status: document.getElementById('crud-status').value
        };
    }
    return {};
}
