# دليل نشر المشروع - Akar Real Estate

هذا الدليل يوضح كيفية نشر منصة Akar العقارية على منصات مختلفة.

## 🚀 النشر على Vercel (Frontend)

### الخطوات:

1. **إعداد المشروع**
```bash
# تأكد من أن المشروع جاهز للنشر
cd client
npm run build
```

2. **إنشاء حساب على Vercel**
- اذهب إلى [vercel.com](https://vercel.com)
- سجل حساب جديد أو سجل الدخول

3. **ربط المشروع**
- انقر على "New Project"
- اربط حساب GitHub
- اختر repository المشروع
- اختر مجلد `client` كـ Root Directory

4. **إعداد متغيرات البيئة**
في إعدادات المشروع على Vercel، أضف:
```
REACT_APP_API_URL=https://your-backend-domain.com
```

5. **النشر**
- انقر على "Deploy"
- انتظر حتى يكتمل النشر

## 🐳 النشر على Railway (Backend)

### الخطوات:

1. **إنشاء حساب على Railway**
- اذهب إلى [railway.app](https://railway.app)
- سجل حساب جديد

2. **ربط المشروع**
- انقر على "New Project"
- اختر "Deploy from GitHub repo"
- اختر repository المشروع
- اختر مجلد `server` كـ Root Directory

3. **إعداد متغيرات البيئة**
أضف المتغيرات التالية:
```
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
NODE_ENV=production
```

4. **إعداد MongoDB**
- يمكنك استخدام MongoDB Atlas
- أو إضافة MongoDB service من Railway

5. **النشر**
- انقر على "Deploy"
- انتظر حتى يكتمل النشر

## ☁️ النشر على Heroku

### Backend على Heroku:

1. **إنشاء حساب على Heroku**
- اذهب إلى [heroku.com](https://heroku.com)
- سجل حساب جديد

2. **تثبيت Heroku CLI**
```bash
npm install -g heroku
```

3. **تسجيل الدخول**
```bash
heroku login
```

4. **إنشاء تطبيق**
```bash
cd server
heroku create your-app-name
```

5. **إعداد متغيرات البيئة**
```bash
heroku config:set MONGODB_URI=your-mongodb-connection-string
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production
```

6. **النشر**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Frontend على Heroku:

1. **إنشاء تطبيق جديد**
```bash
cd client
heroku create your-frontend-app-name
```

2. **إضافة buildpack**
```bash
heroku buildpacks:set mars/create-react-app
```

3. **إعداد متغيرات البيئة**
```bash
heroku config:set REACT_APP_API_URL=https://your-backend-app.herokuapp.com
```

4. **النشر**
```bash
git add .
git commit -m "Deploy frontend to Heroku"
git push heroku main
```

## 🐳 النشر باستخدام Docker

### إنشاء Dockerfile للـ Backend:

```dockerfile
# server/Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### إنشاء Dockerfile للـ Frontend:

```dockerfile
# client/Dockerfile
FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### إنشاء docker-compose.yml:

```yaml
version: '3.8'

services:
  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/akar
      - JWT_SECRET=your-secret-key
      - NODE_ENV=production
    depends_on:
      - mongo

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### تشغيل المشروع:

```bash
docker-compose up -d
```

## 🔧 إعدادات الإنتاج

### تحسين الأداء:

1. **ضغط الصور**
```bash
npm install -g imagemin-cli
imagemin client/public/images/* --out-dir=client/public/images/optimized
```

2. **تحسين Bundle**
```bash
cd client
npm run build
```

3. **إعداد CORS**
في ملف `server/index.js`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### الأمان:

1. **إعداد Helmet**
```bash
cd server
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

2. **Rate Limiting**
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

## 📊 المراقبة والتحليلات

### إضافة Logging:

```bash
cd server
npm install winston
```

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### إضافة Health Check:

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## 🔄 النشر المستمر (CI/CD)

### GitHub Actions:

إنشاء ملف `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to Railway
      uses: railway/deploy@v1
      with:
        service: backend
        token: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        working-directory: ./client
```

## 📝 ملاحظات مهمة

1. **تأكد من تحديث URLs** في جميع الملفات
2. **اختبار التطبيق** بعد النشر
3. **إعداد SSL/HTTPS** للإنتاج
4. **مراقبة الأداء** والاستخدام
5. **إعداد النسخ الاحتياطية** لقاعدة البيانات

## 🆘 استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ CORS**
- تأكد من إعداد CORS بشكل صحيح
- تحقق من URLs المسموح بها

2. **خطأ في الاتصال بقاعدة البيانات**
- تحقق من connection string
- تأكد من إعدادات الشبكة

3. **خطأ في تحميل الصور**
- تحقق من مسارات الصور
- تأكد من إعدادات الملفات الثابتة

### أدوات مفيدة:

- **Postman** لاختبار API
- **MongoDB Compass** لإدارة قاعدة البيانات
- **Chrome DevTools** لتصحيح Frontend
