from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse, Http404
import json
import os
import mimetypes
import db

# Initialize database tables on server start
db.init_db()

def api_view(allowed_methods):
    def decorator(func):
        @csrf_exempt
        def wrapper(request, *args, **kwargs):
            if request.method == "OPTIONS":
                response = HttpResponse()
                response["Access-Control-Allow-Origin"] = "*"
                response["Access-Control-Allow-Methods"] = ", ".join(allowed_methods) + ", OPTIONS"
                response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
                return response
            
            if request.method not in allowed_methods:
                response = JsonResponse({"error": f"Method {request.method} not allowed. Allowed: {allowed_methods}"}, status=405)
                response["Access-Control-Allow-Origin"] = "*"
                return response
            
            try:
                response = func(request, *args, **kwargs)
            except Exception as e:
                response = JsonResponse({"error": str(e)}, status=500)
            
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Methods"] = ", ".join(allowed_methods) + ", OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            return response
        return wrapper
    return decorator

def get_json_body(request):
    try:
        return json.loads(request.body.decode('utf-8'))
    except Exception:
        return {}

# ==================== CUSTOMER VIEWS ====================
@api_view(["POST"])
def add_customer(request):
    data = get_json_body(request)
    required = ["full_name", "email", "phone", "gender", "password"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    try:
        # Check if email is already taken
        existing = db.get_customer_by_email(data["email"])
        if existing:
            return JsonResponse({"error": "Email is already registered"}, status=400)
            
        customer_id = db.add_customer(data)
        return JsonResponse({
            "message": "Customer registered successfully",
            "customer_id": customer_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Could not add customer. Details: {str(e)}"}, status=400)

@api_view(["GET"])
def get_customers(request):
    customers = db.get_customers()
    return JsonResponse(customers, safe=False)

@api_view(["PUT"])
def update_customer(request, id):
    data = get_json_body(request)
    required = ["full_name", "email", "phone", "gender", "password"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    updated = db.update_customer(id, data)
    if updated:
        return JsonResponse({"message": f"Customer {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Customer {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_customer(request, id):
    deleted = db.delete_customer(id)
    if deleted:
        return JsonResponse({"message": f"Customer {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Customer {id} not found"}, status=404)


# ==================== SERVICE VIEWS ====================
@api_view(["POST"])
def add_service(request):
    data = get_json_body(request)
    required = ["service_name", "category", "duration", "price", "description"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    try:
        service_id = db.add_service(data)
        return JsonResponse({
            "message": "Service created successfully",
            "service_id": service_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Could not create service. Details: {str(e)}"}, status=400)

@api_view(["GET"])
def get_services(request):
    services = db.get_services()
    return JsonResponse(services, safe=False)

@api_view(["PUT"])
def update_service(request, id):
    data = get_json_body(request)
    required = ["service_name", "category", "duration", "price", "description"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    updated = db.update_service(id, data)
    if updated:
        return JsonResponse({"message": f"Service {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Service {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_service(request, id):
    deleted = db.delete_service(id)
    if deleted:
        return JsonResponse({"message": f"Service {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Service {id} not found"}, status=404)


# ==================== STYLIST VIEWS ====================
@api_view(["POST"])
def add_stylist(request):
    data = get_json_body(request)
    required = ["stylist_name", "specialization", "experience", "phone", "availability"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    try:
        stylist_id = db.add_stylist(data)
        return JsonResponse({
            "message": "Stylist added successfully",
            "stylist_id": stylist_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Could not add stylist. Details: {str(e)}"}, status=400)

@api_view(["GET"])
def get_stylists(request):
    stylists = db.get_stylists()
    return JsonResponse(stylists, safe=False)

@api_view(["PUT"])
def update_stylist(request, id):
    data = get_json_body(request)
    required = ["stylist_name", "specialization", "experience", "phone", "availability"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    updated = db.update_stylist(id, data)
    if updated:
        return JsonResponse({"message": f"Stylist {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Stylist {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_stylist(request, id):
    deleted = db.delete_stylist(id)
    if deleted:
        return JsonResponse({"message": f"Stylist {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Stylist {id} not found"}, status=404)


# ==================== APPOINTMENT VIEWS ====================
@api_view(["POST"])
def add_appointment(request):
    data = get_json_body(request)
    required = ["customer_name", "stylist_name", "service_name", "appointment_date", "appointment_time", "total_amount", "appointment_status"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    try:
        appointment_id = db.add_appointment(data)
        return JsonResponse({
            "message": "Appointment booked successfully",
            "appointment_id": appointment_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Could not book appointment. Details: {str(e)}"}, status=400)

@api_view(["GET"])
def get_appointments(request):
    appointments = db.get_appointments()
    return JsonResponse(appointments, safe=False)

@api_view(["PUT"])
def update_appointment(request, id):
    data = get_json_body(request)
    required = ["customer_name", "stylist_name", "service_name", "appointment_date", "appointment_time", "total_amount", "appointment_status"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    updated = db.update_appointment(id, data)
    if updated:
        return JsonResponse({"message": f"Appointment {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Appointment {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_appointment(request, id):
    deleted = db.delete_appointment(id)
    if deleted:
        return JsonResponse({"message": f"Appointment {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Appointment {id} not found"}, status=404)


# ==================== PAYMENT VIEWS ====================
@api_view(["POST"])
def add_payment(request):
    data = get_json_body(request)
    required = ["customer_name", "appointment_id", "amount", "payment_method", "payment_status", "payment_date"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    try:
        payment_id = db.add_payment(data)
        return JsonResponse({
            "message": "Payment recorded successfully",
            "payment_id": payment_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Could not record payment. Details: {str(e)}"}, status=400)

@api_view(["GET"])
def get_payments(request):
    payments = db.get_payments()
    return JsonResponse(payments, safe=False)

@api_view(["PUT"])
def update_payment(request, id):
    data = get_json_body(request)
    required = ["customer_name", "appointment_id", "amount", "payment_method", "payment_status", "payment_date"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    updated = db.update_payment(id, data)
    if updated:
        return JsonResponse({"message": f"Payment {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Payment {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_payment(request, id):
    deleted = db.delete_payment(id)
    if deleted:
        return JsonResponse({"message": f"Payment {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Payment {id} not found"}, status=404)


# ==================== REVIEWS VIEWS (Bonus Feature) ====================
@api_view(["POST"])
def add_review(request):
    data = get_json_body(request)
    required = ["customer_name", "target_name", "rating", "comment", "review_date"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    try:
        review_id = db.add_review(data)
        return JsonResponse({
            "message": "Review added successfully",
            "review_id": review_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Could not add review. Details: {str(e)}"}, status=400)

@api_view(["GET"])
def get_reviews(request):
    reviews = db.get_reviews()
    return JsonResponse(reviews, safe=False)


# ==================== AUTHENTICATION VIEWS ====================
@api_view(["POST"])
def login_api(request):
    data = get_json_body(request)
    email_or_username = data.get("email") # Serves as username for admin or email for customer
    password = data.get("password")
    
    if not email_or_username or not password:
        return JsonResponse({"error": "Email/Username and password are required"}, status=400)
    
    # 1. Try admin login
    admin = db.authenticate_admin(email_or_username, password)
    if admin:
        return JsonResponse({
            "message": "Admin login successful",
            "role": "admin",
            "user": {
                "id": admin["admin_id"],
                "full_name": "Salon Administrator",
                "email": admin["username"],
                "role": "admin"
            }
        })
        
    # 2. Try customer login
    customer = db.get_customer_by_email(email_or_username)
    if customer and customer["password"] == password:
        cust_info = {k: v for k, v in customer.items() if k != "password"}
        cust_info["role"] = "customer"
        return JsonResponse({
            "message": "Customer login successful",
            "role": "customer",
            "user": cust_info
        })
        
    return JsonResponse({"error": "Invalid email/username or password"}, status=401)


# ==================== FRONTEND STATIC SERVER ====================
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Frontend')

@csrf_exempt
def serve_frontend(request, path='index.html'):
    if not path:
        path = 'index.html'
    
    safe_path = os.path.normpath(path)
    if safe_path.startswith('..') or safe_path.startswith('/') or safe_path.startswith('\\'):
        return HttpResponse("Forbidden", status=403)
        
    file_path = os.path.join(FRONTEND_DIR, safe_path)
    
    if not os.path.exists(file_path) or os.path.isdir(file_path):
        if '.' not in safe_path:
            file_path = os.path.join(FRONTEND_DIR, 'index.html')
        else:
            raise Http404("File not found")
        
    content_type, encoding = mimetypes.guess_type(file_path)
    if not content_type:
        content_type = 'application/octet-stream'
        
    try:
        with open(file_path, 'rb') as f:
            return HttpResponse(f.read(), content_type=content_type)
    except Exception as e:
        raise Http404("File not found")
