import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  HeartIcon, 
  EyeIcon, 
  MapPinIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  CheckCircleIcon,
  BanknotesIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import SimpleMap from '../components/maps/SimpleMap';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch property details
  const { data: property, isLoading, error } = useQuery(
    ['property', id],
    async () => {
      const response = await axios.get(`/properties/${id}`);
      setIsFavorited(response.data.property.favorites?.includes(user?._id));
      return response.data.property;
    }
  );

  // Toggle favorite
  const favoriteMutation = useMutation(
    () => axios.post(`/properties/${id}/favorite`),
    {
      onSuccess: (data) => {
        setIsFavorited(data.data.isFavorited);
        queryClient.invalidateQueries(['property', id]);
        toast.success(data.data.isFavorited ? 'تم إضافة العقار للمفضلة' : 'تم إزالة العقار من المفضلة');
      },
      onError: () => {
        toast.error('حدث خطأ أثناء تحديث المفضلة');
      }
    }
  );

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    favoriteMutation.mutate();
  };

  const handleContactOwner = () => {
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    navigate(`/chat/${property._id}/${property.owner._id}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ الرابط');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeLabel = (type) => {
    const types = {
      apartment: 'شقة',
      house: 'منزل',
      villa: 'فيلا',
      office: 'مكتب',
      shop: 'محل تجاري',
      warehouse: 'مستودع',
      land: 'أرض'
    };
    return types[type] || type;
  };

  const getListingTypeLabel = (type) => {
    return type === 'sale' ? 'للبيع' : 'للإيجار';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="جاري تحميل تفاصيل العقار..." />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">العقار غير موجود</h2>
          <p className="text-gray-600 mb-4">لم نتمكن من العثور على العقار المطلوب</p>
          <Link to="/properties" className="btn-primary">
            العودة للعقارات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Image Gallery */}
      <div className="relative h-96 md:h-[500px] bg-gray-200">
        {property.images?.length > 0 ? (
          <>
            <img
              src={`/api/properties/${property._id}/images/${property.images[currentImageIndex]._id}`}
              alt={property.title}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setShowImageModal(true)}
            />
            
            {/* Image navigation */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
                
                {/* Image indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 rtl:space-x-reverse">
                  {property.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <HomeIcon className="w-24 h-24 text-gray-400" />
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute top-4 left-4 flex space-x-2 rtl:space-x-reverse">
          <button
            onClick={handleFavoriteClick}
            disabled={favoriteMutation.isLoading}
            className="p-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-sm transition-all duration-200"
          >
            {isFavorited ? (
              <HeartSolidIcon className="w-6 h-6 text-red-500" />
            ) : (
              <HeartIcon className="w-6 h-6 text-gray-600" />
            )}
          </button>
          <button
            onClick={handleShare}
            className="p-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-sm transition-all duration-200"
          >
            <ShareIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Listing type badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            property.listingType === 'sale' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {getListingTypeLabel(property.listingType)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                <div className="flex items-center space-x-1 rtl:space-x-reverse text-gray-500">
                  <EyeIcon className="w-4 h-4" />
                  <span className="text-sm">{property.views || 0} مشاهدة</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 rtl:space-x-reverse text-gray-600 mb-4">
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{property.location.address}, {property.location.city}</span>
                </div>
                <span className="text-primary-600 font-medium">
                  {getPropertyTypeLabel(property.propertyType)}
                </span>
              </div>

              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <CurrencyDollarIcon className="w-6 h-6 text-primary-600" />
                <span className="text-3xl font-bold text-primary-600">
                  {formatPrice(property.price, property.currency)}
                </span>
              </div>
            </div>

            {/* Property details */}
            <div className="card p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">تفاصيل العقار</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {property.bedrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">غرف النوم</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">الحمامات</div>
                  </div>
                )}
                {property.area && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{property.area.value}</div>
                    <div className="text-sm text-gray-600">
                      {property.area.unit === 'sqm' ? 'متر مربع' : 'قدم مربع'}
                    </div>
                  </div>
                )}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{property.images?.length || 0}</div>
                  <div className="text-sm text-gray-600">الصور</div>
                </div>
              </div>

              {/* Features */}
              {Object.values(property.features || {}).some(Boolean) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">المميزات</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(property.features || {}).map(([key, value]) => {
                      if (!value) return null;
                      const featureLabels = {
                        parking: 'موقف سيارات',
                        garden: 'حديقة',
                        pool: 'مسبح',
                        elevator: 'مصعد',
                        balcony: 'شرفة',
                        furnished: 'مفروش',
                        airConditioning: 'تكييف',
                        heating: 'تدفئة',
                        security: 'أمن',
                        gym: 'صالة رياضية'
                      };
                      return (
                        <div key={key} className="flex items-center space-x-2 rtl:space-x-reverse">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">{featureLabels[key] || key}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">الوصف</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Map placeholder */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">الموقع</h2>
              <SimpleMap
                center={[24.7136, 46.6753]}
                zoom={12}
                markers={[{
                  lat: 24.7136,
                  lng: 46.6753,
                  title: property.title
                }]}
                height="256px"
                className="rounded-lg"
              />
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>العنوان:</strong> {property.location.address}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>المدينة:</strong> {property.location.city}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Owner info */}
            <div className="card p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات المالك</h2>
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-primary-700">
                    {property.owner?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{property.owner?.name}</h3>
                  <p className="text-sm text-gray-600">
                    {property.owner?.role === 'agent' ? 'وسيط عقاري' : 'مالك العقار'}
                  </p>
                </div>
              </div>

              {property.owner?.phone && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">رقم الهاتف</p>
                  <p className="font-medium text-gray-900">{property.owner.phone}</p>
                </div>
              )}

              {isAuthenticated && user?._id !== property.owner?._id && (
                <button
                  onClick={handleContactOwner}
                  className="w-full btn-primary flex items-center justify-center space-x-2 rtl:space-x-reverse mb-4 md:mb-0"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  <span>تواصل مع المالك</span>
                </button>
              )}
              
              {/* Mobile contact button - always visible on mobile */}
              <div className="block md:hidden">
                {isAuthenticated && user?._id !== property.owner?._id && (
                  <button
                    onClick={handleContactOwner}
                    className="fixed bottom-20 left-4 right-4 btn-primary flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-lg z-40"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    <span>تواصل مع المالك</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick info */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات سريعة</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">نوع العقار</span>
                  <span className="font-medium text-gray-900">
                    {getPropertyTypeLabel(property.propertyType)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">نوع الإعلان</span>
                  <span className="font-medium text-gray-900">
                    {getListingTypeLabel(property.listingType)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">السعر</span>
                  <span className="font-medium text-primary-600">
                    {formatPrice(property.price, property.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المدينة</span>
                  <span className="font-medium text-gray-900">{property.location.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ النشر</span>
                  <span className="font-medium text-gray-900">
                    {new Date(property.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && property.images?.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200 z-10"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            <img
              src={`/api/properties/${property._id}/images/${property.images[currentImageIndex]._id}`}
              alt={property.title}
              className="max-w-full max-h-full object-contain"
            />
            
            {property.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
                >
                  <ChevronLeftIcon className="w-8 h-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
                >
                  <ChevronRightIcon className="w-8 h-8" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
