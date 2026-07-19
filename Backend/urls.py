from django.urls import path
import views

urlpatterns = [
    # Users endpoints
    path('users/add/', views.user_add, name='user_add'),
    path('users/', views.user_list, name='user_list'),
    path('users/update/<int:id>/', views.user_update, name='user_update'),
    path('users/delete/<int:id>/', views.user_delete, name='user_delete'),
    path('users/login/', views.user_login, name='user_login'),

    # Events endpoints
    path('events/add/', views.event_add, name='event_add'),
    path('events/', views.event_list, name='event_list'),
    path('events/update/<int:id>/', views.event_update, name='event_update'),
    path('events/delete/<int:id>/', views.event_delete, name='event_delete'),

    # Venues endpoints
    path('venues/add/', views.venue_add, name='venue_add'),
    path('venues/', views.venue_list, name='venue_list'),
    path('venues/update/<int:id>/', views.venue_update, name='venue_update'),
    path('venues/delete/<int:id>/', views.venue_delete, name='venue_delete'),

    # Bookings endpoints
    path('bookings/add/', views.booking_add, name='booking_add'),
    path('bookings/', views.booking_list, name='booking_list'),
    path('bookings/update/<int:id>/', views.booking_update, name='booking_update'),
    path('bookings/delete/<int:id>/', views.booking_delete, name='booking_delete'),

    # Payments endpoints
    path('payments/add/', views.payment_add, name='payment_add'),
    path('payments/', views.payment_list, name='payment_list'),
    path('payments/update/<int:id>/', views.payment_update, name='payment_update'),
    path('payments/delete/<int:id>/', views.payment_delete, name='payment_delete'),
    
    # Reviews endpoints
    path('events/reviews/add/', views.review_add, name='review_add'),
    path('events/reviews/<int:id>/', views.review_list, name='review_list'),
]
