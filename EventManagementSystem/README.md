# Event Management with Ticket Booking Platform (Eventify)

A Full Stack Event Management and Ticket Booking Platform where users can search, browse, book tickets (with seat selection charts), process payments, review events, and manage venues/events.

---

## Technical Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6), Fetch API
- **Backend**: Django (Function-Based Views, REST APIs)
- **Database**: SQLite3 (automatically initialized and seeded with sample testing data)

---

## Key Features

1. **User Authentication**: Register/Login endpoints. Roles determine navbar options and dashboard access:
   - **Regular User**: Can search/book tickets, view booking history, and manage reviews.
   - **Organizer**: Can register venues, publish events (validating seat capacity), and track ticket sales/revenue.
   - **Admin**: Has global access to create, view, edit, or delete any record.
2. **Dynamic Search and Filters (Bonus)**: Live event searches on `events.html` by keyword matching, category filters, and cities.
3. **Interactive Seat Selection Layout (Bonus)**: High-fidelity visual seat grid on the booking screen. Clicking seats automatically updates ticket counts, tracks seat numbers, and updates total price calculation.
4. **QR Code Ticket Generation (Bonus)**: Upon successful payment, a digital confirmation receipt displays an auto-generated QR code verifying event, user, seats, price, and transaction ID.
5. **Upcoming Event Reminders (Bonus)**: An automated background check that displays a notification toast when a booked event is scheduled to take place within 7 days of today (mocked to July 19, 2026).
6. **Reviews & Ratings (Bonus)**: Submit 1-5 star ratings and written reviews on the event details page, dynamically displaying average rating metrics.

---

## Project Folder Structure
```
EventManagementSystem/
│
├── Backend/
│   ├── db.py            # SQLite Database Connection, Schema creation & Seeding
│   ├── views.py         # 20 CRUD API views + Authentication & Reviews APIs
│   ├── urls.py          # Django URL routing configs
│   ├── settings.py      # Django base config (CORS headers, SQLite path, App specs)
│   ├── manage.py        # Django CLI runner
│   └── wsgi.py          # WSGI Deployment setup
│
├── Frontend/
│   ├── index.html       # Home page with hero CTA and categories
│   ├── login.html       # Sign-in form (with quick credentials hint)
│   ├── register.html    # Registration form
│   ├── events.html      # Browse all events with live filters
│   ├── event_details.html# Reviews, rating stats, description, & booking trigger
│   ├── booking.html     # Ticket quantity, price totals, and interactive seat selector
│   ├── payment.html     # Simulated payment gateway options & dynamic QR receipt
│   ├── booking_history.html# Upcoming and past bookings listing
│   ├── user_dashboard.html# Attendee total spend, upcoming count, & transaction logs
│   ├── organizer_dashboard.html# Publish events, register venues, & check sales stats
│   ├── admin_dashboard.html# Full moderation tables with CRUD control across all objects
│   ├── style.css        # Modern glassmorphism dark theme CSS stylesheet
│   └── script.js        # Event loops, state trackers, Fetch requests, & UI binders
│
├── test_apis.py         # Programmatic integration test suite verifying all 20+ APIs
└── README.md            # Installation and user guide
```

---

## Database Design & Schemas

- **users**: `user_id` (PK, starts at 101), `full_name`, `email` (Unique), `phone`, `city`, `password`.
- **venues**: `venue_id` (PK, starts at 301), `venue_name` (Unique), `location`, `city`, `capacity`, `contact_person`.
- **events**: `event_id` (PK, starts at 201), `event_name` (Unique), `category`, `organizer_name`, `event_date`, `event_time`, `venue` (FK), `ticket_price`, `available_tickets`.
- **bookings**: `booking_id` (PK, starts at 401), `user_name`, `event_name` (FK), `booking_date`, `number_of_tickets`, `total_amount`, `booking_status` (`Pending`, `Confirmed`, `Cancelled`).
- **payments**: `payment_id` (PK, starts at 501), `booking_id` (FK), `user_name`, `amount`, `payment_method` (`UPI`, `Credit Card`, `Debit Card`, `Net Banking`, `Wallet`), `payment_status` (`Success`, `Pending`, `Failed`), `transaction_id` (Unique), `payment_date`.
- **reviews**: `review_id` (PK, auto-increment), `event_id` (FK), `user_name`, `rating` (1-5), `comment`, `review_date`.

---

## API Endpoints List (Total 22 Endpoints)

### 1. User Management (Module 1)
- `POST /users/add/` - Registers a new user.
- `GET /users/` - Lists all users.
- `PUT /users/update/<id>/` - Updates user profile.
- `DELETE /users/delete/<id>/` - Deletes a user.
- `POST /users/login/` - Authentic credentials verification.

### 2. Event Management (Module 2)
- `POST /events/add/` - Publishes an event (validates that available_tickets <= venue capacity).
- `GET /events/` - Lists events (supports dynamic search, category, and city query filtering).
- `PUT /events/update/<id>/` - Modifies event details.
- `DELETE /events/delete/<id>/` - Cancels/deletes an event.

### 3. Venue Management (Module 3)
- `POST /venues/add/` - Registers a venue.
- `GET /venues/` - Lists all venues.
- `PUT /venues/update/<id>/` - Modifies venue details.
- `DELETE /venues/delete/<id>/` - Removes a venue.

### 4. Ticket Booking Management (Module 4)
- `POST /bookings/add/` - Creates a reservation (defaults to `Pending`, decrements `available_tickets`).
- `GET /bookings/` - Lists bookings (supports `?user_name=...` filtering).
- `PUT /bookings/update/<id>/` - Updates status (e.g. `Cancelled` releases tickets back to event availability).
- `DELETE /bookings/delete/<id>/` - Removes booking and releases tickets.

### 5. Payment Management (Module 5)
- `POST /payments/add/` - Processes payment (Success changes booking status to `Confirmed`, Failure changes to `Cancelled`).
- `GET /payments/` - Lists all payments (supports `?user_name=...` filtering).
- `PUT /payments/update/<id>/` - Modifies payment details.
- `DELETE /payments/delete/<id>/` - Removes a payment record.

### 6. Event Reviews (Bonus)
- `POST /events/reviews/add/` - Submits a review/rating.
- `GET /events/reviews/<id>/` - Fetches reviews and ratings for an event.

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
This initializes the database `db.sqlite3` and seeds the tables with sample data (Rahul Sharma, Tech Innovation Summit 2026, Shilpakala Vedika, Bangalore Convention Center, etc.) automatically.

### 3. Run Automated Tests
Open a separate terminal and verify the backend endpoints using the automated test suite:
```bash
python test_apis.py
```

### 4. Launch the Frontend
Simply open `Frontend/index.html` directly in any web browser, or use a local static file server to browse.

---

## Sample Testing Accounts
To log in and view different dashboard options, use these accounts:
1. **Regular Attendee Role**:
   - Email: `rahul@gmail.com`
   - Password: `rahul123`
2. **Event Organizer Role**:
   - Email: `organizer@gmail.com`
   - Password: `org123`
3. **Platform Administrator Role**:
   - Email: `admin@gmail.com`
   - Password: `admin123`
