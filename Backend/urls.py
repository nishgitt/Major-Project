from django.urls import path
import views

urlpatterns = [
    # Patients API
    path('patients/add/', views.add_patient, name='add_patient'),
    path('patients/', views.get_patients, name='get_patients'),
    path('patients/update/<int:id>/', views.update_patient, name='update_patient'),
    path('patients/delete/<int:id>/', views.delete_patient, name='delete_patient'),
    
    # Doctors API
    path('doctors/add/', views.add_doctor, name='add_doctor'),
    path('doctors/', views.get_doctors, name='get_doctors'),
    path('doctors/update/<int:id>/', views.update_doctor, name='update_doctor'),
    path('doctors/delete/<int:id>/', views.delete_doctor, name='delete_doctor'),
    
    # Appointments API
    path('appointments/add/', views.add_appointment, name='add_appointment'),
    path('appointments/', views.get_appointments, name='get_appointments'),
    path('appointments/update/<int:id>/', views.update_appointment, name='update_appointment'),
    path('appointments/delete/<int:id>/', views.delete_appointment, name='delete_appointment'),
    
    # Medical Records API
    path('records/add/', views.add_record, name='add_record'),
    path('records/', views.get_records, name='get_records'),
    path('records/update/<int:id>/', views.update_record, name='update_record'),
    path('records/delete/<int:id>/', views.delete_record, name='delete_record'),
    
    # Billing API
    path('bills/add/', views.add_bill, name='add_bill'),
    path('bills/', views.get_bills, name='get_bills'),
    path('bills/update/<int:id>/', views.update_bill, name='update_bill'),
    path('bills/delete/<int:id>/', views.delete_bill, name='delete_bill'),
]
