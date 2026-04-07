const bcrypt = require('bcryptjs');
const db = require('./database');

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Register user
const registerUser = (username, password, callback) => {
  hashPassword(password).then((hashedPassword) => {
    // Check if this is the first user
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) return callback(err, null);
      
      const isFirstUser = row.count === 0;
      const role = isFirstUser ? 'admin' : 'user';
      const status = isFirstUser ? 'approved' : 'pending';

      db.run(
        'INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, role, status],
        function (err) {
          if (err) {
            callback(err, null);
          } else {
            callback(null, { id: this.lastID, username, role, status });
          }
        }
      );
    });
  }).catch(err => callback(err, null));
};

// Login user
const loginUser = (username, password, callback) => {
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      callback(err, null);
    } else if (!user) {
      callback(new Error('User not found'), null);
    } else {
      if (user.status !== 'approved') {
        return callback(new Error('Account requires admin approval'), null);
      }
      const isPasswordValid = await comparePassword(password, user.password);
      if (isPasswordValid) {
        callback(null, user);
      } else {
        callback(new Error('Invalid password'), null);
      }
    }
  });
};

// Change password
const changePassword = (userId, currentPassword, newPassword, callback) => {
  db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user) => {
    if (err) {
      callback(err);
    } else if (!user) {
      callback(new Error('User not found'));
    } else {
      // Verify current password
      const isPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isPasswordValid) {
        callback(new Error('Current password is incorrect'));
      } else {
        // Hash new password
        hashPassword(newPassword).then((hashedPassword) => {
          db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (err) => {
            if (err) callback(err);
            else callback(null);
          });
        });
      }
    }
  });
};

// Get user by ID
const getUserById = (userId, callback) => {
  db.get('SELECT id, username, role, status, created_at FROM users WHERE id = ?', [userId], (err, user) => {
    callback(err, user);
  });
};

module.exports = {
  hashPassword,
  comparePassword,
  registerUser,
  loginUser,
  changePassword,
  getUserById,
};
