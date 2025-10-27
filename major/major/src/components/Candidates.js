import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Mail, 
  Star, 
  User, 
  Phone, 
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState(0);
  const [jobRoleFilter, setJobRoleFilter] = useState('');
  const [jobRoles, setJobRoles] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [emailCount, setEmailCount] = useState(5);
  const [emailMinScore, setEmailMinScore] = useState(0.5);
  const [sendingEmails, setSendingEmails] = useState(false);

  const sendEmails = async () => {
    setSendingEmails(true);
    try {
      const payload = {
        num_candidates: emailCount,
        min_score: emailMinScore
      };
      // If All Scores is selected, set min_score to 0 to include all eligible candidates
      if (emailMinScore === 0) {
        payload.min_score = 0;
      }
      const response = await axios.post('/api/send-emails', payload);
      toast.success(response.data.message || 'Emails sent successfully');
      fetchCandidates();
    } catch (error) {
      toast.error('Failed to send emails');
      console.error('Error sending emails:', error);
    } finally {
      setSendingEmails(false);
    }
  };

  const fetchJobRoles = useCallback(async () => {
    try {
      const response = await axios.get('/api/candidates/job-roles');
      setJobRoles(response.data || []);
    } catch (error) {
      console.error('Error fetching job roles:', error);
    }
  }, []);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 20,
        status: statusFilter,
        min_score: minScoreFilter,
        job_requirements_id: jobRoleFilter,
        search: searchTerm
      };

      const response = await axios.get('/api/candidates', { params });
      setCandidates(response.data.candidates);
      setTotalPages(response.data.pages);
      setTotalCandidates(response.data.total);
    } catch (error) {
      toast.error('Failed to fetch candidates');
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, minScoreFilter, jobRoleFilter, searchTerm]);

  useEffect(() => {
    fetchJobRoles();
    fetchCandidates();
  }, [fetchCandidates, fetchJobRoles]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCandidates();
  };

  const updateCandidateStatus = async (candidateId, status) => {
    try {
      await axios.put(`/api/candidates/${candidateId}`, { status });
      toast.success('Candidate status updated successfully');
      fetchCandidates();
    } catch (error) {
      toast.error('Failed to update candidate status');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'selected':
        return 'text-green-600 bg-green-100';
      case 'screened':
        return 'text-blue-600 bg-blue-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const openCandidateModal = (candidate) => {
    setSelectedCandidate(candidate);
    setShowModal(true);
  };

  const deleteCandidate = async (candidateId) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await axios.delete(`/api/candidates/${candidateId}`);
      toast.success('Candidate deleted successfully');
      fetchCandidates();
      closeModal();
    } catch (error) {
      toast.error('Failed to delete candidate');
      console.error('Error deleting candidate:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCandidate(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Email Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600 mt-1">
            Manage and review screened candidates ({totalCandidates} total)
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2 mt-4 md:mt-0">
          <input
            type="number"
            min={1}
            max={totalCandidates}
            value={emailCount}
            onChange={e => setEmailCount(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg w-24"
            placeholder="Count"
          />
          <select
            value={emailMinScore}
            onChange={e => setEmailMinScore(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value={0.8}>High Score (≥80%)</option>
            <option value={0.6}>Medium Score (≥60%)</option>
            <option value={0.4}>Low Score (≥40%)</option>
            <option value={0}>All Scores (no threshold)</option>
          </select>
          <button
            onClick={sendEmails}
            disabled={sendingEmails}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {sendingEmails ? 'Sending...' : 'Send Emails'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Job Role Filter */}
          <select
            value={jobRoleFilter}
            onChange={(e) => setJobRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Job Roles</option>
            {jobRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.title} ({role.candidate_count})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="screened">Screened</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Score Filter */}
          <select
            value={minScoreFilter}
            onChange={(e) => setMinScoreFilter(parseFloat(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value={0}>All Scores</option>
            <option value={0.8}>High Score (≥80%)</option>
            <option value={0.6}>Medium Score (≥60%)</option>
            <option value={0.4}>Low Score (≥40%)</option>
          </select>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skills
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {candidate.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {candidate.filename}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {candidate.job_title || 'Unknown Role'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {candidate.job_requirements_id || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{candidate.email}</div>
                        {candidate.phone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {candidate.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{candidate.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {candidate.experience_years} years
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(candidate.score)}`}>
                          {(candidate.score * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                          {candidate.status}
                        </span>
                        {candidate.email_sent && (
                          <div className="mt-1">
                            <Mail className="h-3 w-3 text-green-500" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openCandidateModal(candidate)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateCandidateStatus(candidate.id, 'selected')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteCandidate(candidate.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * 20, totalCandidates)}
                    </span>{' '}
                    of <span className="font-medium">{totalCandidates}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Candidate Detail Modal */}
      {showModal && selectedCandidate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Candidate Details
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Personal Information</h4>
                  <p><strong>Name:</strong> {selectedCandidate.name || 'Unknown'}</p>
                  <p><strong>Email:</strong> {selectedCandidate.email}</p>
                  <p><strong>Phone:</strong> {selectedCandidate.phone || 'Not provided'}</p>
                  <p><strong>Job Role:</strong> {selectedCandidate.job_title || 'Unknown Role'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Skills</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedCandidate.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Experience & Score</h4>
                  <p><strong>Years of Experience:</strong> {selectedCandidate.experience_years}</p>
                  <p><strong>Screening Score:</strong> {(selectedCandidate.score * 100).toFixed(1)}%</p>
                  <p><strong>Status:</strong> {selectedCandidate.status}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">File Information</h4>
                  <p><strong>Filename:</strong> {selectedCandidate.filename}</p>
                  <p><strong>Uploaded:</strong> {new Date(selectedCandidate.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    updateCandidateStatus(selectedCandidate.id, 'selected');
                    closeModal();
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Mark as Selected
                </button>
                <button
                  onClick={() => deleteCandidate(selectedCandidate.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;
