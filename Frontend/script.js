// Shared configuration and helpers for Island Booking System
const API_BASE_URL = 'http://127.0.0.1:8000';

// Initialize Page Headers and Navigation state on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    initToasts();
});

// Toast notification helper
function initToasts() {
    if (!document.getElementById('toast')) {
        const toastEl = document.createElement('div');
        toastEl.id = 'toast';
        document.body.appendChild(toastEl);
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `show ${type}`;
    
    setTimeout(() => {
        toast.className = '';
    }, 3000);
}

// Session state handling
function getCurrentUser() {
    const userJson = localStorage.getItem('ibs_user');
    if (userJson) {
        try {
            return JSON.parse(userJson);
        } catch (e) {
            localStorage.removeItem('ibs_user');
            return null;
        }
    }
    return null;
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('ibs_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('ibs_user');
    }
    updateNavigation();
}

function isAdminLoggedIn() {
    return localStorage.getItem('ibs_admin_logged_in') === 'true';
}

function setAdminLoggedIn(status) {
    if (status) {
        localStorage.setItem('ibs_admin_logged_in', 'true');
    } else {
        localStorage.removeItem('ibs_admin_logged_in');
    }
    updateNavigation();
}

function logout() {
    localStorage.removeItem('ibs_user');
    localStorage.removeItem('ibs_admin_logged_in');
    showToast('Logged out successfully.');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function updateNavigation() {
    const user = getCurrentUser();
    const isAdmin = isAdminLoggedIn();
    const authWrapper = document.getElementById('auth-nav-wrapper');
    
    if (!authWrapper) return;
    
    if (isAdmin) {
        authWrapper.innerHTML = `
            <a href="admin_dashboard.html" class="btn btn-secondary"><i class="fas fa-cog"></i> Admin Panel</a>
            <button onclick="logout()" class="btn btn-outline"><i class="fas fa-sign-out-alt"></i> Logout</button>
        `;
    } else if (user) {
        authWrapper.innerHTML = `
            <a href="customer_dashboard.html" class="btn btn-secondary"><i class="fas fa-user-circle"></i> Dashboard (${user.full_name.split(' ')[0]})</a>
            <button onclick="logout()" class="btn btn-outline"><i class="fas fa-sign-out-alt"></i> Logout</button>
        `;
    } else {
        authWrapper.innerHTML = `
            <a href="login.html" class="btn btn-secondary">Login</a>
            <a href="register.html" class="btn btn-primary">Sign Up</a>
        `;
    }
}

// Fetch helper with standard CORS headers
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Default headers
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    
    options.headers = {
        ...defaultHeaders,
        ...options.headers
    };
    
    // Auto stringify bodies
    if (options.body && typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
    }
    
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`API Fetch Error on ${endpoint}:`, error);
        throw error;
    }
}

// Utility to extract query parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Dynamic image resolver based on island name to avoid duplicates
function getPackageImage(islandName) {
    const images = {
        'maldives': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&auto=format&fit=crop',
        'bora bora': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop',
        'santorini': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&auto=format&fit=crop',
        'bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop',
        'hawaii': 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&auto=format&fit=crop',
        'seychelles': 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600&auto=format&fit=crop'
    };
    
    const key = (islandName || '').toLowerCase().trim();
    return images[key] || 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&auto=format&fit=crop';
}
