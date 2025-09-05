# HomeSwift Backend API

A Node.js and Express.js backend API for the HomeSwift real estate platform.

## Features

- **Property Management**: CRUD operations for properties
- **User Authentication**: JWT-based authentication system
- **Search & Filtering**: Advanced property search with filters
- **File Upload**: Image upload for property listings
- **Rate Limiting**: API protection against abuse
- **Security**: Helmet.js for security headers, CORS configuration
- **Validation**: Input validation using express-validator

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration

5. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/forgot-password` - Password reset request

### Properties
- `GET /api/properties` - Get all properties (with filtering)
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Users
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile/:id` - Update user profile
- `GET /api/users/:id/saved-properties` - Get saved properties
- `POST /api/users/:id/saved-properties` - Save a property
- `DELETE /api/users/:id/saved-properties/:propertyId` - Remove saved property

### Search
- `GET /api/search/suggestions` - Get search suggestions
- `POST /api/search` - Perform property search

## Query Parameters

### Properties Filtering
- `type` - Property type (apartment, house, condo, townhouse)
- `status` - Property status (for-rent, for-sale)
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `bedrooms` - Minimum number of bedrooms
- `location` - Location filter
- `page` - Page number for pagination
- `limit` - Items per page

Example:
```
GET /api/properties?type=apartment&status=for-rent&minPrice=1000000&maxPrice=5000000&page=1&limit=10
```

## Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+234-801-234-5678"
}
```

### Create Property
```bash
POST /api/properties
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Modern 2BR Apartment",
  "price": 2500000,
  "location": "Victoria Island, Lagos",
  "bedrooms": 2,
  "bathrooms": 2,
  "area": 1200,
  "type": "apartment",
  "status": "for-rent",
  "description": "Beautiful modern apartment",
  "amenities": ["Swimming Pool", "Gym", "Security"]
}
```

### Search Properties
```bash
POST /api/search
Content-Type: application/json

{
  "query": "apartment Lagos",
  "filters": {
    "minPrice": 1000000,
    "maxPrice": 5000000,
    "bedrooms": 2,
    "type": "apartment"
  }
}
```

## Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## Project Structure

```
server/
├── middleware/
│   ├── auth.js          # Authentication middleware
│   └── upload.js        # File upload middleware
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── properties.js    # Property routes
│   ├── search.js        # Search routes
│   └── users.js         # User routes
├── utils/
│   └── database.js      # Mock database utilities
├── uploads/             # File upload directory
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
├── server.js           # Main server file
└── README.md           # This file
```

## Development

### Running in Development Mode
```bash
npm run dev
```

This uses nodemon for automatic server restart on file changes.

### Production Mode
```bash
npm start
```

## Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API request rate limiting
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Request validation using express-validator
- **Password Hashing**: bcryptjs for secure password storage

## Mock Data

The current implementation uses mock data for development. In production, you should:

1. Set up a real database (MongoDB, PostgreSQL, etc.)
2. Replace mock data with actual database operations
3. Implement proper data persistence
4. Add database migrations and seeders

## Next Steps

1. **Database Integration**: Replace mock data with real database
2. **Email Service**: Implement email notifications
3. **Image Processing**: Add image optimization and resizing
4. **Caching**: Implement Redis for caching
5. **Testing**: Add unit and integration tests
6. **Documentation**: API documentation with Swagger
7. **Deployment**: Docker containerization and deployment scripts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
