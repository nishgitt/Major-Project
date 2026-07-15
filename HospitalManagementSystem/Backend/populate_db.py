import sys
import os

# Add parent directory to path so db.py can be imported
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

import db

def populate():
    print("Initial database check and populate...")
    db.init_db()
    
    # 1. Populate Patient
    patients = db.get_patients()
    if not any(p['patient_id'] == 101 for p in patients):
        print("Inserting sample patient Rahul Sharma (ID: 101)")
        db.add_patient({
            "patient_id": 101,
            "patient_name": "Rahul Sharma",
            "age": 28,
            "gender": "Male",
            "phone": "9876543210",
            "email": "rahul@gmail.com",
            "blood_group": "O+",
            "address": "Hyderabad"
        })
    else:
        print("Sample patient Rahul Sharma already exists.")

    # 2. Populate Doctor
    doctors = db.get_doctors()
    if not any(d['doctor_id'] == 201 for d in doctors):
        print("Inserting sample doctor Dr. Priya Reddy (ID: 201)")
        db.add_doctor({
            "doctor_id": 201,
            "doctor_name": "Dr. Priya Reddy",
            "specialization": "Cardiologist",
            "department": "Cardiology",
            "experience": 10,
            "phone": "9988776655",
            "consultation_fee": 800
        })
    else:
        print("Sample doctor already exists.")

    # 3. Populate Appointment
    appointments = db.get_appointments()
    if not any(a['appointment_id'] == 301 for a in appointments):
        print("Inserting sample appointment (ID: 301)")
        db.add_appointment({
            "appointment_id": 301,
            "patient_name": "Rahul Sharma",
            "doctor_name": "Dr. Priya Reddy",
            "appointment_date": "2026-07-20",
            "appointment_time": "10:30",
            "appointment_status": "Scheduled"
        })
    else:
        print("Sample appointment already exists.")

    # 4. Populate Medical Record
    records = db.get_records()
    if not any(r['record_id'] == 401 for r in records):
        print("Inserting sample medical record (ID: 401)")
        db.add_record({
            "record_id": 401,
            "patient_name": "Rahul Sharma",
            "doctor_name": "Dr. Priya Reddy",
            "diagnosis": "High Blood Pressure",
            "prescription": "Tablet A - Once Daily",
            "treatment": "Regular Monitoring",
            "visit_date": "2026-07-20"
        })
    else:
        print("Sample medical record already exists.")

    # 5. Populate Bill
    bills = db.get_bills()
    if not any(b['bill_id'] == 501 for b in bills):
        print("Inserting sample bill invoice (ID: 501)")
        db.add_bill({
            "bill_id": 501,
            "patient_name": "Rahul Sharma",
            "consultation_fee": 800,
            "medicine_charge": 1200,
            "laboratory_charge": 500,
            "payment_method": "UPI",
            "payment_status": "Paid"
        })
    else:
        print("Sample bill invoice already exists.")
        
    print("Database seeding completed.")

if __name__ == "__main__":
    populate()
