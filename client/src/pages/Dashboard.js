import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  HomeIcon, 
  HeartIcon, 
  ChatBubbleLeftRightIcon,
  EyeIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PropertyCard from '../components/properties/PropertyCard';

const Dashboard = () => {
  const { user } = useAuthStore();

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery(
    ['dashboard'],
    () => axios.get('/users/dashboard').then(res => res.data.dashboard)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="جاري تحميل لوحة التحكم..." />
      </div>
    );
  }

  const renderBuyerDashboard = () => (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <HeartIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">العقارات المفضلة</h3>
              <p className="text-2xl font-bold text-red-600">{dashboardData?.stats?.favoriteCount || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-semibold text-gray-900">المحادثات</h3>
              <p className="text-2xl font-bold text-blue-600">{dashboardData?.stats?.conversationsCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Favorite Properties */}
      {dashboardData?.favoriteProperties?.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">العقارات المفضلة</h2>
            <Link to="/favorites" className="text-primary-600 hover:text-primary-700 font-medium">
              عرض الكل
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.favoriteProperties.slice(0, 3).map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderSellerDashboard = () => (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <HomeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-sm font-medium text-gray-600">إجمالي العقارات</h3>
              <p className="text-2xl font-bold text-blue-600">{dashboardData?.stats?.totalProperties || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-sm font-medium text-gray-600">معتمد</h3>
              <p className="text-2xl font-bold text-green-600">{dashboardData?.stats?.propertiesByStatus?.approved || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-sm font-medium text-gray-600">في الانتظار</h3>
              <p className="text-2xl font-bold text-yellow-600">{dashboardData?.stats?.propertiesByStatus?.pending || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <EyeIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-sm font-medium text-gray-600">إجمالي المشاهدات</h3>
              <p className="text-2xl font-bold text-purple-600">{dashboardData?.stats?.totalViews || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/add-property" className="btn-primary flex items-center space-x-2 rtl:space-x-reverse">
            <PlusIcon className="w-4 h-4" />
            <span>إضافة عقار جديد</span>
          </Link>
          <Link to="/my-properties" className="btn-outline">
            عرض عقاراتي
          </Link>
          <Link to="/chat" className="btn-outline">
            المحادثات
          </Link>
        </div>
      </div>

      {/* Recent Properties */}
      {dashboardData?.myProperties?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">عقاراتي الحديثة</h2>
            <Link to="/my-properties" className="text-primary-600 hover:text-primary-700 font-medium">
              عرض الكل
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.myProperties.slice(0, 3).map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderAdminDashboard = () => (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-sm font-medium text-gray-600">إجمالي المستخدمين</h3>
              <p className="text-2xl font-bold text-blue-600">{dashboardData?.stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <HomeIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-sm font-medium text-gray-600">إجمالي العقارات</h3>
              <p className="text-2xl font-bold text-green-600">{dashboardData?.stats?.totalProperties || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-sm font-medium text-gray-600">في انتظار الموافقة</h3>
              <p className="text-2xl font-bold text-yellow-600">{dashboardData?.stats?.pendingProperties || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="mr-4">
              <h3 className="text-sm font-medium text-gray-600">معتمد</h3>
              <p className="text-2xl font-bold text-purple-600">{dashboardData?.stats?.approvedProperties || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Properties */}
      {dashboardData?.pendingProperties?.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">العقارات في انتظار الموافقة</h2>
          <div className="space-y-4">
            {dashboardData.pendingProperties.slice(0, 5).map((property) => (
              <div key={property._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{property.title}</h3>
                  <p className="text-sm text-gray-600">
                    بواسطة {property.owner.name} • {new Date(property.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Link
                    to={`/properties/${property._id}`}
                    className="btn-outline text-sm"
                  >
                    عرض
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            مرحباً، {user?.name}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'buyer' && 'اكتشف العقارات المناسبة لك'}
            {user?.role === 'seller' && 'إدارة عقاراتك ومتابعة الأداء'}
            {user?.role === 'agent' && 'إدارة محفظة العقارات الخاصة بك'}
            {user?.role === 'admin' && 'إدارة المنصة ومراجعة العقارات'}
          </p>
        </div>

        {/* Dashboard Content */}
        {user?.role === 'buyer' && renderBuyerDashboard()}
        {(user?.role === 'seller' || user?.role === 'agent') && renderSellerDashboard()}
        {user?.role === 'admin' && renderAdminDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
