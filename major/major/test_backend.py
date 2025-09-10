#!/usr/bin/env python3
"""
Test script for AI Resume Screening Backend
"""

import requests
import json
import time
import os
from pathlib import Path

# Backend URL
BASE_URL = "http://localhost:5000"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_job_requirements():
    """Test job requirements endpoints"""
    print("\n📋 Testing job requirements...")
    try:
        # Get job requirements
        response = requests.get(f"{BASE_URL}/api/job-requirements")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Job requirements retrieved: {len(data)} found")
            return True
        else:
            print(f"❌ Job requirements failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Job requirements error: {e}")
        return False

def test_statistics():
    """Test statistics endpoint"""
    print("\n📊 Testing statistics...")
    try:
        response = requests.get(f"{BASE_URL}/api/statistics")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Statistics retrieved: {data}")
            return True
        else:
            print(f"❌ Statistics failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Statistics error: {e}")
        return False

def test_candidates():
    """Test candidates endpoint"""
    print("\n👥 Testing candidates...")
    try:
        response = requests.get(f"{BASE_URL}/api/candidates")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Candidates retrieved: {data['total']} total")
            return True
        else:
            print(f"❌ Candidates failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Candidates error: {e}")
        return False

def test_resume_upload():
    """Test resume upload with a sample file"""
    print("\n📤 Testing resume upload...")
    
    # Check if we have sample resumes
    uploads_dir = Path("uploads")
    sample_files = list(uploads_dir.glob("*.pdf")) + list(uploads_dir.glob("*.docx"))
    
    if not sample_files:
        print("⚠️  No sample resumes found in uploads directory")
        print("   Please add some PDF or DOCX files to test upload")
        return False
    
    sample_file = sample_files[0]
    print(f"📁 Using sample file: {sample_file.name}")
    
    try:
        # Get job requirements first
        job_req_response = requests.get(f"{BASE_URL}/api/job-requirements")
        if job_req_response.status_code != 200:
            print("❌ Could not get job requirements for upload test")
            return False
        
        job_reqs = job_req_response.json()
        if not job_reqs:
            print("❌ No job requirements available for upload test")
            return False
        
        job_req_id = job_reqs[0]['id']
        
        # Prepare upload
        with open(sample_file, 'rb') as f:
            files = {'files': (sample_file.name, f, 'application/octet-stream')}
            data = {'job_requirements_id': str(job_req_id)}
            
            response = requests.post(f"{BASE_URL}/api/upload-resumes", files=files, data=data)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Resume upload successful: {data}")
                return True
            else:
                print(f"❌ Resume upload failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Resume upload error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 AI Resume Screening Backend Test")
    print("=" * 50)
    
    # Wait a bit for backend to start
    print("⏳ Waiting for backend to start...")
    time.sleep(2)
    
    tests = [
        test_health_check,
        test_job_requirements,
        test_statistics,
        test_candidates,
        test_resume_upload
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the backend logs for issues.")
    
    print("\n💡 Tips:")
    print("   - Make sure the backend is running: python app.py")
    print("   - Check the console for any error messages")
    print("   - Verify the database is initialized: python init_db.py")

if __name__ == '__main__':
    main()
