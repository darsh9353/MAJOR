#!/usr/bin/env python3
"""
AI Resume Screening Application Startup Script
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python version: {sys.version.split()[0]}")

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import flask
        import nltk
        import sklearn
        import PyPDF2
        import docx
        print("✅ All Python dependencies are installed")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        sys.exit(1)

def setup_environment():
    """Setup environment variables"""
    env_file = Path('.env')
    if not env_file.exists():
        print("⚠️  No .env file found. Creating from template...")
        try:
            with open('env.example', 'r') as f:
                template = f.read()
            with open('.env', 'w') as f:
                f.write(template)
            print("✅ Created .env file from template")
            print("⚠️  Please update .env file with your email credentials")
        except FileNotFoundError:
            print("❌ env.example file not found")
            sys.exit(1)

def install_frontend_dependencies():
    """Install frontend dependencies if needed"""
    if not Path('node_modules').exists():
        print("📦 Installing frontend dependencies...")
        try:
            subprocess.run(['npm', 'install'], check=True)
            print("✅ Frontend dependencies installed")
        except subprocess.CalledProcessError:
            print("❌ Failed to install frontend dependencies")
            print("Please run: npm install")
            sys.exit(1)
    else:
        print("✅ Frontend dependencies already installed")

def start_backend():
    """Start the Flask backend server"""
    print("🚀 Starting backend server...")
    try:
        # Initialize database first
        print("🗄️  Initializing database...")
        subprocess.run([sys.executable, 'init_db.py'], check=True)
        print("✅ Database initialized")
        
        # Start the server
        subprocess.Popen([sys.executable, 'app.py'])
        print("✅ Backend server started on http://localhost:5000")
    except Exception as e:
        print(f"❌ Failed to start backend server: {e}")
        sys.exit(1)

def start_frontend():
    """Start the React frontend server"""
    print("🚀 Starting frontend server...")
    try:
        subprocess.Popen(['npm', 'start'])
        print("✅ Frontend server started on http://localhost:3000")
    except Exception as e:
        print(f"❌ Failed to start frontend server: {e}")
        sys.exit(1)

def main():
    """Main startup function"""
    print("🎯 AI Resume Screening Application")
    print("=" * 50)
    
    # Check requirements
    check_python_version()
    check_dependencies()
    setup_environment()
    install_frontend_dependencies()
    
    print("\n🚀 Starting application...")
    
    # Start servers
    start_backend()
    time.sleep(2)  # Give backend time to start
    start_frontend()
    
    print("\n" + "=" * 50)
    print("🎉 Application is starting up!")
    print("📱 Frontend: http://localhost:3000")
    print("🔧 Backend API: http://localhost:5000")
    print("\n💡 Tips:")
    print("   - Make sure to update .env file with your email credentials")
    print("   - Upload resumes in PDF or DOCX format")
    print("   - Set up job requirements before screening resumes")
    print("\n🛑 Press Ctrl+C to stop the application")

if __name__ == "__main__":
    try:
        main()
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down application...")
        sys.exit(0)
