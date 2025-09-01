import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from 'react-query';
import axios from 'axios';

const MobileNavbar = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Fetch unread messages count
  const { data: unreadData } = useQuery(
    'unread-messages',
    () => axios.get('/chat/unread-count').then(res => res.data),
    {
      enabled: isAuthenticated && !!user,
      refetchInterval: 10000, // Refetch every 10 seconds
      retry: false,
      onError: (error) => {
        if (error.response?.status === 401) {
          console.log('User not authenticated for unread messages');
        }
      }
    }
  );

  const unreadCount = unreadData?.count || 0;

  // Navigation items for authenticated users
  const authenticatedNavItems = [
    {
      name: 'الرئيسية',
      href: '/',
      icon: HomeIcon
    },
    {
      name: 'العقارات',
      href: '/properties',
      icon: BuildingOfficeIcon
    },
    {
      name: 'إضافة عقار',
      href: '/add-property',
      icon: PlusIcon,
      roles: ['seller', 'agent', 'admin']
    },
    {
      name: 'المحادثات',
      href: '/chat',
      icon: ChatBubbleLeftRightIcon,
      badge: unreadCount
    },
    {
      name: 'الملف الشخصي',
      href: '/profile',
      icon: UserIcon
    }
  ];

  // Navigation items for non-authenticated users
  const publicNavItems = [
    {
      name: 'الرئيسية',
      href: '/',
      icon: HomeIcon
    },
    {
      name: 'العقارات',
      href: '/properties',
      icon: BuildingOfficeIcon
    },
    {
      name: 'تسجيل الدخول',
      href: '/login',
      icon: UserIcon
    }
  ];

  const navItems = isAuthenticated ? authenticatedNavItems : publicNavItems;
  
  const filteredNavItems = isAuthenticated 
    ? navItems.filter(item => !item.roles || item.roles.includes(user?.role))
    : navItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50 md:hidden">
      <div className="flex justify-around items-center">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center py-2 px-2 rounded-lg transition-colors duration-200 relative ${
                isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-center leading-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavbar;
