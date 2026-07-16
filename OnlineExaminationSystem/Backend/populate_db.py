import sys
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

import db

def populate():
    print("Initializing examination database and seeding data...")
    db.init_db()
    
    # 1. Student Seeding
    students = db.get_students()
    if not any(s['student_id'] == 101 for s in students):
        print("Inserting sample student Rahul Sharma (ID: 101)")
        db.add_student({
            "student_id": 101,
            "full_name": "Rahul Sharma",
            "email": "rahul@gmail.com",
            "phone": "9876543210",
            "college": "ABC Engineering College",
            "password": "rahul123"
        })
    if not any(s['student_id'] == 102 for s in students):
        print("Inserting sample student Priya Patel (ID: 102)")
        db.add_student({
            "student_id": 102,
            "full_name": "Priya Patel",
            "email": "priya@gmail.com",
            "phone": "9998887776",
            "college": "XYZ Tech Institute",
            "password": "priya123"
        })

    # 2. Examination Seeding
    exams = db.get_exams()
    if not any(e['exam_id'] == 201 for e in exams):
        print("Inserting exam Python Programming Test (ID: 201)")
        db.add_exam({
            "exam_id": 201,
            "exam_title": "Python Programming Test",
            "subject": "Python",
            "duration": 60,
            "total_marks": 100,
            "exam_date": "2026-08-15"
        })
    if not any(e['exam_id'] == 202 for e in exams):
        print("Inserting exam Java SE Basics (ID: 202)")
        db.add_exam({
            "exam_id": 202,
            "exam_title": "Java SE Basics",
            "subject": "Java",
            "duration": 45,
            "total_marks": 100,
            "exam_date": "2026-08-20"
        })
    if not any(e['exam_id'] == 203 for e in exams):
        print("Inserting exam Web Development Quiz (ID: 203)")
        db.add_exam({
            "exam_id": 203,
            "exam_title": "Web Development Quiz",
            "subject": "Web Dev",
            "duration": 30,
            "total_marks": 100,
            "exam_date": "2026-08-25"
        })

    # 3. Question Seeding
    questions = db.get_questions()
    
    # Python Exam Questions (total 5 questions, 20 marks each)
    py_q_data = [
        (301, "Which keyword is used to define a function in Python?", "function", "def", "func", "define", "def", 20),
        (302, "Which of the following is an immutable data type in Python?", "list", "dictionary", "tuple", "set", "tuple", 20),
        (303, "What is the output of print(type([])) in Python?", "<class 'list'>", "<class 'dict'>", "<class 'tuple'>", "<class 'set'>", "<class 'list'>", 20),
        (304, "How do you insert an element at the end of a list?", "add()", "insert()", "push()", "append()", "append()", 20),
        (305, "Which symbol is used for single-line comments in Python?", "//", "#", "/*", "<!--", "#", 20)
    ]
    for qid, q, oa, ob, oc, od, ans, marks in py_q_data:
        if not any(quest['question_id'] == qid for quest in questions):
            print(f"Inserting Python question {qid}")
            db.add_question({
                "question_id": qid,
                "exam_title": "Python Programming Test",
                "question": q,
                "option_a": oa,
                "option_b": ob,
                "option_c": oc,
                "option_d": od,
                "correct_answer": ans,
                "marks": marks
            })

    # Java Exam Questions (2 questions, 50 marks each)
    java_q_data = [
        (306, "Which of the following is not a primitive data type in Java?", "int", "boolean", "String", "char", "String", 50),
        (307, "Which keyword is used to inherit a class in Java?", "implements", "extends", "inherits", "exports", "extends", 50)
    ]
    for qid, q, oa, ob, oc, od, ans, marks in java_q_data:
        if not any(quest['question_id'] == qid for quest in questions):
            print(f"Inserting Java question {qid}")
            db.add_question({
                "question_id": qid,
                "exam_title": "Java SE Basics",
                "question": q,
                "option_a": oa,
                "option_b": ob,
                "option_c": oc,
                "option_d": od,
                "correct_answer": ans,
                "marks": marks
            })

    # Web Dev Questions (2 questions, 50 marks each)
    web_q_data = [
        (308, "What does HTML stand for?", "Hyper Text Markup Language", "High Text Machine Language", "Hyper Tabular Markup Language", "None of these", "Hyper Text Markup Language", 50),
        (309, "Which CSS property controls the text size?", "font-style", "text-size", "font-size", "text-style", "font-size", 50)
    ]
    for qid, q, oa, ob, oc, od, ans, marks in web_q_data:
        if not any(quest['question_id'] == qid for quest in questions):
            print(f"Inserting Web Dev question {qid}")
            db.add_question({
                "question_id": qid,
                "exam_title": "Web Development Quiz",
                "question": q,
                "option_a": oa,
                "option_b": ob,
                "option_c": oc,
                "option_d": od,
                "correct_answer": ans,
                "marks": marks
            })

    # 4. Submission Seeding
    submissions = db.get_submissions()
    if not any(s['submission_id'] == 401 for s in submissions):
        print("Inserting sample submission (ID: 401)")
        db.add_submission({
            "submission_id": 401,
            "student_name": "Rahul Sharma",
            "exam_title": "Python Programming Test",
            "submitted_answers": "Q301:def,Q302:list,Q303:list,Q304:append,Q305:#",
            "score": 80,
            "submitted_at": "2026-08-15 11:30:00"
        })

    # 5. Result Seeding
    results = db.get_results()
    if not any(r['result_id'] == 501 for r in results):
        print("Inserting sample result (ID: 501)")
        db.add_result({
            "result_id": 501,
            "student_name": "Rahul Sharma",
            "exam_title": "Python Programming Test",
            "total_marks": 100,
            "obtained_marks": 80,
            "percentage": 80,
            "result_status": "Pass"
        })
        
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    populate()
