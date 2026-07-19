# Ship Booking System (OceanWave)

A Full Stack Ship Booking and Cruise Discovery System where passengers can search routes, reserve luxury cabins using an interactive deck map selector, process checkout payments, print QR boarding passes, review cruises, and manage voyage profiles. Administrators can manage the entire maritime inventory of vessels, ports, fares, and bookings.

---

## Technical Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6), Fetch API
- **Backend**: Django (Function-Based Views, REST APIs)
- **Database**: SQLite3 (automatically initialized and seeded with sample testing data)

---

## Key Features

1. **User Authentication & Profiles**: Passenger profile registration, details updates, and secure login verification.
2. **Interactive Deck Cabin Plan Picker (Bonus)**: High-fidelity visual deck plan selector. Passengers select specific cabin slots. Fare pricing is calculated dynamically based on cabin category multipliers (Economy: 1.0x, Deluxe: 1.4x, Suite: 2.0x, Family Cabin: 1.8x, VIP Cabin: 3.0x).
3. **QR Boarding Pass Generation (Bonus)**: Confirming checkouts generates a boarding pass containing cabin codes, passenger passports, ship details, and transaction IDs encoded inside a QR verification image.
4. **Voyage Weather & Departure Reminders (Bonus)**: Background reminders alert passengers when a confirmed trip is within 7 days, alongside real-time maritime weather clearance notifications.
5. **Vessel Reviews & Cruise Ratings (Bonus)**: Rating scales (1-5 stars) and passenger comment boards dynamically displayed on ship itineraries.
6. **Double Booking Protections**: Audits schedule availability and updates remaining ticket numbers in real time, preventing capacity overlaps.

---

## Folder Structure
```
ShipBookingSystem/
│
├── Backend/
│   ├── db.py            # SQLite schema configuration & baseline data seeding
│   ├── views.py         # 20 CRUD API views + Login & Reviews handlers
│   ├── urls.py          # Django URL patterns
│   ├── settings.py      # Django base config (CORS headers, SQLite paths, etc.)
│   ├── manage.py        # Django CLI runner
│   └── wsgi.py          # WSGI Deployment setup
│
├── Frontend/
│   ├── index.html       # Home page (Hero, search voyage forms, featured lists)
│   ├── login.html       # Passenger authentication form
│   ├── register.html    # Registration form
│   ├── ships.html       # Vessel routes gallery with port filters
│   ├── ship_details.html# Ship metadata, deck cabins list, and review feeds
│   ├── booking.html     # Ticket summaries with interactive deck cabin plan layouts
│   ├── payment.html     # Secure checkouts and issued QR Boarding Passes
│   ├── booking_history.html# Upcoming and past voyage history panels
│   ├── passenger_dashboard.html# Passenger stats widgets (spend trackers, trip counts)
│   ├── admin_dashboard.html# Admin control tables (CRUD operations across all tables)
│   ├── style.css        # Luxury marine glassmorphism CSS style sheet
│   └── script.js        # Event loop triggers, cabin pickers, and Fetch API routines
│
├── test_apis.py         # Automated API tests verifying all 20+ routes
└── README.md            # Installation and user guide
```

---

## Database Design & Schemas

- **passengers**: `passenger_id` (PK, starts at 101), `full_name`, `email` (Unique), `phone`, `nationality`, `passport_number`, `password`.
- **ships**: `ship_id` (PK, starts at 201), `ship_name` (Unique), `ship_type` (`Cruise Ship`, `Ferry`, `Cargo Passenger Ship`, `Luxury Yacht`, `River Cruise`), `capacity`, `operator_name`, `status` (`Active`, `Maintenance`, `Inactive`).
- **schedules**: `schedule_id` (PK, starts at 301), `ship_name` (FK), `source_port`, `destination_port`, `departure_date`, `departure_time`, `arrival_date`, `arrival_time`, `fare` (base rate).
- **bookings**: `booking_id` (PK, starts at 401), `passenger_name`, `ship_name` (FK), `cabin_type` (`Economy`, `Deluxe`, `Suite`, `Family Cabin`, `VIP Cabin`), `journey_date`, `source_port`, `destination_port`, `total_amount`, `booking_status` (`Confirmed`, `Waiting`, `Cancelled`).
- **payments**: `payment_id` (PK, starts at 501), `booking_id` (FK), `passenger_name`, `amount`, `payment_method` (`UPI`, `Credit Card`, `Debit Card`, `Net Banking`, `Wallet`), `payment_status` (`Success`, `Pending`, `Failed`), `transaction_id` (Unique), `payment_date`.
- **reviews**: `review_id` (PK, auto-increment), `ship_id` (FK), `passenger_name`, `rating` (1-5), `comment`, `review_date`.

---

## API Endpoints List (Total 22 Endpoints)

### 1. Passenger Management (Module 1)
- `POST /passengers/add/` - Registers a new passenger.
- `GET /passengers/` - Lists all passengers.
- `PUT /passengers/update/<id>/` - Updates profile details.
- `DELETE /passengers/delete/<id>/` - Removes a profile.
- `POST /passengers/login/` - Verifies login credentials.

### 2. Ship Management (Module 2)
- `POST /ships/add/` - Adds a vessel to the active fleet.
- `GET /ships/` - Lists all fleet vessels.
- `PUT /ships/update/<id>/` - Modifies vessel details.
- `DELETE /ships/delete/<id>/` - Removes a vessel.

### 3. Route & Schedule Management (Module 3)
- `POST /schedules/add/` - Publishes a voyage schedule.
- `GET /schedules/` - Lists schedules (supports dynamic port and date query filtering).
- `PUT /schedules/update/<id>/` - Updates scheduling details.
- `DELETE /schedules/delete/<id>/` - Deletes a schedule.

### 4. Cabin/Ticket Booking Management (Module 4)
- `POST /bookings/add/` - Reserves a cabin (calculates multiplier pricing, checks ship capacity, sets booking status).
- `GET /bookings/` - Lists bookings (supports `?passenger_name=...` filtering).
- `PUT /bookings/update/<id>/` - Modifies booking state.
- `DELETE /bookings/delete/<id>/` - Cancels booking and releases cabin.

### 5. Payment Management (Module 5)
- `POST /payments/add/` - Records transaction (Success confirms bookings, Failure cancels bookings).
- `GET /payments/` - Lists payments (supports `?passenger_name=...` filtering).
- `PUT /payments/update/<id>/` - Updates payment records.
- `DELETE /payments/delete/<id>/` - Deletes a payment record.

### 6. Ship Reviews (Bonus)
- `POST /ships/reviews/add/` - Submits stars rating & comment.
- `GET /ships/reviews/<id>/` - Fetches reviews.

---

## How to Set Up and Run

### 1. Prerequisite Checks
Ensure Python (3.8+) and Django (6.0.6+) are installed on your host system:
```bash
pip install django django-cors-headers
```

### 2. Start the Backend API Server
Navigate to the `Backend` directory and start the Django development server:
```bash
cd Backend
python manage.py runserver 8000
```
This initializes the database `db.sqlite3` and seeds the tables with default sample data (Rahul Sharma, Ocean Paradise, Chennai Port, Port Blair, etc.) automatically.

### 3. Run Automated Tests
Verify all API routes using the programmatic test suite:
```bash
python test_apis.py
```

### 4. Launch the Frontend
Simply open `Frontend/index.html` directly in any web browser to interact.

---

## Sample Testing Accounts
1. **Passenger Account**:
   - Email: `rahul@gmail.com`
   - Password: `rahul123`
2. **System Administrator Account**:
   - Email: `admin@gmail.com`
   - Password: `admin123`
