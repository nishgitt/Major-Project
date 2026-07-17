import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import db

# Helper function to add CORS headers
def cors_response(data, status=200):
    response = JsonResponse(data, status=status, safe=False)
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

# Handle preflight OPTIONS requests globally or locally
def handle_options(request):
    if request.method == "OPTIONS":
        return cors_response({}, status=200)
    return None

# ================= MODULE 1: CUSTOMERS =================

@csrf_exempt
def customers_list_or_add(request):
    opt = handle_options(request)
    if opt: return opt
    
    if request.method == 'GET':
        customers = db.get_customers()
        return cors_response(customers)
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            # Support both auto-increment or custom ID if passed
            customer_id = data.get('customer_id')
            full_name = data.get('full_name')
            email = data.get('email')
            phone = data.get('phone')
            nationality = data.get('nationality')
            password = data.get('password')
            
            if not (full_name and email and phone and nationality and password):
                return cors_response({"error": "Missing required fields"}, status=400)
                
            res = db.add_customer(full_name, email, phone, nationality, password, customer_id)
            if res["success"]:
                return cors_response({"message": "Customer added successfully", "customer_id": res["id"]}, status=21)
            else:
                return cors_response({"error": res["error"]}, status=400)
        except Exception as e:
            return cors_response({"error": str(e)}, status=400)
            
    return cors_response({"error": "Method not allowed"}, status=405)

@csrf_exempt
def customer_update_or_delete(request, id):
    opt = handle_options(request)
    if opt: return opt
    
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            full_name = data.get('full_name')
            email = data.get('email')
            phone = data.get('phone')
            nationality = data.get('nationality')
            password = data.get('password')
            
            if not (full_name and email and phone and nationality and password):
                return cors_response({"error": "Missing required fields"}, status=400)
                
            res = db.update_customer(int(id), full_name, email, phone, nationality, password)
            if res["success"]:
                return cors_response({"message": "Customer updated successfully"})
            else:
                return cors_response({"error": "Customer not found or update failed"}, status=404)
        except Exception as e:
            return cors_response({"error": str(e)}, status=400)
            
    elif request.method == 'DELETE':
        res = db.delete_customer(int(id))
        if res["success"]:
            return cors_response({"message": "Customer deleted successfully"})
        else:
            return cors_response({"error": "Customer not found or delete failed"}, status=404)
            
    return cors_response({"error": "Method not allowed"}, status=405)


# ================= MODULE 2: ISLANDS =================

@csrf_exempt
def islands_list_or_add(request):
    opt = handle_options(request)
    if opt: return opt
    
    if request.method == 'GET':
        islands = db.get_islands()
        return cors_response(islands)
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            island_id = data.get('island_id')
            island_name = data.get('island_name')
            country = data.get('country')
            description = data.get('description', '')
            climate = data.get('climate', '')
            best_season = data.get('best_season', '')
            image_url = data.get('image_url', '')
            
            if not (island_name and country):
                return cors_response({"error": "Missing required fields"}, status=400)
                
            res = db.add_island(island_name, country, description, climate, best_season, image_url, island_id)
            if res["success"]:
                return cors_response({"message": "Island added successfully", "island_id": res["id"]}, status=21)
            else:
                return cors_response({"error": res["error"]}, status=400)
        except Exception as e:
            return cors_response({"error": str(e)}, status=400)
            
    return cors_response({"error": "Method not allowed"}, status=405)

@csrf_exempt
def island_update_or_delete(request, id):
    opt = handle_options(request)
    if opt: return opt
    
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            island_name = data.get('island_name')
            country = data.get('country')
            description = data.get('description', '')
            climate = data.get('climate', '')
            best_season = data.get('best_season', '')
            image_url = data.get('image_url', '')
            
            if not (island_name and country):
                return cors_response({"error": "Missing required fields"}, status=400)
                
            res = db.update_island(int(id), island_name, country, description, climate, best_season, image_url)
            if res["success"]:
                return cors_response({"message": "Island updated successfully"})
            else:
                return cors_response({"error": "Island not found or update failed"}, status=404)
        except Exception as e:
            return cors_response({"error": str(e)}, status=400)
            
    elif request.method == 'DELETE':
        res = db.delete_island(int(id))
        if res["success"]:
            return cors_response({"message": "Island deleted successfully"})
        else:
            return cors_response({"error": "Island not found or delete failed"}, status=404)
            
    return cors_response({"error": "Method not allowed"}, status=405)


# ================= MODULE 3: RESORTS & PACKAGES =================

@csrf_exempt
def packages_list_or_add(request):
    opt = handle_options(request)
    if opt: return opt
    
    if request.method == 'GET':
        packages = db.get_packages()
        return cors_response(packages)
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            package_id = data.get('package_id')
            island_name = data.get('island_name')
            resort_name = data.get('resort_name')
            package_name = data.get('package_name')
            duration = data.get('duration')
            price = data.get('price')
            included_services = data.get('included_services', '')
            
            if not (island_name and resort_name and package_name and duration and price is not None):
                return cors_response({"error": "Missing required fields"}, status=400)
                
            res = db.add_package(island_name, resort_name, package_name, duration, float(price), included_services, package_id)
            if res["success"]:
                return cors_response({"message": "Package added successfully", "package_id": res["id"]}, status=21)
            else:
                return cors_response({"error": "Failed to add package"}, status=400)
        except Exception as e:
            return cors_response({"error": str(e)}, status=400)
            
    return cors_response({"error": "Method not allowed"}, status=405)

@csrf_exempt
def package_update_or_delete(request, id):
    opt = handle_options(request)
    if opt: return opt
    
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            island_name = data.get('island_name')
            resort_name = data.get('resort_name')
            package_name = data.get('package_name')
            duration = data.get('duration')
            price = data.get('price')
            included_services = data.get('included_services', '')
            
            if not (island_name and resort_name and package_name and duration and price is not None):
                return cors_response({"error": "Missing required fields"}, status=400)
                
            res = db.update_package(int(id), island_name, resort_name, package_name, duration, float(price), included_services)
            if res["success"]:
                return cors_response({"message": "Package updated successfully"})
            else:
                return cors_response({"error": "Package not found or update failed"}, status=404)
        except Exception as e:
            return cors_response({"error": str(e)}, status=400)
            
    elif request.method == 'DELETE':
        res = db.delete_package(int(id))
        if res["success"]:
            return cors_response({"message": "Package deleted successfully"})
        else:
            return cors_response({"error": "Package not found or delete failed"}, status=404)
            
    return cors_response({"error": "Method not allowed"}, status=405)


# ================= MODULE 4: BOOKINGS =================

@csrf_exempt
def bookings_list_or_add(request):
    opt = handle_options(request)
    if opt: return opt
    
    if request.method == 'GET':
        bookings = db.get_bookings()
        return cors_response(bookings)
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            booking_id = data.get('booking_id')
            customer_name = data.get('customer_name')
            island_name = data.get('island_name')
            package_name = data.get('package_name')
            travel_date = data.get('travel_date')
            number_of_people = data.get('number_of_people')
            total_amount = data.get('total_amount')
            booking_status = data.get('booking_status', 'Pending')
            
            if not (customer_name and island_name and package_name and travel_date and number_of_people is not None and total_amount is not None):
                return cors_response({"error": "Missing required fields"}, status=400)
                
            res = db.add_booking(customer_name, island_name, package_name, travel_date, int(number_of_people), float(total_amount), booking_status, booking_id)
            if res["success"]:
                return cors_response({"message": "Booking added successfully", "booking_id": res["id"]}, status=21)
            else:
                return cors_response({"error": "Failed to add booking"}, status=400)
        except Exception as e:
            return cors_response({"error": str(e)}, status=400)
            
    return cors_response({"error": "Method not allowed"}, status=405)

@csrf_exempt
def booking_update_or_delete(request, id):
    opt = handle_options(request)
    if opt: return opt
    
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            customer_name = data.get('customer_name')
            island_name = data.get('island_name')
            package_name = data.get('package_name')
            travel_date = data.get('travel_date')
            number_of_people = data.get('number_of_people')
            total_amount = data.get('total_amount')
            booking_status = data.get('booking_status')
            
            if not (customer_name and island_name and package_name and travel_date and number_of_people is not None and total_amount is not None and booking_status):
                return cors_response({"error": "Missing required fields"}, status=400)
                
            res = db.update_booking(int(id), customer_name, island_name, package_name, travel_date, int(number_of_people), float(total_amount), booking_status)
            if res["success"]:
                return cors_response({"message": "Booking updated successfully"})
            else:
                return cors_response({"error": "Booking not found or update failed"}, status=404)
        except Exception as e:
            return cors_response({"error": str(e)}, status=400)
            
    elif request.method == 'DELETE':
        res = db.delete_booking(int(id))
        if res["success"]:
            return cors_response({"message": "Booking deleted successfully"})
        else:
            return cors_response({"error": "Booking not found or delete failed"}, status=404)
            
    return cors_response({"error": "Method not allowed"}, status=405)


# ================= MODULE 5: PAYMENTS =================

@csrf_exempt
def payments_list_or_add(request):
    opt = handle_options(request)
    if opt: return opt
    
    if request.method == 'GET':
        payments = db.get_payments()
        return cors_response(payments)
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            payment_id = data.get('payment_id')
            booking_id = data.get('booking_id')
            customer_name = data.get('customer_name')
            amount = data.get('amount')
            payment_method = data.get('payment_method')
            payment_status = data.get('payment_status')
            transaction_id = data.get('transaction_id')
            payment_date = data.get('payment_date')
            
            if not (booking_id is not None and customer_name and amount is not None and payment_method and payment_status and transaction_id and payment_date):
                return cors_response({"error": "Missing required fields"}, status=400)
                
            res = db.add_payment(int(booking_id), customer_name, float(amount), payment_method, payment_status, transaction_id, payment_date, payment_id)
            if res["success"]:
                return cors_response({"message": "Payment added successfully", "payment_id": res["id"]}, status=21)
            else:
                return cors_response({"error": "Failed to add payment"}, status=400)
        except Exception as e:
            return cors_response({"error": str(e)}, status=400)
            
    return cors_response({"error": "Method not allowed"}, status=405)

@csrf_exempt
def payment_update_or_delete(request, id):
    opt = handle_options(request)
    if opt: return opt
    
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            booking_id = data.get('booking_id')
            customer_name = data.get('customer_name')
            amount = data.get('amount')
            payment_method = data.get('payment_method')
            payment_status = data.get('payment_status')
            transaction_id = data.get('transaction_id')
            payment_date = data.get('payment_date')
            
            if not (booking_id is not None and customer_name and amount is not None and payment_method and payment_status and transaction_id and payment_date):
                return cors_response({"error": "Missing required fields"}, status=400)
                
            res = db.update_payment(int(id), int(booking_id), customer_name, float(amount), payment_method, payment_status, transaction_id, payment_date)
            if res["success"]:
                return cors_response({"message": "Payment updated successfully"})
            else:
                return cors_response({"error": "Payment not found or update failed"}, status=404)
        except Exception as e:
            return cors_response({"error": str(e)}, status=400)
            
    elif request.method == 'DELETE':
        res = db.delete_payment(int(id))
        if res["success"]:
            return cors_response({"message": "Payment deleted successfully"})
        else:
            return cors_response({"error": "Payment not found or delete failed"}, status=404)
            
    return cors_response({"error": "Method not allowed"}, status=405)
