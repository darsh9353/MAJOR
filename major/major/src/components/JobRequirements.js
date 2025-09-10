import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const JobRequirements = () => {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    required_skills: [],
    preferred_skills: [],
    min_experience: 0,
    education_requirements: ''
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/job-requirements');
      setRequirements(response.data);
    } catch (error) {
      toast.error('Failed to fetch job requirements');
      console.error('Error fetching requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Job title is required');
      return;
    }

    try {
      if (editingId) {
        // Update existing requirement
        await axios.put(`/api/job-requirements/${editingId}`, formData);
        toast.success('Job requirements updated successfully');
      } else {
        // Create new requirement
        await axios.post('/api/job-requirements', formData);
        toast.success('Job requirements created successfully');
      }
      
      resetForm();
      fetchRequirements();
    } catch (error) {
      toast.error('Failed to save job requirements');
      console.error('Error saving requirements:', error);
    }
  };

  const handleEdit = (requirement) => {
    setEditingId(requirement.id);
    setFormData({
      title: requirement.title,
      required_skills: requirement.required_skills,
      preferred_skills: requirement.preferred_skills,
      min_experience: requirement.min_experience,
      education_requirements: requirement.education_requirements
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job requirement?')) {
      try {
        await axios.delete(`/api/job-requirements/${id}`);
        toast.success('Job requirements deleted successfully');
        fetchRequirements();
      } catch (error) {
        toast.error('Failed to delete job requirements');
        console.error('Error deleting requirements:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      required_skills: [],
      preferred_skills: [],
      min_experience: 0,
      education_requirements: ''
    });
    setEditingId(null);
    setShowForm(false);
    setNewSkill('');
  };

  const addSkill = (type) => {
    if (!newSkill.trim()) return;
    
    const skill = newSkill.trim().toLowerCase();
    if (type === 'required') {
      if (!formData.required_skills.includes(skill)) {
        setFormData(prev => ({
          ...prev,
          required_skills: [...prev.required_skills, skill]
        }));
      }
    } else {
      if (!formData.preferred_skills.includes(skill)) {
        setFormData(prev => ({
          ...prev,
          preferred_skills: [...prev.preferred_skills, skill]
        }));
      }
    }
    setNewSkill('');
  };

  const removeSkill = (type, skill) => {
    if (type === 'required') {
      setFormData(prev => ({
        ...prev,
        required_skills: prev.required_skills.filter(s => s !== skill)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        preferred_skills: prev.preferred_skills.filter(s => s !== skill)
      }));
    }
  };

  const commonSkills = [
    'python', 'javascript', 'java', 'react', 'angular', 'vue', 'node.js',
    'sql', 'mongodb', 'postgresql', 'mysql', 'aws', 'azure', 'docker',
    'kubernetes', 'git', 'html', 'css', 'bootstrap', 'jquery', 'php',
    'c++', 'c#', '.net', 'spring', 'django', 'flask', 'express',
    'machine learning', 'ai', 'data science', 'statistics', 'r',
    'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Requirements</h1>
          <p className="text-gray-600 mt-1">
            Manage job requirements and screening criteria
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 md:mt-0 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Job Requirements
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingId ? 'Edit Job Requirements' : 'Add New Job Requirements'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Senior Software Developer"
                required
              />
            </div>

            {/* Minimum Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Years of Experience
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.min_experience}
                onChange={(e) => setFormData(prev => ({ ...prev, min_experience: parseFloat(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Education Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education Requirements
              </label>
              <textarea
                value={formData.education_requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, education_requirements: e.target.value }))}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Bachelor's degree in Computer Science or related field"
              />
            </div>

            {/* Required Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('required'))}
                />
                <button
                  type="button"
                  onClick={() => addSkill('required')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.required_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill('required', skill)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Skills
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('preferred'))}
                />
                <button
                  type="button"
                  onClick={() => addSkill('preferred')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.preferred_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill('preferred', skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Common Skills Suggestions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Common Skills (Click to add)
              </label>
              <div className="flex flex-wrap gap-2">
                {commonSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => {
                      if (!formData.required_skills.includes(skill) && !formData.preferred_skills.includes(skill)) {
                        addSkill('preferred');
                        setNewSkill(skill);
                      }
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requirements List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : requirements.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No job requirements</h3>
            <p className="text-gray-600 mb-4">
              Create your first job requirements to start screening resumes.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Add Job Requirements
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Required Skills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preferred Skills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requirements.map((requirement) => (
                  <tr key={requirement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {requirement.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {requirement.required_skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {requirement.required_skills.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{requirement.required_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {requirement.preferred_skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {skill}
                          </span>
                        ))}
                        {requirement.preferred_skills.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{requirement.preferred_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {requirement.min_experience} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(requirement)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(requirement.id)}
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
        )}
      </div>
    </div>
  );
};

export default JobRequirements;
