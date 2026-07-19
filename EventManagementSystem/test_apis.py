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
    print("Starting API Integration Verification Tests...")
    
    ts = str(int(time.time()))
    test_email = f"testuser_{ts}@gmail.com"
    test_venue = f"Test Venue Center {ts}"
    test_event = f"Test Mega Tech Fest {ts}"
    
    # 1. Test User CRUD
    print("\n--- Testing USER APIs ---")
    user_payload = {
        "full_name": "Test User",
        "email": test_email,
        "phone": "9999999999",
        "city": "Hyderabad",
        "password": "testpassword"
    }
    status, user = make_request('/users/add/', 'POST', user_payload)
    print("Create User Status:", status)
    assert status == 201
    assert 'user_id' in user
    user_id = user['user_id']
    print(f"Created User with ID: {user_id}")
    
    status, users = make_request('/users/')
    print("Get Users List Status:", status)
    assert status == 200
    assert len(users) >= 1
    
    update_payload = {"city": "Pune", "phone": "8888888888"}
    status, updated_user = make_request(f'/users/update/{user_id}/', 'PUT', update_payload)
    print("Update User Status:", status)
    assert status == 200
    assert updated_user['city'] == 'Pune'
    
    login_payload = {"email": test_email, "password": "testpassword"}
    status, logged_in = make_request('/users/login/', 'POST', login_payload)
    print("Login User Status:", status)
    assert status == 200
    assert logged_in['full_name'] == "Test User"

    # 2. Test Venue CRUD
    print("\n--- Testing VENUE APIs ---")
    venue_payload = {
        "venue_name": test_venue,
        "location": "Gachibowli",
        "city": "Hyderabad",
        "capacity": 500,
        "contact_person": "Jane Doe"
    }
    status, venue = make_request('/venues/add/', 'POST', venue_payload)
    print("Create Venue Status:", status)
    assert status == 201
    assert 'venue_id' in venue
    venue_id = venue['venue_id']
    
    status, venues = make_request('/venues/')
    print("Get Venues List Status:", status)
    assert status == 200
    assert len(venues) >= 1

    # 3. Test Event CRUD
    print("\n--- Testing EVENT APIs ---")
    event_payload = {
        "event_name": test_event,
        "category": "Conference",
        "organizer_name": "Test User",
        "event_date": "2026-08-30",
        "event_time": "09:00",
        "venue": test_venue,
        "ticket_price": 1000.0,
        "available_tickets": 200
    }
    status, event = make_request('/events/add/', 'POST', event_payload)
    print("Create Event Status:", status)
    assert status == 201
    assert 'event_id' in event
    event_id = event['event_id']
    
    status, events = make_request('/events/')
    print("Get Events List Status:", status)
    assert status == 200
    assert len(events) >= 1

    # 4. Test Booking CRUD
    print("\n--- Testing BOOKING APIs ---")
    booking_payload = {
        "user_name": "Test User",
        "event_name": test_event,
        "booking_date": "2026-07-19",
        "number_of_tickets": 3
    }
    status, booking = make_request('/bookings/add/', 'POST', booking_payload)
    print("Create Booking Status:", status)
    assert status == 201
    assert 'booking_id' in booking
    booking_id = booking['booking_id']
    assert booking['booking_status'] == 'Pending'
    assert booking['total_amount'] == 3000.0
    
    # Check ticket count decrement
    status, events_after = make_request('/events/')
    target_event = next(e for e in events_after if e['event_id'] == event_id)
    print("Event Tickets Remaining:", target_event['available_tickets'])
    assert target_event['available_tickets'] == 197 # 200 - 3
    
    status, bookings = make_request('/bookings/')
    print("Get Bookings List Status:", status)
    assert status == 200

    # 5. Test Payment CRUD
    print("\n--- Testing PAYMENT APIs ---")
    payment_payload = {
        "booking_id": booking_id,
        "user_name": "Test User",
        "amount": 3000.0,
        "payment_method": "UPI",
        "payment_status": "Success",
        "transaction_id": "TXN_TEST_" + str(int(time.time())),
        "payment_date": "2026-07-19"
    }
    status, payment = make_request('/payments/add/', 'POST', payment_payload)
    print("Create Payment Status:", status)
    assert status == 201
    assert 'payment_id' in payment
    
    # Verify booking status became 'Confirmed' on payment success
    status, bookings_after = make_request('/bookings/')
    target_booking = next(b for b in bookings_after if b['booking_id'] == booking_id)
    print("Booking Status after Payment Success:", target_booking['booking_status'])
    assert target_booking['booking_status'] == 'Confirmed'

    # 6. Test Reviews CRUD (Bonus Feature)
    print("\n--- Testing REVIEWS (Bonus Feature) ---")
    review_payload = {
        "event_id": event_id,
        "user_name": "Test User",
        "rating": 5,
        "comment": "Incredible experience, very well managed!",
        "review_date": "2026-07-19"
    }
    status, review_res = make_request('/events/reviews/add/', 'POST', review_payload)
    print("Submit Review Status:", status)
    assert status == 201
    
    status, reviews = make_request(f'/events/reviews/{event_id}/')
    print("Get Reviews List Status:", status)
    assert status == 200
    assert len(reviews) >= 1
    assert reviews[0]['comment'] == "Incredible experience, very well managed!"

    # 7. Cleanup (Testing Deletes)
    print("\n--- Testing DELETE Cleanups ---")
    
    # Delete booking -> check ticket restoration
    status, del_booking = make_request(f'/bookings/delete/{booking_id}/', 'DELETE')
    print("Delete Booking Status:", status)
    assert status == 200
    
    # Verify ticket count restored in event
    status, events_final = make_request('/events/')
    target_event_final = next(e for e in events_final if e['event_id'] == event_id)
    print("Event Tickets after Delete Booking:", target_event_final['available_tickets'])
    assert target_event_final['available_tickets'] == 200 # restored from 197
    
    status, del_event = make_request(f'/events/delete/{event_id}/', 'DELETE')
    print("Delete Event Status:", status)
    assert status == 200
    
    status, del_venue = make_request(f'/venues/delete/{venue_id}/', 'DELETE')
    print("Delete Venue Status:", status)
    assert status == 200
    
    status, del_user = make_request(f'/users/delete/{user_id}/', 'DELETE')
    print("Delete User Status:", status)
    assert status == 200
    
    print("\nALL API INTEGRATION VERIFICATION TESTS PASSED SUCCESSFULLY!")



if __name__ == '__main__':
    run_tests()
