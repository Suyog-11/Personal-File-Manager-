# Testing Guide

## Manual Testing Checklist

### Authentication Tests

#### Test 1: User Registration
- [ ] Navigate to http://localhost:3000
- [ ] Click "Register"
- [ ] Enter username: `testuser`
- [ ] Enter password: `password123`
- [ ] Confirm password: `password123`
- [ ] Click "Register"
- [ ] Verify: Dashboard appears with username displayed

#### Test 2: Invalid Registration
- [ ] Click "Register"
- [ ] Enter username: `testuser`
- [ ] Enter password: `pass`
- [ ] Confirm password: `pass`
- [ ] Click "Register"
- [ ] Verify: Error message "Password must be at least 6 characters"

#### Test 3: Password Mismatch
- [ ] Click "Register"
- [ ] Enter username: `newuser`
- [ ] Enter password: `password123`
- [ ] Confirm password: `password456`
- [ ] Click "Register"
- [ ] Verify: Error message "Passwords do not match"

#### Test 4: Duplicate Username
- [ ] Register with username: `testuser`
- [ ] Try to register again with same username
- [ ] Verify: Error message "Username already exists"

#### Test 5: Login
- [ ] Click "Login"
- [ ] Enter username: `testuser`
- [ ] Enter password: `password123`
- [ ] Click "Login"
- [ ] Verify: Dashboard appears

#### Test 6: Invalid Login
- [ ] Click "Login"
- [ ] Enter username: `testuser`
- [ ] Enter password: `wrongpassword`
- [ ] Click "Login"
- [ ] Verify: Error message "Invalid password"

#### Test 7: Logout
- [ ] Click "Logout"
- [ ] Verify: Redirected to login page

### File Upload Tests

#### Test 8: Single File Upload
- [ ] Login
- [ ] Click upload area
- [ ] Select a PDF file
- [ ] Verify: File appears in dashboard with correct name and size

#### Test 9: Multiple File Upload
- [ ] Select 3 different files
- [ ] Verify: All files appear in dashboard

#### Test 10: Drag and Drop Upload
- [ ] Drag a file into upload area
- [ ] Verify: File uploads successfully

#### Test 11: File Size Limit
- [ ] Try to upload file > 50MB
- [ ] Verify: Error message "File size exceeds maximum limit"

#### Test 12: Invalid File Type
- [ ] Try to upload .exe file
- [ ] Verify: Error message "File type .exe is not allowed"

### File Management Tests

#### Test 13: Download File
- [ ] Upload a file
- [ ] Click download icon
- [ ] Verify: File downloads to computer

#### Test 14: Rename File
- [ ] Click pencil icon on a file
- [ ] Enter new name: `renamed_file.pdf`
- [ ] Click "Rename"
- [ ] Verify: File name updated in dashboard

#### Test 15: Delete File
- [ ] Click trash icon on a file
- [ ] Confirm deletion
- [ ] Verify: File removed from dashboard

#### Test 16: Preview Image
- [ ] Upload an image file
- [ ] Click eye icon
- [ ] Verify: Image preview appears in modal

#### Test 17: Preview PDF
- [ ] Upload a PDF file
- [ ] Click eye icon
- [ ] Verify: PDF preview appears in modal

#### Test 18: Search Files
- [ ] Upload multiple files with different names
- [ ] Enter search term in search box
- [ ] Verify: Only matching files appear
- [ ] Clear search
- [ ] Verify: All files appear again

### Folder Tests

#### Test 19: Create Folder
- [ ] Click "New Folder"
- [ ] Enter folder name: `Documents`
- [ ] Click "Create"
- [ ] Verify: Folder appears in dashboard

#### Test 20: Navigate to Folder
- [ ] Click on a folder
- [ ] Verify: Folder opens and breadcrumb shows folder name

#### Test 21: Upload to Folder
- [ ] Open a folder
- [ ] Upload a file
- [ ] Verify: File appears in folder

#### Test 22: Nested Folders
- [ ] Create folder: `Documents`
- [ ] Open `Documents`
- [ ] Create folder: `Work`
- [ ] Verify: Breadcrumb shows: Home / Documents / Work

#### Test 23: Breadcrumb Navigation
- [ ] Navigate to nested folder
- [ ] Click on parent folder in breadcrumb
- [ ] Verify: Returns to parent folder

#### Test 24: Delete Folder
- [ ] Create a folder
- [ ] Click trash icon on folder
- [ ] Confirm deletion
- [ ] Verify: Folder removed

#### Test 25: Delete Folder with Files
- [ ] Create folder with files inside
- [ ] Delete folder
- [ ] Confirm deletion
- [ ] Verify: Folder and all files removed

### UI/UX Tests

#### Test 26: Dark Mode Toggle
- [ ] Click moon icon
- [ ] Verify: Interface switches to dark mode
- [ ] Click moon icon again
- [ ] Verify: Interface switches back to light mode
- [ ] Refresh page
- [ ] Verify: Dark mode preference persists

#### Test 27: Grid View
- [ ] Click grid icon in toolbar
- [ ] Verify: Files display in grid layout

#### Test 28: List View
- [ ] Click list icon in toolbar
- [ ] Verify: Files display in list layout

#### Test 29: Responsive Design
- [ ] Resize browser window to mobile size
- [ ] Verify: Layout adapts properly
- [ ] Verify: All buttons are accessible
- [ ] Verify: Upload area is usable

#### Test 30: Toast Notifications
- [ ] Perform various actions (upload, delete, etc.)
- [ ] Verify: Toast notifications appear with appropriate messages
- [ ] Verify: Notifications disappear after 3 seconds

### Security Tests

#### Test 31: Session Timeout
- [ ] Login
- [ ] Wait 24 hours (or modify session timeout for testing)
- [ ] Try to access dashboard
- [ ] Verify: Redirected to login page

#### Test 32: Direct URL Access
- [ ] Logout
- [ ] Try to access http://localhost:3000/api/files
- [ ] Verify: 401 Unauthorized error

#### Test 33: File Isolation
- [ ] Create two user accounts
- [ ] Login as User 1, upload file
- [ ] Logout
- [ ] Login as User 2
- [ ] Verify: Cannot see User 1's files

#### Test 34: Password Hashing
- [ ] Check database.db
- [ ] Verify: Passwords are hashed, not plain text

### Performance Tests

#### Test 35: Large File Upload
- [ ] Upload a 40MB file
- [ ] Verify: Upload completes successfully

#### Test 36: Many Files
- [ ] Upload 100+ files
- [ ] Verify: Dashboard loads without lag
- [ ] Verify: Search still works quickly

#### Test 37: Storage Info
- [ ] Upload several files
- [ ] Verify: Storage usage updates correctly
- [ ] Verify: Storage bar fills proportionally

### Error Handling Tests

#### Test 38: Network Error
- [ ] Stop server
- [ ] Try to upload file
- [ ] Verify: Error message appears

#### Test 39: Invalid Input
- [ ] Try to create folder with empty name
- [ ] Verify: Error message appears

#### Test 40: Concurrent Operations
- [ ] Upload multiple files simultaneously
- [ ] Verify: All uploads complete successfully

---

## Automated Testing (Optional)

### Using Jest and Supertest

```bash
npm install --save-dev jest supertest
```

### Example Test File (tests/auth.test.js)

```javascript
const request = require('supertest');
const app = require('../server');

describe('Authentication', () => {
  test('Should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.user.username).toBe('testuser');
  });

  test('Should login with correct credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.user.username).toBe('testuser');
  });

  test('Should reject invalid password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
  });
});
```

---

## Browser DevTools Testing

### Console Tests
```javascript
// Test API endpoints
fetch('http://localhost:3000/api/auth/me', {
  credentials: 'include'
})
.then(r => r.json())
.then(d => console.log(d))

// Test file upload
const formData = new FormData();
formData.append('file', new File(['test'], 'test.txt'));
fetch('http://localhost:3000/api/files/upload', {
  method: 'POST',
  body: formData,
  credentials: 'include'
})
.then(r => r.json())
.then(d => console.log(d))
```

### Network Tab
- Monitor all API requests
- Check response times
- Verify status codes
- Check request/response payloads

### Storage Tab
- Verify session cookies are set
- Check localStorage for dark mode preference
- Verify no sensitive data in storage

---

## Test Results Template

```
Test Date: _______________
Tester: ___________________
Browser: __________________
OS: _______________________

PASSED: _____ / 40
FAILED: _____ / 40

Failed Tests:
- Test #___: _______________
- Test #___: _______________

Notes:
_____________________________
_____________________________
```

---

## Known Limitations

1. **Single Server Instance**: Not load-balanced
2. **Local File Storage**: Not cloud-based
3. **No Encryption**: Files stored in plain text
4. **No Backup**: Manual backup required
5. **No Audit Logs**: No activity tracking
6. **No Rate Limiting**: Vulnerable to brute force
7. **No 2FA**: Single password authentication

---

## Performance Benchmarks

### Expected Performance

- **File Upload**: < 5 seconds for 50MB file
- **File Download**: < 3 seconds for 50MB file
- **Search**: < 500ms for 1000 files
- **Dashboard Load**: < 1 second
- **Login**: < 500ms

### Optimization Tips

1. Add database indexes
2. Implement pagination
3. Use compression
4. Cache static files
5. Optimize images
6. Minify CSS/JS

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

---

**Testing is crucial for reliability and security!**
