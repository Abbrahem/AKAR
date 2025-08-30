import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  EyeIcon, 
  MapPinIcon,
  HomeIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const PropertyCard = ({ property }) => {
  const [isFavorited, setIsFavorited] = useState(
    property.favorites?.includes(useAuthStore.getState().user?._id)
  );
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  const favoriteMutation = useMutation(
    () => axios.post(`/properties/${property._id}/favorite`),
    {
      onSuccess: (data) => {
        setIsFavorited(data.data.isFavorited);
        queryClient.invalidateQueries(['properties']);
        toast.success(data.data.isFavorited ? 'تم إضافة العقار للمفضلة' : 'تم إزالة العقار من المفضلة');
      },
      onError: () => {
        toast.error('حدث خطأ أثناء تحديث المفضلة');
      }
    }
  );

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    favoriteMutation.mutate();
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

  const firstImage = property.images?.[0];

  return (
    <div className="card-hover group">
      <Link to={`/properties/${property._id}`}>
        {/* Image */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {firstImage ? (
            <img
              src={`/api/properties/${property._id}/images/${firstImage._id}`}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <HomeIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Favorite button */}
          <button
            onClick={handleFavoriteClick}
            disabled={favoriteMutation.isLoading}
            className="absolute top-3 left-3 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-sm transition-all duration-200"
          >
            {isFavorited ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Listing type badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              property.listingType === 'sale' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {getListingTypeLabel(property.listingType)}
            </span>
          </div>

          {/* Views count */}
          <div className="absolute bottom-3 left-3 flex items-center space-x-1 rtl:space-x-reverse bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
            <EyeIcon className="w-3 h-3" />
            <span>{property.views || 0}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <CurrencyDollarIcon className="w-4 h-4 text-primary-600" />
              <span className="text-lg font-bold text-primary-600">
                {formatPrice(property.price, property.currency)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {getPropertyTypeLabel(property.propertyType)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center space-x-1 rtl:space-x-reverse text-gray-600 mb-3">
            <MapPinIcon className="w-4 h-4" />
            <span className="text-sm">{property.location.city}, {property.location.country}</span>
          </div>

          {/* Property details */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600 mb-4">
            {property.bedrooms && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <span className="font-medium">{property.bedrooms}</span>
                <span>غرف</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <span className="font-medium">{property.bathrooms}</span>
                <span>حمام</span>
              </div>
            )}
            {property.area && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <span className="font-medium">{property.area.value}</span>
                <span>{property.area.unit === 'sqm' ? 'م²' : 'قدم²'}</span>
              </div>
            )}
          </div>

          {/* Owner info and contact */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-700">
                  {property.owner?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{property.owner?.name}</p>
                <p className="text-xs text-gray-500">
                  {property.owner?.role === 'agent' ? 'وسيط عقاري' : 'مالك'}
                </p>
              </div>
            </div>

            {isAuthenticated && user?._id !== property.owner?._id && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/chat/${property._id}/${property.owner._id}`;
                }}
                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;
