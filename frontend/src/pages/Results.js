import React, { useState, useEffect } from 'react';
import { resultAPI, studentAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../constants/roles';
import {
  ChartBarIcon,
  PlusIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';

const Results = () => {
  const { hasAnyRole, hasRole } = useAuth();
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    marks: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (hasRole(ROLES.STUDENT)) {
        // For students, get their own results
        const response = await resultAPI.getAllResults(); // This will be filtered by backend
        setResults(response.data);
      } else {
        // For admin/faculty, get all results and students
        const [resultsRes, studentsRes] = await Promise.all([
          resultAPI.getAllResults(),
          studentAPI.getAllStudents(),
        ]);
        setResults(resultsRes.data);
        setStudents(studentsRes.data);
      }
    } catch (error) {
      toast.error('Failed to fetch results');
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = selectedStudent 
    ? results.filter(result => result.studentId.toString() === selectedStudent)
    : results;

  const calculateGPA = (studentResults) => {
    if (studentResults.length === 0) return 0;
    const total = studentResults.reduce((sum, result) => sum + result.marks, 0);
    return (total / (studentResults.length * 100) * 4).toFixed(2); // Assuming 100 is max marks
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddResult = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.studentId || !formData.subject || !formData.marks) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.marks < 0 || formData.marks > 100) {
      toast.error('Marks must be between 0 and 100');
      return;
    }

    setSubmitting(true);
    try {
      const resultData = {
        studentId: parseInt(formData.studentId),
        subject: formData.subject.trim(),
        marks: parseFloat(formData.marks)
      };

      await resultAPI.createResult(resultData);
      toast.success('Result added successfully');
      
      // Reset form and close modal
      setFormData({ studentId: '', subject: '', marks: '' });
      setShowAddModal(false);
      
      // Refresh results
      fetchData();
    } catch (error) {
      console.error('Error adding result:', error);
      toast.error(error.response?.data?.message || 'Failed to add result');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setFormData({ studentId: '', subject: '', marks: '' });
  };

  if (loading) {
    return <LoadingSpinner text="Loading results..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <ChartBarIcon className="w-8 h-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Academic Results</h1>
            <p className="text-gray-600">View and manage student results</p>
          </div>
        </div>
        {hasAnyRole([ROLES.ADMIN, ROLES.FACULTY]) && (
          <button 
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Result
          </button>
        )}
      </div>

      {/* Student Filter (for admin/faculty) */}
      {hasAnyRole([ROLES.ADMIN, ROLES.FACULTY]) && (
        <div className="card">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by Student:</label>
            <select
              className="input-field max-w-md"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.userName} - {student.branchName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {filteredResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Subjects</p>
                <p className="text-2xl font-semibold text-gray-900">{filteredResults.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <span className="text-white font-bold">AVG</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Marks</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {filteredResults.length > 0 
                    ? (filteredResults.reduce((sum, r) => sum + r.marks, 0) / filteredResults.length).toFixed(1)
                    : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <span className="text-white font-bold">GPA</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">GPA</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {calculateGPA(filteredResults)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Student</th>
              <th className="table-header">Subject</th>
              <th className="table-header">Marks</th>
              <th className="table-header">Grade</th>
              <th className="table-header">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredResults.map((result) => {
              const grade = result.marks >= 90 ? 'A+' : 
                          result.marks >= 80 ? 'A' :
                          result.marks >= 70 ? 'B+' :
                          result.marks >= 60 ? 'B' :
                          result.marks >= 50 ? 'C' :
                          result.marks >= 40 ? 'D' : 'F';
              
              const status = result.marks >= 40 ? 'Pass' : 'Fail';
              
              return (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="font-medium text-gray-900">{result.studentName}</div>
                  </td>
                  <td className="table-cell">
                    <div className="text-gray-900">{result.subject}</div>
                  </td>
                  <td className="table-cell">
                    <div className="text-gray-900 font-medium">{result.marks}/100</div>
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      grade === 'A+' || grade === 'A' ? 'bg-green-100 text-green-800' :
                      grade === 'B+' || grade === 'B' ? 'bg-blue-100 text-blue-800' :
                      grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                      grade === 'D' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {grade}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      status === 'Pass' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {hasRole(ROLES.STUDENT) 
                ? "Your results will appear here once they are published."
                : "No results have been added yet."}
            </p>
          </div>
        )}
      </div>

      {/* Add Result Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        title="Add New Result"
      >
        <form onSubmit={handleAddResult} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student
            </label>
            <select
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="">Select a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.userName} - {student.branchName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter subject name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marks (out of 100)
            </label>
            <input
              type="number"
              name="marks"
              value={formData.marks}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter marks"
              min="0"
              max="100"
              step="0.1"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Result'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Results;