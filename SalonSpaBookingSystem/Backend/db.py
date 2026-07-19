import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'salon_spa.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Customers Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS customers (
            customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            gender TEXT NOT NULL,
            password TEXT NOT NULL
        )
    ''')

    # 2. Services Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS services (
            service_id INTEGER PRIMARY KEY AUTOINCREMENT,
            service_name TEXT NOT NULL,
            category TEXT NOT NULL,
            duration INTEGER NOT NULL,
            price REAL NOT NULL,
            description TEXT NOT NULL
        )
    ''')

    # 3. Stylists Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stylists (
            stylist_id INTEGER PRIMARY KEY AUTOINCREMENT,
            stylist_name TEXT NOT NULL,
            specialization TEXT NOT NULL,
            experience INTEGER NOT NULL,
            phone TEXT NOT NULL,
            availability TEXT NOT NULL
        )
    ''')

    # 4. Appointments Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS appointments (
            appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            stylist_name TEXT NOT NULL,
            service_name TEXT NOT NULL,
            appointment_date TEXT NOT NULL,
            appointment_time TEXT NOT NULL,
            total_amount REAL NOT NULL,
            appointment_status TEXT NOT NULL
        )
    ''')

    # 5. Payments Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS payments (
            payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            appointment_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            payment_method TEXT NOT NULL,
            payment_status TEXT NOT NULL,
            payment_date TEXT NOT NULL,
            FOREIGN KEY (appointment_id) REFERENCES appointments (appointment_id) ON DELETE CASCADE
        )
    ''')

    # 6. Reviews Table (Bonus Feature)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            review_id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            target_name TEXT NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT NOT NULL,
            review_date TEXT NOT NULL
        )
    ''')

    # 7. Admins Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admins (
            admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')

    conn.commit()

    # --- Seeding default data ---
    
    # 1. Default Admin
    cursor.execute("SELECT COUNT(*) FROM admins")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO admins (username, password) VALUES ('admin', 'admin123')")

    # 2. Sample Customer
    cursor.execute("SELECT COUNT(*) FROM customers")
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO customers (customer_id, full_name, email, phone, gender, password)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (101, "Rahul Sharma", "rahul@gmail.com", "9876543210", "Male", "rahul123"))

    # 3. Sample Services
    cursor.execute("SELECT COUNT(*) FROM services")
    if cursor.fetchone()[0] == 0:
        services_seed = [
            (201, "Hair Spa", "Spa", 60, 1200, "Deep conditioning hair spa treatment"),
            (202, "Swedish Massage", "Massage", 60, 1800, "Relaxing full body massage with aromatherapy oils"),
            (203, "Gentleman's Haircut", "Hair Cut", 30, 600, "Classic haircut, wash, and style by a specialist"),
            (204, "HydraFacial Glow", "Facial", 45, 2200, "Advanced deep-cleansing facial for radiant skin"),
            (205, "Gel Manicure", "Manicure", 40, 900, "Long-lasting gel polish with complete nail shaping"),
            (206, "Paraffin Pedicure", "Pedicure", 50, 1100, "Warm paraffin wax treatment with foot scrub and massage"),
            (207, "Balayage Highlights", "Hair Coloring", 120, 3500, "Hand-painted natural looking hair coloring"),
            (208, "Classic Blowout", "Hair Styling", 45, 800, "Volume-boosting wash and professional blow dry styling")
        ]
        for s in services_seed:
            cursor.execute('''
                INSERT INTO services (service_id, service_name, category, duration, price, description)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', s)

    # 4. Sample Stylists
    cursor.execute("SELECT COUNT(*) FROM stylists")
    if cursor.fetchone()[0] == 0:
        stylists_seed = [
            (301, "Priya Sharma", "Hair Styling", 6, "9988776655", "Available"),
            (302, "Marcus Thorne", "Massage", 8, "9988776654", "Available"),
            (303, "Elena Rostova", "Facial", 5, "9988776653", "Available"),
            (304, "Aria Brooks", "Manicure", 4, "9988776652", "Available"),
            (305, "David Miller", "Hair Cut", 10, "9988776651", "Busy")
        ]
        for st in stylists_seed:
            cursor.execute('''
                INSERT INTO stylists (stylist_id, stylist_name, specialization, experience, phone, availability)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', st)

    # 5. Sample Appointment
    cursor.execute("SELECT COUNT(*) FROM appointments")
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO appointments (appointment_id, customer_name, stylist_name, service_name, appointment_date, appointment_time, total_amount, appointment_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (401, "Rahul Sharma", "Priya Sharma", "Hair Spa", "2026-08-20", "11:30", 1200, "Booked"))

    # 6. Sample Payment
    cursor.execute("SELECT COUNT(*) FROM payments")
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO payments (payment_id, customer_name, appointment_id, amount, payment_method, payment_status, payment_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (501, "Rahul Sharma", 401, 1200, "UPI", "Paid", "2026-08-20"))

    # 7. Sample Reviews
    cursor.execute("SELECT COUNT(*) FROM reviews")
    if cursor.fetchone()[0] == 0:
        reviews_seed = [
            ("Rahul Sharma", "Hair Spa", 5, "Absolutely relaxing hair spa! Priya was great.", "2026-07-19"),
            ("Rahul Sharma", "Priya Sharma", 5, "Priya did a fantastic job with the hair styling. Highly recommend!", "2026-07-19"),
            ("Ananya Goel", "Swedish Massage", 5, "The massage was incredible, felt so rejuvenated.", "2026-07-18")
        ]
        for r in reviews_seed:
            cursor.execute('''
                INSERT INTO reviews (customer_name, target_name, rating, comment, review_date)
                VALUES (?, ?, ?, ?, ?)
            ''', r)

    conn.commit()
    conn.close()

# ==================== CUSTOMER CRUD ====================
def add_customer(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if "customer_id" in data:
        cursor.execute('''
            INSERT INTO customers (customer_id, full_name, email, phone, gender, password)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (data["customer_id"], data["full_name"], data["email"], data["phone"], data["gender"], data["password"]))
        cid = data["customer_id"]
    else:
        cursor.execute('''
            INSERT INTO customers (full_name, email, phone, gender, password)
            VALUES (?, ?, ?, ?, ?)
        ''', (data["full_name"], data["email"], data["phone"], data["gender"], data["password"]))
        cid = cursor.lastrowid
        
    conn.commit()
    conn.close()
    return cid

def get_customers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM customers")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_customer_by_id(customer_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM customers WHERE customer_id = ?", (customer_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_customer_by_email(email):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM customers WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_customer(customer_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE customers
        SET full_name = ?, email = ?, phone = ?, gender = ?, password = ?
        WHERE customer_id = ?
    ''', (data["full_name"], data["email"], data["phone"], data["gender"], data["password"], customer_id))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_customer(customer_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM customers WHERE customer_id = ?", (customer_id,))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0


# ==================== SERVICE CRUD ====================
def add_service(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    if "service_id" in data:
        cursor.execute('''
            INSERT INTO services (service_id, service_name, category, duration, price, description)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (data["service_id"], data["service_name"], data["category"], data["duration"], data["price"], data["description"]))
        sid = data["service_id"]
    else:
        cursor.execute('''
            INSERT INTO services (service_name, category, duration, price, description)
            VALUES (?, ?, ?, ?, ?)
        ''', (data["service_name"], data["category"], data["duration"], data["price"], data["description"]))
        sid = cursor.lastrowid
    conn.commit()
    conn.close()
    return sid

def get_services():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM services")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_service_by_id(service_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM services WHERE service_id = ?", (service_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_service(service_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE services
        SET service_name = ?, category = ?, duration = ?, price = ?, description = ?
        WHERE service_id = ?
    ''', (data["service_name"], data["category"], data["duration"], data["price"], data["description"], service_id))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_service(service_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM services WHERE service_id = ?", (service_id,))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0


# ==================== STYLIST CRUD ====================
def add_stylist(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    if "stylist_id" in data:
        cursor.execute('''
            INSERT INTO stylists (stylist_id, stylist_name, specialization, experience, phone, availability)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (data["stylist_id"], data["stylist_name"], data["specialization"], data["experience"], data["phone"], data["availability"]))
        sid = data["stylist_id"]
    else:
        cursor.execute('''
            INSERT INTO stylists (stylist_name, specialization, experience, phone, availability)
            VALUES (?, ?, ?, ?, ?)
        ''', (data["stylist_name"], data["specialization"], data["experience"], data["phone"], data["availability"]))
        sid = cursor.lastrowid
    conn.commit()
    conn.close()
    return sid

def get_stylists():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stylists")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_stylist_by_id(stylist_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stylists WHERE stylist_id = ?", (stylist_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_stylist(stylist_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE stylists
        SET stylist_name = ?, specialization = ?, experience = ?, phone = ?, availability = ?
        WHERE stylist_id = ?
    ''', (data["stylist_name"], data["specialization"], data["experience"], data["phone"], data["availability"], stylist_id))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_stylist(stylist_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM stylists WHERE stylist_id = ?", (stylist_id,))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0


# ==================== APPOINTMENT CRUD ====================
def add_appointment(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    if "appointment_id" in data:
        cursor.execute('''
            INSERT INTO appointments (appointment_id, customer_name, stylist_name, service_name, appointment_date, appointment_time, total_amount, appointment_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (data["appointment_id"], data["customer_name"], data["stylist_name"], data["service_name"], data["appointment_date"], data["appointment_time"], data["total_amount"], data["appointment_status"]))
        aid = data["appointment_id"]
    else:
        cursor.execute('''
            INSERT INTO appointments (customer_name, stylist_name, service_name, appointment_date, appointment_time, total_amount, appointment_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (data["customer_name"], data["stylist_name"], data["service_name"], data["appointment_date"], data["appointment_time"], data["total_amount"], data["appointment_status"]))
        aid = cursor.lastrowid
    conn.commit()
    conn.close()
    return aid

def get_appointments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appointments")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_appointment_by_id(appointment_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appointments WHERE appointment_id = ?", (appointment_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_appointment(appointment_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE appointments
        SET customer_name = ?, stylist_name = ?, service_name = ?, appointment_date = ?, appointment_time = ?, total_amount = ?, appointment_status = ?
        WHERE appointment_id = ?
    ''', (data["customer_name"], data["stylist_name"], data["service_name"], data["appointment_date"], data["appointment_time"], data["total_amount"], data["appointment_status"], appointment_id))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_appointment(appointment_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM appointments WHERE appointment_id = ?", (appointment_id,))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0


# ==================== PAYMENT CRUD ====================
def add_payment(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    if "payment_id" in data:
        cursor.execute('''
            INSERT INTO payments (payment_id, customer_name, appointment_id, amount, payment_method, payment_status, payment_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (data["payment_id"], data["customer_name"], data["appointment_id"], data["amount"], data["payment_method"], data["payment_status"], data["payment_date"]))
        pid = data["payment_id"]
    else:
        cursor.execute('''
            INSERT INTO payments (customer_name, appointment_id, amount, payment_method, payment_status, payment_date)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (data["customer_name"], data["appointment_id"], data["amount"], data["payment_method"], data["payment_status"], data["payment_date"]))
        pid = cursor.lastrowid
    conn.commit()
    conn.close()
    return pid

def get_payments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM payments")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_payment_by_id(payment_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM payments WHERE payment_id = ?", (payment_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_payment(payment_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE payments
        SET customer_name = ?, appointment_id = ?, amount = ?, payment_method = ?, payment_status = ?, payment_date = ?
        WHERE payment_id = ?
    ''', (data["customer_name"], data["appointment_id"], data["amount"], data["payment_method"], data["payment_status"], data["payment_date"], payment_id))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_payment(payment_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM payments WHERE payment_id = ?", (payment_id,))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0


# ==================== REVIEWS CRUD (Bonus Feature) ====================
def add_review(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO reviews (customer_name, target_name, rating, comment, review_date)
        VALUES (?, ?, ?, ?, ?)
    ''', (data["customer_name"], data["target_name"], data["rating"], data["comment"], data["review_date"]))
    rid = cursor.lastrowid
    conn.commit()
    conn.close()
    return rid

def get_reviews():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reviews")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


# ==================== ADMIN AUTH ====================
def authenticate_admin(username, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admins WHERE username = ? AND password = ?", (username, password))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None
