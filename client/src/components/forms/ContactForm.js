import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  PhoneIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Create WhatsApp message
      const message = `السلام عليكم، أريد التواصل معكم:

الاسم: ${data.name}
رقم الهاتف: ${data.phone}
الرسالة: ${data.message}`;

      const whatsappUrl = `https://wa.me/201092175699?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      toast.success('تم إرسال رسالتك بنجاح! سيتم توجيهك إلى الواتساب');
      reset();
    } catch (error) {
      toast.error('حدث خطأ أثناء إرسال الرسالة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الاسم الكامل *
          </label>
          <input
            {...register('name', {
              required: 'الاسم مطلوب',
              minLength: { value: 2, message: 'الاسم يجب أن يكون حرفين على الأقل' }
            })}
            type="text"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="أدخل اسمك الكامل"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رقم الهاتف *
          </label>
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              {...register('phone', {
                required: 'رقم الهاتف مطلوب',
                pattern: {
                  value: /^01[0-2,5]{1}[0-9]{8}$/,
                  message: 'رقم الهاتف غير صحيح (مثال: 01012345678)'
                }
              })}
              type="tel"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="01012345678"
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الرسالة أو الشكوى *
        </label>
        <textarea
          {...register('message', {
            required: 'الرسالة مطلوبة',
            minLength: { value: 10, message: 'الرسالة يجب أن تكون 10 أحرف على الأقل' }
          })}
          rows={5}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors.message ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="اكتب رسالتك أو شكواك هنا..."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" /> */}
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال عبر الواتساب'}
        </button>
        
        <p className="mt-3 text-sm text-gray-500">
          سيتم توجيهك إلى الواتساب لإرسال الرسالة إلى: 01092175699
        </p>
      </div>
    </form>
  );
};

export default ContactForm;
