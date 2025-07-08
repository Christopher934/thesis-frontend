/**
 * User-Based Notification Admin Panel
 * For administrators and supervisors to send targeted notifications
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useEnhancedNotifications } from './EnhancedNotificationContext';

interface User {
  id: number;
  employeeId: string;
  namaDepan: string;
  namaBelakang: string;
  role: string;
  email: string;
}

interface UserNotificationAdminProps {
  className?: string;
}

export function UserNotificationAdmin({ className = '' }: UserNotificationAdminProps) {
  const {
    sendPersonalAttendanceReminder,
    sendPersonalTaskAssignment,
    sendInteractiveAnnouncement,
  } = useEnhancedNotifications();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedNotificationType, setSelectedNotificationType] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states for different notification types
  const [attendanceReminderForm, setAttendanceReminderForm] = useState({
    shiftTime: '',
    location: '',
    reminderMinutes: 30
  });

  const [taskAssignmentForm, setTaskAssignmentForm] = useState({
    taskId: 0,
    taskTitle: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    assignedBy: ''
  });

  const [interactiveAnnouncementForm, setInteractiveAnnouncementForm] = useState({
    title: '',
    content: '',
    targetRoles: [] as string[],
    interactionType: 'INTEREST' as 'INTEREST' | 'CONFIRMATION' | 'FEEDBACK',
    deadline: '',
    maxParticipants: 0
  });

  // Get auth token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Get current user info
  const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
      return {
        name: localStorage.getItem('userName') || 'Unknown',
        role: localStorage.getItem('userRole') || 'USER'
      };
    }
    return { name: 'Unknown', role: 'USER' };
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch('http://localhost:3002/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmitAttendanceReminder = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      await sendPersonalAttendanceReminder({
        userId: selectedUser,
        ...attendanceReminderForm
      });
      
      // Reset form
      setAttendanceReminderForm({
        shiftTime: '',
        location: '',
        reminderMinutes: 30
      });
      setSelectedUser(null);
      alert('Attendance reminder sent successfully!');
    } catch (error) {
      console.error('Error sending attendance reminder:', error);
      alert('Failed to send attendance reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitTaskAssignment = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      const currentUser = getCurrentUser();
      await sendPersonalTaskAssignment({
        userId: selectedUser,
        ...taskAssignmentForm,
        assignedBy: currentUser.name
      });
      
      // Reset form
      setTaskAssignmentForm({
        taskId: 0,
        taskTitle: '',
        description: '',
        dueDate: '',
        priority: 'MEDIUM',
        assignedBy: ''
      });
      setSelectedUser(null);
      alert('Task assignment sent successfully!');
    } catch (error) {
      console.error('Error sending task assignment:', error);
      alert('Failed to send task assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitInteractiveAnnouncement = async () => {
    setIsSubmitting(true);
    try {
      await sendInteractiveAnnouncement(interactiveAnnouncementForm);
      
      // Reset form
      setInteractiveAnnouncementForm({
        title: '',
        content: '',
        targetRoles: [],
        interactionType: 'INTEREST',
        deadline: '',
        maxParticipants: 0
      });
      alert('Interactive announcement sent successfully!');
    } catch (error) {
      console.error('Error sending interactive announcement:', error);
      alert('Failed to send interactive announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRole = (role: string) => {
    setInteractiveAnnouncementForm(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role]
    }));
  };

  const availableRoles = ['ADMIN', 'SUPERVISOR', 'PERAWAT', 'DOKTER'];

  return (
    <div className={`user-notification-admin ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Send User-Based Notifications
        </h2>
        <p className="text-gray-600">
          Send targeted notifications to specific users or groups
        </p>
      </div>

      {/* Notification Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notification Type
        </label>
        <select
          value={selectedNotificationType}
          onChange={(e) => setSelectedNotificationType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Select notification type</option>
          <option value="attendance-reminder">Personal Attendance Reminder</option>
          <option value="task-assignment">Personal Task Assignment</option>
          <option value="interactive-announcement">Interactive Announcement</option>
        </select>
      </div>

      {/* Personal Attendance Reminder Form */}
      {selectedNotificationType === 'attendance-reminder' && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Personal Attendance Reminder</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User
              </label>
              <select
                value={selectedUser || ''}
                onChange={(e) => setSelectedUser(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.employeeId} - {user.namaDepan} {user.namaBelakang} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shift Time
              </label>
              <input
                type="time"
                value={attendanceReminderForm.shiftTime}
                onChange={(e) => setAttendanceReminderForm(prev => ({ ...prev, shiftTime: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={attendanceReminderForm.location}
                onChange={(e) => setAttendanceReminderForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., ICU, Emergency Room"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Minutes Before
              </label>
              <input
                type="number"
                value={attendanceReminderForm.reminderMinutes}
                onChange={(e) => setAttendanceReminderForm(prev => ({ ...prev, reminderMinutes: Number(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <button
            onClick={handleSubmitAttendanceReminder}
            disabled={!selectedUser || !attendanceReminderForm.shiftTime || !attendanceReminderForm.location || isSubmitting}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send Attendance Reminder'}
          </button>
        </div>
      )}

      {/* Personal Task Assignment Form */}
      {selectedNotificationType === 'task-assignment' && (
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Personal Task Assignment</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User
              </label>
              <select
                value={selectedUser || ''}
                onChange={(e) => setSelectedUser(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.employeeId} - {user.namaDepan} {user.namaBelakang} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title
              </label>
              <input
                type="text"
                value={taskAssignmentForm.taskTitle}
                onChange={(e) => setTaskAssignmentForm(prev => ({ ...prev, taskTitle: e.target.value }))}
                placeholder="e.g., Complete Patient Documentation"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={taskAssignmentForm.dueDate}
                onChange={(e) => setTaskAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={taskAssignmentForm.priority}
                onChange={(e) => setTaskAssignmentForm(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={taskAssignmentForm.description}
                onChange={(e) => setTaskAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed task description..."
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <button
            onClick={handleSubmitTaskAssignment}
            disabled={!selectedUser || !taskAssignmentForm.taskTitle || !taskAssignmentForm.description || isSubmitting}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send Task Assignment'}
          </button>
        </div>
      )}

      {/* Interactive Announcement Form */}
      {selectedNotificationType === 'interactive-announcement' && (
        <div className="bg-purple-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Interactive Announcement</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={interactiveAnnouncementForm.title}
                onChange={(e) => setInteractiveAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Voluntary Training Session"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={interactiveAnnouncementForm.content}
                onChange={(e) => setInteractiveAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Announcement content..."
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Roles
              </label>
              <div className="space-y-2">
                {availableRoles.map(role => (
                  <label key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={interactiveAnnouncementForm.targetRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="mr-2"
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interaction Type
              </label>
              <select
                value={interactiveAnnouncementForm.interactionType}
                onChange={(e) => setInteractiveAnnouncementForm(prev => ({ ...prev, interactionType: e.target.value as any }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="INTEREST">Interest Expression</option>
                <option value="CONFIRMATION">Confirmation Required</option>
                <option value="FEEDBACK">Feedback Request</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline (Optional)
              </label>
              <input
                type="datetime-local"
                value={interactiveAnnouncementForm.deadline}
                onChange={(e) => setInteractiveAnnouncementForm(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Participants (Optional)
              </label>
              <input
                type="number"
                value={interactiveAnnouncementForm.maxParticipants}
                onChange={(e) => setInteractiveAnnouncementForm(prev => ({ ...prev, maxParticipants: Number(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <button
            onClick={handleSubmitInteractiveAnnouncement}
            disabled={!interactiveAnnouncementForm.title || !interactiveAnnouncementForm.content || interactiveAnnouncementForm.targetRoles.length === 0 || isSubmitting}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send Interactive Announcement'}
          </button>
        </div>
      )}
    </div>
  );
}
