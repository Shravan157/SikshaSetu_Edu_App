import React, { useState, useEffect } from 'react';
import { attendanceAPI, studentAPI, facultyAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../constants/roles';
import {
  PlusIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Attendance = () => {
  const { hasRole, hasAnyRole } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let attendanceData;
      
      if (hasRole(ROLES.STUDENT)) {
        attendanceData = await attendanceAPI.getMyAttendance();
      } else {
        attendanceData = await attendanceAPI.getAllAttendance();
      }
      
      setAttendance(attendanceData.data);

      if (hasAnyRole([ROLES.ADMIN, ROLES.FACULTY])) {
        const [studentsRes, facultiesRes] = await Promise.all([
          studentAPI.getAllStudents(),
          facultyAPI.getAllFaculties(),
        ]);
        setStudents(studentsRes.data);
        setFaculties(facultiesRes.data);
      }
    } catch (error) {
      toast.error('Failed to fetch attendance data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (attendanceData) => {
    try {
      const response = await attendanceAPI.createAttendance(attendanceData);
      setAttendance([...attendance, response.data]);
      toast.success('Attendance marked successfully');
    } catch (error) {
      toast.error('Failed to mark attendance');
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleBulkSave = async (bulkData) => {
    try {
      const response = await attendanceAPI.markBulkAttendance(bulkData);
      setAttendance([...attendance, ...response.data]);
      toast.success('Bulk attendance marked successfully');
    } catch (error) {
      toast.error('Failed to mark bulk attendance');
    } finally {
      setIsBulkModalOpen(false);
    }
  };

  const getAttendanceStats = () => {
    const total = attendance.length;
    const present = attendance.filter(a => a.present).length;
    const absent = total - present;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return { total, present, absent, percentage };
  };

  const stats = getAttendanceStats();

  if (loading) {
    return <LoadingSpinner text="Loading attendance..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        {hasAnyRole([ROLES.ADMIN, ROLES.FACULTY]) && (
          <div className="flex space-x-2">
            <button onClick={() => setIsModalOpen(true)} className="btn-primary">
              <PlusIcon className="w-5 h-5 mr-2" />
              Mark Attendance
            </button>
            <button onClick={() => setIsBulkModalOpen(true)} className="btn-secondary">
              <CalendarDaysIcon className="w-5 h-5 mr-2" />
              Bulk Mark
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <CalendarDaysIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.present}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-500">
              <XCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.absent}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-500">
              <span className="text-white font-bold">%</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Attendance %</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.percentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="table-container">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Student</th>
              <th className="table-header">Faculty</th>
              <th className="table-header">Date</th>
              <th className="table-header">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendance.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="table-cell">
                  <div className="font-medium text-gray-900">{record.studentName}</div>
                </td>
                <td className="table-cell">
                  <div className="text-gray-900">{record.facultyName}</div>
                </td>
                <td className="table-cell">
                  <div className="text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    record.present 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {record.present ? 'Present' : 'Absent'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {attendance.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No attendance records found
          </div>
        )}
      </div>

      {/* Single Attendance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Mark Attendance"
      >
        <AttendanceForm
          students={students}
          faculties={faculties}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Bulk Attendance Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Mark Attendance"
        size="large"
      >
        <BulkAttendanceForm
          students={students}
          faculties={faculties}
          onSave={handleBulkSave}
          onCancel={() => setIsBulkModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

const AttendanceForm = ({ students, faculties, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    facultyId: '',
    date: new Date().toISOString().split('T')[0],
    present: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Student</label>
        <select
          className="mt-1 input-field"
          value={formData.studentId}
          onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
          required
        >
          <option value="">Select Student</option>
          {students.map(student => (
            <option key={student.id} value={student.id}>
              {student.userName} - {student.branchName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Faculty</label>
        <select
          className="mt-1 input-field"
          value={formData.facultyId}
          onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
          required
        >
          <option value="">Select Faculty</option>
          {faculties.map(faculty => (
            <option key={faculty.id} value={faculty.id}>
              {faculty.userName} - {faculty.branchName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          className="mt-1 input-field"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <div className="mt-2 space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="present"
              checked={formData.present === true}
              onChange={() => setFormData({ ...formData, present: true })}
            />
            <span className="ml-2">Present</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="present"
              checked={formData.present === false}
              onChange={() => setFormData({ ...formData, present: false })}
            />
            <span className="ml-2">Absent</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Mark Attendance
        </button>
      </div>
    </form>
  );
};

const BulkAttendanceForm = ({ students, faculties, onSave, onCancel }) => {
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {
    // Initialize attendance data for all students
    const initialData = {};
    students.forEach(student => {
      initialData[student.id] = true; // Default to present
    });
    setAttendanceData(initialData);
  }, [students]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const bulkData = students.map(student => ({
      studentId: student.id,
      facultyId: selectedFaculty,
      date: selectedDate,
      present: attendanceData[student.id] || false,
    }));

    onSave(bulkData);
  };

  const toggleAttendance = (studentId) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Faculty</label>
          <select
            className="mt-1 input-field"
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            required
          >
            <option value="">Select Faculty</option>
            {faculties.map(faculty => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.userName} - {faculty.branchName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            className="mt-1 input-field"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Mark Attendance for Students
        </label>
        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          {students.map(student => (
            <div key={student.id} className="flex items-center justify-between p-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">{student.userName}</p>
                <p className="text-sm text-gray-500">{student.branchName}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleAttendance(student.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  attendanceData[student.id]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {attendanceData[student.id] ? 'Present' : 'Absent'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Mark Bulk Attendance
        </button>
      </div>
    </form>
  );
};

export default Attendance;