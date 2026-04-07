const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const auth = require('./auth');
const fileManager = require('./fileManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
  })
);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(uploadsDir, `user_${req.session.userId}`);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || '').split(',');
  const fileExt = path.extname(file.originalname).substring(1).toLowerCase();
  
  if (allowedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExt} is not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 }, // 50MB default
});

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  auth.getUserById(req.session.userId, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    next();
  });
};

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (!username || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  auth.registerUser(username, password, (err, user) => {
    if (err) {
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      return res.status(500).json({ error: 'Registration failed' });
    }
    if (user.status === 'pending') {
      res.json({ message: 'Registration successful! Please wait for an admin to approve your account.', status: 'pending' });
    } else {
      req.session.userId = user.id;
      res.json({ message: 'Registration successful', user });
    }
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  auth.loginUser(username, password, (err, user) => {
    if (err) {
      return res.status(401).json({ error: err.message });
    }
    req.session.userId = user.id;
    res.json({ message: 'Login successful', user: { id: user.id, username: user.username, role: user.role, status: user.status } });
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
app.get('/api/auth/me', isAuthenticated, (req, res) => {
  auth.getUserById(req.session.userId, (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
    res.json(user);
  });
});

// Change password
app.post('/api/auth/change-password', isAuthenticated, (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ error: 'New passwords do not match' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  auth.changePassword(req.session.userId, currentPassword, newPassword, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: 'Password changed successfully' });
  });
});

// ==================== FILE ROUTES ====================

// Upload file
app.post('/api/files/upload', isAuthenticated, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const folderId = req.body.folderId || null;

  fileManager.uploadFile(
    req.session.userId,
    req.file.filename,
    req.file.originalname,
    req.file.path,
    req.file.size,
    path.extname(req.file.originalname).substring(1),
    folderId,
    (err, file) => {
      if (err) {
        return res.status(500).json({ error: 'File upload failed' });
      }
      res.json({ message: 'File uploaded successfully', file });
    }
  );
});

// Get files
app.get('/api/files', isAuthenticated, (req, res) => {
  const folderId = req.query.folderId || null;
  fileManager.getUserFiles(req.session.userId, folderId, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch files' });
    }
    res.json(files);
  });
});

// Download file
app.get('/api/files/:id/download', isAuthenticated, (req, res) => {
  fileManager.getFileById(req.params.id, req.session.userId, (err, file) => {
    if (err || !file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.download(file.file_path, file.original_filename);
  });
});

// Delete file
app.delete('/api/files/:id', isAuthenticated, (req, res) => {
  fileManager.deleteFile(req.params.id, req.session.userId, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'File deleted successfully' });
  });
});

// Rename file
app.put('/api/files/:id/rename', isAuthenticated, (req, res) => {
  const { newFilename } = req.body;

  if (!newFilename) {
    return res.status(400).json({ error: 'New filename is required' });
  }

  fileManager.renameFile(req.params.id, req.session.userId, newFilename, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'File renamed successfully' });
  });
});

// Search files
app.get('/api/files/search/:query', isAuthenticated, (req, res) => {
  fileManager.searchFiles(req.session.userId, req.params.query, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Search failed' });
    }
    res.json(files);
  });
});

// ==================== FOLDER ROUTES ====================

// Create folder
app.post('/api/folders', isAuthenticated, (req, res) => {
  const { folderName, parentFolderId } = req.body;

  if (!folderName) {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  fileManager.createFolder(req.session.userId, folderName, parentFolderId || null, (err, folder) => {
    if (err) {
      return res.status(500).json({ error: 'Folder creation failed' });
    }
    res.json({ message: 'Folder created successfully', folder });
  });
});

// Get folders
app.get('/api/folders', isAuthenticated, (req, res) => {
  const parentFolderId = req.query.parentFolderId || null;
  fileManager.getUserFolders(req.session.userId, parentFolderId, (err, folders) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch folders' });
    }
    res.json(folders);
  });
});

// Delete folder
app.delete('/api/folders/:id', isAuthenticated, (req, res) => {
  fileManager.deleteFolder(req.params.id, req.session.userId, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Folder deleted successfully' });
  });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ error: 'File size exceeds maximum limit' });
    }
  }
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== ADMIN ROUTES ====================

// Get all users
app.get('/api/admin/users', isAdmin, (req, res) => {
  const db = require('./database');
  db.all('SELECT id, username, role, status, created_at FROM users ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(rows);
  });
});

// Update user status
app.put('/api/admin/users/:id/status', isAdmin, (req, res) => {
  const { status } = req.body;
  if (!['approved', 'pending', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const db = require('./database');
  db.run('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update user status' });
    }
    res.json({ message: `User status updated to ${status}` });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
