import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ResumeUpload from './components/ResumeUpload';
import Candidates from './components/Candidates';
import EmailSender from './components/EmailSender';
import JobRequirements from './components/JobRequirements';
import Statistics from './components/Statistics';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<ResumeUpload />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/emails" element={<EmailSender />} />
            <Route path="/requirements" element={<JobRequirements />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </main>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;