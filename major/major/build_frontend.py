#!/usr/bin/env python3
"""
Script to build the React frontend for production
"""

import os
import sys
import subprocess
from pathlib import Path

def build_frontend():
    """Build the React frontend for production"""
    print("🔨 Building React frontend for production...")
    try:
        # Check if node_modules exists
        if not Path('node_modules').exists():
            print("📦 Installing frontend dependencies first...")
            subprocess.run(['npm', 'install'], check=True)
            print("✅ Frontend dependencies installed")
        
        # Run the build command
        subprocess.run(['npm', 'run', 'build'], check=True)
        print("✅ Frontend built successfully")
        print("📁 Build files are in the 'build' directory")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to build frontend: {e}")
        sys.exit(1)

if __name__ == "__main__":
    build_frontend()