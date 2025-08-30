import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  HomeIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  StarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PropertyCard from '../components/properties/PropertyCard';
import PropertySlider from '../components/ui/PropertySlider';
import ContactForm from '../components/forms/ContactForm';
import Footer from '../components/layout/Footer';
import { useAuthStore } from '../store/authStore';

const Home = () => {
  const { isAuthenticated } = useAuthStore();

  // Fetch latest properties
  const { data: latestProperties, isLoading: propertiesLoading } = useQuery(
    'latest-properties',
    () => axios.get('/properties?limit=3&sortBy=createdAt&sortOrder=desc').then(res => res.data.properties),
    {
      retry: false,
      refetchOnWindowFocus: false
    }
  );

  const stats = [
    { label: 'عقار متاح', value: '2,500+', icon: HomeIcon },
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
      title: 'مواقع مميزة',
      description: 'عقارات في أفضل المواقع والأحياء الراقية',
      icon: MapPinIcon
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
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
          }}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Hello Welcome to Akar fe Mkank
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Your premier real estate platform in Egypt. Discover thousands of premium properties across all governorates
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/properties"
              className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 text-lg shadow-lg"
            >
              <MagnifyingGlassIcon className="w-6 h-6 mr-3" />
              Browse Properties
            </Link>
            
            {!isAuthenticated && (
              <Link
                to="/register"
                className="inline-flex items-center px-10 py-4 bg-white text-blue-600 font-semibold rounded-xl border-2 border-white hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 text-lg shadow-lg"
              >
                <UserGroupIcon className="w-6 h-6 mr-3" />
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>


      {/* Latest Properties Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              أحدث العقارات
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              اكتشف أحدث العقارات المضافة إلى منصتنا
            </p>
          </div>

          {propertiesLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestProperties?.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/properties"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              عرض جميع العقارات
            </Link>
          </div>
        </div>
      </section>

      {/* Company Info Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              لماذا تختار منصة العقار؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نحن الرائدون في مجال العقارات في مصر مع خبرة تزيد عن 15 عاماً في السوق المصري
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HomeIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">2,500+</h3>
              <p className="text-gray-600">عقار متاح في جميع المحافظات</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">1,850+</h3>
              <p className="text-gray-600">عميل راضي عن خدماتنا</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">1,200+</h3>
              <p className="text-gray-600">صفقة مكتملة بنجاح</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">4.9/5</h3>
              <p className="text-gray-600">تقييم العملاء لخدماتنا</p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact/Complaint Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              تواصل معنا أو أرسل شكوى
            </h2>
            <p className="text-xl text-gray-600">
              نحن هنا لمساعدتك. أرسل لنا استفسارك أو شكواك وسنتواصل معك في أقرب وقت
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              لماذا تختار منصتنا؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نوفر لك أفضل الأدوات والخدمات لتجعل رحلة البحث عن العقار أو بيعه سهلة وممتعة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center hover:shadow-medium transition-shadow duration-300">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              أنواع العقارات
            </h2>
            <p className="text-xl text-gray-600">
              اختر من بين مجموعة متنوعة من أنواع العقارات
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              to="/properties?propertyType=apartment"
              className="group card overflow-hidden hover:shadow-medium transition-all duration-300"
            >
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <HomeIcon className="w-16 h-16 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                  شقق سكنية
                </h3>
                <p className="text-gray-600">
                  شقق حديثة ومجهزة بأفضل المواصفات
                </p>
              </div>
            </Link>
            
            <Link
              to="/properties?propertyType=villa"
              className="group card overflow-hidden hover:shadow-medium transition-all duration-300"
            >
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <BuildingOfficeIcon className="w-16 h-16 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                  فيلات فاخرة
                </h3>
                <p className="text-gray-600">
                  فيلات واسعة مع حدائق ومسابح خاصة
                </p>
              </div>
            </Link>
            
            <Link
              to="/properties?propertyType=office"
              className="group card overflow-hidden hover:shadow-medium transition-all duration-300"
            >
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <UserGroupIcon className="w-16 h-16 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                  مكاتب تجارية
                </h3>
                <p className="text-gray-600">
                  مساحات عمل حديثة في مواقع استراتيجية
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            هل تريد بيع عقارك؟
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            انضم إلى آلاف البائعين الذين يثقون بمنصتنا لبيع عقاراتهم بأفضل الأسعار
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-lg text-primary-600 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            ابدأ البيع الآن
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
