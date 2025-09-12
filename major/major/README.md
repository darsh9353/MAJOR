# AI Resume Screening Application

A comprehensive AI-powered resume screening application that can process 1000+ resumes, automatically score candidates based on job requirements, and send interview invitations to top candidates.

## 🚀 Features

### Core Functionality
- **AI-Powered Resume Screening**: Uses NLP and machine learning to analyze resumes
- **Multi-Format Support**: Handles PDF, DOCX, and DOC files
- **Bulk Processing**: Upload and screen hundreds of resumes simultaneously
- **Smart Scoring**: TF-IDF based similarity scoring between resumes and job requirements
- **Automated Email System**: Send interview invitations to top candidates
- **Customizable Job Requirements**: Define required and preferred skills, experience levels

### Advanced Features
- **Contact Information Extraction**: Automatically extracts names, emails, and phone numbers
- **Skills Detection**: Identifies technical skills from resume content
- **Experience Analysis**: Calculates years of experience from resume text
- **Candidate Management**: View, filter, and manage screened candidates
- **Comprehensive Analytics**: Detailed statistics and performance metrics
- **Responsive UI**: Modern, mobile-friendly interface

### Technical Features
- **Scalable Architecture**: Built to handle 1000+ resumes efficiently
- **Real-time Processing**: Immediate feedback on upload and screening
- **Database Storage**: SQLite database for persistent data storage
- **RESTful API**: Clean API endpoints for all operations
- **Modern Frontend**: React with Tailwind CSS for beautiful UI

## 🛠️ Technology Stack

### Backend
- **Python 3.8+**
- **Flask**: Web framework
- **SQLAlchemy**: Database ORM
- **NLTK**: Natural language processing
- **scikit-learn**: Machine learning for text analysis
- **PyPDF2**: PDF text extraction
- **python-docx**: DOCX file processing

### Frontend
- **React 18**: Modern UI framework
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **React Router**: Client-side routing
- **React Dropzone**: File upload component
- **Lucide React**: Icon library

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn package manager

## 🚀 Installation & Setup

### Quick Start (Windows)
If you're on Windows, you can use the provided batch files:

#### Production Mode
```bash
build_and_run.bat
```
This will build the React frontend for production and start the Flask server.

#### Development Mode
```bash
test_solution.bat
```
This will start both the backend and frontend servers in development mode with proper timing to avoid proxy errors.

#### Backend Only
```bash
start_backend.bat
```
This will automatically set up the virtual environment, install dependencies, and start the backend.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ai-resume-screener
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### Set up Environment Variables
Create a `.env` file in the root directory:
```env
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password
FLASK_SECRET_KEY=your-secret-key-here
```

**Note**: For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in the SENDER_PASSWORD field

#### Initialize the Database
```bash
python init_db.py
```
This will create the database tables and default job requirements.

#### Test the Backend
```bash
python test_backend.py
```
This will test all API endpoints to ensure everything is working correctly.

### 3. Frontend Setup

#### Install Node.js Dependencies
```bash
npm install
```

#### Start the Development Server
```bash
npm start
```

### 4. Start the Backend Server
```bash
python app.py
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📖 Usage Guide

### 1. Setting Up Job Requirements
1. Navigate to "Job Requirements" in the sidebar
2. Click "Add Job Requirements"
3. Fill in:
   - Job title
   - Required skills (e.g., python, javascript, sql)
   - Preferred skills (e.g., react, aws, docker)
   - Minimum experience requirements
   - Education requirements
4. Save the requirements

### 2. Uploading Resumes
1. Go to "Upload Resumes"
2. Select job requirements from the dropdown
3. Drag and drop resume files (PDF, DOCX, DOC) or click to browse
4. Click "Upload Resumes" to start processing
5. The system will automatically:
   - Extract text from resumes
   - Parse contact information
   - Identify skills and experience
   - Calculate similarity scores
   - Store results in the database

### 3. Reviewing Candidates
1. Navigate to "Candidates"
2. Use filters to:
   - Search by name or email
   - Filter by status (screened, selected, rejected)
   - Filter by minimum score
3. View candidate details by clicking the eye icon
4. Update candidate status as needed

### 4. Sending Interview Emails
1. Go to "Send Emails"
2. Configure email settings:
   - Number of candidates to email
   - Minimum score threshold
   - Company name
   - Custom message (optional)
3. Review the preview of top candidates
4. Click "Send Emails" to send interview invitations

### 5. Viewing Statistics
1. Navigate to "Statistics"
2. View comprehensive analytics including:
   - Score distributions
   - Top skills found
   - Experience distributions
   - Performance metrics
   - Recent activity

## 🔧 Configuration

### Email Configuration
To enable email functionality, update the `.env` file with your email credentials:

```env
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password
```

### Database Configuration
The application uses SQLite by default. To use a different database, update the `SQLALCHEMY_DATABASE_URI` in `app.py`:

```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/dbname'
```

### File Upload Limits
Modify the maximum file size in `app.py`:

```python
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024  # 32MB
```

## 📊 API Endpoints

### Resume Management
- `POST /api/upload-resumes` - Upload and screen resumes
- `GET /api/candidates` - Get candidates with filtering
- `PUT /api/candidates/<id>` - Update candidate status

### Email Management
- `POST /api/send-emails` - Send interview invitations

### Job Requirements
- `GET /api/job-requirements` - Get all job requirements
- `POST /api/job-requirements` - Create new job requirements
- `PUT /api/job-requirements/<id>` - Update job requirements
- `DELETE /api/job-requirements/<id>` - Delete job requirements

### Statistics
- `GET /api/statistics` - Get screening statistics

## 🎯 AI Screening Algorithm

The application uses a sophisticated AI screening process:

1. **Text Extraction**: Extracts text from PDF and DOCX files
2. **Information Parsing**: 
   - Contact information extraction using regex patterns
   - Skills identification from predefined skill lists
   - Experience calculation from text patterns
3. **Similarity Scoring**: 
   - TF-IDF vectorization of resume text and job requirements
   - Cosine similarity calculation
   - Score normalization (0-1 scale)
4. **Ranking**: Candidates ranked by similarity score

## 🔒 Security Features

- Input validation and sanitization
- File type restrictions
- SQL injection prevention
- XSS protection
- Secure file handling

## 🚀 Deployment

### Production Deployment
1. Set up a production server (AWS, DigitalOcean, etc.)
2. Install dependencies
3. Configure environment variables
4. Set up a production database (PostgreSQL recommended)
5. Use a production WSGI server (Gunicorn)
6. Set up reverse proxy (Nginx)

### Docker Deployment
```bash
# Build the Docker image
docker build -t ai-resume-screener .

# Run the container
docker run -p 5000:5000 ai-resume-screener
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
1. Check the documentation
2. Review the [Troubleshooting Guide](TROUBLESHOOTING.md)
3. Review existing issues
4. Create a new issue with detailed information

## 🔧 Troubleshooting

If you encounter issues with:
- **Resumes not saving**: Run `python init_db.py` to reinitialize the database
- **Statistics not loading**: Check if candidates exist in the database
- **File upload failures**: Verify file types (PDF/DOCX only) and size (max 16MB)
- **Backend errors**: Check the console output for detailed error messages

For detailed troubleshooting steps, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## 🔮 Future Enhancements

- Integration with job boards (LinkedIn, Indeed)
- Advanced NLP models (BERT, GPT)
- Multi-language support
- Video interview scheduling
- Advanced analytics and reporting
- Mobile application
- API rate limiting
- User authentication and roles

## 📈 Performance

The application is optimized for:
- Processing 1000+ resumes efficiently
- Real-time scoring and ranking
- Fast search and filtering
- Responsive UI interactions
- Scalable database operations

---

**Built with ❤️ for efficient hiring processes**
