import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Users, 
  Send, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Star,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmailSender = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [numCandidates, setNumCandidates] = useState(10);
  const [minScore, setMinScore] = useState(0.5);
  const [emailSettings, setEmailSettings] = useState({
    companyName: 'Our Company',
    customMessage: '',
    includeScore: true
  });
  const [stats, setStats] = useState({
    total_candidates: 0,
    selected_candidates: 0,
    emails_sent: 0
  });

  useEffect(() => {
    fetchCandidates();
    fetchStats();
  }, [minScore]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/candidates', {
        params: {
          min_score: minScore,
          per_page: 100,
          status: 'screened'
        }
      });
      
      // Filter out candidates who already received emails
      const eligibleCandidates = response.data.candidates.filter(
        candidate => !candidate.email_sent
      );
      
      setCandidates(eligibleCandidates);
    } catch (error) {
      toast.error('Failed to fetch candidates');
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/statistics');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const sendEmails = async () => {
    if (numCandidates <= 0) {
      toast.error('Please select a valid number of candidates');
      return;
    }

    setSending(true);
    try {
          const payload = {
            num_candidates: numCandidates,
            min_score: minScore === 0 ? 0 : minScore
          };
          const response = await axios.post('/api/send-emails', payload);

      toast.success(`Successfully sent ${response.data.sent_count} emails`);
      fetchCandidates();
      fetchStats();
    } catch (error) {
      toast.error('Failed to send emails');
      console.error('Error sending emails:', error);
    } finally {
      setSending(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const eligibleCandidates = candidates.slice(0, numCandidates);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Send Interview Emails
        </h1>
        <p className="text-gray-600">
          Send interview invitations to top candidates automatically
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_candidates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Selected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.selected_candidates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.emails_sent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Settings className="h-5 w-5 text-gray-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Email Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Number of Candidates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Candidates to Email
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={numCandidates}
              onChange={(e) => setNumCandidates(parseInt(e.target.value) || 1)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum: {candidates.length} eligible candidates
            </p>
          </div>

          {/* Minimum Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Score Threshold
            </label>
            <select
              value={minScore}
              onChange={(e) => setMinScore(parseFloat(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={0.3}>Low (≥30%)</option>
              <option value={0.5}>Medium (≥50%)</option>
              <option value={0.7}>High (≥70%)</option>
              <option value={0.8}>Very High (≥80%)</option>
              <option value={0}>All Scores (no threshold)</option>
            </select>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={emailSettings.companyName}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, companyName: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Your Company Name"
            />
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Include Score in Email
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={emailSettings.includeScore}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, includeScore: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Show candidate's screening score in email
              </span>
            </div>
          </div>
        </div>

        {/* Custom Message */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Message (Optional)
          </label>
          <textarea
            value={emailSettings.customMessage}
            onChange={(e) => setEmailSettings(prev => ({ ...prev, customMessage: e.target.value }))}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Add a custom message to include in the interview invitation..."
          />
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Preview - Top {Math.min(numCandidates, eligibleCandidates.length)} Candidates
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {eligibleCandidates.length} eligible candidates
            </span>
            <button
              onClick={sendEmails}
              disabled={sending || eligibleCandidates.length === 0}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Emails
                </>
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : eligibleCandidates.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No eligible candidates</h3>
            <p className="text-gray-600">
              All candidates have already received emails or don't meet the score threshold.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {eligibleCandidates.map((candidate, index) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                        {index < 3 && (
                          <TrendingUp className="h-4 w-4 text-yellow-500 ml-2" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {candidate.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {candidate.filename}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(candidate.score)}`}>
                        {(candidate.score * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.experience_years} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ready to Email
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Email Template Preview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Template Preview</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <strong>Subject:</strong> Interview Invitation - {emailSettings.companyName}
            </div>
            <div>
              <strong>Body:</strong>
              <div className="mt-2 text-gray-700 whitespace-pre-line">
                Dear [Candidate Name],

                We are pleased to inform you that your application has been selected for further consideration.

                You have been shortlisted for an interview with {emailSettings.companyName}. Our team will contact you shortly to schedule the interview.

                {emailSettings.includeScore && 'Your application scored highly in our screening process.'}

                {emailSettings.customMessage && `\n${emailSettings.customMessage}`}

                Please ensure you are available for the interview and have all necessary documents ready.

                Best regards,
                {emailSettings.companyName} HR Team
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSender;
