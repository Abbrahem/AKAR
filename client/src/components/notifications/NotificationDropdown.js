import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications } = useQuery(
    ['notifications'],
    () => axios.get('/notifications?limit=10').then(res => res.data),
    {
      enabled: isAuthenticated,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Mark notification as read
  const markAsReadMutation = useMutation(
    (notificationId) => axios.put(`/notifications/${notificationId}/read`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications']);
      }
    }
  );

  // Mark all as read
  const markAllAsReadMutation = useMutation(
    () => axios.put('/notifications/mark-all-read'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications']);
      }
    }
  );

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_message':
        return '💬';
      case 'property_approved':
        return '✅';
      case 'property_rejected':
        return '❌';
      case 'new_property_match':
        return '🏠';
      case 'offer_received':
        return '💰';
      default:
        return '🔔';
    }
  };

  if (!isAuthenticated) return null;

  const unreadCount = notifications?.unreadCount || 0;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown content */}
          <div className="absolute left-0 rtl:right-0 mt-2 w-80 bg-white rounded-lg shadow-medium border border-gray-100 z-20 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">الإشعارات</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    تحديد الكل كمقروء
                  </button>
                )}
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-80 overflow-y-auto">
              {notifications?.notifications?.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <BellIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications?.notifications?.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                        !notification.isRead ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3 rtl:space-x-reverse">
                        <div className="flex-shrink-0 text-lg">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: ar
                            })}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications?.notifications?.length > 0 && (
              <div className="p-4 border-t border-gray-100">
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  عرض جميع الإشعارات
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
