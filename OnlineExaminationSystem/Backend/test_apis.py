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
    print("RUNNING ONLINE EXAMINATION REST API TESTS")
    print("=========================================")
    
    # 1. TEST STUDENTS MODULE
    print("\n[1/5] Testing Student APIs...")
    res = client.get('/students/')
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print(f"  - GET /students/ works. Count: {len(res.json())}")
    
    new_student = {
        "full_name": "Test Student",
        "email": "test@gmail.com",
        "phone": "1234567890",
        "college": "Test College",
        "password": "testpassword"
    }
    res = client.post('/students/add/', json.dumps(new_student), content_type='application/json')
    assert res.status_code == 201, f"Expected 201, got {res.status_code}"
    sid = res.json()['student_id']
    print(f"  - POST /students/add/ works. Created ID: {sid}")
    
    new_student["full_name"] = "Test Student Updated"
    res = client.put(f'/students/update/{sid}/', json.dumps(new_student), content_type='application/json')
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print(f"  - PUT /students/update/{sid}/ works.")
    
    res = client.delete(f'/students/delete/{sid}/')
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print(f"  - DELETE /students/delete/{sid}/ works.")

    # 2. TEST EXAMINATIONS MODULE
    print("\n[2/5] Testing Examination APIs...")
    res = client.get('/exams/')
    assert res.status_code == 200
    print(f"  - GET /exams/ works. Count: {len(res.json())}")
    
    new_exam = {
        "exam_title": "Test Exam",
        "subject": "Testing",
        "duration": 40,
        "total_marks": 50,
        "exam_date": "2026-09-01"
    }
    res = client.post('/exams/add/', json.dumps(new_exam), content_type='application/json')
    assert res.status_code == 201
    eid = res.json()['exam_id']
    print(f"  - POST /exams/add/ works. Created ID: {eid}")
    
    new_exam["duration"] = 50
    res = client.put(f'/exams/update/{eid}/', json.dumps(new_exam), content_type='application/json')
    assert res.status_code == 200
    print(f"  - PUT /exams/update/{eid}/ works.")
    
    res = client.delete(f'/exams/delete/{eid}/')
    assert res.status_code == 200
    print(f"  - DELETE /exams/delete/{eid}/ works.")

    # 3. TEST QUESTIONS MODULE
    print("\n[3/5] Testing Question APIs...")
    res = client.get('/questions/')
    assert res.status_code == 200
    print(f"  - GET /questions/ works. Count: {len(res.json())}")
    
    new_question = {
        "exam_title": "Python Programming Test",
        "question": "What is Python?",
        "option_a": "Language",
        "option_b": "Snake",
        "option_c": "Game",
        "option_d": "None",
        "correct_answer": "Language",
        "marks": 10
    }
    res = client.post('/questions/add/', json.dumps(new_question), content_type='application/json')
    assert res.status_code == 201
    qid = res.json()['question_id']
    print(f"  - POST /questions/add/ works. Created ID: {qid}")
    
    new_question["marks"] = 15
    res = client.put(f'/questions/update/{qid}/', json.dumps(new_question), content_type='application/json')
    assert res.status_code == 200
    print(f"  - PUT /questions/update/{qid}/ works.")
    
    res = client.delete(f'/questions/delete/{qid}/')
    assert res.status_code == 200
    print(f"  - DELETE /questions/delete/{qid}/ works.")

    # 4. TEST SUBMISSIONS MODULE
    print("\n[4/5] Testing Submission APIs...")
    res = client.get('/submissions/')
    assert res.status_code == 200
    print(f"  - GET /submissions/ works. Count: {len(res.json())}")
    
    new_sub = {
        "student_name": "Test Student",
        "exam_title": "Python Programming Test",
        "submitted_answers": "Q1:def",
        "score": 20,
        "submitted_at": "2026-08-15 12:00:00"
    }
    res = client.post('/submissions/add/', json.dumps(new_sub), content_type='application/json')
    assert res.status_code == 201
    subid = res.json()['submission_id']
    print(f"  - POST /submissions/add/ works. Created ID: {subid}")
    
    new_sub["score"] = 40
    res = client.put(f'/submissions/update/{subid}/', json.dumps(new_sub), content_type='application/json')
    assert res.status_code == 200
    print(f"  - PUT /submissions/update/{subid}/ works.")
    
    res = client.delete(f'/submissions/delete/{subid}/')
    assert res.status_code == 200
    print(f"  - DELETE /submissions/delete/{subid}/ works.")

    # 5. TEST RESULTS MODULE
    print("\n[5/5] Testing Result APIs...")
    res = client.get('/results/')
    assert res.status_code == 200
    print(f"  - GET /results/ works. Count: {len(res.json())}")
    
    new_res = {
        "student_name": "Test Student",
        "exam_title": "Python Programming Test",
        "total_marks": 100,
        "obtained_marks": 70,
        "percentage": 70,
        "result_status": "Pass"
    }
    res = client.post('/results/add/', json.dumps(new_res), content_type='application/json')
    assert res.status_code == 201
    resid = res.json()['result_id']
    print(f"  - POST /results/add/ works. Created ID: {resid}")
    
    new_res["obtained_marks"] = 75
    res = client.put(f'/results/update/{resid}/', json.dumps(new_res), content_type='application/json')
    assert res.status_code == 200
    print(f"  - PUT /results/update/{resid}/ works.")
    
    res = client.delete(f'/results/delete/{resid}/')
    assert res.status_code == 200
    print(f"  - DELETE /results/delete/{resid}/ works.")
    
    print("\nALL 20 REST API ENDPOINTS TESTED AND VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
