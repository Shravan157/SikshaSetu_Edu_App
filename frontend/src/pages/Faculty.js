import React, { useState, useEffect } from 'react';
import { facultyAPI, userAPI, branchAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../constants/roles';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Faculty = () => {
  const { hasRole } = useAuth();
  const [faculties, setFaculties] = useState([]);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [facultiesRes, usersRes, branchesRes] = await Promise.all([
        facultyAPI.getAllFaculties(),
        hasRole(ROLES.ADMIN) ? userAPI.getAllUsers() : Promise.resolve({ data: [] }),
        branchAPI.getAllBranches(),
      ]);
      
      setFaculties(facultiesRes.data);
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
    setSelectedFaculty(null);
    setIsModalOpen(true);
  };

  const handleEdit = (faculty) => {
    setSelectedFaculty(faculty);
    setIsModalOpen(true);
  };

  const handleDelete = (faculty) => {
    setFacultyToDelete(faculty);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await facultyAPI.deleteFaculty(facultyToDelete.id);
      setFaculties(faculties.filter(f => f.id !== facultyToDelete.id));
      toast.success('Faculty deleted successfully');
    } catch (error) {
      toast.error('Failed to delete faculty');
    } finally {
      setIsDeleteDialogOpen(false);
      setFacultyToDelete(null);
    }
  };

  const handleSave = async (facultyData) => {
    try {
      if (selectedFaculty) {
        const response = await facultyAPI.updateFaculty(selectedFaculty.id, facultyData);
        setFaculties(faculties.map(f => f.id === selectedFaculty.id ? response.data : f));
        toast.success('Faculty updated successfully');
      } else {
        const response = await facultyAPI.createFaculty(facultyData);
        setFaculties([...faculties, response.data]);
        toast.success('Faculty created successfully');
      }
    } catch (error) {
      toast.error('Failed to save faculty');
    } finally {
      setIsModalOpen(false);
      setSelectedFaculty(null);
    }
  };

  const filteredFaculties = faculties.filter(faculty =>
    faculty.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.branchName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner text="Loading faculty..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Faculty Management</h1>
        {hasRole(ROLES.ADMIN) && (
          <button onClick={handleAdd} className="btn-primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Faculty
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search faculty..."
          className="input-field pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Faculty Table */}
      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Name</th>
              <th className="table-header">Email</th>
              <th className="table-header">Branch</th>
              {hasRole(ROLES.ADMIN) && <th className="table-header">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFaculties.map((faculty) => (
              <tr key={faculty.id} className="hover:bg-gray-50">
                <td className="table-cell">
                  <div className="font-medium text-gray-900">{faculty.userName}</div>
                </td>
                <td className="table-cell">
                  <div className="text-gray-900">{faculty.userEmail}</div>
                </td>
                <td className="table-cell">
                  <div className="text-gray-900">{faculty.branchName}</div>
                </td>
                {hasRole(ROLES.ADMIN) && (
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(faculty)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(faculty)}
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

        {filteredFaculties.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No faculty found
          </div>
        )}
      </div>

      {/* Faculty Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFaculty(null);
        }}
        title={selectedFaculty ? 'Edit Faculty' : 'Add Faculty'}
      >
        <FacultyForm
          faculty={selectedFaculty}
          users={users}
          branches={branches}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedFaculty(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Faculty"
        message={`Are you sure you want to delete ${facultyToDelete?.userName}? This action cannot be undone.`}
        type="danger"
      />
    </div>
  );
};

const FacultyForm = ({ faculty, users, branches, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    userId: faculty?.userId || '',
    branchId: faculty?.branchId || '',
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
          {users.filter(user => user.roles.includes('FACULTY')).map(user => (
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

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {faculty ? 'Update' : 'Create'} Faculty
        </button>
      </div>
    </form>
  );
};

export default Faculty;