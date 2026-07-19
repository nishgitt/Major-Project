import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    # Initialize the database on startup
    try:
        import db
        db.db_init()
        print("Database initialized successfully.")
    except Exception as e:
        print("Error initializing database:", e)
        
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
