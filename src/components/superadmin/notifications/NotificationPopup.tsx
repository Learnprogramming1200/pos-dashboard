"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MdNotificationsActive } from 'react-icons/md';
import { getUserRole, tokenUtils } from '@/lib/utils';
import axios from 'axios';
import { env } from '@/lib/env';
import { Constants } from '@/constant';

const getBaseURL = () => {
  return env.BACKEND_URL;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = tokenUtils.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface NotificationPopupProps {
  readonly className?: string;
}

export default function NotificationPopup({ className = "" }: NotificationPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const popupRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Get user role from token or context
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = JSON.parse(atob(token.split('.')[1]));
        const role = getUserRole(decodedToken) || '';
        setUserRole(role);
      } catch {
        setUserRole('');
      }
    } else {
      setUserRole('');
    }
  }, []);

  useEffect(() => {
    // Close popup when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Close popup when pressing ESC key
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Use dummy data for testing
      const dummyNotifications: Notification[] = [
        {
          id: '1',
          title: Constants.superadminConstants.dummyNotificationTitle1,
          message: Constants.superadminConstants.dummyNotificationMessage1,
          type: 'info',
          read: false,
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
        },
        {
          id: '2',
          title: Constants.superadminConstants.dummyNotificationTitle2,
          message: Constants.superadminConstants.dummyNotificationMessage2,
          type: 'system',
          read: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
        },
        {
          id: '3',
          title: Constants.superadminConstants.dummyNotificationTitle3,
          message: Constants.superadminConstants.dummyNotificationMessage3,
          type: 'payment',
          read: true,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setNotifications(dummyNotifications);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleViewAll = () => {
    router.push('/superadmin/notifications/list');
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    // Mark all notifications as read
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return Constants.superadminConstants.justNow;
    if (diffInMinutes < 60) return `${diffInMinutes}${Constants.superadminConstants.minutesAgo}`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}${Constants.superadminConstants.hoursAgo}`;
    return `${Math.floor(diffInMinutes / 1440)}${Constants.superadminConstants.daysAgo}`;
  };

  // Only show for superadmin - temporarily show for debugging
  if (userRole !== 'superadmin' && userRole !== '') {// Debug log
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Bell Icon */}
      <button
        onClick={handleBellClick}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F6FA] hover:bg-gray-200 dark:bg-[#111111] dark:hover:bg-[#31394D] transition-colors relative"
      >
        <MdNotificationsActive className="w-5 h-5 text-[#828A90]" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {/* Notification Popup */}
      {isOpen && (
        <>
          {/* Overlay */}
          <button
            type="button"
            className="fixed inset-0 z-40 bg-transparent border-0 p-0 cursor-default"
            onClick={() => setIsOpen(false)}
            aria-label="Close notification popup"
          />

          {/* Popup Content */}
          <div
            ref={popupRef}
            className="absolute right-0 mt-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {Constants.superadminConstants.notificationsHeader}
              </h3>
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  {Constants.superadminConstants.markAsReadButton}
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {(() => {
                if (loading) {
                  return (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {Constants.superadminConstants.loadingNotifications}
                    </div>
                  );
                }
                if (notifications.length === 0) {
                  return (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {Constants.superadminConstants.noNotificationsYet}
                    </div>
                  );
                }
                return notifications.slice(0, 1).map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Footer with View All Button */}
            {notifications.length > 0 && (
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleViewAll}
                  className="flex items-center justify-center space-x-1 px-2 py-1 text-xs text-white bg-blue-500 dark:dark:bg-blue-600 text-white rounded transition-colors"
                >
                  <span>{Constants.superadminConstants.viewAllButton}</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
