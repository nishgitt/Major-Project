# Salon & Spa Booking System

A premium, full-stack online booking workspace for luxury salons and spas, built with a Django REST API backend and a responsive HTML5/CSS3/JavaScript frontend. It features a sleek "Noir & Gold" aesthetic, dynamic stylist availability conflict checking, SMS/Push dashboard notifications, reviews management, and robust admin control panels.

## Features
* **Customer Management**: Customer sign-up, profile updates, and login validation.
* **Service Catalog**: Browse treatments by category, search text, and view price/duration.
* **Stylist Directories**: Show specialist details, experience level, and real-time availability badges.
* **Smart Booking Flow**: Selecting services/stylists with time slot picks that check database conflicts dynamically to prevent double booking.
* **Payment Invoicing**: Credit card, debit card, UPI, and cash simulation flows.
* **Dashboard Control Panels**:
  * **Customer Dashboard**: Track upcoming appointments, billing history, and submit 5-star ratings reviews.
  * **Admin Panel**: Complete CRUD access across Services, Stylists, Customers, Appointments, and Payments.
* **Reminders System**: Alerts customer dashboard if a booked appointment is coming up within 24 hours.

## Technology Stack
* **Frontend**: HTML5, CSS3 (Noir & Gold variables, flexbox, grid, animations), JavaScript (ES6, Fetch API)
* **Backend**: Django REST API (Function-Based Views with CORS preflight handlers)
* **Database**: SQLite3

## Directory Structure
```
SalonSpaBookingSystem/
├── Backend/
│     db.py           # SQLite connection, seeding, and CRUD database helpers
│     views.py        # REST API views & static frontend serving router
│     urls.py         # URL endpoints map
│     settings.py     # Minimal Django settings config
│     manage.py       # Django CLI runner
│     wsgi.py         # Server application entrypoint
│     test_apis.py    # Automated REST API test suite
├── Frontend/
│     index.html      # Landing Page
│     login.html      # Login authentication page
│     register.html   # Customer registration page
│     services.html   # Service list with Search & Category tag filters
│     stylists.html   # Stylists directories
│     booking.html    # Appointment slot selections
│     payment.html    # Secure invoicing simulation
│     customer_dashboard.html  # User portal
│     admin_dashboard.html     # Administration manager tab panels
│     style.css       # Unified design token variables stylesheet
│     script.js       # Unified client-side logic controller
└── README.md
```

## Running the Application

### 1. Prerequisite
Ensure Django is installed:
```bash
pip install django
```

### 2. Startup Server
Navigate to the `Backend` directory and start the server:
```bash
cd Backend
python manage.py runserver 8000
```
Open your browser and navigate to `http://127.0.0.1:8000/` to view the website.

### 3. Run Automated REST API Tests
To execute tests validating all CRUD endpoints:
```bash
cd Backend
python test_apis.py
```
