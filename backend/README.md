# Adaptive AI Knowledge Workspace - Authentication Backend

Complete, production-ready authentication backend built with Node.js, Express, and MongoDB.

## Features

- User registration with email verification
- Secure login with JWT authentication
- Password reset functionality
- Protected routes with role-based access control
- Rate limiting to prevent brute force attacks
- Input validation and sanitization
- Comprehensive error handling
- Email notifications
- Clean, scalable architecture

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **nodemailer** - Email service
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── userController.js    # User profile logic
├── middlewares/
│   ├── auth.js              # JWT verification
│   ├── validation.js        # Input validation
│   ├── errorHandler.js      # Error handling
│   └── rateLimiter.js       # Rate limiting
├── models/
│   └── User.js              # User schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   └── userRoutes.js        # User endpoints
├── utils/
│   ├── jwt.js               # JWT helpers
│   └── email.js             # Email helpers
├── .env.example             # Environment variables template
├── server.js                # Entry point
└── package.json             # Dependencies
```

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/adaptive_ai_workspace
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
FRONTEND_URL=http://localhost:3000
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication Routes

#### 1. Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "preferences": {
        "theme": "auto",
        "favorite_topics": []
      }
    }
  }
}
```

#### 2. Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

#### 3. Verify Email
```http
GET /api/auth/verify-email/:token
```

#### 4. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### 5. Reset Password
```http
POST /api/auth/reset-password/:token
Content-Type: application/json

{
  "password": "NewPassword123"
}
```

### User Routes (Protected)

#### 1. Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>
```

#### 2. Get User Profile
```http
GET /api/users/profile/:id
Authorization: Bearer <token>
```

#### 3. Update User Profile
```http
PATCH /api/users/profile/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "preferences": {
    "theme": "dark",
    "favorite_topics": ["AI", "Machine Learning"]
  }
}
```

## Security Features

### 1. Password Security
- Minimum 8 characters
- Must contain uppercase, lowercase, and number
- Hashed with bcrypt (10 salt rounds)

### 2. JWT Authentication
- Tokens expire after 7 days (configurable)
- Secure token verification
- Protected routes require valid token

### 3. Rate Limiting
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 attempts per 15 minutes
- Prevents brute force attacks

### 4. Input Validation
- Email format validation
- Password strength requirements
- Sanitization of user inputs
- MongoDB injection prevention

### 5. Security Headers
- Helmet.js for secure HTTP headers
- CORS configuration
- XSS protection

## Error Handling

All errors return a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Invalid input data
- `USER_EXISTS` - Email already registered
- `INVALID_CREDENTIALS` - Wrong email/password
- `NO_TOKEN` - Missing authentication token
- `INVALID_TOKEN` - Invalid or expired token
- `USER_NOT_FOUND` - User doesn't exist
- `FORBIDDEN` - Insufficient permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate app password
3. Use app password in `EMAIL_PASSWORD`

For other providers, update `EMAIL_HOST` and `EMAIL_PORT`.

## Testing

Test the API using tools like:
- Postman
- Thunder Client
- cURL
- Insomnia

Example cURL request:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123"}'
```

## Deployment

### Environment Variables
Ensure all production environment variables are set:
- Use strong `JWT_SECRET`
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Configure email service

### Production Checklist
- [ ] Set strong JWT secret
- [ ] Configure production database
- [ ] Set up email service
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

## Future Enhancements

- OAuth integration (Google, GitHub)
- Two-factor authentication (2FA)
- Session management
- Refresh tokens
- Account deletion
- Admin dashboard
- User activity logs
- API documentation with Swagger

## License

MIT
