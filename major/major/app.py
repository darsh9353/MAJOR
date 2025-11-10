from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
import os
import json
import re
import PyPDF2
from docx import Document
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email_validator import validate_email, EmailNotValidError
import threading
import time
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Attempt to detect NLTK data locally without downloading at runtime
HAVE_NLTK_PUNKT = False
HAVE_NLTK_STOPWORDS = False
try:
    nltk.data.find('tokenizers/punkt')
    HAVE_NLTK_PUNKT = True
except LookupError:
    pass

try:
    nltk.data.find('corpora/stopwords')
    HAVE_NLTK_STOPWORDS = True
except LookupError:
    pass

app = Flask(__name__)
CORS(app)

# Import configuration
from config import *

# Configuration
app.config['SECRET_KEY'] = SECRET_KEY
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = str(UPLOAD_FOLDER)
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

db = SQLAlchemy(app)

# Database Models
class Candidate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    filename = db.Column(db.String(200), nullable=False)
    resume_text = db.Column(db.Text)
    skills = db.Column(db.Text)  # JSON string of skills
    experience_years = db.Column(db.Float, default=0)
    education = db.Column(db.Text)
    score = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), default='pending')  # pending, screened, selected, rejected
    screening_date = db.Column(db.DateTime)
    email_sent = db.Column(db.Boolean, default=False)
    email_sent_date = db.Column(db.DateTime)
    job_requirements_id = db.Column(db.Integer, db.ForeignKey('job_requirements.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class JobRequirements(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    required_skills = db.Column(db.Text)  # JSON string
    preferred_skills = db.Column(db.Text)  # JSON string
    min_experience = db.Column(db.Float, default=0)
    education_requirements = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ScreeningSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    job_requirements_id = db.Column(db.Integer, db.ForeignKey('job_requirements.id'))
    total_candidates = db.Column(db.Integer, default=0)
    selected_candidates = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default='active')  # active, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Resume Parser
class ResumeParser:
    def __init__(self):
        try:
            self.stop_words = set(stopwords.words('english')) if HAVE_NLTK_STOPWORDS else set()
        except Exception:
            self.stop_words = set()
        
    def extract_text_from_pdf(self, file_path):
        """Extract text from PDF file"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
                return text
        except Exception as e:
            logger.error(f"Error reading PDF: {e}")
            return ""
    
    def extract_text_from_docx(self, file_path):
        """Extract text from DOCX file"""
        try:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            logger.error(f"Error reading DOCX: {e}")
            return ""
    
    def extract_text(self, file_path):
        """Extract text from file based on extension"""
        file_extension = file_path.lower().split('.')[-1]
        
        if file_extension == 'pdf':
            return self.extract_text_from_pdf(file_path)
        elif file_extension == 'docx':
            return self.extract_text_from_docx(file_path)
        else:
            return ""
    
    def extract_contact_info(self, text):
        """Extract contact information from resume text"""
        # Email extraction
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        email = emails[0] if emails else ""
        
        # Phone extraction
        phone_pattern = r'(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})'
        phones = re.findall(phone_pattern, text)
        phone = ''.join(phones[0]) if phones else ""
        
        # Name extraction (simple approach)
        lines = text.split('\n')
        name = ""
        for line in lines[:10]:  # Check first 10 lines
            line = line.strip()
            if line and len(line.split()) <= 4 and not any(char.isdigit() for char in line):
                name = line
                break
        
        return {
            'name': name or "Unknown Candidate",
            'email': email or "no-email@example.com",
            'phone': phone or "No phone"
        }
    
    def extract_skills(self, text):
        """Extract skills from resume text"""
        # Common technical skills
        common_skills = [
            'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node.js',
            'sql', 'mongodb', 'postgresql', 'mysql', 'aws', 'azure', 'docker',
            'kubernetes', 'git', 'html', 'css', 'bootstrap', 'jquery', 'php',
            'c++', 'c#', '.net', 'spring', 'django', 'flask', 'express',
            'machine learning', 'ai', 'data science', 'statistics', 'r',
            'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
            'tableau', 'power bi', 'excel', 'word', 'powerpoint'
        ]
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in common_skills:
            if skill in text_lower:
                found_skills.append(skill)
        
        return found_skills
    
    def extract_experience(self, text):
        """Extract years of experience from resume text"""
        # Look for patterns like "X years of experience" or "X+ years"
        experience_patterns = [
            r'(\d+)\s*years?\s*of\s*experience',
            r'(\d+)\+\s*years?\s*of\s*experience',
            r'experience:\s*(\d+)\s*years?',
            r'(\d+)\s*years?\s*in\s*the\s*field'
        ]
        
        for pattern in experience_patterns:
            matches = re.findall(pattern, text.lower())
            if matches:
                return float(matches[0])
        
        return 0.0

# AI Resume Screener
class AIResumeScreener:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=TFIDF_MAX_FEATURES)
        self.parser = ResumeParser()
    
    def calculate_score(self, resume_text, job_requirements):
        """Calculate similarity score between resume and job requirements"""
        try:
            # Combine resume text and job requirements for vectorization
            documents = [resume_text, job_requirements]
            
            # Create TF-IDF vectors
            tfidf_matrix = self.vectorizer.fit_transform(documents)
            
            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            return float(similarity)
        except Exception as e:
            logger.error(f"Error calculating score: {e}")
            return 0.0
    
    def screen_resume(self, resume_text, job_requirements):
        """Screen a single resume"""
        # Extract information
        contact_info = self.parser.extract_contact_info(resume_text)
        skills = self.parser.extract_skills(resume_text)
        experience = self.parser.extract_experience(resume_text)
        
        # Calculate score
        score = self.calculate_score(resume_text, job_requirements)
        
        return {
            'contact_info': contact_info,
            'skills': skills,
            'experience': experience,
            'score': score
        }

# Email Service
class EmailService:
    def __init__(self):
        self.smtp_server = SMTP_SERVER
        self.smtp_port = SMTP_PORT
        self.sender_email = SENDER_EMAIL
        self.sender_password = SENDER_PASSWORD
    
    def send_interview_email(self, candidate_email, candidate_name, company_name="Our Company", 
                            custom_message="", include_score=False, candidate_score=None):
        """Send interview invitation email to candidate"""
        try:
            msg = MIMEMultipart()
            msg['From'] = self.sender_email
            msg['To'] = candidate_email
            msg['Subject'] = f"Interview Invitation - {company_name}"
            
            # Build email body
            body = f"""Dear {candidate_name},

We are pleased to inform you that your application has been selected for further consideration.

You have been shortlisted for an interview with {company_name}. Our team will contact you shortly to schedule the interview."""
            
            # Add score information if requested
            if include_score and candidate_score is not None:
                score_percentage = (candidate_score * 100)
                body += f"\n\nYour application scored {score_percentage:.1f}% in our screening process, which demonstrates a strong match with our requirements."
            
            # Add custom message if provided
            if custom_message and custom_message.strip():
                body += f"\n\n{custom_message}"
            
            body += f"""

Please ensure you are available for the interview and have all necessary documents ready.

We look forward to speaking with you soon.

Best regards,
{company_name} HR Team"""
            
            msg.attach(MIMEText(body, 'plain'))
            
            # Send email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.sender_email, self.sender_password)
            text = msg.as_string()
            server.sendmail(self.sender_email, candidate_email, text)
            server.quit()
            
            logger.info(f"Successfully sent email to {candidate_email}")
            return True
        except Exception as e:
            logger.error(f"Error sending email to {candidate_email}: {e}")
            return False

# Initialize services
screener = AIResumeScreener()
email_service = EmailService()

# API Routes
@app.route('/api/upload-resumes', methods=['POST'])
def upload_resumes():
    """Upload multiple resumes for screening"""
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        job_requirements_id = request.form.get('job_requirements_id', 1)
        
        if not files or files[0].filename == '':
            return jsonify({'error': 'No files selected'}), 400
        
        allowed_extensions = { 'pdf', 'docx' }
        failures = []
        uploaded_count = 0

        # Get job requirements; fall back to a safe default if missing
        job_req = JobRequirements.query.get(job_requirements_id)
        if job_req:
            req_required = []
            req_preferred = []
            try:
                req_required = json.loads(job_req.required_skills) if job_req.required_skills else []
            except Exception:
                req_required = []
            try:
                req_preferred = json.loads(job_req.preferred_skills) if job_req.preferred_skills else []
            except Exception:
                req_preferred = []
            job_requirements_text = f"{job_req.title} {' '.join(req_required)} {' '.join(req_preferred)}"
        else:
            job_requirements_text = "Software Developer python javascript sql"
        
        for file in files:
            if file and file.filename:
                try:
                    filename = secure_filename(file.filename)
                    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
                    if ext not in allowed_extensions:
                        failures.append({'filename': filename, 'reason': 'Unsupported file type. Allowed: PDF, DOCX'})
                        continue
                    
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    file.save(file_path)
                    
                    # Extract text from resume
                    resume_text = screener.parser.extract_text(file_path)
                    if not resume_text:
                        failures.append({'filename': filename, 'reason': 'Failed to extract text from file'})
                        continue
                    
                    # Screen resume
                    screening_result = screener.screen_resume(resume_text, job_requirements_text)
                    
                    # Save to database
                    candidate = Candidate(
                        name=screening_result['contact_info']['name'],
                        email=screening_result['contact_info']['email'],
                        phone=screening_result['contact_info']['phone'],
                        filename=filename,
                        resume_text=resume_text,
                        skills=json.dumps(screening_result['skills']),
                        experience_years=screening_result['experience'],
                        score=screening_result['score'],
                        status='screened',
                        screening_date=datetime.utcnow(),
                        job_requirements_id=job_requirements_id
                    )
                    
                    db.session.add(candidate)
                    uploaded_count += 1
                    logger.info(f"Successfully processed resume: {filename}")
                    
                except Exception as e:
                    logger.error(f"Error processing file {file.filename}: {e}")
                    failures.append({'filename': file.filename, 'reason': f'Processing error: {str(e)}'})
                    continue
        
        try:
            db.session.commit()
            logger.info(f"Successfully saved {uploaded_count} candidates to database")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Database error during commit: {e}")
            return jsonify({'error': f'Database error: {str(e)}'}), 500
        
        return jsonify({
            'message': f'Successfully processed {uploaded_count} resumes',
            'uploaded_count': uploaded_count,
            'failed': failures
        })
    
    except Exception as e:
        logger.error(f"Error in upload_resumes: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def healthcheck():
    """Simple health check to verify backend and DB are responsive"""
    try:
        # Lightweight DB check
        _ = db.session.execute(db.text('SELECT 1')).scalar()
        db_ok = True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_ok = False
    return jsonify({'status': 'ok', 'db': db_ok}), (200 if db_ok else 503)

@app.route('/api/candidates', methods=['GET'])
def get_candidates():
    """Get all candidates with optional filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        status = request.args.get('status', '')
        min_score = request.args.get('min_score', 0, type=float)
        job_requirements_id = request.args.get('job_requirements_id', '', type=str)
        search_term = request.args.get('search', '')
        
        query = Candidate.query
        
        if status:
            query = query.filter(Candidate.status == status)
        
        if min_score > 0:
            query = query.filter(Candidate.score >= min_score)
        
        if job_requirements_id and job_requirements_id != '':
            query = query.filter(Candidate.job_requirements_id == job_requirements_id)
        
        if search_term:
            query = query.filter(
                db.or_(
                    Candidate.name.ilike(f'%{search_term}%'),
                    Candidate.email.ilike(f'%{search_term}%'),
                    Candidate.filename.ilike(f'%{search_term}%')
                )
            )
        
        # Order by score descending
        query = query.order_by(Candidate.score.desc())
        
        candidates = query.paginate(page=page, per_page=per_page, error_out=False)
        
        result = {
            'candidates': [],
            'total': candidates.total,
            'pages': candidates.pages,
            'current_page': page
        }
        
        for candidate in candidates.items:
            try:
                skills = json.loads(candidate.skills) if candidate.skills else []
            except Exception:
                skills = []
            
            # Get job requirements title
            job_title = "Unknown Role"
            if candidate.job_requirements_id:
                job_req = JobRequirements.query.get(candidate.job_requirements_id)
                if job_req:
                    job_title = job_req.title
                
            result['candidates'].append({
                'id': candidate.id,
                'name': candidate.name,
                'email': candidate.email,
                'phone': candidate.phone,
                'filename': candidate.filename,
                'skills': skills,
                'experience_years': candidate.experience_years,
                'score': candidate.score,
                'status': candidate.status,
                'email_sent': candidate.email_sent,
                'job_requirements_id': candidate.job_requirements_id,
                'job_title': job_title,
                'created_at': candidate.created_at.isoformat() if candidate.created_at else None
            })
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in get_candidates: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/send-emails', methods=['POST'])
def send_emails():
    """Send emails to top candidates"""
    try:
        data = request.get_json()
        num_candidates = data.get('num_candidates', 10)
        min_score = data.get('min_score', 0.5)
        
        # Get email settings from request
        email_settings = data.get('email_settings', {})
        company_name = email_settings.get('companyName', COMPANY_NAME)
        custom_message = email_settings.get('customMessage', '')
        include_score = email_settings.get('includeScore', False)
        
        # Validate email configuration
        if not SENDER_EMAIL or SENDER_EMAIL == 'your-email@gmail.com':
            return jsonify({
                'error': 'Email not configured. Please set SENDER_EMAIL and SENDER_PASSWORD in your .env file or config.py',
                'sent_count': 0,
                'failed_count': 0
            }), 400
        
        # Get top candidates
        candidates = Candidate.query.filter(
            Candidate.score >= min_score,
            Candidate.email_sent == False
        ).order_by(Candidate.score.desc()).limit(num_candidates).all()
        
        sent_count = 0
        failed_count = 0
        failed_emails = []
        
        for candidate in candidates:
            if candidate.email and candidate.email != 'no-email@example.com':
                try:
                    success = email_service.send_interview_email(
                        candidate_email=candidate.email,
                        candidate_name=candidate.name or "Candidate",
                        company_name=company_name,
                        custom_message=custom_message,
                        include_score=include_score,
                        candidate_score=candidate.score
                    )
                    
                    if success:
                        candidate.email_sent = True
                        candidate.email_sent_date = datetime.utcnow()
                        candidate.status = 'selected'
                        sent_count += 1
                    else:
                        failed_count += 1
                        failed_emails.append(candidate.email)
                except Exception as e:
                    logger.error(f"Error sending email to {candidate.email}: {e}")
                    failed_count += 1
                    failed_emails.append(candidate.email)
            else:
                failed_count += 1
                logger.warning(f"Skipping candidate {candidate.id} - invalid email address")
        
        db.session.commit()
        
        response = {
            'message': f'Successfully sent {sent_count} emails, {failed_count} failed',
            'sent_count': sent_count,
            'failed_count': failed_count
        }
        
        if failed_emails:
            response['failed_emails'] = failed_emails[:5]  # Include first 5 failed emails for debugging
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error in send_emails: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/job-requirements', methods=['GET', 'POST'])
def job_requirements():
    """Get or create job requirements"""
    if request.method == 'GET':
        try:
            requirements = JobRequirements.query.all()
            return jsonify([{
                'id': req.id,
                'title': req.title,
                'required_skills': json.loads(req.required_skills) if req.required_skills else [],
                'preferred_skills': json.loads(req.preferred_skills) if req.preferred_skills else [],
                'min_experience': req.min_experience,
                'education_requirements': req.education_requirements
            } for req in requirements])
        except Exception as e:
            logger.error(f"Error in job_requirements GET: {e}")
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            requirement = JobRequirements(
                title=data['title'],
                required_skills=json.dumps(data.get('required_skills', [])),
                preferred_skills=json.dumps(data.get('preferred_skills', [])),
                min_experience=data.get('min_experience', 0),
                education_requirements=data.get('education_requirements', '')
            )
            
            db.session.add(requirement)
            db.session.commit()
            
            return jsonify({'message': 'Job requirements created successfully', 'id': requirement.id})
        except Exception as e:
            logger.error(f"Error in job_requirements POST: {e}")
            return jsonify({'error': str(e)}), 500

@app.route('/api/job-requirements/<int:req_id>', methods=['PUT', 'DELETE'])
def modify_job_requirement(req_id):
    """Update or delete a specific job requirement"""
    try:
        requirement = JobRequirements.query.get_or_404(req_id)

        if request.method == 'PUT':
            data = request.get_json() or {}

            if 'title' in data:
                requirement.title = data['title']
            if 'required_skills' in data:
                requirement.required_skills = json.dumps(data.get('required_skills') or [])
            if 'preferred_skills' in data:
                requirement.preferred_skills = json.dumps(data.get('preferred_skills') or [])
            if 'min_experience' in data:
                requirement.min_experience = data.get('min_experience') or 0
            if 'education_requirements' in data:
                requirement.education_requirements = data.get('education_requirements') or ''

            db.session.commit()
            return jsonify({'message': 'Job requirements updated successfully'})

        # DELETE
        db.session.delete(requirement)
        db.session.commit()
        return jsonify({'message': 'Job requirements deleted successfully'})

    except Exception as e:
        logger.error(f"Error in modify_job_requirement: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Get screening statistics"""
    try:
        total_candidates = Candidate.query.count()
        screened_candidates = Candidate.query.filter(Candidate.status == 'screened').count()
        selected_candidates = Candidate.query.filter(Candidate.status == 'selected').count()
        emails_sent = Candidate.query.filter(Candidate.email_sent == True).count()
        
        avg_score = db.session.query(db.func.avg(Candidate.score)).scalar() or 0
        
        logger.info(f"Statistics calculated: total={total_candidates}, screened={screened_candidates}, selected={selected_candidates}, emails={emails_sent}, avg_score={avg_score}")
        
        return jsonify({
            'total_candidates': total_candidates,
            'screened_candidates': screened_candidates,
            'selected_candidates': selected_candidates,
            'emails_sent': emails_sent,
            'average_score': round(avg_score, 3)
        })
    
    except Exception as e:
        logger.error(f"Error in get_statistics: {e}")
        # Gracefully degrade with zeroed stats to avoid frontend failures
        return jsonify({
            'total_candidates': 0,
            'screened_candidates': 0,
            'selected_candidates': 0,
            'emails_sent': 0,
            'average_score': 0
        })

@app.route('/api/candidates/<int:candidate_id>', methods=['PUT'])
def update_candidate(candidate_id):
    """Update candidate status"""
    try:
        candidate = Candidate.query.get_or_404(candidate_id)
        data = request.get_json()
        
        if 'status' in data:
            candidate.status = data['status']
        
        if 'score' in data:
            candidate.score = data['score']
        
        db.session.commit()
        
        return jsonify({'message': 'Candidate updated successfully'})
    
    except Exception as e:
        logger.error(f"Error in update_candidate: {e}")
        return jsonify({'error': str(e)}), 500
@app.route('/api/candidates/<int:candidate_id>', methods=['DELETE'])
def delete_candidate(candidate_id):
    """Delete a candidate by ID"""
    try:
        candidate = Candidate.query.get_or_404(candidate_id)
        db.session.delete(candidate)
        db.session.commit()
        return jsonify({'message': 'Candidate deleted successfully'})
    except Exception as e:
        logger.error(f"Error in delete_candidate: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/candidates/job-roles', methods=['GET'])
def get_candidate_job_roles():
    """Get unique job roles from candidates"""
    try:
        # Get distinct job_requirements_id from candidates
        distinct_job_ids = db.session.query(Candidate.job_requirements_id).distinct().all()
        job_ids = [job_id[0] for job_id in distinct_job_ids if job_id[0] is not None]
        
        # Get job requirements details
        job_roles = []
        for job_id in job_ids:
            job_req = JobRequirements.query.get(job_id)
            if job_req:
                # Count candidates for this job role
                candidate_count = Candidate.query.filter(Candidate.job_requirements_id == job_id).count()
                job_roles.append({
                    'id': job_req.id,
                    'title': job_req.title,
                    'candidate_count': candidate_count
                })
        
        return jsonify(job_roles)
    except Exception as e:
        logger.error(f"Error in get_candidate_job_roles: {e}")
        return jsonify({'error': str(e)}), 500

# Create database tables
def init_database():
    """Initialize database with proper error handling"""
    try:
        with app.app_context():
            db.create_all()
            logger.info("Database tables created successfully")
            
            # Create default job requirements if none exist
            if not JobRequirements.query.first():
                default_requirements = JobRequirements(
                    title="Software Developer",
                    required_skills=json.dumps(['python', 'javascript', 'sql']),
                    preferred_skills=json.dumps(['react', 'node.js', 'aws']),
                    min_experience=2.0,
                    education_requirements="Bachelor's degree in Computer Science or related field"
                )
                db.session.add(default_requirements)
                db.session.commit()
                logger.info("Default job requirements created")
                
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        try:
            db.session.rollback()
        except Exception:
            pass

# Initialize database when app starts
init_database()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
