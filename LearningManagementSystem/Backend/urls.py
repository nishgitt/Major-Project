from django.urls import path
import views

urlpatterns = [
    # Auth Helper API
    path('auth/login/', views.login_view, name='login'),
    
    # Students API
    path('students/add/', views.add_student, name='add_student'),
    path('students/', views.get_students, name='get_students'),
    path('students/update/<int:id>/', views.update_student, name='update_student'),
    path('students/delete/<int:id>/', views.delete_student, name='delete_student'),
    
    # Instructors API
    path('instructors/add/', views.add_instructor, name='add_instructor'),
    path('instructors/', views.get_instructors, name='get_instructors'),
    path('instructors/update/<int:id>/', views.update_instructor, name='update_instructor'),
    path('instructors/delete/<int:id>/', views.delete_instructor, name='delete_instructor'),
    
    # Courses API
    path('courses/add/', views.add_course, name='add_course'),
    path('courses/', views.get_courses, name='get_courses'),
    path('courses/update/<int:id>/', views.update_course, name='update_course'),
    path('courses/delete/<int:id>/', views.delete_course, name='delete_course'),
    
    # Enrollments API
    path('enrollments/add/', views.add_enrollment, name='add_enrollment'),
    path('enrollments/', views.get_enrollments, name='get_enrollments'),
    path('enrollments/update/<int:id>/', views.update_enrollment, name='update_enrollment'),
    path('enrollments/delete/<int:id>/', views.delete_enrollment, name='delete_enrollment'),
    
    # Assignments API
    path('assignments/add/', views.add_assignment, name='add_assignment'),
    path('assignments/', views.get_assignments, name='get_assignments'),
    path('assignments/update/<int:id>/', views.update_assignment, name='update_assignment'),
    path('assignments/delete/<int:id>/', views.delete_assignment, name='delete_assignment'),
]
