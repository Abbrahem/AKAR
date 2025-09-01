import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  BuildingOfficeIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  Squares2X2Icon,
  ArrowRightOnRectangleIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import MobileNavbar from './MobileNavbar';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const unreadCount = unreadData?.count || 0;

  // Public navigation items
  const publicNavItems = [
    { name: 'الرئيسية', href: '/', icon: HomeIcon },
    { name: 'العقارات', href: '/properties', icon: BuildingOfficeIcon }
  ];

  // Authenticated user navigation items
  const authenticatedNavItems = isAuthenticated ? [
    ...(user?.role === 'seller' || user?.role === 'agent' || user?.role === 'admin' 
      ? [{ name: 'إضافة عقار', href: '/add-property', icon: PlusIcon }] 
      : []),
    { name: 'المحادثات', href: '/chat', icon: ChatBubbleLeftRightIcon, badge: unreadCount },
    { name: 'لوحة التحكم', href: '/dashboard', icon: UserIcon }
  ] : [];

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <BuildingOfficeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">Akar</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8 rtl:space-x-reverse">
              {publicNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href) 
                      ? 'text-primary-600 border-b-2 border-primary-600' 
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right side - Auth buttons or User menu */}
            <div className="flex items-center space-x-3 sm:space-x-4 rtl:space-x-reverse">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:block text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
                  >
                    <span className="hidden sm:inline">إنشاء حساب</span>
                    <span className="sm:hidden">تسجيل</span>
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-3 sm:space-x-4 rtl:space-x-reverse">
                  {/* Navigation Items for Authenticated Users - Desktop Only */}
                  <div className="hidden lg:flex items-center space-x-6 rtl:space-x-reverse">
                    {authenticatedNavItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="relative flex items-center text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                      >
                        <item.icon className="w-5 h-5 mr-1 rtl:mr-0 rtl:ml-1" />
                        {item.name}
                        {item.badge && item.badge > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>

                  {/* User Menu - Desktop Only */}
                  <div className="relative hidden md:block">
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="flex items-center space-x-2 rtl:space-x-reverse text-gray-700 hover:text-primary-600 focus:outline-none transition-colors duration-200"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium hidden lg:block">{user?.name}</span>
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsOpen(false)}
                        />
                        
                        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => setIsOpen(false)}
                          >
                            <UserIcon className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                            الملف الشخصي
                          </Link>
                          
                          {user?.role === 'admin' && (
                            <Link
                              to="/admin"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                              onClick={() => setIsOpen(false)}
                            >
                              <Squares2X2Icon className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                              لوحة الإدارة
                            </Link>
                          )}
                          
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                            تسجيل الخروج
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Mobile User Avatar - Shows only name and login status */}
                  <div className="md:hidden flex items-center">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Bottom Navigation */}
      <MobileNavbar />
    </>
  );
};

export default Navbar;
