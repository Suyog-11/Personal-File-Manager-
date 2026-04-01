# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

You should see:
```
Server running on http://localhost:3000
```

### 3. Open in Browser
Navigate to: `http://localhost:3000`

### 4. Create an Account
- Click "Register"
- Enter username and password
- Click "Register"

### 5. Start Using!
- Upload files by dragging or clicking
- Create folders to organize
- Search, rename, download, and delete files

---

## 📋 Default Configuration

- **Port**: 3000
- **Max File Size**: 50MB
- **Session Duration**: 24 hours
- **Allowed File Types**: pdf, doc, docx, txt, jpg, jpeg, png, gif, mp4, avi, mov, zip, rar

---

## 🔧 Development Mode

For auto-reload during development:
```bash
npm run dev
```

---

## 📁 File Structure

```
├── server.js           # Backend server
├── database.js         # Database setup
├── auth.js            # Authentication
├── fileManager.js     # File operations
├── public/
│   ├── index.html     # Frontend
│   ├── styles.css     # Styling
│   └── app.js         # Frontend logic
├── package.json       # Dependencies
├── .env              # Configuration
└── README.md         # Full documentation
```

---

## 🎯 Key Features

✅ Secure login with password hashing
✅ Upload, download, delete, rename files
✅ Create and organize folders
✅ Search files instantly
✅ Preview images and PDFs
✅ Dark mode toggle
✅ Responsive design
✅ Drag-and-drop upload

---

## 🆘 Common Issues

**Port 3000 already in use?**
- Change PORT in .env file

**Files not uploading?**
- Check file size (max 50MB)
- Verify file type is allowed

**Database issues?**
- Delete database.db and restart

---

## 📚 Next Steps

1. Read the full README.md for detailed documentation
2. Customize .env file for your needs
3. Modify allowed file types if needed
4. Deploy to production (remember to change SESSION_SECRET)

---

Enjoy your secure file manager! 🎉
