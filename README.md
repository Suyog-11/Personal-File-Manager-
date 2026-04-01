# Personal File Manager Web Application

A secure, modern web application for managing personal files with authentication, file operations, and folder organization.

## Features

### 🔐 Security
- **Password-Protected Login**: Secure authentication with bcrypt hashing
- **Session Management**: 24-hour session timeout
- **Protected Routes**: All file operations require authentication
- **File Validation**: Allowed file types and size limits

### 📁 File Management
- **Upload Files**: Drag-and-drop or click to upload
- **Download Files**: Download any uploaded file
- **Delete Files**: Remove files permanently
- **Rename Files**: Change file names easily
- **Search Files**: Find files by name instantly
- **File Preview**: Preview images and PDFs

### 📂 Folder Organization
- **Create Folders**: Organize files into folders
- **Nested Folders**: Create subfolders within folders
- **Delete Folders**: Remove folders and their contents
- **Breadcrumb Navigation**: Easy navigation through folder hierarchy

### 🎨 User Interface
- **Modern Design**: Clean, minimal interface
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Grid/List View**: Switch between different file display modes
- **Drag-and-Drop**: Intuitive file upload experience

### 📊 Additional Features
- **Storage Information**: View storage usage
- **File Metadata**: See file size and upload date
- **User Dashboard**: Personalized user experience
- **Toast Notifications**: Real-time feedback for actions

## Technology Stack

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **SQLite3**: Lightweight database
- **Bcryptjs**: Password hashing
- **Multer**: File upload handling
- **Express-session**: Session management

### Frontend
- **HTML5**: Markup
- **CSS3**: Styling with CSS variables for theming
- **Vanilla JavaScript**: No dependencies, pure JS

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Edit `.env` file:
```
PORT=3000
SESSION_SECRET=your_super_secret_key_change_this_in_production
NODE_ENV=development
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png,gif,mp4,avi,mov,zip,rar
```

### Step 3: Start the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### Step 4: Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
personal-file-manager/
├── server.js                 # Main Express server
├── database.js              # SQLite database setup
├── auth.js                  # Authentication logic
├── fileManager.js           # File operations logic
├── package.json             # Dependencies
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
├── uploads/                # User file storage (created at runtime)
│   └── user_[id]/         # Per-user directories
└── public/                 # Frontend files
    ├── index.html          # Main HTML
    ├── styles.css          # Styling
    └── app.js              # Frontend JavaScript
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files` - Get user files
- `GET /api/files/:id/download` - Download file
- `DELETE /api/files/:id` - Delete file
- `PUT /api/files/:id/rename` - Rename file
- `GET /api/files/search/:query` - Search files

### Folders
- `POST /api/folders` - Create folder
- `GET /api/folders` - Get user folders
- `DELETE /api/folders/:id` - Delete folder

## Security Features

1. **Password Hashing**: Passwords are hashed using bcryptjs with salt rounds of 10
2. **Session Security**: HTTP-only cookies with 24-hour expiration
3. **File Validation**: Only allowed file types can be uploaded
4. **File Size Limits**: Maximum 50MB per file (configurable)
5. **User Isolation**: Each user can only access their own files
6. **CORS Protection**: Configured CORS for security

## Usage Guide

### Creating an Account
1. Click "Register" on the login page
2. Enter a username and password (minimum 6 characters)
3. Confirm your password
4. Click "Register"

### Uploading Files
1. Drag files into the upload area, or
2. Click the upload area to select files
3. Files will be uploaded to the current folder

### Organizing Files
1. Click "New Folder" to create a folder
2. Enter a folder name
3. Click on a folder to open it
4. Use breadcrumb navigation to go back

### Managing Files
- **Preview**: Click the eye icon to preview images/PDFs
- **Download**: Click the download icon to download
- **Rename**: Click the pencil icon to rename
- **Delete**: Click the trash icon to delete

### Searching
1. Enter search term in the search box
2. Results appear instantly
3. Clear search to see all files again

### Dark Mode
Click the moon icon in the header to toggle dark mode. Your preference is saved.

## Configuration

### Allowed File Types
Edit `ALLOWED_FILE_TYPES` in `.env`:
```
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png,gif,mp4,avi,mov,zip,rar
```

### Maximum File Size
Edit `MAX_FILE_SIZE` in `.env` (in bytes):
```
MAX_FILE_SIZE=52428800  # 50MB
```

### Session Duration
Edit session cookie maxAge in `server.js`:
```javascript
cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Files Table
```sql
CREATE TABLE files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  folder_id INTEGER,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (folder_id) REFERENCES folders(id)
)
```

### Folders Table
```sql
CREATE TABLE folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  folder_name TEXT NOT NULL,
  parent_folder_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parent_folder_id) REFERENCES folders(id)
)
```

## Troubleshooting

### Port Already in Use
Change the PORT in `.env` or kill the process using port 3000

### Database Locked
Delete `database.db` and restart the server to reinitialize

### Files Not Uploading
- Check file size (max 50MB by default)
- Verify file type is in ALLOWED_FILE_TYPES
- Check uploads folder permissions

### Session Expires Too Quickly
Increase `maxAge` in session configuration in `server.js`

## Future Enhancements

- [ ] File sharing with other users
- [ ] File versioning and recovery
- [ ] Advanced search filters
- [ ] File compression
- [ ] Batch operations
- [ ] File encryption
- [ ] Two-factor authentication
- [ ] Activity logs
- [ ] Quota management
- [ ] API rate limiting

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please check the troubleshooting section or review the code comments.

---

**Happy file managing! 📁✨**
