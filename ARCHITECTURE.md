# Personal File Manager - Complete Documentation

## 📖 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [API Reference](#api-reference)
6. [Frontend Guide](#frontend-guide)
7. [Security](#security)
8. [Deployment](#deployment)

---

## Overview

The Personal File Manager is a full-stack web application that provides secure file storage and management capabilities. Users can upload, organize, search, and manage their files through an intuitive web interface.

### Core Requirements Met

✅ **Authentication**: Login page with password protection and hashing
✅ **Dashboard**: Clean UI displaying uploaded files
✅ **File Management**: Upload, download, delete, rename, search
✅ **Storage**: Local file system with SQLite metadata
✅ **Security**: Authentication-protected routes, file validation, size limits
✅ **Technology**: Node.js/Express backend, HTML/CSS/JS frontend, SQLite database
✅ **UI/UX**: Modern design, drag-and-drop, responsive layout
✅ **Extra Features**: Dark mode, folder creation, file preview

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Browser)                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │  HTML/CSS/JavaScript                             │   │
│  │  - Authentication UI                             │   │
│  │  - File Manager Dashboard                        │   │
│  │  - Real-time Updates                             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTP/REST
┌─────────────────────────────────────────────────────────┐
│                  Backend (Node.js/Express)              │
│  ┌──────────────────────────────────────────────────┐   │
│  │  API Routes                                      │   │
│  │  - /api/auth/* (Authentication)                 │   │
│  │  - /api/files/* (File Operations)               │   │
│  │  - /api/folders/* (Folder Operations)           │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Business Logic                                  │   │
│  │  - auth.js (Password hashing, user validation)  │   │
│  │  - fileManager.js (CRUD operations)             │   │
│  └─────────────────────��────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  File Storage                                    │   │
│  │  - uploads/ (User files)                        │   │
│  │  - database.db (Metadata)                       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### File Organization

```
project/
├── server.js              # Express server setup
├── database.js            # SQLite initialization
├── auth.js               # Authentication functions
├── fileManager.js        # File/folder operations
├── package.json          # Dependencies
├── .env                  # Configuration
├── .gitignore           # Git ignore rules
├─�� README.md            # Full documentation
├── QUICKSTART.md        # Quick start guide
├── ARCHITECTURE.md      # This file
├── public/              # Frontend files
│   ├── index.html       # Main HTML
│   ├── styles.css       # CSS styling
│   └── app.js           # Frontend JavaScript
└── uploads/             # User files (created at runtime)
    └── user_[id]/       # Per-user directories
```

---

## Installation

### Prerequisites
- Node.js v14+ (https://nodejs.org/)
- npm (included with Node.js)
- Git (optional, for version control)

### Step-by-Step Installation

#### 1. Clone or Download Project
```bash
# If using git
git clone <repository-url>
cd personal-file-manager

# Or extract the downloaded zip file
```

#### 2. Install Dependencies
```bash
npm install
```

This installs:
- `express` - Web framework
- `express-session` - Session management
- `bcryptjs` - Password hashing
- `sqlite3` - Database
- `multer` - File upload handling
- `dotenv` - Environment variables
- `cors` - Cross-origin requests
- `nodemon` - Development auto-reload

#### 3. Verify Installation
```bash
npm list
```

#### 4. Start Server
```bash
npm start
```

Expected output:
```
Server running on http://localhost:3000
```

---

## Configuration

### Environment Variables (.env)

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Security
SESSION_SECRET=your_super_secret_key_change_this_in_production

# File Upload
MAX_FILE_SIZE=52428800                    # 50MB in bytes
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png,gif,mp4,avi,mov,zip,rar
```

### Customization Examples

#### Increase File Size Limit
```env
# 100MB
MAX_FILE_SIZE=104857600
```

#### Add More File Types
```env
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png,gif,mp4,avi,mov,zip,rar,xls,xlsx,ppt,pptx
```

#### Change Session Duration
In `server.js`, modify:
```javascript
cookie: { 
  secure: false, 
  httpOnly: true, 
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
}
```

---

## API Reference

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepass123",
  "confirmPassword": "securepass123"
}

Response (200):
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "username": "john_doe"
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepass123"
}

Response (200):
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe"
  }
}
```

#### Logout User
```
POST /api/auth/logout

Response (200):
{
  "message": "Logout successful"
}
```

#### Get Current User
```
GET /api/auth/me

Response (200):
{
  "id": 1,
  "username": "john_doe",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

### File Endpoints

#### Upload File
```
POST /api/files/upload
Content-Type: multipart/form-data

file: <binary>
folderId: 1 (optional)

Response (200):
{
  "message": "File uploaded successfully",
  "file": {
    "id": 5,
    "filename": "1705318200000-123456789.pdf",
    "originalFilename": "document.pdf",
    "fileSize": 2048576,
    "fileType": "pdf"
  }
}
```

#### Get Files
```
GET /api/files?folderId=1 (optional)

Response (200):
[
  {
    "id": 1,
    "user_id": 1,
    "filename": "1705318200000-123456789.pdf",
    "original_filename": "document.pdf",
    "file_path": "/uploads/user_1/1705318200000-123456789.pdf",
    "file_size": 2048576,
    "file_type": "pdf",
    "folder_id": null,
    "uploaded_at": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Download File
```
GET /api/files/:id/download

Response: File binary data
```

#### Delete File
```
DELETE /api/files/:id

Response (200):
{
  "message": "File deleted successfully"
}
```

#### Rename File
```
PUT /api/files/:id/rename
Content-Type: application/json

{
  "newFilename": "new_name.pdf"
}

Response (200):
{
  "message": "File renamed successfully"
}
```

#### Search Files
```
GET /api/files/search/document

Response (200):
[
  {
    "id": 1,
    "original_filename": "document.pdf",
    ...
  }
]
```

### Folder Endpoints

#### Create Folder
```
POST /api/folders
Content-Type: application/json

{
  "folderName": "My Documents",
  "parentFolderId": null (optional)
}

Response (200):
{
  "message": "Folder created successfully",
  "folder": {
    "id": 1,
    "folderName": "My Documents"
  }
}
```

#### Get Folders
```
GET /api/folders?parentFolderId=1 (optional)

Response (200):
[
  {
    "id": 1,
    "user_id": 1,
    "folder_name": "My Documents",
    "parent_folder_id": null,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Delete Folder
```
DELETE /api/folders/:id

Response (200):
{
  "message": "Folder deleted successfully"
}
```

---

## Frontend Guide

### Key JavaScript Functions

#### Authentication
```javascript
// Login
handleLogin(e)

// Register
handleRegister(e)

// Logout
handleLogout()

// Check auth status
checkAuthStatus()
```

#### File Operations
```javascript
// Upload files
uploadFiles(files)

// Download file
downloadFile(fileId)

// Delete file
deleteFile(fileId)

// Rename file
confirmRename()

// Search files
searchFiles()

// Preview file
previewFile(fileId)
```

#### Folder Operations
```javascript
// Create folder
confirmCreateFolder()

// Delete folder
deleteFolder(folderId)

// Navigate to folder
navigateToFolder(folderId, folderName)

// Navigate to root
navigateToRoot()
```

#### UI Functions
```javascript
// Toggle dark mode
toggleDarkMode()

// Set view mode (grid/list)
setViewMode(mode)

// Show toast notification
showToast(message, type)

// Open/close modals
openModal(modalId)
closeModal(modalId)
```

### CSS Variables

Customize the appearance by modifying CSS variables in `styles.css`:

```css
:root {
  --primary-color: #6366f1;
  --secondary-color: #ec4899;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
  --bg-color: #ffffff;
  --bg-secondary: #f9fafb;
  --text-color: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}
```

---

## Security

### Password Security
- Passwords are hashed using bcryptjs with 10 salt rounds
- Never stored in plain text
- Compared securely during login

### Session Security
- HTTP-only cookies prevent XSS attacks
- 24-hour session expiration
- Session data stored server-side

### File Security
- File type validation (whitelist approach)
- File size limits (50MB default)
- User isolation (each user can only access their files)
- Files stored outside web root

### Input Validation
- Username and password validation
- File name sanitization
- Folder name validation
- Search term validation

### CORS Protection
- CORS configured for security
- Credentials required for requests

### Best Practices for Production

1. **Change SESSION_SECRET**
   ```env
   SESSION_SECRET=generate_a_random_string_here
   ```

2. **Enable HTTPS**
   ```javascript
   cookie: { secure: true, httpOnly: true }
   ```

3. **Set NODE_ENV**
   ```env
   NODE_ENV=production
   ```

4. **Use Environment Variables**
   - Never commit .env to git
   - Use .env.example as template

5. **Database Backup**
   - Regular backups of database.db
   - Backup uploads folder

6. **Rate Limiting**
   - Implement rate limiting for API
   - Prevent brute force attacks

---

## Deployment

### Local Deployment

```bash
# Install dependencies
npm install

# Start server
npm start

# Access at http://localhost:3000
```

### Production Deployment (Heroku Example)

1. **Create Procfile**
```
web: node server.js
```

2. **Set Environment Variables**
```bash
heroku config:set SESSION_SECRET=your_secret_key
heroku config:set NODE_ENV=production
```

3. **Deploy**
```bash
git push heroku main
```

### Production Deployment (VPS Example)

1. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Clone Project**
```bash
git clone <repository-url>
cd personal-file-manager
npm install
```

3. **Use PM2 for Process Management**
```bash
npm install -g pm2
pm2 start server.js --name "file-manager"
pm2 startup
pm2 save
```

4. **Setup Nginx Reverse Proxy**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **Setup SSL with Let's Encrypt**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Troubleshooting

### Server Won't Start
```bash
# Check if port is in use
lsof -i :3000

# Kill process on port 3000
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### Database Issues
```bash
# Reset database
rm database.db

# Restart server (will recreate database)
npm start
```

### File Upload Fails
- Check file size (max 50MB)
- Verify file type is allowed
- Check uploads folder permissions
- Check disk space

### Session Expires Too Quickly
- Increase maxAge in server.js
- Check SESSION_SECRET is set

### CORS Errors
- Ensure frontend and backend URLs match
- Check CORS configuration in server.js

---

## Performance Optimization

### Frontend
- Lazy load images
- Minimize CSS/JS
- Use compression
- Cache static files

### Backend
- Add database indexes
- Implement pagination
- Use connection pooling
- Add caching layer

### Deployment
- Use CDN for static files
- Enable gzip compression
- Use load balancer
- Monitor performance

---

## Future Enhancements

- [ ] File sharing with expiring links
- [ ] File versioning and recovery
- [ ] Advanced search with filters
- [ ] File compression/archiving
- [ ] Batch operations
- [ ] File encryption
- [ ] Two-factor authentication
- [ ] Activity logs and audit trail
- [ ] Quota management per user
- [ ] API rate limiting
- [ ] WebSocket for real-time updates
- [ ] Mobile app

---

## Support & Resources

- **Node.js**: https://nodejs.org/
- **Express**: https://expressjs.com/
- **SQLite**: https://www.sqlite.org/
- **Bcryptjs**: https://github.com/dcodeIO/bcrypt.js
- **Multer**: https://github.com/expressjs/multer

---

**Last Updated**: January 2024
**Version**: 1.0.0
