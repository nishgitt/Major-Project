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
    print("=== STARTING SALON & SPA BOOKING SYSTEM REST API TESTS ===")
    
    # ------------------ MODULE 1: CUSTOMERS ------------------
    print("\n--- Testing Module 1: Customers ---")
    
    # Test 1.1: Add Customer
    print("Test 1.1: Add Customer...")
    new_customer = {
        "customer_id": 999, # unique ID for testing isolation
        "full_name": "Test Customer",
        "email": "testcust@gmail.com",
        "phone": "9999999999",
        "gender": "Female",
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
        "full_name": "Test Customer Updated",
        "email": "testcust@gmail.com",
        "phone": "8888888888",
        "gender": "Female",
        "password": "newpassword123"
    }
    status, res = make_request("/customers/update/999/", "PUT", updated_customer)
    if status == 200:
        print("[PASS] Customer updated successfully.")
    else:
        print(f"[FAIL] Update Customer failed! Status: {status}, Response: {res}")
        sys.exit(1)

    # ------------------ MODULE 2: SERVICES ------------------
    print("\n--- Testing Module 2: Services ---")
    
    # Test 2.1: Add Service
    print("Test 2.1: Add Service...")
    new_service = {
        "service_id": 888,
        "service_name": "Test Aromatherapy Massage",
        "category": "Massage",
        "duration": 45,
        "price": 1500,
        "description": "A test aromatherapy massage treatment"
    }
    status, res = make_request("/services/add/", "POST", new_service)
    if status == 201:
        print("[PASS] Service created successfully.")
    else:
        print(f"[FAIL] Add Service failed! Status: {status}, Response: {res}")
        sys.exit(1)
        
    # Test 2.2: Get Services
    print("Test 2.2: Get Services list...")
    status, services = make_request("/services/")
    if status == 200 and isinstance(services, list):
        print(f"[PASS] Retrieved {len(services)} services.")
    else:
        print(f"[FAIL] Get Services failed! Status: {status}")
        sys.exit(1)
        
    # Test 2.3: Update Service
    print("Test 2.3: Update Service...")
    updated_service = {
        "service_name": "Test Aromatherapy Massage Updated",
        "category": "Massage",
        "duration": 50,
        "price": 1600,
        "description": "Updated description"
    }
    status, res = make_request("/services/update/888/", "PUT", updated_service)
    if status == 200:
        print("[PASS] Service updated successfully.")
    else:
        print(f"[FAIL] Update Service failed! Status: {status}, Response: {res}")
        sys.exit(1)

    # ------------------ MODULE 3: STYLISTS ------------------
    print("\n--- Testing Module 3: Stylists ---")
    
    # Test 3.1: Add Stylist
    print("Test 3.1: Add Stylist...")
    new_stylist = {
        "stylist_id": 777,
        "stylist_name": "Test Therapist",
        "specialization": "Massage",
        "experience": 5,
        "phone": "7777777777",
        "availability": "Available"
    }
    status, res = make_request("/stylists/add/", "POST", new_stylist)
    if status == 201:
        print("[PASS] Stylist added successfully.")
    else:
        print(f"[FAIL] Add Stylist failed! Status: {status}, Response: {res}")
        sys.exit(1)
        
    # Test 3.2: Get Stylists
    print("Test 3.2: Get Stylists list...")
    status, stylists = make_request("/stylists/")
    if status == 200 and isinstance(stylists, list):
        print(f"[PASS] Retrieved {len(stylists)} stylists.")
    else:
        print(f"[FAIL] Get Stylists failed! Status: {status}")
        sys.exit(1)
        
    # Test 3.3: Update Stylist
    print("Test 3.3: Update Stylist...")
    updated_stylist = {
        "stylist_name": "Test Therapist Updated",
        "specialization": "Massage & Facials",
        "experience": 6,
        "phone": "7777777776",
        "availability": "Busy"
    }
    status, res = make_request("/stylists/update/777/", "PUT", updated_stylist)
    if status == 200:
        print("[PASS] Stylist updated successfully.")
    else:
        print(f"[FAIL] Update Stylist failed! Status: {status}, Response: {res}")
        sys.exit(1)

    # ------------------ MODULE 4: APPOINTMENTS ------------------
    print("\n--- Testing Module 4: Appointments ---")
    
    # Test 4.1: Add Appointment
    print("Test 4.1: Add Appointment...")
    new_appointment = {
        "appointment_id": 666,
        "customer_name": "Test Customer Updated",
        "stylist_name": "Test Therapist Updated",
        "service_name": "Test Aromatherapy Massage Updated",
        "appointment_date": "2026-08-25",
        "appointment_time": "14:00",
        "total_amount": 1600,
        "appointment_status": "Booked"
    }
    status, res = make_request("/appointments/add/", "POST", new_appointment)
    if status == 201:
        print("[PASS] Appointment created successfully.")
    else:
        print(f"[FAIL] Add Appointment failed! Status: {status}, Response: {res}")
        sys.exit(1)
        
    # Test 4.2: Get Appointments
    print("Test 4.2: Get Appointments list...")
    status, appointments = make_request("/appointments/")
    if status == 200 and isinstance(appointments, list):
        print(f"[PASS] Retrieved {len(appointments)} appointments.")
    else:
        print(f"[FAIL] Get Appointments failed! Status: {status}")
        sys.exit(1)
        
    # Test 4.3: Update Appointment
    print("Test 4.3: Update Appointment...")
    updated_appointment = {
        "customer_name": "Test Customer Updated",
        "stylist_name": "Test Therapist Updated",
        "service_name": "Test Aromatherapy Massage Updated",
        "appointment_date": "2026-08-25",
        "appointment_time": "15:00",
        "total_amount": 1600,
        "appointment_status": "Completed"
    }
    status, res = make_request("/appointments/update/666/", "PUT", updated_appointment)
    if status == 200:
        print("[PASS] Appointment updated successfully.")
    else:
        print(f"[FAIL] Update Appointment failed! Status: {status}, Response: {res}")
        sys.exit(1)

    # ------------------ MODULE 5: PAYMENTS ------------------
    print("\n--- Testing Module 5: Payments ---")
    
    # Test 5.1: Add Payment
    print("Test 5.1: Add Payment Transaction...")
    new_payment = {
        "payment_id": 555,
        "customer_name": "Test Customer Updated",
        "appointment_id": 666,
        "amount": 1600,
        "payment_method": "Credit Card",
        "payment_status": "Paid",
        "payment_date": "2026-07-19"
    }
    status, res = make_request("/payments/add/", "POST", new_payment)
    if status == 201:
        print("[PASS] Payment logged successfully.")
    else:
        print(f"[FAIL] Add Payment failed! Status: {status}, Response: {res}")
        sys.exit(1)
        
    # Test 5.2: Get Payments
    print("Test 5.2: Get Payments list...")
    status, payments = make_request("/payments/")
    if status == 200 and isinstance(payments, list):
        print(f"[PASS] Retrieved {len(payments)} payments.")
    else:
        print(f"[FAIL] Get Payments failed! Status: {status}")
        sys.exit(1)
        
    # Test 5.3: Update Payment
    print("Test 5.3: Update Payment...")
    updated_payment = {
        "customer_name": "Test Customer Updated",
        "appointment_id": 666,
        "amount": 1600,
        "payment_method": "Credit Card",
        "payment_status": "Failed",
        "payment_date": "2026-07-19"
    }
    status, res = make_request("/payments/update/555/", "PUT", updated_payment)
    if status == 200:
        print("[PASS] Payment updated successfully.")
    else:
        print(f"[FAIL] Update Payment failed! Status: {status}, Response: {res}")
        sys.exit(1)

    # ------------------ DELETION / CLEANUP TESTS ------------------
    print("\n--- Testing Entity Deletions / Cleanup ---")
    
    # Test 6.1: Delete Customer
    print("Test 6.1: Delete Customer...")
    status, res = make_request("/customers/delete/999/", "DELETE")
    if status == 200:
        print("[PASS] Customer deleted successfully.")
    else:
        print(f"[FAIL] Delete Customer failed! Status: {status}, Response: {res}")
        sys.exit(1)
        
    # Test 6.2: Delete Service
    print("Test 6.2: Delete Service...")
    status, res = make_request("/services/delete/888/", "DELETE")
    if status == 200:
        print("[PASS] Service deleted successfully.")
    else:
        print(f"[FAIL] Delete Service failed! Status: {status}, Response: {res}")
        sys.exit(1)
        
    # Test 6.3: Delete Stylist
    print("Test 6.3: Delete Stylist...")
    status, res = make_request("/stylists/delete/777/", "DELETE")
    if status == 200:
        print("[PASS] Stylist deleted successfully.")
    else:
        print(f"[FAIL] Delete Stylist failed! Status: {status}, Response: {res}")
        sys.exit(1)
        
    # Test 6.4: Delete Appointment
    print("Test 6.4: Delete Appointment...")
    status, res = make_request("/appointments/delete/666/", "DELETE")
    if status == 200:
        print("[PASS] Appointment deleted successfully.")
    else:
        print(f"[FAIL] Delete Appointment failed! Status: {status}, Response: {res}")
        sys.exit(1)
        
    # Test 6.5: Delete Payment
    print("Test 6.5: Delete Payment...")
    status, res = make_request("/payments/delete/555/", "DELETE")
    if status == 200:
        print("[PASS] Payment deleted successfully.")
    else:
        print(f"[FAIL] Delete Payment failed! Status: {status}, Response: {res}")
        sys.exit(1)

    print("\n=== ALL REST API ENDPOINT TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
