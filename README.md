# MERN Task Manager

A full-stack task management application built with MongoDB, Express.js, React, and Node.js featuring authentication, role-based permissions, and comprehensive task management capabilities.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication with localStorage token storage
- Role-based access control (Admin/Member)
- Secure password hashing with bcrypt
- Protected routes and middleware
- No cookies - pure JWT token authentication

### Task Management
- Full CRUD operations for tasks
- Task filtering by status, priority, and search
- Pagination and sorting capabilities
- Activity logging for task changes
- Due date tracking with overdue indicators
- Tag system for task organization

### User Management (Admin Only)
- View all users with pagination
- Update user roles
- Search users by email

### Dashboard & Analytics
- Task statistics overview
- Status and priority breakdowns
- Overdue task tracking
- Recent task activity

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **express-validator** - Input validation
- **Jest & Supertest** - Testing framework

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Custom hooks** - State management
- **Modular components** - Reusable UI components

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dharmik
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Database Setup**
   - Start MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in `.env` file

5. **Create Demo Users**
   - Start the server first: `npm run dev`
   - Use API requests to create demo users:
   ```bash
   # Create Admin User

  
     "email":"admin@example.com",
     
     "password":"Password123"
   
   # Create Member User  

    "email":"member@example.com",

    "password":"Password123"
   ```

6. **Start the application**
   ```bash
   # Start server (from server directory)
   npm run dev
   
   # Start client (from client directory)
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/taskmanager` |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment mode | `development` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

The test suite includes:
- Authentication endpoints
- Task CRUD operations
- User management
- Statistics endpoints
- Role-based access control

### Test Coverage
- Auth controller tests
- Task controller tests
- User controller tests
- Stats controller tests
- Middleware tests

## 📁 Project Structure

```
dharmik/
├── .env.example            # Environment variables template
├── README.md               # Project documentation
├── server/                 # Backend application
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   │   ├── authController.ts
│   │   │   ├── taskController.ts
│   │   │   ├── userController.ts
│   │   │   └── statsController.ts
│   │   ├── middleware/     # Custom middleware
│   │   │   ├── auth.ts     # Authentication middleware
│   │   │   ├── cors.ts     # CORS configuration
│   │   │   └── validation.ts
│   │   ├── models/         # Mongoose models
│   │   │   ├── User.ts     # User model
│   │   │   ├── Task.ts     # Task model
│   │   │   └── Activity.ts # Activity log model
│   │   ├── routes/         # API routes
│   │   │   ├── auth.ts     # Authentication routes
│   │   │   ├── tasks.ts    # Task management routes
│   │   │   ├── users.ts    # User management routes
│   │   │   └── stats.ts    # Statistics routes
│   │   ├── validation/     # Input validation schemas
│   │   │   ├── authValidation.ts
│   │   │   ├── taskValidation.ts
│   │   │   └── userValidation.ts
│   │   └── index.ts        # Server entry point
│   ├── __tests__/          # Test files
│   │   ├── auth.test.js
│   │   ├── stats.test.js
│   │   ├── tasks.test.js
│   │   ├── users.test.js
│   │   └── setup.js
│   ├── dist/               # Compiled TypeScript files
│   ├── node_modules/       # Dependencies
│   ├── package.json        # Server dependencies
│   ├── tsconfig.json       # TypeScript configuration
│   └── jest.config.js      # Jest test configuration
├── client/                 # Frontend application
│   ├── public/
│   │   ├── index.html      # HTML template
│   │   └── vite.svg        # Vite logo
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── StatsPanel.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskFilters.tsx
│   │   │   └── TaskForm.tsx
│   │   ├── contexts/       # React contexts
│   │   │   └── AuthContext.tsx # Authentication context
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── useAuth.tsx # AuthProvider component
│   │   │   ├── useAuthHook.tsx # Authentication hook
│   │   │   ├── useTasks.ts # Task management hook
│   │   │   └── useUsers.ts # User management hook
│   │   ├── pages/          # Page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── TasksPage.tsx
│   │   │   └── UsersPage.tsx
│   │   ├── types/          # TypeScript definitions
│   │   │   └── index.ts    # Type definitions
│   │   ├── App.tsx         # App entry point
│   │   ├── index.css       # Global styles
│   │   └── main.tsx        # React entry point
│   ├── node_modules/       # Dependencies
│   ├── package.json        # Client dependencies
│   ├── tsconfig.json       # TypeScript configuration
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   ├── vite.config.ts      # Vite configuration
│   └── .eslintrc.js        # ESLint configuration
```

## 🔐 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Tasks
- `GET /tasks` - Get tasks with filtering/pagination
- `POST /tasks` - Create new task
- `GET /tasks/:id` - Get specific task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Users (Admin only)
- `GET /users` - Get all users
- `PATCH /users/:id/role` - Update user role

### Statistics
- `GET /stats/overview` - Get task statistics

## 👥 User Roles

### Member
- Create, read, update, delete own tasks
- View tasks assigned to them
- Access personal statistics

### Admin
- All member permissions
- View and manage all tasks
- User management capabilities
- Access to comprehensive statistics
- System administration features

## 🏗 Architecture Decisions & Trade-offs

### Development Trade-offs Made

• **JWT Token Storage** - Uses localStorage for JWT tokens with Authorization headers, providing client-side flexibility while maintaining secure authentication flow

• **Tailwind CSS vs Component Libraries** - Selected Tailwind for complete design control and modern SaaS aesthetics, requiring more custom styling but achieving unique visual identity

• **Role-based Filtering vs Database Views** - Implemented application-level role filtering for flexibility, trading some database performance for easier permission management and testing

• **React Context vs State Management Library** - Used React Context for auth state to minimize dependencies, trading advanced state management features for simpler architecture and faster development

• **Express Validation vs Schema Validation** - Chose express-validator for granular control over input validation, trading some type safety for detailed error messaging and flexible validation rules

### Backend Architecture
- **RESTful API design** - Standard HTTP methods and status codes
- **Middleware-based authentication** - Reusable auth logic
- **Role-based access control** - Granular permissions
- **Input validation** - express-validator for data integrity
- **Activity logging** - Track task changes for audit

### Frontend Architecture
- **Component composition** - Modular, reusable components
- **Custom hooks** - Centralized state management
- **Type safety** - TypeScript for better development experience
- **Separation of concerns** - Clear separation between UI and logic

### Security Considerations
- JWT tokens stored in localStorage with Authorization headers
- Password hashing with salt
- Input validation and sanitization
- CORS configuration (credentials: false for JWT-only auth)
- Role-based route protection

## 🚀 Deployment

### Production Build
```bash
# Build server
cd server
npm run build

# Build client
cd ../client
npm run build
```

### Docker Support (Optional)
```dockerfile
# Example Dockerfile for server
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- Frontend TypeScript configuration needs adjustment for strict mode
- Some lint warnings for type imports in development
- React Router DOM types may need installation

## ✅ Recent Fixes

### JWT-Only Authentication Implementation
- **Issue**: Application was using cookie-based authentication which caused issues with token management
- **Solution**: Completely migrated to JWT-only authentication:
  - Removed all cookie dependencies (`cookie-parser` package)
  - Updated CORS configuration to `credentials: false`
  - Modified all API calls to use Authorization headers
  - Updated client-side token storage to use localStorage
  - Fixed circular import issues in authentication utilities
- **Result**: Clean JWT-only authentication flow with proper token management

### Fast Refresh Issue Resolution
- **Issue**: Fast Refresh was not working due to mixed exports (components + hooks) in the same file
- **Solution**: Separated authentication logic into dedicated files:
  - `contexts/AuthContext.tsx` - Context definition and types
  - `hooks/useAuth.tsx` - AuthProvider component only
  - `hooks/useAuthHook.tsx` - useAuth hook only
- **Result**: Fast Refresh now works properly during development, improving developer experience

## 🔮 Future Enhancements

- Real-time notifications
- File attachments for tasks
- Team collaboration features
- Advanced reporting and analytics
- Mobile application
- Email notifications
- Task templates
- Time tracking

## 📞 Support

For support and questions, please create an issue in the repository or contact the development team.

---

**Demo Credentials:**
- Admin: admin@example.com / Password123
- Member: member@example.com / Password123
