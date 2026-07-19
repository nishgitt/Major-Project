from django.urls import path
import views

urlpatterns = [
    # Customer APIs
    path('customers/add/', views.add_customer, name='add_customer'),
    path('customers/', views.get_customers, name='get_customers'),
    path('customers/update/<int:id>/', views.update_customer, name='update_customer'),
    path('customers/delete/<int:id>/', views.delete_customer, name='delete_customer'),
    
    # Service APIs
    path('services/add/', views.add_service, name='add_service'),
    path('services/', views.get_services, name='get_services'),
    path('services/update/<int:id>/', views.update_service, name='update_service'),
    path('services/delete/<int:id>/', views.delete_service, name='delete_service'),
    
    # Stylist APIs
    path('stylists/add/', views.add_stylist, name='add_stylist'),
    path('stylists/', views.get_stylists, name='get_stylists'),
    path('stylists/update/<int:id>/', views.update_stylist, name='update_stylist'),
    path('stylists/delete/<int:id>/', views.delete_stylist, name='delete_stylist'),
    
    # Appointment APIs
    path('appointments/add/', views.add_appointment, name='add_appointment'),
    path('appointments/', views.get_appointments, name='get_appointments'),
    path('appointments/update/<int:id>/', views.update_appointment, name='update_appointment'),
    path('appointments/delete/<int:id>/', views.delete_appointment, name='delete_appointment'),
    
    # Payment APIs
    path('payments/add/', views.add_payment, name='add_payment'),
    path('payments/', views.get_payments, name='get_payments'),
    path('payments/update/<int:id>/', views.update_payment, name='update_payment'),
    path('payments/delete/<int:id>/', views.delete_payment, name='delete_payment'),

    # Reviews APIs (Bonus Feature)
    path('reviews/add/', views.add_review, name='add_review'),
    path('reviews/', views.get_reviews, name='get_reviews'),
    
    # Auth API
    path('auth/login/', views.login_api, name='login_api'),
    
    # Frontend serving endpoints
    path('', views.serve_frontend, name='serve_index'),
    path('<path:path>', views.serve_frontend, name='serve_static'),
]
