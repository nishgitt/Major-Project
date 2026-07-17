import sys
import os

# Add parent directory to path so db.py can be imported
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

import db

def populate():
    print("Initializing database and seeding data...")
    db.init_db()
    
    # 1. Candidate Seeding
    candidates = db.get_candidates()
    if not any(c['candidate_id'] == 101 for c in candidates):
        print("Inserting sample candidate Rahul Sharma (ID: 101)")
        db.add_candidate({
            "candidate_id": 101,
            "full_name": "Rahul Sharma",
            "email": "rahul@gmail.com",
            "phone": "9876543210",
            "qualification": "B.Tech CSE",
            "skills": "Python, Django, JavaScript",
            "experience": 2,
            "password": "rahul123"
        })
    if not any(c['candidate_id'] == 102 for c in candidates):
        print("Inserting sample candidate Jane Doe (ID: 102)")
        db.add_candidate({
            "candidate_id": 102,
            "full_name": "Jane Doe",
            "email": "jane@gmail.com",
            "phone": "9998887776",
            "qualification": "M.S. Computer Science",
            "skills": "React, Node.js, Python, CSS",
            "experience": 4,
            "password": "jane123"
        })
    if not any(c['candidate_id'] == 103 for c in candidates):
        print("Inserting sample candidate John Smith (ID: 103)")
        db.add_candidate({
            "candidate_id": 103,
            "full_name": "John Smith",
            "email": "john@gmail.com",
            "phone": "8887776665",
            "qualification": "B.Sc IT",
            "skills": "Java, Spring Boot, MySQL",
            "experience": 1,
            "password": "john123"
        })

    # 2. Employer Seeding
    employers = db.get_employers()
    if not any(e['employer_id'] == 201 for e in employers):
        print("Inserting sample employer Infosys (ID: 201)")
        db.add_employer({
            "employer_id": 201,
            "company_name": "Infosys",
            "hr_name": "Priya Reddy",
            "email": "hr@infosys.com",
            "phone": "9988776655",
            "location": "Bangalore",
            "industry": "Information Technology",
            "password": "hr123"
        })
    if not any(e['employer_id'] == 202 for e in employers):
        print("Inserting sample employer Google (ID: 202)")
        db.add_employer({
            "employer_id": 202,
            "company_name": "Google",
            "hr_name": "Sarah Jenkins",
            "email": "hr@google.com",
            "phone": "9999888877",
            "location": "Mountain View, CA",
            "industry": "Internet Technology",
            "password": "hr456"
        })
    if not any(e['employer_id'] == 203 for e in employers):
        print("Inserting sample employer TCS (ID: 203)")
        db.add_employer({
            "employer_id": 203,
            "company_name": "TCS",
            "hr_name": "Anil Kumar",
            "email": "hr@tcs.com",
            "phone": "8877665544",
            "location": "Mumbai",
            "industry": "Information Technology",
            "password": "hr789"
        })

    # 3. Job Seeding
    jobs = db.get_jobs()
    if not any(j['job_id'] == 301 for j in jobs):
        print("Inserting sample job (ID: 301)")
        db.add_job({
            "job_id": 301,
            "job_title": "Python Full Stack Developer",
            "company_name": "Infosys",
            "location": "Bangalore",
            "job_type": "Full Time",
            "experience_required": 2,
            "salary": 800000,
            "last_date": "2026-08-15"
        })
    if not any(j['job_id'] == 302 for j in jobs):
        print("Inserting sample job (ID: 302)")
        db.add_job({
            "job_id": 302,
            "job_title": "Senior Frontend Engineer",
            "company_name": "Google",
            "location": "Remote",
            "job_type": "Remote",
            "experience_required": 4,
            "salary": 1800000,
            "last_date": "2026-08-20"
        })
    if not any(j['job_id'] == 303 for j in jobs):
        print("Inserting sample job (ID: 303)")
        db.add_job({
            "job_id": 303,
            "job_title": "Software Engineering Intern",
            "company_name": "TCS",
            "location": "Mumbai",
            "job_type": "Internship",
            "experience_required": 0,
            "salary": 300000,
            "last_date": "2026-08-01"
        })
    if not any(j['job_id'] == 304 for j in jobs):
        print("Inserting sample job (ID: 304)")
        db.add_job({
            "job_id": 304,
            "job_title": "Java developer",
            "company_name": "TCS",
            "location": "Bangalore",
            "job_type": "Full Time",
            "experience_required": 1,
            "salary": 500000,
            "last_date": "2026-08-30"
        })

    # 4. Job Application Seeding
    applications = db.get_applications()
    if not any(a['application_id'] == 401 for a in applications):
        print("Inserting sample application (ID: 401)")
        db.add_application({
            "application_id": 401,
            "candidate_name": "Rahul Sharma",
            "company_name": "Infosys",
            "job_title": "Python Full Stack Developer",
            "applied_date": "2026-07-15",
            "resume": "rahul_resume.pdf",
            "application_status": "Applied"
        })
    if not any(a['application_id'] == 402 for a in applications):
        print("Inserting sample application (ID: 402)")
        db.add_application({
            "application_id": 402,
            "candidate_name": "Jane Doe",
            "company_name": "Google",
            "job_title": "Senior Frontend Engineer",
            "applied_date": "2026-07-14",
            "resume": "jane_resume.pdf",
            "application_status": "Shortlisted"
        })
    if not any(a['application_id'] == 403 for a in applications):
        print("Inserting sample application (ID: 403)")
        db.add_application({
            "application_id": 403,
            "candidate_name": "John Smith",
            "company_name": "TCS",
            "job_title": "Software Engineering Intern",
            "applied_date": "2026-07-10",
            "resume": "john_resume.pdf",
            "application_status": "Interview Scheduled"
        })

    # 5. Interview Seeding
    interviews = db.get_interviews()
    if not any(i['interview_id'] == 501 for i in interviews):
        print("Inserting sample interview (ID: 501)")
        db.add_interview({
            "interview_id": 501,
            "candidate_name": "Rahul Sharma",
            "company_name": "Infosys",
            "interview_date": "2026-07-25",
            "interview_time": "10:30",
            "interview_mode": "Online",
            "interview_status": "Scheduled"
        })
    if not any(i['interview_id'] == 502 for i in interviews):
        print("Inserting sample interview (ID: 502)")
        db.add_interview({
            "interview_id": 502,
            "candidate_name": "John Smith",
            "company_name": "TCS",
            "interview_date": "2026-07-22",
            "interview_time": "14:00",
            "interview_mode": "Offline",
            "interview_status": "Scheduled"
        })
        
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    populate()
