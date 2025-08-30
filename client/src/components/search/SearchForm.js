import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';

const SearchForm = ({ compact = false }) => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    city: '',
    propertyType: '',
    listingType: '',
    minPrice: '',
    maxPrice: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build query string
    const params = new URLSearchParams();
    Object.entries(searchData).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    navigate(`/properties?${params.toString()}`);
  };

  const handleChange = (e) => {
    setSearchData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            name="city"
            placeholder="المدينة..."
            value={searchData.city}
            onChange={handleChange}
            className="input"
          />
        </div>
        <button type="submit" className="btn-primary">
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* City */}
        <div className="relative">
          <MapPinIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="city"
            placeholder="المدينة"
            value={searchData.city}
            onChange={handleChange}
            className="input pr-10"
          />
        </div>

        {/* Property Type */}
        <div>
          <select
            name="propertyType"
            value={searchData.propertyType}
            onChange={handleChange}
            className="input"
          >
            <option value="">نوع العقار</option>
            <option value="apartment">شقة</option>
            <option value="house">منزل</option>
            <option value="villa">فيلا</option>
            <option value="office">مكتب</option>
            <option value="shop">محل تجاري</option>
            <option value="warehouse">مستودع</option>
            <option value="land">أرض</option>
          </select>
        </div>

        {/* Listing Type */}
        <div>
          <select
            name="listingType"
            value={searchData.listingType}
            onChange={handleChange}
            className="input"
          >
            <option value="">نوع الإعلان</option>
            <option value="sale">للبيع</option>
            <option value="rent">للإيجار</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            name="minPrice"
            placeholder="السعر من"
            value={searchData.minPrice}
            onChange={handleChange}
            className="input"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="السعر إلى"
            value={searchData.maxPrice}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* Search Button */}
        <button type="submit" className="btn-primary flex items-center justify-center gap-2">
          <MagnifyingGlassIcon className="w-5 h-5" />
          <span>بحث</span>
        </button>
      </div>
    </form>
  );
};

export default SearchForm;
