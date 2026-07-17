import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'job_portal.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Candidates Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS candidates (
            candidate_id INTEGER PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL,
            qualification TEXT NOT NULL,
            skills TEXT NOT NULL,
            experience INTEGER NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    
    # 2. Employers Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS employers (
            employer_id INTEGER PRIMARY KEY,
            company_name TEXT NOT NULL,
            hr_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL,
            location TEXT NOT NULL,
            industry TEXT NOT NULL,
            password TEXT
        )
    ''')
    
    # 3. Jobs Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            job_id INTEGER PRIMARY KEY,
            job_title TEXT NOT NULL,
            company_name TEXT NOT NULL,
            location TEXT NOT NULL,
            job_type TEXT NOT NULL,
            experience_required INTEGER NOT NULL,
            salary REAL NOT NULL,
            last_date TEXT NOT NULL
        )
    ''')
    
    # 4. Applications Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS applications (
            application_id INTEGER PRIMARY KEY,
            candidate_name TEXT NOT NULL,
            company_name TEXT NOT NULL,
            job_title TEXT NOT NULL,
            applied_date TEXT NOT NULL,
            resume TEXT NOT NULL,
            application_status TEXT NOT NULL
        )
    ''')
    
    # 5. Interviews Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS interviews (
            interview_id INTEGER PRIMARY KEY,
            candidate_name TEXT NOT NULL,
            company_name TEXT NOT NULL,
            interview_date TEXT NOT NULL,
            interview_time TEXT NOT NULL,
            interview_mode TEXT NOT NULL,
            interview_status TEXT NOT NULL
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

# ==================== CANDIDATE CRUD ====================
def add_candidate(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    candidate_id = data.get('candidate_id')
    if not candidate_id:
        candidate_id = get_next_id('candidates', 'candidate_id', 101)
    
    cursor.execute('''
        INSERT INTO candidates (candidate_id, full_name, email, phone, qualification, skills, experience, password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        candidate_id,
        data.get('full_name'),
        data.get('email'),
        data.get('phone'),
        data.get('qualification'),
        data.get('skills'),
        data.get('experience'),
        data.get('password')
    ))
    conn.commit()
    conn.close()
    return candidate_id

def get_candidates():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM candidates')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_candidate(candidate_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT 1 FROM candidates WHERE candidate_id = ?', (candidate_id,))
    if not cursor.fetchone():
        conn.close()
        return False
        
    cursor.execute('''
        UPDATE candidates
        SET full_name = ?, email = ?, phone = ?, qualification = ?, skills = ?, experience = ?, password = ?
        WHERE candidate_id = ?
    ''', (
        data.get('full_name'),
        data.get('email'),
        data.get('phone'),
        data.get('qualification'),
        data.get('skills'),
        data.get('experience'),
        data.get('password'),
        candidate_id
    ))
    conn.commit()
    conn.close()
    return True

def delete_candidate(candidate_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT 1 FROM candidates WHERE candidate_id = ?', (candidate_id,))
    if not cursor.fetchone():
        conn.close()
        return False
        
    cursor.execute('DELETE FROM candidates WHERE candidate_id = ?', (candidate_id,))
    conn.commit()
    conn.close()
    return True


# ==================== EMPLOYER CRUD ====================
def add_employer(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    employer_id = data.get('employer_id')
    if not employer_id:
        employer_id = get_next_id('employers', 'employer_id', 201)
    
    cursor.execute('''
        INSERT INTO employers (employer_id, company_name, hr_name, email, phone, location, industry, password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        employer_id,
        data.get('company_name'),
        data.get('hr_name'),
        data.get('email'),
        data.get('phone'),
        data.get('location'),
        data.get('industry'),
        data.get('password', '')  # Password can be empty/optional
    ))
    conn.commit()
    conn.close()
    return employer_id

def get_employers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM employers')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_employer(employer_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT 1 FROM employers WHERE employer_id = ?', (employer_id,))
    if not cursor.fetchone():
        conn.close()
        return False
        
    cursor.execute('''
        UPDATE employers
        SET company_name = ?, hr_name = ?, email = ?, phone = ?, location = ?, industry = ?, password = ?
        WHERE employer_id = ?
    ''', (
        data.get('company_name'),
        data.get('hr_name'),
        data.get('email'),
        data.get('phone'),
        data.get('location'),
        data.get('industry'),
        data.get('password', ''),
        employer_id
    ))
    conn.commit()
    conn.close()
    return True

def delete_employer(employer_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT 1 FROM employers WHERE employer_id = ?', (employer_id,))
    if not cursor.fetchone():
        conn.close()
        return False
        
    cursor.execute('DELETE FROM employers WHERE employer_id = ?', (employer_id,))
    conn.commit()
    conn.close()
    return True


# ==================== JOB CRUD ====================
def add_job(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    job_id = data.get('job_id')
    if not job_id:
        job_id = get_next_id('jobs', 'job_id', 301)
    
    cursor.execute('''
        INSERT INTO jobs (job_id, job_title, company_name, location, job_type, experience_required, salary, last_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        job_id,
        data.get('job_title'),
        data.get('company_name'),
        data.get('location'),
        data.get('job_type'),
        data.get('experience_required'),
        data.get('salary'),
        data.get('last_date')
    ))
    conn.commit()
    conn.close()
    return job_id

def get_jobs():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM jobs')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_job(job_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT 1 FROM jobs WHERE job_id = ?', (job_id,))
    if not cursor.fetchone():
        conn.close()
        return False
        
    cursor.execute('''
        UPDATE jobs
        SET job_title = ?, company_name = ?, location = ?, job_type = ?, experience_required = ?, salary = ?, last_date = ?
        WHERE job_id = ?
    ''', (
        data.get('job_title'),
        data.get('company_name'),
        data.get('location'),
        data.get('job_type'),
        data.get('experience_required'),
        data.get('salary'),
        data.get('last_date'),
        job_id
    ))
    conn.commit()
    conn.close()
    return True

def delete_job(job_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT 1 FROM jobs WHERE job_id = ?', (job_id,))
    if not cursor.fetchone():
        conn.close()
        return False
        
    cursor.execute('DELETE FROM jobs WHERE job_id = ?', (job_id,))
    conn.commit()
    conn.close()
    return True


# ==================== APPLICATION CRUD ====================
def add_application(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    application_id = data.get('application_id')
    if not application_id:
        application_id = get_next_id('applications', 'application_id', 401)
    
    cursor.execute('''
        INSERT INTO applications (application_id, candidate_name, company_name, job_title, applied_date, resume, application_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        application_id,
        data.get('candidate_name'),
        data.get('company_name'),
        data.get('job_title'),
        data.get('applied_date'),
        data.get('resume'),
        data.get('application_status', 'Applied')
    ))
    conn.commit()
    conn.close()
    return application_id

def get_applications():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM applications')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_application(application_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT 1 FROM applications WHERE application_id = ?', (application_id,))
    if not cursor.fetchone():
        conn.close()
        return False
        
    cursor.execute('''
        UPDATE applications
        SET candidate_name = ?, company_name = ?, job_title = ?, applied_date = ?, resume = ?, application_status = ?
        WHERE application_id = ?
    ''', (
        data.get('candidate_name'),
        data.get('company_name'),
        data.get('job_title'),
        data.get('applied_date'),
        data.get('resume'),
        data.get('application_status'),
        application_id
    ))
    conn.commit()
    conn.close()
    return True

def delete_application(application_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT 1 FROM applications WHERE application_id = ?', (application_id,))
    if not cursor.fetchone():
        conn.close()
        return False
        
    cursor.execute('DELETE FROM applications WHERE application_id = ?', (application_id,))
    conn.commit()
    conn.close()
    return True


# ==================== INTERVIEW CRUD ====================
def add_interview(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    interview_id = data.get('interview_id')
    if not interview_id:
        interview_id = get_next_id('interviews', 'interview_id', 501)
    
    cursor.execute('''
        INSERT INTO interviews (interview_id, candidate_name, company_name, interview_date, interview_time, interview_mode, interview_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        interview_id,
        data.get('candidate_name'),
        data.get('company_name'),
        data.get('interview_date'),
        data.get('interview_time'),
        data.get('interview_mode'),
        data.get('interview_status', 'Scheduled')
    ))
    conn.commit()
    conn.close()
    return interview_id

def get_interviews():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM interviews')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_interview(interview_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT 1 FROM interviews WHERE interview_id = ?', (interview_id,))
    if not cursor.fetchone():
        conn.close()
        return False
        
    cursor.execute('''
        UPDATE interviews
        SET candidate_name = ?, company_name = ?, interview_date = ?, interview_time = ?, interview_mode = ?, interview_status = ?
        WHERE interview_id = ?
    ''', (
        data.get('candidate_name'),
        data.get('company_name'),
        data.get('interview_date'),
        data.get('interview_time'),
        data.get('interview_mode'),
        data.get('interview_status'),
        interview_id
    ))
    conn.commit()
    conn.close()
    return True

def delete_interview(interview_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT 1 FROM interviews WHERE interview_id = ?', (interview_id,))
    if not cursor.fetchone():
        conn.close()
        return False
        
    cursor.execute('DELETE FROM interviews WHERE interview_id = ?', (interview_id,))
    conn.commit()
    conn.close()
    return True
