from django.urls import path
import views

urlpatterns = [
    # Passenger endpoints
    path('passengers/add/', views.passenger_add, name='passenger_add'),
    path('passengers/', views.passenger_list, name='passenger_list'),
    path('passengers/update/<int:id>/', views.passenger_update, name='passenger_update'),
    path('passengers/delete/<int:id>/', views.passenger_delete, name='passenger_delete'),
    path('passengers/login/', views.passenger_login, name='passenger_login'),

    # Ship endpoints
    path('ships/add/', views.ship_add, name='ship_add'),
    path('ships/', views.ship_list, name='ship_list'),
    path('ships/update/<int:id>/', views.ship_update, name='ship_update'),
    path('ships/delete/<int:id>/', views.ship_delete, name='ship_delete'),

    # Schedule endpoints
    path('schedules/add/', views.schedule_add, name='schedule_add'),
    path('schedules/', views.schedule_list, name='schedule_list'),
    path('schedules/update/<int:id>/', views.schedule_update, name='schedule_update'),
    path('schedules/delete/<int:id>/', views.schedule_delete, name='schedule_delete'),

    # Booking endpoints
    path('bookings/add/', views.booking_add, name='booking_add'),
    path('bookings/', views.booking_list, name='booking_list'),
    path('bookings/update/<int:id>/', views.booking_update, name='booking_update'),
    path('bookings/delete/<int:id>/', views.booking_delete, name='booking_delete'),

    # Payment endpoints
    path('payments/add/', views.payment_add, name='payment_add'),
    path('payments/', views.payment_list, name='payment_list'),
    path('payments/update/<int:id>/', views.payment_update, name='payment_update'),
    path('payments/delete/<int:id>/', views.payment_delete, name='payment_delete'),
    
    # Reviews endpoints
    path('ships/reviews/add/', views.review_add, name='review_add'),
    path('ships/reviews/<int:id>/', views.review_list, name='review_list'),
]
