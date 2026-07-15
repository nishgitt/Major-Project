import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'hospital.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Patient Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            patient_id INTEGER PRIMARY KEY,
            patient_name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            blood_group TEXT NOT NULL,
            address TEXT NOT NULL
        )
    ''')
    
    # 2. Doctor Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS doctors (
            doctor_id INTEGER PRIMARY KEY,
            doctor_name TEXT NOT NULL,
            specialization TEXT NOT NULL,
            department TEXT NOT NULL,
            experience INTEGER NOT NULL,
            phone TEXT NOT NULL,
            consultation_fee REAL NOT NULL
        )
    ''')
    
    # 3. Appointment Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS appointments (
            appointment_id INTEGER PRIMARY KEY,
            patient_name TEXT NOT NULL,
            doctor_name TEXT NOT NULL,
            appointment_date TEXT NOT NULL,
            appointment_time TEXT NOT NULL,
            appointment_status TEXT NOT NULL
        )
    ''')
    
    # 4. Medical Record Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS medical_records (
            record_id INTEGER PRIMARY KEY,
            patient_name TEXT NOT NULL,
            doctor_name TEXT NOT NULL,
            diagnosis TEXT NOT NULL,
            prescription TEXT NOT NULL,
            treatment TEXT NOT NULL,
            visit_date TEXT NOT NULL
        )
    ''')
    
    # 5. Billing Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bills (
            bill_id INTEGER PRIMARY KEY,
            patient_name TEXT NOT NULL,
            consultation_fee REAL NOT NULL,
            medicine_charge REAL NOT NULL,
            laboratory_charge REAL NOT NULL,
            total_amount REAL NOT NULL,
            payment_method TEXT NOT NULL,
            payment_status TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

def get_next_id(table_name, id_column, start_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(f"SELECT MAX({id_column}) FROM {table_name}")
    row = cursor.fetchone()
    max_id = row[0]
    conn.close()
    if max_id is None:
        return start_id
    return max_id + 1

# ==================== PATIENT CRUD ====================
def add_patient(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    patient_id = data.get('patient_id')
    if not patient_id:
        patient_id = get_next_id('patients', 'patient_id', 101)
    else:
        patient_id = int(patient_id)
        
    cursor.execute('''
        INSERT INTO patients (patient_id, patient_name, age, gender, phone, email, blood_group, address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        patient_id,
        data.get('patient_name'),
        int(data.get('age', 0)),
        data.get('gender'),
        data.get('phone'),
        data.get('email'),
        data.get('blood_group'),
        data.get('address')
    ))
    conn.commit()
    conn.close()
    return patient_id

def get_patients():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM patients')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_patient(patient_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE patients
        SET patient_name = ?, age = ?, gender = ?, phone = ?, email = ?, blood_group = ?, address = ?
        WHERE patient_id = ?
    ''', (
        data.get('patient_name'),
        int(data.get('age', 0)),
        data.get('gender'),
        data.get('phone'),
        data.get('email'),
        data.get('blood_group'),
        data.get('address'),
        patient_id
    ))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

def delete_patient(patient_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM patients WHERE patient_id = ?', (patient_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0


# ==================== DOCTOR CRUD ====================
def add_doctor(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    doctor_id = data.get('doctor_id')
    if not doctor_id:
        doctor_id = get_next_id('doctors', 'doctor_id', 201)
    else:
        doctor_id = int(doctor_id)
        
    cursor.execute('''
        INSERT INTO doctors (doctor_id, doctor_name, specialization, department, experience, phone, consultation_fee)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        doctor_id,
        data.get('doctor_name'),
        data.get('specialization'),
        data.get('department'),
        int(data.get('experience', 0)),
        data.get('phone'),
        float(data.get('consultation_fee', 0.0))
    ))
    conn.commit()
    conn.close()
    return doctor_id

def get_doctors():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM doctors')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_doctor(doctor_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE doctors
        SET doctor_name = ?, specialization = ?, department = ?, experience = ?, phone = ?, consultation_fee = ?
        WHERE doctor_id = ?
    ''', (
        data.get('doctor_name'),
        data.get('specialization'),
        data.get('department'),
        int(data.get('experience', 0)),
        data.get('phone'),
        float(data.get('consultation_fee', 0.0)),
        doctor_id
    ))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

def delete_doctor(doctor_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM doctors WHERE doctor_id = ?', (doctor_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0


# ==================== APPOINTMENT CRUD ====================
def add_appointment(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    appointment_id = data.get('appointment_id')
    if not appointment_id:
        appointment_id = get_next_id('appointments', 'appointment_id', 301)
    else:
        appointment_id = int(appointment_id)
        
    cursor.execute('''
        INSERT INTO appointments (appointment_id, patient_name, doctor_name, appointment_date, appointment_time, appointment_status)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        appointment_id,
        data.get('patient_name'),
        data.get('doctor_name'),
        data.get('appointment_date'),
        data.get('appointment_time'),
        data.get('appointment_status', 'Scheduled')
    ))
    conn.commit()
    conn.close()
    return appointment_id

def get_appointments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM appointments')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_appointment(appointment_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE appointments
        SET patient_name = ?, doctor_name = ?, appointment_date = ?, appointment_time = ?, appointment_status = ?
        WHERE appointment_id = ?
    ''', (
        data.get('patient_name'),
        data.get('doctor_name'),
        data.get('appointment_date'),
        data.get('appointment_time'),
        data.get('appointment_status'),
        appointment_id
    ))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

def delete_appointment(appointment_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM appointments WHERE appointment_id = ?', (appointment_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0


# ==================== MEDICAL RECORD CRUD ====================
def add_record(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    record_id = data.get('record_id')
    if not record_id:
        record_id = get_next_id('medical_records', 'record_id', 401)
    else:
        record_id = int(record_id)
        
    cursor.execute('''
        INSERT INTO medical_records (record_id, patient_name, doctor_name, diagnosis, prescription, treatment, visit_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        record_id,
        data.get('patient_name'),
        data.get('doctor_name'),
        data.get('diagnosis'),
        data.get('prescription'),
        data.get('treatment'),
        data.get('visit_date')
    ))
    conn.commit()
    conn.close()
    return record_id

def get_records():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM medical_records')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_record(record_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE medical_records
        SET patient_name = ?, doctor_name = ?, diagnosis = ?, prescription = ?, treatment = ?, visit_date = ?
        WHERE record_id = ?
    ''', (
        data.get('patient_name'),
        data.get('doctor_name'),
        data.get('diagnosis'),
        data.get('prescription'),
        data.get('treatment'),
        data.get('visit_date'),
        record_id
    ))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

def delete_record(record_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM medical_records WHERE record_id = ?', (record_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0


# ==================== BILLING CRUD ====================
def add_bill(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    bill_id = data.get('bill_id')
    if not bill_id:
        bill_id = get_next_id('bills', 'bill_id', 501)
    else:
        bill_id = int(bill_id)
        
    consultation_fee = float(data.get('consultation_fee', 0.0))
    medicine_charge = float(data.get('medicine_charge', 0.0))
    laboratory_charge = float(data.get('laboratory_charge', 0.0))
    total_amount = consultation_fee + medicine_charge + laboratory_charge
    
    cursor.execute('''
        INSERT INTO bills (bill_id, patient_name, consultation_fee, medicine_charge, laboratory_charge, total_amount, payment_method, payment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        bill_id,
        data.get('patient_name'),
        consultation_fee,
        medicine_charge,
        laboratory_charge,
        total_amount,
        data.get('payment_method'),
        data.get('payment_status', 'Pending')
    ))
    conn.commit()
    conn.close()
    return bill_id

def get_bills():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM bills')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_bill(bill_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    consultation_fee = float(data.get('consultation_fee', 0.0))
    medicine_charge = float(data.get('medicine_charge', 0.0))
    laboratory_charge = float(data.get('laboratory_charge', 0.0))
    total_amount = consultation_fee + medicine_charge + laboratory_charge
    
    cursor.execute('''
        UPDATE bills
        SET patient_name = ?, consultation_fee = ?, medicine_charge = ?, laboratory_charge = ?, total_amount = ?, payment_method = ?, payment_status = ?
        WHERE bill_id = ?
    ''', (
        data.get('patient_name'),
        consultation_fee,
        medicine_charge,
        laboratory_charge,
        total_amount,
        data.get('payment_method'),
        data.get('payment_status'),
        bill_id
    ))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

def delete_bill(bill_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM bills WHERE bill_id = ?', (bill_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

# Auto initialize database on import
init_db()
