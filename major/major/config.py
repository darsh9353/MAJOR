import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent

# Flask Configuration
SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'your-secret-key-here-change-this-in-production')
DEBUG = os.getenv('FLASK_ENV', 'development') == 'development'

# Database Configuration
DATABASE_URI = os.getenv('DATABASE_URL', f'sqlite:///{BASE_DIR}/instance/resume_screening.db')

# File Upload Configuration
UPLOAD_FOLDER = BASE_DIR / 'uploads'
MAX_CONTENT_LENGTH = int(os.getenv('MAX_FILE_SIZE', 16 * 1024 * 1024))  # 16MB default

# Email Configuration
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SENDER_EMAIL = os.getenv('SENDER_EMAIL', 'your-email@gmail.com')
SENDER_PASSWORD = os.getenv('SENDER_PASSWORD', 'your-app-password')

# Company Information
COMPANY_NAME = os.getenv('COMPANY_NAME', 'Your Company Name')
COMPANY_WEBSITE = os.getenv('COMPANY_WEBSITE', 'https://yourcompany.com')

# Logging Configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# NLTK Configuration
NLTK_DATA_PATH = os.getenv('NLTK_DATA_PATH', None)

# AI Model Configuration
TFIDF_MAX_FEATURES = int(os.getenv('TFIDF_MAX_FEATURES', 1000))
MIN_SCORE_THRESHOLD = float(os.getenv('MIN_SCORE_THRESHOLD', 0.1))

# Create necessary directories
UPLOAD_FOLDER.mkdir(exist_ok=True)
(BASE_DIR / 'instance').mkdir(exist_ok=True)
