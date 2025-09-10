import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Mail, 
  TrendingUp, 
  Upload, 
  Send,
  BarChart3,
  Settings
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_candidates: 0,
    screened_candidates: 0,
    selected_candidates: 0,
    emails_sent: 0,
    average_score: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/api/statistics');
      const d = response.data || {};
      setStats({
        total_candidates: Number(d.total_candidates) || 0,
        screened_candidates: Number(d.screened_candidates) || 0,
        selected_candidates: Number(d.selected_candidates) || 0,
        emails_sent: Number(d.emails_sent) || 0,
        average_score: Number(d.average_score) || 0
      });
    } catch (error) {
      toast.error('Failed to fetch statistics');
      console.error('Error fetching statistics:', error);
      // fallback to zeros to avoid UI breakage
      setStats({
        total_candidates: 0,
        screened_candidates: 0,
        selected_candidates: 0,
        emails_sent: 0,
        average_score: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Upload Resumes',
      description: 'Upload and screen multiple resumes',
      icon: Upload,
      path: '/upload',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'View Candidates',
      description: 'Browse and manage screened candidates',
      icon: Users,
      path: '/candidates',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Send Emails',
      description: 'Send interview invitations to top candidates',
      icon: Send,
      path: '/emails',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Job Requirements',
      description: 'Manage job requirements and criteria',
      icon: Settings,
      path: '/requirements',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'View Statistics',
      description: 'Detailed analytics and reports',
      icon: BarChart3,
      path: '/statistics',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    }
  ];

  const statCards = [
    {
      title: 'Total Candidates',
      value: stats.total_candidates,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Screened',
      value: stats.screened_candidates,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Selected',
      value: stats.selected_candidates,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Emails Sent',
      value: stats.emails_sent,
      icon: Mail,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

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
          AI Resume Screening Dashboard
        </h1>
        <p className="text-gray-600">
          Streamline your hiring process with AI-powered resume screening
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 fade-in">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Average Score Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Average Screening Score</h3>
            <p className="text-3xl font-bold text-primary-600">
              {(stats.average_score * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Based on {stats.screened_candidates} resumes</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.path}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 fade-in"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-full ${action.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">
                {stats.screened_candidates} resumes screened today
              </span>
            </div>
            <span className="text-sm text-gray-500">Today</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-700">
                {stats.emails_sent} interview invitations sent
              </span>
            </div>
            <span className="text-sm text-gray-500">This week</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span className="text-gray-700">
                {stats.selected_candidates} candidates selected for interviews
              </span>
            </div>
            <span className="text-sm text-gray-500">This month</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
