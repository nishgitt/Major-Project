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
    required = ["full_name", "email", "phone", "city", "password"]
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
    required = ["full_name", "email", "phone", "city", "password"]
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


# ==================== PROPERTY VIEWS ====================
@api_view(["POST"])
def add_property(request):
    data = get_json_body(request)
    required = ["property_title", "property_type", "location", "price", "bedrooms", "bathrooms", "area_sqft", "status", "image_url"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    try:
        property_id = db.add_property(data)
        return JsonResponse({
            "message": "Property listing created successfully",
            "property_id": property_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Could not create property. Details: {str(e)}"}, status=400)

@api_view(["GET"])
def get_properties(request):
    properties = db.get_properties()
    return JsonResponse(properties, safe=False)

@api_view(["PUT"])
def update_property(request, id):
    data = get_json_body(request)
    required = ["property_title", "property_type", "location", "price", "bedrooms", "bathrooms", "area_sqft", "status", "image_url"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    updated = db.update_property(id, data)
    if updated:
        return JsonResponse({"message": f"Property {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Property {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_property(request, id):
    deleted = db.delete_property(id)
    if deleted:
        return JsonResponse({"message": f"Property {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Property {id} not found"}, status=404)


# ==================== AGENT VIEWS ====================
@api_view(["POST"])
def add_agent(request):
    data = get_json_body(request)
    required = ["agent_name", "phone", "email", "experience", "specialization"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    try:
        agent_id = db.add_agent(data)
        return JsonResponse({
            "message": "Agent added successfully",
            "agent_id": agent_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Could not add agent. Details: {str(e)}"}, status=400)

@api_view(["GET"])
def get_agents(request):
    agents = db.get_agents()
    return JsonResponse(agents, safe=False)

@api_view(["PUT"])
def update_agent(request, id):
    data = get_json_body(request)
    required = ["agent_name", "phone", "email", "experience", "specialization"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    updated = db.update_agent(id, data)
    if updated:
        return JsonResponse({"message": f"Agent {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Agent {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_agent(request, id):
    deleted = db.delete_agent(id)
    if deleted:
        return JsonResponse({"message": f"Agent {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Agent {id} not found"}, status=404)


# ==================== BOOKING VIEWS ====================
@api_view(["POST"])
def add_booking(request):
    data = get_json_body(request)
    required = ["customer_name", "property_title", "visit_date", "visit_time", "agent_name", "booking_status"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    try:
        booking_id = db.add_booking(data)
        return JsonResponse({
            "message": "Visit scheduled successfully",
            "booking_id": booking_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Could not schedule booking. Details: {str(e)}"}, status=400)

@api_view(["GET"])
def get_bookings(request):
    customer_name = request.GET.get("customer_name")
    if customer_name:
        bookings = db.get_bookings_by_customer_name(customer_name)
    else:
        bookings = db.get_bookings()
    return JsonResponse(bookings, safe=False)

@api_view(["PUT"])
def update_booking(request, id):
    data = get_json_body(request)
    required = ["customer_name", "property_title", "visit_date", "visit_time", "agent_name", "booking_status"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    updated = db.update_booking(id, data)
    if updated:
        return JsonResponse({"message": f"Booking {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Booking {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_booking(request, id):
    deleted = db.delete_booking(id)
    if deleted:
        return JsonResponse({"message": f"Booking {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Booking {id} not found"}, status=404)


# ==================== INQUIRY VIEWS ====================
@api_view(["POST"])
def add_inquiry(request):
    data = get_json_body(request)
    required = ["customer_name", "property_title", "message", "inquiry_date", "response_status"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    try:
        inquiry_id = db.add_inquiry(data)
        return JsonResponse({
            "message": "Inquiry submitted successfully",
            "inquiry_id": inquiry_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Could not submit inquiry. Details: {str(e)}"}, status=400)

@api_view(["GET"])
def get_inquiries(request):
    customer_name = request.GET.get("customer_name")
    if customer_name:
        inquiries = db.get_inquiries_by_customer_name(customer_name)
    else:
        inquiries = db.get_inquiries()
    return JsonResponse(inquiries, safe=False)

@api_view(["PUT"])
def update_inquiry(request, id):
    data = get_json_body(request)
    required = ["customer_name", "property_title", "message", "inquiry_date", "response_status"]
    for field in required:
        if field not in data or str(data[field]).strip() == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    updated = db.update_inquiry(id, data)
    if updated:
        return JsonResponse({"message": f"Inquiry {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Inquiry {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_inquiry(request, id):
    deleted = db.delete_inquiry(id)
    if deleted:
        return JsonResponse({"message": f"Inquiry {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Inquiry {id} not found"}, status=404)


# ==================== WISHLIST / FAVORITES VIEWS ====================
@api_view(["POST"])
def add_favorite_api(request):
    data = get_json_body(request)
    c_id = data.get("customer_id")
    p_id = data.get("property_id")
    if not c_id or not p_id:
        return JsonResponse({"error": "customer_id and property_id are required"}, status=400)
    
    success = db.add_favorite(int(c_id), int(p_id))
    if success:
        return JsonResponse({"message": "Property added to favorites"}, status=201)
    else:
        return JsonResponse({"message": "Property already in favorites"}, status=200)

@api_view(["DELETE"])
def remove_favorite_api(request, customer_id, property_id):
    removed = db.remove_favorite(customer_id, property_id)
    if removed:
        return JsonResponse({"message": "Property removed from favorites"})
    else:
        return JsonResponse({"error": "Favorite link not found"}, status=404)

@api_view(["GET"])
def get_favorites_api(request, customer_id):
    favorites = db.get_favorites_for_customer(customer_id)
    return JsonResponse(favorites, safe=False)


# ==================== AUTHENTICATION VIEWS ====================
@api_view(["POST"])
def login_api(request):
    data = get_json_body(request)
    email_or_username = data.get("email") # In frontend we can label this "Email/Username"
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
                "full_name": "Portal Administrator",
                "email": admin["username"],
                "role": "admin"
            }
        })
        
    # 2. Try customer login
    customer = db.get_customer_by_email(email_or_username)
    if customer and customer["password"] == password:
        # Don't return password
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
        
    # Auto-detect mime-type
    content_type, encoding = mimetypes.guess_type(file_path)
    if not content_type:
        content_type = 'application/octet-stream'
        
    try:
        with open(file_path, 'rb') as f:
            return HttpResponse(f.read(), content_type=content_type)
    except Exception as e:
        raise Http404("File not found")
