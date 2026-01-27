# Nepal Election Portal - Backend API

🗳️ **A lightweight, secure API for Nepal's 2082 (2026) General Election Information Portal**

**Organization:** Accountability Lab Nepal  
**Election Date:** March 5, 2026 (Falgun 21, 2082 BS)

---

## 🏗️ Architecture Overview

```
backend/
├── src/
│   ├── config/
│   │   └── database.js       # MongoDB connection
│   ├── controllers/          # Business logic
│   │   ├── authController.js
│   │   ├── uploadController.js
│   │   ├── voterEducationController.js
│   │   ├── electionIntegrityController.js
│   │   ├── newsletterController.js
│   │   └── politicalPartyController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   └── errorHandler.js   # Global error handling
│   ├── models/               # Mongoose schemas
│   │   ├── AdminUser.js
│   │   ├── VoterEducation.js
│   │   ├── ElectionIntegrity.js
│   │   ├── Newsletter.js
│   │   └── PoliticalParty.js
│   ├── routes/               # API routes
│   ├── scripts/
│   │   └── seedAdmin.js      # Create initial admin
│   ├── utils/
│   │   ├── upload.js         # Multer PDF upload
│   │   └── response.js       # Response helpers
│   └── server.js             # Express app entry
├── uploads/                  # Uploaded PDFs
├── .env.example              # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
# Copy the example file
cp .env.example .env

# Edit with your values
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: A secure random string
# - ADMIN_EMAIL/PASSWORD: Initial admin credentials
```

### 3. Seed Admin User

```bash
npm run seed:admin
```

### 4. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:5000`

---

## 📡 API Reference

### Health Check
```
GET /api/health
```

### Authentication
```
POST /api/auth/login          # Login, get JWT token
GET  /api/auth/me             # Get current admin (protected)
PUT  /api/auth/password       # Change password (protected)
```

### File Upload (Protected)
```
POST /api/upload/pdf?type=voter-education
     Body: multipart/form-data, field: "file"
     Returns: { url, filename, originalName, size }
```

### Public Endpoints (Read-Only)

| Endpoint | Description |
|----------|-------------|
| `GET /api/voter-education` | Voter education resources |
| `GET /api/voter-education/:id` | Single resource |
| `GET /api/election-integrity` | Election integrity resources |
| `GET /api/election-integrity/categories` | Category list |
| `GET /api/newsletters` | ALN/DRN newsletters |
| `GET /api/parties` | Political parties |

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `language` - Filter by language (en/ne/other)
- `category` - Filter by category (election-integrity)
- `source` - Filter by source (newsletters: ALN/DRN)

### Admin Endpoints (Protected)

All require `Authorization: Bearer <token>` header.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/voter-education` | GET | Get all (including unpublished) |
| `/api/admin/voter-education` | POST | Create resource |
| `/api/admin/voter-education/:id` | PUT | Update resource |
| `/api/admin/voter-education/:id` | DELETE | Delete resource |
| `/api/admin/voter-education/:id/publish` | PATCH | Toggle publish |

Same pattern for:
- `/api/admin/election-integrity`
- `/api/admin/newsletters`
- `/api/admin/parties`

---

## 🔐 Authentication Flow

1. **Login:**
```javascript
// POST /api/auth/login
{
  "email": "admin@votenepal.org",
  "password": "your_password"
}

// Response
{
  "success": true,
  "data": {
    "admin": { "id": "...", "email": "...", "role": "admin" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

2. **Use Token:**
```javascript
// All admin routes require this header
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 📤 File Upload Flow

1. Upload PDF first:
```javascript
// POST /api/upload/pdf?type=voter-education
// Content-Type: multipart/form-data
// Field: file

// Response
{
  "success": true,
  "data": {
    "url": "http://localhost:5000/uploads/voter-education/1234-abc.pdf",
    "filename": "1234-abc.pdf"
  }
}
```

2. Use URL when creating content:
```javascript
// POST /api/admin/voter-education
{
  "title": "मतदाता शिक्षा गाइड",
  "description": "मतदान कसरी गर्ने भन्ने बारेमा जानकारी",
  "pdfUrl": "http://localhost:5000/uploads/voter-education/1234-abc.pdf",
  "language": "ne",
  "published": true
}
```

---

## 🎯 Frontend Integration

### React/Next.js Example

```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Fetch public data
const getVoterEducation = async (language) => {
  const res = await fetch(`${API_URL}/voter-education?language=${language}`);
  return res.json();
};

// Admin login
const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
  }
  return data;
};

// Admin create resource
const createResource = async (resource) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/admin/voter-education`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(resource),
  });
  return res.json();
};

// Upload PDF
const uploadPDF = async (file, type) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${API_URL}/upload/pdf?type=${type}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  return res.json();
};
```

---

## 🌐 Deployment (Render)

### Environment Variables

Set these in Render dashboard:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vote-nepal-hub
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend.com
MAX_FILE_SIZE_MB=10
```

### Build & Start Commands
```
Build: npm install
Start: npm start
```

### MongoDB Atlas (Free Tier)
1. Create free cluster at mongodb.com
2. Whitelist 0.0.0.0/0 for Render access
3. Copy connection string to MONGODB_URI

---

## 📊 Data Models Summary

| Model | Key Fields | Notes |
|-------|------------|-------|
| AdminUser | email, hashedPassword, role | JWT auth, bcrypt hashing |
| VoterEducation | title, description, pdfUrl, language | en/ne/other |
| ElectionIntegrity | title, description, pdfUrl, category | 7 categories |
| Newsletter | title, summary, pdfUrl, source, publishedDate | ALN/DRN |
| PoliticalParty | partyName, manifestoPdfUrl, prListPdfUrl | Neutral listing |

---

## 🔄 Future Enhancements

- [ ] Cloudinary integration for PDF hosting
- [ ] Admin dashboard UI
- [ ] Analytics/view tracking
- [ ] Multi-language admin interface
- [ ] Email notifications
- [ ] Rate limiting
- [ ] Audit logging

---

## 📝 License

MIT - Accountability Lab Nepal

---

**🗳️ Promoting transparent and informed elections in Nepal**
