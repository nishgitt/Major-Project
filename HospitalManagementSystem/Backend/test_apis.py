import os
import sys
import json

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

import django
django.setup()

from django.test import Client

def run_tests():
    client = Client()
    print("=========================================")
    print("RUNNING HOSPITAL SYSTEM REST API TESTS")
    print("=========================================")
    
    # 1. TEST PATIENTS MODULE
    print("\n[1/5] Testing Patient APIs...")
    res = client.get('/patients/')
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print(f"  - GET /patients/ works. Count: {len(res.json())}")
    
    new_patient = {
        "patient_name": "Test Patient",
        "age": 45,
        "gender": "Female",
        "phone": "9998887776",
        "email": "test.patient@hospital.com",
        "blood_group": "AB-",
        "address": "Delhi"
    }
    res = client.post('/patients/add/', json.dumps(new_patient), content_type='application/json')
    assert res.status_code == 201, f"Expected 201, got {res.status_code}"
    pid = res.json()['patient_id']
    print(f"  - POST /patients/add/ works. Created ID: {pid}")
    
    new_patient["patient_name"] = "Test Patient Updated"
    res = client.put(f'/patients/update/{pid}/', json.dumps(new_patient), content_type='application/json')
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print(f"  - PUT /patients/update/{pid}/ works.")
    
    res = client.delete(f'/patients/delete/{pid}/')
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print(f"  - DELETE /patients/delete/{pid}/ works.")

    # 2. TEST DOCTORS MODULE
    print("\n[2/5] Testing Doctor APIs...")
    res = client.get('/doctors/')
    assert res.status_code == 200
    print(f"  - GET /doctors/ works. Count: {len(res.json())}")
    
    new_doctor = {
        "doctor_name": "Test Doctor",
        "specialization": "Dermatologist",
        "department": "Dermatology",
        "experience": 8,
        "phone": "8887776665",
        "consultation_fee": 600
    }
    res = client.post('/doctors/add/', json.dumps(new_doctor), content_type='application/json')
    assert res.status_code == 201
    did = res.json()['doctor_id']
    print(f"  - POST /doctors/add/ works. Created ID: {did}")
    
    new_doctor["experience"] = 9
    res = client.put(f'/doctors/update/{did}/', json.dumps(new_doctor), content_type='application/json')
    assert res.status_code == 200
    print(f"  - PUT /doctors/update/{did}/ works.")
    
    res = client.delete(f'/doctors/delete/{did}/')
    assert res.status_code == 200
    print(f"  - DELETE /doctors/delete/{did}/ works.")

    # 3. TEST APPOINTMENTS MODULE
    print("\n[3/5] Testing Appointment APIs...")
    res = client.get('/appointments/')
    assert res.status_code == 200
    print(f"  - GET /appointments/ works. Count: {len(res.json())}")
    
    new_appointment = {
        "patient_name": "Rahul Sharma",
        "doctor_name": "Dr. Priya Reddy",
        "appointment_date": "2026-07-22",
        "appointment_time": "14:15",
        "appointment_status": "Scheduled"
    }
    res = client.post('/appointments/add/', json.dumps(new_appointment), content_type='application/json')
    assert res.status_code == 201
    aid = res.json()['appointment_id']
    print(f"  - POST /appointments/add/ works. Created ID: {aid}")
    
    new_appointment["appointment_status"] = "Completed"
    res = client.put(f'/appointments/update/{aid}/', json.dumps(new_appointment), content_type='application/json')
    assert res.status_code == 200
    print(f"  - PUT /appointments/update/{aid}/ works.")
    
    res = client.delete(f'/appointments/delete/{aid}/')
    assert res.status_code == 200
    print(f"  - DELETE /appointments/delete/{aid}/ works.")

    # 4. TEST MEDICAL RECORDS MODULE
    print("\n[4/5] Testing Medical Record APIs...")
    res = client.get('/records/')
    assert res.status_code == 200
    print(f"  - GET /records/ works. Count: {len(res.json())}")
    
    new_record = {
        "patient_name": "Rahul Sharma",
        "doctor_name": "Dr. Priya Reddy",
        "diagnosis": "Healthy",
        "prescription": "Multi-vitamins",
        "treatment": "None",
        "visit_date": "2026-07-20"
    }
    res = client.post('/records/add/', json.dumps(new_record), content_type='application/json')
    assert res.status_code == 201
    rid = res.json()['record_id']
    print(f"  - POST /records/add/ works. Created ID: {rid}")
    
    new_record["diagnosis"] = "Perfect Health"
    res = client.put(f'/records/update/{rid}/', json.dumps(new_record), content_type='application/json')
    assert res.status_code == 200
    print(f"  - PUT /records/update/{rid}/ works.")
    
    res = client.delete(f'/records/delete/{rid}/')
    assert res.status_code == 200
    print(f"  - DELETE /records/delete/{rid}/ works.")

    # 5. TEST BILLING MODULE
    print("\n[5/5] Testing Billing APIs...")
    res = client.get('/bills/')
    assert res.status_code == 200
    print(f"  - GET /bills/ works. Count: {len(res.json())}")
    
    new_bill = {
        "patient_name": "Rahul Sharma",
        "consultation_fee": 800,
        "medicine_charge": 450,
        "laboratory_charge": 200,
        "payment_method": "Cash",
        "payment_status": "Pending"
    }
    res = client.post('/bills/add/', json.dumps(new_bill), content_type='application/json')
    assert res.status_code == 201
    bid = res.json()['bill_id']
    print(f"  - POST /bills/add/ works. Created ID: {bid}")
    
    new_bill["payment_status"] = "Paid"
    res = client.put(f'/bills/update/{bid}/', json.dumps(new_bill), content_type='application/json')
    assert res.status_code == 200
    print(f"  - PUT /bills/update/{bid}/ works.")
    
    res = client.delete(f'/bills/delete/{bid}/')
    assert res.status_code == 200
    print(f"  - DELETE /bills/delete/{bid}/ works.")
    
    print("\n=========================================")
    print("ALL 20 REST API ENDPOINTS VALIDATED SUCCESSFULLY!")
    print("=========================================")

if __name__ == "__main__":
    run_tests()
