import db

def populate():
    print("Populating testing data...")
    
    # 1. Add Instructor
    instructor_data = {
        "instructor_id": 201,
        "instructor_name": "Saran Velmurugan",
        "specialization": "Full Stack Development",
        "experience": 5,
        "email": "trainer@gmail.com",
        "phone": "9876543211"
    }
    try:
        db.add_instructor(instructor_data)
        print("Added sample instructor Saran Velmurugan")
    except Exception as e:
        print(f"Instructor skip/error: {e}")
        
    # 2. Add Student
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
        print(f"Student skip/error: {e}")
        
    # 3. Add Course
    course_data = {
        "course_id": 301,
        "course_name": "Python Full Stack",
        "instructor_name": "Saran Velmurugan",
        "category": "Programming",
        "duration": "6 Months",
        "price": 25000,
        "level": "Beginner"
    }
    try:
        db.add_course(course_data)
        print("Added sample course Python Full Stack")
    except Exception as e:
        print(f"Course skip/error: {e}")
        
    # 4. Add Enrollment
    enrollment_data = {
        "enrollment_id": 401,
        "student_name": "Rahul Sharma",
        "course_name": "Python Full Stack",
        "enrollment_date": "2026-07-15",
        "payment_status": "Paid",
        "course_status": "Active"
    }
    try:
        db.add_enrollment(enrollment_data)
        print("Added sample enrollment for Rahul Sharma")
    except Exception as e:
        print(f"Enrollment skip/error: {e}")
        
    # 5. Add Assignment
    assignment_data = {
        "assignment_id": 501,
        "course_name": "Python Full Stack",
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
        print(f"Assignment skip/error: {e}")
        
    print("Database population complete!")

if __name__ == '__main__':
    populate()
