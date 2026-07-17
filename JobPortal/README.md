# CareerZap - Job Portal Application

CareerZap is a premium, feature-rich Full Stack Job Portal Application. It connects job seekers with employers, letting companies publish vacancies and track candidates, while allowing job seekers to register, upload resumes, customize search queries, and view scheduled interview slots.

The system is developed with a Django REST API backend using custom function-based views (20 CRUD endpoints + auth helpers), an SQLite database, and a modern glassmorphic web frontend built with vanilla HTML5, CSS3 variables, and Javascript Fetch API integration.

## Technology Stack
- **Frontend**: HTML5, CSS3 Custom Properties (CSS variables, flexbox/grid layout), JavaScript (ES6), Fetch API integration.
- **Backend**: Django REST Framework style architecture (minimal Django settings, custom CORS & HTTP method headers validation decorator, function-based views).
- **Database**: SQLite3.

---

## Folder Structure
```
JobPortal/
├── Backend/
│   ├── db.py               # SQLite connection and CRUD methods
│   ├── views.py            # 20 Function-Based REST API endpoints + auth helpers
│   ├── urls.py             # Route URL patterns mapping
│   ├── settings.py         # Minimal Django settings configuration
│   ├── manage.py           # Django entrypoint script
│   ├── populate_db.py      # Seeds SQLite database with sample testing data
│   ├── test_apis.py        # Automated testing script using Django test client
│   └── job_portal.db       # SQLite database file
├── Frontend/
│   ├── index.html          # Landing home page with search bar and featured companies popup
│   ├── login.html          # Unified Candidate, Employer, and Admin login form
│   ├── register.html       # Unified Candidate and Employer registration form
│   ├── jobs.html           # Jobs listings with filters and skill recommendation panel
│   ├── applications.html   # Applications history tracking, resume upload/downloads
│   ├── interviews.html     # Interview slots list and visual interactive calendar view
│   ├── candidate_dashboard.html # Candidate details form, applications/interview status summary
│   ├── employer_dashboard.html  # Employer job publisher, received applications, status updater
│   ├── admin_dashboard.html     # Admin master panel to perform complete CRUD on all tables
│   ├── style.css           # Glassmorphism dark aesthetic stylesheet
│   └── script.js           # AJAX Fetch integration, local storage session and router
└── README.md               # Setup and running instructions
```

---

## Features Implemented
1. **Job Seeker Management**: Profile updates, qualification, technical skills portfolio.
2. **Employer Management**: Industry segmentation, HR partner listings, city locations.
3. **Job Vacancies Management**: Custom posts, experience restrictions, salary filters, deadlines.
4. **Applications Management**: Real-time status modifications (Applied, Shortlisted, Interview Scheduled, Selected, Rejected).
5. **Interview Tracking**: Scheduled slots, Online/Offline interview modes, status monitoring.
6. **Admin Dashboard panel**: Complete master CRUD panel to Add, Edit, or Delete any record across the 5 tables.
7. **Bonus Features**:
   - **Job Search & Advanced Filters**: Multi-criteria search by title, company, location city, job type, and salary.
   - **Resume Upload & Download**: Mock upload/saving CV and dynamic PDF/text generator download link.
   - **Company Profile Overlay**: Interactive profiles modal when clicking on featured company cards.
   - **Visual Interview Calendar**: High-end interactive grid showing interview slots per day.
   - **Job Recommendation Algorithm**: Automated job suggest section matching candidate skills and experience.

---

## Installation and Running Instructions

### Prerequisite
Make sure Python 3.x is installed, along with the `django` library:
```bash
pip install django
```

### 1. Database Seeding
Navigate to the `Backend` directory and populate the database with the pre-configured sample testing data:
```bash
cd Backend
python populate_db.py
```
This initializes the `job_portal.db` SQLite database with the standard candidates, employers, jobs, and scheduled interviews.

### 2. Running API Integration Tests
Execute the unit tests using Django's test Client to verify all 20 CRUD API routes return correct HTTP codes:
```bash
python test_apis.py
```

### 3. Launching Django API Server
Start the local server at port `8000`:
```bash
python manage.py runserver 8000
```
Ensure the backend stays running while testing the frontend so that Fetch API calls succeed.

### 4. Running the Frontend
Double-click `Frontend/index.html` to open it in a browser, or run a local file server inside the `Frontend` directory (e.g. VS Code Live Server or python http server):
```bash
# In the Frontend folder
python -m http.server 3000
```
Open `http://localhost:3000` in your web browser.

---

## Sample Testing Credentials
- **Candidate Account**:
  - Email: `rahul@gmail.com`
  - Password: `rahul123`
- **Employer Account**:
  - Email: `hr@infosys.com`
  - Password: `hr123`
- **Administrator Panel**:
  - Email: `admin@careerzap.com`
  - Password: `admin123`
