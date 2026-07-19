import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'college_assets.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Categories Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            category_id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_name TEXT NOT NULL UNIQUE,
            description TEXT
        )
    ''')
    
    # 2. Departments Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS departments (
            department_id INTEGER PRIMARY KEY AUTOINCREMENT,
            department_name TEXT NOT NULL UNIQUE,
            hod_name TEXT,
            location TEXT
        )
    ''')
    
    # 3. Vendors Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS vendors (
            vendor_id INTEGER PRIMARY KEY AUTOINCREMENT,
            vendor_name TEXT NOT NULL,
            contact_person TEXT,
            phone TEXT,
            email TEXT,
            address TEXT
        )
    ''')
    
    # 4. Assets Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS assets (
            asset_id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_name TEXT NOT NULL,
            category TEXT NOT NULL,
            brand TEXT,
            model TEXT,
            serial_number TEXT NOT NULL UNIQUE,
            purchase_date TEXT NOT NULL,
            purchase_price REAL NOT NULL,
            warranty_expiry TEXT NOT NULL,
            status TEXT NOT NULL,
            bill_document TEXT
        )
    ''')
    
    # 5. Allocations Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS allocations (
            allocation_id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_name TEXT NOT NULL,
            department_name TEXT NOT NULL,
            assigned_date TEXT NOT NULL,
            maintenance_date TEXT NOT NULL,
            maintenance_status TEXT NOT NULL,
            remarks TEXT,
            maintenance_document TEXT
        )
    ''')
    
    # 6. Admin Authentication Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    ''')
    
    # Run schema migrations (auto self-healing columns)
    try:
        cursor.execute("ALTER TABLE assets ADD COLUMN bill_document TEXT")
    except sqlite3.OperationalError:
        pass
        
    try:
        cursor.execute("ALTER TABLE allocations ADD COLUMN maintenance_document TEXT")
    except sqlite3.OperationalError:
        pass

    # Check if admin user exists, if not create default
    cursor.execute("SELECT * FROM admins WHERE username = 'admin'")
    if not cursor.fetchone():
        cursor.execute("INSERT INTO admins (username, password) VALUES ('admin', 'admin123')")
    
    conn.commit()
    conn.close()

# ==================== AUTH CRUD ====================
def authenticate_admin(username, password):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admins WHERE username = ? AND password = ?", (username, password))
    admin = cursor.fetchone()
    conn.close()
    if admin:
        return {"id": admin["id"], "username": admin["username"]}
    return None

# ==================== CATEGORIES CRUD ====================
def add_category(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO categories (category_name, description)
        VALUES (?, ?)
    ''', (data.get('category_name'), data.get('description', '')))
    category_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return category_id

def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM categories")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_category(category_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE categories
        SET category_name = ?, description = ?
        WHERE category_id = ?
    ''', (data.get('category_name'), data.get('description', ''), category_id))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_category(category_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM categories WHERE category_id = ?", (category_id,))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

# ==================== DEPARTMENTS CRUD ====================
def add_department(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO departments (department_name, hod_name, location)
        VALUES (?, ?, ?)
    ''', (data.get('department_name'), data.get('hod_name', ''), data.get('location', '')))
    department_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return department_id

def get_departments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM departments")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_department(department_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE departments
        SET department_name = ?, hod_name = ?, location = ?
        WHERE department_id = ?
    ''', (data.get('department_name'), data.get('hod_name', ''), data.get('location', ''), department_id))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_department(department_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM departments WHERE department_id = ?", (department_id,))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

# ==================== VENDORS CRUD ====================
def add_vendor(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO vendors (vendor_name, contact_person, phone, email, address)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        data.get('vendor_name'),
        data.get('contact_person', ''),
        data.get('phone', ''),
        data.get('email', ''),
        data.get('address', '')
    ))
    vendor_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return vendor_id

def get_vendors():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vendors")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_vendor(vendor_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE vendors
        SET vendor_name = ?, contact_person = ?, phone = ?, email = ?, address = ?
        WHERE vendor_id = ?
    ''', (
        data.get('vendor_name'),
        data.get('contact_person', ''),
        data.get('phone', ''),
        data.get('email', ''),
        data.get('address', ''),
        vendor_id
    ))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_vendor(vendor_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM vendors WHERE vendor_id = ?", (vendor_id,))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

# ==================== ASSETS CRUD ====================
def add_asset(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO assets (asset_name, category, brand, model, serial_number, purchase_date, purchase_price, warranty_expiry, status, bill_document)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get('asset_name'),
        data.get('category'),
        data.get('brand', ''),
        data.get('model', ''),
        data.get('serial_number'),
        data.get('purchase_date'),
        float(data.get('purchase_price', 0)),
        data.get('warranty_expiry'),
        data.get('status', 'Available'),
        data.get('bill_document')
    ))
    asset_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return asset_id

def get_assets():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM assets")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_asset(asset_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE assets
        SET asset_name = ?, category = ?, brand = ?, model = ?, serial_number = ?, purchase_date = ?, purchase_price = ?, warranty_expiry = ?, status = ?, bill_document = ?
        WHERE asset_id = ?
    ''', (
        data.get('asset_name'),
        data.get('category'),
        data.get('brand', ''),
        data.get('model', ''),
        data.get('serial_number'),
        data.get('purchase_date'),
        float(data.get('purchase_price', 0)),
        data.get('warranty_expiry'),
        data.get('status'),
        data.get('bill_document'),
        asset_id
    ))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_asset(asset_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM assets WHERE asset_id = ?", (asset_id,))
    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return rows_affected > 0

# ==================== ALLOCATIONS CRUD ====================
def add_allocation(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    asset_name = data.get('asset_name')
    m_status = data.get('maintenance_status', 'Pending')
    
    cursor.execute('''
        INSERT INTO allocations (asset_name, department_name, assigned_date, maintenance_date, maintenance_status, remarks, maintenance_document)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        asset_name,
        data.get('department_name'),
        data.get('assigned_date'),
        data.get('maintenance_date'),
        m_status,
        data.get('remarks', ''),
        data.get('maintenance_document')
    ))
    allocation_id = cursor.lastrowid
    
    # Automatically sync asset status based on allocation maintenance status
    target_status = 'In Use'
    if m_status in ['Under Repair', 'Warranty Claim']:
        target_status = 'Under Maintenance'
    
    cursor.execute("UPDATE assets SET status = ? WHERE asset_name = ?", (target_status, asset_name))
    
    conn.commit()
    conn.close()
    return allocation_id

def get_allocations():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM allocations")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_allocation(allocation_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    asset_name = data.get('asset_name')
    m_status = data.get('maintenance_status')
    
    cursor.execute('''
        UPDATE allocations
        SET asset_name = ?, department_name = ?, assigned_date = ?, maintenance_date = ?, maintenance_status = ?, remarks = ?, maintenance_document = ?
        WHERE allocation_id = ?
    ''', (
        asset_name,
        data.get('department_name'),
        data.get('assigned_date'),
        data.get('maintenance_date'),
        m_status,
        data.get('remarks', ''),
        data.get('maintenance_document'),
        allocation_id
    ))
    rows_affected = cursor.rowcount
    
    # Sync asset status
    target_status = 'In Use'
    if m_status in ['Under Repair', 'Warranty Claim']:
        target_status = 'Under Maintenance'
    elif m_status == 'Completed':
        target_status = 'Available'
    
    cursor.execute("UPDATE assets SET status = ? WHERE asset_name = ?", (target_status, asset_name))
    
    conn.commit()
    conn.close()
    return rows_affected > 0

def delete_allocation(allocation_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Find the allocation first to check asset name
    cursor.execute("SELECT asset_name FROM allocations WHERE allocation_id = ?", (allocation_id,))
    row = cursor.fetchone()
    
    cursor.execute("DELETE FROM allocations WHERE allocation_id = ?", (allocation_id,))
    rows_affected = cursor.rowcount
    
    if row:
        cursor.execute("UPDATE assets SET status = 'Available' WHERE asset_name = ?", (row['asset_name'],))
        
    conn.commit()
    conn.close()
    return rows_affected > 0
