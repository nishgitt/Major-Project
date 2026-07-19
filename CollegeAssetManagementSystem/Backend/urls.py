from django.urls import path
import views

urlpatterns = [
    # Admin Auth API endpoint
    path('admin/login/', views.admin_login, name='admin_login'),
    path('upload/', views.upload_file, name='upload_file'),
    
    # Asset API endpoints
    path('assets/add/', views.add_asset, name='add_asset'),
    path('assets/', views.get_assets, name='get_assets'),
    path('assets/update/<int:id>/', views.update_asset, name='update_asset'),
    path('assets/delete/<int:id>/', views.delete_asset, name='delete_asset'),
    
    # Category API endpoints
    path('categories/add/', views.add_category, name='add_category'),
    path('categories/', views.get_categories, name='get_categories'),
    path('categories/update/<int:id>/', views.update_category, name='update_category'),
    path('categories/delete/<int:id>/', views.delete_category, name='delete_category'),
    
    # Department API endpoints
    path('departments/add/', views.add_department, name='add_department'),
    path('departments/', views.get_departments, name='get_departments'),
    path('departments/update/<int:id>/', views.update_department, name='update_department'),
    path('departments/delete/<int:id>/', views.delete_department, name='delete_department'),
    
    # Vendor API endpoints
    path('vendors/add/', views.add_vendor, name='add_vendor'),
    path('vendors/', views.get_vendors, name='get_vendors'),
    path('vendors/update/<int:id>/', views.update_vendor, name='update_vendor'),
    path('vendors/delete/<int:id>/', views.delete_vendor, name='delete_vendor'),
    
    # Allocation API endpoints
    path('allocations/add/', views.add_allocation, name='add_allocation'),
    path('allocations/', views.get_allocations, name='get_allocations'),
    path('allocations/update/<int:id>/', views.update_allocation, name='update_allocation'),
    path('allocations/delete/<int:id>/', views.delete_allocation, name='delete_allocation'),
    
    # Frontend serving endpoints
    path('', views.serve_frontend, name='serve_index'),
    path('<path:path>', views.serve_frontend, name='serve_static'),
]
