import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'examination.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Students Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            student_id INTEGER PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            college TEXT NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    
    # 2. Examinations Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS exams (
            exam_id INTEGER PRIMARY KEY,
            exam_title TEXT NOT NULL,
            subject TEXT NOT NULL,
            duration INTEGER NOT NULL,
            total_marks INTEGER NOT NULL,
            exam_date TEXT NOT NULL
        )
    ''')
    
    # 3. Questions Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS questions (
            question_id INTEGER PRIMARY KEY,
            exam_title TEXT NOT NULL,
            question TEXT NOT NULL,
            option_a TEXT NOT NULL,
            option_b TEXT NOT NULL,
            option_c TEXT NOT NULL,
            option_d TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            marks INTEGER NOT NULL
        )
    ''')
    
    # 4. Submissions Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS submissions (
            submission_id INTEGER PRIMARY KEY,
            student_name TEXT NOT NULL,
            exam_title TEXT NOT NULL,
            submitted_answers TEXT NOT NULL,
            score INTEGER NOT NULL,
            submitted_at TEXT NOT NULL
        )
    ''')
    
    # 5. Results Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS results (
            result_id INTEGER PRIMARY KEY,
            student_name TEXT NOT NULL,
            exam_title TEXT NOT NULL,
            total_marks INTEGER NOT NULL,
            obtained_marks INTEGER NOT NULL,
            percentage REAL NOT NULL,
            result_status TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

def get_next_id(table_name, id_column, start_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(f"SELECT MAX({id_column}) FROM {table_name}")
    row = cursor.fetchone()
    max_id = row[0]
    conn.close()
    if max_id is None:
        return start_id
    return max_id + 1

# ==================== STUDENT CRUD ====================
def add_student(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    student_id = data.get('student_id')
    if not student_id:
        student_id = get_next_id('students', 'student_id', 101)
    else:
        student_id = int(student_id)
        
    cursor.execute('''
        INSERT INTO students (student_id, full_name, email, phone, college, password)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        student_id,
        data.get('full_name'),
        data.get('email'),
        data.get('phone'),
        data.get('college'),
        data.get('password')
    ))
    conn.commit()
    conn.close()
    return student_id

def get_students():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM students')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_student(student_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE students
        SET full_name = ?, email = ?, phone = ?, college = ?, password = ?
        WHERE student_id = ?
    ''', (
        data.get('full_name'),
        data.get('email'),
        data.get('phone'),
        data.get('college'),
        data.get('password'),
        student_id
    ))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

def delete_student(student_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM students WHERE student_id = ?', (student_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0


# ==================== EXAM CRUD ====================
def add_exam(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    exam_id = data.get('exam_id')
    if not exam_id:
        exam_id = get_next_id('exams', 'exam_id', 201)
    else:
        exam_id = int(exam_id)
        
    cursor.execute('''
        INSERT INTO exams (exam_id, exam_title, subject, duration, total_marks, exam_date)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        exam_id,
        data.get('exam_title'),
        data.get('subject'),
        int(data.get('duration', 0)),
        int(data.get('total_marks', 0)),
        data.get('exam_date')
    ))
    conn.commit()
    conn.close()
    return exam_id

def get_exams():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM exams')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_exam(exam_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE exams
        SET exam_title = ?, subject = ?, duration = ?, total_marks = ?, exam_date = ?
        WHERE exam_id = ?
    ''', (
        data.get('exam_title'),
        data.get('subject'),
        int(data.get('duration', 0)),
        int(data.get('total_marks', 0)),
        data.get('exam_date'),
        exam_id
    ))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

def delete_exam(exam_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM exams WHERE exam_id = ?', (exam_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0


# ==================== QUESTION CRUD ====================
def add_question(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    question_id = data.get('question_id')
    if not question_id:
        question_id = get_next_id('questions', 'question_id', 301)
    else:
        question_id = int(question_id)
        
    cursor.execute('''
        INSERT INTO questions (question_id, exam_title, question, option_a, option_b, option_c, option_d, correct_answer, marks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        question_id,
        data.get('exam_title'),
        data.get('question'),
        data.get('option_a'),
        data.get('option_b'),
        data.get('option_c'),
        data.get('option_d'),
        data.get('correct_answer'),
        int(data.get('marks', 0))
    ))
    conn.commit()
    conn.close()
    return question_id

def get_questions():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM questions')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_question(question_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE questions
        SET exam_title = ?, question = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_answer = ?, marks = ?
        WHERE question_id = ?
    ''', (
        data.get('exam_title'),
        data.get('question'),
        data.get('option_a'),
        data.get('option_b'),
        data.get('option_c'),
        data.get('option_d'),
        data.get('correct_answer'),
        int(data.get('marks', 0)),
        question_id
    ))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

def delete_question(question_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM questions WHERE question_id = ?', (question_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0


# ==================== SUBMISSION CRUD ====================
def add_submission(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    submission_id = data.get('submission_id')
    if not submission_id:
        submission_id = get_next_id('submissions', 'submission_id', 401)
    else:
        submission_id = int(submission_id)
        
    cursor.execute('''
        INSERT INTO submissions (submission_id, student_name, exam_title, submitted_answers, score, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        submission_id,
        data.get('student_name'),
        data.get('exam_title'),
        data.get('submitted_answers'),
        int(data.get('score', 0)),
        data.get('submitted_at')
    ))
    conn.commit()
    conn.close()
    return submission_id

def get_submissions():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM submissions')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_submission(submission_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE submissions
        SET student_name = ?, exam_title = ?, submitted_answers = ?, score = ?, submitted_at = ?
        WHERE submission_id = ?
    ''', (
        data.get('student_name'),
        data.get('exam_title'),
        data.get('submitted_answers'),
        int(data.get('score', 0)),
        data.get('submitted_at'),
        submission_id
    ))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

def delete_submission(submission_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM submissions WHERE submission_id = ?', (submission_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0


# ==================== RESULT CRUD ====================
def add_result(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    result_id = data.get('result_id')
    if not result_id:
        result_id = get_next_id('results', 'result_id', 501)
    else:
        result_id = int(result_id)
        
    total_marks = int(data.get('total_marks', 0))
    obtained_marks = int(data.get('obtained_marks', 0))
    
    # Calculate percentage
    percentage = 0.0
    if total_marks > 0:
        percentage = round((obtained_marks / total_marks) * 100, 2)
    else:
        percentage = float(data.get('percentage', 0.0))
        
    result_status = data.get('result_status')
    if not result_status:
        result_status = 'Pass' if percentage >= 40.0 else 'Fail'
        
    cursor.execute('''
        INSERT INTO results (result_id, student_name, exam_title, total_marks, obtained_marks, percentage, result_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        result_id,
        data.get('student_name'),
        data.get('exam_title'),
        total_marks,
        obtained_marks,
        percentage,
        result_status
    ))
    conn.commit()
    conn.close()
    return result_id

def get_results():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM results')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_result(result_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    total_marks = int(data.get('total_marks', 0))
    obtained_marks = int(data.get('obtained_marks', 0))
    percentage = 0.0
    if total_marks > 0:
        percentage = round((obtained_marks / total_marks) * 100, 2)
    else:
        percentage = float(data.get('percentage', 0.0))
        
    result_status = data.get('result_status')
    if not result_status:
        result_status = 'Pass' if percentage >= 40.0 else 'Fail'
        
    cursor.execute('''
        UPDATE results
        SET student_name = ?, exam_title = ?, total_marks = ?, obtained_marks = ?, percentage = ?, result_status = ?
        WHERE result_id = ?
    ''', (
        data.get('student_name'),
        data.get('exam_title'),
        total_marks,
        obtained_marks,
        percentage,
        result_status,
        result_id
    ))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

def delete_result(result_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM results WHERE result_id = ?', (result_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

# Initialize database tables automatically
init_db()
