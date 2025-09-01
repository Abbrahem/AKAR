import React from 'react';
import { useQuery } from 'react-query';
import { 
  PlusIcon,
  EyeIcon,
  HeartIcon,
  HomeIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PropertyCard from '../components/properties/PropertyCard';

const Dashboard = () => {
  const { user } = useAuthStore();

  // Fetch user's properties
  const { data: properties, isLoading: propertiesLoading } = useQuery(
    'user-properties',
    () => axios.get('/properties/my-properties').then(res => res.data.properties),
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch user's favorites
  const { data: favorites, isLoading: favoritesLoading } = useQuery(
    'user-favorites',
    () => axios.get('/properties/favorites').then(res => res.data.properties),
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch recent activities
  const { data: activities, isLoading: activitiesLoading } = useQuery(
    'user-activities',
    () => axios.get('/users/activities').then(res => res.data.activities),
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (propertiesLoading || favoritesLoading || activitiesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const stats = [
    { label: 'عقاراتي', value: properties?.length || 0, icon: HomeIcon, color: 'blue' },
    { label: 'المفضلة', value: favorites?.length || 0, icon: HeartIcon, color: 'red' },
    { label: 'المشاهدات', value: '1,234', icon: EyeIcon, color: 'green' },
    { label: 'الأنشطة', value: activities?.length || 0, icon: CheckCircleIcon, color: 'purple' }
  ];

  const recentStats = [
    { label: 'عقارات جديدة', value: '12', icon: HomeIcon, color: 'blue' },
    { label: 'مشاهدات اليوم', value: '89', icon: ClockIcon, color: 'green' },
    { label: 'رسائل جديدة', value: '5', icon: UserGroupIcon, color: 'purple' },
    { label: 'عقارات مفضلة', value: '23', icon: HeartIcon, color: 'red' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-600 mt-2">مرحباً {user?.name}، إليك ملخص نشاطك</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className="mr-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {recentStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className="mr-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* My Properties */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">عقاراتي</h2>
            <Link
              to="/add-property"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              إضافة عقار
            </Link>
          </div>

          {properties?.length === 0 ? (
            <div className="text-center py-8">
              <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عقارات</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة عقارك الأول</p>
              <Link
                to="/add-property"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                إضافة عقار
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties?.slice(0, 6).map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </div>

        {/* My Favorites */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">المفضلة</h2>
            <Link
              to="/properties"
              className="text-primary-600 hover:text-primary-700 transition-colors duration-200"
            >
              عرض الكل
            </Link>
          </div>

          {favorites?.length === 0 ? (
            <div className="text-center py-8">
              <HeartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مفضلات</h3>
              <p className="text-gray-600 mb-4">ابدأ بتصفح العقارات وإضافة المفضلة</p>
              <Link
                to="/properties"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                <EyeIcon className="w-5 h-5 mr-2" />
                تصفح العقارات
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites?.slice(0, 6).map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">الأنشطة الأخيرة</h2>

          {activities?.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أنشطة</h3>
              <p className="text-gray-600">ستظهر هنا أنشطتك الأخيرة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities?.slice(0, 10).map((activity, index) => (
                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity.description}</p>
                    <p className="text-gray-600 text-sm">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
