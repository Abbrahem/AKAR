# دليل النشر - Akar Real Estate Platform

## نشر التطبيق على Vercel

### الطريقة الأولى: من خلال GitHub
1. ارفع المشروع إلى GitHub
2. اذهب إلى [vercel.com](https://vercel.com)
3. اربط حسابك مع GitHub
4. اختر المشروع
5. تأكد من الإعدادات التالية:
   - Framework Preset: `Create React App`
   - Root Directory: `./`
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/build`
   - Install Command: `npm install`

### الطريقة الثانية: من خلال Vercel CLI
```bash
npm install -g vercel
cd client
vercel --prod
```

## نشر التطبيق على Netlify

### من خلال واجهة Netlify
1. اذهب إلى [netlify.com](https://netlify.com)
2. اسحب مجلد `client` إلى واجهة النشر
3. أو اربط مع GitHub واختر المشروع

### من خلال Netlify CLI
```bash
npm install -g netlify-cli
cd client
npm run build
netlify deploy --prod --dir=build
```

## متغيرات البيئة

أضف المتغيرات التالية في إعدادات منصة النشر:

```
REACT_APP_API_URL=https://your-backend-url.herokuapp.com
GENERATE_SOURCEMAP=false
```

## نشر الخادم (Backend)

### Railway
1. اذهب إلى [railway.app](https://railway.app)
2. اربط مع GitHub
3. اختر مجلد `server`
4. أضف متغيرات البيئة المطلوبة

### Heroku
```bash
cd server
heroku create your-app-name
git subtree push --prefix server heroku main
```

## ملاحظات مهمة

1. تأكد من تحديث `REACT_APP_API_URL` في الكود للإشارة إلى عنوان الخادم الصحيح
2. تأكد من أن الخادم يدعم CORS للنطاق الجديد
3. تأكد من إعداد متغيرات البيئة في منصة الاستضافة
4. قم بتشغيل `npm install` قبل البناء

## استكشاف الأخطاء

### خطأ في البناء
- تأكد من أن جميع التبعيات موجودة في package.json
- تأكد من أن الكود لا يحتوي على أخطاء ESLint
- تأكد من أن جميع الاستيرادات صحيحة

### خطأ في التشغيل
- تأكد من إعداد متغيرات البيئة
- تحقق من اتصال الشبكة بالخادم
- تحقق من إعدادات CORS في الخادم
