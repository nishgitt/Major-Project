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

# ==================== PATIENT VIEWS ====================
@api_view(["POST"])
def add_patient(request):
    data = get_json_body(request)
    if not data.get("patient_name"):
        return JsonResponse({"error": "patient_name is required"}, status=400)
    
    patient_id = db.add_patient(data)
    return JsonResponse({
        "message": "Patient added successfully",
        "patient_id": patient_id
    }, status=201)

@api_view(["GET"])
def get_patients(request):
    patients = db.get_patients()
    return JsonResponse(patients, safe=False)

@api_view(["PUT"])
def update_patient(request, id):
    data = get_json_body(request)
    if not data.get("patient_name"):
        return JsonResponse({"error": "patient_name is required"}, status=400)
    
    updated = db.update_patient(id, data)
    if updated:
        return JsonResponse({"message": f"Patient {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Patient {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_patient(request, id):
    deleted = db.delete_patient(id)
    if deleted:
        return JsonResponse({"message": f"Patient {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Patient {id} not found"}, status=404)


# ==================== DOCTOR VIEWS ====================
@api_view(["POST"])
def add_doctor(request):
    data = get_json_body(request)
    if not data.get("doctor_name") or not data.get("department"):
        return JsonResponse({"error": "doctor_name and department are required"}, status=400)
    
    doctor_id = db.add_doctor(data)
    return JsonResponse({
        "message": "Doctor added successfully",
        "doctor_id": doctor_id
    }, status=201)

@api_view(["GET"])
def get_doctors(request):
    doctors = db.get_doctors()
    return JsonResponse(doctors, safe=False)

@api_view(["PUT"])
def update_doctor(request, id):
    data = get_json_body(request)
    if not data.get("doctor_name") or not data.get("department"):
        return JsonResponse({"error": "doctor_name and department are required"}, status=400)
    
    updated = db.update_doctor(id, data)
    if updated:
        return JsonResponse({"message": f"Doctor {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Doctor {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_doctor(request, id):
    deleted = db.delete_doctor(id)
    if deleted:
        return JsonResponse({"message": f"Doctor {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Doctor {id} not found"}, status=404)


# ==================== APPOINTMENT VIEWS ====================
@api_view(["POST"])
def add_appointment(request):
    data = get_json_body(request)
    if not data.get("patient_name") or not data.get("doctor_name"):
        return JsonResponse({"error": "patient_name and doctor_name are required"}, status=400)
    
    # Set default status if not provided
    if not data.get("appointment_status"):
        data["appointment_status"] = "Scheduled"
        
    appointment_id = db.add_appointment(data)
    return JsonResponse({
        "message": "Appointment added successfully",
        "appointment_id": appointment_id
    }, status=201)

@api_view(["GET"])
def get_appointments(request):
    appointments = db.get_appointments()
    return JsonResponse(appointments, safe=False)

@api_view(["PUT"])
def update_appointment(request, id):
    data = get_json_body(request)
    if not data.get("patient_name") or not data.get("doctor_name"):
        return JsonResponse({"error": "patient_name and doctor_name are required"}, status=400)
    
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


# ==================== MEDICAL RECORD VIEWS ====================
@api_view(["POST"])
def add_record(request):
    data = get_json_body(request)
    if not data.get("patient_name") or not data.get("doctor_name"):
        return JsonResponse({"error": "patient_name and doctor_name are required"}, status=400)
    
    record_id = db.add_record(data)
    return JsonResponse({
        "message": "Medical record added successfully",
        "record_id": record_id
    }, status=201)

@api_view(["GET"])
def get_records(request):
    records = db.get_records()
    return JsonResponse(records, safe=False)

@api_view(["PUT"])
def update_record(request, id):
    data = get_json_body(request)
    if not data.get("patient_name") or not data.get("doctor_name"):
        return JsonResponse({"error": "patient_name and doctor_name are required"}, status=400)
    
    updated = db.update_record(id, data)
    if updated:
        return JsonResponse({"message": f"Medical record {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Medical record {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_record(request, id):
    deleted = db.delete_record(id)
    if deleted:
        return JsonResponse({"message": f"Medical record {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Medical record {id} not found"}, status=404)


# ==================== BILLING VIEWS ====================
@api_view(["POST"])
def add_bill(request):
    data = get_json_body(request)
    if not data.get("patient_name"):
        return JsonResponse({"error": "patient_name is required"}, status=400)
    
    bill_id = db.add_bill(data)
    return JsonResponse({
        "message": "Bill generated successfully",
        "bill_id": bill_id
    }, status=201)

@api_view(["GET"])
def get_bills(request):
    bills = db.get_bills()
    return JsonResponse(bills, safe=False)

@api_view(["PUT"])
def update_bill(request, id):
    data = get_json_body(request)
    if not data.get("patient_name"):
        return JsonResponse({"error": "patient_name is required"}, status=400)
    
    updated = db.update_bill(id, data)
    if updated:
        return JsonResponse({"message": f"Bill {id} updated successfully"})
    else:
        return JsonResponse({"error": f"Bill {id} not found"}, status=404)

@api_view(["DELETE"])
def delete_bill(request, id):
    deleted = db.delete_bill(id)
    if deleted:
        return JsonResponse({"message": f"Bill {id} deleted successfully"})
    else:
        return JsonResponse({"error": f"Bill {id} not found"}, status=404)
