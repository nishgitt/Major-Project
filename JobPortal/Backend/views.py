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

# ==================== CANDIDATE VIEWS ====================
@api_view(["POST"])
def add_candidate(request):
    data = get_json_body(request)
    required = ["full_name", "email", "phone", "qualification", "skills", "experience", "password"]
    missing = [f for f in required if not data.get(f) and data.get(f) != 0]
    if missing:
        return JsonResponse({"error": f"Missing required fields: {', '.join(missing)}"}, status=400)
    
    try:
        candidate_id = db.add_candidate(data)
        return JsonResponse({
            "message": "Candidate added successfully",
            "candidate_id": candidate_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@api_view(["GET"])
def get_candidates(request):
    candidates = db.get_candidates()
    return JsonResponse(candidates, safe=False)

@api_view(["PUT"])
def update_candidate(request, id):
    data = get_json_body(request)
    required = ["full_name", "email", "phone", "qualification", "skills", "experience", "password"]
    missing = [f for f in required if not data.get(f) and data.get(f) != 0]
    if missing:
        return JsonResponse({"error": f"Missing required fields: {', '.join(missing)}"}, status=400)
    
    updated = db.update_candidate(id, data)
    if updated:
        return JsonResponse({"message": f"Candidate {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Candidate {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_candidate(request, id):
    deleted = db.delete_candidate(id)
    if deleted:
        return JsonResponse({"message": f"Candidate {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Candidate {id} not found"}, status=404)


# ==================== EMPLOYER VIEWS ====================
@api_view(["POST"])
def add_employer(request):
    data = get_json_body(request)
    required = ["company_name", "hr_name", "email", "phone", "location", "industry"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return JsonResponse({"error": f"Missing required fields: {', '.join(missing)}"}, status=400)
    
    try:
        employer_id = db.add_employer(data)
        return JsonResponse({
            "message": "Employer added successfully",
            "employer_id": employer_id
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@api_view(["GET"])
def get_employers(request):
    employers = db.get_employers()
    return JsonResponse(employers, safe=False)

@api_view(["PUT"])
def update_employer(request, id):
    data = get_json_body(request)
    required = ["company_name", "hr_name", "email", "phone", "location", "industry"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return JsonResponse({"error": f"Missing required fields: {', '.join(missing)}"}, status=400)
    
    updated = db.update_employer(id, data)
    if updated:
        return JsonResponse({"message": f"Employer {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Employer {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_employer(request, id):
    deleted = db.delete_employer(id)
    if deleted:
        return JsonResponse({"message": f"Employer {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Employer {id} not found"}, status=404)


# ==================== JOB VIEWS ====================
@api_view(["POST"])
def add_job(request):
    data = get_json_body(request)
    required = ["job_title", "company_name", "location", "job_type", "experience_required", "salary", "last_date"]
    missing = [f for f in required if not data.get(f) and data.get(f) != 0]
    if missing:
        return JsonResponse({"error": f"Missing required fields: {', '.join(missing)}"}, status=400)
    
    job_id = db.add_job(data)
    return JsonResponse({
        "message": "Job added successfully",
        "job_id": job_id
    }, status=201)

@api_view(["GET"])
def get_jobs(request):
    jobs = db.get_jobs()
    return JsonResponse(jobs, safe=False)

@api_view(["PUT"])
def update_job(request, id):
    data = get_json_body(request)
    required = ["job_title", "company_name", "location", "job_type", "experience_required", "salary", "last_date"]
    missing = [f for f in required if not data.get(f) and data.get(f) != 0]
    if missing:
        return JsonResponse({"error": f"Missing required fields: {', '.join(missing)}"}, status=400)
    
    updated = db.update_job(id, data)
    if updated:
        return JsonResponse({"message": f"Job {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Job {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_job(request, id):
    deleted = db.delete_job(id)
    if deleted:
        return JsonResponse({"message": f"Job {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Job {id} not found"}, status=404)


# ==================== APPLICATION VIEWS ====================
@api_view(["POST"])
def add_application(request):
    data = get_json_body(request)
    required = ["candidate_name", "company_name", "job_title", "applied_date", "resume", "application_status"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return JsonResponse({"error": f"Missing required fields: {', '.join(missing)}"}, status=400)
    
    application_id = db.add_application(data)
    return JsonResponse({
        "message": "Application added successfully",
        "application_id": application_id
    }, status=201)

@api_view(["GET"])
def get_applications(request):
    applications = db.get_applications()
    return JsonResponse(applications, safe=False)

@api_view(["PUT"])
def update_application(request, id):
    data = get_json_body(request)
    required = ["candidate_name", "company_name", "job_title", "applied_date", "resume", "application_status"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return JsonResponse({"error": f"Missing required fields: {', '.join(missing)}"}, status=400)
    
    updated = db.update_application(id, data)
    if updated:
        return JsonResponse({"message": f"Application {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Application {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_application(request, id):
    deleted = db.delete_application(id)
    if deleted:
        return JsonResponse({"message": f"Application {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Application {id} not found"}, status=404)


# ==================== INTERVIEW VIEWS ====================
@api_view(["POST"])
def add_interview(request):
    data = get_json_body(request)
    required = ["candidate_name", "company_name", "interview_date", "interview_time", "interview_mode", "interview_status"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return JsonResponse({"error": f"Missing required fields: {', '.join(missing)}"}, status=400)
    
    interview_id = db.add_interview(data)
    return JsonResponse({
        "message": "Interview scheduled successfully",
        "interview_id": interview_id
    }, status=201)

@api_view(["GET"])
def get_interviews(request):
    interviews = db.get_interviews()
    return JsonResponse(interviews, safe=False)

@api_view(["PUT"])
def update_interview(request, id):
    data = get_json_body(request)
    required = ["candidate_name", "company_name", "interview_date", "interview_time", "interview_mode", "interview_status"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return JsonResponse({"error": f"Missing required fields: {', '.join(missing)}"}, status=400)
    
    updated = db.update_interview(id, data)
    if updated:
        return JsonResponse({"message": f"Interview {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Interview {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_interview(request, id):
    deleted = db.delete_interview(id)
    if deleted:
        return JsonResponse({"message": f"Interview {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Interview {id} not found"}, status=404)


# ==================== AUTHENTICATION HELPER ENDPOINTS ====================
@api_view(["POST"])
def candidate_login(request):
    data = get_json_body(request)
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return JsonResponse({"error": "Email and password are required"}, status=400)
    
    candidates = db.get_candidates()
    for c in candidates:
        if c["email"].lower() == email.lower() and c["password"] == password:
            # Exclude password in return payload
            ret = dict(c)
            ret.pop("password", None)
            return JsonResponse({"message": "Login successful", "user": ret, "role": "candidate"})
            
    return JsonResponse({"error": "Invalid email or password"}, status=401)

@api_view(["POST"])
def employer_login(request):
    data = get_json_body(request)
    email = data.get("email")
    password = data.get("password")  # Optional or standard checks
    if not email:
        return JsonResponse({"error": "Email is required"}, status=400)
    
    employers = db.get_employers()
    for e in employers:
        if e["email"].lower() == email.lower():
            # If they registered with password, check it
            if e.get("password") and password and e["password"] != password:
                continue
            ret = dict(e)
            ret.pop("password", None)
            return JsonResponse({"message": "Login successful", "user": ret, "role": "employer"})
            
    return JsonResponse({"error": "Invalid email or password"}, status=401)
