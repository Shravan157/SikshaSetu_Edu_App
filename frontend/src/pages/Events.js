import React, { useState, useEffect } from 'react';
import { eventAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../constants/roles';
import {
  CalendarDaysIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Events = () => {
  const { hasAnyRole } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventAPI.getAllEvents();
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to fetch events');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = (event) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await eventAPI.deleteEvent(eventToDelete.id);
      setEvents(events.filter(e => e.id !== eventToDelete.id));
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error('Failed to delete event');
    } finally {
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  const handleSave = async (eventData) => {
    try {
      console.log('Saving event with data:', eventData);
      if (selectedEvent) {
        const response = await eventAPI.updateEvent(selectedEvent.id, eventData);
        setEvents(events.map(e => e.id === selectedEvent.id ? response.data : e));
        toast.success('Event updated successfully');
      } else {
        const response = await eventAPI.createEvent(eventData);
        setEvents([...events, response.data]);
        toast.success('Event created successfully');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to save event: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsModalOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleDownloadAttachment = async (eventId) => {
    try {
      const response = await eventAPI.downloadAttachment(eventId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'event-attachment');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download attachment');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading events..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <CalendarDaysIcon className="w-8 h-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600">Manage college events and announcements</p>
          </div>
        </div>
        {hasAnyRole([ROLES.ADMIN, ROLES.FACULTY]) && (
          <button onClick={handleAdd} className="btn-primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Event
          </button>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {event.description}
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <CalendarDaysIcon className="w-4 h-4 mr-1" />
                  {new Date(event.eventDate).toLocaleDateString()}
                </div>
                {event.location && (
                  <p className="text-sm text-gray-500">📍 {event.location}</p>
                )}
              </div>
              {hasAnyRole([ROLES.ADMIN, ROLES.FACULTY]) && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(event)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {event.hasAttachment && (
              <div className="border-t pt-3">
                <button
                  onClick={() => handleDownloadAttachment(event.id)}
                  className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                  Download Attachment
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
          <p className="mt-1 text-sm text-gray-500">
            No events have been scheduled yet.
          </p>
          {hasAnyRole([ROLES.ADMIN, ROLES.FACULTY]) && (
            <div className="mt-6">
              <button onClick={handleAdd} className="btn-primary">
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Event
              </button>
            </div>
          )}
        </div>
      )}

      {/* Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        title={selectedEvent ? 'Edit Event' : 'Create Event'}
        size="large"
      >
        <EventForm
          event={selectedEvent}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${eventToDelete?.title}"? This action cannot be undone.`}
        type="danger"
      />
    </div>
  );
};

const EventForm = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    eventDate: event?.eventDate ? event.eventDate.split('T')[0] : '',
    location: event?.location || '',
  });
  const [attachment, setAttachment] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    
    // Convert date string to LocalDateTime format
    if (formData.eventDate) {
      submitData.eventDate = formData.eventDate + 'T00:00:00';
    }
    
    if (attachment) {
      submitData.attachment = attachment;
    }
    
    console.log('Submitting event data:', submitData);
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
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={4}
          className="mt-1 input-field"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Date</label>
          <input
            type="date"
            className="mt-1 input-field"
            value={formData.eventDate}
            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            className="mt-1 input-field"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Event location"
          />
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
          {event ? 'Update' : 'Create'} Event
        </button>
      </div>
    </form>
  );
};

export default Events;