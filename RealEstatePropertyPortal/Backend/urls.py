from django.urls import path
import views

urlpatterns = [
    # Customer APIs
    path('customers/add/', views.add_customer, name='add_customer'),
    path('customers/', views.get_customers, name='get_customers'),
    path('customers/update/<int:id>/', views.update_customer, name='update_customer'),
    path('customers/delete/<int:id>/', views.delete_customer, name='delete_customer'),
    
    # Property APIs
    path('properties/add/', views.add_property, name='add_property'),
    path('properties/', views.get_properties, name='get_properties'),
    path('properties/update/<int:id>/', views.update_property, name='update_property'),
    path('properties/delete/<int:id>/', views.delete_property, name='delete_property'),
    
    # Agent APIs
    path('agents/add/', views.add_agent, name='add_agent'),
    path('agents/', views.get_agents, name='get_agents'),
    path('agents/update/<int:id>/', views.update_agent, name='update_agent'),
    path('agents/delete/<int:id>/', views.delete_agent, name='delete_agent'),
    
    # Booking APIs
    path('bookings/add/', views.add_booking, name='add_booking'),
    path('bookings/', views.get_bookings, name='get_bookings'),
    path('bookings/update/<int:id>/', views.update_booking, name='update_booking'),
    path('bookings/delete/<int:id>/', views.delete_booking, name='delete_booking'),
    
    # Inquiry APIs
    path('inquiries/add/', views.add_inquiry, name='add_inquiry'),
    path('inquiries/', views.get_inquiries, name='get_inquiries'),
    path('inquiries/update/<int:id>/', views.update_inquiry, name='update_inquiry'),
    path('inquiries/delete/<int:id>/', views.delete_inquiry, name='delete_inquiry'),

    # Wishlist APIs (Bonus Feature)
    path('favorites/add/', views.add_favorite_api, name='add_favorite'),
    path('favorites/delete/<int:customer_id>/<int:property_id>/', views.remove_favorite_api, name='remove_favorite'),
    path('favorites/<int:customer_id>/', views.get_favorites_api, name='get_favorites'),

    # Auth API
    path('auth/login/', views.login_api, name='login_api'),

    # Frontend serving endpoints
    path('', views.serve_frontend, name='serve_index'),
    path('<path:path>', views.serve_frontend, name='serve_static'),
]
