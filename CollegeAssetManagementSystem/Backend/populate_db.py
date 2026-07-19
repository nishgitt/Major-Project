import sys
import os

# Add parent directory to path so db.py can be imported
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

import db

def populate():
    print("Initializing database...")
    db.init_db()
    
    # 1. Populate Categories
    categories = db.get_categories()
    seed_categories = [
        {"category_name": "Computer", "description": "Laptops and desktop units for labs and faculty"},
        {"category_name": "CPU", "description": "Central Processing Units for computer systems"},
        {"category_name": "Monitor", "description": "LED and LCD display monitors"},
        {"category_name": "Printer", "description": "Office and lab printers (laser, inkjet, and scanner combos)"},
        {"category_name": "Air Conditioner", "description": "Split and window air conditioning units for classrooms and labs"},
        {"category_name": "Projector", "description": "Overhead presentation projectors for smart classrooms"},
        {"category_name": "UPS", "description": "Uninterruptible Power Supply backups for computer labs"},
        {"category_name": "CCTV Camera", "description": "Security surveillance cameras around campus"},
        {"category_name": "Router", "description": "Enterprise internet routing systems"},
        {"category_name": "Switch", "description": "Local Area Network switches"},
        {"category_name": "Bus Battery", "description": "Heavy-duty batteries for college transit vehicles"},
        {"category_name": "Other Equipment", "description": "Miscellaneous electronic hardware and apparatus"}
    ]
    
    for sc in seed_categories:
        if not any(c['category_name'].lower() == sc['category_name'].lower() for c in categories):
            print(f"Adding category: {sc['category_name']}")
            db.add_category(sc)
            
    # 2. Populate Departments
    departments = db.get_departments()
    seed_departments = [
        {"department_name": "Computer Science & Engineering", "hod_name": "Dr. Ramesh Kumar", "location": "Block-A, 3rd Floor"},
        {"department_name": "Electronics & Communication", "hod_name": "Dr. Sneha Reddy", "location": "Block-B, 2nd Floor"},
        {"department_name": "Mechanical Engineering", "hod_name": "Dr. Vikas Singh", "location": "Workshop Building-1"},
        {"department_name": "Civil Engineering", "hod_name": "Dr. Ananya Rao", "location": "Block-C, Ground Floor"},
        {"department_name": "Administrative Office", "hod_name": "Mr. Srinivasan M.", "location": "Main Admin Block, 1st Floor"}
    ]
    
    for sd in seed_departments:
        if not any(d['department_name'].lower() == sd['department_name'].lower() for d in departments):
            print(f"Adding department: {sd['department_name']}")
            db.add_department(sd)
            
    # 3. Populate Vendors
    vendors = db.get_vendors()
    seed_vendors = [
        {"vendor_name": "Dell Enterprise Solutions", "contact_person": "Amit Patel", "phone": "9876543210", "email": "sales@dellenterprise.in", "address": "Tech Park Building, Bangalore"},
        {"vendor_name": "HP India Ltd", "contact_person": "Priya Sharma", "phone": "8877665544", "email": "contracts@hp.com", "address": "Prestige Cyber Tower, Chennai"},
        {"vendor_name": "Cisco Systems India", "contact_person": "Rajesh Mehta", "phone": "7766554433", "email": "mehta.r@cisco.com", "address": "Electronic City Phase 1, Bangalore"},
        {"vendor_name": "Blue Star Cooling Systems", "contact_person": "Karan Johar", "phone": "9988776655", "email": "service@bluestarcool.com", "address": "Industrial Area Phase 2, Hyderabad"},
        {"vendor_name": "Exide Batteries Corp", "contact_person": "Sanjay Dutt", "phone": "9123456789", "email": "sanjay@exidebatteries.com", "address": "Plot No. 42, Gachibowli, Hyderabad"}
    ]
    
    for sv in seed_vendors:
        if not any(v['vendor_name'].lower() == sv['vendor_name'].lower() for v in vendors):
            print(f"Adding vendor: {sv['vendor_name']}")
            db.add_vendor(sv)
            
    # 4. Populate Assets
    assets = db.get_assets()
    seed_assets = [
        {
            "asset_name": "Dell Latitude 5420",
            "category": "Computer",
            "brand": "Dell",
            "model": "Latitude 5420 Laptop",
            "serial_number": "DL-5420-9988",
            "purchase_date": "2025-06-15",
            "purchase_price": 65000.00,
            "warranty_expiry": "2028-06-15",
            "status": "Available"
        },
        {
            "asset_name": "Intel Core i7 CPU Tower",
            "category": "CPU",
            "brand": "Custom",
            "model": "i7 12th Gen Custom Cabinet",
            "serial_number": "CPU-I7-1234",
            "purchase_date": "2024-03-10",
            "purchase_price": 42000.00,
            "warranty_expiry": "2027-03-10",
            "status": "Available"
        },
        {
            "asset_name": "HP LaserJet Pro M404dn",
            "category": "Printer",
            "brand": "HP",
            "model": "LaserJet Pro",
            "serial_number": "HP-LJ-5566",
            "purchase_date": "2024-09-01",
            "purchase_price": 28000.00,
            "warranty_expiry": "2026-09-01",
            "status": "Available"
        },
        {
            "asset_name": "Blue Star 1.5 Ton AC",
            "category": "Air Conditioner",
            "brand": "Blue Star",
            "model": "BS-Split-15",
            "serial_number": "BSAC-889977",
            "purchase_date": "2023-05-20",
            "purchase_price": 45000.00,
            "warranty_expiry": "2026-05-20",
            "status": "Available"
        },
        {
            "asset_name": "Epson EB-E01 Projector",
            "category": "Projector",
            "brand": "Epson",
            "model": "EB-E01",
            "serial_number": "EP-PRJ-2233",
            "purchase_date": "2026-01-10",
            "purchase_price": 35000.00,
            "warranty_expiry": "2029-01-10",
            "status": "Available"
        },
        {
            "asset_name": "APC Back-UPS 1100VA",
            "category": "UPS",
            "brand": "APC",
            "model": "BX1100C-IN",
            "serial_number": "APC-UPS-7744",
            "purchase_date": "2025-11-20",
            "purchase_price": 7500.00,
            "warranty_expiry": "2027-11-20",
            "status": "Available"
        },
        {
            "asset_name": "CP Plus 2MP CCTV Camera",
            "category": "CCTV Camera",
            "brand": "CP Plus",
            "model": "CP-UNC-TA21L3",
            "serial_number": "CPP-CCTV-1100",
            "purchase_date": "2024-06-18",
            "purchase_price": 3200.00,
            "warranty_expiry": "2026-06-18",
            "status": "Available"
        },
        {
            "asset_name": "Exide Mileage Bus Battery",
            "category": "Bus Battery",
            "brand": "Exide",
            "model": "FMI0-MRED100",
            "serial_number": "EXD-BAT-8844",
            "purchase_date": "2025-02-14",
            "purchase_price": 12000.00,
            "warranty_expiry": "2027-02-14",
            "status": "Available"
        }
    ]
    
    for sa in seed_assets:
        if not any(a['serial_number'] == sa['serial_number'] for a in assets):
            print(f"Adding asset: {sa['asset_name']}")
            db.add_asset(sa)
            
    # 5. Populate Allocations
    allocations = db.get_allocations()
    seed_allocations = [
        {
            "asset_name": "Dell Latitude 5420",
            "department_name": "Computer Science & Engineering",
            "assigned_date": "2025-07-01",
            "maintenance_date": "2026-07-15",
            "maintenance_status": "Completed",
            "remarks": "Annual service completed. RAM upgraded to 16GB."
        },
        {
            "asset_name": "HP LaserJet Pro M404dn",
            "department_name": "Administrative Office",
            "assigned_date": "2024-09-05",
            "maintenance_date": "2026-08-10",
            "maintenance_status": "Pending",
            "remarks": "Cartridge replacement scheduled for next month."
        },
        {
            "asset_name": "Blue Star 1.5 Ton AC",
            "department_name": "Electronics & Communication",
            "assigned_date": "2023-05-25",
            "maintenance_date": "2026-07-10",
            "maintenance_status": "Under Repair",
            "remarks": "Cooling gas leakage found. Repair requested."
        }
    ]
    
    for s_alloc in seed_allocations:
        if not any(al['asset_name'] == s_alloc['asset_name'] and al['department_name'] == s_alloc['department_name'] for al in allocations):
            print(f"Adding allocation: {s_alloc['asset_name']} -> {s_alloc['department_name']}")
            db.add_allocation(s_alloc)
            
    print("Database populate finished successfully!")

if __name__ == "__main__":
    populate()
