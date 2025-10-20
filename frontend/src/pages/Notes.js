import React, { useState, useEffect } from 'react';
import { noteAPI, branchAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../constants/roles';
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SimplePagination from '../components/common/SimplePagination';
import useSimplePagination from '../hooks/useSimplePagination';

const Notes = () => {
  const { hasAnyRole } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [noteToView, setNoteToView] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await noteAPI.getAllNotes();
      console.log('Fetched notes:', response.data);
      setNotes(response.data);
    } catch (error) {
      toast.error('Failed to fetch notes');
      console.error('Error fetching notes:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedNote(null);
    setIsModalOpen(true);
  };

  const handleView = (note) => {
    setNoteToView(note);
    setIsViewModalOpen(true);
  };

  const handleEdit = (note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleDelete = (note) => {
    setNoteToDelete(note);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await noteAPI.deleteNote(noteToDelete.id);
      setNotes(notes.filter(n => n.id !== noteToDelete.id));
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note');
    } finally {
      setIsDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  const handleSave = async (noteData) => {
    try {
      console.log('Saving note with data:', noteData);
      if (selectedNote) {
        const response = await noteAPI.updateNote(selectedNote.id, noteData);
        console.log('Note updated response:', response.data);
        setNotes(notes.map(n => n.id === selectedNote.id ? response.data : n));
        toast.success('Note updated successfully');
      } else {
        const response = await noteAPI.createNote(noteData);
        console.log('Note created response:', response.data);
        setNotes([...notes, response.data]);
        toast.success('Note created successfully');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to save note: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsModalOpen(false);
      setSelectedNote(null);
    }
  };

  const handleDownloadAttachment = async (noteId) => {
    try {
      const response = await noteAPI.downloadAttachment(noteId);

      // Build filename from Content-Disposition (supports filename* and fallback) and ensure extension from content-type
      const cd = response.headers['content-disposition'] || '';
      let filename = null;

      // Try RFC 5987 filename*
      const fnStarMatch = cd.match(/filename\*=(?:UTF-8''|)([^;]+)/i);
      if (fnStarMatch && fnStarMatch[1]) {
        try {
          filename = decodeURIComponent(fnStarMatch[1].trim().replace(/^\"|\"$/g, ''));
        } catch (_) {
          filename = fnStarMatch[1].trim().replace(/^\"|\"$/g, '');
        }
      }
      // Fallback to filename=
      if (!filename) {
        const fnMatch = cd.match(/filename=([^;]+)/i);
        if (fnMatch && fnMatch[1]) {
          filename = fnMatch[1].trim().replace(/^\"|\"$/g, '');
        }
      }
      if (!filename) filename = `note-attachment-${noteId}`;

      // Ensure extension based on content-type if missing
      const ct = response.headers['content-type'] || '';
      const hasExt = /\.[a-zA-Z0-9]{2,8}$/.test(filename);
      const extFromCT = ct.includes('pdf') ? '.pdf'
                        : ct.includes('png') ? '.png'
                        : ct.includes('jpeg') || ct.includes('jpg') ? '.jpg'
                        : ct.includes('plain') ? '.txt'
                        : ct.includes('msword') ? '.doc'
                        : ct.includes('officedocument.wordprocessingml') ? '.docx'
                        : ct.includes('excel') || ct.includes('spreadsheet') ? '.xlsx'
                        : ct.includes('zip') ? '.zip'
                        : '';
      if (!hasExt && extFromCT) filename += extFromCT;

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download attachment');
      console.error('Download error:', error);
    }
  };

  // Use pagination hook
  const pagination = useSimplePagination(notes, 5); // Show 5 notes per page
  const { paginatedData: displayedNotes, currentPage, totalPages, totalItems, goToPage } = pagination;

  if (loading) {
    return <LoadingSpinner text="Loading notes..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <DocumentTextIcon className="w-8 h-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Study Notes</h1>
            <p className="text-gray-600">Access and manage study materials</p>
          </div>
        </div>
        {hasAnyRole([ROLES.ADMIN, ROLES.FACULTY]) && (
          <button onClick={handleAdd} className="btn-primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Note
          </button>
        )}
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {displayedNotes.map((note) => (
          <div key={note.id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <DocumentTextIcon className="w-5 h-5 text-primary-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {note.title}
                  </h3>
                </div>
                <p className="text-gray-600 mb-3">{note.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Subject: {note.subject}</span>
                    <span>•</span>
                    <span>{note.branchName} - Year {note.year}, Sem {note.semester}</span>
                    <span>•</span>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleView(note)}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View
                    </button>
                    {note.hasAttachment && (
                      <button
                        onClick={() => handleDownloadAttachment(note.id)}
                        className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                      >
                        <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    )}
                    {hasAnyRole([ROLES.ADMIN, ROLES.FACULTY]) && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(note)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(note)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notes.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No notes available</h3>
          <p className="mt-1 text-sm text-gray-500">
            No study notes have been uploaded yet.
          </p>
          {hasAnyRole([ROLES.ADMIN, ROLES.FACULTY]) && (
            <div className="mt-6">
              <button onClick={handleAdd} className="btn-primary">
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Note
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        itemsPerPage={5}
        totalItems={totalItems}
      />

      {/* Note Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNote(null);
        }}
        title={selectedNote ? 'Edit Note' : 'Add Note'}
        size="large"
      >
        <NoteForm
          note={selectedNote}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedNote(null);
          }}
        />
      </Modal>

      {/* View Note Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setNoteToView(null);
        }}
        title="View Note"
        size="large"
      >
        {noteToView && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{noteToView.title}</h3>
              <div className="text-sm text-gray-500 mb-4">
                <span>Subject: {noteToView.subject}</span>
                <span className="mx-2">•</span>
                <span>{noteToView.branchName} - Year {noteToView.year}, Semester {noteToView.semester}</span>
                <span className="mx-2">•</span>
                <span>{new Date(noteToView.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Content:</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{noteToView.content}</p>
              </div>
            </div>
            {noteToView.hasAttachment && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => handleDownloadAttachment(noteToView.id)}
                  className="btn-primary"
                >
                  <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                  Download Attachment
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Note"
        message={`Are you sure you want to delete "${noteToDelete?.title}"? This action cannot be undone.`}
        type="danger"
      />
    </div>
  );
};

const NoteForm = ({ note, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: note?.title || '',
    content: note?.content || '',
    subject: note?.subject || '',
    branchName: note?.branchName || '',
    year: note?.year || '',
    semester: note?.semester || '',
  });
  const [attachment, setAttachment] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await branchAPI.getAllBranches();
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to load branches');
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (attachment) {
      submitData.attachment = attachment;
    }
    onSave(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          className="mt-1 input-field"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Subject</label>
        <input
          type="text"
          className="mt-1 input-field"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Content</label>
        <textarea
          rows={6}
          className="mt-1 input-field"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Branch</label>
          <select
            name="branchName"
            value={formData.branchName}
            onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
            className="mt-1 input-field"
            required
            disabled={loadingBranches}
          >
            <option value="">
              {loadingBranches ? 'Loading branches...' : 'Select Branch'}
            </option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.name}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Year</label>
          <select
            name="year"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            className="mt-1 input-field"
            required
          >
            <option value="">Select Year</option>
            <option value={1}>1st Year</option>
            <option value={2}>2nd Year</option>
            <option value={3}>3rd Year</option>
            <option value={4}>4th Year</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Semester</label>
          <select
            name="semester"
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
            className="mt-1 input-field"
            required
          >
            <option value="">Select Semester</option>
            <option value={1}>1st Semester</option>
            <option value={2}>2nd Semester</option>
            <option value={3}>3rd Semester</option>
            <option value={4}>4th Semester</option>
            <option value={5}>5th Semester</option>
            <option value={6}>6th Semester</option>
            <option value={7}>7th Semester</option>
            <option value={8}>8th Semester</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Attachment</label>
        <input
          type="file"
          className="mt-1 input-field"
          onChange={(e) => setAttachment(e.target.files[0])}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {note ? 'Update' : 'Add'} Note
        </button>
      </div>
    </form>
  );
};

export default Notes;