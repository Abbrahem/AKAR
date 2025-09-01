import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  UsersIcon,
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('properties');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch pending properties
  const { data: properties, isLoading: propertiesLoading } = useQuery(
    ['admin-properties'],
    () => axios.get('/properties?status=pending').then(res => res.data.properties)
  );

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery(
    ['admin-users'],
    () => axios.get('/users/admin/users').then(res => res.data.users)
  );

  // Property approval mutation
  const approvePropertyMutation = useMutation(
    (propertyId) => axios.put(`/properties/${propertyId}/approve`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-properties']);
        toast.success('تم قبول العقار بنجاح');
      },
      onError: () => {
        toast.error('حدث خطأ في قبول العقار');
      }
    }
  );

  // Property rejection mutation
  const rejectPropertyMutation = useMutation(
    (propertyId) => axios.put(`/properties/${propertyId}/reject`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-properties']);
        toast.success('تم رفض العقار');
      },
      onError: () => {
        toast.error('حدث خطأ في رفض العقار');
      }
    }
  );

  // User status update mutation
  const updateUserStatusMutation = useMutation(
    ({ userId, status }) => axios.put(`/users/admin/users/${userId}/status`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
        toast.success('تم تحديث حالة المستخدم');
      },
      onError: () => {
        toast.error('حدث خطأ في تحديث حالة المستخدم');
      }
    }
  );

  const tabs = [
    { id: 'properties', label: 'العقارات المعلقة', icon: HomeIcon },
    { id: 'users', label: 'إدارة المستخدمين', icon: UsersIcon }
  ];

  const getRoleLabel = (role) => {
    const roles = {
      buyer: 'مشتري',
      seller: 'بائع',
      agent: 'وسيط عقاري',
      admin: 'مدير'
    };
    return roles[role] || role;
  };

  const getStatusLabel = (status) => {
    const statuses = {
      active: 'نشط',
      inactive: 'غير نشط',
      suspended: 'معلق'
    };
    return statuses[status] || status;
  };

  const filteredUsers = users?.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderPropertiesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">العقارات المعلقة للمراجعة</h2>
        <div className="text-sm text-gray-600">
          {properties?.length || 0} عقار في الانتظار
        </div>
      </div>

      {propertiesLoading ? (
        <LoadingSpinner />
      ) : properties?.length === 0 ? (
        <div className="text-center py-12">
          <HomeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">لا توجد عقارات معلقة للمراجعة</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {properties?.map((property) => (
            <div key={property._id} className="card p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Property Image */}
                <div className="lg:w-64 h-48 bg-gray-200 rounded-lg overflow-hidden">
                  {property.images?.[0] ? (
                    <img
                      src={`/api/properties/${property._id}/images/${property.images[0]._id}`}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <HomeIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Property Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {property.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{property.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>📍 {property.location?.city}</span>
                        <span>🏠 {property.type}</span>
                        <span>💰 {property.price?.toLocaleString()} ريال</span>
                        <span>📐 {property.area} م²</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        المالك: {property.owner?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(property.createdAt), {
                          addSuffix: true,
                          locale: ar
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Property Features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {property.bedrooms} غرف نوم
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {property.bathrooms} حمامات
                      </span>
                      {property.features?.map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => approvePropertyMutation.mutate(property._id)}
                      disabled={approvePropertyMutation.isLoading}
                      className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>قبول</span>
                    </button>
                    <button
                      onClick={() => rejectPropertyMutation.mutate(property._id)}
                      disabled={rejectPropertyMutation.isLoading}
                      className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      <span>رفض</span>
                    </button>
                    <button
                      onClick={() => window.open(`/properties/${property._id}`, '_blank')}
                      className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>عرض</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">إدارة المستخدمين</h2>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="البحث عن مستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pr-10 w-64"
          />
        </div>
      </div>

      {usersLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المستخدم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ التسجيل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers?.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : user.status === 'suspended'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusLabel(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                        locale: ar
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        {user.status === 'active' ? (
                          <button
                            onClick={() => updateUserStatusMutation.mutate({
                              userId: user._id,
                              status: 'suspended'
                            })}
                            className="text-red-600 hover:text-red-900"
                          >
                            تعليق
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserStatusMutation.mutate({
                              userId: user._id,
                              status: 'active'
                            })}
                            className="text-green-600 hover:text-green-900"
                          >
                            تفعيل
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">لوحة الإدارة</h1>
          <p className="text-gray-600 mt-2">إدارة العقارات والمستخدمين</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 rtl:space-x-reverse">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'properties' && renderPropertiesTab()}
        {activeTab === 'users' && renderUsersTab()}
      </div>
    </div>
  );
};

export default Admin;
