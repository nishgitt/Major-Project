from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse, Http404
from django.core.files.storage import FileSystemStorage
import json
import os
import mimetypes
import db


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

# ==================== ADMIN LOGIN ====================
@api_view(["POST"])
def admin_login(request):
    data = get_json_body(request)
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return JsonResponse({"error": "username and password are required"}, status=400)
    
    user = db.authenticate_admin(username, password)
    if user:
        return JsonResponse({
            "message": "Login successful",
            "user": user
        }, status=200)
    else:
        return JsonResponse({"error": "Invalid username or password"}, status=401)

# ==================== ASSET VIEWS ====================
@api_view(["POST"])
def add_asset(request):
    data = get_json_body(request)
    required_fields = ["asset_name", "category", "serial_number", "purchase_date", "purchase_price", "warranty_expiry"]
    for field in required_fields:
        if field not in data or data[field] == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
    
    try:
        asset_id = db.add_asset(data)
        return JsonResponse({
            "message": "Asset added successfully",
            "asset_id": asset_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Could not create asset. Ensure serial number is unique. Details: {str(e)}"}, status=400)

@api_view(["GET"])
def get_assets(request):
    assets = db.get_assets()
    return JsonResponse(assets, safe=False)

@api_view(["PUT"])
def update_asset(request, id):
    data = get_json_body(request)
    required_fields = ["asset_name", "category", "serial_number", "purchase_date", "purchase_price", "warranty_expiry", "status"]
    for field in required_fields:
        if field not in data or data[field] == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    updated = db.update_asset(id, data)
    if updated:
        return JsonResponse({"message": f"Asset {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Asset {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_asset(request, id):
    deleted = db.delete_asset(id)
    if deleted:
        return JsonResponse({"message": f"Asset {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Asset {id} not found"}, status=404)

# ==================== CATEGORY VIEWS ====================
@api_view(["POST"])
def add_category(request):
    data = get_json_body(request)
    if not data.get("category_name"):
        return JsonResponse({"error": "category_name is required"}, status=400)
        
    try:
        category_id = db.add_category(data)
        return JsonResponse({
            "message": "Category added successfully",
            "category_id": category_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Could not create category. Details: {str(e)}"}, status=400)

@api_view(["GET"])
def get_categories(request):
    categories = db.get_categories()
    return JsonResponse(categories, safe=False)

@api_view(["PUT"])
def update_category(request, id):
    data = get_json_body(request)
    if not data.get("category_name"):
        return JsonResponse({"error": "category_name is required"}, status=400)
        
    updated = db.update_category(id, data)
    if updated:
        return JsonResponse({"message": f"Category {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Category {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_category(request, id):
    deleted = db.delete_category(id)
    if deleted:
        return JsonResponse({"message": f"Category {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Category {id} not found"}, status=404)

# ==================== DEPARTMENT VIEWS ====================
@api_view(["POST"])
def add_department(request):
    data = get_json_body(request)
    if not data.get("department_name"):
        return JsonResponse({"error": "department_name is required"}, status=400)
        
    try:
        department_id = db.add_department(data)
        return JsonResponse({
            "message": "Department added successfully",
            "department_id": department_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Could not create department. Details: {str(e)}"}, status=400)

@api_view(["GET"])
def get_departments(request):
    departments = db.get_departments()
    return JsonResponse(departments, safe=False)

@api_view(["PUT"])
def update_department(request, id):
    data = get_json_body(request)
    if not data.get("department_name"):
        return JsonResponse({"error": "department_name is required"}, status=400)
        
    updated = db.update_department(id, data)
    if updated:
        return JsonResponse({"message": f"Department {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Department {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_department(request, id):
    deleted = db.delete_department(id)
    if deleted:
        return JsonResponse({"message": f"Department {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Department {id} not found"}, status=404)

# ==================== VENDOR VIEWS ====================
@api_view(["POST"])
def add_vendor(request):
    data = get_json_body(request)
    if not data.get("vendor_name"):
        return JsonResponse({"error": "vendor_name is required"}, status=400)
        
    try:
        vendor_id = db.add_vendor(data)
        return JsonResponse({
            "message": "Vendor added successfully",
            "vendor_id": vendor_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Could not create vendor. Details: {str(e)}"}, status=400)

@api_view(["GET"])
def get_vendors(request):
    vendors = db.get_vendors()
    return JsonResponse(vendors, safe=False)

@api_view(["PUT"])
def update_vendor(request, id):
    data = get_json_body(request)
    if not data.get("vendor_name"):
        return JsonResponse({"error": "vendor_name is required"}, status=400)
        
    updated = db.update_vendor(id, data)
    if updated:
        return JsonResponse({"message": f"Vendor {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Vendor {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_vendor(request, id):
    deleted = db.delete_vendor(id)
    if deleted:
        return JsonResponse({"message": f"Vendor {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Vendor {id} not found"}, status=404)

# ==================== ALLOCATION VIEWS ====================
@api_view(["POST"])
def add_allocation(request):
    data = get_json_body(request)
    required_fields = ["asset_name", "department_name", "assigned_date", "maintenance_date", "maintenance_status"]
    for field in required_fields:
        if field not in data or data[field] == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    try:
        allocation_id = db.add_allocation(data)
        return JsonResponse({
            "message": "Allocation added successfully",
            "allocation_id": allocation_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": f"Could not create allocation. Details: {str(e)}"}, status=400)

@api_view(["GET"])
def get_allocations(request):
    allocations = db.get_allocations()
    return JsonResponse(allocations, safe=False)

@api_view(["PUT"])
def update_allocation(request, id):
    data = get_json_body(request)
    required_fields = ["asset_name", "department_name", "assigned_date", "maintenance_date", "maintenance_status"]
    for field in required_fields:
        if field not in data or data[field] == "":
            return JsonResponse({"error": f"'{field}' is required"}, status=400)
            
    updated = db.update_allocation(id, data)
    if updated:
        return JsonResponse({"message": f"Allocation {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Allocation {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_allocation(request, id):
    deleted = db.delete_allocation(id)
    if deleted:
        return JsonResponse({"message": f"Allocation {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Allocation {id} not found"}, status=404)

# ==================== UPLOAD VIEWS ====================
@api_view(["POST"])
def upload_file(request):
    if not request.FILES.get("file"):
        return JsonResponse({"error": "No file uploaded"}, status=400)
    
    uploaded_file = request.FILES["file"]
    uploads_dir = os.path.join(FRONTEND_DIR, 'uploads')
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir, exist_ok=True)
        
    fs = FileSystemStorage(location=uploads_dir)
    filename = fs.save(uploaded_file.name, uploaded_file)
    file_url = f"/uploads/{filename}"
    
    return JsonResponse({
        "message": "File uploaded successfully",
        "url": file_url
    }, status=201)

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

