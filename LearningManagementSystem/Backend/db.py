import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lms.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Student Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            student_id INTEGER PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL,
            qualification TEXT NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    
    # 2. Instructor Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS instructors (
            instructor_id INTEGER PRIMARY KEY,
            instructor_name TEXT NOT NULL,
            specialization TEXT NOT NULL,
            experience INTEGER NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL
        )
    ''')
    
    # 3. Course Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS courses (
            course_id INTEGER PRIMARY KEY,
            course_name TEXT NOT NULL,
            instructor_name TEXT NOT NULL,
            category TEXT NOT NULL,
            duration TEXT NOT NULL,
            price REAL NOT NULL,
            level TEXT NOT NULL,
            lessons INTEGER NOT NULL DEFAULT 20
        )
    ''')
    
    # 4. Enrollment Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS enrollments (
            enrollment_id INTEGER PRIMARY KEY,
            student_name TEXT NOT NULL,
            course_name TEXT NOT NULL,
            enrollment_date TEXT NOT NULL,
            payment_status TEXT NOT NULL,
            course_status TEXT NOT NULL
        )
    ''')
    
    # 5. Assignment Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS assignments (
            assignment_id INTEGER PRIMARY KEY,
            course_name TEXT NOT NULL,
            student_name TEXT NOT NULL,
            assignment_title TEXT NOT NULL,
            submission_date TEXT NOT NULL,
            marks INTEGER NOT NULL,
            status TEXT NOT NULL
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
        INSERT INTO students (student_id, full_name, email, phone, qualification, password)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        student_id,
        data.get('full_name'),
        data.get('email'),
        data.get('phone'),
        data.get('qualification'),
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
        SET full_name = ?, email = ?, phone = ?, qualification = ?, password = ?
        WHERE student_id = ?
    ''', (
        data.get('full_name'),
        data.get('email'),
        data.get('phone'),
        data.get('qualification'),
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


# ==================== INSTRUCTOR CRUD ====================
def add_instructor(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    instructor_id = data.get('instructor_id')
    if not instructor_id:
        instructor_id = get_next_id('instructors', 'instructor_id', 201)
    else:
        instructor_id = int(instructor_id)
        
    cursor.execute('''
        INSERT INTO instructors (instructor_id, instructor_name, specialization, experience, email, phone)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        instructor_id,
        data.get('instructor_name'),
        data.get('specialization'),
        int(data.get('experience', 0)),
        data.get('email'),
        data.get('phone')
    ))
    conn.commit()
    conn.close()
    return instructor_id

def get_instructors():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM instructors')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_instructor(instructor_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE instructors
        SET instructor_name = ?, specialization = ?, experience = ?, email = ?, phone = ?
        WHERE instructor_id = ?
    ''', (
        data.get('instructor_name'),
        data.get('specialization'),
        int(data.get('experience', 0)),
        data.get('email'),
        data.get('phone'),
        instructor_id
    ))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

def delete_instructor(instructor_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM instructors WHERE instructor_id = ?', (instructor_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0


# ==================== COURSE CRUD ====================
def add_course(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    course_id = data.get('course_id')
    if not course_id:
        course_id = get_next_id('courses', 'course_id', 301)
    else:
        course_id = int(course_id)
        
    cursor.execute('''
        INSERT INTO courses (course_id, course_name, instructor_name, category, duration, price, level, lessons)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        course_id,
        data.get('course_name'),
        data.get('instructor_name'),
        data.get('category'),
        data.get('duration'),
        float(data.get('price', 0.0)),
        data.get('level'),
        int(data.get('lessons', 20))
    ))
    conn.commit()
    conn.close()
    return course_id

def get_courses():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM courses')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_course(course_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE courses
        SET course_name = ?, instructor_name = ?, category = ?, duration = ?, price = ?, level = ?, lessons = ?
        WHERE course_id = ?
    ''', (
        data.get('course_name'),
        data.get('instructor_name'),
        data.get('category'),
        data.get('duration'),
        float(data.get('price', 0.0)),
        data.get('level'),
        int(data.get('lessons', 20)),
        course_id
    ))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

def delete_course(course_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM courses WHERE course_id = ?', (course_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0


# ==================== ENROLLMENT CRUD ====================
def add_enrollment(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    enrollment_id = data.get('enrollment_id')
    if not enrollment_id:
        enrollment_id = get_next_id('enrollments', 'enrollment_id', 401)
    else:
        enrollment_id = int(enrollment_id)
        
    cursor.execute('''
        INSERT INTO enrollments (enrollment_id, student_name, course_name, enrollment_date, payment_status, course_status)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        enrollment_id,
        data.get('student_name'),
        data.get('course_name'),
        data.get('enrollment_date'),
        data.get('payment_status', 'Pending'),
        data.get('course_status', 'Active')
    ))
    conn.commit()
    conn.close()
    return enrollment_id

def get_enrollments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM enrollments')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_enrollment(enrollment_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE enrollments
        SET student_name = ?, course_name = ?, enrollment_date = ?, payment_status = ?, course_status = ?
        WHERE enrollment_id = ?
    ''', (
        data.get('student_name'),
        data.get('course_name'),
        data.get('enrollment_date'),
        data.get('payment_status'),
        data.get('course_status'),
        enrollment_id
    ))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

def delete_enrollment(enrollment_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM enrollments WHERE enrollment_id = ?', (enrollment_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0


# ==================== ASSIGNMENT CRUD ====================
def add_assignment(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    assignment_id = data.get('assignment_id')
    if not assignment_id:
        assignment_id = get_next_id('assignments', 'assignment_id', 501)
    else:
        assignment_id = int(assignment_id)
        
    cursor.execute('''
        INSERT INTO assignments (assignment_id, course_name, student_name, assignment_title, submission_date, marks, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        assignment_id,
        data.get('course_name'),
        data.get('student_name'),
        data.get('assignment_title'),
        data.get('submission_date'),
        int(data.get('marks', 0)),
        data.get('status', 'Pending')
    ))
    conn.commit()
    conn.close()
    return assignment_id

def get_assignments():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM assignments')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_assignment(assignment_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE assignments
        SET course_name = ?, student_name = ?, assignment_title = ?, submission_date = ?, marks = ?, status = ?
        WHERE assignment_id = ?
    ''', (
        data.get('course_name'),
        data.get('student_name'),
        data.get('assignment_title'),
        data.get('submission_date'),
        int(data.get('marks', 0)),
        data.get('status'),
        assignment_id
    ))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

def delete_assignment(assignment_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM assignments WHERE assignment_id = ?', (assignment_id,))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

# Auto initialize database on import
init_db()
