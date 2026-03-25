# College Administration Management System - Backend

Backend API for the College Administration Management System built with Node.js, Express, and MongoDB.

## 📋 Overview

This is the server-side application that handles:
- User authentication and authorization (JWT)
- Video content management with Azure Blob Storage
- Student attendance tracking
- Online fee payments (Razorpay integration)
- Event management
- Real-time notifications
- Analytics and reporting

## 🏗️ Architecture

```
Backend/
├── config/              (Configuration & services)
│   ├── database.js      (MongoDB connection)
│   ├── environment.js   (Environment variables)
│   ├── azure.js         (Azure Blob Storage)
│   └── constants.js     (Application constants)
├── middleware/          (Express middleware)
│   ├── auth.js          (JWT middleware)
│   ├── roleGuard.js     (RBAC middleware)
│   └── errorHandler.js  (Error handling)
├── services/            (Business logic)
│   └── authService.js   (Authentication service)
├── utils/               (Utility functions)
│   ├── logger.js        (Winston logger)
│   └── responses.js     (Response envelopes)
├── routes/              (API routes)
├── controllers/         (Route handlers)
├── tests/               (Test files)
└── server.js            (Entry point)
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB Atlas account
- Azure Storage Account
- Razorpay account (optional, for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Start the server**
   ```bash
   # Development (with hot reload)
   npm run dev

   # Production
   npm start
   ```

5. **Verify server is running**
   ```bash
   curl http://localhost:5000/health
   ```

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Login and get JWT tokens
- `POST /auth/refresh-token` - Refresh access token
- `GET /auth/verify` - Verify current user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password/:token` - Reset password

### Dashboard Endpoints
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/users` - List users
- `GET /dashboard/classes` - List classes

### Video Endpoints
- `POST /api/videos/upload` - Upload video to Azure
- `GET /api/videos` - List videos
- `GET /api/videos/:id` - Get video details
- `GET /api/videos/:id/stream` - Stream video (Azure SAS URL)
- `POST /api/videos/:id/progress` - Track watch progress

### Payment Endpoints
- `POST /payments/initiate` - Create payment order (Razorpay)
- `POST /payments/verify` - Verify payment
- `POST /payments/webhook` - Razorpay webhook handler
- `GET /payments/pending-fees` - Get pending fees
- `GET /payments/history` - Get payment history

### Additional Endpoints
- `GET /health` - Health check
- `GET /api/version` - API version

## 🔧 Configuration

### Environment Variables (.env)

```env
# Application
NODE_ENV=development
PORT=5000
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRY=7d

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=...
AZURE_STORAGE_CONTAINER_NAME=videos

# Razorpay
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## 📐 Code Standards

### Linting
```bash
# Check for linting errors
npm run lint

# Fix linting errors
npm run lint:fix
```

### Code Style
- ESLint with Airbnb configuration
- Prettier for code formatting
- Comments for all complex logic

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* actual data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Human-readable error",
  "error": {
    "code": "ERROR_CODE",
    "details": []
  }
}
```

## 🔐 Security

- **Authentication:** JWT with access & refresh tokens
- **Authorization:** Role-Based Access Control (RBAC)
- **Password Security:** bcrypt hashing
- **Validation:** Input validation on all endpoints
- **HTTPS:** Required in production
- **Payment Security:** Signature verification for Razorpay webhooks
- **Azure Storage:** SAS URLs with time-limited access

Per SRS 5.3 & 7.4: All security protocols are implemented as per specification.

## 🚨 Error Handling

All errors return consistent error envelopes with:
- HTTP status codes (400, 401, 403, 404, 500)
- Human-readable error messages
- Error codes for programmatic handling
- Detailed error information for debugging

## 📝 Logging

Uses Winston logger with:
- Console output (development)
- File output (error.log, combined.log)
- Log levels: fatal, error, warn, info, debug, trace
- Structured JSON logging for production

## 🔄 Deployment

### Production Checklist
- [ ] All environment variables configured (.env.production)
- [ ] Database credentials secured
- [ ] JWT secrets changed
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Error monitoring (Sentry) configured
- [ ] Database backups automated
- [ ] Logs aggregation set up

## 📞 Support & Contribution

For issues or contributions, please refer to the main project repository.

## 📄 License

MIT License - See LICENSE file for details

---

**Version:** 1.0.0  
**Last Updated:** March 25, 2026  
**Node Version:** 18+  
**Express Version:** 4.18+
