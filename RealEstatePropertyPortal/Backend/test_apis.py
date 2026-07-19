import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def make_request(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            body = response.read().decode("utf-8")
            return status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            err_json = json.loads(body)
        except Exception:
            err_json = {"error": body}
        return e.code, err_json
    except Exception as e:
        return 500, {"error": str(e)}

def run_tests():
    print("=== STARTING REAL ESTATE PROPERTY PORTAL REST API TESTS ===")
    
    # ------------------ MODULE 1: CUSTOMERS ------------------
    print("\n--- Testing Module 1: Customers ---")
    
    # Test 1.1: Add Customer
    print("Test 1.1: Add Customer...")
    new_customer = {
        "customer_id": 999, # custom ID for test isolation
        "full_name": "Test User",
        "email": "testuser@gmail.com",
        "phone": "9999999999",
        "city": "Mumbai",
        "password": "testpassword"
    }
    status, res = make_request("/customers/add/", "POST", new_customer)
    if status == 201:
        print("[PASS] Customer created successfully.")
    else:
        print(f"[FAIL] Add Customer failed! Status: {status}, Response: {res}")
        sys.exit(1)
        
    # Test 1.2: Get Customers
    print("Test 1.2: Get Customers list...")
    status, customers = make_request("/customers/")
    if status == 200 and isinstance(customers, list):
        print(f"[PASS] Retrieved {len(customers)} customers.")
    else:
        print(f"[FAIL] Get Customers failed! Status: {status}")
        sys.exit(1)
        
    # Test 1.3: Update Customer
    print("Test 1.3: Update Customer...")
    updated_customer = {
        "full_name": "Test User Updated",
        "email": "testuser@gmail.com",
        "phone": "9999999998",
        "city": "Pune",
        "password": "newtestpassword"
    }
    status, res = make_request("/customers/update/999/", "PUT", updated_customer)
    if status == 200:
        print("[PASS] Customer updated successfully.")
    else:
        print(f"[FAIL] Update Customer failed! Status: {status}, Response: {res}")
        sys.exit(1)
        
    # ------------------ MODULE 2: PROPERTIES ------------------
    print("\n--- Testing Module 2: Properties ---")
    
    # Test 2.1: Add Property
    print("Test 2.1: Add Property Listing...")
    new_property = {
        "property_id": 888,
        "property_title": "Test Apartment",
        "property_type": "Apartment",
        "location": "Pune",
        "price": 4500000,
        "bedrooms": 2,
        "bathrooms": 2,
        "area_sqft": 1100,
        "status": "Available",
        "image_url": "test.jpg"
    }
    status, res = make_request("/properties/add/", "POST", new_property)
    if status == 201:
        print("[PASS] Property Listing created successfully.")
    else:
        print(f"[FAIL] Add Property failed! Status: {status}, Response: {res}")
        sys.exit(1)
        
    # Test 2.2: Get Properties
    print("Test 2.2: Get Properties list...")
    status, properties = make_request("/properties/")
    if status == 200 and isinstance(properties, list):
        print(f"[PASS] Retrieved {len(properties)} properties.")
    else:
        print(f"[FAIL] Get Properties failed! Status: {status}")
        sys.exit(1)
        
    # Test 2.3: Update Property
    print("Test 2.3: Update Property Listing...")
    updated_property = {
        "property_title": "Test Apartment Updated",
        "property_type": "Apartment",
        "location": "Pune",
        "price": 4700000,
        "bedrooms": 2,
        "bathrooms": 2,
        "area_sqft": 1150,
        "status": "Sold",
        "image_url": "test2.jpg"
    }
    status, res = make_request("/properties/update/888/", "PUT", updated_property)
    if status == 200:
        print("[PASS] Property updated successfully.")
    else:
        print(f"[FAIL] Update Property failed! Status: {status}, Response: {res}")
        sys.exit(1)

    # ------------------ MODULE 3: PROPERTY AGENTS ------------------
    print("\n--- Testing Module 3: Property Agents ---")
    
    # Test 3.1: Add Agent
    print("Test 3.1: Add Agent...")
    new_agent = {
        "agent_id": 777,
        "agent_name": "Test Agent",
        "phone": "8888888888",
        "email": "testagent@realestate.com",
        "experience": 4,
        "specialization": "Plot Properties"
    }
    status, res = make_request("/agents/add/", "POST", new_agent)
    if status == 201:
        print("[PASS] Agent registered successfully.")
    else:
        print(f"[FAIL] Add Agent failed! Status: {status}, Response: {res}")
        sys.exit(1)
        
    # Test 3.2: Get Agents
    print("Test 3.2: Get Agents list...")
    status, agents = make_request("/agents/")
    if status == 200 and isinstance(agents, list):
        print(f"[PASS] Retrieved {len(agents)} agents.")
    else:
        print(f"[FAIL] Get Agents failed! Status: {status}")
        sys.exit(1)
        
    # Test 3.3: Update Agent
    print("Test 3.3: Update Agent...")
    updated_agent = {
        "agent_name": "Test Agent Updated",
        "phone": "8888888887",
        "email": "testagent@realestate.com",
        "experience": 5,
        "specialization": "Luxury Villas"
    }
    status, res = make_request("/agents/update/777/", "PUT", updated_agent)
    if status == 200:
        print("[PASS] Agent updated successfully.")
    else:
        print(f"[FAIL] Update Agent failed! Status: {status}, Response: {res}")
        sys.exit(1)

    # ------------------ MODULE 4: BOOKINGS ------------------
    print("\n--- Testing Module 4: Property Visit Bookings ---")
    
    # Test 4.1: Add Booking
    print("Test 4.1: Add Booking...")
    new_booking = {
        "booking_id": 666,
        "customer_name": "Test User Updated",
        "property_title": "Test Apartment Updated",
        "visit_date": "2026-08-25",
        "visit_time": "14:00",
        "agent_name": "Test Agent Updated",
        "booking_status": "Scheduled"
    }
    status, res = make_request("/bookings/add/", "POST", new_booking)
    if status == 201:
        print("[PASS] Booking created successfully.")
    else:
        print(f"[FAIL] Add Booking failed! Status: {status}, Response: {res}")
        sys.exit(1)
        
    # Test 4.2: Get Bookings
    print("Test 4.2: Get Bookings list...")
    status, bookings = make_request("/bookings/")
    if status == 200 and isinstance(bookings, list):
        print(f"[PASS] Retrieved {len(bookings)} bookings.")
    else:
        print(f"[FAIL] Get Bookings failed! Status: {status}")
        sys.exit(1)
        
    # Test 4.3: Update Booking
    print("Test 4.3: Update Booking status...")
    updated_booking = {
        "customer_name": "Test User Updated",
        "property_title": "Test Apartment Updated",
        "visit_date": "2026-08-25",
        "visit_time": "14:30",
        "agent_name": "Test Agent Updated",
        "booking_status": "Completed"
    }
    status, res = make_request("/bookings/update/666/", "PUT", updated_booking)
    if status == 200:
        print("[PASS] Booking status updated successfully.")
    else:
        print(f"[FAIL] Update Booking failed! Status: {status}, Response: {res}")
        sys.exit(1)

    # ------------------ MODULE 5: INQUIRIES ------------------
    print("\n--- Testing Module 5: Inquiry Management ---")
    
    # Test 5.1: Add Inquiry
    print("Test 5.1: Add Inquiry...")
    new_inquiry = {
        "inquiry_id": 555,
        "customer_name": "Test User Updated",
        "property_title": "Test Apartment Updated",
        "message": "What is the security deposit amount?",
        "inquiry_date": "2026-08-12",
        "response_status": "Pending"
    }
    status, res = make_request("/inquiries/add/", "POST", new_inquiry)
    if status == 201:
        print("[PASS] Inquiry registered successfully.")
    else:
        print(f"[FAIL] Add Inquiry failed! Status: {status}, Response: {res}")
        sys.exit(1)
        
    # Test 5.2: Get Inquiries
    print("Test 5.2: Get Inquiries list...")
    status, inquiries = make_request("/inquiries/")
    if status == 200 and isinstance(inquiries, list):
        print(f"[PASS] Retrieved {len(inquiries)} inquiries.")
    else:
        print(f"[FAIL] Get Inquiries failed! Status: {status}")
        sys.exit(1)
        
    # Test 5.3: Update Inquiry
    print("Test 5.3: Update Inquiry response...")
    updated_inquiry = {
        "customer_name": "Test User Updated",
        "property_title": "Test Apartment Updated",
        "message": "What is the security deposit amount?",
        "inquiry_date": "2026-08-12",
        "response_status": "Responded"
    }
    status, res = make_request("/inquiries/update/555/", "PUT", updated_inquiry)
    if status == 200:
        print("[PASS] Inquiry updated successfully.")
    else:
        print(f"[FAIL] Update Inquiry failed! Status: {status}, Response: {res}")
        sys.exit(1)

    # ------------------ WISHLIST & AUTHENTICATION ------------------
    print("\n--- Testing Bonus Wishlist & Auth APIs ---")
    
    # Test 6.1: Add Favorite
    print("Test 6.1: Add Favorite...")
    status, res = make_request("/favorites/add/", "POST", {"customer_id": 999, "property_id": 888})
    if status in (200, 201):
        print("[PASS] Favorite mapping registered.")
    else:
        print(f"[FAIL] Add Favorite failed! Status: {status}, Response: {res}")
        sys.exit(1)
        
    # Test 6.2: Get Favorites
    print("Test 6.2: Get Favorites list...")
    status, favorites = make_request("/favorites/999/")
    if status == 200 and isinstance(favorites, list):
        print(f"[PASS] Retrieved {len(favorites)} favorites for customer 999.")
    else:
        print(f"[FAIL] Get Favorites failed! Status: {status}")
        sys.exit(1)
        
    # Test 6.3: Login API (Customer check)
    print("Test 6.3: Login API (Valid Customer)...")
    status, res = make_request("/auth/login/", "POST", {"email": "testuser@gmail.com", "password": "newtestpassword"})
    if status == 200 and res.get("role") == "customer":
        print("[PASS] Customer logged in correctly.")
    else:
        print(f"[FAIL] Customer Login failed! Status: {status}, Response: {res}")
        sys.exit(1)

    # Test 6.4: Login API (Valid Admin)
    print("Test 6.4: Login API (Valid Admin)...")
    status, res = make_request("/auth/login/", "POST", {"email": "admin", "password": "admin123"})
    if status == 200 and res.get("role") == "admin":
        print("[PASS] Admin logged in correctly.")
    else:
        print(f"[FAIL] Admin Login failed! Status: {status}, Response: {res}")
        sys.exit(1)

    # ------------------ DELETION / CLEANUP TESTS ------------------
    print("\n--- Testing Deletion & Cleanup ---")
    
    # Delete Favorite
    print("Cleanup: Delete Favorite...")
    status, res = make_request("/favorites/delete/999/888/", "DELETE")
    if status == 200:
        print("[PASS] Favorite link deleted.")
    else:
        print(f"[FAIL] Delete Favorite failed! Status: {status}")
        sys.exit(1)
        
    # Delete Booking
    print("Cleanup: Delete Booking...")
    status, res = make_request("/bookings/delete/666/", "DELETE")
    if status == 200:
        print("[PASS] Booking record deleted.")
    else:
        print(f"[FAIL] Delete Booking failed! Status: {status}")
        sys.exit(1)
        
    # Delete Inquiry
    print("Cleanup: Delete Inquiry...")
    status, res = make_request("/inquiries/delete/555/", "DELETE")
    if status == 200:
        print("[PASS] Inquiry record deleted.")
    else:
        print(f"[FAIL] Delete Inquiry failed! Status: {status}")
        sys.exit(1)
        
    # Delete Property
    print("Cleanup: Delete Property...")
    status, res = make_request("/properties/delete/888/", "DELETE")
    if status == 200:
        print("[PASS] Property record deleted.")
    else:
        print(f"[FAIL] Delete Property failed! Status: {status}")
        sys.exit(1)
        
    # Delete Agent
    print("Cleanup: Delete Agent...")
    status, res = make_request("/agents/delete/777/", "DELETE")
    if status == 200:
        print("[PASS] Agent record deleted.")
    else:
        print(f"[FAIL] Delete Agent failed! Status: {status}")
        sys.exit(1)
        
    # Delete Customer
    print("Cleanup: Delete Customer...")
    status, res = make_request("/customers/delete/999/", "DELETE")
    if status == 200:
        print("[PASS] Customer record deleted.")
    else:
        print(f"[FAIL] Delete Customer failed! Status: {status}")
        sys.exit(1)
        
    print("\n*** ALL 20+ REST API CRUD TESTS COMPLETED SUCCESSFULLY! [100/100 PASS] ***")

if __name__ == "__main__":
    run_tests()
