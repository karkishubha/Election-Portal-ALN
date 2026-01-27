# Nepal Election Portal - Setup Guide

Complete setup instructions for running this project on a new device.

## Prerequisites

### Required Software

1. **Node.js** (v18.0.0 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **MySQL** (v8.0 or higher)
   - Download: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP: https://www.apachefriends.org/
   - Verify: `mysql --version`

3. **Git**
   - Download: https://git-scm.com/
   - Verify: `git --version`

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/nepal-election-portal.git
cd nepal-election-portal
```

### 2. Setup MySQL Database

```sql
-- Login to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE nepal_election_portal;

-- Verify
SHOW DATABASES;
```

### 3. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` with your settings:
```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nepal_election_portal
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d

# Admin credentials (for initial setup)
ADMIN_EMAIL=admin@votenepal.com
ADMIN_PASSWORD=Admin@2082

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080
```

```bash
# Seed admin user
npm run seed:admin

# Start backend server
npm run dev
```

Backend will run at: `http://localhost:5000`

### 4. Frontend Setup

```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start frontend server
npm run dev
```

Frontend will run at: `http://localhost:8080`

## Quick Start Commands

### Terminal 1 - Backend
```bash
cd backend
npm install
npm run seed:admin
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

## Default Admin Credentials

- **Email:** admin@votenepal.com
- **Password:** Admin@2082
- **Admin URL:** http://localhost:8080/admin

## Dependencies Summary

### Backend Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web framework |
| sequelize | ^6.35.2 | MySQL ORM |
| mysql2 | ^3.6.5 | MySQL driver |
| jsonwebtoken | ^9.0.2 | JWT authentication |
| bcryptjs | ^2.4.3 | Password hashing |
| cors | ^2.8.5 | CORS handling |
| helmet | ^7.1.0 | Security headers |
| multer | ^1.4.5 | File uploads |
| dotenv | ^16.3.1 | Environment variables |
| morgan | ^1.10.0 | HTTP logging |
| express-validator | ^7.0.1 | Input validation |

### Frontend Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.1 | UI library |
| react-router-dom | ^6.30.1 | Routing |
| @tanstack/react-query | ^5.83.0 | Data fetching |
| tailwindcss | ^3.x | CSS framework |
| framer-motion | ^12.26.2 | Animations |
| lucide-react | ^0.462.0 | Icons |
| sonner | ^1.7.4 | Toast notifications |
| date-fns | ^3.6.0 | Date formatting |
| zod | ^3.25.76 | Schema validation |
| react-hook-form | ^7.61.1 | Form handling |

## Troubleshooting

### CORS Error
- Check `FRONTEND_URL` in backend `.env` matches your frontend URL
- Restart backend after changing `.env`

### Database Connection Error
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database `nepal_election_portal` exists

### Port Already in Use
```bash
# Windows - Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in .env
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| GET /api/health | Health check |
| POST /api/auth/login | Admin login |
| GET /api/voter-education | Voter education resources |
| GET /api/election-integrity | Election integrity docs |
| GET /api/newsletters | Newsletters |
| GET /api/parties | Political parties |
| GET /api/stats | Public statistics |

## Project Structure

```
Portal/
├── backend/
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, uploads
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── scripts/        # Seed scripts
│   │   └── server.js       # Entry point
│   ├── uploads/            # PDF storage
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── context/        # Auth context
│   │   ├── hooks/          # React Query hooks
│   │   ├── lib/            # API service
│   │   └── pages/          # Page components
│   └── package.json
│
└── README.md
```
