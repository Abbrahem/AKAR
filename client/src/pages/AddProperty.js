import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { 
  PhotoIcon, 
  XMarkIcon,
  MapPinIcon,
  HomeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import SimpleMap from '../components/maps/SimpleMap';

const AddProperty = () => {
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      currency: 'USD',
      propertyType: 'apartment',
      listingType: 'sale',
      'area.unit': 'sqm'
    }
  });

  const addPropertyMutation = useMutation(
    (formData) => axios.post('/properties', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    {
      onSuccess: (data) => {
        toast.success('تم إضافة العقار بنجاح! سيتم مراجعته من قبل الإدارة.');
        navigate('/dashboard');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'حدث خطأ أثناء إضافة العقار';
        toast.error(message);
      }
    }
  );

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 10) {
      toast.error('يمكن رفع 10 صور كحد أقصى');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create previews
    const newPreviews = [...imagePreviews];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target.result);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const onSubmit = async (data) => {
    if (images.length === 0) {
      toast.error('يجب رفع صورة واحدة على الأقل');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    
    // Add property data with proper nested field handling
    Object.entries(data).forEach(([key, value]) => {
      if (key.includes('.')) {
        // Handle nested objects like location.city, area.value
        formData.append(key, value);
      } else {
        formData.append(key, value);
      }
    });

    // Add features
    const features = {};
    document.querySelectorAll('input[name^="features."]').forEach(input => {
      const featureName = input.name.replace('features.', '');
      features[featureName] = input.checked;
    });
    formData.append('features', JSON.stringify(features));

    // Add images
    images.forEach(image => {
      formData.append('images', image);
    });

    try {
      await addPropertyMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
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
    { key: 'parking', label: 'موقف سيارات' },
    { key: 'garden', label: 'حديقة' },
    { key: 'pool', label: 'مسبح' },
    { key: 'elevator', label: 'مصعد' },
    { key: 'balcony', label: 'شرفة' },
    { key: 'furnished', label: 'مفروش' },
    { key: 'airConditioning', label: 'تكييف' },
    { key: 'heating', label: 'تدفئة' },
    { key: 'security', label: 'أمن وحراسة' },
    { key: 'gym', label: 'صالة رياضية' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">إضافة عقار جديد</h1>
          <p className="text-gray-600 mt-2">
            أضف تفاصيل عقارك وسيتم مراجعته من قبل فريقنا قبل النشر
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <HomeIcon className="w-5 h-5 mr-2" />
              المعلومات الأساسية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان العقار *
                </label>
                <input
                  {...register('title', {
                    required: 'عنوان العقار مطلوب',
                    minLength: { value: 5, message: 'العنوان يجب أن يكون 5 أحرف على الأقل' }
                  })}
                  type="text"
                  className={`input ${errors.title ? 'border-red-300' : ''}`}
                  placeholder="مثال: شقة فاخرة في وسط المدينة"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع العقار *
                </label>
                <select
                  {...register('propertyType', { required: 'نوع العقار مطلوب' })}
                  className={`input ${errors.propertyType ? 'border-red-300' : ''}`}
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.propertyType && (
                  <p className="mt-1 text-sm text-red-600">{errors.propertyType.message}</p>
                )}
              </div>

              {/* Listing Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الإعلان *
                </label>
                <select
                  {...register('listingType', { required: 'نوع الإعلان مطلوب' })}
                  className={`input ${errors.listingType ? 'border-red-300' : ''}`}
                >
                  <option value="sale">للبيع</option>
                  <option value="rent">للإيجار</option>
                </select>
                {errors.listingType && (
                  <p className="mt-1 text-sm text-red-600">{errors.listingType.message}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر *
                </label>
                <div className="flex">
                  <input
                    {...register('price', {
                      required: 'السعر مطلوب',
                      min: { value: 1, message: 'السعر يجب أن يكون أكبر من صفر' }
                    })}
                    type="number"
                    className={`input rounded-l-none ${errors.price ? 'border-red-300' : ''}`}
                    placeholder="0"
                  />
                  <select
                    {...register('currency')}
                    className="input rounded-r-none border-r-0 w-20"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="EGP">EGP</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المساحة *
                </label>
                <div className="flex">
                  <input
                    {...register('area.value', {
                      required: 'المساحة مطلوبة',
                      min: { value: 1, message: 'المساحة يجب أن تكون أكبر من صفر' }
                    })}
                    type="number"
                    className={`input rounded-l-none ${errors['area.value'] ? 'border-red-300' : ''}`}
                    placeholder="0"
                  />
                  <select
                    {...register('area.unit')}
                    className="input rounded-r-none border-r-0 w-20"
                  >
                    <option value="sqm">م²</option>
                    <option value="sqft">قدم²</option>
                  </select>
                </div>
                {errors['area.value'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['area.value'].message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف *
              </label>
              <textarea
                {...register('description', {
                  required: 'الوصف مطلوب',
                  minLength: { value: 20, message: 'الوصف يجب أن يكون 20 حرف على الأقل' }
                })}
                rows={4}
                className={`input ${errors.description ? 'border-red-300' : ''}`}
                placeholder="اكتب وصفاً مفصلاً عن العقار..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Property Details */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">تفاصيل العقار</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد غرف النوم
                </label>
                <input
                  {...register('bedrooms', {
                    min: { value: 0, message: 'عدد الغرف لا يمكن أن يكون سالباً' }
                  })}
                  type="number"
                  className="input"
                  placeholder="0"
                />
                {errors.bedrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bedrooms.message}</p>
                )}
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد الحمامات
                </label>
                <input
                  {...register('bathrooms', {
                    min: { value: 0, message: 'عدد الحمامات لا يمكن أن يكون سالباً' }
                  })}
                  type="number"
                  className="input"
                  placeholder="0"
                />
                {errors.bathrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                المميزات
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {features.map(feature => (
                  <label key={feature.key} className="flex items-center">
                    <input
                      type="checkbox"
                      name={`features.${feature.key}`}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="mr-2 text-sm text-gray-700">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2" />
              الموقع
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان *
                </label>
                <input
                  {...register('location.address', { required: 'العنوان مطلوب' })}
                  type="text"
                  className={`input ${errors['location.address'] ? 'border-red-300' : ''}`}
                  placeholder="الشارع والحي والمنطقة"
                />
                {errors['location.address'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['location.address'].message}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدينة *
                </label>
                <input
                  {...register('location.city', { required: 'المدينة مطلوبة' })}
                  type="text"
                  className={`input ${errors['location.city'] ? 'border-red-300' : ''}`}
                  placeholder="اسم المدينة"
                />
                {errors['location.city'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['location.city'].message}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الدولة *
                </label>
                <input
                  {...register('location.country', { required: 'الدولة مطلوبة' })}
                  type="text"
                  className={`input ${errors['location.country'] ? 'border-red-300' : ''}`}
                  placeholder="اسم الدولة"
                />
                {errors['location.country'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['location.country'].message}</p>
                )}
              </div>

              {/* Detailed Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان المفصل *
                </label>
                <input
                  {...register('location.detailedAddress', { required: 'العنوان المفصل مطلوب' })}
                  type="text"
                  className={`input ${errors['location.detailedAddress'] ? 'border-red-300' : ''}`}
                  placeholder="مثال: شارع الملك فهد، حي الملز، الرياض، المملكة العربية السعودية - سيتم تحديد الموقع على الخريطة تلقائياً"
                />
                {errors['location.detailedAddress'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['location.detailedAddress'].message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <PhotoIcon className="w-5 h-5 mr-2" />
              صور العقار
            </h2>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رفع الصور * (حد أقصى 10 صور)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors duration-200">
                <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">اسحب الصور هنا أو انقر للاختيار</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="btn-primary cursor-pointer"
                >
                  اختيار الصور
                </label>
              </div>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 rtl:space-x-reverse">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-outline"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'جاري الإضافة...' : 'إضافة العقار'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
