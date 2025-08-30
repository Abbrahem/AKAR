import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      // Initialize auth state from localStorage
      initializeAuth: () => {
        try {
          const token = localStorage.getItem('token');
          const user = localStorage.getItem('user');
          
          if (token && token !== 'null' && token !== 'undefined' && user && user !== 'null') {
            const parsedUser = JSON.parse(user);
            set({
              user: parsedUser,
              token,
              isAuthenticated: true
            });
            get().setAuthHeader(token);
          } else {
            get().logout();
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          get().logout();
        }
      },

      // Set auth header for axios
      setAuthHeader: (token) => {
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          delete axios.defaults.headers.common['Authorization'];
        }
      },

      setLoginData: (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        set({
          user: userData,
          token,
          isAuthenticated: true
        });
        get().setAuthHeader(token);
      },

      // Register
      register: async (userData) => {
        set({ loading: true });
        try {
          const response = await axios.post('/auth/register', userData);
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            loading: false 
          });
          
          get().setAuthHeader(token);
          toast.success(`مرحباً ${user.name}! تم إنشاء حسابك بنجاح`);
          
          return { success: true };
        } catch (error) {
          set({ loading: false });
          const message = error.response?.data?.message || 'خطأ في إنشاء الحساب';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Login with credentials
      login: async (credentials) => {
        set({ loading: true });
        try {
          const response = await axios.post('/auth/login', credentials);
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          set({
            user,
            token,
            isAuthenticated: true,
            loading: false
          });
          get().setAuthHeader(token);
          toast.success(`مرحباً ${user.name}!`);
          
          return { success: true };
        } catch (error) {
          set({ loading: false });
          const message = error.response?.data?.message || 'خطأ في تسجيل الدخول';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Get current user
      getCurrentUser: async () => {
        try {
          const response = await axios.get('/auth/me');
          const { user } = response.data;
          set({ user, isAuthenticated: true });
        } catch (error) {
          get().logout();
        }
      },

      // Update profile
      updateProfile: async (profileData) => {
        set({ loading: true });
        try {
          const response = await axios.put('/auth/profile', profileData);
          const { user } = response.data;
          
          set({ user, loading: false });
          toast.success('تم تحديث الملف الشخصي بنجاح');
          
          return { success: true };
        } catch (error) {
          set({ loading: false });
          const message = error.response?.data?.message || 'خطأ في تحديث الملف الشخصي';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Change password
      changePassword: async (passwordData) => {
        set({ loading: true });
        try {
          await axios.post('/auth/change-password', passwordData);
          set({ loading: false });
          toast.success('تم تغيير كلمة المرور بنجاح');
          return { success: true };
        } catch (error) {
          set({ loading: false });
          const message = error.response?.data?.message || 'خطأ في تغيير كلمة المرور';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Logout
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
        get().setAuthHeader(null);
      },

      // Check if user has role
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      // Check if user has any of the roles
      hasAnyRole: (roles) => {
        const { user } = get();
        return roles.includes(user?.role);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export { useAuthStore };
