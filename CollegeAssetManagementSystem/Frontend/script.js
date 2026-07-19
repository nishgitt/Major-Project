const API_URL = "http://127.0.0.1:8000";

// Toast System
function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <div>${message}</div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Session Management
function checkAuth() {
    const adminUser = localStorage.getItem("adminUser");
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf("/") + 1);
    
    // Pages requiring auth
    const securePages = ["dashboard.html", "assets.html", "categories.html", "departments.html", "vendors.html", "allocations.html"];
    
    if (securePages.includes(pageName) && !adminUser) {
        window.location.href = "login.html";
        return false;
    }
    return !!adminUser;
}

function handleLogout() {
    localStorage.removeItem("adminUser");
    showToast("Logged out successfully", "success");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1000);
}

// Inject Navbar
function renderNavbar() {
    const navContainer = document.querySelector(".nav-container");
    if (!navContainer) return;
    
    const adminUser = localStorage.getItem("adminUser");
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf("/") + 1) || "index.html";
    
    let linksHTML = `
        <a href="index.html" class="logo">EduAsset</a>
        <ul class="nav-links">
    `;
    
    if (adminUser) {
        linksHTML += `
            <li><a href="dashboard.html" class="${pageName === 'dashboard.html' ? 'active' : ''}">Dashboard</a></li>
            <li><a href="assets.html" class="${pageName === 'assets.html' ? 'active' : ''}">Assets</a></li>
            <li><a href="categories.html" class="${pageName === 'categories.html' ? 'active' : ''}">Categories</a></li>
            <li><a href="departments.html" class="${pageName === 'departments.html' ? 'active' : ''}">Departments</a></li>
            <li><a href="vendors.html" class="${pageName === 'vendors.html' ? 'active' : ''}">Vendors</a></li>
            <li><a href="allocations.html" class="${pageName === 'allocations.html' ? 'active' : ''}">Allocations</a></li>
            <li><a href="#" id="btn-logout-nav" class="btn-logout">Logout</a></li>
        `;
    } else {
        linksHTML += `
            <li><a href="index.html" class="${pageName === 'index.html' ? 'active' : ''}">Home</a></li>
            <li><a href="login.html" class="btn-login">Admin Login</a></li>
        `;
    }
    
    linksHTML += `</ul>`;
    navContainer.innerHTML = linksHTML;
    
    const logoutBtn = document.getElementById("btn-logout-nav");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
}

// Dynamic Helpers
async function apiFetch(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const defaultHeaders = {
        "Content-Type": "application/json"
    };
    options.headers = { ...defaultHeaders, ...options.headers };
    
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Fetch error at ${endpoint}:`, error);
        showToast(error.message, "error");
        throw error;
    }
}

// File Upload Helper
async function uploadFile(inputId) {
    const fileInput = document.getElementById(inputId);
    if (!fileInput || fileInput.files.length === 0) {
        return null;
    }
    
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);
    
    try {
        const response = await fetch(`${API_URL}/upload/`, {
            method: "POST",
            body: formData
        });
        if (!response.ok) {
            throw new Error("File upload failed");
        }
        const data = await response.json();
        return data.url;
    } catch (error) {
        console.error("Upload error:", error);
        showToast("Failed to upload document file", "error");
        throw error;
    }
}

// ==================== PAGE LOGIC ====================

// 1. HOME PAGE
async function initHomePage() {
    try {
        const assets = await apiFetch("/assets/");
        const categories = await apiFetch("/categories/");
        const departments = await apiFetch("/departments/");
        
        // Stats
        document.getElementById("stat-total-assets").innerText = assets.length;
        document.getElementById("stat-categories").innerText = categories.length;
        document.getElementById("stat-departments").innerText = departments.length;
        
        // Status checks
        const available = assets.filter(a => a.status === "Available").length;
        document.getElementById("stat-available").innerText = available;

        // Calculate and display bill counts
        const pcCategories = ["Computer", "CPU", "Monitor", "Router", "Switch"];
        const pcBills = assets.filter(a => pcCategories.includes(a.category) && a.bill_document).length;
        const acBills = assets.filter(a => a.category === "Air Conditioner" && a.bill_document).length;
        const busBills = assets.filter(a => a.category === "Bus Battery" && a.bill_document).length;
        
        const pcEl = document.getElementById("bill-count-pc");
        if (pcEl) pcEl.innerText = pcBills;
        const acEl = document.getElementById("bill-count-ac");
        if (acEl) acEl.innerText = acBills;
        const busEl = document.getElementById("bill-count-bus");
        if (busEl) busEl.innerText = busBills;
        
        // Category grid
        const grid = document.getElementById("category-grid");
        if (grid) {
            grid.innerHTML = "";
            const sampleIcons = {
                "Computer": "💻",
                "CPU": "🖥️",
                "Monitor": "📺",
                "Printer": "🖨️",
                "Air Conditioner": "❄️",
                "Projector": "📽️",
                "UPS": "🔋",
                "CCTV Camera": "📹",
                "Router": "🌐",
                "Switch": "🔌",
                "Bus Battery": "🚌",
                "Other Equipment": "⚙️"
            };
            categories.slice(0, 8).forEach(cat => {
                const icon = sampleIcons[cat.category_name] || "⚙️";
                const count = assets.filter(a => a.category === cat.category_name).length;
                
                const card = document.createElement("div");
                card.className = "glass-card category-card";
                card.innerHTML = `
                    <span class="category-icon">${icon}</span>
                    <h3>${cat.category_name}</h3>
                    <p>${cat.description || 'No description available.'}</p>
                    <p style="margin-top:0.75rem; font-weight:600; color:var(--accent-blue);">${count} Registered</p>
                `;
                grid.appendChild(card);
            });
        }
    } catch (e) {
        console.error("Home page init failed", e);
    }
}

// 2. LOGIN PAGE
function initLoginPage() {
    const form = document.getElementById("login-form");
    if (!form) return;
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        
        try {
            const data = await apiFetch("/admin/login/", {
                method: "POST",
                body: JSON.stringify({ username, password })
            });
            
            localStorage.setItem("adminUser", JSON.stringify(data.user));
            showToast("Login successful! Redirecting...", "success");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } catch (err) {
            // Toast error handles notifications
        }
    });
}

// 3. DASHBOARD PAGE
async function initDashboardPage() {
    try {
        const assets = await apiFetch("/assets/");
        const allocations = await apiFetch("/allocations/");
        
        // Counter variables
        const total = assets.length;
        const available = assets.filter(a => a.status.toLowerCase() === "available").length;
        const maintenance = assets.filter(a => a.status.toLowerCase() === "under maintenance").length;
        
        // Expiry within 90 days
        let expiringCount = 0;
        const today = new Date();
        const ninetyDaysLater = new Date();
        ninetyDaysLater.setDate(today.getDate() + 90);
        
        assets.forEach(a => {
            if (a.warranty_expiry) {
                const expDate = new Date(a.warranty_expiry);
                if (expDate >= today && expDate <= ninetyDaysLater) {
                    exping = true;
                    expiringCount++;
                }
            }
        });
        
        document.getElementById("dash-total").innerText = total;
        document.getElementById("dash-available").innerText = available;
        document.getElementById("dash-maintenance").innerText = maintenance;
        document.getElementById("dash-expiring").innerText = expiringCount;
        
        // Calculate and display bill counts for Dashboard
        const pcCategories = ["Computer", "CPU", "Monitor", "Router", "Switch"];
        const pcBills = assets.filter(a => pcCategories.includes(a.category) && a.bill_document).length;
        const acBills = assets.filter(a => a.category === "Air Conditioner" && a.bill_document).length;
        const busBills = assets.filter(a => a.category === "Bus Battery" && a.bill_document).length;
        
        const pcEl = document.getElementById("dash-bill-count-pc");
        if (pcEl) pcEl.innerText = pcBills;
        const acEl = document.getElementById("dash-bill-count-ac");
        if (acEl) acEl.innerText = acBills;
        const busEl = document.getElementById("dash-bill-count-bus");
        if (busEl) busEl.innerText = busBills;
        
        // Department-wise breakdown
        const deptCounts = {};
        allocations.forEach(alloc => {
            const dName = alloc.department_name;
            deptCounts[dName] = (deptCounts[dName] || 0) + 1;
        });
        
        const chartContainer = document.getElementById("dept-chart");
        if (chartContainer) {
            chartContainer.innerHTML = "";
            const depts = Object.keys(deptCounts);
            const maxVal = Math.max(...Object.values(deptCounts), 1);
            
            depts.forEach(d => {
                const count = deptCounts[d];
                const pct = (count / maxVal) * 100;
                
                const barWrapper = document.createElement("div");
                barWrapper.className = "chart-bar-wrapper";
                barWrapper.innerHTML = `
                    <div class="chart-bar" style="height: ${pct}%">
                        <span class="chart-bar-value">${count}</span>
                    </div>
                    <span class="chart-bar-label" title="${d}">${d.split(' ')[0]}</span>
                `;
                chartContainer.appendChild(barWrapper);
            });
        }
        
        // Recent Purchases (sorted by date descending)
        const recentTable = document.getElementById("recent-purchases-table");
        if (recentTable) {
            recentTable.innerHTML = "";
            const sortedAssets = [...assets].sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date));
            const limit = sortedAssets.slice(0, 5);
            
            if (limit.length === 0) {
                recentTable.innerHTML = `<tr><td colspan="5" style="text-align:center;">No recent purchases recorded.</td></tr>`;
            } else {
                limit.forEach(a => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td><strong>${a.asset_name}</strong></td>
                        <td>${a.category}</td>
                        <td>${a.brand || '-'}</td>
                        <td>${a.purchase_date}</td>
                        <td>₹${parseFloat(a.purchase_price).toLocaleString('en-IN')}</td>
                    `;
                    recentTable.appendChild(tr);
                });
            }
        }
    } catch (e) {
        console.error("Dashboard data load failed", e);
    }
}

// 4. ASSETS PAGE
let allAssets = [];
let categoriesList = [];
let vendorsList = [];

async function initAssetsPage() {
    const searchInput = document.getElementById("asset-search");
    const openAddBtn = document.getElementById("btn-add-asset");
    const modal = document.getElementById("asset-modal");
    const form = document.getElementById("asset-form");
    const modalClose = modal.querySelector(".modal-close");
    const cancelBtn = modal.querySelector(".btn-secondary");
    
    // Open modal
    openAddBtn.addEventListener("click", () => {
        document.getElementById("modal-title").innerText = "Add Asset";
        form.reset();
        document.getElementById("edit-asset-id").value = "";
        document.getElementById("current-bill-doc-link").style.display = "none";
        document.getElementById("asset-status-group").style.display = "none"; // Available by default on add
        modal.classList.add("active");
    });
    
    // Close modal
    const closeModal = () => modal.classList.remove("active");
    modalClose.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    
    // Save Asset
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const assetId = document.getElementById("edit-asset-id").value;
        
        let billUrl = null;
        try {
            billUrl = await uploadFile("asset_bill");
        } catch (err) {
            return; // Upload failed, stop submission
        }
        
        const payload = {
            asset_name: document.getElementById("asset_name").value.trim(),
            category: document.getElementById("asset_category").value,
            brand: document.getElementById("asset_brand").value.trim(),
            model: document.getElementById("asset_model").value.trim(),
            serial_number: document.getElementById("asset_serial").value.trim(),
            purchase_date: document.getElementById("asset_purchase_date").value,
            purchase_price: parseFloat(document.getElementById("asset_price").value),
            warranty_expiry: document.getElementById("asset_warranty").value,
            status: assetId ? document.getElementById("asset_status").value : "Available",
            bill_document: billUrl
        };
        
        // Keep existing document if no new file is uploaded
        if (!billUrl && assetId) {
            const existing = allAssets.find(a => a.asset_id === parseInt(assetId));
            if (existing) {
                payload.bill_document = existing.bill_document;
            }
        }
        
        try {
            if (assetId) {
                // Update
                await apiFetch(`/assets/update/${assetId}/`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
                showToast("Asset updated successfully", "success");
            } else {
                // Add
                await apiFetch("/assets/add/", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
                showToast("Asset added successfully", "success");
            }
            closeModal();
            loadAssetsData();
        } catch (err) {}
    });
    
    // Search box
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        renderAssetsTable(allAssets.filter(a => 
            a.asset_name.toLowerCase().includes(query) || 
            a.category.toLowerCase().includes(query) ||
            a.serial_number.toLowerCase().includes(query) ||
            (a.brand && a.brand.toLowerCase().includes(query))
        ));
    });
    
    // Load metadata and assets
    await loadAssetMetaOptions();
    await loadAssetsData();
}

async function loadAssetMetaOptions() {
    try {
        categoriesList = await apiFetch("/categories/");
        const catSelect = document.getElementById("asset_category");
        catSelect.innerHTML = `<option value="">Select Category</option>`;
        categoriesList.forEach(c => {
            catSelect.innerHTML += `<option value="${c.category_name}">${c.category_name}</option>`;
        });
    } catch (e) {}
}

async function loadAssetsData() {
    try {
        allAssets = await apiFetch("/assets/");
        
        const urlParams = new URLSearchParams(window.location.search);
        const filter = urlParams.get("filter");
        
        if (filter) {
            let filtered = [...allAssets];
            if (filter === "available") {
                filtered = allAssets.filter(a => a.status.toLowerCase() === "available");
            } else if (filter === "maintenance") {
                filtered = allAssets.filter(a => a.status.toLowerCase() === "under maintenance");
            } else if (filter === "expiring") {
                const today = new Date();
                const ninetyDaysLater = new Date();
                ninetyDaysLater.setDate(today.getDate() + 90);
                filtered = allAssets.filter(a => {
                    if (!a.warranty_expiry) return false;
                    const expDate = new Date(a.warranty_expiry);
                    return expDate >= today && expDate <= ninetyDaysLater;
                });
            } else if (filter === "pc_bills") {
                const pcCategories = ["Computer", "CPU", "Monitor", "Router", "Switch"];
                filtered = allAssets.filter(a => pcCategories.includes(a.category) && a.bill_document);
            } else if (filter === "ac_bills") {
                filtered = allAssets.filter(a => a.category === "Air Conditioner" && a.bill_document);
            } else if (filter === "bus_bills") {
                filtered = allAssets.filter(a => a.category === "Bus Battery" && a.bill_document);
            }
            renderAssetsTable(filtered);
            
            const searchInput = document.getElementById("asset-search");
            if (searchInput) {
                searchInput.placeholder = `Active filter: ${filter}`;
            }
        } else {
            renderAssetsTable(allAssets);
        }
    } catch (e) {}
}

function renderAssetsTable(list) {
    const tbody = document.getElementById("assets-table-body");
    tbody.innerHTML = "";
    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">No assets match current criteria.</td></tr>`;
        return;
    }
    
    list.forEach(a => {
        const tr = document.createElement("tr");
        const docLink = a.bill_document ? `<a href="${API_URL}${a.bill_document}" target="_blank" class="link-icon" title="View Purchase Invoice/Bill" style="margin-left: 0.5rem; vertical-align: middle;">📎</a>` : '';
        tr.innerHTML = `
            <td>${a.asset_id}</td>
            <td><strong>${a.asset_name}</strong>${docLink}</td>
            <td>${a.category}</td>
            <td>${a.brand || '-'} (${a.model || '-'})</td>
            <td><code>${a.serial_number}</code></td>
            <td>₹${parseFloat(a.purchase_price).toLocaleString('en-IN')}</td>
            <td>${a.warranty_expiry}</td>
            <td><span class="badge badge-${a.status.toLowerCase().replace(' ', '_')}">${a.status}</span></td>
            <td>
                <button class="btn btn-secondary btn-icon" onclick="editAsset(${a.asset_id})" title="Edit Asset"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                <button class="btn btn-danger btn-icon" onclick="deleteAsset(${a.asset_id})" title="Delete Asset"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.editAsset = function(id) {
    const asset = allAssets.find(a => a.asset_id === id);
    if (!asset) return;
    
    document.getElementById("modal-title").innerText = "Edit Asset";
    document.getElementById("edit-asset-id").value = asset.asset_id;
    document.getElementById("asset_name").value = asset.asset_name;
    document.getElementById("asset_category").value = asset.category;
    document.getElementById("asset_brand").value = asset.brand || "";
    document.getElementById("asset_model").value = asset.model || "";
    document.getElementById("asset_serial").value = asset.serial_number;
    document.getElementById("asset_purchase_date").value = asset.purchase_date;
    document.getElementById("asset_price").value = asset.purchase_price;
    document.getElementById("asset_warranty").value = asset.warranty_expiry;
    
    const statusGroup = document.getElementById("asset-status-group");
    statusGroup.style.display = "block";
    document.getElementById("asset_status").value = asset.status;
    
    document.getElementById("asset_bill").value = "";
    const currentBill = document.getElementById("current-bill-doc-link");
    if (asset.bill_document) {
        currentBill.innerHTML = `Current Bill: <a href="${API_URL}${asset.bill_document}" target="_blank" style="font-weight:600; color:var(--accent-indigo);">View Attached Document</a>`;
        currentBill.style.display = "block";
    } else {
        currentBill.style.display = "none";
    }
    
    document.getElementById("asset-modal").classList.add("active");
};

window.deleteAsset = async function(id) {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    try {
        await apiFetch(`/assets/delete/${id}/`, { method: "DELETE" });
        showToast("Asset deleted successfully", "success");
        loadAssetsData();
    } catch (e) {}
};

// 5. CATEGORIES PAGE
let allCategories = [];
async function initCategoriesPage() {
    const form = document.getElementById("category-form");
    const openAddBtn = document.getElementById("btn-add-category");
    const modal = document.getElementById("category-modal");
    const modalClose = modal.querySelector(".modal-close");
    const cancelBtn = modal.querySelector(".btn-secondary");
    
    openAddBtn.addEventListener("click", () => {
        document.getElementById("modal-title").innerText = "Add Category";
        form.reset();
        document.getElementById("edit-category-id").value = "";
        modal.classList.add("active");
    });
    
    const closeModal = () => modal.classList.remove("active");
    modalClose.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const catId = document.getElementById("edit-category-id").value;
        const payload = {
            category_name: document.getElementById("category_name").value.trim(),
            description: document.getElementById("category_desc").value.trim()
        };
        
        try {
            if (catId) {
                await apiFetch(`/categories/update/${catId}/`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
                showToast("Category updated successfully", "success");
            } else {
                await apiFetch("/categories/add/", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
                showToast("Category added successfully", "success");
            }
            closeModal();
            loadCategoriesData();
        } catch (err) {}
    });
    
    await loadCategoriesData();
}

async function loadCategoriesData() {
    try {
        allCategories = await apiFetch("/categories/");
        renderCategoriesTable(allCategories);
    } catch (e) {}
}

function renderCategoriesTable(list) {
    const tbody = document.getElementById("categories-table-body");
    tbody.innerHTML = "";
    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No categories found.</td></tr>`;
        return;
    }
    
    list.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${c.category_id}</td>
            <td><strong>${c.category_name}</strong></td>
            <td>${c.description || '-'}</td>
            <td>
                <button class="btn btn-secondary btn-icon" onclick="editCategory(${c.category_id})" title="Edit Category"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                <button class="btn btn-danger btn-icon" onclick="deleteCategory(${c.category_id})" title="Delete Category"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.editCategory = function(id) {
    const cat = allCategories.find(c => c.category_id === id);
    if (!cat) return;
    
    document.getElementById("modal-title").innerText = "Edit Category";
    document.getElementById("edit-category-id").value = cat.category_id;
    document.getElementById("category_name").value = cat.category_name;
    document.getElementById("category_desc").value = cat.description || "";
    document.getElementById("category-modal").classList.add("active");
};

window.deleteCategory = async function(id) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
        await apiFetch(`/categories/delete/${id}/`, { method: "DELETE" });
        showToast("Category deleted successfully", "success");
        loadCategoriesData();
    } catch (e) {}
};

// 6. DEPARTMENTS PAGE
let allDepartments = [];
async function initDepartmentsPage() {
    const form = document.getElementById("department-form");
    const openAddBtn = document.getElementById("btn-add-dept");
    const modal = document.getElementById("department-modal");
    const modalClose = modal.querySelector(".modal-close");
    const cancelBtn = modal.querySelector(".btn-secondary");
    
    openAddBtn.addEventListener("click", () => {
        document.getElementById("modal-title").innerText = "Add Department";
        form.reset();
        document.getElementById("edit-dept-id").value = "";
        modal.classList.add("active");
    });
    
    const closeModal = () => modal.classList.remove("active");
    modalClose.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const deptId = document.getElementById("edit-dept-id").value;
        const payload = {
            department_name: document.getElementById("dept_name").value.trim(),
            hod_name: document.getElementById("dept_hod").value.trim(),
            location: document.getElementById("dept_location").value.trim()
        };
        
        try {
            if (deptId) {
                await apiFetch(`/departments/update/${deptId}/`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
                showToast("Department updated successfully", "success");
            } else {
                await apiFetch("/departments/add/", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
                showToast("Department added successfully", "success");
            }
            closeModal();
            loadDepartmentsData();
        } catch (err) {}
    });
    
    await loadDepartmentsData();
}

async function loadDepartmentsData() {
    try {
        allDepartments = await apiFetch("/departments/");
        renderDepartmentsTable(allDepartments);
    } catch (e) {}
}

function renderDepartmentsTable(list) {
    const tbody = document.getElementById("departments-table-body");
    tbody.innerHTML = "";
    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No departments found.</td></tr>`;
        return;
    }
    
    list.forEach(d => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${d.department_id}</td>
            <td><strong>${d.department_name}</strong></td>
            <td>${d.hod_name || '-'}</td>
            <td>${d.location || '-'}</td>
            <td>
                <button class="btn btn-secondary btn-icon" onclick="editDepartment(${d.department_id})" title="Edit Department"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                <button class="btn btn-danger btn-icon" onclick="deleteDepartment(${d.department_id})" title="Delete Department"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.editDepartment = function(id) {
    const dept = allDepartments.find(d => d.department_id === id);
    if (!dept) return;
    
    document.getElementById("modal-title").innerText = "Edit Department";
    document.getElementById("edit-dept-id").value = dept.department_id;
    document.getElementById("dept_name").value = dept.department_name;
    document.getElementById("dept_hod").value = dept.hod_name || "";
    document.getElementById("dept_location").value = dept.location || "";
    document.getElementById("department-modal").classList.add("active");
};

window.deleteDepartment = async function(id) {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
        await apiFetch(`/departments/delete/${id}/`, { method: "DELETE" });
        showToast("Department deleted successfully", "success");
        loadDepartmentsData();
    } catch (e) {}
};

// 7. VENDORS PAGE
let allVendors = [];
async function initVendorsPage() {
    const form = document.getElementById("vendor-form");
    const openAddBtn = document.getElementById("btn-add-vendor");
    const modal = document.getElementById("vendor-modal");
    const modalClose = modal.querySelector(".modal-close");
    const cancelBtn = modal.querySelector(".btn-secondary");
    
    openAddBtn.addEventListener("click", () => {
        document.getElementById("modal-title").innerText = "Add Vendor";
        form.reset();
        document.getElementById("edit-vendor-id").value = "";
        modal.classList.add("active");
    });
    
    const closeModal = () => modal.classList.remove("active");
    modalClose.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const vendorId = document.getElementById("edit-vendor-id").value;
        const payload = {
            vendor_name: document.getElementById("vendor_name").value.trim(),
            contact_person: document.getElementById("vendor_contact").value.trim(),
            phone: document.getElementById("vendor_phone").value.trim(),
            email: document.getElementById("vendor_email").value.trim(),
            address: document.getElementById("vendor_address").value.trim()
        };
        
        try {
            if (vendorId) {
                await apiFetch(`/vendors/update/${vendorId}/`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
                showToast("Vendor updated successfully", "success");
            } else {
                await apiFetch("/vendors/add/", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
                showToast("Vendor added successfully", "success");
            }
            closeModal();
            loadVendorsData();
        } catch (err) {}
    });
    
    await loadVendorsData();
}

async function loadVendorsData() {
    try {
        allVendors = await apiFetch("/vendors/");
        renderVendorsTable(allVendors);
    } catch (e) {}
}

function renderVendorsTable(list) {
    const tbody = document.getElementById("vendors-table-body");
    tbody.innerHTML = "";
    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No vendors found.</td></tr>`;
        return;
    }
    
    list.forEach(v => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${v.vendor_id}</td>
            <td><strong>${v.vendor_name}</strong></td>
            <td>${v.contact_person || '-'}</td>
            <td>${v.phone || '-'}</td>
            <td>${v.email || '-'}</td>
            <td>${v.address || '-'}</td>
            <td>
                <button class="btn btn-secondary btn-icon" onclick="editVendor(${v.vendor_id})" title="Edit Vendor"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                <button class="btn btn-danger btn-icon" onclick="deleteVendor(${v.vendor_id})" title="Delete Vendor"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.editVendor = function(id) {
    const vendor = allVendors.find(v => v.vendor_id === id);
    if (!vendor) return;
    
    document.getElementById("modal-title").innerText = "Edit Vendor";
    document.getElementById("edit-vendor-id").value = vendor.vendor_id;
    document.getElementById("vendor_name").value = vendor.vendor_name;
    document.getElementById("vendor_contact").value = vendor.contact_person || "";
    document.getElementById("vendor_phone").value = vendor.phone || "";
    document.getElementById("vendor_email").value = vendor.email || "";
    document.getElementById("vendor_address").value = vendor.address || "";
    document.getElementById("vendor-modal").classList.add("active");
};

window.deleteVendor = async function(id) {
    if (!confirm("Are you sure you want to delete this vendor?")) return;
    try {
        await apiFetch(`/vendors/delete/${id}/`, { method: "DELETE" });
        showToast("Vendor deleted successfully", "success");
        loadVendorsData();
    } catch (e) {}
};

// 8. ALLOCATIONS & MAINTENANCE PAGE
let allAllocations = [];
async function initAllocationsPage() {
    const form = document.getElementById("allocation-form");
    const openAddBtn = document.getElementById("btn-add-allocation");
    const modal = document.getElementById("allocation-modal");
    const modalClose = modal.querySelector(".modal-close");
    const cancelBtn = modal.querySelector(".btn-secondary");
    
    openAddBtn.addEventListener("click", async () => {
        document.getElementById("modal-title").innerText = "Allocate Asset";
        form.reset();
        document.getElementById("edit-alloc-id").value = "";
        document.getElementById("current-alloc-doc-link").style.display = "none";
        
        // Load eligible assets for new allocation (either available assets or keep current)
        await loadAllocationDropdowns();
        modal.classList.add("active");
    });
    
    const closeModal = () => modal.classList.remove("active");
    modalClose.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const allocId = document.getElementById("edit-alloc-id").value;
        
        let docUrl = null;
        try {
            docUrl = await uploadFile("alloc_document");
        } catch (err) {
            return; // Upload failed, block submission
        }
        
        const payload = {
            asset_name: document.getElementById("alloc_asset").value,
            department_name: document.getElementById("alloc_dept").value,
            assigned_date: document.getElementById("alloc_assigned_date").value,
            maintenance_date: document.getElementById("alloc_maintenance_date").value,
            maintenance_status: document.getElementById("alloc_status").value,
            remarks: document.getElementById("alloc_remarks").value.trim(),
            maintenance_document: docUrl
        };
        
        // Keep existing document if no new file is uploaded
        if (!docUrl && allocId) {
            const existing = allAllocations.find(al => al.allocation_id === parseInt(allocId));
            if (existing) {
                payload.maintenance_document = existing.maintenance_document;
            }
        }
        
        try {
            if (allocId) {
                await apiFetch(`/allocations/update/${allocId}/`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
                showToast("Allocation/Maintenance detail updated", "success");
            } else {
                await apiFetch("/allocations/add/", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
                showToast("Asset allocated successfully", "success");
            }
            closeModal();
            loadAllocationsData();
        } catch (err) {}
    });
    
    await loadAllocationsData();
}

async function loadAllocationDropdowns(currentAssetName = null) {
    try {
        const assets = await apiFetch("/assets/");
        const depts = await apiFetch("/departments/");
        
        const assetSelect = document.getElementById("alloc_asset");
        assetSelect.innerHTML = `<option value="">Select Asset</option>`;
        
        // Only allow allocating 'Available' assets, unless it's editing the current one
        assets.forEach(a => {
            if (a.status === "Available" || a.asset_name === currentAssetName) {
                assetSelect.innerHTML += `<option value="${a.asset_name}">${a.asset_name} (${a.serial_number})</option>`;
            }
        });
        
        const deptSelect = document.getElementById("alloc_dept");
        deptSelect.innerHTML = `<option value="">Select Department</option>`;
        depts.forEach(d => {
            deptSelect.innerHTML += `<option value="${d.department_name}">${d.department_name}</option>`;
        });
    } catch (e) {}
}

async function loadAllocationsData() {
    try {
        allAllocations = await apiFetch("/allocations/");
        renderAllocationsTable(allAllocations);
    } catch (e) {}
}

function renderAllocationsTable(list) {
    const tbody = document.getElementById("allocations-table-body");
    tbody.innerHTML = "";
    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No allocations or maintenance schedules recorded.</td></tr>`;
        return;
    }
    
    list.forEach(al => {
        const statusClass = al.maintenance_status.toLowerCase().replace(' ', '_');
        const docLink = al.maintenance_document ? `<a href="${API_URL}${al.maintenance_document}" target="_blank" class="link-icon" title="View Maintenance Report/Receipt" style="margin-left: 0.5rem; vertical-align: middle;">📎</a>` : '';
        tbody.innerHTML += `
            <tr>
                <td>${al.allocation_id}</td>
                <td><strong>${al.asset_name}</strong></td>
                <td>${al.department_name}</td>
                <td>${al.assigned_date}</td>
                <td>${al.maintenance_date}</td>
                <td><span class="badge badge-${statusClass === 'pending' ? 'maintenance' : statusClass === 'completed' ? 'available' : statusClass === 'warranty_claim' ? 'damaged' : 'scrap'}">${al.maintenance_status}</span></td>
                <td>${al.remarks || '-'}${docLink}</td>
                <td>
                    <button class="btn btn-secondary btn-icon" onclick="editAllocation(${al.allocation_id})" title="Edit Allocation"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                    <button class="btn btn-danger btn-icon" onclick="deleteAllocation(${al.allocation_id})" title="Delete Allocation"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>
                </td>
            </tr>
        `;
    });
}

window.editAllocation = async function(id) {
    const alloc = allAllocations.find(al => al.allocation_id === id);
    if (!alloc) return;
    
    await loadAllocationDropdowns(alloc.asset_name);
    
    document.getElementById("modal-title").innerText = "Edit Allocation & Maintenance";
    document.getElementById("edit-alloc-id").value = alloc.allocation_id;
    document.getElementById("alloc_asset").value = alloc.asset_name;
    document.getElementById("alloc_dept").value = alloc.department_name;
    document.getElementById("alloc_assigned_date").value = alloc.assigned_date;
    document.getElementById("alloc_maintenance_date").value = alloc.maintenance_date;
    document.getElementById("alloc_status").value = alloc.maintenance_status;
    document.getElementById("alloc_remarks").value = alloc.remarks || "";
    
    document.getElementById("alloc_document").value = "";
    const currentDoc = document.getElementById("current-alloc-doc-link");
    if (alloc.maintenance_document) {
        currentDoc.innerHTML = `Current Receipt: <a href="${API_URL}${alloc.maintenance_document}" target="_blank" style="font-weight:600; color:var(--accent-indigo);">View Attached Document</a>`;
        currentDoc.style.display = "block";
    } else {
        currentDoc.style.display = "none";
    }
    
    document.getElementById("allocation-modal").classList.add("active");
};

window.deleteAllocation = async function(id) {
    if (!confirm("Are you sure you want to delete this allocation? This will free the asset's status.")) return;
    try {
        await apiFetch(`/allocations/delete/${id}/`, { method: "DELETE" });
        showToast("Allocation deleted successfully", "success");
        loadAllocationsData();
    } catch (e) {}
};

// ==================== ROUTING SYSTEM ====================
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    renderNavbar();
    
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf("/") + 1) || "index.html";
    
    if (pageName === "index.html") {
        initHomePage();
    } else if (pageName === "login.html") {
        initLoginPage();
    } else if (pageName === "dashboard.html") {
        initDashboardPage();
    } else if (pageName === "assets.html") {
        initAssetsPage();
    } else if (pageName === "categories.html") {
        initCategoriesPage();
    } else if (pageName === "departments.html") {
        initDepartmentsPage();
    } else if (pageName === "vendors.html") {
        initVendorsPage();
    } else if (pageName === "allocations.html") {
        initAllocationsPage();
    }
});
