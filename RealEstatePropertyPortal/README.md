# EliteHomes - Real Estate Property Portal

EliteHomes is a full-stack real estate property portal where property owners and administrators can manage property listings, customers can search and view properties, schedule property visits, and submit inquiries. The platform simplifies property transactions, inquiries, and booking tracking.

The application uses **HTML5**, **CSS3 (Vanilla HSL-based)**, and **JavaScript (ES6)** for the front end, integrating with a **Django REST API** backend using the **Fetch API**. Data is persisted in a local **SQLite** database.

---

## 🛠 Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6), Fetch API, Leaflet.js (Interactive Maps)
- **Backend**: Django REST APIs (Function-Based Views)
- **Database**: SQLite3

---

## 📁 Expected Folder Structure
```
RealEstatePropertyPortal/
│
├── Backend/
│     db.py              # SQLite Schema Declarations, CRUD Queries, and Seeding
│     views.py           # Django REST views & CORS wrappers
│     urls.py            # URL mappings
│     settings.py        # Django config settings
│     manage.py          # Django execution utility
│     wsgi.py            # WSGI deployment specs
│     test_apis.py       # Automated endpoint test suite
│
└── Frontend/
      index.html         # Homepage, quick search & comparison matrix
      login.html         # User Authentication (Customer & Admin)
      register.html      # Customer Sign up
      properties.html    # Listing page with advanced filters
      property_details.html # Gallery, Leaflet Maps, and forms widget
      bookings.html      # Visit scheduling forms & booking list
      inquiries.html     # Inquiry submission & status tracker
      customer_dashboard.html # Wishlist, visit lists, profile editor
      admin_dashboard.html # Tables for Properties, Agents, Bookings, Customers
      style.css          # Styling stylesheet
      script.js          # Fetch integrations and UI handlers
```

---

## 🚀 Running the Project Locally

### 1. Start the Django Backend Server
From the root of the `RealEstatePropertyPortal` folder, run:
```bash
python Backend/manage.py runserver
```
The server will automatically initialize `real_estate.db`, seed the sample test datasets, and start listening on `http://127.0.0.1:8000/`.

### 2. Run Automated API Tests
Ensure the server is running on port 8000, then execute:
```bash
python Backend/test_apis.py
```
This runs 20+ test assertions matching all CRUD endpoints and prints the pass/fail matrix.

### 3. Open the Frontend Application
Navigate to `http://127.0.0.1:8000/` in your browser. The landing page serves files dynamically from the Django server.

---

## 🔑 Pre-Seeded Accounts & Credentials
For ease of testing, the database is pre-seeded with the following credentials:

### 1. Portal Administrator
- **Username / Email**: `admin`
- **Password**: `admin123`
- *Access Link*: Redirects to `admin_dashboard.html`

### 2. Registered Customer
- **Username / Email**: `rahul@gmail.com`
- **Password**: `rahul123`
- *Access Link*: Redirects to `customer_dashboard.html`

---

## 🛰 REST API Documentation

### 👥 Module 1: Customer Management
- **POST** `/customers/add/` : Register a customer profile.
- **GET** `/customers/` : Retrieve all registered customer profiles.
- **PUT** `/customers/update/<int:id>/` : Update a customer's record.
- **DELETE** `/customers/delete/<int:id>/` : Delete a customer's profile.

### 🏠 Module 2: Property Management
- **POST** `/properties/add/` : Create a new property listing.
- **GET** `/properties/` : Fetch all property listings.
- **PUT** `/properties/update/<int:id>/` : Update property details.
- **DELETE** `/properties/delete/<int:id>/` : Delete a property listing.

### 👔 Module 3: Property Agent Management
- **POST** `/agents/add/` : Register a new agent.
- **GET** `/agents/` : List all active agents.
- **PUT** `/agents/update/<int:id>/` : Update an agent's specialization or details.
- **DELETE** `/agents/delete/<int:id>/` : Remove an agent from directory.

### 📅 Module 4: Property Visit Booking
- **POST** `/bookings/add/` : Schedule a property visit.
- **GET** `/bookings/` : Fetch scheduled visits (filter using query `?customer_name=X`).
- **PUT** `/bookings/update/<int:id>/` : Modify status (`Scheduled`, `Completed`, `Cancelled`).
- **DELETE** `/bookings/delete/<int:id>/` : Remove a booking log.

### 📧 Module 5: Inquiry Management
- **POST** `/inquiries/add/` : Submit an inquiry.
- **GET** `/inquiries/` : List submitted inquiries (filter using query `?customer_name=X`).
- **PUT** `/inquiries/update/<int:id>/` : Update inquiry response status (`Pending`, `Responded`, `Closed`).
- **DELETE** `/inquiries/delete/<int:id>/` : Delete an inquiry record.

### ⭐ Wishlist & Authentication APIs (Premium Features)
- **POST** `/favorites/add/` : Save property to a customer's favorite list.
- **DELETE** `/favorites/delete/<int:customer_id>/<int:property_id>/` : Remove property from favorites list.
- **GET** `/favorites/<int:customer_id>/` : Retrieve all saved properties for a customer.
- **POST** `/auth/login/` : Validate credentials and return user role + session data.

---

## 🌟 Premium Features Integrated (Bonus Marks)
1. **Property Search with Advanced Filters**: Interactive sidebar filters for price limits, area limits, BHK count, type, location, and status.
2. **Property Image Gallery / Carousel**: Fully responsive sliding carousels with auto-scroll and manual controls on property details view.
3. **Favorite (Wishlist) Properties**: Persistence of favorited properties in the SQLite database, synced directly with user profile.
4. **Interactive Leaflet Maps Integration**: Embeds maps dynamically showing locations of properties without third-party key billing.
5. **Property Comparison Matrix Drawer**: Side-drawer component that holds up to 3 selected properties and compares features in a side-by-side modal.
