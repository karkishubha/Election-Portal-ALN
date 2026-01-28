# Nepal Election Portal 2082

A comprehensive Nepal election information portal with a React frontend and Node.js/Express backend using MySQL database.

## Project Structure

```
Portal/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth & file upload middleware
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── scripts/        # Database scripts
│   │   └── server.js       # Entry point
│   ├── uploads/            # Uploaded PDF files
│   ├── .env                # Environment variables
│   └── package.json
│
└── frontend/               # React + Vite application
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── context/        # React context (Auth)
    │   ├── hooks/          # Custom hooks (useQueries)
    │   ├── lib/            # API service & utilities
    │   ├── pages/          # Public & admin pages
    │   └── App.tsx         # Main application
    ├── .env                # Frontend environment
    └── package.json
```

## Features

### Public Features
- **Voter Education**: Educational resources about voting process
- **Election Integrity**: Resources on election standards and anti-misinformation
- **Political Parties**: Information about registered parties with manifestos and PR lists
- **Election Monitoring**: Newsletters from ALN and DRN

### Admin Features
- Secure JWT-based authentication
- CRUD operations for all content types
- PDF file uploads
- Publish/unpublish content
- Dashboard with statistics

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Security**: bcryptjs, helmet, cors

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Data Fetching**: TanStack Query
- **Routing**: React Router v6
- **Animations**: Framer Motion

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### 1. MySQL Database Setup

Create a new MySQL database:

```sql
CREATE DATABASE nepal_election_portal;
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your MySQL credentials

# Seed admin user (uses credentials from .env)
npm run seed:admin

# Start development server
npm run dev
```

The backend will start on http://localhost:5000

### 3. Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on http://localhost:5173

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development

# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nepal_election_portal
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d

# Admin Seed
ADMIN_EMAIL=admin@votenepal.com
ADMIN_PASSWORD=Admin@2082

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/voter-education | Get voter education resources |
| GET | /api/election-integrity | Get election integrity resources |
| GET | /api/election-integrity/categories | Get available categories |
| GET | /api/newsletters | Get newsletters |
| GET | /api/parties | Get political parties |
| GET | /api/health | Health check |

### Admin Endpoints (Requires Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Admin login |
| GET | /api/auth/me | Get current admin |
| PUT | /api/auth/password | Change password |
| GET/POST | /api/admin/voter-education | Manage voter education |
| PUT/DELETE | /api/admin/voter-education/:id | Update/delete resource |
| PATCH | /api/admin/voter-education/:id/publish | Toggle publish |
| GET/POST | /api/admin/election-integrity | Manage election integrity |
| GET/POST | /api/admin/newsletters | Manage newsletters |
| GET/POST | /api/admin/parties | Manage political parties |
| POST | /api/upload/pdf | Upload PDF file |

## Admin Account

Configure in backend `.env`:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Seed with `npm run seed:admin` and change the password after first login.

## Database Models

### AdminUser
- email, password, role (admin/superadmin)

### VoterEducation
- title, description, pdfUrl, language, published

### ElectionIntegrity
- title, description, pdfUrl, category, language, published
- Categories: code-of-conduct, misinformation, campaign-finance, observation-standards, voter-protection, legal-framework, integrity-reports

### Newsletter
- title, summary, pdfUrl, source (ALN/DRN/other), publishedDate, language, published

### PoliticalParty
- partyName, partyNameNepali, abbreviation, partySymbolUrl, officialWebsite, manifestoPdfUrl, prListPdfUrl, description, displayOrder, published

## Scripts

### Backend
```bash
npm run dev      # Start with nodemon
npm start        # Start production server
npm run seed:admin     # Seed admin user
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## License

This project is developed for the Nepal Election Portal 2082 initiative by Accountability Lab Nepal.

## Support

For technical support, contact: info@accountabilitylab.org
