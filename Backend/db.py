import sqlite3
import os
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
    
    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        city TEXT,
        password TEXT NOT NULL
    );
    """)
    
    # 2. Venues Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS venues (
        venue_id INTEGER PRIMARY KEY,
        venue_name TEXT UNIQUE NOT NULL,
        location TEXT,
        city TEXT,
        capacity INTEGER,
        contact_person TEXT
    );
    """)
    
    # 3. Events Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        event_id INTEGER PRIMARY KEY,
        event_name TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        organizer_name TEXT NOT NULL,
        event_date TEXT NOT NULL,
        event_time TEXT NOT NULL,
        venue TEXT NOT NULL,
        ticket_price REAL NOT NULL,
        available_tickets INTEGER NOT NULL,
        FOREIGN KEY (venue) REFERENCES venues(venue_name) ON UPDATE CASCADE
    );
    """)
    
    # 4. Bookings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        booking_id INTEGER PRIMARY KEY,
        user_name TEXT NOT NULL,
        event_name TEXT NOT NULL,
        booking_date TEXT NOT NULL,
        number_of_tickets INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        booking_status TEXT NOT NULL,
        FOREIGN KEY (event_name) REFERENCES events(event_name) ON UPDATE CASCADE
    );
    """)
    
    # 5. Payments Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS payments (
        payment_id INTEGER PRIMARY KEY,
        booking_id INTEGER NOT NULL,
        user_name TEXT NOT NULL,
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
        event_id INTEGER NOT NULL,
        user_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        review_date TEXT NOT NULL,
        FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
    );
    """)
    
    conn.commit()
    
    # Seed Initial Data if tables are empty
    # Seed Users
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO users (user_id, full_name, email, phone, city, password)
        VALUES (101, 'Rahul Sharma', 'rahul@gmail.com', '9876543210', 'Hyderabad', 'rahul123')
        """)
        # Create an organizer account for dashboard demo
        cursor.execute("""
        INSERT INTO users (user_id, full_name, email, phone, city, password)
        VALUES (102, 'Tech Organizer', 'organizer@gmail.com', '9876543211', 'Bangalore', 'org123')
        """)
        # Create an admin account
        cursor.execute("""
        INSERT INTO users (user_id, full_name, email, phone, city, password)
        VALUES (103, 'Platform Admin', 'admin@gmail.com', '9876543212', 'Delhi', 'admin123')
        """)
    
    # Seed Venues
    cursor.execute("SELECT COUNT(*) FROM venues")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO venues (venue_id, venue_name, location, city, capacity, contact_person)
        VALUES (301, 'Bangalore International Convention Center', 'Whitefield', 'Bangalore', 1000, 'Anil Kumar')
        """)
        cursor.execute("""
        INSERT INTO venues (venue_id, venue_name, location, city, capacity, contact_person)
        VALUES (302, 'Shilpakala Vedika', 'Madhapur', 'Hyderabad', 2000, 'Venkatesh Rao')
        """)
    
    # Seed Events
    cursor.execute("SELECT COUNT(*) FROM events")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO events (event_id, event_name, category, organizer_name, event_date, event_time, venue, ticket_price, available_tickets)
        VALUES (201, 'Tech Innovation Summit 2026', 'Conference', 'Tech Events Pvt Ltd', '2026-09-15', '10:00', 'Bangalore International Convention Center', 1500.0, 500)
        """)
        cursor.execute("""
        INSERT INTO events (event_id, event_name, category, organizer_name, event_date, event_time, venue, ticket_price, available_tickets)
        VALUES (202, 'Sunburn Concert Hyderabad', 'Music Concert', 'Percept Live', '2026-10-05', '18:00', 'Shilpakala Vedika', 2500.0, 800)
        """)
    
    # Seed Bookings
    cursor.execute("SELECT COUNT(*) FROM bookings")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO bookings (booking_id, user_name, event_name, booking_date, number_of_tickets, total_amount, booking_status)
        VALUES (401, 'Rahul Sharma', 'Tech Innovation Summit 2026', '2026-08-20', 2, 3000.0, 'Confirmed')
        """)
    
    # Seed Payments
    cursor.execute("SELECT COUNT(*) FROM payments")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO payments (payment_id, booking_id, user_name, amount, payment_method, payment_status, transaction_id, payment_date)
        VALUES (501, 401, 'Rahul Sharma', 3000.0, 'UPI', 'Success', 'TXN987654321', '2026-08-20')
        """)
        
    # Seed Reviews
    cursor.execute("SELECT COUNT(*) FROM reviews")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO reviews (event_id, user_name, rating, comment, review_date)
        VALUES (201, 'Rahul Sharma', 5, 'Superb technical talks and convention arrangements!', '2026-08-21')
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
