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
    print("RUNNING JOB PORTAL SYSTEM REST API TESTS")
    print("=========================================")
    
    # 1. TEST CANDIDATES MODULE
    print("\n[1/5] Testing Candidate APIs...")
    res = client.get('/candidates/')
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print(f"  - GET /candidates/ works. Count: {len(res.json())}")
    
    new_candidate = {
        "full_name": "Test Candidate",
        "email": "testcandidate@test.com",
        "phone": "9990001112",
        "qualification": "B.Tech",
        "skills": "Python, Go, JS",
        "experience": 3,
        "password": "testpassword"
    }
    res = client.post('/candidates/add/', json.dumps(new_candidate), content_type='application/json')
    assert res.status_code == 201, f"Expected 201, got {res.status_code}"
    cid = res.json()['candidate_id']
    print(f"  - POST /candidates/add/ works. Created ID: {cid}")
    
    new_candidate["full_name"] = "Test Candidate Updated"
    res = client.put(f'/candidates/update/{cid}/', json.dumps(new_candidate), content_type='application/json')
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print(f"  - PUT /candidates/update/{cid}/ works.")
    
    res = client.delete(f'/candidates/delete/{cid}/')
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print(f"  - DELETE /candidates/delete/{cid}/ works.")
    
    # 2. TEST EMPLOYERS MODULE
    print("\n[2/5] Testing Employer APIs...")
    res = client.get('/employers/')
    assert res.status_code == 200
    print(f"  - GET /employers/ works. Count: {len(res.json())}")
    
    new_employer = {
        "company_name": "Test Company",
        "hr_name": "Test HR",
        "email": "testhr@company.com",
        "phone": "8881112223",
        "location": "Pune",
        "industry": "Consulting",
        "password": "hrpassword"
    }
    res = client.post('/employers/add/', json.dumps(new_employer), content_type='application/json')
    assert res.status_code == 201
    eid = res.json()['employer_id']
    print(f"  - POST /employers/add/ works. Created ID: {eid}")
    
    new_employer["location"] = "Mumbai"
    res = client.put(f'/employers/update/{eid}/', json.dumps(new_employer), content_type='application/json')
    assert res.status_code == 200
    print(f"  - PUT /employers/update/{eid}/ works.")
    
    res = client.delete(f'/employers/delete/{eid}/')
    assert res.status_code == 200
    print(f"  - DELETE /employers/delete/{eid}/ works.")

    # 3. TEST JOBS MODULE
    print("\n[3/5] Testing Job APIs...")
    res = client.get('/jobs/')
    assert res.status_code == 200
    print(f"  - GET /jobs/ works. Count: {len(res.json())}")
    
    new_job = {
        "job_title": "Test Engineer",
        "company_name": "Infosys",
        "location": "Chennai",
        "job_type": "Full Time",
        "experience_required": 1,
        "salary": 600000,
        "last_date": "2026-09-30"
    }
    res = client.post('/jobs/add/', json.dumps(new_job), content_type='application/json')
    assert res.status_code == 201
    jid = res.json()['job_id']
    print(f"  - POST /jobs/add/ works. Created ID: {jid}")
    
    new_job["salary"] = 700000
    res = client.put(f'/jobs/update/{jid}/', json.dumps(new_job), content_type='application/json')
    assert res.status_code == 200
    print(f"  - PUT /jobs/update/{jid}/ works.")
    
    res = client.delete(f'/jobs/delete/{jid}/')
    assert res.status_code == 200
    print(f"  - DELETE /jobs/delete/{jid}/ works.")

    # 4. TEST APPLICATIONS MODULE
    print("\n[4/5] Testing Application APIs...")
    res = client.get('/applications/')
    assert res.status_code == 200
    print(f"  - GET /applications/ works. Count: {len(res.json())}")
    
    new_app = {
        "candidate_name": "Rahul Sharma",
        "company_name": "Infosys",
        "job_title": "Python Full Stack Developer",
        "applied_date": "2026-07-15",
        "resume": "test_resume.pdf",
        "application_status": "Applied"
    }
    res = client.post('/applications/add/', json.dumps(new_app), content_type='application/json')
    assert res.status_code == 201
    apid = res.json()['application_id']
    print(f"  - POST /applications/add/ works. Created ID: {apid}")
    
    new_app["application_status"] = "Shortlisted"
    res = client.put(f'/applications/update/{apid}/', json.dumps(new_app), content_type='application/json')
    assert res.status_code == 200
    print(f"  - PUT /applications/update/{apid}/ works.")
    
    res = client.delete(f'/applications/delete/{apid}/')
    assert res.status_code == 200
    print(f"  - DELETE /applications/delete/{apid}/ works.")

    # 5. TEST INTERVIEWS MODULE
    print("\n[5/5] Testing Interview APIs...")
    res = client.get('/interviews/')
    assert res.status_code == 200
    print(f"  - GET /interviews/ works. Count: {len(res.json())}")
    
    new_interview = {
        "candidate_name": "Rahul Sharma",
        "company_name": "Infosys",
        "interview_date": "2026-07-25",
        "interview_time": "10:30",
        "interview_mode": "Online",
        "interview_status": "Scheduled"
    }
    res = client.post('/interviews/add/', json.dumps(new_interview), content_type='application/json')
    assert res.status_code == 201
    intid = res.json()['interview_id']
    print(f"  - POST /interviews/add/ works. Created ID: {intid}")
    
    new_interview["interview_status"] = "Completed"
    res = client.put(f'/interviews/update/{intid}/', json.dumps(new_interview), content_type='application/json')
    assert res.status_code == 200
    print(f"  - PUT /interviews/update/{intid}/ works.")
    
    res = client.delete(f'/interviews/delete/{intid}/')
    assert res.status_code == 200
    print(f"  - DELETE /interviews/delete/{intid}/ works.")
    
    print("\nALL 20 REST API ENDPOINTS TESTED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
