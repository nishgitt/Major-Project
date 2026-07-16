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
        return JsonResponse({"error": "full_name, email and password are required"}, status=400)
    
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


# ==================== EXAM VIEWS ====================
@api_view(["POST"])
def add_exam(request):
    data = get_json_body(request)
    if not data.get("exam_title") or not data.get("subject"):
        return JsonResponse({"error": "exam_title and subject are required"}, status=400)
    
    exam_id = db.add_exam(data)
    return JsonResponse({
        "message": "Exam added successfully",
        "exam_id": exam_id
    }, status=201)

@api_view(["GET"])
def get_exams(request):
    exams = db.get_exams()
    return JsonResponse(exams, safe=False)

@api_view(["PUT"])
def update_exam(request, id):
    data = get_json_body(request)
    if not data.get("exam_title") or not data.get("subject"):
        return JsonResponse({"error": "exam_title and subject are required"}, status=400)
    
    updated = db.update_exam(id, data)
    if updated:
        return JsonResponse({"message": f"Exam {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Exam {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_exam(request, id):
    deleted = db.delete_exam(id)
    if deleted:
        return JsonResponse({"message": f"Exam {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Exam {id} not found"}, status=404)


# ==================== QUESTION VIEWS ====================
@api_view(["POST"])
def add_question(request):
    data = get_json_body(request)
    if not data.get("exam_title") or not data.get("question") or not data.get("correct_answer"):
        return JsonResponse({"error": "exam_title, question and correct_answer are required"}, status=400)
    
    question_id = db.add_question(data)
    return JsonResponse({
        "message": "Question added successfully",
        "question_id": question_id
    }, status=201)

@api_view(["GET"])
def get_questions(request):
    questions = db.get_questions()
    return JsonResponse(questions, safe=False)

@api_view(["PUT"])
def update_question(request, id):
    data = get_json_body(request)
    if not data.get("exam_title") or not data.get("question") or not data.get("correct_answer"):
        return JsonResponse({"error": "exam_title, question and correct_answer are required"}, status=400)
    
    updated = db.update_question(id, data)
    if updated:
        return JsonResponse({"message": f"Question {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Question {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_question(request, id):
    deleted = db.delete_question(id)
    if deleted:
        return JsonResponse({"message": f"Question {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Question {id} not found"}, status=404)


# ==================== SUBMISSION VIEWS ====================
@api_view(["POST"])
def add_submission(request):
    data = get_json_body(request)
    if not data.get("student_name") or not data.get("exam_title"):
        return JsonResponse({"error": "student_name and exam_title are required"}, status=400)
    
    submission_id = db.add_submission(data)
    return JsonResponse({
        "message": "Submission added successfully",
        "submission_id": submission_id
    }, status=201)

@api_view(["GET"])
def get_submissions(request):
    submissions = db.get_submissions()
    return JsonResponse(submissions, safe=False)

@api_view(["PUT"])
def update_submission(request, id):
    data = get_json_body(request)
    if not data.get("student_name") or not data.get("exam_title"):
        return JsonResponse({"error": "student_name and exam_title are required"}, status=400)
    
    updated = db.update_submission(id, data)
    if updated:
        return JsonResponse({"message": f"Submission {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Submission {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_submission(request, id):
    deleted = db.delete_submission(id)
    if deleted:
        return JsonResponse({"message": f"Submission {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Submission {id} not found"}, status=404)


# ==================== RESULT VIEWS ====================
@api_view(["POST"])
def add_result(request):
    data = get_json_body(request)
    if not data.get("student_name") or not data.get("exam_title"):
        return JsonResponse({"error": "student_name and exam_title are required"}, status=400)
    
    result_id = db.add_result(data)
    return JsonResponse({
        "message": "Result added successfully",
        "result_id": result_id
    }, status=201)

@api_view(["GET"])
def get_results(request):
    results = db.get_results()
    return JsonResponse(results, safe=False)

@api_view(["PUT"])
def update_result(request, id):
    data = get_json_body(request)
    if not data.get("student_name") or not data.get("exam_title"):
        return JsonResponse({"error": "student_name and exam_title are required"}, status=400)
    
    updated = db.update_result(id, data)
    if updated:
        return JsonResponse({"message": f"Result {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Result {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_result(request, id):
    deleted = db.delete_result(id)
    if deleted:
        return JsonResponse({"message": f"Result {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Result {id} not found"}, status=404)
