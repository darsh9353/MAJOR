#!/usr/bin/env python3
"""
Database migration script to add job_requirements_id to existing candidates
and set default values for candidates without job requirements.
"""

import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from app import app, db, Candidate, JobRequirements
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_database():
    """Migrate the database to add job_requirements_id column and set default values"""
    try:
        with app.app_context():
            logger.info("Starting database migration...")
            
            # Check if job_requirements_id column exists
            inspector = db.inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('candidate')]
            
            if 'job_requirements_id' not in columns:
                logger.info("Adding job_requirements_id column to Candidate table...")
                with db.engine.connect() as conn:
                    conn.execute(db.text('ALTER TABLE candidate ADD COLUMN job_requirements_id INTEGER'))
                    conn.commit()
                logger.info("Column added successfully")
            else:
                logger.info("job_requirements_id column already exists")
            
            # Get or create default job requirements
            default_job_req = JobRequirements.query.filter_by(title="Software Developer").first()
            if not default_job_req:
                logger.info("Creating default job requirements...")
                default_job_req = JobRequirements(
                    title="Software Developer",
                    required_skills='["python", "javascript", "sql"]',
                    preferred_skills='["react", "node.js", "aws"]',
                    min_experience=2.0,
                    education_requirements="Bachelor's degree in Computer Science or related field"
                )
                db.session.add(default_job_req)
                db.session.commit()
                logger.info(f"Default job requirements created with ID: {default_job_req.id}")
            
            # Update candidates without job_requirements_id
            candidates_without_job_req = Candidate.query.filter(Candidate.job_requirements_id.is_(None)).all()
            logger.info(f"Found {len(candidates_without_job_req)} candidates without job_requirements_id")
            
            if candidates_without_job_req:
                logger.info("Setting default job requirements for existing candidates...")
                for candidate in candidates_without_job_req:
                    candidate.job_requirements_id = default_job_req.id
                
                db.session.commit()
                logger.info(f"Updated {len(candidates_without_job_req)} candidates with default job requirements")
            
            logger.info("Database migration completed successfully!")
            
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        try:
            db.session.rollback()
        except Exception:
            pass
        raise

if __name__ == '__main__':
    migrate_database()
