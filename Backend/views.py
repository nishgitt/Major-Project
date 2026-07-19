from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import db

# Helper function to read request body
def parse_json(request):
    try:
        return json.loads(request.body)
    except Exception:
        return {}

# =====================================================================
# USER MODULE
# =====================================================================

@csrf_exempt
def user_add(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=450)
    data = parse_json(request)
    
    full_name = data.get('full_name')
    email = data.get('email')
    phone = data.get('phone')
    city = data.get('city')
    password = data.get('password')
    
    if not (full_name and email and password):
        return JsonResponse({'error': 'Missing required fields (full_name, email, password)'}, status=400)
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    # Check if user already exists
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return JsonResponse({'error': 'User with this email already exists'}, status=400)
        
    next_id = db.get_next_id('users', 'user_id', 101)
    try:
        cursor.execute(
            "INSERT INTO users (user_id, full_name, email, phone, city, password) VALUES (?, ?, ?, ?, ?, ?)",
            (next_id, full_name, email, phone, city, password)
        )
        conn.commit()
        cursor.execute("SELECT * FROM users WHERE user_id = ?", (next_id,))
        user = cursor.fetchone()
        conn.close()
        return JsonResponse(user, status=201)
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def user_list(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method is allowed'}, status=450)
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, full_name, email, phone, city FROM users")
    users = cursor.fetchall()
    conn.close()
    return JsonResponse(users, safe=False)

@csrf_exempt
def user_update(request, id):
    if request.method != 'PUT':
        return JsonResponse({'error': 'Only PUT method is allowed'}, status=450)
    data = parse_json(request)
    
    full_name = data.get('full_name')
    email = data.get('email')
    phone = data.get('phone')
    city = data.get('city')
    password = data.get('password')
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute("SELECT * FROM users WHERE user_id = ?", (id,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        return JsonResponse({'error': 'User not found'}, status=404)
        
    # Build dynamic update statement
    updates = []
    params = []
    if full_name is not None:
        updates.append("full_name = ?")
        params.append(full_name)
    if email is not None:
        updates.append("email = ?")
        params.append(email)
    if phone is not None:
        updates.append("phone = ?")
        params.append(phone)
    if city is not None:
        updates.append("city = ?")
        params.append(city)
    if password is not None:
        updates.append("password = ?")
        params.append(password)
        
    if not updates:
        conn.close()
        return JsonResponse({'error': 'No fields provided to update'}, status=400)
        
    params.append(id)
    query = f"UPDATE users SET {', '.join(updates)} WHERE user_id = ?"
    
    try:
        cursor.execute(query, tuple(params))
        conn.commit()
        cursor.execute("SELECT user_id, full_name, email, phone, city FROM users WHERE user_id = ?", (id,))
        updated_user = cursor.fetchone()
        conn.close()
        return JsonResponse(updated_user)
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def user_delete(request, id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Only DELETE method is allowed'}, status=450)
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE user_id = ?", (id,))
    if not cursor.fetchone():
        conn.close()
        return JsonResponse({'error': 'User not found'}, status=404)
        
    try:
        cursor.execute("DELETE FROM users WHERE user_id = ?", (id,))
        conn.commit()
        conn.close()
        return JsonResponse({'message': 'User deleted successfully'})
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def user_login(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=450)
    data = parse_json(request)
    email = data.get('email')
    password = data.get('password')
    
    if not (email and password):
        return JsonResponse({'error': 'Email and Password are required'}, status=400)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, full_name, email, phone, city FROM users WHERE email = ? AND password = ?", (email, password))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        # Determine role based on email/prefix (simplifying role management)
        role = 'User'
        if 'admin' in email:
            role = 'Admin'
        elif 'organizer' in email:
            role = 'Organizer'
        user['role'] = role
        return JsonResponse(user)
    else:
        return JsonResponse({'error': 'Invalid credentials'}, status=401)


# =====================================================================
# EVENT MODULE
# =====================================================================

@csrf_exempt
def event_add(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=450)
    data = parse_json(request)
    
    event_name = data.get('event_name')
    category = data.get('category')
    organizer_name = data.get('organizer_name')
    event_date = data.get('event_date')
    event_time = data.get('event_time')
    venue = data.get('venue')
    ticket_price = data.get('ticket_price')
    available_tickets = data.get('available_tickets')
    
    if not (event_name and category and organizer_name and event_date and event_time and venue and ticket_price is not None and available_tickets is not None):
        return JsonResponse({'error': 'Missing required fields'}, status=400)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    # Validate Venue and Seating Capacity
    cursor.execute("SELECT * FROM venues WHERE venue_name = ?", (venue,))
    venue_data = cursor.fetchone()
    if not venue_data:
        conn.close()
        return JsonResponse({'error': f"Venue '{venue}' does not exist. Please create the venue first."}, status=400)
        
    if int(available_tickets) > int(venue_data['capacity']):
        conn.close()
        return JsonResponse({'error': f"Event ticket capacity ({available_tickets}) cannot exceed venue seating capacity ({venue_data['capacity']})"}, status=400)
        
    # Check duplicate event name
    cursor.execute("SELECT * FROM events WHERE event_name = ?", (event_name,))
    if cursor.fetchone():
        conn.close()
        return JsonResponse({'error': 'Event name already exists'}, status=400)

    next_id = db.get_next_id('events', 'event_id', 201)
    try:
        cursor.execute(
            """INSERT INTO events (event_id, event_name, category, organizer_name, event_date, event_time, venue, ticket_price, available_tickets)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (next_id, event_name, category, organizer_name, event_date, event_time, venue, float(ticket_price), int(available_tickets))
        )
        conn.commit()
        cursor.execute("SELECT * FROM events WHERE event_id = ?", (next_id,))
        event = cursor.fetchone()
        conn.close()
        return JsonResponse(event, status=201)
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def event_list(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method is allowed'}, status=450)
        
    search = request.GET.get('search')
    category = request.GET.get('category')
    city = request.GET.get('city')
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT e.*, v.city as venue_city, v.location as venue_location, v.capacity as venue_capacity, v.contact_person as venue_contact
        FROM events e
        JOIN venues v ON e.venue = v.venue_name
    """
    filters = []
    params = []
    
    if search:
        filters.append("(e.event_name LIKE ? OR e.organizer_name LIKE ? OR e.venue LIKE ?)")
        params.append(f"%{search}%")
        params.append(f"%{search}%")
        params.append(f"%{search}%")
    if category:
        filters.append("e.category = ?")
        params.append(category)
    if city:
        filters.append("v.city LIKE ?")
        params.append(f"%{city}%")
        
    if filters:
        query += " WHERE " + " AND ".join(filters)
        
    cursor.execute(query, tuple(params))
    events = cursor.fetchall()
    conn.close()
    return JsonResponse(events, safe=False)

@csrf_exempt
def event_update(request, id):
    if request.method != 'PUT':
        return JsonResponse({'error': 'Only PUT method is allowed'}, status=450)
    data = parse_json(request)
    
    event_name = data.get('event_name')
    category = data.get('category')
    organizer_name = data.get('organizer_name')
    event_date = data.get('event_date')
    event_time = data.get('event_time')
    venue = data.get('venue')
    ticket_price = data.get('ticket_price')
    available_tickets = data.get('available_tickets')
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM events WHERE event_id = ?", (id,))
    event = cursor.fetchone()
    if not event:
        conn.close()
        return JsonResponse({'error': 'Event not found'}, status=404)
        
    # Check venue capacity if updating venue/tickets
    new_venue = venue if venue is not None else event['venue']
    new_tickets = available_tickets if available_tickets is not None else event['available_tickets']
    
    cursor.execute("SELECT capacity FROM venues WHERE venue_name = ?", (new_venue,))
    venue_data = cursor.fetchone()
    if not venue_data:
        conn.close()
        return JsonResponse({'error': 'Invalid venue name specified'}, status=400)
        
    if int(new_tickets) > int(venue_data['capacity']):
        conn.close()
        return JsonResponse({'error': f"Ticket count ({new_tickets}) exceeds venue seating capacity ({venue_data['capacity']})"}, status=400)

    updates = []
    params = []
    if event_name is not None:
        updates.append("event_name = ?")
        params.append(event_name)
    if category is not None:
        updates.append("category = ?")
        params.append(category)
    if organizer_name is not None:
        updates.append("organizer_name = ?")
        params.append(organizer_name)
    if event_date is not None:
        updates.append("event_date = ?")
        params.append(event_date)
    if event_time is not None:
        updates.append("event_time = ?")
        params.append(event_time)
    if venue is not None:
        updates.append("venue = ?")
        params.append(venue)
    if ticket_price is not None:
        updates.append("ticket_price = ?")
        params.append(float(ticket_price))
    if available_tickets is not None:
        updates.append("available_tickets = ?")
        params.append(int(available_tickets))
        
    if not updates:
        conn.close()
        return JsonResponse({'error': 'No fields provided to update'}, status=400)
        
    params.append(id)
    query = f"UPDATE events SET {', '.join(updates)} WHERE event_id = ?"
    
    try:
        cursor.execute(query, tuple(params))
        conn.commit()
        cursor.execute("SELECT * FROM events WHERE event_id = ?", (id,))
        updated_event = cursor.fetchone()
        conn.close()
        return JsonResponse(updated_event)
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def event_delete(request, id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Only DELETE method is allowed'}, status=450)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM events WHERE event_id = ?", (id,))
    if not cursor.fetchone():
        conn.close()
        return JsonResponse({'error': 'Event not found'}, status=404)
        
    try:
        cursor.execute("DELETE FROM events WHERE event_id = ?", (id,))
        conn.commit()
        conn.close()
        return JsonResponse({'message': 'Event deleted successfully'})
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)


# =====================================================================
# VENUE MODULE
# =====================================================================

@csrf_exempt
def venue_add(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=450)
    data = parse_json(request)
    
    venue_name = data.get('venue_name')
    location = data.get('location')
    city = data.get('city')
    capacity = data.get('capacity')
    contact_person = data.get('contact_person')
    
    if not (venue_name and location and city and capacity is not None and contact_person):
        return JsonResponse({'error': 'Missing required fields'}, status=400)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM venues WHERE venue_name = ?", (venue_name,))
    if cursor.fetchone():
        conn.close()
        return JsonResponse({'error': 'Venue name already exists'}, status=400)
        
    next_id = db.get_next_id('venues', 'venue_id', 301)
    try:
        cursor.execute(
            "INSERT INTO venues (venue_id, venue_name, location, city, capacity, contact_person) VALUES (?, ?, ?, ?, ?, ?)",
            (next_id, venue_name, location, city, int(capacity), contact_person)
        )
        conn.commit()
        cursor.execute("SELECT * FROM venues WHERE venue_id = ?", (next_id,))
        venue = cursor.fetchone()
        conn.close()
        return JsonResponse(venue, status=201)
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def venue_list(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method is allowed'}, status=450)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM venues")
    venues = cursor.fetchall()
    conn.close()
    return JsonResponse(venues, safe=False)

@csrf_exempt
def venue_update(request, id):
    if request.method != 'PUT':
        return JsonResponse({'error': 'Only PUT method is allowed'}, status=450)
    data = parse_json(request)
    
    venue_name = data.get('venue_name')
    location = data.get('location')
    city = data.get('city')
    capacity = data.get('capacity')
    contact_person = data.get('contact_person')
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM venues WHERE venue_id = ?", (id,))
    if not cursor.fetchone():
        conn.close()
        return JsonResponse({'error': 'Venue not found'}, status=404)
        
    updates = []
    params = []
    if venue_name is not None:
        updates.append("venue_name = ?")
        params.append(venue_name)
    if location is not None:
        updates.append("location = ?")
        params.append(location)
    if city is not None:
        updates.append("city = ?")
        params.append(city)
    if capacity is not None:
        updates.append("capacity = ?")
        params.append(int(capacity))
    if contact_person is not None:
        updates.append("contact_person = ?")
        params.append(contact_person)
        
    if not updates:
        conn.close()
        return JsonResponse({'error': 'No fields to update'}, status=400)
        
    params.append(id)
    query = f"UPDATE venues SET {', '.join(updates)} WHERE venue_id = ?"
    
    try:
        cursor.execute(query, tuple(params))
        conn.commit()
        cursor.execute("SELECT * FROM venues WHERE venue_id = ?", (id,))
        updated_venue = cursor.fetchone()
        conn.close()
        return JsonResponse(updated_venue)
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def venue_delete(request, id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Only DELETE method is allowed'}, status=450)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM venues WHERE venue_id = ?", (id,))
    if not cursor.fetchone():
        conn.close()
        return JsonResponse({'error': 'Venue not found'}, status=404)
        
    try:
        cursor.execute("DELETE FROM venues WHERE venue_id = ?", (id,))
        conn.commit()
        conn.close()
        return JsonResponse({'message': 'Venue deleted successfully'})
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)


# =====================================================================
# TICKET BOOKING MODULE
# =====================================================================

@csrf_exempt
def booking_add(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=450)
    data = parse_json(request)
    
    user_name = data.get('user_name')
    event_name = data.get('event_name')
    booking_date = data.get('booking_date')
    number_of_tickets = data.get('number_of_tickets')
    
    if not (user_name and event_name and booking_date and number_of_tickets is not None):
        return JsonResponse({'error': 'Missing required fields'}, status=400)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    # Get Event details
    cursor.execute("SELECT * FROM events WHERE event_name = ?", (event_name,))
    event = cursor.fetchone()
    if not event:
        conn.close()
        return JsonResponse({'error': f"Event '{event_name}' not found"}, status=404)
        
    num_tix = int(number_of_tickets)
    if num_tix <= 0:
        conn.close()
        return JsonResponse({'error': 'Number of tickets must be positive'}, status=400)
        
    if event['available_tickets'] < num_tix:
        conn.close()
        return JsonResponse({'error': f"Only {event['available_tickets']} tickets available"}, status=400)
        
    total_amount = num_tix * event['ticket_price']
    next_id = db.get_next_id('bookings', 'booking_id', 401)
    
    # Bookings initialize to "Pending" until Payment Success is called
    booking_status = data.get('booking_status', 'Pending')
    
    try:
        # Insert Booking
        cursor.execute(
            """INSERT INTO bookings (booking_id, user_name, event_name, booking_date, number_of_tickets, total_amount, booking_status)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (next_id, user_name, event_name, booking_date, num_tix, total_amount, booking_status)
        )
        
        # Decrement Available Tickets
        cursor.execute(
            "UPDATE events SET available_tickets = available_tickets - ? WHERE event_name = ?",
            (num_tix, event_name)
        )
        
        conn.commit()
        cursor.execute("SELECT * FROM bookings WHERE booking_id = ?", (next_id,))
        booking = cursor.fetchone()
        conn.close()
        return JsonResponse(booking, status=201)
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def booking_list(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method is allowed'}, status=450)
        
    user_name = request.GET.get('user_name')
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT b.*, e.event_date, e.event_time, e.venue, e.event_id
        FROM bookings b
        JOIN events e ON b.event_name = e.event_name
    """
    params = []
    if user_name:
        query += " WHERE b.user_name = ?"
        params.append(user_name)
        
    cursor.execute(query, tuple(params))
    bookings = cursor.fetchall()
    conn.close()
    return JsonResponse(bookings, safe=False)

@csrf_exempt
def booking_update(request, id):
    if request.method != 'PUT':
        return JsonResponse({'error': 'Only PUT method is allowed'}, status=450)
    data = parse_json(request)
    
    booking_status = data.get('booking_status')
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM bookings WHERE booking_id = ?", (id,))
    booking = cursor.fetchone()
    if not booking:
        conn.close()
        return JsonResponse({'error': 'Booking not found'}, status=404)
        
    old_status = booking['booking_status']
    
    updates = []
    params = []
    if booking_status is not None:
        updates.append("booking_status = ?")
        params.append(booking_status)
        
    if not updates:
        conn.close()
        return JsonResponse({'error': 'No fields provided to update'}, status=400)
        
    params.append(id)
    query = f"UPDATE bookings SET {', '.join(updates)} WHERE booking_id = ?"
    
    try:
        cursor.execute(query, tuple(params))
        
        # If status changes to 'Cancelled', restore tickets to event
        if booking_status == 'Cancelled' and old_status != 'Cancelled':
            cursor.execute(
                "UPDATE events SET available_tickets = available_tickets + ? WHERE event_name = ?",
                (booking['number_of_tickets'], booking['event_name'])
            )
        # If status was 'Cancelled' and is restored, re-decrement
        elif old_status == 'Cancelled' and booking_status in ['Confirmed', 'Pending']:
            # Double check ticket availability
            cursor.execute("SELECT available_tickets FROM events WHERE event_name = ?", (booking['event_name'],))
            event_avail = cursor.fetchone()['available_tickets']
            if event_avail < booking['number_of_tickets']:
                conn.rollback()
                conn.close()
                return JsonResponse({'error': f"Cannot restore booking. Only {event_avail} tickets left."}, status=400)
                
            cursor.execute(
                "UPDATE events SET available_tickets = available_tickets - ? WHERE event_name = ?",
                (booking['number_of_tickets'], booking['event_name'])
            )
            
        conn.commit()
        cursor.execute("SELECT * FROM bookings WHERE booking_id = ?", (id,))
        updated_booking = cursor.fetchone()
        conn.close()
        return JsonResponse(updated_booking)
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def booking_delete(request, id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Only DELETE method is allowed'}, status=450)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM bookings WHERE booking_id = ?", (id,))
    booking = cursor.fetchone()
    if not booking:
        conn.close()
        return JsonResponse({'error': 'Booking not found'}, status=404)
        
    try:
        # If booking is deleted and wasn't cancelled, restore event tickets
        if booking['booking_status'] != 'Cancelled':
            cursor.execute(
                "UPDATE events SET available_tickets = available_tickets + ? WHERE event_name = ?",
                (booking['number_of_tickets'], booking['event_name'])
            )
            
        cursor.execute("DELETE FROM bookings WHERE booking_id = ?", (id,))
        conn.commit()
        conn.close()
        return JsonResponse({'message': 'Booking deleted and tickets restored'})
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)


# =====================================================================
# PAYMENT MODULE
# =====================================================================

@csrf_exempt
def payment_add(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=450)
    data = parse_json(request)
    
    booking_id = data.get('booking_id')
    user_name = data.get('user_name')
    amount = data.get('amount')
    payment_method = data.get('payment_method')
    payment_status = data.get('payment_status') # 'Success', 'Pending', 'Failed'
    transaction_id = data.get('transaction_id')
    payment_date = data.get('payment_date')
    
    if not (booking_id is not None and user_name and amount is not None and payment_method and payment_status and transaction_id and payment_date):
        return JsonResponse({'error': 'Missing required fields'}, status=400)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    # Check if booking exists
    cursor.execute("SELECT * FROM bookings WHERE booking_id = ?", (booking_id,))
    booking = cursor.fetchone()
    if not booking:
        conn.close()
        return JsonResponse({'error': 'Booking not found'}, status=404)
        
    next_id = db.get_next_id('payments', 'payment_id', 501)
    try:
        cursor.execute(
            """INSERT INTO payments (payment_id, booking_id, user_name, amount, payment_method, payment_status, transaction_id, payment_date)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (next_id, int(booking_id), user_name, float(amount), payment_method, payment_status, transaction_id, payment_date)
        )
        
        # Update booking status based on payment success
        if payment_status == 'Success':
            cursor.execute(
                "UPDATE bookings SET booking_status = 'Confirmed' WHERE booking_id = ?",
                (booking_id,)
            )
        elif payment_status == 'Failed':
            cursor.execute(
                "UPDATE bookings SET booking_status = 'Cancelled' WHERE booking_id = ?",
                (booking_id,)
            )
            # Restore event tickets since payment failed
            cursor.execute(
                "UPDATE events SET available_tickets = available_tickets + ? WHERE event_name = ?",
                (booking['number_of_tickets'], booking['event_name'])
            )
            
        conn.commit()
        cursor.execute("SELECT * FROM payments WHERE payment_id = ?", (next_id,))
        payment = cursor.fetchone()
        conn.close()
        return JsonResponse(payment, status=201)
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def payment_list(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method is allowed'}, status=450)
        
    user_name = request.GET.get('user_name')
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM payments"
    params = []
    if user_name:
        query += " WHERE user_name = ?"
        params.append(user_name)
        
    cursor.execute(query, tuple(params))
    payments = cursor.fetchall()
    conn.close()
    return JsonResponse(payments, safe=False)

@csrf_exempt
def payment_update(request, id):
    if request.method != 'PUT':
        return JsonResponse({'error': 'Only PUT method is allowed'}, status=450)
    data = parse_json(request)
    
    payment_status = data.get('payment_status')
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM payments WHERE payment_id = ?", (id,))
    payment = cursor.fetchone()
    if not payment:
        conn.close()
        return JsonResponse({'error': 'Payment not found'}, status=404)
        
    updates = []
    params = []
    if payment_status is not None:
        updates.append("payment_status = ?")
        params.append(payment_status)
        
    if not updates:
        conn.close()
        return JsonResponse({'error': 'No fields to update'}, status=400)
        
    params.append(id)
    query = f"UPDATE payments SET {', '.join(updates)} WHERE payment_id = ?"
    
    try:
        cursor.execute(query, tuple(params))
        
        # If payment is updated to Success, confirm the booking
        if payment_status == 'Success':
            cursor.execute(
                "UPDATE bookings SET booking_status = 'Confirmed' WHERE booking_id = ?",
                (payment['booking_id'],)
            )
        elif payment_status == 'Failed':
            cursor.execute(
                "UPDATE bookings SET booking_status = 'Cancelled' WHERE booking_id = ?",
                (payment['booking_id'],)
            )
            # Retrieve booking info to restore tickets
            cursor.execute("SELECT * FROM bookings WHERE booking_id = ?", (payment['booking_id'],))
            booking = cursor.fetchone()
            if booking and booking['booking_status'] != 'Cancelled':
                cursor.execute(
                    "UPDATE events SET available_tickets = available_tickets + ? WHERE event_name = ?",
                    (booking['number_of_tickets'], booking['event_name'])
                )
                
        conn.commit()
        cursor.execute("SELECT * FROM payments WHERE payment_id = ?", (id,))
        updated_payment = cursor.fetchone()
        conn.close()
        return JsonResponse(updated_payment)
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def payment_delete(request, id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Only DELETE method is allowed'}, status=450)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM payments WHERE payment_id = ?", (id,))
    if not cursor.fetchone():
        conn.close()
        return JsonResponse({'error': 'Payment not found'}, status=404)
        
    try:
        cursor.execute("DELETE FROM payments WHERE payment_id = ?", (id,))
        conn.commit()
        conn.close()
        return JsonResponse({'message': 'Payment deleted successfully'})
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)


# =====================================================================
# EVENT REVIEWS (Bonus Feature)
# =====================================================================

@csrf_exempt
def review_add(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=450)
    data = parse_json(request)
    
    event_id = data.get('event_id')
    user_name = data.get('user_name')
    rating = data.get('rating')
    comment = data.get('comment')
    review_date = data.get('review_date')
    
    if not (event_id is not None and user_name and rating is not None and review_date):
        return JsonResponse({'error': 'Missing required fields'}, status=400)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "INSERT INTO reviews (event_id, user_name, rating, comment, review_date) VALUES (?, ?, ?, ?, ?)",
            (int(event_id), user_name, int(rating), comment, review_date)
        )
        conn.commit()
        conn.close()
        return JsonResponse({'message': 'Review added successfully'}, status=201)
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def review_list(request, id):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method is allowed'}, status=450)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM reviews WHERE event_id = ? ORDER BY review_id DESC", (id,))
    reviews = cursor.fetchall()
    conn.close()
    return JsonResponse(reviews, safe=False)
