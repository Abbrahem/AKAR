import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  UserIcon,
  Squares2X2Icon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';

const MobileNavbar = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

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
      icon: ChatBubbleLeftRightIcon
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 md:hidden">
      <div className="flex justify-around items-center">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavbar;
