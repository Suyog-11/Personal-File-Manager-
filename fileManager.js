const db = require('./database');
const fs = require('fs');
const path = require('path');

// Upload file
const uploadFile = (userId, filename, originalFilename, filePath, fileSize, fileType, folderId, callback) => {
  db.run(
    'INSERT INTO files (user_id, filename, original_filename, file_path, file_size, file_type, folder_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, filename, originalFilename, filePath, fileSize, fileType, folderId || null],
    function (err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id: this.lastID, filename, originalFilename, fileSize, fileType });
      }
    }
  );
};

// Get user files
const getUserFiles = (userId, folderId, callback) => {
  const query = folderId
    ? 'SELECT * FROM files WHERE user_id = ? AND folder_id = ? ORDER BY uploaded_at DESC'
    : 'SELECT * FROM files WHERE user_id = ? AND folder_id IS NULL ORDER BY uploaded_at DESC';
  
  const params = folderId ? [userId, folderId] : [userId];
  
  db.all(query, params, (err, files) => {
    callback(err, files || []);
  });
};

// Get file by ID
const getFileById = (fileId, userId, callback) => {
  db.get('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, userId], (err, file) => {
    callback(err, file);
  });
};

// Delete file
const deleteFile = (fileId, userId, callback) => {
  db.get('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, userId], (err, file) => {
    if (err) {
      callback(err);
    } else if (!file) {
      callback(new Error('File not found'));
    } else {
      // Delete from filesystem
      fs.unlink(file.file_path, (fsErr) => {
        if (fsErr && fsErr.code !== 'ENOENT') {
          callback(fsErr);
        } else {
          // Delete from database
          db.run('DELETE FROM files WHERE id = ?', [fileId], (dbErr) => {
            callback(dbErr);
          });
        }
      });
    }
  });
};

// Rename file
const renameFile = (fileId, userId, newFilename, callback) => {
  db.run(
    'UPDATE files SET original_filename = ? WHERE id = ? AND user_id = ?',
    [newFilename, fileId, userId],
    function (err) {
      if (err) {
        callback(err);
      } else if (this.changes === 0) {
        callback(new Error('File not found'));
      } else {
        callback(null);
      }
    }
  );
};

// Search files
const searchFiles = (userId, searchTerm, callback) => {
  db.all(
    'SELECT * FROM files WHERE user_id = ? AND original_filename LIKE ? ORDER BY uploaded_at DESC',
    [userId, `%${searchTerm}%`],
    (err, files) => {
      callback(err, files || []);
    }
  );
};

// Create folder
const createFolder = (userId, folderName, parentFolderId, callback) => {
  db.run(
    'INSERT INTO folders (user_id, folder_name, parent_folder_id) VALUES (?, ?, ?)',
    [userId, folderName, parentFolderId || null],
    function (err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id: this.lastID, folderName });
      }
    }
  );
};

// Get user folders
const getUserFolders = (userId, parentFolderId, callback) => {
  const query = parentFolderId
    ? 'SELECT * FROM folders WHERE user_id = ? AND parent_folder_id = ? ORDER BY created_at DESC'
    : 'SELECT * FROM folders WHERE user_id = ? AND parent_folder_id IS NULL ORDER BY created_at DESC';
  
  const params = parentFolderId ? [userId, parentFolderId] : [userId];
  
  db.all(query, params, (err, folders) => {
    callback(err, folders || []);
  });
};

// Delete folder
const deleteFolder = (folderId, userId, callback) => {
  db.get('SELECT * FROM folders WHERE id = ? AND user_id = ?', [folderId, userId], (err, folder) => {
    if (err) {
      callback(err);
    } else if (!folder) {
      callback(new Error('Folder not found'));
    } else {
      // Delete all files in folder
      db.all('SELECT * FROM files WHERE folder_id = ?', [folderId], (err, files) => {
        if (files && files.length > 0) {
          files.forEach((file) => {
            fs.unlink(file.file_path, () => {});
          });
        }
        db.run('DELETE FROM files WHERE folder_id = ?', [folderId], () => {
          db.run('DELETE FROM folders WHERE id = ?', [folderId], (dbErr) => {
            callback(dbErr);
          });
        });
      });
    }
  });
};

module.exports = {
  uploadFile,
  getUserFiles,
  getFileById,
  deleteFile,
  renameFile,
  searchFiles,
  createFolder,
  getUserFolders,
  deleteFolder,
};
