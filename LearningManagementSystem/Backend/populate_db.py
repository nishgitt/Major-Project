import db
import os

def populate():
    # Remove existing lms.db to apply new table schema cleanly
    db_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lms.db')
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
            print("Removed old SQLite lms.db database file.")
        except Exception as e:
            print(f"Error removing old lms.db: {e}")

    # Re-initialize DB
    db.init_db()
    print("Populating testing data...")
    
    # 1. Add Instructors
    instructors = [
        {
            "instructor_id": 201,
            "instructor_name": "Saran Velmurugan",
            "specialization": "Full Stack Development",
            "experience": 5,
            "email": "trainer@gmail.com",
            "phone": "9876543211"
        },
        {
            "instructor_id": 202,
            "instructor_name": "Neha Gupta",
            "specialization": "Java Enterprise",
            "experience": 4,
            "email": "neha@gmail.com",
            "phone": "9876543212"
        },
        {
            "instructor_id": 203,
            "instructor_name": "John Doe",
            "specialization": "Frontend UI",
            "experience": 6,
            "email": "john@gmail.com",
            "phone": "9876543213"
        },
        {
            "instructor_id": 204,
            "instructor_name": "Rahul Joshi",
            "specialization": "AWS Cloud Security",
            "experience": 7,
            "email": "rahul.j@gmail.com",
            "phone": "9876543214"
        }
    ]
    for inst in instructors:
        try:
            db.add_instructor(inst)
            print(f"Added instructor {inst['instructor_name']}")
        except Exception as e:
            print(f"Instructor add error: {e}")
        
    # 2. Add Student (Rahul Sharma)
    student_data = {
        "student_id": 101,
        "full_name": "Rahul Sharma",
        "email": "rahul@gmail.com",
        "phone": "9876543210",
        "qualification": "B.Tech",
        "password": "rahul123"
    }
    try:
        db.add_student(student_data)
        print("Added sample student Rahul Sharma")
    except Exception as e:
        print(f"Student add error: {e}")
        
    # 3. Add Courses
    courses = [
        {
            "course_id": 301,
            "course_name": "Python Full Stack Development",
            "instructor_name": "Saran Velmurugan",
            "category": "Programming",
            "duration": "6 Months",
            "price": 25000,
            "level": "Beginner",
            "lessons": 32
        },
        {
            "course_id": 302,
            "course_name": "Java Development Masterclass",
            "instructor_name": "Neha Gupta",
            "category": "Programming",
            "duration": "4 Months",
            "price": 18000,
            "level": "Intermediate",
            "lessons": 28
        },
        {
            "course_id": 303,
            "course_name": "React JS Complete Guide",
            "instructor_name": "John Doe",
            "category": "Development",
            "duration": "3 Months",
            "price": 15000,
            "level": "Beginner",
            "lessons": 20
        },
        {
            "course_id": 304,
            "course_name": "AWS Cloud Practitioner",
            "instructor_name": "Rahul Joshi",
            "category": "Cloud Computing",
            "duration": "5 Months",
            "price": 20000,
            "level": "Advanced",
            "lessons": 26
        },
        {
            "course_id": 305,
            "course_name": "Generative AI & LLM Engineering",
            "instructor_name": "John Doe",
            "category": "Development",
            "duration": "4 Months",
            "price": 28000,
            "level": "Advanced",
            "lessons": 30
        },
        {
            "course_id": 306,
            "course_name": "Data Science & Machine Learning",
            "instructor_name": "Neha Gupta",
            "category": "Programming",
            "duration": "6 Months",
            "price": 24000,
            "level": "Intermediate",
            "lessons": 35
        },
        {
            "course_id": 307,
            "course_name": "DevOps & Kubernetes Masterclass",
            "instructor_name": "Rahul Joshi",
            "category": "Cloud Computing",
            "duration": "5 Months",
            "price": 22000,
            "level": "Advanced",
            "lessons": 28
        },
        {
            "course_id": 308,
            "course_name": "UI/UX Design Fundamentals",
            "instructor_name": "John Doe",
            "category": "Development",
            "duration": "3 Months",
            "price": 12000,
            "level": "Beginner",
            "lessons": 18
        }
    ]
    for c in courses:
        try:
            db.add_course(c)
            print(f"Added course {c['course_name']}")
        except Exception as e:
            print(f"Course add error: {e}")
        
    # 4. Add Enrollment (Rahul Sharma to Python Full Stack)
    enrollment_data = {
        "enrollment_id": 401,
        "student_name": "Rahul Sharma",
        "course_name": "Python Full Stack Development",
        "enrollment_date": "2026-07-15",
        "payment_status": "Paid",
        "course_status": "Active"
    }
    try:
        db.add_enrollment(enrollment_data)
        print("Added sample enrollment for Rahul Sharma")
    except Exception as e:
        print(f"Enrollment add error: {e}")
        
    # 5. Add Assignment (Rahul Sharma in Python Full Stack Development)
    assignment_data = {
        "assignment_id": 501,
        "course_name": "Python Full Stack Development",
        "student_name": "Rahul Sharma",
        "assignment_title": "Student Management System",
        "submission_date": "2026-07-25",
        "marks": 95,
        "status": "Evaluated"
    }
    try:
        db.add_assignment(assignment_data)
        print("Added sample assignment for Rahul Sharma")
    except Exception as e:
        print(f"Assignment add error: {e}")
        
    print("Database population complete!")

if __name__ == '__main__':
    populate()
