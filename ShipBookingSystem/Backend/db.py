import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'db.sqlite3'

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    return conn

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def db_init():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # 1. Passengers Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS passengers (
        passenger_id INTEGER PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        nationality TEXT,
        passport_number TEXT,
        password TEXT NOT NULL
    );
    """)
    
    # 2. Ships Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ships (
        ship_id INTEGER PRIMARY KEY,
        ship_name TEXT UNIQUE NOT NULL,
        ship_type TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        operator_name TEXT NOT NULL,
        status TEXT NOT NULL
    );
    """)
    
    # 3. Schedules Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS schedules (
        schedule_id INTEGER PRIMARY KEY,
        ship_name TEXT NOT NULL,
        source_port TEXT NOT NULL,
        destination_port TEXT NOT NULL,
        departure_date TEXT NOT NULL,
        departure_time TEXT NOT NULL,
        arrival_date TEXT NOT NULL,
        arrival_time TEXT NOT NULL,
        fare REAL NOT NULL,
        FOREIGN KEY (ship_name) REFERENCES ships(ship_name) ON UPDATE CASCADE
    );
    """)
    
    # 4. Bookings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        booking_id INTEGER PRIMARY KEY,
        passenger_name TEXT NOT NULL,
        ship_name TEXT NOT NULL,
        cabin_type TEXT NOT NULL,
        journey_date TEXT NOT NULL,
        source_port TEXT NOT NULL,
        destination_port TEXT NOT NULL,
        total_amount REAL NOT NULL,
        booking_status TEXT NOT NULL,
        FOREIGN KEY (ship_name) REFERENCES ships(ship_name) ON UPDATE CASCADE
    );
    """)
    
    # 5. Payments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS payments (
        payment_id INTEGER PRIMARY KEY,
        booking_id INTEGER NOT NULL,
        passenger_name TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        transaction_id TEXT UNIQUE NOT NULL,
        payment_date TEXT NOT NULL,
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
    );
    """)
    
    # 6. Reviews Table (Bonus Feature)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
        review_id INTEGER PRIMARY KEY AUTOINCREMENT,
        ship_id INTEGER NOT NULL,
        passenger_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        review_date TEXT NOT NULL,
        FOREIGN KEY (ship_id) REFERENCES ships(ship_id) ON DELETE CASCADE
    );
    """)
    
    conn.commit()
    
    # Seed Initial Data if tables are empty
    # Seed Passengers
    cursor.execute("SELECT COUNT(*) FROM passengers")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO passengers (passenger_id, full_name, email, phone, nationality, passport_number, password)
        VALUES (101, 'Rahul Sharma', 'rahul@gmail.com', '9876543210', 'Indian', 'N1234567', 'rahul123')
        """)
        # Seed an Admin Passenger for auth dashboard testing
        cursor.execute("""
        INSERT INTO passengers (passenger_id, full_name, email, phone, nationality, passport_number, password)
        VALUES (102, 'Platform Admin', 'admin@gmail.com', '9876543212', 'Indian', 'A9876543', 'admin123')
        """)
    
    # Seed Ships
    cursor.execute("SELECT COUNT(*) FROM ships")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO ships (ship_id, ship_name, ship_type, capacity, operator_name, status)
        VALUES (201, 'Ocean Paradise', 'Cruise Ship', 2000, 'Royal Cruises', 'Active')
        """)
        cursor.execute("""
        INSERT INTO ships (ship_id, ship_name, ship_type, capacity, operator_name, status)
        VALUES (202, 'Seas Majestic', 'Luxury Yacht', 120, 'Elite Yachting', 'Active')
        """)
    
    # Seed Schedules
    cursor.execute("SELECT COUNT(*) FROM schedules")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO schedules (schedule_id, ship_name, source_port, destination_port, departure_date, departure_time, arrival_date, arrival_time, fare)
        VALUES (301, 'Ocean Paradise', 'Chennai Port', 'Port Blair', '2026-10-15', '08:00', '2026-10-16', '06:00', 8500.0)
        """)
        cursor.execute("""
        INSERT INTO schedules (schedule_id, ship_name, source_port, destination_port, departure_date, departure_time, arrival_date, arrival_time, fare)
        VALUES (302, 'Seas Majestic', 'Mumbai Port', 'Goa Port', '2026-11-20', '16:00', '2026-11-21', '09:00', 15000.0)
        """)
    
    # Seed Bookings
    cursor.execute("SELECT COUNT(*) FROM bookings")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO bookings (booking_id, passenger_name, ship_name, cabin_type, journey_date, source_port, destination_port, total_amount, booking_status)
        VALUES (401, 'Rahul Sharma', 'Ocean Paradise', 'Deluxe', '2026-10-15', 'Chennai Port', 'Port Blair', 12000.0, 'Confirmed')
        """)
    
    # Seed Payments
    cursor.execute("SELECT COUNT(*) FROM payments")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO payments (payment_id, booking_id, passenger_name, amount, payment_method, payment_status, transaction_id, payment_date)
        VALUES (501, 401, 'Rahul Sharma', 12000.0, 'UPI', 'Success', 'TXN789456123', '2026-09-20')
        """)
        
    # Seed Reviews
    cursor.execute("SELECT COUNT(*) FROM reviews")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO reviews (ship_id, passenger_name, rating, comment, review_date)
        VALUES (201, 'Rahul Sharma', 5, 'Incredible vessel and wonderful onboard hospitality!', '2026-09-21')
        """)
        
    conn.commit()
    conn.close()

def get_next_id(table_name, id_column, min_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(f"SELECT MAX({id_column}) FROM {table_name}")
    row = cursor.fetchone()
    conn.close()
    
    if not row or row[f'MAX({id_column})'] is None:
        return min_id
    return max(row[f'MAX({id_column})'] + 1, min_id)
