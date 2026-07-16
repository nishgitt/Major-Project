# Online Examination System (Examly)

Educational institutions and organizations increasingly conduct examinations online to streamline assessments, reduce paperwork, and generate instant results. **Examly** is a full-stack educational portal designed for creating, taking, evaluating, and compiling examinations online.

This project was built for the **Python-FSD Major Project 16**.

---

## Features

1. **Student Management**: Register student profiles, manage login sessions, and track institution attributes.
2. **Examination Management**: Schedule tests with specific dates, durations, and subjects.
3. **Question Management**: Create and link multiple-choice questions (MCQs) with point weights to exam schedules.
4. **Interactive Exam Session**: Responsive exam screen featuring question shufflers, palettes, and active timers.
5. **Results Compilation**: Instant grade compile logs, correct option review sheets, and PDF report downloads.
6. **Administration Dashboard**: Complete CRUD interfaces for Students, Exams, Questions, Submissions, and Results.
7. **Bonus Capabilities**:
   - Circular SVG Countdown Timer with warning alerts.
   - Question shuffling algorithm.
   - Auto-submit triggers on countdown expiration.
   - GPA and percentage leaderboards.
   - PDF scorecard download using `jsPDF`.

---

## Technology Stack

- **Frontend**: HTML5, CSS3 (Outfit typography, glassmorphism, responsive styles), JavaScript (ES6 Fetch APIs).
- **Backend**: Django (Function-Based Views, REST APIs).
- **Database**: SQLite3.

---

## Directory Structure

```text
OnlineExaminationSystem/
│
├── Backend/
│   ├── db.py            # SQLite database initialization & CRUD wrappers
│   ├── views.py         # Django REST API view functions
│   ├── urls.py          # REST API endpoints routing
│   ├── settings.py      # Django project settings
│   ├── manage.py        # Django console controller
│   ├── wsgi.py          # WSGI server entry hook
│   ├── populate_db.py   # Seeding data script
│   └── test_apis.py     # Automated API tests suite
│
└── Frontend/
    ├── index.html       # Homepage portal gateway
    ├── login.html       # Role-switching Authentication
    ├── register.html    # Student account registration
    ├── exams.html       # Active exams catalog
    ├── exam.html        # Interactive test page
    ├── results.html     # Scorecards & reviews sheet
    ├── student_dashboard.html  # Student stats panel
    ├── admin_dashboard.html    # Full CRUD control panels
    ├── style.css        # Curated UI styles
    └── script.js        # DOM router and Fetch operations
```

---

## Installation & Launch

### Prerequisites
- Python 3.8+
- Django 4.0+

### Setup
1. Clone the repository and navigate to the project directory:
   ```bash
   cd Major-Project/OnlineExaminationSystem/
   ```

2. Seed the database with the pre-configured sample testing data:
   ```bash
   python Backend/populate_db.py
   ```

3. Launch the Django server:
   ```bash
   python Backend/manage.py runserver
   ```
   The backend endpoints will be available at `http://127.0.0.1:8000/`.

4. Serve the Frontend:
   Double-click `Frontend/index.html` to open the portal in your browser, or serve it using any simple local static server (e.g. Live Server).

---

## REST API Specifications

The system implements 20 standard CRUD endpoints matching the project spec:

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Students** | `POST` | `/students/add/` | Add student register |
| | `GET` | `/students/` | List all students |
| | `PUT` | `/students/update/<id>/` | Edit student info |
| | `DELETE`| `/students/delete/<id>/` | Remove student profile |
| **Exams** | `POST` | `/exams/add/` | Schedule exam |
| | `GET` | `/exams/` | List scheduled exams |
| | `PUT` | `/exams/update/<id>/` | Update exam meta |
| | `DELETE`| `/exams/delete/<id>/` | Remove exam schedule |
| **Questions**| `POST` | `/questions/add/` | Add question |
| | `GET` | `/questions/` | List questions |
| | `PUT` | `/questions/update/<id>/` | Edit question |
| | `DELETE`| `/questions/delete/<id>/` | Delete question |
| **Submissions**| `POST`| `/submissions/add/` | Submit exam answers |
| | `GET` | `/submissions/` | Retrieve attempts log |
| | `PUT` | `/submissions/update/<id>/` | Edit submission record |
| | `DELETE`| `/submissions/delete/<id>/` | Delete submission record |
| **Results** | `POST` | `/results/add/` | Log exam result |
| | `GET` | `/results/` | List all scores |
| | `PUT` | `/results/update/<id>/` | Edit score meta |
| | `DELETE`| `/results/delete/<id>/` | Delete result scorecard |

---

## Running Backend Verification Tests

The test suite runs standard Django Client requests to assert status codes and output formats:
```bash
python Backend/test_apis.py
```
This tests all 20 API pathways automatically.
