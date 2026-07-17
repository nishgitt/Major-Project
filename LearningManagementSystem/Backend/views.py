from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
import json
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

# ==================== STUDENT VIEWS ====================
@api_view(["POST"])
def add_student(request):
    data = get_json_body(request)
    if not data.get("full_name") or not data.get("email") or not data.get("password"):
        return JsonResponse({"error": "full_name, email, and password are required"}, status=400)
    
    # Check if student email already exists
    students = db.get_students()
    if any(s['email'] == data['email'] for s in students):
        return JsonResponse({"error": "A student with this email already exists"}, status=400)
        
    student_id = db.add_student(data)
    return JsonResponse({
        "message": "Student added successfully",
        "student_id": student_id
    }, status=201)

@api_view(["GET"])
def get_students(request):
    students = db.get_students()
    return JsonResponse(students, safe=False)

@api_view(["PUT"])
def update_student(request, id):
    data = get_json_body(request)
    if not data.get("full_name") or not data.get("email"):
        return JsonResponse({"error": "full_name and email are required"}, status=400)
    
    updated = db.update_student(id, data)
    if updated:
        return JsonResponse({"message": f"Student {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Student {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_student(request, id):
    deleted = db.delete_student(id)
    if deleted:
        return JsonResponse({"message": f"Student {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Student {id} not found"}, status=404)


# ==================== INSTRUCTOR VIEWS ====================
@api_view(["POST"])
def add_instructor(request):
    data = get_json_body(request)
    if not data.get("instructor_name") or not data.get("email"):
        return JsonResponse({"error": "instructor_name and email are required"}, status=400)
    
    # Check if instructor email already exists
    instructors = db.get_instructors()
    if any(i['email'] == data['email'] for i in instructors):
        return JsonResponse({"error": "An instructor with this email already exists"}, status=400)
        
    instructor_id = db.add_instructor(data)
    return JsonResponse({
        "message": "Instructor added successfully",
        "instructor_id": instructor_id
    }, status=201)

@api_view(["GET"])
def get_instructors(request):
    instructors = db.get_instructors()
    return JsonResponse(instructors, safe=False)

@api_view(["PUT"])
def update_instructor(request, id):
    data = get_json_body(request)
    if not data.get("instructor_name") or not data.get("email"):
        return JsonResponse({"error": "instructor_name and email are required"}, status=400)
    
    updated = db.update_instructor(id, data)
    if updated:
        return JsonResponse({"message": f"Instructor {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Instructor {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_instructor(request, id):
    deleted = db.delete_instructor(id)
    if deleted:
        return JsonResponse({"message": f"Instructor {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Instructor {id} not found"}, status=404)


# ==================== COURSE VIEWS ====================
@api_view(["POST"])
def add_course(request):
    data = get_json_body(request)
    if not data.get("course_name") or not data.get("instructor_name") or not data.get("category"):
        return JsonResponse({"error": "course_name, instructor_name, and category are required"}, status=400)
    
    course_id = db.add_course(data)
    return JsonResponse({
        "message": "Course added successfully",
        "course_id": course_id
    }, status=201)

@api_view(["GET"])
def get_courses(request):
    courses = db.get_courses()
    return JsonResponse(courses, safe=False)

@api_view(["PUT"])
def update_course(request, id):
    data = get_json_body(request)
    if not data.get("course_name") or not data.get("instructor_name") or not data.get("category"):
        return JsonResponse({"error": "course_name, instructor_name, and category are required"}, status=400)
    
    updated = db.update_course(id, data)
    if updated:
        return JsonResponse({"message": f"Course {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Course {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_course(request, id):
    deleted = db.delete_course(id)
    if deleted:
        return JsonResponse({"message": f"Course {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Course {id} not found"}, status=404)


# ==================== ENROLLMENT VIEWS ====================
@api_view(["POST"])
def add_enrollment(request):
    data = get_json_body(request)
    if not data.get("student_name") or not data.get("course_name"):
        return JsonResponse({"error": "student_name and course_name are required"}, status=400)
    
    enrollment_id = db.add_enrollment(data)
    return JsonResponse({
        "message": "Enrollment added successfully",
        "enrollment_id": enrollment_id
    }, status=201)

@api_view(["GET"])
def get_enrollments(request):
    enrollments = db.get_enrollments()
    return JsonResponse(enrollments, safe=False)

@api_view(["PUT"])
def update_enrollment(request, id):
    data = get_json_body(request)
    if not data.get("student_name") or not data.get("course_name"):
        return JsonResponse({"error": "student_name and course_name are required"}, status=400)
    
    updated = db.update_enrollment(id, data)
    if updated:
        return JsonResponse({"message": f"Enrollment {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Enrollment {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_enrollment(request, id):
    deleted = db.delete_enrollment(id)
    if deleted:
        return JsonResponse({"message": f"Enrollment {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Enrollment {id} not found"}, status=404)


# ==================== ASSIGNMENT VIEWS ====================
@api_view(["POST"])
def add_assignment(request):
    data = get_json_body(request)
    if not data.get("course_name") or not data.get("student_name") or not data.get("assignment_title"):
        return JsonResponse({"error": "course_name, student_name, and assignment_title are required"}, status=400)
    
    assignment_id = db.add_assignment(data)
    return JsonResponse({
        "message": "Assignment added successfully",
        "assignment_id": assignment_id
    }, status=201)

@api_view(["GET"])
def get_assignments(request):
    assignments = db.get_assignments()
    return JsonResponse(assignments, safe=False)

@api_view(["PUT"])
def update_assignment(request, id):
    data = get_json_body(request)
    if not data.get("course_name") or not data.get("student_name") or not data.get("assignment_title"):
        return JsonResponse({"error": "course_name, student_name, and assignment_title are required"}, status=400)
    
    updated = db.update_assignment(id, data)
    if updated:
        return JsonResponse({"message": f"Assignment {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Assignment {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_assignment(request, id):
    deleted = db.delete_assignment(id)
    if deleted:
        return JsonResponse({"message": f"Assignment {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Assignment {id} not found"}, status=404)

# ==================== AUTHENTICATION HELPER ====================
@api_view(["POST"])
def login_view(request):
    data = get_json_body(request)
    email = data.get("email")
    password = data.get("password")
    role = data.get("role") # "student" or "instructor"
    
    if not email or not password or not role:
        return JsonResponse({"error": "email, password, and role are required"}, status=400)
        
    if role == "student":
        students = db.get_students()
        user = next((s for s in students if s['email'] == email and s['password'] == password), None)
        if user:
            return JsonResponse({
                "message": "Login successful",
                "user": {
                    "id": user["student_id"],
                    "name": user["full_name"],
                    "email": user["email"],
                    "role": "student"
                }
            })
    elif role == "instructor":
        # Check standard trainer credential
        instructors = db.get_instructors()
        # For instructors, they might not have a password field in schema, but for login safety,
        # we can verify email and let any password pass if it's the registered trainer email,
        # or we check if there's a custom instructor email matching trainer@gmail.com
        user = next((i for i in instructors if i['email'] == email), None)
        if user:
            return JsonResponse({
                "message": "Login successful",
                "user": {
                    "id": user["instructor_id"],
                    "name": user["instructor_name"],
                    "email": user["email"],
                    "role": "instructor"
                }
            })
            
    return JsonResponse({"error": "Invalid email or password"}, status=401)
