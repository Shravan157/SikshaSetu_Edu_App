import React, { useState, useEffect } from 'react';
import { branchAPI } from '../utils/api';
import { toast } from 'react-toastify';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await branchAPI.getAllBranches();
      setBranches(response.data);
    } catch (error) {
      toast.error('Failed to fetch branches');
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedBranch(null);
    setIsModalOpen(true);
  };

  const handleEdit = (branch) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  const handleDelete = (branch) => {
    setBranchToDelete(branch);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await branchAPI.deleteBranch(branchToDelete.id);
      setBranches(branches.filter(b => b.id !== branchToDelete.id));
      toast.success('Branch deleted successfully');
    } catch (error) {
      toast.error('Failed to delete branch');
    } finally {
      setIsDeleteDialogOpen(false);
      setBranchToDelete(null);
    }
  };

  const handleSave = async (branchData) => {
    try {
      if (selectedBranch) {
        const response = await branchAPI.updateBranch(selectedBranch.id, branchData);
        setBranches(branches.map(b => b.id === selectedBranch.id ? response.data : b));
        toast.success('Branch updated successfully');
      } else {
        const response = await branchAPI.createBranch(branchData);
        setBranches([...branches, response.data]);
        toast.success('Branch created successfully');
      }
    } catch (error) {
      toast.error('Failed to save branch');
    } finally {
      setIsModalOpen(false);
      setSelectedBranch(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading branches..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <BuildingOfficeIcon className="w-8 h-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Branch Management</h1>
            <p className="text-gray-600">Manage academic branches and departments</p>
          </div>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Branch
        </button>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div key={branch.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <BuildingOfficeIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{branch.name}</h3>
                  <p className="text-sm text-gray-500">Branch ID: {branch.id}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(branch)}
                  className="text-primary-600 hover:text-primary-900"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(branch)}
                  className="text-red-600 hover:text-red-900"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {branches.length === 0 && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No branches</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new branch.
          </p>
          <div className="mt-6">
            <button onClick={handleAdd} className="btn-primary">
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Branch
            </button>
          </div>
        </div>
      )}

      {/* Branch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBranch(null);
        }}
        title={selectedBranch ? 'Edit Branch' : 'Add Branch'}
      >
        <BranchForm
          branch={selectedBranch}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedBranch(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Branch"
        message={`Are you sure you want to delete "${branchToDelete?.name}"? This action cannot be undone and may affect associated students and faculty.`}
        type="danger"
      />
    </div>
  );
};

const BranchForm = ({ branch, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: branch?.name || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Branch Name</label>
        <input
          type="text"
          className="mt-1 input-field"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Computer Science Engineering"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {branch ? 'Update' : 'Create'} Branch
        </button>
      </div>
    </form>
  );
};

export default Branches;