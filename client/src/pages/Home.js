import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  EyeIcon,
  PlusIcon,
  CheckCircleIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  StarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PropertyCard from '../components/properties/PropertyCard';

const Home = () => {
  // Fetch recent properties
  const { data: recentProperties, isLoading: recentLoading } = useQuery(
    'recent-properties',
    () => axios.get('/properties?sortBy=createdAt&sortOrder=desc&limit=6').then(res => res.data.properties),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const stats = [
    { label: 'عقار متاح', value: '2,500+', icon: BuildingOfficeIcon },
    { label: 'عميل راضي', value: '1,850+', icon: UserGroupIcon },
    { label: 'صفقة مكتملة', value: '1,200+', icon: CheckCircleIcon },
    { label: 'تقييم ممتاز', value: '4.9', icon: StarIcon }
  ];

  const features = [
    {
      title: 'بحث متقدم',
      description: 'ابحث عن العقار المثالي باستخدام فلاتر متقدمة',
      icon: MagnifyingGlassIcon
    },
    {
      title: 'أسعار تنافسية',
      description: 'أفضل الأسعار في السوق مع إمكانية التفاوض',
      icon: CurrencyDollarIcon
    },
    {
      title: 'خدمة شاملة',
      description: 'نساعدك من البحث حتى إتمام الصفقة',
      icon: BuildingOfficeIcon
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              ابحث عن عقارك المثالي
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              منصة شاملة للعقارات تتيح لك العثور على أفضل الفرص
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/properties"
                className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 text-lg shadow-lg"
              >
                <EyeIcon className="w-6 h-6 mr-3" />
                تصفح العقارات
              </Link>
              
              <Link
                to="/register"
                className="inline-flex items-center px-10 py-4 bg-white text-blue-600 font-semibold rounded-xl border-2 border-white hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 text-lg shadow-lg"
              >
                <UserGroupIcon className="w-6 h-6 mr-3" />
                إنشاء حساب
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Properties */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">أحدث العقارات</h2>
            <p className="text-gray-600 text-lg">اكتشف أحدث العقارات المضافة إلى منصتنا</p>
          </div>

          {recentLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentProperties?.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/properties"
              className="inline-flex items-center px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              عرض جميع العقارات
              <PlusIcon className="w-5 h-5 mr-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">لماذا تختار منصتنا؟</h2>
            <p className="text-gray-600 text-lg">نقدم لك أفضل الخدمات في مجال العقارات</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">آراء عملائنا</h2>
            <p className="text-gray-600 text-lg">ماذا يقول عملاؤنا عن تجربتهم معنا</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">أحمد محمد</h4>
                  <p className="text-gray-600 text-sm">مشتري عقار</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "منصة ممتازة ساعدتني في العثور على العقار المثالي. الخدمة كانت احترافية وسريعة."
              </p>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <UserIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">فاطمة علي</h4>
                  <p className="text-gray-600 text-sm">بائعة عقار</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "بعت عقاري خلال أسبوع واحد! المنصة ساعدتني في الوصول لعدد كبير من المشترين."
              </p>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <UserIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">محمد حسن</h4>
                  <p className="text-gray-600 text-sm">مستثمر</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "أفضل منصة عقارية استخدمتها. البحث والفلترة متقدمة جداً والنتائج دقيقة."
              </p>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">ابدأ رحلتك العقارية اليوم</h2>
          <p className="text-xl mb-8 text-blue-100">
            انضم إلى آلاف العملاء الراضين واكتشف العقار المثالي لك
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/properties"
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <EyeIcon className="w-5 h-5 mr-2" />
              تصفح العقارات
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              <UserGroupIcon className="w-5 h-5 mr-2" />
              إنشاء حساب
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
