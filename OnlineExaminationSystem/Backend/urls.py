from django.urls import path
import views

urlpatterns = [
    # Students API
    path('students/add/', views.add_student, name='add_student'),
    path('students/', views.get_students, name='get_students'),
    path('students/update/<int:id>/', views.update_student, name='update_student'),
    path('students/delete/<int:id>/', views.delete_student, name='delete_student'),
    
    # Exams API
    path('exams/add/', views.add_exam, name='add_exam'),
    path('exams/', views.get_exams, name='get_exams'),
    path('exams/update/<int:id>/', views.update_exam, name='update_exam'),
    path('exams/delete/<int:id>/', views.delete_exam, name='delete_exam'),
    
    # Questions API
    path('questions/add/', views.add_question, name='add_question'),
    path('questions/', views.get_questions, name='get_questions'),
    path('questions/update/<int:id>/', views.update_question, name='update_question'),
    path('questions/delete/<int:id>/', views.delete_question, name='delete_question'),
    
    # Submissions API
    path('submissions/add/', views.add_submission, name='add_submission'),
    path('submissions/', views.get_submissions, name='get_submissions'),
    path('submissions/update/<int:id>/', views.update_submission, name='update_submission'),
    path('submissions/delete/<int:id>/', views.delete_submission, name='delete_submission'),
    
    # Results API
    path('results/add/', views.add_result, name='add_result'),
    path('results/', views.get_results, name='get_results'),
    path('results/update/<int:id>/', views.update_result, name='update_result'),
    path('results/delete/<int:id>/', views.delete_result, name='delete_result'),
]
