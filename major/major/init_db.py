#!/usr/bin/env python3
"""
Database initialization script for AI Resume Screening Application
"""

import os
import sys
import json
from datetime import datetime

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db, Candidate, JobRequirements
from config import *

def init_database():
    """Initialize database with tables and sample data"""
    try:
        with app.app_context():
            print("🗄️  Creating database tables...")
            db.create_all()
            print("✅ Database tables created successfully")
            
            # Check if we already have job requirements
            if not JobRequirements.query.first():
                print("📋 Creating default job requirements...")
                default_requirements = JobRequirements(
                    title="Software Developer",
                    required_skills=json.dumps(['python', 'javascript', 'sql']),
                    preferred_skills=json.dumps(['react', 'node.js', 'aws']),
                    min_experience=2.0,
                    education_requirements="Bachelor's degree in Computer Science or related field"
                )
                db.session.add(default_requirements)
                
                # Add a few more job requirements
                senior_dev = JobRequirements(
                    title="Senior Software Engineer",
                    required_skills=json.dumps(['python', 'javascript', 'sql', 'react', 'node.js']),
                    preferred_skills=json.dumps(['aws', 'docker', 'kubernetes', 'microservices']),
                    min_experience=5.0,
                    education_requirements="Bachelor's degree in Computer Science or related field"
                )
                db.session.add(senior_dev)
                
                data_scientist = JobRequirements(
                    title="Data Scientist",
                    required_skills=json.dumps(['python', 'statistics', 'machine learning']),
                    preferred_skills=json.dumps(['pandas', 'numpy', 'scikit-learn', 'tensorflow']),
                    min_experience=3.0,
                    education_requirements="Master's degree in Data Science, Statistics, or related field"
                )
                db.session.add(data_scientist)
                
                db.session.commit()
                print("✅ Default job requirements created")
            else:
                print("ℹ️  Job requirements already exist")
            
            # Check if we have any candidates
            candidate_count = Candidate.query.count()
            print(f"👥 Found {candidate_count} existing candidates")
            
            print("\n🎉 Database initialization completed successfully!")
            print(f"📁 Database location: {DATABASE_URI}")
            print(f"📁 Upload folder: {UPLOAD_FOLDER}")
            
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        try:
            db.session.rollback()
        except Exception:
            pass
        sys.exit(1)

def check_database_health():
    """Check database health and connectivity"""
    try:
        with app.app_context():
            print("\n🔍 Checking database health...")
            
            # Test basic query
            job_count = JobRequirements.query.count()
            print(f"✅ Job requirements count: {job_count}")
            
            # Test candidate query
            candidate_count = Candidate.query.count()
            print(f"✅ Candidates count: {candidate_count}")
            
            # Test database connection
            result = db.session.execute(db.text('SELECT 1')).scalar()
            print(f"✅ Database connection test: {result}")
            
            print("✅ Database is healthy!")
            
    except Exception as e:
        print(f"❌ Database health check failed: {e}")
        return False
    
    return True

if __name__ == '__main__':
    print("🚀 AI Resume Screening - Database Initialization")
    print("=" * 50)
    
    init_database()
    check_database_health()
    
    print("\n" + "=" * 50)
    print("🎯 Next steps:")
    print("   1. Start the application: python app.py")
    print("   2. Open http://localhost:5000 in your browser")
    print("   3. Upload some resumes to test the system")
    print("   4. Check the statistics page for results")
