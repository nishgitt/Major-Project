import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'island_booking.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def initialize_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create Customers Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS customers (
            customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            nationality TEXT NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    
    # Create Islands Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS islands (
            island_id INTEGER PRIMARY KEY AUTOINCREMENT,
            island_name TEXT UNIQUE NOT NULL,
            country TEXT NOT NULL,
            description TEXT,
            climate TEXT,
            best_season TEXT,
            image_url TEXT
        )
    ''')
    
    # Create Packages Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS packages (
            package_id INTEGER PRIMARY KEY AUTOINCREMENT,
            island_name TEXT NOT NULL,
            resort_name TEXT NOT NULL,
            package_name TEXT NOT NULL,
            duration TEXT NOT NULL,
            price REAL NOT NULL,
            included_services TEXT
        )
    ''')
    
    # Create Bookings Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            island_name TEXT NOT NULL,
            package_name TEXT NOT NULL,
            travel_date TEXT NOT NULL,
            number_of_people INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            booking_status TEXT NOT NULL
        )
    ''')
    
    # Create Payments Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS payments (
            payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            customer_name TEXT NOT NULL,
            amount REAL NOT NULL,
            payment_method TEXT NOT NULL,
            payment_status TEXT NOT NULL,
            transaction_id TEXT NOT NULL,
            payment_date TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

# ----------------- Customers CRUD -----------------
def add_customer(full_name, email, phone, nationality, password, customer_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if customer_id:
            cursor.execute('''
                INSERT INTO customers (customer_id, full_name, email, phone, nationality, password)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (customer_id, full_name, email, phone, nationality, password))
        else:
            cursor.execute('''
                INSERT INTO customers (full_name, email, phone, nationality, password)
                VALUES (?, ?, ?, ?, ?)
            ''', (full_name, email, phone, nationality, password))
        conn.commit()
        last_id = cursor.lastrowid if not customer_id else customer_id
        return {"success": True, "id": last_id}
    except sqlite3.IntegrityError as e:
        return {"success": False, "error": f"Email already exists: {str(e)}"}
    finally:
        conn.close()

def get_customers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM customers')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_customer_by_id(customer_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM customers WHERE customer_id = ?', (customer_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_customer_by_email(email):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM customers WHERE email = ?', (email,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_customer(customer_id, full_name, email, phone, nationality, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            UPDATE customers
            SET full_name = ?, email = ?, phone = ?, nationality = ?, password = ?
            WHERE customer_id = ?
        ''', (full_name, email, phone, nationality, password, customer_id))
        conn.commit()
        affected = cursor.rowcount
        return {"success": affected > 0}
    except sqlite3.IntegrityError as e:
        return {"success": False, "error": f"Unique constraint failed: {str(e)}"}
    finally:
        conn.close()

def delete_customer(customer_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM customers WHERE customer_id = ?', (customer_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return {"success": affected > 0}

# ----------------- Islands CRUD -----------------
def add_island(island_name, country, description, climate, best_season, image_url, island_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if island_id:
            cursor.execute('''
                INSERT INTO islands (island_id, island_name, country, description, climate, best_season, image_url)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (island_id, island_name, country, description, climate, best_season, image_url))
        else:
            cursor.execute('''
                INSERT INTO islands (island_name, country, description, climate, best_season, image_url)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (island_name, country, description, climate, best_season, image_url))
        conn.commit()
        last_id = cursor.lastrowid if not island_id else island_id
        return {"success": True, "id": last_id}
    except sqlite3.IntegrityError as e:
        return {"success": False, "error": f"Island name already exists: {str(e)}"}
    finally:
        conn.close()

def get_islands():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM islands')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_island(island_id, island_name, country, description, climate, best_season, image_url):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            UPDATE islands
            SET island_name = ?, country = ?, description = ?, climate = ?, best_season = ?, image_url = ?
            WHERE island_id = ?
        ''', (island_name, country, description, climate, best_season, image_url, island_id))
        conn.commit()
        affected = cursor.rowcount
        return {"success": affected > 0}
    except sqlite3.IntegrityError as e:
        return {"success": False, "error": f"Unique constraint failed: {str(e)}"}
    finally:
        conn.close()

def delete_island(island_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM islands WHERE island_id = ?', (island_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return {"success": affected > 0}

# ----------------- Packages CRUD -----------------
def add_package(island_name, resort_name, package_name, duration, price, included_services, package_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if package_id:
        cursor.execute('''
            INSERT INTO packages (package_id, island_name, resort_name, package_name, duration, price, included_services)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (package_id, island_name, resort_name, package_name, duration, price, included_services))
    else:
        cursor.execute('''
            INSERT INTO packages (island_name, resort_name, package_name, duration, price, included_services)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (island_name, resort_name, package_name, duration, price, included_services))
    conn.commit()
    last_id = cursor.lastrowid if not package_id else package_id
    conn.close()
    return {"success": True, "id": last_id}

def get_packages():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM packages')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_package(package_id, island_name, resort_name, package_name, duration, price, included_services):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE packages
        SET island_name = ?, resort_name = ?, package_name = ?, duration = ?, price = ?, included_services = ?
        WHERE package_id = ?
    ''', (island_name, resort_name, package_name, duration, price, included_services, package_id))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return {"success": affected > 0}

def delete_package(package_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM packages WHERE package_id = ?', (package_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return {"success": affected > 0}

# ----------------- Bookings CRUD -----------------
def add_booking(customer_name, island_name, package_name, travel_date, number_of_people, total_amount, booking_status, booking_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if booking_id:
        cursor.execute('''
            INSERT INTO bookings (booking_id, customer_name, island_name, package_name, travel_date, number_of_people, total_amount, booking_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (booking_id, customer_name, island_name, package_name, travel_date, number_of_people, total_amount, booking_status))
    else:
        cursor.execute('''
            INSERT INTO bookings (customer_name, island_name, package_name, travel_date, number_of_people, total_amount, booking_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (customer_name, island_name, package_name, travel_date, number_of_people, total_amount, booking_status))
    conn.commit()
    last_id = cursor.lastrowid if not booking_id else booking_id
    conn.close()
    return {"success": True, "id": last_id}

def get_bookings():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM bookings')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_booking(booking_id, customer_name, island_name, package_name, travel_date, number_of_people, total_amount, booking_status):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE bookings
        SET customer_name = ?, island_name = ?, package_name = ?, travel_date = ?, number_of_people = ?, total_amount = ?, booking_status = ?
        WHERE booking_id = ?
    ''', (customer_name, island_name, package_name, travel_date, number_of_people, total_amount, booking_status, booking_id))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return {"success": affected > 0}

def delete_booking(booking_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM bookings WHERE booking_id = ?', (booking_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return {"success": affected > 0}

# ----------------- Payments CRUD -----------------
def add_payment(booking_id, customer_name, amount, payment_method, payment_status, transaction_id, payment_date, payment_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if payment_id:
        cursor.execute('''
            INSERT INTO payments (payment_id, booking_id, customer_name, amount, payment_method, payment_status, transaction_id, payment_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (payment_id, booking_id, customer_name, amount, payment_method, payment_status, transaction_id, payment_date))
    else:
        cursor.execute('''
            INSERT INTO payments (booking_id, customer_name, amount, payment_method, payment_status, transaction_id, payment_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (booking_id, customer_name, amount, payment_method, payment_status, transaction_id, payment_date))
    conn.commit()
    last_id = cursor.lastrowid if not payment_id else payment_id
    
    # If payment status is Success, update the booking status to Confirmed automatically
    if payment_status.lower() == 'success':
        cursor.execute('''
            UPDATE bookings
            SET booking_status = 'Confirmed'
            WHERE booking_id = ?
        ''', (booking_id,))
        conn.commit()

    conn.close()
    return {"success": True, "id": last_id}

def get_payments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM payments')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_payment(payment_id, booking_id, customer_name, amount, payment_method, payment_status, transaction_id, payment_date):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE payments
        SET booking_id = ?, customer_name = ?, amount = ?, payment_method = ?, payment_status = ?, transaction_id = ?, payment_date = ?
        WHERE payment_id = ?
    ''', (booking_id, customer_name, amount, payment_method, payment_status, transaction_id, payment_date, payment_id))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return {"success": affected > 0}

def delete_payment(payment_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM payments WHERE payment_id = ?', (payment_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return {"success": affected > 0}

# Initialize database tables on load
initialize_db()
