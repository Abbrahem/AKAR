import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  FunnelIcon, 
  MapPinIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import SearchForm from '../components/search/SearchForm';
import PropertyCard from '../components/properties/PropertyCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    propertyType: searchParams.get('propertyType') || '',
    listingType: searchParams.get('listingType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
    features: searchParams.get('features') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: parseInt(searchParams.get('page')) || 1
  });

  // Fetch properties
  const { data, isLoading } = useQuery(
    ['properties', filters],
    async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await axios.get(`/properties?${params.toString()}`);
      return response.data;
    },
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      propertyType: '',
      listingType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      minArea: '',
      maxArea: '',
      features: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1
    });
  };

  const propertyTypes = [
    { value: 'apartment', label: 'شقة' },
    { value: 'house', label: 'منزل' },
    { value: 'villa', label: 'فيلا' },
    { value: 'office', label: 'مكتب' },
    { value: 'shop', label: 'محل تجاري' },
    { value: 'warehouse', label: 'مستودع' },
    { value: 'land', label: 'أرض' }
  ];

  const features = [
    { value: 'parking', label: 'موقف سيارات' },
    { value: 'garden', label: 'حديقة' },
    { value: 'pool', label: 'مسبح' },
    { value: 'elevator', label: 'مصعد' },
    { value: 'balcony', label: 'شرفة' },
    { value: 'furnished', label: 'مفروش' },
    { value: 'airConditioning', label: 'تكييف' },
    { value: 'heating', label: 'تدفئة' },
    { value: 'security', label: 'أمن وحراسة' },
    { value: 'gym', label: 'صالة رياضية' }
  ];

  const renderFilters = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          البحث بالمدينة
        </label>
        <div className="relative">
          <MapPinIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            placeholder="ابحث بالمدينة..."
            className="input pr-10"
          />
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          نوع العقار
        </label>
        <select
          value={filters.propertyType}
          onChange={(e) => handleFilterChange('propertyType', e.target.value)}
          className="input"
        >
          <option value="">جميع الأنواع</option>
          {propertyTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Listing Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          نوع الإعلان
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleFilterChange('listingType', filters.listingType === 'sale' ? '' : 'sale')}
            className={`p-2 rounded-lg border text-sm font-medium transition-colors duration-200 ${
              filters.listingType === 'sale'
                ? 'bg-primary-50 border-primary-200 text-primary-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            للبيع
          </button>
          <button
            onClick={() => handleFilterChange('listingType', filters.listingType === 'rent' ? '' : 'rent')}
            className={`p-2 rounded-lg border text-sm font-medium transition-colors duration-200 ${
              filters.listingType === 'rent'
                ? 'bg-primary-50 border-primary-200 text-primary-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            للإيجار
          </button>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          نطاق السعر
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            placeholder="من"
            className="input"
          />
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            placeholder="إلى"
            className="input"
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          عدد الغرف
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => handleFilterChange('bedrooms', filters.bedrooms === num.toString() ? '' : num.toString())}
              className={`p-2 rounded-lg border text-sm font-medium transition-colors duration-200 ${
                filters.bedrooms === num.toString()
                  ? 'bg-primary-50 border-primary-200 text-primary-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Area Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          المساحة (متر مربع)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={filters.minArea}
            onChange={(e) => handleFilterChange('minArea', e.target.value)}
            placeholder="من"
            className="input"
          />
          <input
            type="number"
            value={filters.maxArea}
            onChange={(e) => handleFilterChange('maxArea', e.target.value)}
            placeholder="إلى"
            className="input"
          />
        </div>
      </div>

      {/* Features */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          المميزات
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {features.map(feature => (
            <label key={feature.value} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.features.includes(feature.value)}
                onChange={(e) => {
                  const currentFeatures = filters.features.split(',').filter(f => f);
                  if (e.target.checked) {
                    currentFeatures.push(feature.value);
                  } else {
                    const index = currentFeatures.indexOf(feature.value);
                    if (index > -1) currentFeatures.splice(index, 1);
                  }
                  handleFilterChange('features', currentFeatures.join(','));
                }}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="mr-2 text-sm text-gray-700">{feature.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={clearFilters}
        className="w-full btn-outline"
      >
        مسح الفلاتر
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container-responsive">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">العقارات</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            اكتشف أفضل العقارات المتاحة للبيع والإيجار
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-6 sm:mb-8">
          <SearchForm />
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(true)}
                className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse p-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <FunnelIcon className="w-5 h-5" />
                <span>الفلاتر</span>
              </button>
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:block">
              <div className="card p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                    <FunnelIcon className="w-5 h-5 mr-2" />
                    الفلاتر
                  </h2>
                </div>
                {renderFilters()}
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="flex-1">
            {/* Sort and Results Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4 sm:mb-0">
                <span className="text-sm text-gray-600">
                  {data?.pagination?.total || 0} عقار
                </span>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('sortOrder', sortOrder);
                  }}
                  className="input-sm w-auto"
                >
                  <option value="createdAt-desc">الأحدث</option>
                  <option value="createdAt-asc">الأقدم</option>
                  <option value="price-asc">السعر: من الأقل</option>
                  <option value="price-desc">السعر: من الأعلى</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : data?.properties?.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPinIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عقارات</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">لم نجد أي عقارات تطابق معايير البحث الخاصة بك</p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  مسح الفلاتر
                </button>
              </div>
            ) : (
              <>
                {/* Properties Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {data?.properties?.map((property) => (
                    <PropertyCard key={property._id} property={property} />
                  ))}
                </div>

                {/* Pagination */}
                {data?.pagination?.pages > 1 && (
                  <div className="flex justify-center">
                    <nav className="flex items-center space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={!data.pagination.hasPrev}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        السابق
                      </button>
                      
                      {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            page === filters.page
                              ? 'bg-primary-600 text-white'
                              : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={!data.pagination.hasNext}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        التالي
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters overlay */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowFilters(false)}>
          <div className="absolute right-0 top-0 h-full w-80 bg-white p-4 sm:p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg font-semibold text-gray-900">الفلاتر</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            {renderFilters()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;
