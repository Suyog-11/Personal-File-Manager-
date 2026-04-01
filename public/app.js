// ==================== STATE MANAGEMENT ====================

let currentUser = null;
let currentFolderId = null;
let currentFolderPath = [];
let viewMode = 'grid';
let renameFileId = null;
const API_BASE = 'http://localhost:3000/api';

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  checkAuthStatus();
  loadDarkModePreference();
});

function setupEventListeners() {
  // Auth forms
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerForm').addEventListener('submit', handleRegister);

  // File upload
  document.getElementById('fileInput').addEventListener('change', handleFileSelect);
  const uploadArea = document.getElementById('uploadArea');
  uploadArea.addEventListener('dragover', handleDragOver);
  uploadArea.addEventListener('dragleave', handleDragLeave);
  uploadArea.addEventListener('drop', handleDrop);
  uploadArea.addEventListener('click', () => document.getElementById('fileInput').click());

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);

  // Dark mode
  document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

  // Rename modal
  document.getElementById('renameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') confirmRename();
  });

  // Folder modal
  document.getElementById('folderNameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') confirmCreateFolder();
  });
}

// ==================== AUTHENTICATION ====================

async function checkAuthStatus() {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
    });

    if (response.ok) {
      const user = await response.json();
      currentUser = user;
      showDashboard();
      loadFiles();
      loadFolders();
    } else {
      showAuthPage();
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    showAuthPage();
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok) {
      currentUser = data.user;
      showDashboard();
      loadFiles();
      loadFolders();
      showToast('Login successful!', 'success');
    } else {
      showToast(data.error || 'Login failed', 'error');
    }
  } catch (error) {
    showToast('Login error: ' + error.message, 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, confirmPassword }),
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok) {
      currentUser = data.user;
      showDashboard();
      loadFiles();
      loadFolders();
      showToast('Registration successful!', 'success');
    } else {
      showToast(data.error || 'Registration failed', 'error');
    }
  } catch (error) {
    showToast('Registration error: ' + error.message, 'error');
  }
}

async function handleLogout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    currentUser = null;
    currentFolderId = null;
    currentFolderPath = [];
    showAuthPage();
    showToast('Logged out successfully', 'success');
  } catch (error) {
    showToast('Logout error: ' + error.message, 'error');
  }
}

// ==================== UI NAVIGATION ====================

function showAuthPage() {
  document.getElementById('authContainer').style.display = 'flex';
  document.getElementById('dashboardContainer').style.display = 'none';
  document.getElementById('loginPage').classList.add('active');
  document.getElementById('registerPage').classList.remove('active');
}

function showDashboard() {
  document.getElementById('authContainer').style.display = 'none';
  document.getElementById('dashboardContainer').style.display = 'flex';
  document.getElementById('currentUser').textContent = `👤 ${currentUser.username}`;
}

function toggleAuthPage() {
  document.getElementById('loginPage').classList.toggle('active');
  document.getElementById('registerPage').classList.toggle('active');
  // Clear forms
  document.getElementById('loginForm').reset();
  document.getElementById('registerForm').reset();
}

// ==================== FILE MANAGEMENT ====================

async function loadFiles(folderId = null) {
  try {
    const url = folderId
      ? `${API_BASE}/files?folderId=${folderId}`
      : `${API_BASE}/files`;

    const response = await fetch(url, { credentials: 'include' });
    const files = await response.json();

    displayFiles(files);
    updateStorageInfo(files);
  } catch (error) {
    showToast('Failed to load files: ' + error.message, 'error');
  }
}

async function loadFolders(parentFolderId = null) {
  try {
    const url = parentFolderId
      ? `${API_BASE}/folders?parentFolderId=${parentFolderId}`
      : `${API_BASE}/folders`;

    const response = await fetch(url, { credentials: 'include' });
    const folders = await response.json();

    displayFolders(folders);
  } catch (error) {
    console.error('Failed to load folders:', error);
  }
}

function displayFiles(files) {
  const container = document.getElementById('filesContainer');
  const emptyState = document.getElementById('emptyState');

  if (files.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';
  container.innerHTML = files
    .map((file) => createFileCard(file))
    .join('');
}

function displayFolders(folders) {
  const container = document.getElementById('filesContainer');

  if (folders.length === 0) return;

  const folderHTML = folders
    .map((folder) => createFolderCard(folder))
    .join('');

  container.innerHTML = folderHTML + container.innerHTML;
}

function createFileCard(file) {
  const fileIcon = getFileIcon(file.file_type);
  const fileSize = formatFileSize(file.file_size);
  const uploadDate = new Date(file.uploaded_at).toLocaleDateString();

  const cardClass = viewMode === 'list' ? 'file-card list-view' : 'file-card';

  return `
    <div class="${cardClass}" data-file-id="${file.id}">
      <div class="file-icon">${fileIcon}</div>
      <div class="file-info">
        <div class="file-name" title="${file.original_filename}">${file.original_filename}</div>
        <div class="file-meta">${fileSize} • ${uploadDate}</div>
      </div>
      <div class="file-actions">
        <button class="btn btn-icon" onclick="previewFile(${file.id})" title="Preview">👁️</button>
        <button class="btn btn-icon" onclick="downloadFile(${file.id})" title="Download">⬇️</button>
        <button class="btn btn-icon" onclick="showRenameModal(${file.id}, '${file.original_filename}')" title="Rename">✏️</button>
        <button class="btn btn-icon btn-danger" onclick="deleteFile(${file.id})" title="Delete">🗑️</button>
      </div>
    </div>
  `;
}

function createFolderCard(folder) {
  return `
    <div class="file-card folder-card" onclick="navigateToFolder(${folder.id}, '${folder.folder_name}')">
      <div class="file-icon">📁</div>
      <div class="file-info">
        <div class="file-name">${folder.folder_name}</div>
      </div>
      <div class="file-actions">
        <button class="btn btn-icon btn-danger" onclick="event.stopPropagation(); deleteFolder(${folder.id})" title="Delete">🗑️</button>
      </div>
    </div>
  `;
}

function getFileIcon(fileType) {
  const icons = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📄',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    mp4: '🎬',
    avi: '🎬',
    mov: '🎬',
    zip: '📦',
    rar: '📦',
  };
  return icons[fileType] || '📎';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function updateStorageInfo(files) {
  const totalSize = files.reduce((sum, file) => sum + file.file_size, 0);
  const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
  const percentage = (totalSize / maxSize) * 100;

  document.getElementById('storageUsed').textContent = `Used: ${formatFileSize(totalSize)}`;
  document.getElementById('storageProgress').style.width = Math.min(percentage, 100) + '%';
}

// ==================== FILE UPLOAD ====================

function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('uploadArea').classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('uploadArea').classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('uploadArea').classList.remove('drag-over');

  const files = e.dataTransfer.files;
  uploadFiles(files);
}

function handleFileSelect(e) {
  const files = e.target.files;
  uploadFiles(files);
  e.target.value = ''; // Reset input
}

async function uploadFiles(files) {
  for (let file of files) {
    const formData = new FormData();
    formData.append('file', file);
    if (currentFolderId) {
      formData.append('folderId', currentFolderId);
    }

    try {
      const response = await fetch(`${API_BASE}/files/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`${file.name} uploaded successfully`, 'success');
        loadFiles(currentFolderId);
      } else {
        showToast(data.error || 'Upload failed', 'error');
      }
    } catch (error) {
      showToast('Upload error: ' + error.message, 'error');
    }
  }
}

// ==================== FILE OPERATIONS ====================

async function downloadFile(fileId) {
  try {
    window.location.href = `${API_BASE}/files/${fileId}/download`;
  } catch (error) {
    showToast('Download failed: ' + error.message, 'error');
  }
}

async function deleteFile(fileId) {
  if (!confirm('Are you sure you want to delete this file?')) return;

  try {
    const response = await fetch(`${API_BASE}/files/${fileId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (response.ok) {
      showToast('File deleted successfully', 'success');
      loadFiles(currentFolderId);
    } else {
      const data = await response.json();
      showToast(data.error || 'Delete failed', 'error');
    }
  } catch (error) {
    showToast('Delete error: ' + error.message, 'error');
  }
}

function showRenameModal(fileId, currentName) {
  renameFileId = fileId;
  const input = document.getElementById('renameInput');
  input.value = currentName;
  openModal('renameModal');
  input.focus();
  input.select();
}

async function confirmRename() {
  const newFilename = document.getElementById('renameInput').value.trim();

  if (!newFilename) {
    showToast('Filename cannot be empty', 'warning');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/files/${renameFileId}/rename`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newFilename }),
      credentials: 'include',
    });

    if (response.ok) {
      showToast('File renamed successfully', 'success');
      closeModal('renameModal');
      loadFiles(currentFolderId);
    } else {
      const data = await response.json();
      showToast(data.error || 'Rename failed', 'error');
    }
  } catch (error) {
    showToast('Rename error: ' + error.message, 'error');
  }
}

async function previewFile(fileId) {
  try {
    const response = await fetch(`${API_BASE}/files/${fileId}/download`, {
      credentials: 'include',
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const previewContent = document.getElementById('previewContent');

      // Determine file type and create appropriate preview
      const contentType = response.headers.get('content-type');
      if (contentType.includes('image')) {
        previewContent.innerHTML = `<img src="${url}" alt="Preview">`;
      } else if (contentType.includes('pdf')) {
        previewContent.innerHTML = `<iframe src="${url}" style="width: 100%; height: 70vh;"></iframe>`;
      } else {
        previewContent.innerHTML = '<p>Preview not available for this file type</p>';
      }

      openModal('previewModal');
    }
  } catch (error) {
    showToast('Preview failed: ' + error.message, 'error');
  }
}

async function searchFiles() {
  const searchTerm = document.getElementById('searchInput').value.trim();

  if (!searchTerm) {
    loadFiles(currentFolderId);
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/files/search/${encodeURIComponent(searchTerm)}`, {
      credentials: 'include',
    });

    const files = await response.json();
    displayFiles(files);
  } catch (error) {
    showToast('Search failed: ' + error.message, 'error');
  }
}

// ==================== FOLDER OPERATIONS ====================

function showCreateFolderModal() {
  document.getElementById('folderNameInput').value = '';
  openModal('createFolderModal');
  document.getElementById('folderNameInput').focus();
}

async function confirmCreateFolder() {
  const folderName = document.getElementById('folderNameInput').value.trim();

  if (!folderName) {
    showToast('Folder name cannot be empty', 'warning');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderName, parentFolderId: currentFolderId || null }),
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok) {
      showToast('Folder created successfully', 'success');
      closeModal('createFolderModal');
      loadFolders(currentFolderId);
    } else {
      showToast(data.error || 'Folder creation failed', 'error');
    }
  } catch (error) {
    showToast('Folder creation error: ' + error.message, 'error');
  }
}

async function deleteFolder(folderId) {
  if (!confirm('Are you sure you want to delete this folder and all its contents?')) return;

  try {
    const response = await fetch(`${API_BASE}/folders/${folderId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (response.ok) {
      showToast('Folder deleted successfully', 'success');
      loadFolders(currentFolderId);
      loadFiles(currentFolderId);
    } else {
      const data = await response.json();
      showToast(data.error || 'Delete failed', 'error');
    }
  } catch (error) {
    showToast('Delete error: ' + error.message, 'error');
  }
}

function navigateToFolder(folderId, folderName) {
  currentFolderId = folderId;
  currentFolderPath.push({ id: folderId, name: folderName });
  updateBreadcrumb();
  loadFiles(folderId);
  loadFolders(folderId);
}

function navigateToRoot() {
  currentFolderId = null;
  currentFolderPath = [];
  updateBreadcrumb();
  loadFiles();
  loadFolders();
}

function updateBreadcrumb() {
  const breadcrumb = document.getElementById('breadcrumb');
  let html = '<span class="breadcrumb-item active" onclick="navigateToRoot()">Home</span>';

  currentFolderPath.forEach((folder, index) => {
    html += '<span class="breadcrumb-separator">/</span>';
    html += `<span class="breadcrumb-item" onclick="navigateToFolderByIndex(${index})">${folder.name}</span>`;
  });

  breadcrumb.innerHTML = html;
}

function navigateToFolderByIndex(index) {
  currentFolderPath = currentFolderPath.slice(0, index + 1);
  const lastFolder = currentFolderPath[currentFolderPath.length - 1];
  currentFolderId = lastFolder.id;
  updateBreadcrumb();
  loadFiles(currentFolderId);
  loadFolders(currentFolderId);
}

// ==================== VIEW MODES ====================

function setViewMode(mode) {
  viewMode = mode;
  const container = document.getElementById('filesContainer');

  if (mode === 'grid') {
    container.classList.remove('list-view');
  } else {
    container.classList.add('list-view');
  }

  // Update button states
  document.querySelectorAll('.view-options .btn').forEach((btn) => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  // Reload files to update display
  loadFiles(currentFolderId);
}

// ==================== DARK MODE ====================

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

function loadDarkModePreference() {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }
}

// ==================== MODALS ====================

function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});

// ==================== NOTIFICATIONS ====================

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
