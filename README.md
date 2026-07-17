# Island Booking System (IBS)

An ultra-premium, full-stack Island Vacation & Resort Booking platform. The backend is powered by **Django REST APIs** with an **SQLite database**, while the frontend delivers a high-fidelity, responsive user experience utilizing semantic **HTML5**, **CSS3 (Custom Glassmorphic Design)**, and **ES6 JavaScript (Fetch API)**.

---

## Features

- **Guest Portal**: Browse featured islands, live search destinations, and view popular travel packages.
- **Customer Registration & Login**: Full authentication process for travel consumers.
- **Customer Dashboard**: Track trip configurations, view payment receipt histories, and update user profiles.
- **Interactive Planner & Booking Checkout**: Custom traveler configuration with dynamic cost calculations, secure payment options, and invoice logs.
- **Comprehensive Admin Control Panel**: Complete CRUD interfaces (Create, Read, Update, Delete) to manage:
  - Customers
  - Islands
  - Resorts & Packages
  - Bookings
  - Payments

---

## Folder Structure

```
IslandBookingSystem/
│
├── Backend/
│   ├── db.py                 # SQLite database initializer and CRUD functions
│   ├── views.py              # Django Function-Based Views (CORS and CSRF handled)
│   ├── urls.py               # 20 required API endpoint routes
│   ├── settings.py           # Flat Django settings configuration
│   ├── manage.py             # Django management entrypoint
│   ├── wsgi.py               # WSGI server entrypoint
│   ├── seed_db.py            # Automated testing database seeder
│   └── island_booking.db     # SQLite Database File
│
└── Frontend/
    ├── index.html            # Landing / Home Page
    ├── login.html            # Customer / Admin Sign-in Page
    ├── register.html         # Customer Registration Page
    ├── islands.html          # Browse Islands Page
    ├── packages.html         # Browse Packages Page
    ├── booking.html          # Traveler Details & Cost Calculator
    ├── payment.html          # Checkout & Transaction Gateway
    ├── customer_dashboard.html # Client Invoices & Travel Ledger
    ├── admin_dashboard.html  # Full CRUD database tables & forms
    ├── style.css             # Ocean Glassmorphism Stylesheet
    └── script.js             # Shared Fetch API handlers & state utils
```

---

## Installation & Setup

### 1. Prerequisites
Ensure you have **Python 3.x** and **Django** installed on your system:
```bash
pip install django
```

### 2. Seeding testing data
Run the automatic seeder script to initialize tables and insert sample test records:
```bash
cd Backend
python seed_db.py
```

### 3. Launching the Backend Server
Start the Django development server on port `8000`:
```bash
python manage.py runserver 127.0.0.1:8000
```
The server will start listening at `http://127.0.0.1:8000/`.

### 4. Running the Frontend
Simply open `Frontend/index.html` in any web browser. No compilation or node server is required!

---

## Testing Credentials

### Admin Login
- **Email**: `admin@ibs.com`
- **Password**: `admin123`

### Customer Profile (Sample Seeding)
- **Email**: `rahul@gmail.com`
- **Password**: `rahul123`

---

## API Endpoints (20 Total)

### Customers
- `POST /customers/add/`
- `GET /customers/`
- `PUT /customers/update/<id>/`
- `DELETE /customers/delete/<id>/`

### Islands
- `POST /islands/add/`
- `GET /islands/`
- `PUT /islands/update/<id>/`
- `DELETE /islands/delete/<id>/`

### Resort & Packages
- `POST /packages/add/`
- `GET /packages/`
- `PUT /packages/update/<id>/`
- `DELETE /packages/delete/<id>/`

### Bookings
- `POST /bookings/add/`
- `GET /bookings/`
- `PUT /bookings/update/<id>/`
- `DELETE /bookings/delete/<id>/`

### Payments
- `POST /payments/add/`
- `GET /payments/`
- `PUT /payments/update/<id>/`
- `DELETE /payments/delete/<id>/`
