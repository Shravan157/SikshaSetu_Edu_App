import React, { useState, useEffect } from 'react';
import { studentAPI, userAPI, branchAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../constants/roles';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SimplePagination from '../components/common/SimplePagination';
import useSimplePagination from '../hooks/useSimplePagination';

const Students = () => {
  const { hasRole } = useAuth();
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    branchId: '',
    year: '',
    semester: '',
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, usersRes, branchesRes] = await Promise.all([
        studentAPI.getAllStudents(),
        hasRole(ROLES.ADMIN) ? userAPI.getAllUsers() : Promise.resolve({ data: [] }),
        branchAPI.getAllBranches(),
      ]);
      
      setStudents(studentsRes.data);
      setUsers(usersRes.data);
      setBranches(branchesRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await studentAPI.deleteStudent(studentToDelete.id);
      setStudents(students.filter(s => s.id !== studentToDelete.id));
      toast.success('Student deleted successfully');
    } catch (error) {
      toast.error('Failed to delete student');
    } finally {
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleSave = async (studentData) => {
    try {
      if (selectedStudent) {
        const response = await studentAPI.updateStudent(selectedStudent.id, studentData);
        setStudents(students.map(s => s.id === selectedStudent.id ? response.data : s));
        toast.success('Student updated successfully');
      } else {
        const response = await studentAPI.createStudent(studentData);
        setStudents([...students, response.data]);
        toast.success('Student created successfully');
      }
    } catch (error) {
      toast.error('Failed to save student');
    } finally {
      setIsModalOpen(false);
      setSelectedStudent(null);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.branchName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = 
      (!filters.branchId || student.branchId?.toString() === filters.branchId) &&
      (!filters.year || student.year?.toString() === filters.year) &&
      (!filters.semester || student.semester?.toString() === filters.semester);
    
    return matchesSearch && matchesFilters;
  });

  // Use pagination hook
  const pagination = useSimplePagination(filteredStudents, 10);
  const { paginatedData: displayedStudents, currentPage, totalPages, totalItems, goToPage } = pagination;

  if (loading) {
    return <LoadingSpinner text="Loading students..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
        {hasRole(ROLES.ADMIN) && (
          <button onClick={handleAdd} className="btn-primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Student
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search students..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="input-field"
            value={filters.branchId}
            onChange={(e) => setFilters({ ...filters, branchId: e.target.value })}
          >
            <option value="">All Branches</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          
          <select
            className="input-field"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          >
            <option value="">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
          
          <select
            className="input-field"
            value={filters.semester}
            onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
          >
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map(sem => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Name</th>
              <th className="table-header">Email</th>
              <th className="table-header">Branch</th>
              <th className="table-header">Year</th>
              <th className="table-header">Semester</th>
              {hasRole(ROLES.ADMIN) && <th className="table-header">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="table-cell">
                  <div className="font-medium text-gray-900">{student.userName}</div>
                </td>
                <td className="table-cell">
                  <div className="text-gray-900">{student.userEmail}</div>
                </td>
                <td className="table-cell">
                  <div className="text-gray-900">{student.branchName}</div>
                </td>
                <td className="table-cell">
                  <div className="text-gray-900">{student.year}</div>
                </td>
                <td className="table-cell">
                  <div className="text-gray-900">{student.semester}</div>
                </td>
                {hasRole(ROLES.ADMIN) && (
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {displayedStudents.length === 0 && filteredStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No students found
          </div>
        )}
      </div>

      {/* Pagination */}
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        itemsPerPage={10}
        totalItems={totalItems}
      />

      {/* Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudent(null);
        }}
        title={selectedStudent ? 'Edit Student' : 'Add Student'}
      >
        <StudentForm
          student={selectedStudent}
          users={users}
          branches={branches}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedStudent(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Student"
        message={`Are you sure you want to delete ${studentToDelete?.userName}? This action cannot be undone.`}
        type="danger"
      />
    </div>
  );
};

const StudentForm = ({ student, users, branches, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    userId: student?.userId || '',
    branchId: student?.branchId || '',
    year: student?.year || 1,
    semester: student?.semester || 1,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">User</label>
        <select
          className="mt-1 input-field"
          value={formData.userId}
          onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
          required
        >
          <option value="">Select User</option>
          {users.filter(user => user.roles.includes('STUDENT')).map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Branch</label>
        <select
          className="mt-1 input-field"
          value={formData.branchId}
          onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
          required
        >
          <option value="">Select Branch</option>
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Year</label>
          <select
            className="mt-1 input-field"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            required
          >
            <option value={1}>1st Year</option>
            <option value={2}>2nd Year</option>
            <option value={3}>3rd Year</option>
            <option value={4}>4th Year</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Semester</label>
          <select
            className="mt-1 input-field"
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
            required
          >
            {[1,2,3,4,5,6,7,8].map(sem => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {student ? 'Update' : 'Create'} Student
        </button>
      </div>
    </form>
  );
};

export default Students;