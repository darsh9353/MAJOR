# Troubleshooting Guide

## Common Backend Issues and Solutions

### 1. Resumes Not Saving to Database

**Symptoms:**
- Files upload but don't appear in candidates list
- No error messages in frontend
- Database remains empty

**Solutions:**
1. **Check Database Initialization:**
   ```bash
   python init_db.py
   ```

2. **Verify Database File:**
   - Check if `instance/resume_screening.db` exists
   - Ensure the file has write permissions

3. **Check Backend Logs:**
   - Look for error messages in the console where `app.py` is running
   - Check for database connection errors

4. **Test Database Health:**
   ```bash
   python test_backend.py
   ```

### 2. Statistics API Failing

**Symptoms:**
- Statistics page shows 0 for all values
- Frontend displays error messages
- Backend returns 500 errors

**Solutions:**
1. **Check Database Tables:**
   ```bash
   python init_db.py
   ```

2. **Verify API Endpoints:**
   - Test `/api/health` endpoint
   - Check if `/api/statistics` returns data

3. **Check for Data:**
   - Ensure candidates exist in database
   - Verify job requirements are created

### 3. File Upload Issues

**Symptoms:**
- Files not uploading
- "Failed to extract text" errors
- File size errors

**Solutions:**
1. **Check File Types:**
   - Only PDF and DOCX files are supported
   - Ensure files are not corrupted

2. **Verify File Size:**
   - Maximum file size is 16MB
   - Check file permissions

3. **Check Upload Directory:**
   - Ensure `uploads/` directory exists
   - Verify write permissions

### 4. Database Connection Issues

**Symptoms:**
- Backend won't start
- Database errors in logs
- Tables not created

**Solutions:**
1. **Reinitialize Database:**
   ```bash
   python init_db.py
   ```

2. **Check SQLite Installation:**
   - SQLite should be included with Python
   - Verify Python version (3.8+ required)

3. **Check File Permissions:**
   - Ensure write access to `instance/` directory
   - Check if database file is locked

### 5. NLTK Data Issues

**Symptoms:**
- Text extraction fails
- Skills not detected
- Processing errors

**Solutions:**
1. **Install NLTK Data:**
   ```python
   import nltk
   nltk.download('punkt')
   nltk.download('stopwords')
   ```

2. **Check NLTK Installation:**
   ```bash
   pip install nltk
   ```

### 6. Email Service Issues

**Symptoms:**
- Interview emails not sending
- SMTP errors
- Authentication failures

**Solutions:**
1. **Update Email Configuration:**
   - Set `SENDER_EMAIL` and `SENDER_PASSWORD` in environment
   - Use app-specific passwords for Gmail

2. **Check SMTP Settings:**
   - Verify SMTP server and port
   - Check firewall settings

### 7. Performance Issues

**Symptoms:**
- Slow file processing
- High memory usage
- Timeout errors

**Solutions:**
1. **Reduce File Size:**
   - Compress large PDFs
   - Use smaller images in documents

2. **Check System Resources:**
   - Monitor CPU and memory usage
   - Close unnecessary applications

## Quick Fix Commands

```bash
# 1. Stop all running processes
# (Ctrl+C in terminal)

# 2. Clean up and reinitialize
rm -rf instance/resume_screening.db
python init_db.py

# 3. Start backend
python app.py

# 4. Test in new terminal
python test_backend.py

# 5. Start frontend (in another terminal)
npm start
```

## Debug Mode

Enable debug mode to see detailed error messages:

```bash
export FLASK_ENV=development
export FLASK_DEBUG=1
python app.py
```

## Log Files

Check these locations for error logs:
- Console output where `app.py` is running
- Browser developer console (F12)
- Network tab for API call failures

## Still Having Issues?

1. **Check Python Version:**
   ```bash
   python --version
   # Should be 3.8 or higher
   ```

2. **Verify Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Test Individual Components:**
   ```bash
   python -c "import flask, nltk, sklearn; print('All imports successful')"
   ```

4. **Check File Structure:**
   ```
   major/
   ├── app.py
   ├── config.py
   ├── init_db.py
   ├── test_backend.py
   ├── instance/
   ├── uploads/
   └── requirements.txt
   ```
