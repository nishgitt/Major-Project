const API_BASE = 'http://127.0.0.1:8000';

// Global state cache to store entities for easy lookup
let patientsCache = [];
let doctorsCache = [];
let appointmentsCache = [];
let recordsCache = [];
let billsCache = [];

// Toast Notifications
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            ${type === 'success' 
                ? '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>' 
                : '<path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
            }
        </svg>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Modal Helpers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

// Helper to format dates
function getTodayDateString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// ==================== PATIENTS MANAGEMENT ====================
async function fetchPatients() {
    try {
        const response = await fetch(`${API_BASE}/patients/`);
        if (!response.ok) throw new Error('Failed to fetch patients');
        patientsCache = await response.json();
        renderPatientsTable(patientsCache);
        populatePatientDropdowns(patientsCache);
    } catch (error) {
        console.error(error);
        showToast('Could not fetch patients from backend.', 'danger');
    }
}

function renderPatientsTable(patients) {
    const tableBody = document.getElementById('patients-table-body');
    if (!tableBody) return;
    
    if (patients.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No patients found.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = patients.map(p => `
        <tr>
            <td><strong>#${p.patient_id}</strong></td>
            <td>${p.patient_name}</td>
            <td>${p.age}</td>
            <td>${p.gender}</td>
            <td>${p.phone}</td>
            <td>${p.email}</td>
            <td><span class="badge badge-info">${p.blood_group}</span></td>
            <td>${p.address}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editPatient(${p.patient_id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deletePatient(${p.patient_id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function populatePatientDropdowns(patients) {
    const dropdowns = ['appointment-patient-name', 'record-patient-name', 'bill-patient-name'];
    dropdowns.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        
        // Preserve default empty option
        select.innerHTML = '<option value="">Select Patient</option>' + 
            patients.map(p => `<option value="${p.patient_name}">${p.patient_name} (#${p.patient_id})</option>`).join('');
    });
}

async function savePatient(e) {
    e.preventDefault();
    const id = document.getElementById('patient-form-id').value;
    const data = {
        patient_name: document.getElementById('patient-name').value,
        age: document.getElementById('patient-age').value,
        gender: document.getElementById('patient-gender').value,
        phone: document.getElementById('patient-phone').value,
        email: document.getElementById('patient-email').value,
        blood_group: document.getElementById('patient-blood-group').value,
        address: document.getElementById('patient-address').value
    };
    
    if (id) {
        data.patient_id = id;
    }

    const url = id ? `${API_BASE}/patients/update/${id}/` : `${API_BASE}/patients/add/`;
    const method = id ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Failed to save patient');
        
        showToast(id ? 'Patient updated successfully' : 'Patient registered successfully');
        closeModal('patient-modal');
        document.getElementById('patient-form').reset();
        document.getElementById('patient-form-id').value = '';
        fetchPatients();
    } catch (error) {
        console.error(error);
        showToast('Error saving patient records.', 'danger');
    }
}

function editPatient(id) {
    const patient = patientsCache.find(p => p.patient_id === id);
    if (!patient) return;
    
    document.getElementById('patient-modal-title').textContent = 'Update Patient Profile';
    document.getElementById('patient-form-id').value = patient.patient_id;
    document.getElementById('patient-name').value = patient.patient_name;
    document.getElementById('patient-age').value = patient.age;
    document.getElementById('patient-gender').value = patient.gender;
    document.getElementById('patient-phone').value = patient.phone;
    document.getElementById('patient-email').value = patient.email;
    document.getElementById('patient-blood-group').value = patient.blood_group;
    document.getElementById('patient-address').value = patient.address;
    
    openModal('patient-modal');
}

async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient profile?')) return;
    try {
        const response = await fetch(`${API_BASE}/patients/delete/${id}/`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete patient');
        showToast('Patient deleted successfully');
        fetchPatients();
    } catch (error) {
        console.error(error);
        showToast('Error deleting patient profile.', 'danger');
    }
}


// ==================== DOCTORS MANAGEMENT ====================
async function fetchDoctors() {
    try {
        const response = await fetch(`${API_BASE}/doctors/`);
        if (!response.ok) throw new Error('Failed to fetch doctors');
        doctorsCache = await response.json();
        renderDoctorsGrid(doctorsCache);
        populateDoctorDropdowns(doctorsCache);
    } catch (error) {
        console.error(error);
        showToast('Could not fetch doctors from backend.', 'danger');
    }
}

function renderDoctorsGrid(doctors) {
    const grid = document.getElementById('doctors-grid');
    if (!grid) return;
    
    if (doctors.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No doctors registered.</div>';
        return;
    }
    
    grid.innerHTML = doctors.map(d => `
        <div class="doctor-card">
            <div class="doctor-avatar">${d.doctor_name.split(' ').pop().charAt(0)}</div>
            <h3>${d.doctor_name}</h3>
            <div class="doctor-dept">${d.specialization} (${d.department})</div>
            <p style="color: var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.9rem;">
                Phone: ${d.phone}
            </p>
            <div class="doctor-meta">
                <span>
                    <strong>${d.experience} Years</strong>
                    Experience
                </span>
                <span>
                    <strong>₹${d.consultation_fee}</strong>
                    Fee
                </span>
            </div>
            <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem; justify-content: center;">
                <button class="btn btn-secondary btn-sm" onclick="editDoctor(${d.doctor_id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteDoctor(${d.doctor_id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function populateDoctorDropdowns(doctors) {
    const dropdowns = ['appointment-doctor-name', 'record-doctor-name', 'bill-doctor-fee'];
    dropdowns.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        
        if (id === 'bill-doctor-fee') {
            select.innerHTML = '<option value="" data-fee="0">Select Consulting Doctor</option>' + 
                doctors.map(d => `<option value="${d.doctor_name}" data-fee="${d.consultation_fee}">${d.doctor_name} (${d.department}) - ₹${d.consultation_fee}</option>`).join('');
        } else {
            select.innerHTML = '<option value="">Select Doctor</option>' + 
                doctors.map(d => `<option value="${d.doctor_name}">${d.doctor_name} (${d.department})</option>`).join('');
        }
    });
}

async function saveDoctor(e) {
    e.preventDefault();
    const id = document.getElementById('doctor-form-id').value;
    const data = {
        doctor_name: document.getElementById('doctor-name').value,
        specialization: document.getElementById('doctor-spec').value,
        department: document.getElementById('doctor-dept').value,
        experience: document.getElementById('doctor-exp').value,
        phone: document.getElementById('doctor-phone').value,
        consultation_fee: document.getElementById('doctor-fee').value
    };
    
    if (id) {
        data.doctor_id = id;
    }

    const url = id ? `${API_BASE}/doctors/update/${id}/` : `${API_BASE}/doctors/add/`;
    const method = id ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Failed to save doctor');
        
        showToast(id ? 'Doctor profile updated' : 'Doctor registered successfully');
        closeModal('doctor-modal');
        document.getElementById('doctor-form').reset();
        document.getElementById('doctor-form-id').value = '';
        fetchDoctors();
    } catch (error) {
        console.error(error);
        showToast('Error saving doctor profile.', 'danger');
    }
}

function editDoctor(id) {
    const doctor = doctorsCache.find(d => d.doctor_id === id);
    if (!doctor) return;
    
    document.getElementById('doctor-modal-title').textContent = 'Update Doctor Profile';
    document.getElementById('doctor-form-id').value = doctor.doctor_id;
    document.getElementById('doctor-name').value = doctor.doctor_name;
    document.getElementById('doctor-spec').value = doctor.specialization;
    document.getElementById('doctor-dept').value = doctor.department;
    document.getElementById('doctor-exp').value = doctor.experience;
    document.getElementById('doctor-phone').value = doctor.phone;
    document.getElementById('doctor-fee').value = doctor.consultation_fee;
    
    openModal('doctor-modal');
}

async function deleteDoctor(id) {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    try {
        const response = await fetch(`${API_BASE}/doctors/delete/${id}/`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete doctor');
        showToast('Doctor profile deleted successfully');
        fetchDoctors();
    } catch (error) {
        console.error(error);
        showToast('Error deleting doctor profile.', 'danger');
    }
}


// ==================== APPOINTMENTS MANAGEMENT ====================
async function fetchAppointments() {
    try {
        const response = await fetch(`${API_BASE}/appointments/`);
        if (!response.ok) throw new Error('Failed to fetch appointments');
        appointmentsCache = await response.json();
        renderAppointmentsTable(appointmentsCache);
    } catch (error) {
        console.error(error);
        showToast('Could not fetch appointments.', 'danger');
    }
}

function renderAppointmentsTable(appointments) {
    const tableBody = document.getElementById('appointments-table-body');
    if (!tableBody) return;
    
    if (appointments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No appointments scheduled.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = appointments.map(a => {
        let statusBadge = 'badge-warning';
        if (a.appointment_status === 'Completed') statusBadge = 'badge-success';
        if (a.appointment_status === 'Cancelled') statusBadge = 'badge-danger';
        
        return `
            <tr>
                <td><strong>#${a.appointment_id}</strong></td>
                <td>${a.patient_name}</td>
                <td>${a.doctor_name}</td>
                <td>${a.appointment_date}</td>
                <td>${a.appointment_time}</td>
                <td><span class="badge ${statusBadge}">${a.appointment_status}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editAppointment(${a.appointment_id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAppointment(${a.appointment_id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

async function saveAppointment(e) {
    e.preventDefault();
    const id = document.getElementById('appointment-form-id').value;
    const data = {
        patient_name: document.getElementById('appointment-patient-name').value,
        doctor_name: document.getElementById('appointment-doctor-name').value,
        appointment_date: document.getElementById('appointment-date').value,
        appointment_time: document.getElementById('appointment-time').value,
        appointment_status: document.getElementById('appointment-status').value
    };
    
    if (id) {
        data.appointment_id = id;
    }

    const url = id ? `${API_BASE}/appointments/update/${id}/` : `${API_BASE}/appointments/add/`;
    const method = id ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Failed to save appointment');
        
        showToast(id ? 'Appointment schedule updated' : 'Appointment booked successfully');
        closeModal('appointment-modal');
        document.getElementById('appointment-form').reset();
        document.getElementById('appointment-form-id').value = '';
        fetchAppointments();
    } catch (error) {
        console.error(error);
        showToast('Error booking appointment.', 'danger');
    }
}

function editAppointment(id) {
    const appointment = appointmentsCache.find(a => a.appointment_id === id);
    if (!appointment) return;
    
    document.getElementById('appointment-modal-title').textContent = 'Update Appointment';
    document.getElementById('appointment-form-id').value = appointment.appointment_id;
    document.getElementById('appointment-patient-name').value = appointment.patient_name;
    document.getElementById('appointment-doctor-name').value = appointment.doctor_name;
    document.getElementById('appointment-date').value = appointment.appointment_date;
    document.getElementById('appointment-time').value = appointment.appointment_time;
    document.getElementById('appointment-status').value = appointment.appointment_status;
    
    openModal('appointment-modal');
}

async function deleteAppointment(id) {
    if (!confirm('Are you sure you want to cancel and delete this appointment?')) return;
    try {
        const response = await fetch(`${API_BASE}/appointments/delete/${id}/`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete appointment');
        showToast('Appointment deleted successfully');
        fetchAppointments();
    } catch (error) {
        console.error(error);
        showToast('Error deleting appointment booking.', 'danger');
    }
}


// ==================== MEDICAL RECORDS ====================
async function fetchRecords() {
    try {
        const response = await fetch(`${API_BASE}/records/`);
        if (!response.ok) throw new Error('Failed to fetch records');
        recordsCache = await response.json();
        renderRecordsTable(recordsCache);
    } catch (error) {
        console.error(error);
        showToast('Could not fetch medical records.', 'danger');
    }
}

function renderRecordsTable(records) {
    const tableBody = document.getElementById('records-table-body');
    if (!tableBody) return;
    
    if (records.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No medical records logged.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = records.map(r => `
        <tr>
            <td><strong>#${r.record_id}</strong></td>
            <td>${r.patient_name}</td>
            <td>${r.doctor_name}</td>
            <td><strong style="color: #fff;">${r.diagnosis}</strong></td>
            <td><code>${r.prescription}</code></td>
            <td>${r.treatment}</td>
            <td>${r.visit_date}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editRecord(${r.record_id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteRecord(${r.record_id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function saveRecord(e) {
    e.preventDefault();
    const id = document.getElementById('record-form-id').value;
    const data = {
        patient_name: document.getElementById('record-patient-name').value,
        doctor_name: document.getElementById('record-doctor-name').value,
        diagnosis: document.getElementById('record-diagnosis').value,
        prescription: document.getElementById('record-prescription').value,
        treatment: document.getElementById('record-treatment').value,
        visit_date: document.getElementById('record-visit-date').value
    };
    
    if (id) {
        data.record_id = id;
    }

    const url = id ? `${API_BASE}/records/update/${id}/` : `${API_BASE}/records/add/`;
    const method = id ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Failed to save medical record');
        
        showToast(id ? 'Medical record updated' : 'Medical record saved successfully');
        closeModal('record-modal');
        document.getElementById('record-form').reset();
        document.getElementById('record-form-id').value = '';
        fetchRecords();
    } catch (error) {
        console.error(error);
        showToast('Error saving medical record details.', 'danger');
    }
}

function editRecord(id) {
    const record = recordsCache.find(r => r.record_id === id);
    if (!record) return;
    
    document.getElementById('record-modal-title').textContent = 'Update Medical Record';
    document.getElementById('record-form-id').value = record.record_id;
    document.getElementById('record-patient-name').value = record.patient_name;
    document.getElementById('record-doctor-name').value = record.doctor_name;
    document.getElementById('record-diagnosis').value = record.diagnosis;
    document.getElementById('record-prescription').value = record.prescription;
    document.getElementById('record-treatment').value = record.treatment;
    document.getElementById('record-visit-date').value = record.visit_date;
    
    openModal('record-modal');
}

async function deleteRecord(id) {
    if (!confirm('Are you sure you want to delete this medical record?')) return;
    try {
        const response = await fetch(`${API_BASE}/records/delete/${id}/`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete medical record');
        showToast('Medical record deleted');
        fetchRecords();
    } catch (error) {
        console.error(error);
        showToast('Error deleting medical record.', 'danger');
    }
}


// ==================== BILLING & INVOICES ====================
async function fetchBills() {
    try {
        const response = await fetch(`${API_BASE}/bills/`);
        if (!response.ok) throw new Error('Failed to fetch bills');
        billsCache = await response.json();
        renderBillsTable(billsCache);
    } catch (error) {
        console.error(error);
        showToast('Could not fetch bills database.', 'danger');
    }
}

function renderBillsTable(bills) {
    const tableBody = document.getElementById('bills-table-body');
    if (!tableBody) return;
    
    if (bills.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No invoices generated.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = bills.map(b => {
        let statusBadge = 'badge-warning';
        if (b.payment_status === 'Paid') statusBadge = 'badge-success';
        if (b.payment_status === 'Pending') statusBadge = 'badge-warning';
        
        return `
            <tr>
                <td><strong>#${b.bill_id}</strong></td>
                <td>${b.patient_name}</td>
                <td>₹${b.consultation_fee}</td>
                <td>₹${b.medicine_charge}</td>
                <td>₹${b.laboratory_charge}</td>
                <td><strong style="color: #fff;">₹${b.total_amount}</strong></td>
                <td><span class="badge badge-info">${b.payment_method}</span></td>
                <td><span class="badge ${statusBadge}">${b.payment_status}</span></td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="printBill(${b.bill_id})">Print</button>
                    <button class="btn btn-secondary btn-sm" onclick="editBill(${b.bill_id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBill(${b.bill_id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

async function saveBill(e) {
    e.preventDefault();
    const id = document.getElementById('bill-form-id').value;
    const data = {
        patient_name: document.getElementById('bill-patient-name').value,
        consultation_fee: document.getElementById('bill-consultation-fee').value,
        medicine_charge: document.getElementById('bill-medicine-charge').value,
        laboratory_charge: document.getElementById('bill-laboratory-charge').value,
        payment_method: document.getElementById('bill-payment-method').value,
        payment_status: document.getElementById('bill-payment-status').value
    };
    
    if (id) {
        data.bill_id = id;
    }

    const url = id ? `${API_BASE}/bills/update/${id}/` : `${API_BASE}/bills/add/`;
    const method = id ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Failed to save bill');
        
        showToast(id ? 'Invoice updated successfully' : 'Invoice generated successfully');
        closeModal('bill-modal');
        document.getElementById('bill-form').reset();
        document.getElementById('bill-form-id').value = '';
        fetchBills();
    } catch (error) {
        console.error(error);
        showToast('Error saving invoice records.', 'danger');
    }
}

function editBill(id) {
    const bill = billsCache.find(b => b.bill_id === id);
    if (!bill) return;
    
    document.getElementById('bill-modal-title').textContent = 'Update Invoice Details';
    document.getElementById('bill-form-id').value = bill.bill_id;
    document.getElementById('bill-patient-name').value = bill.patient_name;
    document.getElementById('bill-consultation-fee').value = bill.consultation_fee;
    document.getElementById('bill-medicine-charge').value = bill.medicine_charge;
    document.getElementById('bill-laboratory-charge').value = bill.laboratory_charge;
    document.getElementById('bill-payment-method').value = bill.payment_method;
    document.getElementById('bill-payment-status').value = bill.payment_status;
    
    openModal('bill-modal');
}

async function deleteBill(id) {
    if (!confirm('Are you sure you want to delete this bill invoice?')) return;
    try {
        const response = await fetch(`${API_BASE}/bills/delete/${id}/`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete bill');
        showToast('Invoice deleted successfully');
        fetchBills();
    } catch (error) {
        console.error(error);
        showToast('Error deleting invoice.', 'danger');
    }
}

function printBill(id) {
    const bill = billsCache.find(b => b.bill_id === id);
    if (!bill) return;
    
    // Create or locate the printable invoice container
    let printContainer = document.getElementById('printable-invoice-container');
    if (!printContainer) {
        printContainer = document.createElement('div');
        printContainer.id = 'printable-invoice-container';
        printContainer.className = 'glass-panel printable-bill';
        printContainer.style.display = 'none'; // hidden during normal browsing, handled by @media print css
        document.body.appendChild(printContainer);
    }
    
    const todayStr = getTodayDateString();
    
    printContainer.innerHTML = `
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
            <h1 style="font-size: 2.25rem; font-weight: 800; margin-bottom: 0.25rem;">HOSPITAL CARE</h1>
            <p style="color: #666; font-size: 0.9rem;">123 Healthcare Ave, Innovation Park, Hyderabad | Phone: +91 98765 43210</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 2rem;">
            <div>
                <h3 style="font-size: 1rem; color: #555; text-transform: uppercase; margin-bottom: 0.5rem;">Patient Details</h3>
                <p><strong>Name:</strong> ${bill.patient_name}</p>
            </div>
            <div style="text-align: right;">
                <h3 style="font-size: 1rem; color: #555; text-transform: uppercase; margin-bottom: 0.5rem;">Invoice Meta</h3>
                <p><strong>Invoice ID:</strong> #${bill.bill_id}</p>
                <p><strong>Billing Date:</strong> ${todayStr}</p>
            </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem; font-size: 0.95rem;">
            <thead>
                <tr style="border-bottom: 2px solid #ccc;">
                    <th style="text-align: left; padding: 0.75rem 0; color: #000; background: none;">Itemized Charges</th>
                    <th style="text-align: right; padding: 0.75rem 0; color: #000; background: none;">Amount (₹)</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 0.75rem 0; color: #333;">Consultation & Care Fee</td>
                    <td style="text-align: right; padding: 0.75rem 0; color: #333;">₹${bill.consultation_fee.toFixed(2)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 0.75rem 0; color: #333;">Pharmacy & Medicine Charges</td>
                    <td style="text-align: right; padding: 0.75rem 0; color: #333;">₹${bill.medicine_charge.toFixed(2)}</td>
                </tr>
                <tr style="border-bottom: 2px solid #ccc;">
                    <td style="padding: 0.75rem 0; color: #333;">Laboratory & Diagnostics Charges</td>
                    <td style="text-align: right; padding: 0.75rem 0; color: #333;">₹${bill.laboratory_charge.toFixed(2)}</td>
                </tr>
                <tr style="font-size: 1.15rem; font-weight: 700;">
                    <td style="padding: 1rem 0; color: #000;">Grand Total Amount</td>
                    <td style="text-align: right; padding: 1rem 0; color: #000;">₹${bill.total_amount.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
        
        <div style="background: #f9f9f9; padding: 1rem; border-radius: 8px; border: 1px solid #eee; margin-bottom: 2rem;">
            <p><strong>Payment Status:</strong> ${bill.payment_status} (${bill.payment_method})</p>
        </div>
        
        <div style="text-align: center; color: #888; font-size: 0.8rem; margin-top: 4rem;">
            <p>Thank you for choosing Hospital Care. Wish you a speedy recovery!</p>
            <p style="margin-top: 0.5rem; font-size: 0.7rem;">System-generated invoice. No physical signature required.</p>
        </div>
    `;
    
    // Trigger standard print prompt
    window.print();
}


// ==================== ADMIN DASHBOARD ====================
async function loadDashboard() {
    try {
        // Fetch all datasets concurrently for dashboard computing
        const [patientsRes, doctorsRes, appointmentsRes, recordsRes, billsRes] = await Promise.all([
            fetch(`${API_BASE}/patients/`),
            fetch(`${API_BASE}/doctors/`),
            fetch(`${API_BASE}/appointments/`),
            fetch(`${API_BASE}/records/`),
            fetch(`${API_BASE}/bills/`)
        ]);
        
        const patients = await patientsRes.json();
        const doctors = await doctorsRes.json();
        const appointments = await appointmentsRes.json();
        const records = await recordsRes.json();
        const bills = await billsRes.json();
        
        // 1. Write core KPIs metrics
        document.getElementById('dash-total-patients').textContent = patients.length;
        document.getElementById('dash-total-doctors').textContent = doctors.length;
        
        // 2. Count Today's Appointments (match date string)
        const todayStr = getTodayDateString();
        const todaysAppointments = appointments.filter(a => a.appointment_date === todayStr);
        document.getElementById('dash-today-appointments').textContent = todaysAppointments.length;
        
        // 3. Total Medical Records
        document.getElementById('dash-total-records').textContent = records.length;
        
        // 4. Compute financial summaries
        let totalRevenue = 0;
        let pendingPayments = 0;
        
        bills.forEach(b => {
            if (b.payment_status === 'Paid') {
                totalRevenue += b.total_amount;
            } else {
                pendingPayments += b.total_amount;
            }
        });
        
        document.getElementById('dash-total-revenue').textContent = `₹${totalRevenue.toLocaleString()}`;
        document.getElementById('dash-pending-revenue').textContent = `₹${pendingPayments.toLocaleString()}`;
        
        // 5. Render recent records in preview table
        renderRecentActivity(patients, doctors, appointments, bills);
    } catch (error) {
        console.error(error);
        showToast('Failed to compile admin dashboard data.', 'danger');
    }
}

function renderRecentActivity(patients, doctors, appointments, bills) {
    const listElement = document.getElementById('recent-activity-list');
    if (!listElement) return;
    
    const items = [];
    
    // Gather last 3 additions of patients, doctors, appointments
    patients.slice(-3).reverse().forEach(p => {
        items.push({
            type: 'patient',
            time: 'Recent Register',
            text: `Patient <strong>${p.patient_name}</strong> registered (#${p.patient_id})`
        });
    });
    
    appointments.slice(-3).reverse().forEach(a => {
        items.push({
            type: 'appointment',
            time: `${a.appointment_date} ${a.appointment_time}`,
            text: `Appointment for <strong>${a.patient_name}</strong> with <strong>${a.doctor_name}</strong> - <span class="badge ${a.appointment_status === 'Completed' ? 'badge-success' : 'badge-warning'}">${a.appointment_status}</span>`
        });
    });

    bills.slice(-3).reverse().forEach(b => {
        items.push({
            type: 'bill',
            time: 'Recent Invoice',
            text: `Invoice #${b.bill_id} generated for <strong>${b.patient_name}</strong> - <strong>₹${b.total_amount}</strong> (<span class="badge ${b.payment_status === 'Paid' ? 'badge-success' : 'badge-danger'}">${b.payment_status}</span>)`
        });
    });
    
    // Sort or splice
    if (items.length === 0) {
        listElement.innerHTML = '<li style="list-style: none; padding: 1rem; text-align: center; color: var(--text-secondary);">No recent activities found.</li>';
        return;
    }
    
    listElement.innerHTML = items.slice(0, 5).map(item => `
        <li style="padding: 1rem 0; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; list-style: none; display: flex; justify-content: space-between; align-items: center;">
            <span>${item.text}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">${item.time}</span>
        </li>
    `).join('');
}


// ==================== ROUTER/INITIALIZER ====================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Bind form submit handlers
    const patientForm = document.getElementById('patient-form');
    if (patientForm) patientForm.addEventListener('submit', savePatient);
    
    const doctorForm = document.getElementById('doctor-form');
    if (doctorForm) doctorForm.addEventListener('submit', saveDoctor);
    
    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) appointmentForm.addEventListener('submit', saveAppointment);
    
    const recordForm = document.getElementById('record-form');
    if (recordForm) recordForm.addEventListener('submit', saveRecord);
    
    const billForm = document.getElementById('bill-form');
    if (billForm) billForm.addEventListener('submit', saveBill);
    
    // 2. Fetch specific database entries depending on which page elements exist
    const hasPatients = document.getElementById('patients-table-body');
    const hasDoctors = document.getElementById('doctors-grid');
    const hasAppointments = document.getElementById('appointments-table-body');
    const hasRecords = document.getElementById('records-table-body');
    const hasBills = document.getElementById('bills-table-body');
    const hasDashboard = document.getElementById('dashboard-metrics');
    
    // Setup date picker default in records/appointments if exists
    const datePickers = ['appointment-date', 'record-visit-date'];
    datePickers.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = getTodayDateString();
    });

    // Populate billing fees automatically if a doctor is selected
    const docFeeSelector = document.getElementById('bill-doctor-fee');
    if (docFeeSelector) {
        docFeeSelector.addEventListener('change', () => {
            const selectedOption = docFeeSelector.options[docFeeSelector.selectedIndex];
            const fee = selectedOption.getAttribute('data-fee') || 0;
            document.getElementById('bill-consultation-fee').value = fee;
        });
    }

    // Run loader routines
    if (hasPatients) {
        fetchPatients();
    }
    if (hasDoctors) {
        fetchDoctors();
    }
    if (hasAppointments) {
        fetchPatients(); // dependency to fill patient list
        fetchDoctors();  // dependency to fill doctor list
        fetchAppointments();
    }
    if (hasRecords) {
        fetchPatients(); 
        fetchDoctors();  
        fetchRecords();
    }
    if (hasBills) {
        fetchPatients();
        fetchDoctors(); // to retrieve consultation fee suggestions
        fetchBills();
    }
    if (hasDashboard) {
        loadDashboard();
        // Set up refresh timer every 10 seconds
        setInterval(loadDashboard, 10000);
    }
});
