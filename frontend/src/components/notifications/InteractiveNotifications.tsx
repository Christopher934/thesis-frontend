/**
 * Interactive Notifications Component
 * Handles notifications that require user responses (role-to-user conversion)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useEnhancedNotifications } from './EnhancedNotificationContext';

interface InteractiveNotificationsProps {
  className?: string;
}

export function InteractiveNotifications({ className = '' }: InteractiveNotificationsProps) {
  const {
    interactiveNotifications,
    interactiveUnreadCount,
    handleInteractiveResponse,
    markAsRead,
    fetchInteractiveNotifications,
  } = useEnhancedNotifications();

  const [expandedNotifications, setExpandedNotifications] = useState<Set<number>>(new Set());
  const [responseData, setResponseData] = useState<{ [key: number]: { message: string } }>({});
  const [submittingResponse, setSubmittingResponse] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchInteractiveNotifications();
  }, [fetchInteractiveNotifications]);

  const toggleExpanded = (notificationId: number) => {
    const newExpanded = new Set(expandedNotifications);
    if (newExpanded.has(notificationId)) {
      newExpanded.delete(notificationId);
    } else {
      newExpanded.add(notificationId);
    }
    setExpandedNotifications(newExpanded);
  };

  const handleResponse = async (
    notificationId: number,
    responseType: 'INTERESTED' | 'CONFIRMED' | 'DECLINED' | 'FEEDBACK'
  ) => {
    setSubmittingResponse(prev => new Set(prev).add(notificationId));
    
    try {
      const message = responseData[notificationId]?.message || '';
      await handleInteractiveResponse(notificationId, responseType, message);
      
      // Clear response data for this notification
      setResponseData(prev => {
        const newData = { ...prev };
        delete newData[notificationId];
        return newData;
      });
      
      // Mark as read
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setSubmittingResponse(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const updateResponseMessage = (notificationId: number, message: string) => {
    setResponseData(prev => ({
      ...prev,
      [notificationId]: { message }
    }));
  };

  const getNotificationIcon = (jenis: string) => {
    const iconMap: { [key: string]: string } = {
      'PENGUMUMAN_INTERAKTIF': '📢',
      'KONFIRMASI_SHIFT_SWAP_PERSONAL': '🔄'
    };
    return iconMap[jenis] || '❓';
  };

  const getInteractionTypeInfo = (interactionType: string) => {
    switch (interactionType) {
      case 'INTEREST':
        return {
          description: 'Express your interest in this opportunity',
          actions: ['INTERESTED', 'DECLINED']
        };
      case 'CONFIRMATION':
        return {
          description: 'Please confirm your participation',
          actions: ['CONFIRMED', 'DECLINED']
        };
      case 'FEEDBACK':
        return {
          description: 'Your feedback is requested',
          actions: ['FEEDBACK']
        };
      default:
        return {
          description: 'Response required',
          actions: ['CONFIRMED', 'DECLINED']
        };
    }
  };

  const getActionButtonStyle = (action: string) => {
    switch (action) {
      case 'INTERESTED':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'CONFIRMED':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'DECLINED':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'FEEDBACK':
        return 'bg-purple-500 hover:bg-purple-600 text-white';
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  return (
    <div className={`interactive-notifications ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Interactive Notifications
          {interactiveUnreadCount > 0 && (
            <span className="ml-2 bg-orange-500 text-white text-sm rounded-full px-2 py-1">
              {interactiveUnreadCount} need response
            </span>
          )}
        </h2>
        
        <button
          onClick={fetchInteractiveNotifications}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {interactiveNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">✅</div>
            <p>No interactive notifications requiring response</p>
          </div>
        ) : (
          interactiveNotifications.map((notification) => {
            const interactionInfo = getInteractionTypeInfo(notification.data?.interactionType || 'CONFIRMATION');
            const isSubmitting = submittingResponse.has(notification.id);
            const hasResponded = notification.status === 'READ';
            
            return (
              <div
                key={notification.id}
                className={`border-l-4 border-orange-500 rounded-lg p-4 ${
                  hasResponded ? 'bg-gray-50 opacity-75' : 'bg-orange-50'
                } ${notification.status === 'UNREAD' ? 'shadow-md' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{getNotificationIcon(notification.jenis)}</span>
                      <h3 className="font-semibold text-gray-800">{notification.judul}</h3>
                      {notification.status === 'UNREAD' && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          Action Required
                        </span>
                      )}
                      {hasResponded && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Responded
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-2">{notification.pesan}</p>
                    
                    {expandedNotifications.has(notification.id) && notification.data && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <h4 className="font-medium mb-2">Details:</h4>
                        <div className="space-y-1 text-sm">
                          {notification.data.deadline && (
                            <p><strong>Deadline:</strong> {notification.data.deadline}</p>
                          )}
                          {notification.data.maxParticipants && (
                            <p><strong>Max Participants:</strong> {notification.data.maxParticipants}</p>
                          )}
                          {notification.data.interactionType && (
                            <p><strong>Response Type:</strong> {notification.data.interactionType}</p>
                          )}
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">{interactionInfo.description}</p>
                        </div>
                      </div>
                    )}
                    
                    {!hasResponded && (
                      <div className="mt-4 p-3 bg-white rounded border">
                        <h4 className="font-medium mb-2">Your Response:</h4>
                        
                        {(notification.data?.interactionType === 'FEEDBACK' || 
                          ['INTERESTED', 'CONFIRMED'].some(action => interactionInfo.actions.includes(action))) && (
                          <div className="mb-3">
                            <textarea
                              placeholder="Add a message (optional)"
                              value={responseData[notification.id]?.message || ''}
                              onChange={(e) => updateResponseMessage(notification.id, e.target.value)}
                              className="w-full p-2 border rounded text-sm"
                              rows={2}
                            />
                          </div>
                        )}
                        
                        <div className="flex gap-2 flex-wrap">
                          {interactionInfo.actions.map((action) => (
                            <button
                              key={action}
                              onClick={() => handleResponse(notification.id, action as any)}
                              disabled={isSubmitting}
                              className={`px-3 py-1 rounded text-sm ${getActionButtonStyle(action)} ${
                                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {isSubmitting ? 'Submitting...' : action}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                      
                      <button
                        onClick={() => toggleExpanded(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {expandedNotifications.has(notification.id) ? 'Less Details' : 'More Details'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
