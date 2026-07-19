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
# PASSENGER MODULE
# =====================================================================

@csrf_exempt
def passenger_add(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=450)
    data = parse_json(request)
    
    full_name = data.get('full_name')
    email = data.get('email')
    phone = data.get('phone')
    nationality = data.get('nationality')
    passport_number = data.get('passport_number')
    password = data.get('password')
    
    if not (full_name and email and password):
        return JsonResponse({'error': 'Missing required fields (full_name, email, password)'}, status=400)
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    # Check if passenger already exists
    cursor.execute("SELECT * FROM passengers WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return JsonResponse({'error': 'Passenger with this email already exists'}, status=400)
        
    next_id = db.get_next_id('passengers', 'passenger_id', 101)
    try:
        cursor.execute(
            """INSERT INTO passengers (passenger_id, full_name, email, phone, nationality, passport_number, password)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (next_id, full_name, email, phone, nationality, passport_number, password)
        )
        conn.commit()
        cursor.execute("SELECT * FROM passengers WHERE passenger_id = ?", (next_id,))
        passenger = cursor.fetchone()
        conn.close()
        return JsonResponse(passenger, status=201)
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def passenger_list(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method is allowed'}, status=450)
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT passenger_id, full_name, email, phone, nationality, passport_number FROM passengers")
    passengers = cursor.fetchall()
    conn.close()
    return JsonResponse(passengers, safe=False)

@csrf_exempt
def passenger_update(request, id):
    if request.method != 'PUT':
        return JsonResponse({'error': 'Only PUT method is allowed'}, status=450)
    data = parse_json(request)
    
    full_name = data.get('full_name')
    email = data.get('email')
    phone = data.get('phone')
    nationality = data.get('nationality')
    passport_number = data.get('passport_number')
    password = data.get('password')
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM passengers WHERE passenger_id = ?", (id,))
    passenger = cursor.fetchone()
    if not passenger:
        conn.close()
        return JsonResponse({'error': 'Passenger not found'}, status=404)
        
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
    if nationality is not None:
        updates.append("nationality = ?")
        params.append(nationality)
    if passport_number is not None:
        updates.append("passport_number = ?")
        params.append(passport_number)
    if password is not None:
        updates.append("password = ?")
        params.append(password)
        
    if not updates:
        conn.close()
        return JsonResponse({'error': 'No fields provided to update'}, status=400)
        
    params.append(id)
    query = f"UPDATE passengers SET {', '.join(updates)} WHERE passenger_id = ?"
    
    try:
        cursor.execute(query, tuple(params))
        conn.commit()
        cursor.execute("SELECT passenger_id, full_name, email, phone, nationality, passport_number FROM passengers WHERE passenger_id = ?", (id,))
        updated_passenger = cursor.fetchone()
        conn.close()
        return JsonResponse(updated_passenger)
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def passenger_delete(request, id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Only DELETE method is allowed'}, status=450)
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM passengers WHERE passenger_id = ?", (id,))
    if not cursor.fetchone():
        conn.close()
        return JsonResponse({'error': 'Passenger not found'}, status=404)
        
    try:
        cursor.execute("DELETE FROM passengers WHERE passenger_id = ?", (id,))
        conn.commit()
        conn.close()
        return JsonResponse({'message': 'Passenger deleted successfully'})
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def passenger_login(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=450)
    data = parse_json(request)
    email = data.get('email')
    password = data.get('password')
    
    if not (email and password):
        return JsonResponse({'error': 'Email and Password are required'}, status=400)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT passenger_id, full_name, email, phone, nationality, passport_number FROM passengers WHERE email = ? AND password = ?", (email, password))
    passenger = cursor.fetchone()
    conn.close()
    
    if passenger:
        # Determine role based on email/prefix (simplifying role management)
        role = 'Passenger'
        if 'admin' in email:
            role = 'Admin'
        passenger['role'] = role
        return JsonResponse(passenger)
    else:
        return JsonResponse({'error': 'Invalid credentials'}, status=401)


# =====================================================================
# SHIP MODULE
# =====================================================================

@csrf_exempt
def ship_add(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=450)
    data = parse_json(request)
    
    ship_name = data.get('ship_name')
    ship_type = data.get('ship_type')
    capacity = data.get('capacity')
    operator_name = data.get('operator_name')
    status = data.get('status')
    
    if not (ship_name and ship_type and capacity is not None and operator_name and status):
        return JsonResponse({'error': 'Missing required fields'}, status=400)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM ships WHERE ship_name = ?", (ship_name,))
    if cursor.fetchone():
        conn.close()
        return JsonResponse({'error': 'Ship name already exists'}, status=400)

    next_id = db.get_next_id('ships', 'ship_id', 201)
    try:
        cursor.execute(
            """INSERT INTO ships (ship_id, ship_name, ship_type, capacity, operator_name, status)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (next_id, ship_name, ship_type, int(capacity), operator_name, status)
        )
        conn.commit()
        cursor.execute("SELECT * FROM ships WHERE ship_id = ?", (next_id,))
        ship = cursor.fetchone()
        conn.close()
        return JsonResponse(ship, status=201)
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def ship_list(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method is allowed'}, status=450)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ships")
    ships = cursor.fetchall()
    conn.close()
    return JsonResponse(ships, safe=False)

@csrf_exempt
def ship_update(request, id):
    if request.method != 'PUT':
        return JsonResponse({'error': 'Only PUT method is allowed'}, status=450)
    data = parse_json(request)
    
    ship_name = data.get('ship_name')
    ship_type = data.get('ship_type')
    capacity = data.get('capacity')
    operator_name = data.get('operator_name')
    status = data.get('status')
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM ships WHERE ship_id = ?", (id,))
    if not cursor.fetchone():
        conn.close()
        return JsonResponse({'error': 'Ship not found'}, status=404)

    updates = []
    params = []
    if ship_name is not None:
        updates.append("ship_name = ?")
        params.append(ship_name)
    if ship_type is not None:
        updates.append("ship_type = ?")
        params.append(ship_type)
    if capacity is not None:
        updates.append("capacity = ?")
        params.append(int(capacity))
    if operator_name is not None:
        updates.append("operator_name = ?")
        params.append(operator_name)
    if status is not None:
        updates.append("status = ?")
        params.append(status)
        
    if not updates:
        conn.close()
        return JsonResponse({'error': 'No fields provided to update'}, status=400)
        
    params.append(id)
    query = f"UPDATE ships SET {', '.join(updates)} WHERE ship_id = ?"
    
    try:
        cursor.execute(query, tuple(params))
        conn.commit()
        cursor.execute("SELECT * FROM ships WHERE ship_id = ?", (id,))
        updated_ship = cursor.fetchone()
        conn.close()
        return JsonResponse(updated_ship)
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def ship_delete(request, id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Only DELETE method is allowed'}, status=450)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM ships WHERE ship_id = ?", (id,))
    if not cursor.fetchone():
        conn.close()
        return JsonResponse({'error': 'Ship not found'}, status=404)
        
    try:
        cursor.execute("DELETE FROM ships WHERE ship_id = ?", (id,))
        conn.commit()
        conn.close()
        return JsonResponse({'message': 'Ship deleted successfully'})
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)


# =====================================================================
# ROUTE & SCHEDULE MODULE
# =====================================================================

@csrf_exempt
def schedule_add(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=450)
    data = parse_json(request)
    
    ship_name = data.get('ship_name')
    source_port = data.get('source_port')
    destination_port = data.get('destination_port')
    departure_date = data.get('departure_date')
    departure_time = data.get('departure_time')
    arrival_date = data.get('arrival_date')
    arrival_time = data.get('arrival_time')
    fare = data.get('fare')
    
    if not (ship_name and source_port and destination_port and departure_date and departure_time and arrival_date and arrival_time and fare is not None):
        return JsonResponse({'error': 'Missing required fields'}, status=400)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    # Validate Ship exists
    cursor.execute("SELECT * FROM ships WHERE ship_name = ?", (ship_name,))
    if not cursor.fetchone():
        conn.close()
        return JsonResponse({'error': f"Ship '{ship_name}' does not exist."}, status=400)
        
    next_id = db.get_next_id('schedules', 'schedule_id', 301)
    try:
        cursor.execute(
            """INSERT INTO schedules (schedule_id, ship_name, source_port, destination_port, departure_date, departure_time, arrival_date, arrival_time, fare)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (next_id, ship_name, source_port, destination_port, departure_date, departure_time, arrival_date, arrival_time, float(fare))
        )
        conn.commit()
        cursor.execute("SELECT * FROM schedules WHERE schedule_id = ?", (next_id,))
        schedule = cursor.fetchone()
        conn.close()
        return JsonResponse(schedule, status=201)
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def schedule_list(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method is allowed'}, status=450)
        
    source = request.GET.get('source')
    destination = request.GET.get('destination')
    date = request.GET.get('date')
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM schedules"
    filters = []
    params = []
    
    if source:
        filters.append("source_port LIKE ?")
        params.append(f"%{source}%")
    if destination:
        filters.append("destination_port LIKE ?")
        params.append(f"%{destination}%")
    if date:
        filters.append("departure_date = ?")
        params.append(date)
        
    if filters:
        query += " WHERE " + " AND ".join(filters)
        
    cursor.execute(query, tuple(params))
    schedules = cursor.fetchall()
    conn.close()
    return JsonResponse(schedules, safe=False)

@csrf_exempt
def schedule_update(request, id):
    if request.method != 'PUT':
        return JsonResponse({'error': 'Only PUT method is allowed'}, status=450)
    data = parse_json(request)
    
    ship_name = data.get('ship_name')
    source_port = data.get('source_port')
    destination_port = data.get('destination_port')
    departure_date = data.get('departure_date')
    departure_time = data.get('departure_time')
    arrival_date = data.get('arrival_date')
    arrival_time = data.get('arrival_time')
    fare = data.get('fare')
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM schedules WHERE schedule_id = ?", (id,))
    if not cursor.fetchone():
        conn.close()
        return JsonResponse({'error': 'Schedule not found'}, status=404)
        
    updates = []
    params = []
    if ship_name is not None:
        updates.append("ship_name = ?")
        params.append(ship_name)
    if source_port is not None:
        updates.append("source_port = ?")
        params.append(source_port)
    if destination_port is not None:
        updates.append("destination_port = ?")
        params.append(destination_port)
    if departure_date is not None:
        updates.append("departure_date = ?")
        params.append(departure_date)
    if departure_time is not None:
        updates.append("departure_time = ?")
        params.append(departure_time)
    if arrival_date is not None:
        updates.append("arrival_date = ?")
        params.append(arrival_date)
    if arrival_time is not None:
        updates.append("arrival_time = ?")
        params.append(arrival_time)
    if fare is not None:
        updates.append("fare = ?")
        params.append(float(fare))
        
    if not updates:
        conn.close()
        return JsonResponse({'error': 'No fields to update'}, status=400)
        
    params.append(id)
    query = f"UPDATE schedules SET {', '.join(updates)} WHERE schedule_id = ?"
    
    try:
        cursor.execute(query, tuple(params))
        conn.commit()
        cursor.execute("SELECT * FROM schedules WHERE schedule_id = ?", (id,))
        updated = cursor.fetchone()
        conn.close()
        return JsonResponse(updated)
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def schedule_delete(request, id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Only DELETE method is allowed'}, status=450)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM schedules WHERE schedule_id = ?", (id,))
    if not cursor.fetchone():
        conn.close()
        return JsonResponse({'error': 'Schedule not found'}, status=404)
        
    try:
        cursor.execute("DELETE FROM schedules WHERE schedule_id = ?", (id,))
        conn.commit()
        conn.close()
        return JsonResponse({'message': 'Schedule deleted successfully'})
    except Exception as e:
        conn.close()
        return JsonResponse({'error': str(e)}, status=500)


# =====================================================================
# BOOKING MODULE
# =====================================================================

@csrf_exempt
def booking_add(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=450)
    data = parse_json(request)
    
    passenger_name = data.get('passenger_name')
    ship_name = data.get('ship_name')
    cabin_type = data.get('cabin_type')
    journey_date = data.get('journey_date')
    source_port = data.get('source_port')
    destination_port = data.get('destination_port')
    
    if not (passenger_name and ship_name and cabin_type and journey_date and source_port and destination_port):
        return JsonResponse({'error': 'Missing required fields'}, status=400)
        
    # Get base fare from schedule list
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        """SELECT fare FROM schedules 
           WHERE ship_name = ? AND source_port = ? AND destination_port = ? AND departure_date = ?""",
        (ship_name, source_port, destination_port, journey_date)
    )
    sched = cursor.fetchone()
    if not sched:
        conn.close()
        return JsonResponse({'error': 'No matching schedule voyage found'}, status=404)
        
    # Calculate cabin multiplier
    multiplier = 1.0
    if cabin_type == 'Deluxe':
        multiplier = 1.4
    elif cabin_type == 'Suite':
        multiplier = 2.0
    elif cabin_type == 'Family Cabin':
        multiplier = 1.8
    elif cabin_type == 'VIP Cabin':
        multiplier = 3.0
        
    total_amount = sched['fare'] * multiplier
    
    # Check ship capacity
    cursor.execute("SELECT capacity FROM ships WHERE ship_name = ?", (ship_name,))
    ship_cap = cursor.fetchone()
    if not ship_cap:
        conn.close()
        return JsonResponse({'error': 'Ship details not found'}, status=404)
        
    # Check current active bookings for this voyage
    cursor.execute(
        "SELECT COUNT(*) FROM bookings WHERE ship_name = ? AND journey_date = ? AND booking_status != 'Cancelled'",
        (ship_name, journey_date)
    )
    booked_count = cursor.fetchone()['COUNT(*)']
    
    booking_status = 'Confirmed' if booked_count < ship_cap['capacity'] else 'Waiting'
    
    next_id = db.get_next_id('bookings', 'booking_id', 401)
    try:
        cursor.execute(
            """INSERT INTO bookings (booking_id, passenger_name, ship_name, cabin_type, journey_date, source_port, destination_port, total_amount, booking_status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (next_id, passenger_name, ship_name, cabin_type, journey_date, source_port, destination_port, total_amount, booking_status)
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
        
    passenger_name = request.GET.get('passenger_name')
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT b.*, s.departure_time, s.arrival_date, s.arrival_time 
        FROM bookings b
        LEFT JOIN schedules s ON b.ship_name = s.ship_name 
          AND b.source_port = s.source_port 
          AND b.destination_port = s.destination_port 
          AND b.journey_date = s.departure_date
    """
    params = []
    if passenger_name:
        query += " WHERE b.passenger_name = ?"
        params.append(passenger_name)
        
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
        conn.commit()
        cursor.execute("SELECT * FROM bookings WHERE booking_id = ?", (id,))
        updated = cursor.fetchone()
        conn.close()
        return JsonResponse(updated)
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
    if not cursor.fetchone():
        conn.close()
        return JsonResponse({'error': 'Booking not found'}, status=404)
        
    try:
        cursor.execute("DELETE FROM bookings WHERE booking_id = ?", (id,))
        conn.commit()
        conn.close()
        return JsonResponse({'message': 'Booking deleted successfully'})
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
    passenger_name = data.get('passenger_name')
    amount = data.get('amount')
    payment_method = data.get('payment_method')
    payment_status = data.get('payment_status') # 'Success', 'Pending', 'Failed'
    transaction_id = data.get('transaction_id')
    payment_date = data.get('payment_date')
    
    if not (booking_id is not None and passenger_name and amount is not None and payment_method and payment_status and transaction_id and payment_date):
        return JsonResponse({'error': 'Missing required fields'}, status=400)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM bookings WHERE booking_id = ?", (booking_id,))
    if not cursor.fetchone():
        conn.close()
        return JsonResponse({'error': 'Booking details not found'}, status=404)
        
    next_id = db.get_next_id('payments', 'payment_id', 501)
    try:
        cursor.execute(
            """INSERT INTO payments (payment_id, booking_id, passenger_name, amount, payment_method, payment_status, transaction_id, payment_date)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (next_id, int(booking_id), passenger_name, float(amount), payment_method, payment_status, transaction_id, payment_date)
        )
        
        # Confirm booking on payment success
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
        
    passenger_name = request.GET.get('passenger_name')
    
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM payments"
    params = []
    if passenger_name:
        query += " WHERE passenger_name = ?"
        params.append(passenger_name)
        
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
        return JsonResponse({'error': 'Payment record not found'}, status=404)
        
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
        if payment_status == 'Success':
            cursor.execute("UPDATE bookings SET booking_status = 'Confirmed' WHERE booking_id = ?", (payment['booking_id'],))
        elif payment_status == 'Failed':
            cursor.execute("UPDATE bookings SET booking_status = 'Cancelled' WHERE booking_id = ?", (payment['booking_id'],))
            
        conn.commit()
        cursor.execute("SELECT * FROM payments WHERE payment_id = ?", (id,))
        updated = cursor.fetchone()
        conn.close()
        return JsonResponse(updated)
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
# SHIP REVIEWS (Bonus Feature)
# =====================================================================

@csrf_exempt
def review_add(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=450)
    data = parse_json(request)
    
    ship_id = data.get('ship_id')
    passenger_name = data.get('passenger_name')
    rating = data.get('rating')
    comment = data.get('comment')
    review_date = data.get('review_date')
    
    if not (ship_id is not None and passenger_name and rating is not None and review_date):
        return JsonResponse({'error': 'Missing required fields'}, status=400)
        
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "INSERT INTO reviews (ship_id, passenger_name, rating, comment, review_date) VALUES (?, ?, ?, ?, ?)",
            (int(ship_id), passenger_name, int(rating), comment, review_date)
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
    
    cursor.execute("SELECT * FROM reviews WHERE ship_id = ? ORDER BY review_id DESC", (id,))
    reviews = cursor.fetchall()
    conn.close()
    return JsonResponse(reviews, safe=False)
