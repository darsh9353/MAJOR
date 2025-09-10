import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResumeUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [jobRequirements, setJobRequirements] = useState([]);
  const [selectedJobReq, setSelectedJobReq] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchJobRequirements();
  }, []);

  const fetchJobRequirements = async () => {
    try {
      const response = await axios.get('/api/job-requirements');
      const reqs = response.data || [];
      setJobRequirements(reqs);
      if (reqs.length > 0) {
        setSelectedJobReq(reqs[0].id);
      } else {
        toast.warning('No job requirements found. Please create one first.');
      }
    } catch (error) {
      toast.error('Failed to fetch job requirements');
      console.error('Failed to fetch job requirements:', error);
    }
  };

  const onDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true
  });

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach(({ file }) => {
      formData.append('files', file);
    });
    formData.append('job_requirements_id', selectedJobReq);

    try {
      const response = await axios.post('/api/upload-resumes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      const failed = Array.isArray(response.data.failed) ? response.data.failed : [];
      const uploaded = Number(response.data.uploaded_count) || 0;
      if (uploaded > 0) {
        toast.success(`Successfully uploaded and screened ${uploaded} resume${uploaded !== 1 ? 's' : ''}`);
      }
      if (failed.length > 0) {
        const preview = failed.slice(0, 3).map(f => `${f.filename}: ${f.reason}`).join('\n');
        toast.warn(`Some files failed (${failed.length}).\n${preview}${failed.length > 3 ? '\n…' : ''}`);
      }
      setFiles([]);
      setUploadProgress(0);
    } catch (error) {
      toast.error('Failed to upload resumes');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setUploadProgress(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upload Resumes
        </h1>
        <p className="text-gray-600">
          Upload multiple resumes (PDF, DOCX) for AI-powered screening
        </p>
      </div>

      {/* Job Requirements Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Job Requirements</h2>
        <select
          value={selectedJobReq}
          onChange={(e) => setSelectedJobReq(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {jobRequirements.map((req) => (
            <option key={req.id} value={req.id}>
              {req.title}
            </option>
          ))}
        </select>
      </div>

      {/* Dropzone */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-primary-600 font-medium">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drag & drop resumes here
              </p>
              <p className="text-gray-600 mb-4">
                or click to select files (PDF, DOCX)
              </p>
              <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Browse Files
              </button>
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Selected Files ({files.length})
            </h3>
            <button
              onClick={clearAll}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-3">
            {files.map(({ id, file, status, progress }) => (
              <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-600">{progress}%</span>
                    </div>
                  )}
                  {status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <button
                    onClick={() => removeFile(id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Uploading...</span>
            <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && !uploading && (
        <div className="flex justify-center">
          <button
            onClick={uploadFiles}
            disabled={uploading}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} Resume${files.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Instructions</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>Supported formats: PDF, DOCX, DOC</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>Maximum file size: 16MB per file</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>You can upload multiple files at once</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>Resumes will be automatically screened using AI</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ResumeUpload;
