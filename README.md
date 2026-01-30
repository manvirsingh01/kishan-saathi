# Kishan Saathi - Climate Intelligence System

A production-ready climate intelligence platform for Indian farmers, providing actionable insights for climate adaptation, crop recommendations, and insurance/compensation documentation.

## 🌟 Features

### For Farmers
- **Climate Stress Detection**: Real-time analysis of heat stress, soil moisture, and rainfall irregularity
- **Risk Assessment**: Flood and drought probability predictions with contributing factors
- **Smart Crop Recommendations**: AI-powered crop suggestions using Google Gemini
- **Soil & Water Dashboard**: Fertility assessment and groundwater availability
- **Climate Loss Reports**: Insurance-ready PDF reports documenting invisible yield losses
- **Advanced Analytics**: Historical trends, yield loss estimation, and financial impact analysis
- **Government Information**: Access to policies, MSP, compensation schemes, and subsidies
- **Bilingual Interface**: English and Hindi language support
  
### Technical Features
- Real-time weather data integration (OpenWeather API)a
- Gemini AI for intelligent crop recommendations
- PDF report generation for insurance claims
- JWT-based authentication
- Responsive design for mobile and desktop
- Interactive maps for farm location
- Data visualization charts

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js. 
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken), bcrypt
- **APIs**: OpenWeather API, Google Gemini AI
- **PDF**: PDFKit
- **Validation**: express-validator

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Maps**: Leaflet, React-Leaflet
- **Internationalization**: i18next, react-i18next
- **Styling**: CSS with custom design system

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- OpenWeather API key ([Get it here](https://openweathermap.org/api))
- Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <https://github.com/manvirsingh01/kishan-saathi.git>
cd "kishan-saathi"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/kishan-saathi

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# OpenWeather API
OPENWEATHER_API_KEY=your-openweather-api-key

# Google Gemini AI API
GEMINI_API_KEY=your-gemini-api-key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file in the frontend directory (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas:**
- Update `MONGODB_URI` in backend `.env` with your Atlas connection string

### 5. Run the Application

**Start Backend (in backend directory):**
```bash
npm run dev
```
Backend will run on `http://localhost:5000`

**Start Frontend (in frontend directory):**
```bash
npm start
```
Frontend will run on `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new farmer
- `POST /api/auth/login` - Login farmer
- `GET /api/auth/verify` - Verify JWT token

### Profile Endpoints
- `GET /api/profile` - Get farmer profile
- `PUT /api/profile` - Update profile
- `PUT /api/profile/location` - Update farm location

### Climate Endpoints
- `GET /api/climate/stress` - Get climate stress indicators
- `GET /api/climate/risk` - Get flood/drought risk assessment
- `GET /api/climate/history` - Get historical climate data

### Soil Endpoints
- `GET /api/soil/sustainability` - Get soil fertility and water assessment

### Crop Endpoints
- `POST /api/crops/recommend` - Get AI crop recommendations
- `GET /api/crops/history` - Get recommendation history
- `GET /api/crops/recommendation/:id` - Get specific recommendation

### Reports Endpoints
- `POST /api/reports/loss` - Create loss report
- `GET /api/reports/loss` - Get all loss reports
- `GET /api/reports/loss/:id` - Get specific report
- `PUT /api/reports/loss/:id` - Update report
- `GET /api/reports/pdf/:id` - Download PDF report

### Analytics Endpoints
- `GET /api/analytics/climate` - Get climate trends
- `GET /api/analytics/yield` - Get yield loss analytics
- `GET /api/analytics/summary` - Get overview summary

### Government Endpoints
- `GET /api/government/info` - Get government information
- `GET /api/government/info/:id` - Get specific info
- `GET /api/government/categories` - Get categories
- `POST /api/government/admin` - Create info (admin)
- `PUT /api/government/admin/:id` - Update info (admin)
- `DELETE /api/government/admin/:id` - Delete info (admin)

## 🗂️ Project Structure

```
kishan-saathi/
├── backend/
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic services
│   ├── middleware/       # Auth & other middleware
│   ├── reports/          # Generated PDF reports
│   ├── server.js         # Express server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── utils/       # API client, i18n
│   │   ├── App.jsx      # Main app with routing
│   │   ├── index.js     # Entry point
│   │   └── index.css    # Global styles
│   ├── public/
│   └── package.json
│
└── README.md
```

## 👥 User Roles

### Farmer (Default)
- Access all climate and crop features
- Generate loss reports
- View analytics
- Access government information

### Admin
- All farmer features
- Manage government information
- Add/edit/delete policies, MSP, compensation schemes

## 🌐 Default Test User

After registration, you can create a test user with these credentials:
- Email: `farmer@test.com`
- Password: `password123`
- State: Any Indian state
- District: Any district name

## 📱 Features Walkthrough

### 1. Register & Login
- Fill farm details including location, land area, soil type
- Login with email and password

### 2. Dashboard
- View quick stats and latest climate assessment
- Quick access to all features

### 3. Climate Stress Detection
- Real-time heat, soil moisture, and rainfall analysis
- Visual indicators for stress levels

### 4. Risk Assessment
- Flood and drought probability with contributing factors
- Region-specific risk calculations

### 5. Crop Recommendations
- Click "Get Recommendations" for AI-powered suggestions
- View resilience scores, yield expectations, benefits

### 6. Loss Reports
- Document climate-related losses
- Generate insurance-ready PDF reports

### 7. Analytics
- View historical climate trends
- Track yield loss over time

## 🔧 Configuration

### API Keys Required
1. **OpenWeather API**: Free tier provides 1,000 calls/day
2. **Google Gemini API**: Free tier available

### Environment Variables
- See `.env.example` in backend directory for all required variables

## 🚀 Deployment

### Backend Deployment (e.g., Heroku, Railway, Render)
1. Set environment variables in hosting platform
2. Ensure MongoDB connection string is updated
3. Deploy backend code

### Frontend Deployment (e.g., Vercel, Netlify)
1. Update `REACT_APP_API_URL` to production backend URL
2. Build: `npm run build`
3. Deploy build folder

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT License - feel free to use this project for learning or production.

## 🆘 Support

For issues or questions:
- Create an issue in the repository
- Check API documentation above

## 🎯 Future Enhancements

- [ ] Real satellite imagery integration
- [ ] SMS alerts for climate warnings
- [ ] Marketplace integration for crop selling
- [ ] Community forum for farmers
- [ ] Weather forecasting models
- [ ] Crop disease detection
- [ ] Yield prediction ML models

---

**Made with ❤️ for Indian Farmers**
