# Setup & Deployment Guide

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js v14+ installed
- [ ] npm installed (comes with Node.js)
- [ ] A text editor (VS Code recommended)
- [ ] A web browser (Chrome, Firefox, Safari, Edge)
- [ ] Git (optional, for version control)
- [ ] 500MB free disk space

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Server
```bash
npm start
```

### Step 3: Open Browser
Navigate to: `http://localhost:3000`

### Step 4: Create Account & Start Using
- Register with a username and password
- Upload your first file
- Explore the features!

---

## 🔧 Detailed Setup Guide

### Windows Setup

#### 1. Install Node.js
- Download from https://nodejs.org/
- Run installer
- Accept default settings
- Restart computer

#### 2. Verify Installation
```bash
node --version
npm --version
```

#### 3. Navigate to Project
```bash
cd "c:\Users\dinka\OneDrive\Desktop\New folder"
```

#### 4. Install Dependencies
```bash
npm install
```

#### 5. Start Server
```bash
npm start
```

#### 6. Access Application
- Open browser
- Go to http://localhost:3000

### macOS Setup

#### 1. Install Node.js
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
```

#### 2. Verify Installation
```bash
node --version
npm --version
```

#### 3. Navigate to Project
```bash
cd ~/Desktop/personal-file-manager
```

#### 4. Install Dependencies
```bash
npm install
```

#### 5. Start Server
```bash
npm start
```

#### 6. Access Application
- Open browser
- Go to http://localhost:3000

### Linux Setup

#### 1. Install Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or download from https://nodejs.org/
```

#### 2. Verify Installation
```bash
node --version
npm --version
```

#### 3. Navigate to Project
```bash
cd ~/Desktop/personal-file-manager
```

#### 4. Install Dependencies
```bash
npm install
```

#### 5. Start Server
```bash
npm start
```

#### 6. Access Application
- Open browser
- Go to http://localhost:3000

---

## 🎯 Configuration

### Basic Configuration

Edit `.env` file:

```env
# Server
PORT=3000
NODE_ENV=development

# Security
SESSION_SECRET=change_this_to_random_string

# File Upload
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png,gif,mp4,avi,mov,zip,rar
```

### Generate Secure Session Secret

```bash
# On Windows (PowerShell)
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -SetSeed (Get-Date).Ticks).ToString())) | Out-String

# On macOS/Linux
openssl rand -base64 32
```

### Custom Configuration Examples

#### Increase File Size to 100MB
```env
MAX_FILE_SIZE=104857600
```

#### Add Excel Files
```env
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png,gif,mp4,avi,mov,zip,rar,xls,xlsx
```

#### Change Port to 8080
```env
PORT=8080
```

---

## 🌐 Deployment Options

### Option 1: Local Network Access

Make the app accessible from other computers on your network:

#### Windows
1. Find your IP address:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. Access from another computer:
   ```
   http://192.168.1.100:3000
   ```

#### macOS/Linux
1. Find your IP address:
   ```bash
   ifconfig
   ```

2. Access from another computer:
   ```
   http://your-ip:3000
   ```

### Option 2: Heroku Deployment

#### Prerequisites
- Heroku account (https://www.heroku.com/)
- Heroku CLI installed

#### Steps

1. **Create Procfile**
```bash
echo "web: node server.js" > Procfile
```

2. **Initialize Git**
```bash
git init
git add .
git commit -m "Initial commit"
```

3. **Create Heroku App**
```bash
heroku create your-app-name
```

4. **Set Environment Variables**
```bash
heroku config:set SESSION_SECRET=your_random_secret
heroku config:set NODE_ENV=production
```

5. **Deploy**
```bash
git push heroku main
```

6. **Access Application**
```
https://your-app-name.herokuapp.com
```

### Option 3: DigitalOcean Deployment

#### Prerequisites
- DigitalOcean account
- SSH key configured

#### Steps

1. **Create Droplet**
   - Choose Ubuntu 22.04
   - Select $5/month plan
   - Add SSH key

2. **SSH into Droplet**
```bash
ssh root@your_droplet_ip
```

3. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Clone Project**
```bash
git clone your-repo-url
cd personal-file-manager
npm install
```

5. **Install PM2**
```bash
sudo npm install -g pm2
pm2 start server.js --name "file-manager"
pm2 startup
pm2 save
```

6. **Setup Nginx**
```bash
sudo apt-get install nginx
```

Create `/etc/nginx/sites-available/default`:
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

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

7. **Enable Nginx**
```bash
sudo systemctl restart nginx
```

8. **Setup SSL (Let's Encrypt)**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Option 4: Docker Deployment

#### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

#### Create docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SESSION_SECRET=your_secret
    volumes:
      - ./uploads:/app/uploads
      - ./database.db:/app/database.db
```

#### Run with Docker
```bash
docker-compose up
```

---

## 🔒 Production Checklist

Before deploying to production:

- [ ] Change SESSION_SECRET to a random string
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Setup database backups
- [ ] Configure firewall
- [ ] Setup monitoring
- [ ] Enable rate limiting
- [ ] Setup error logging
- [ ] Configure CORS properly
- [ ] Test all features
- [ ] Setup automated backups
- [ ] Document deployment process
- [ ] Setup health checks
- [ ] Configure CDN for static files
- [ ] Setup email notifications

---

## 📊 Monitoring & Maintenance

### Check Server Status
```bash
# View running processes
ps aux | grep node

# Check port usage
lsof -i :3000
```

### View Logs
```bash
# With PM2
pm2 logs file-manager

# With Docker
docker logs container_name
```

### Database Maintenance
```bash
# Backup database
cp database.db database.db.backup

# Backup uploads
cp -r uploads uploads.backup
```

### Performance Monitoring
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### Database Locked
```bash
# Delete database and restart
rm database.db
npm start
```

### Files Not Uploading
- Check file size (max 50MB)
- Verify file type is allowed
- Check disk space
- Check folder permissions

### High Memory Usage
```bash
# Restart application
pm2 restart file-manager

# Or with Docker
docker restart container_name
```

### Slow Performance
- Check database size
- Optimize queries
- Add indexes
- Increase server resources
- Enable caching

---

## 🔄 Backup & Recovery

### Automated Backup Script

Create `backup.sh`:
```bash
#!/bin/bash

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp database.db $BACKUP_DIR/database_$TIMESTAMP.db

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz uploads/

# Keep only last 7 backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
```

### Schedule Backups (Linux/macOS)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

### Restore from Backup
```bash
# Restore database
cp backups/database_20240115_020000.db database.db

# Restore uploads
tar -xzf backups/uploads_20240115_020000.tar.gz
```

---

## 📈 Scaling Considerations

### For 100+ Users
- Add database indexes
- Implement caching (Redis)
- Use load balancer
- Separate file storage (S3)
- Add CDN for static files

### For 1000+ Users
- Database replication
- Microservices architecture
- Message queue (RabbitMQ)
- Distributed file storage
- Advanced monitoring

### For 10000+ Users
- Kubernetes orchestration
- Database sharding
- Global CDN
- Advanced caching strategies
- Real-time analytics

---

## 📞 Support Resources

### Documentation
- README.md - Full documentation
- QUICKSTART.md - Quick start guide
- ARCHITECTURE.md - System architecture
- TESTING.md - Testing guide

### External Resources
- Node.js: https://nodejs.org/
- Express: https://expressjs.com/
- SQLite: https://www.sqlite.org/
- Heroku: https://www.heroku.com/
- DigitalOcean: https://www.digitalocean.com/

### Community
- Stack Overflow: https://stackoverflow.com/
- GitHub Issues: Report bugs
- Node.js Forum: https://nodejs.org/en/get-involved/

---

## 🎓 Learning Resources

### Recommended Tutorials
1. Node.js Basics
2. Express.js Guide
3. SQLite Tutorial
4. Authentication Best Practices
5. File Upload Handling

### Books
- "Node.js Design Patterns"
- "Express in Action"
- "Web Security Testing Cookbook"

---

## 📝 Version History

### v1.0.0 (Current)
- Initial release
- Core features implemented
- Security features included
- Responsive design

### Future Versions
- v1.1.0: File sharing
- v1.2.0: Advanced search
- v2.0.0: Mobile app
- v2.1.0: Cloud storage integration

---

## 📄 License

MIT License - Free to use and modify

---

## ✅ Final Checklist

Before going live:

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database initialized
- [ ] Server starts without errors
- [ ] Can register and login
- [ ] Can upload files
- [ ] Can download files
- [ ] Can delete files
- [ ] Can create folders
- [ ] Dark mode works
- [ ] Responsive on mobile
- [ ] All features tested
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Documentation complete

---

**You're ready to deploy! 🚀**

For questions or issues, refer to the documentation files or check the troubleshooting section.
