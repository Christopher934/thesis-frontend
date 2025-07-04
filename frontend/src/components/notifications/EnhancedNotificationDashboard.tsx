/**
 * Enhanced Notification Dashboard
 * Comprehensive dashboard for all user-based notification features
 */
'use client';

import React, { useState, useEffect } from 'react';
import { EnhancedNotificationProvider, useEnhancedNotifications } from './EnhancedNotificationContext';
import { PersonalNotifications } from './PersonalNotifications';
import { InteractiveNotifications } from './InteractiveNotifications';
import { UserNotificationAdmin } from './UserNotificationAdmin';
import { NotificationCenter } from './NotificationCenter';

interface Tab {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<any>;
  badge?: number;
  requiredRoles?: string[];
}

function EnhancedNotificationDashboardContent() {
  const {
    unreadCount,
    personalUnreadCount,
    interactiveUnreadCount,
    fetchNotifications,
    fetchPersonalNotifications,
    fetchInteractiveNotifications,
  } = useEnhancedNotifications();

  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    // Get user role from localStorage
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole') || 'USER';
      setUserRole(role);
    }
  }, []);

  const tabs: Tab[] = [
    {
      id: 'overview',
      name: 'Overview',
      icon: '📊',
      component: NotificationCenter,
      badge: unreadCount
    },
    {
      id: 'personal',
      name: 'Personal',
      icon: '👤',
      component: PersonalNotifications,
      badge: personalUnreadCount
    },
    {
      id: 'interactive',
      name: 'Interactive',
      icon: '🔄',
      component: InteractiveNotifications,
      badge: interactiveUnreadCount
    },
    {
      id: 'admin',
      name: 'Send Notifications',
      icon: '⚡',
      component: UserNotificationAdmin,
      requiredRoles: ['ADMIN', 'SUPERVISOR']
    }
  ];

  const filteredTabs = tabs.filter(tab => 
    !tab.requiredRoles || tab.requiredRoles.includes(userRole)
  );

  const refreshAllNotifications = async () => {
    await Promise.all([
      fetchNotifications(),
      fetchPersonalNotifications(),
      fetchInteractiveNotifications()
    ]);
  };

  const ActiveComponent = filteredTabs.find(tab => tab.id === activeTab)?.component || NotificationCenter;

  return (
    <div className="enhanced-notification-dashboard p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Notification Center
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your notifications and communications
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={refreshAllNotifications}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <span>🔄</span>
              Refresh All
            </button>
            
            <div className="bg-white rounded-lg px-4 py-2 shadow">
              <div className="text-sm text-gray-600">Total Unread</div>
              <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">All Notifications</h3>
              <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
            </div>
            <div className="text-3xl">📬</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Personal</h3>
              <p className="text-2xl font-bold text-gray-900">{personalUnreadCount}</p>
            </div>
            <div className="text-3xl">👤</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Need Response</h3>
              <p className="text-2xl font-bold text-gray-900">{interactiveUnreadCount}</p>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {filteredTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  {tab.name}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1">
                      {tab.badge}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <ActiveComponent />
      </div>

      {/* User Role Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>You are logged in as: <span className="font-medium text-gray-700">{userRole}</span></p>
        {['ADMIN', 'SUPERVISOR'].includes(userRole) && (
          <p className="mt-1">You have access to administrative notification features.</p>
        )}
      </div>
    </div>
  );
}

export function EnhancedNotificationDashboard() {
  return (
    <EnhancedNotificationProvider>
      <EnhancedNotificationDashboardContent />
    </EnhancedNotificationProvider>
  );
}
