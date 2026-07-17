from django.urls import path
import views

urlpatterns = [
    # Customer CRUD
    path('customers/add/', views.customers_list_or_add, name='customer_add'),
    path('customers/', views.customers_list_or_add, name='customers_list'),
    path('customers/update/<int:id>/', views.customer_update_or_delete, name='customer_update'),
    path('customers/delete/<int:id>/', views.customer_update_or_delete, name='customer_delete'),
    
    # Island CRUD
    path('islands/add/', views.islands_list_or_add, name='island_add'),
    path('islands/', views.islands_list_or_add, name='islands_list'),
    path('islands/update/<int:id>/', views.island_update_or_delete, name='island_update'),
    path('islands/delete/<int:id>/', views.island_update_or_delete, name='island_delete'),
    
    # Resort & Package CRUD
    path('packages/add/', views.packages_list_or_add, name='package_add'),
    path('packages/', views.packages_list_or_add, name='packages_list'),
    path('packages/update/<int:id>/', views.package_update_or_delete, name='package_update'),
    path('packages/delete/<int:id>/', views.package_update_or_delete, name='package_delete'),
    
    # Booking CRUD
    path('bookings/add/', views.bookings_list_or_add, name='booking_add'),
    path('bookings/', views.bookings_list_or_add, name='bookings_list'),
    path('bookings/update/<int:id>/', views.booking_update_or_delete, name='booking_update'),
    path('bookings/delete/<int:id>/', views.booking_update_or_delete, name='booking_delete'),
    
    # Payment CRUD
    path('payments/add/', views.payments_list_or_add, name='payment_add'),
    path('payments/', views.payments_list_or_add, name='payments_list'),
    path('payments/update/<int:id>/', views.payment_update_or_delete, name='payment_update'),
    path('payments/delete/<int:id>/', views.payment_update_or_delete, name='payment_delete'),
]
