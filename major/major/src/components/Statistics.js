import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Mail, 
  Star,
  FileText,
  Calendar,
  Target
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Statistics = () => {
  const [stats, setStats] = useState({
    total_candidates: 0,
    screened_candidates: 0,
    selected_candidates: 0,
    emails_sent: 0,
    average_score: 0
  });
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, candidatesResponse] = await Promise.all([
        axios.get('/api/statistics'),
        axios.get('/api/candidates', { params: { per_page: 1000 } })
      ]);
      
      const s = statsResponse.data || {};
      setStats({
        total_candidates: Number(s.total_candidates) || 0,
        screened_candidates: Number(s.screened_candidates) || 0,
        selected_candidates: Number(s.selected_candidates) || 0,
        emails_sent: Number(s.emails_sent) || 0,
        average_score: Number(s.average_score) || 0
      });
      const list = (candidatesResponse.data && candidatesResponse.data.candidates) || [];
      setCandidates(Array.isArray(list) ? list : []);
    } catch (error) {
      toast.error('Failed to fetch statistics');
      console.error('Error fetching data:', error);
      setStats({
        total_candidates: 0,
        screened_candidates: 0,
        selected_candidates: 0,
        emails_sent: 0,
        average_score: 0
      });
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const getScoreDistribution = () => {
    const distribution = {
      'High (80-100%)': 0,
      'Good (60-79%)': 0,
      'Average (40-59%)': 0,
      'Low (0-39%)': 0
    };

    candidates.forEach(candidate => {
      const score = candidate.score * 100;
      if (score >= 80) distribution['High (80-100%)']++;
      else if (score >= 60) distribution['Good (60-79%)']++;
      else if (score >= 40) distribution['Average (40-59%)']++;
      else distribution['Low (0-39%)']++;
    });

    return distribution;
  };

  const getTopSkills = () => {
    const skillCount = {};
    
    candidates.forEach(candidate => {
      candidate.skills.forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });

    return Object.entries(skillCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));
  };

  const getExperienceDistribution = () => {
    const distribution = {
      '0-2 years': 0,
      '3-5 years': 0,
      '6-8 years': 0,
      '9+ years': 0
    };

    candidates.forEach(candidate => {
      const exp = candidate.experience_years;
      if (exp <= 2) distribution['0-2 years']++;
      else if (exp <= 5) distribution['3-5 years']++;
      else if (exp <= 8) distribution['6-8 years']++;
      else distribution['9+ years']++;
    });

    return distribution;
  };

  const getStatusDistribution = () => {
    const distribution = {
      'Screened': 0,
      'Selected': 0,
      'Rejected': 0
    };

    candidates.forEach(candidate => {
      if (candidate.status === 'selected') distribution['Selected']++;
      else if (candidate.status === 'rejected') distribution['Rejected']++;
      else distribution['Screened']++;
    });

    return distribution;
  };

  const scoreDistribution = getScoreDistribution();
  const topSkills = getTopSkills();
  const experienceDistribution = getExperienceDistribution();
  const statusDistribution = getStatusDistribution();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Screening Statistics
        </h1>
        <p className="text-gray-600">
          Comprehensive analytics and insights from your resume screening process
        </p>
      </div>

      {/* Time Range Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Time Range</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Screened</p>
              <p className="text-2xl font-bold text-gray-900">{stats.screened_candidates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Selected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.selected_candidates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <Mail className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.emails_sent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Score Distribution</h2>
        <div className="space-y-4">
          {Object.entries(scoreDistribution).map(([range, count]) => {
            const percentage = stats.total_candidates > 0 ? (count / stats.total_candidates * 100).toFixed(1) : 0;
            const color = range.includes('High') ? 'bg-green-500' : 
                         range.includes('Good') ? 'bg-blue-500' : 
                         range.includes('Average') ? 'bg-yellow-500' : 'bg-red-500';
            
            return (
              <div key={range} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${color}`}></div>
                  <span className="text-sm font-medium text-gray-700">{range}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                    <div
                      className={`h-2 rounded-full ${color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {count} ({percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Skills */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Skills Found</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topSkills.map(({ skill, count }, index) => (
            <div key={skill} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                <span className="text-sm text-gray-700 capitalize">{skill}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{count} candidates</span>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Experience Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(experienceDistribution).map(([range, count]) => (
            <div key={range} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">{range}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Candidate Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(statusDistribution).map(([status, count]) => {
            const color = status === 'Selected' ? 'text-green-600 bg-green-100' :
                         status === 'Rejected' ? 'text-red-600 bg-red-100' :
                         'text-blue-600 bg-blue-100';
            
            return (
              <div key={status} className="text-center p-6 bg-gray-50 rounded-lg">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color} mb-3`}>
                  {status}
                </div>
                <div className="text-3xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">
                  {stats.total_candidates > 0 ? (count / stats.total_candidates * 100).toFixed(1) : 0}% of total
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {(stats.average_score * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-blue-700 font-medium">Average Score</div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {stats.total_candidates > 0 ? (stats.selected_candidates / stats.total_candidates * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-green-700 font-medium">Selection Rate</div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {stats.selected_candidates > 0 ? (stats.emails_sent / stats.selected_candidates * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-purple-700 font-medium">Email Response Rate</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">
                {stats.screened_candidates} resumes processed
              </span>
            </div>
            <span className="text-sm text-gray-500">Total</span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-700">
                {stats.emails_sent} interview invitations sent
              </span>
            </div>
            <span className="text-sm text-gray-500">Total</span>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span className="text-gray-700">
                {stats.selected_candidates} candidates shortlisted
              </span>
            </div>
            <span className="text-sm text-gray-500">Total</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
