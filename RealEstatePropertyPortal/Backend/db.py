import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'real_estate.db')

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
            city TEXT NOT NULL,
            password TEXT NOT NULL
        )
    ''')

    # 2. Properties Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS properties (
            property_id INTEGER PRIMARY KEY AUTOINCREMENT,
            property_title TEXT NOT NULL,
            property_type TEXT NOT NULL,
            location TEXT NOT NULL,
            price REAL NOT NULL,
            bedrooms INTEGER NOT NULL,
            bathrooms INTEGER NOT NULL,
            area_sqft REAL NOT NULL,
            status TEXT NOT NULL,
            image_url TEXT NOT NULL
        )
    ''')

    # 3. Agents Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS agents (
            agent_id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            experience INTEGER NOT NULL,
            specialization TEXT NOT NULL
        )
    ''')

    # 4. Bookings Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            property_title TEXT NOT NULL,
            visit_date TEXT NOT NULL,
            visit_time TEXT NOT NULL,
            agent_name TEXT NOT NULL,
            booking_status TEXT NOT NULL
        )
    ''')

    # 5. Inquiries Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inquiries (
            inquiry_id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            property_title TEXT NOT NULL,
            message TEXT NOT NULL,
            inquiry_date TEXT NOT NULL,
            response_status TEXT NOT NULL
        )
    ''')

    # 6. Favorites (Wishlist) Table for bonus marks
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS favorites (
            customer_id INTEGER NOT NULL,
            property_id INTEGER NOT NULL,
            PRIMARY KEY (customer_id, property_id),
            FOREIGN KEY (customer_id) REFERENCES customers (customer_id) ON DELETE CASCADE,
            FOREIGN KEY (property_id) REFERENCES properties (property_id) ON DELETE CASCADE
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
    # Default Admin
    cursor.execute("SELECT COUNT(*) FROM admins")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO admins (username, password) VALUES ('admin', 'admin123')")

    # Sample Customer
    cursor.execute("SELECT COUNT(*) FROM customers")
    if cursor.fetchone()[0] == 0:
        # Insert with explicit ID to match testing data
        cursor.execute('''
            INSERT INTO customers (customer_id, full_name, email, phone, city, password)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (101, "Rahul Sharma", "rahul@gmail.com", "9876543210", "Hyderabad", "rahul123"))

    # Sample Agent
    cursor.execute("SELECT COUNT(*) FROM agents")
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO agents (agent_id, agent_name, phone, email, experience, specialization)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (301, "Anil Kumar", "9876541230", "anil@realestate.com", 8, "Residential Properties"))
        # Add a couple extra agents to make it look premium
        cursor.execute('''
            INSERT INTO agents (agent_id, agent_name, phone, email, experience, specialization)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (302, "Sarah D'Souza", "9812345678", "sarah@realestate.com", 5, "Luxury Villas & Apartments"))
        cursor.execute('''
            INSERT INTO agents (agent_id, agent_name, phone, email, experience, specialization)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (303, "Rajesh Khanna", "9823456789", "rajesh@realestate.com", 12, "Commercial Real Estate"))

    # Sample Property
    cursor.execute("SELECT COUNT(*) FROM properties")
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO properties (property_id, property_title, property_type, location, price, bedrooms, bathrooms, area_sqft, status, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (201, "Luxury 3BHK Apartment", "Apartment", "Bangalore", 8500000, 3, 2, 1650, "Available", "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"))
        
        # Add extra properties
        cursor.execute('''
            INSERT INTO properties (property_id, property_title, property_type, location, price, bedrooms, bathrooms, area_sqft, status, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (202, "Modern Sunset Villa", "Villa", "Hyderabad", 25000000, 4, 4, 3500, "Available", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"))
        
        cursor.execute('''
            INSERT INTO properties (property_id, property_title, property_type, location, price, bedrooms, bathrooms, area_sqft, status, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (203, "Cozy Independent House", "Independent House", "Chennai", 6500000, 2, 2, 1200, "Available", "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80"))
        
        cursor.execute('''
            INSERT INTO properties (property_id, property_title, property_type, location, price, bedrooms, bathrooms, area_sqft, status, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (204, "Premium Downtown Office Block", "Commercial", "Bangalore", 45000000, 0, 8, 8000, "Available", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80"))

        cursor.execute('''
            INSERT INTO properties (property_id, property_title, property_type, location, price, bedrooms, bathrooms, area_sqft, status, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (205, "Greenfield Residential Plot", "Plot", "Hyderabad", 3500000, 0, 0, 2400, "Available", "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80"))

    # Sample Visit Booking
    cursor.execute("SELECT COUNT(*) FROM bookings")
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO bookings (booking_id, customer_name, property_title, visit_date, visit_time, agent_name, booking_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (401, "Rahul Sharma", "Luxury 3BHK Apartment", "2026-08-20", "11:00", "Anil Kumar", "Scheduled"))

    # Sample Inquiry
    cursor.execute("SELECT COUNT(*) FROM inquiries")
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO inquiries (inquiry_id, customer_name, property_title, message, inquiry_date, response_status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (501, "Rahul Sharma", "Luxury 3BHK Apartment", "Is home loan assistance available?", "2026-08-10", "Pending"))

    conn.commit()
    conn.close()

# ==================== CUSTOMER CRUD ====================
def add_customer(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # If custom ID is provided (e.g. during testing/seeding)
    c_id = data.get('customer_id')
    if c_id:
        cursor.execute('''
            INSERT INTO customers (customer_id, full_name, email, phone, city, password)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (c_id, data['full_name'], data['email'], data['phone'], data['city'], data['password']))
    else:
        cursor.execute('''
            INSERT INTO customers (full_name, email, phone, city, password)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['full_name'], data['email'], data['phone'], data['city'], data['password']))
    
    customer_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return customer_id

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
        SET full_name = ?, email = ?, phone = ?, city = ?, password = ?
        WHERE customer_id = ?
    ''', (data['full_name'], data['email'], data['phone'], data['city'], data['password'], customer_id))
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


# ==================== PROPERTY CRUD ====================
def add_property(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    p_id = data.get('property_id')
    if p_id:
        cursor.execute('''
            INSERT INTO properties (property_id, property_title, property_type, location, price, bedrooms, bathrooms, area_sqft, status, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (p_id, data['property_title'], data['property_type'], data['location'], data['price'],
              data['bedrooms'], data['bathrooms'], data['area_sqft'], data['status'], data['image_url']))
    else:
        cursor.execute('''
            INSERT INTO properties (property_title, property_type, location, price, bedrooms, bathrooms, area_sqft, status, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (data['property_title'], data['property_type'], data['location'], data['price'],
              data['bedrooms'], data['bathrooms'], data['area_sqft'], data['status'], data['image_url']))
        
    property_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return property_id

def get_properties():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM properties")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_property_by_id(property_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM properties WHERE property_id = ?", (property_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_property(property_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE properties
        SET property_title = ?, property_type = ?, location = ?, price = ?, bedrooms = ?, bathrooms = ?, area_sqft = ?, status = ?, image_url = ?
        WHERE property_id = ?
    ''', (data['property_title'], data['property_type'], data['location'], data['price'],
          data['bedrooms'], data['bathrooms'], data['area_sqft'], data['status'], data['image_url'], property_id))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_property(property_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM properties WHERE property_id = ?", (property_id,))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0


# ==================== AGENT CRUD ====================
def add_agent(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    a_id = data.get('agent_id')
    if a_id:
        cursor.execute('''
            INSERT INTO agents (agent_id, agent_name, phone, email, experience, specialization)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (a_id, data['agent_name'], data['phone'], data['email'], data['experience'], data['specialization']))
    else:
        cursor.execute('''
            INSERT INTO agents (agent_name, phone, email, experience, specialization)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['agent_name'], data['phone'], data['email'], data['experience'], data['specialization']))
        
    agent_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return agent_id

def get_agents():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM agents")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_agent_by_id(agent_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM agents WHERE agent_id = ?", (agent_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_agent(agent_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE agents
        SET agent_name = ?, phone = ?, email = ?, experience = ?, specialization = ?
        WHERE agent_id = ?
    ''', (data['agent_name'], data['phone'], data['email'], data['experience'], data['specialization'], agent_id))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_agent(agent_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM agents WHERE agent_id = ?", (agent_id,))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0


# ==================== BOOKING CRUD ====================
def add_booking(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    b_id = data.get('booking_id')
    if b_id:
        cursor.execute('''
            INSERT INTO bookings (booking_id, customer_name, property_title, visit_date, visit_time, agent_name, booking_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (b_id, data['customer_name'], data['property_title'], data['visit_date'], data['visit_time'], data['agent_name'], data['booking_status']))
    else:
        cursor.execute('''
            INSERT INTO bookings (customer_name, property_title, visit_date, visit_time, agent_name, booking_status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (data['customer_name'], data['property_title'], data['visit_date'], data['visit_time'], data['agent_name'], data['booking_status']))
        
    booking_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return booking_id

def get_bookings():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bookings")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_booking_by_id(booking_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bookings WHERE booking_id = ?", (booking_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_bookings_by_customer_name(customer_name):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bookings WHERE customer_name = ?", (customer_name,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_booking(booking_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE bookings
        SET customer_name = ?, property_title = ?, visit_date = ?, visit_time = ?, agent_name = ?, booking_status = ?
        WHERE booking_id = ?
    ''', (data['customer_name'], data['property_title'], data['visit_date'], data['visit_time'], data['agent_name'], data['booking_status'], booking_id))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_booking(booking_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM bookings WHERE booking_id = ?", (booking_id,))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0


# ==================== INQUIRY CRUD ====================
def add_inquiry(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    i_id = data.get('inquiry_id')
    if i_id:
        cursor.execute('''
            INSERT INTO inquiries (inquiry_id, customer_name, property_title, message, inquiry_date, response_status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (i_id, data['customer_name'], data['property_title'], data['message'], data['inquiry_date'], data['response_status']))
    else:
        cursor.execute('''
            INSERT INTO inquiries (customer_name, property_title, message, inquiry_date, response_status)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['customer_name'], data['property_title'], data['message'], data['inquiry_date'], data['response_status']))
        
    inquiry_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return inquiry_id

def get_inquiries():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inquiries")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_inquiry_by_id(inquiry_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inquiries WHERE inquiry_id = ?", (inquiry_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_inquiries_by_customer_name(customer_name):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inquiries WHERE customer_name = ?", (customer_name,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_inquiry(inquiry_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE inquiries
        SET customer_name = ?, property_title = ?, message = ?, inquiry_date = ?, response_status = ?
        WHERE inquiry_id = ?
    ''', (data['customer_name'], data['property_title'], data['message'], data['inquiry_date'], data['response_status'], inquiry_id))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_inquiry(inquiry_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM inquiries WHERE inquiry_id = ?", (inquiry_id,))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0


# ==================== WISHLIST / FAVORITES CRUD ====================
def add_favorite(customer_id, property_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO favorites (customer_id, property_id) VALUES (?, ?)", (customer_id, property_id))
        conn.commit()
        success = True
    except sqlite3.IntegrityError:
        success = False # Already added
    conn.close()
    return success

def remove_favorite(customer_id, property_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM favorites WHERE customer_id = ? AND property_id = ?", (customer_id, property_id))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def get_favorites_for_customer(customer_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT p.* FROM properties p
        JOIN favorites f ON p.property_id = f.property_id
        WHERE f.customer_id = ?
    ''', (customer_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


# ==================== ADMIN AUTH ====================
def authenticate_admin(username, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admins WHERE username = ? AND password = ?", (username, password))
    admin = cursor.fetchone()
    conn.close()
    if admin:
        return {"admin_id": admin["admin_id"], "username": admin["username"]}
    return None
