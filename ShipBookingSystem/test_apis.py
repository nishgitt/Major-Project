import urllib.request
import urllib.parse
import json
import time

BASE_URL = 'http://127.0.0.1:8000'

def make_request(path, method='GET', data=None):
    url = f"{BASE_URL}{path}"
    headers = {'Content-Type': 'application/json'}
    req_data = None
    if data:
        req_data = json.dumps(data).encode('utf-8')
        
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            return response.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        res_body = e.read().decode('utf-8')
        print(f"HTTPError on {method} {path}: {e.code} - {res_body}")
        try:
            return e.code, json.loads(res_body)
        except Exception:
            return e.code, {'error': res_body}
    except Exception as e:
        print(f"Error on {method} {path}: {e}")
        return 500, {'error': str(e)}

def run_tests():
    print("Starting Ship Booking System API Verification Tests...")
    
    ts = str(int(time.time()))
    test_email = f"passenger_{ts}@gmail.com"
    test_ship = f"Ocean Voyager {ts}"
    
    # 1. Passenger CRUD
    print("\n--- Testing PASSENGER APIs ---")
    passenger_payload = {
        "full_name": "Test Passenger",
        "email": test_email,
        "phone": "9876543210",
        "nationality": "Indian",
        "passport_number": "P123456" + ts[-2:],
        "password": "passpassword"
    }
    status, passenger = make_request('/passengers/add/', 'POST', passenger_payload)
    print("Create Passenger Status:", status)
    assert status == 201
    passenger_id = passenger['passenger_id']
    
    status, passengers = make_request('/passengers/')
    print("Get Passengers List Status:", status)
    assert status == 200
    assert len(passengers) >= 1
    
    update_payload = {"phone": "9999999999"}
    status, updated_p = make_request(f'/passengers/update/{passenger_id}/', 'PUT', update_payload)
    print("Update Passenger Status:", status)
    assert status == 200
    assert updated_p['phone'] == '9999999999'
    
    login_payload = {"email": test_email, "password": "passpassword"}
    status, logged_in = make_request('/passengers/login/', 'POST', login_payload)
    print("Login Passenger Status:", status)
    assert status == 200

    # 2. Ship CRUD
    print("\n--- Testing SHIP APIs ---")
    ship_payload = {
        "ship_name": test_ship,
        "ship_type": "Luxury Yacht",
        "capacity": 100,
        "operator_name": "Test Yachting",
        "status": "Active"
    }
    status, ship = make_request('/ships/add/', 'POST', ship_payload)
    print("Create Ship Status:", status)
    assert status == 201
    ship_id = ship['ship_id']
    
    status, ships = make_request('/ships/')
    print("Get Ships List Status:", status)
    assert status == 200
    assert len(ships) >= 1

    # 3. Schedule CRUD
    print("\n--- Testing ROUTE & SCHEDULE APIs ---")
    sched_payload = {
        "ship_name": test_ship,
        "source_port": "Chennai Port",
        "destination_port": "Port Blair",
        "departure_date": "2026-10-15",
        "departure_time": "08:00",
        "arrival_date": "2026-10-16",
        "arrival_time": "06:00",
        "fare": 8000.0
    }
    status, schedule = make_request('/schedules/add/', 'POST', sched_payload)
    print("Create Schedule Status:", status)
    assert status == 201
    schedule_id = schedule['schedule_id']
    
    status, schedules = make_request('/schedules/')
    print("Get Schedules List Status:", status)
    assert status == 200

    # 4. Booking CRUD
    print("\n--- Testing BOOKING APIs ---")
    booking_payload = {
        "passenger_name": "Test Passenger",
        "ship_name": test_ship,
        "cabin_type": "Deluxe", # 1.4x multiplier
        "journey_date": "2026-10-15",
        "source_port": "Chennai Port",
        "destination_port": "Port Blair"
    }
    status, booking = make_request('/bookings/add/', 'POST', booking_payload)
    print("Create Booking Status:", status)
    assert status == 201
    booking_id = booking['booking_id']
    print("Calculated Fare Total:", booking['total_amount'])
    assert booking['total_amount'] == 11200.0 # 8000 * 1.4
    
    status, bookings = make_request('/bookings/')
    print("Get Bookings List Status:", status)
    assert status == 200

    # 5. Payment CRUD
    print("\n--- Testing PAYMENT APIs ---")
    payment_payload = {
        "booking_id": booking_id,
        "passenger_name": "Test Passenger",
        "amount": 11200.0,
        "payment_method": "UPI",
        "payment_status": "Success",
        "transaction_id": "TXN_SHIP_TEST_" + str(int(time.time())),
        "payment_date": "2026-07-19"
    }
    status, payment = make_request('/payments/add/', 'POST', payment_payload)
    print("Create Payment Status:", status)
    assert status == 201
    
    status, bookings_after = make_request('/bookings/')
    target_booking = next(b for b in bookings_after if b['booking_id'] == booking_id)
    print("Booking Status after Payment Success:", target_booking['booking_status'])
    assert target_booking['booking_status'] == 'Confirmed'

    # 6. Reviews CRUD (Bonus Feature)
    print("\n--- Testing SHIP REVIEWS (Bonus Feature) ---")
    review_payload = {
        "ship_id": ship_id,
        "passenger_name": "Test Passenger",
        "rating": 5,
        "comment": "Perfect deck layout and very quiet cabin berths!",
        "review_date": "2026-07-19"
    }
    status, review_res = make_request('/ships/reviews/add/', 'POST', review_payload)
    print("Submit Review Status:", status)
    assert status == 201
    
    status, reviews = make_request(f'/ships/reviews/{ship_id}/')
    print("Get Reviews List Status:", status)
    assert status == 200
    assert len(reviews) >= 1

    # 7. Cleanup
    print("\n--- Testing DELETE Cleanups ---")
    status, del_booking = make_request(f'/bookings/delete/{booking_id}/', 'DELETE')
    print("Delete Booking Status:", status)
    assert status == 200
    
    status, del_schedule = make_request(f'/schedules/delete/{schedule_id}/', 'DELETE')
    print("Delete Schedule Status:", status)
    assert status == 200
    
    status, del_ship = make_request(f'/ships/delete/{ship_id}/', 'DELETE')
    print("Delete Ship Status:", status)
    assert status == 200
    
    status, del_passenger = make_request(f'/passengers/delete/{passenger_id}/', 'DELETE')
    print("Delete Passenger Status:", status)
    assert status == 200
    
    print("\nALL API INTEGRATION VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    run_tests()
