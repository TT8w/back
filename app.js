// Application State
const appState = {
  currentUser: null,
  userType: null,
  selectedUserId: 1,
  notifications: [],
  messages: [],
  alerts: [],
  cameraUpdateInterval: null,
  mapUpdateInterval: null
};

// Demo Account Data
const demoAccounts = {
  'demo.user@nera.hk': {
    password: 'password123',
    type: 'vi-user',
    name: 'Sarah Wong',
    id: 1
  },
  'demo.carer@nera.hk': {
    password: 'password123',
    type: 'carer',
    name: 'Mary Johnson',
    id: 1
  }
};

// Mock User Data
const mockUsers = {
  1: {
    id: 1,
    name: 'Sarah Wong',
    initials: 'SW',
    location: 'Central, Hong Kong',
    status: 'online',
    battery: 75,
    activity: 'Traveling to library',
    destination: 'Hong Kong Central Library',
    lastUpdate: '2 minutes ago',
    plan: 'Community Builder',
    planPrice: 'HKD 599/month',
    planExpires: '2025-12-06',
    daysRemaining: 26,
    lat: 22.2856,
    lng: 114.1591
  },
  2: {
    id: 2,
    name: 'John Lee',
    initials: 'JL',
    location: 'Causeway Bay, Hong Kong',
    status: 'warning',
    battery: 35,
    activity: 'Shopping',
    destination: 'Times Square',
    lastUpdate: '5 minutes ago',
    plan: 'Premium Privacy',
    planPrice: 'HKD 1,299/month',
    planExpires: '2025-11-30',
    daysRemaining: 20,
    lat: 22.2773,
    lng: 114.1830
  },
  3: {
    id: 3,
    name: 'Emily Chen',
    initials: 'EC',
    location: 'Admiralty, Hong Kong',
    status: 'online',
    battery: 90,
    activity: 'Working',
    destination: 'Office',
    lastUpdate: '1 minute ago',
    plan: 'Community Builder',
    planPrice: 'HKD 599/month',
    planExpires: '2025-12-25',
    daysRemaining: 45,
    lat: 22.2752,
    lng: 114.1641
  }
};

// Mock Identification Data
const mockIdentifications = [
  {
    item: 'HKD $100 bill',
    description: 'Red and colored design, 100 character visible',
    icon: '💵',
    confidence: 98
  },
  {
    item: 'Blue shirt',
    description: 'Light blue cotton shirt with 3 white buttons',
    icon: '👕',
    confidence: 95
  },
  {
    item: 'Orange fruit',
    description: 'Medium sized fresh orange, very round',
    icon: '🍊',
    confidence: 92
  },
  {
    item: 'Red color',
    description: 'Bright red - like a traffic light',
    icon: '🔴',
    confidence: 97
  },
  {
    item: 'Text: Milk',
    description: 'Package says "Milk - Expiry date Dec 2025"',
    icon: '📄',
    confidence: 89
  }
];

let identificationHistory = [];

// Initialize Application
function init() {
  setupLoginHandlers();
  setupDashboardHandlers();
  checkExistingSession();
}

// Check for existing session
function checkExistingSession() {
  // For demo purposes, always start at login
  showScreen('login-screen');
}

// Setup Login Handlers
function setupLoginHandlers() {
  const loginForm = document.getElementById('login-form');
  const demoViBtn = document.getElementById('demo-vi-user');
  const demoCarerBtn = document.getElementById('demo-carer');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    handleLogin(email, password);
  });

  demoViBtn.addEventListener('click', () => {
    handleLogin('demo.user@nera.hk', 'password123');
  });

  demoCarerBtn.addEventListener('click', () => {
    handleLogin('demo.carer@nera.hk', 'password123');
  });
}

// Handle Login
function handleLogin(email, password) {
  const account = demoAccounts[email];
  
  if (account && account.password === password) {
    appState.currentUser = account;
    appState.userType = account.type;
    
    showToast('Login successful!', 'success');
    
    if (account.type === 'vi-user') {
      showViUserDashboard();
    } else if (account.type === 'carer') {
      showCarerDashboard();
    }
  } else {
    showToast('Invalid credentials. Please try again.', 'error');
  }
}

// Show VI User Dashboard
function showViUserDashboard() {
  showScreen('vi-dashboard');
  document.getElementById('vi-welcome').textContent = `Welcome, ${appState.currentUser.name}`;
  
  const user = mockUsers[appState.currentUser.id];
  document.getElementById('current-location').textContent = user.location;
  
  // Update subscription info
  document.querySelector('.plan-name').textContent = user.plan;
  document.querySelector('.plan-days').textContent = `${user.daysRemaining} days remaining`;
  
  // Initialize identification history with one sample
  if (identificationHistory.length === 0) {
    identificationHistory.push({
      icon: '💵',
      item: 'HKD $100 bill',
      time: '2 min ago'
    });
    updateIdentificationHistoryUI();
  }
}

// Show Carer Dashboard
function showCarerDashboard() {
  showScreen('carer-dashboard');
  document.getElementById('carer-name').textContent = appState.currentUser.name;
  
  // Initialize all dashboard components
  initCarerDashboard();
  
  // Start real-time updates
  startRealTimeUpdates();
  
  // Update camera timestamp
  setInterval(() => {
    const timestamp = document.getElementById('camera-live-timestamp');
    if (timestamp) {
      const now = new Date();
      timestamp.textContent = now.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    }
  }, 1000);
}

// Setup Dashboard Handlers
function setupDashboardHandlers() {
  // Sidebar navigation
  document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const section = e.currentTarget.dataset.section;
      switchSection(section);
    });
  });
  
  // Settings tabs
  document.querySelectorAll('.settings-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchSettingsTab(e.target.dataset.settingsTab);
    });
  });
  
  // Map controls
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const resetMapBtn = document.getElementById('reset-map-btn');
  const mapTypeToggle = document.getElementById('map-type-toggle');
  
  if (zoomInBtn) zoomInBtn.addEventListener('click', () => handleMapZoomNew('in'));
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => handleMapZoomNew('out'));
  if (resetMapBtn) resetMapBtn.addEventListener('click', resetMapView);
  if (mapTypeToggle) mapTypeToggle.addEventListener('click', toggleMapType);
  
  // Camera controls
  setupCameraControls();
  
  // Messages
  setupMessagesHandlers();
  
  // Subscriptions
  setupSubscriptionHandlers();
  
  // Settings
  setupSettingsHandlers();
  
  // Reports
  setupReportsHandlers();

  // VI User Handlers
  const viLogoutBtn = document.getElementById('vi-logout');
  const sosBtn = document.getElementById('sos-button');
  const voiceBtn = document.getElementById('voice-activate');
  
  if (viLogoutBtn) {
    viLogoutBtn.addEventListener('click', handleLogout);
  }
  
  if (sosBtn) {
    sosBtn.addEventListener('click', handleSOS);
  }
  
  if (voiceBtn) {
    voiceBtn.addEventListener('click', handleVoiceActivation);
  }
  
  // Quick command buttons
  document.querySelectorAll('.quick-cmd-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const command = e.target.textContent;
      handleVoiceCommand(command);
    });
  });
  
  // Wellness buttons
  document.querySelectorAll('.wellness-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const status = e.target.classList.contains('good') ? 'Good' : 
                     e.target.classList.contains('okay') ? 'Okay' : 'Need Help';
      handleWellnessCheck(status);
    });
  });
  
  // AI Identifier buttons
  const identifyBtn = document.getElementById('identify-button');
  if (identifyBtn) {
    identifyBtn.addEventListener('click', handleIdentification);
  }
  
  const closeResultBtn = document.getElementById('close-result');
  if (closeResultBtn) {
    closeResultBtn.addEventListener('click', () => {
      document.getElementById('identification-result').style.display = 'none';
    });
  }
  
  const identifyAnotherBtn = document.getElementById('identify-another');
  if (identifyAnotherBtn) {
    identifyAnotherBtn.addEventListener('click', handleIdentification);
  }
  
  const saveIdentificationBtn = document.getElementById('save-identification');
  if (saveIdentificationBtn) {
    saveIdentificationBtn.addEventListener('click', () => {
      showToast('Identification saved to notes', 'success');
    });
  }
  
  // Carer Handlers
  const carerLogoutBtn = document.getElementById('carer-logout');
  if (carerLogoutBtn) {
    carerLogoutBtn.addEventListener('click', handleLogout);
  }
}

// Switch Section
function switchSection(sectionName) {
  // Update navigation
  document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const navBtn = document.querySelector(`[data-section="${sectionName}"]`);
  if (navBtn) navBtn.classList.add('active');
  
  // Update content
  document.querySelectorAll('.section-content').forEach(section => {
    section.classList.remove('active');
  });
  const sectionEl = document.getElementById(`${sectionName}-section`);
  if (sectionEl) {
    sectionEl.classList.add('active');
    
    // Initialize section-specific content
    const sectionNames = {
      'dashboard': 'Dashboard',
      'map': 'Live Map',
      'camera': 'Camera Feed',
      'users': 'My Users',
      'subscriptions': 'Subscriptions',
      'messages': 'Messages',
      'alerts': 'Alerts',
      'reports': 'Analytics & Reports',
      'settings': 'Settings'
    };
    
    showToast(`✓ ${sectionNames[sectionName] || sectionName}`, 'success');
  }
}

// Switch Settings Tab
function switchSettingsTab(tabName) {
  document.querySelectorAll('.settings-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-settings-tab="${tabName}"]`).classList.add('active');
  
  document.querySelectorAll('.settings-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}-settings`).classList.add('active');
}

// Initialize Carer Dashboard
function initCarerDashboard() {
  renderUserCards();
  renderMapPins();
  renderCameraUserSelect();
  renderUsersTable();
  renderSubscriptionsTable();
  renderConversations();
  renderAlerts();
  initializeReportsCharts();
  enableMapInteractions();
  setupCameraButtonStyles();
}

// Render User Cards
function renderUserCards() {
  const container = document.getElementById('user-cards-grid');
  if (!container) return;
  
  container.innerHTML = Object.values(mockUsers).map(user => `
    <div class="user-status-card">
      <div class="user-status-header">
        <div class="user-status-avatar">${user.initials}</div>
        <div>
          <div class="user-status-name">${user.name}</div>
          <span class="user-status-badge ${user.status}">
            ${user.status === 'online' ? '🟢 Online' : user.status === 'warning' ? '🟡 Warning' : '⚫ Offline'}
          </span>
        </div>
      </div>
      <div class="user-status-info">📍 ${user.location}</div>
      <div class="user-status-battery">
        Battery: ${user.battery}%
        <div class="battery-bar">
          <div class="battery-fill ${user.battery < 30 ? 'low' : user.battery < 60 ? 'medium' : ''}" style="width: ${user.battery}%"></div>
        </div>
      </div>
      <div class="user-status-time">Last updated: ${user.lastUpdate}</div>
      <div class="user-status-actions">
        <button class="btn btn-primary" onclick="viewUserOnMap(${user.id})">View Map</button>
        <button class="btn btn-primary" onclick="viewUserCamera(${user.id})">Camera</button>
        <button class="btn btn-secondary" onclick="messageUser(${user.id})">Message</button>
      </div>
      <span class="user-status-plan ${user.plan.toLowerCase().includes('community') ? 'community' : 'premium'}">
        ${user.plan}
      </span>
    </div>
  `).join('');
}

// Render Map Pins
function renderMapPins() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;
  
  const pins = Object.values(mockUsers).map((user, index) => {
    const top = 30 + (index * 15);
    const left = 30 + (index * 20);
    return `
      <div class="map-user-pin ${user.status}" 
           style="top: ${top}%; left: ${left}%;" 
           data-user-id="${user.id}"
           onclick="selectPinUser(${user.id})">
        <div class="pin-inner">${user.initials}</div>
        <div class="pin-tooltip">${user.name}</div>
      </div>
    `;
  }).join('');
  
  canvas.innerHTML = pins;
}

// Select Pin User
function selectPinUser(userId) {
  const user = mockUsers[userId];
  if (!user) return;
  
  const panel = document.getElementById('map-details-panel');
  const details = document.getElementById('map-user-details');
  
  if (panel && details) {
    panel.style.display = 'block';
    details.innerHTML = `
      <h4>${user.name}</h4>
      <p><strong>Location:</strong> ${user.location}</p>
      <p><strong>Activity:</strong> ${user.activity}</p>
      <p><strong>Battery:</strong> ${user.battery}%</p>
      <p><strong>Status:</strong> ${user.status}</p>
      <div style="margin-top: 16px;">
        <button class="btn btn-primary" onclick="viewUserCamera(${userId})">View Camera</button>
        <button class="btn btn-secondary" onclick="messageUser(${userId})">Send Message</button>
      </div>
    `;
  }
  
  // Highlight pin
  document.querySelectorAll('.map-user-pin').forEach(pin => {
    pin.style.transform = '';
    pin.style.zIndex = '1';
  });
  
  const selectedPin = document.querySelector(`[data-user-id="${userId}"]`);
  if (selectedPin) {
    selectedPin.style.transform = 'scale(1.3)';
    selectedPin.style.zIndex = '100';
  }
  
  showToast(`Selected ${user.name}`, 'info');
}

// Map Zoom
let currentZoomLevel = 3;
function handleMapZoomNew(direction) {
  if (direction === 'in' && currentZoomLevel < 10) {
    currentZoomLevel++;
  } else if (direction === 'out' && currentZoomLevel > 1) {
    currentZoomLevel--;
  }
  
  document.getElementById('zoom-level').textContent = currentZoomLevel;
  
  const canvas = document.getElementById('map-canvas');
  if (canvas) {
    canvas.style.transform = `scale(${1 + (currentZoomLevel - 3) * 0.15})`;
    canvas.style.transition = 'transform 0.3s';
  }
  
  showToast(`Zoom: ${currentZoomLevel}/10`, 'info');
}

function resetMapView() {
  currentZoomLevel = 3;
  document.getElementById('zoom-level').textContent = currentZoomLevel;
  
  const canvas = document.getElementById('map-canvas');
  if (canvas) {
    canvas.style.transform = 'scale(1)';
  }
  
  showToast('Map reset', 'info');
}

let mapType = 'street';
function toggleMapType() {
  mapType = mapType === 'street' ? 'satellite' : 'street';
  
  const icon = document.getElementById('map-type-icon');
  const text = document.getElementById('map-type-text');
  const canvas = document.getElementById('map-canvas');
  
  if (mapType === 'satellite') {
    icon.textContent = '🛰️';
    text.textContent = 'Satellite View';
    if (canvas) canvas.style.background = 'linear-gradient(135deg, #1e3a5f 0%, #2d5f3f 50%, #3f5f2d 100%)';
  } else {
    icon.textContent = '🛣️';
    text.textContent = 'Street View';
    if (canvas) canvas.style.background = 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #e0e7ff 100%)';
  }
  
  showToast(`Switched to ${mapType} view`, 'info');
}

function enableMapInteractions() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;
  
  let isDragging = false;
  let startX, startY, scrollLeft, scrollTop;
  
  canvas.addEventListener('mousedown', (e) => {
    if (e.target.closest('.map-user-pin')) return;
    isDragging = true;
    canvas.style.cursor = 'grabbing';
    startX = e.pageX;
    startY = e.pageY;
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const deltaX = (e.pageX - startX) * 0.5;
    const deltaY = (e.pageY - startY) * 0.5;
    
    canvas.querySelectorAll('.map-user-pin').forEach(pin => {
      const currentLeft = parseFloat(pin.style.left) || 30;
      const currentTop = parseFloat(pin.style.top) || 30;
      pin.style.left = `${currentLeft + deltaX * 0.05}%`;
      pin.style.top = `${currentTop + deltaY * 0.05}%`;
    });
    
    startX = e.pageX;
    startY = e.pageY;
  });
  
  canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
  });
  
  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
  });
}

// Camera Functions
let selectedCameraUser = null;

function renderCameraUserSelect() {
  const container = document.getElementById('camera-user-select');
  if (!container) return;
  
  container.innerHTML = Object.values(mockUsers).map(user => `
    <div class="camera-user-option ${selectedCameraUser === user.id ? 'selected' : ''}" 
         onclick="selectCameraUser(${user.id})">
      <strong>${user.name}</strong><br>
      <small>Battery: ${user.battery}%</small>
    </div>
  `).join('');
}

function selectCameraUser(userId) {
  selectedCameraUser = userId;
  const user = mockUsers[userId];
  
  renderCameraUserSelect();
  
  const display = document.getElementById('camera-feed-display');
  const info = document.getElementById('camera-user-info');
  
  if (display) {
    display.innerHTML = `
      <div class="camera-icon-big" style="font-size: 80px; margin-bottom: 16px;">📹</div>
      <p style="font-size: 18px; font-weight: 700; color: #111827; margin: 0;">📹 LIVE CAMERA FEED</p>
      <p style="font-size: 16px; font-weight: 600; color: #0052CC; margin-top: 12px;">${user.name} - ${user.location}</p>
      <p style="font-size: 14px; color: #10B981; margin-top: 8px;">🟢 Connected - HD 1080p</p>
    `;
    display.style.background = '#DBEAFE';
  }
  
  if (info) {
    info.innerHTML = `
      <strong style="font-size: 14px;">${user.name} - ${user.location}</strong><br>
      <span style="font-size: 12px;">📷 HD 1080p | 🔋 ${user.battery}% | 🟢 LIVE</span>
    `;
  }
  
  updateCameraAlerts(userId);
  showSuccessModal(`Connected to ${user.name}'s camera!`, {
    'User': user.name,
    'Quality': 'HD 1080p',
    'Connection': 'Stable (4G)',
    'Location': user.location
  });
  showToast(`Viewing camera for ${user.name}`, 'success');
}

function updateCameraAlerts(userId) {
  const feed = document.getElementById('camera-alerts-feed');
  if (!feed) return;
  
  const user = mockUsers[userId];
  
  feed.innerHTML = `
    <div style="padding: 12px; background: #FEF3C7; border-radius: 6px; margin-bottom: 8px; border: 2px solid #F59E0B; border-left: 3px solid #F59E0B;">
      <div style="font-weight: 600; font-size: 14px; color: #92400E; margin-bottom: 4px;">Recording Status</div>
      <div style="font-size: 14px; color: #6B7280;">⚪ Not Recording</div>
    </div>
    <div style="padding: 12px; background: #DBEAFE; border-radius: 6px; margin-bottom: 8px; border: 2px solid #3B82F6; border-left: 3px solid #3B82F6;">
      <div style="font-weight: 600; font-size: 13px; color: #3B82F6; margin-bottom: 4px;">🔵 INFO</div>
      <div style="font-size: 12px; color: #111827;">Camera connected - HD 1080p</div>
      <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">Just now</div>
    </div>
    <div style="padding: 12px; background: #DCFCE7; border-radius: 6px; border: 2px solid #10B981; border-left: 3px solid #10B981;">
      <div style="font-weight: 600; font-size: 13px; color: #10B981; margin-bottom: 4px;">🟢 SUCCESS</div>
      <div style="font-size: 12px; color: #111827;">User ${user.name} online</div>
      <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">2 min ago</div>
    </div>
  `;
}

function updateCameraAlertsRecording(userId, isRecording) {
  const feed = document.getElementById('camera-alerts-feed');
  if (!feed) return;
  
  const user = mockUsers[userId];
  const recordingStatus = isRecording ? `
    <div style="padding: 12px; background: #FEE2E2; border-radius: 6px; margin-bottom: 8px; border: 2px solid #DC2626; border-left: 3px solid #DC2626;">
      <div style="font-weight: 600; font-size: 14px; color: #DC2626; margin-bottom: 4px;">Recording Status</div>
      <div style="font-size: 14px; color: #DC2626; font-weight: 600;">🔴 RECORDING</div>
      <div style="font-size: 14px; color: #DC2626; font-weight: 600; margin-top: 4px;">00:00</div>
    </div>
  ` : `
    <div style="padding: 12px; background: #FEF3C7; border-radius: 6px; margin-bottom: 8px; border: 2px solid #F59E0B; border-left: 3px solid #F59E0B;">
      <div style="font-weight: 600; font-size: 14px; color: #92400E; margin-bottom: 4px;">Recording Status</div>
      <div style="font-size: 14px; color: #6B7280;">⚪ Not Recording</div>
    </div>
  `;
  
  feed.innerHTML = `
    ${recordingStatus}
    <div style="padding: 12px; background: #DBEAFE; border-radius: 6px; margin-bottom: 8px; border: 2px solid #3B82F6; border-left: 3px solid #3B82F6;">
      <div style="font-weight: 600; font-size: 13px; color: #3B82F6; margin-bottom: 4px;">🔵 INFO</div>
      <div style="font-size: 12px; color: #111827;">Camera connected - HD 1080p</div>
      <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">Just now</div>
    </div>
    <div style="padding: 12px; background: #DCFCE7; border-radius: 6px; border: 2px solid #10B981; border-left: 3px solid #10B981;">
      <div style="font-weight: 600; font-size: 13px; color: #10B981; margin-bottom: 4px;">🟢 SUCCESS</div>
      <div style="font-size: 12px; color: #111827;">User ${user.name} online</div>
      <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">2 min ago</div>
    </div>
  `;
}

function setupCameraControls() {
  const recordBtn = document.getElementById('record-btn');
  const screenshotBtn = document.getElementById('screenshot-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const zoomSlider = document.getElementById('camera-zoom');
  const nightModeBtn = document.getElementById('night-mode-btn');
  const flipBtn = document.getElementById('flip-camera-btn');
  
  let isRecording = false;
  if (recordBtn) {
    recordBtn.addEventListener('click', () => {
      if (!isRecording) {
        // Start recording
        showConfirmModal(
          'Start recording camera feed?',
          () => {
            isRecording = true;
            recordBtn.textContent = '⏹️ STOP RECORDING';
            recordBtn.style.background = '#EF4444';
            recordBtn.style.color = '#FFFFFF';
            showSuccessModal('Recording started!', {
              'Quality': '1080p HD',
              'Storage': 'Cloud Storage',
              'Started': new Date().toLocaleTimeString()
            });
            showToast('🎥 Recording started', 'success');
            
            if (selectedCameraUser) {
              updateCameraAlertsRecording(selectedCameraUser, isRecording);
            }
          },
          {
            'User': selectedCameraUser ? mockUsers[selectedCameraUser].name : 'Select a user',
            'Quality': '1080p HD',
            'Estimated Size': '~500MB/hour'
          }
        );
      } else {
        // Stop recording
        showConfirmModal(
          'Stop recording and save?',
          () => {
            isRecording = false;
            recordBtn.textContent = '⏺️ START RECORDING';
            recordBtn.style.background = '#9CA3AF';
            recordBtn.style.color = '#FFFFFF';
            showSuccessModal('Recording saved successfully!', {
              'Duration': '5 min 23 sec',
              'Size': '245 MB',
              'Location': 'Cloud Storage',
              'Saved': new Date().toLocaleTimeString()
            });
            showToast('⏹️ Recording stopped', 'info');
            
            if (selectedCameraUser) {
              updateCameraAlertsRecording(selectedCameraUser, isRecording);
            }
          },
          {
            'Current Duration': '5 min 23 sec',
            'Estimated Size': '245 MB',
            'Action': 'Save and stop'
          }
        );
      }
    });
  }
  
  if (screenshotBtn) {
    screenshotBtn.style.background = '#0052CC';
    screenshotBtn.style.color = '#FFFFFF';
    screenshotBtn.textContent = '📸 SCREENSHOT';
    screenshotBtn.addEventListener('click', () => {
      showSuccessModal('Screenshot saved successfully!', {
        'Time': new Date().toLocaleTimeString(),
        'Quality': '1080p HD',
        'Location': 'Camera Feed'
      });
      showToast('📸 Screenshot captured', 'success');
    });
  }
  
  if (fullscreenBtn) {
    fullscreenBtn.textContent = '🖥️ FULL SCREEN';
    fullscreenBtn.addEventListener('click', () => {
      const display = document.getElementById('camera-feed-display');
      if (display) {
        if (!document.fullscreenElement) {
          display.requestFullscreen().catch(() => {
            showSuccessModal('Fullscreen mode activated!', {
              'Mode': 'Fullscreen',
              'Press': 'ESC to exit'
            });
          });
        } else {
          document.exitFullscreen();
        }
      }
      showToast('⛶ Fullscreen mode', 'info');
    });
  }
  
  const settingsBtn = document.getElementById('camera-settings-btn');
  if (settingsBtn) {
    settingsBtn.textContent = '⚙️ SETTINGS';
  }
  
  if (zoomSlider) {
    const zoomDisplay = document.getElementById('zoom-display');
    if (zoomDisplay) {
      zoomDisplay.style.fontWeight = '600';
      zoomDisplay.style.fontSize = '16px';
      zoomDisplay.style.color = '#0052CC';
    }
    zoomSlider.addEventListener('input', (e) => {
      const display = document.getElementById('zoom-display');
      if (display) {
        display.textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
      }
    });
  }
  
  let nightMode = false;
  if (nightModeBtn) {
    nightModeBtn.textContent = '☀️ Day Mode';
    nightModeBtn.style.background = '#0052CC';
    nightModeBtn.style.color = '#FFFFFF';
    nightModeBtn.addEventListener('click', () => {
      nightMode = !nightMode;
      if (nightMode) {
        nightModeBtn.textContent = '🌙 Night Mode';
        nightModeBtn.style.background = '#374151';
        nightModeBtn.classList.add('night-mode');
      } else {
        nightModeBtn.textContent = '☀️ Day Mode';
        nightModeBtn.style.background = '#0052CC';
        nightModeBtn.classList.remove('night-mode');
      }
      showToast(nightMode ? '🌙 Night mode enabled' : '☀️ Day mode enabled', 'info');
    });
  }
  
  const zoomDecBtn = document.getElementById('zoom-dec');
  const zoomIncBtn = document.getElementById('zoom-inc');
  
  if (zoomDecBtn && zoomSlider) {
    zoomDecBtn.addEventListener('click', () => {
      const currentValue = parseFloat(zoomSlider.value);
      if (currentValue > 1) {
        zoomSlider.value = (currentValue - 0.1).toFixed(1);
        const display = document.getElementById('zoom-display');
        if (display) display.textContent = `${zoomSlider.value}x`;
        showToast(`Zoom: ${zoomSlider.value}x`, 'info');
      }
    });
  }
  
  if (zoomIncBtn && zoomSlider) {
    zoomIncBtn.addEventListener('click', () => {
      const currentValue = parseFloat(zoomSlider.value);
      if (currentValue < 4) {
        zoomSlider.value = (currentValue + 0.1).toFixed(1);
        const display = document.getElementById('zoom-display');
        if (display) display.textContent = `${zoomSlider.value}x`;
        showToast(`Zoom: ${zoomSlider.value}x`, 'info');
      }
    });
  }
}

// Users Table
function renderUsersTable() {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;
  
  tbody.innerHTML = Object.values(mockUsers).map(user => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="user-status-avatar" style="width: 40px; height: 40px; font-size: 14px;">${user.initials}</div>
          <strong>${user.name}</strong>
        </div>
      </td>
      <td>
        <span class="user-status-badge ${user.status}">
          ${user.status === 'online' ? '🟢 Online' : '🟡 Warning'}
        </span>
      </td>
      <td>${user.location}</td>
      <td>${user.battery}%</td>
      <td>
        <span class="user-status-plan ${user.plan.includes('Community') ? 'community' : 'premium'}">
          ${user.plan}
        </span>
      </td>
      <td>${user.daysRemaining} days</td>
      <td>
        <button class="btn btn-primary" style="padding: 6px 12px; font-size: 12px; margin-right: 4px;" onclick="viewUserOnMap(${user.id})">View</button>
        <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px; margin-right: 4px;" onclick="messageUser(${user.id})">Message</button>
        <button class="btn-camera-action error" style="padding: 6px 12px; font-size: 12px;" onclick="emergencyCall(${user.id})">Emergency</button>
      </td>
    </tr>
  `).join('');
}

// Subscriptions Table
function renderSubscriptionsTable() {
  const tbody = document.getElementById('subscription-table-body');
  if (!tbody) return;
  
  tbody.innerHTML = Object.values(mockUsers).map(user => {
    const percentage = (user.daysRemaining / 365) * 100;
    const progressClass = user.daysRemaining > 20 ? '' : user.daysRemaining > 10 ? 'warning' : 'error';
    
    return `
      <tr>
        <td><input type="checkbox" class="sub-checkbox" data-user-id="${user.id}" /></td>
        <td>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="user-status-avatar" style="width: 32px; height: 32px; font-size: 12px;">${user.initials}</div>
            <strong>${user.name}</strong>
          </div>
        </td>
        <td><span class="user-status-plan ${user.plan.includes('Community') ? 'community' : 'premium'}">${user.plan}</span></td>
        <td>${user.planPrice}</td>
        <td>
          ${user.daysRemaining} days
          <div class="subscription-progress">
            <div class="subscription-progress-bar ${progressClass}" style="width: ${percentage}%"></div>
          </div>
        </td>
        <td>${user.planExpires}</td>
        <td><span class="status-badge success">✓ Active</span></td>
        <td>
          <button class="btn ${user.daysRemaining < 25 ? 'btn-primary' : 'btn-secondary'}" 
                  style="padding: 6px 12px; font-size: 12px;" 
                  onclick="renewSubscription(${user.id})">
            Renew Now
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function setupSubscriptionHandlers() {
  const selectAll = document.getElementById('select-all-subs');
  if (selectAll) {
    selectAll.addEventListener('change', (e) => {
      document.querySelectorAll('.sub-checkbox').forEach(cb => {
        cb.checked = e.target.checked;
      });
    });
  }
  
  const bulkRenewBtn = document.getElementById('bulk-renew-btn');
  if (bulkRenewBtn) {
    bulkRenewBtn.addEventListener('click', () => {
      const checked = document.querySelectorAll('.sub-checkbox:checked');
      if (checked.length === 0) {
        showWarningModal('Please select users to renew subscriptions.');
        return;
      }
      showConfirmModal(
        `Renew ${checked.length} subscription(s)?`,
        () => {
          showToast(`Renewing ${checked.length} subscriptions...`, 'info');
          setTimeout(() => {
            showSuccessModal(`Bulk renewal completed successfully for ${checked.length} user(s)!`);
            checked.forEach(cb => cb.checked = false);
          }, 1500);
        },
        {
          'Selected Users': checked.length.toString(),
          'Total Cost': `HKD ${checked.length * 599}`,
          'Extension': '365 days each'
        }
      );
    });
  }
  
  const reminderBtn = document.getElementById('send-reminder-btn');
  if (reminderBtn) {
    reminderBtn.addEventListener('click', () => {
      const expiringUsers = Object.values(mockUsers).filter(u => u.daysRemaining < 30);
      if (expiringUsers.length === 0) {
        showWarningModal('No users with expiring subscriptions found.');
        return;
      }
      showConfirmModal(
        `Send renewal reminders to ${expiringUsers.length} user(s)?`,
        () => {
          showSuccessModal(`Renewal reminders sent successfully to ${expiringUsers.length} user(s)!`, {
            'Email': 'Sent',
            'SMS': 'Sent',
            'In-App': 'Sent'
          });
          showToast('📧 Renewal reminders sent', 'success');
        },
        {
          'Users': expiringUsers.map(u => u.name).join(', '),
          'Notification Channels': 'Email, SMS, In-App'
        }
      );
    });
  }
}

function renewSubscription(userId) {
  const user = mockUsers[userId];
  if (!user) return;
  
  showConfirmModal(
    `Renew subscription for ${user.name}?`,
    () => {
      showSuccessModal(`Subscription renewed successfully for ${user.name}!`);
      user.daysRemaining = 365;
      renderSubscriptionsTable();
      showToast(`✓ Subscription renewed for ${user.name}`, 'success');
    },
    {
      'User': user.name,
      'Plan': user.plan,
      'Price': user.planPrice,
      'Extension': '365 days'
    }
  );
}

// Messages
let conversations = {
  1: {
    userId: 1,
    messages: [
      { from: 'carer', text: 'Hi Sarah, how are you doing?', time: '12:30' },
      { from: 'user', text: "I'm good, heading to the library", time: '12:32' },
      { from: 'carer', text: 'Great! Stay safe', time: '12:33' },
      { from: 'user', text: 'Got it, see you later', time: '12:45', unread: true }
    ]
  },
  2: {
    userId: 2,
    messages: [
      { from: 'user', text: 'On the way to hospital', time: '11:15' },
      { from: 'carer', text: 'Okay, let me know when you arrive', time: '11:16' }
    ]
  },
  3: {
    userId: 3,
    messages: [
      { from: 'user', text: 'All good here', time: '10:00' }
    ]
  }
};

let activeConversation = null;

function renderConversations() {
  const list = document.getElementById('conversations-list');
  if (!list) return;
  
  list.innerHTML = Object.values(mockUsers).map(user => {
    const conv = conversations[user.id];
    const lastMsg = conv.messages[conv.messages.length - 1];
    const hasUnread = lastMsg.unread;
    
    return `
      <div class="conversation-item ${activeConversation === user.id ? 'active' : ''} ${hasUnread ? 'unread' : ''}" 
           onclick="selectConversation(${user.id})">
        <strong>${user.name}</strong>
        ${hasUnread ? '<span style="color: #0052CC; font-size: 10px;">●</span>' : ''}<br>
        <small style="color: #4B5563;">${lastMsg.text.substring(0, 30)}...</small><br>
        <small style="color: #9CA3AF;">${lastMsg.time}</small>
      </div>
    `;
  }).join('');
}

function selectConversation(userId) {
  activeConversation = userId;
  const user = mockUsers[userId];
  const conv = conversations[userId];
  
  renderConversations();
  
  const header = document.getElementById('message-header');
  const thread = document.getElementById('message-thread');
  
  if (header) {
    header.innerHTML = `<h3>Conversation with ${user.name}</h3>`;
  }
  
  if (thread) {
    thread.innerHTML = conv.messages.map(msg => `
      <div class="message-item ${msg.from === 'carer' ? 'sent' : 'received'}">
        <div class="message-avatar">${msg.from === 'carer' ? 'You' : user.initials}</div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-sender">${msg.from === 'carer' ? 'You' : user.name}</span>
            <span class="message-time">${msg.time}</span>
          </div>
          <p class="message-text">${msg.text}</p>
        </div>
      </div>
    `).join('');
    
    thread.scrollTop = thread.scrollHeight;
    
    // Mark as read
    conv.messages.forEach(m => m.unread = false);
  }
}

function setupMessagesHandlers() {
  const sendBtn = document.getElementById('send-message-btn-main');
  const input = document.getElementById('message-input-field');
  const preset = document.getElementById('preset-messages');
  
  if (sendBtn && input) {
    sendBtn.addEventListener('click', () => sendMessageFromInput());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessageFromInput();
    });
  }
  
  if (preset) {
    preset.addEventListener('change', (e) => {
      if (e.target.value) {
        sendMessageText(e.target.value);
        e.target.value = '';
      }
    });
  }
}

function sendMessageFromInput() {
  const input = document.getElementById('message-input-field');
  if (!input || !activeConversation) {
    showWarningModal('Please select a conversation first');
    return;
  }
  
  const text = input.value.trim();
  if (text) {
    sendMessageText(text);
    input.value = '';
  }
}

function sendMessageText(text) {
  if (!activeConversation) return;
  
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  
  conversations[activeConversation].messages.push({
    from: 'carer',
    text: text,
    time: time
  });
  
  selectConversation(activeConversation);
  showToast('✓ Message sent', 'success');
}

// Alerts
function renderAlerts() {
  const container = document.getElementById('alerts-list-main');
  if (!container) return;
  
  const alerts = [
    { id: 1, severity: 'critical', type: 'Emergency SOS', user: mockUsers[1], message: 'SOS activated', location: 'Central', time: 'Just now' },
    { id: 2, severity: 'warning', type: 'Geofence Breach', user: mockUsers[2], message: 'Left safe zone', location: 'Causeway Bay', time: '5 min ago' },
    { id: 3, severity: 'warning', type: 'Low Battery', user: mockUsers[2], message: 'Battery 20%', location: 'Causeway Bay', time: '10 min ago' },
    { id: 4, severity: 'info', type: 'Returned to Zone', user: mockUsers[3], message: 'Returned to work', location: 'Admiralty', time: '15 min ago' }
  ];
  
  container.innerHTML = alerts.map(alert => `
    <div class="alert-card ${alert.severity}">
      <div class="alert-icon">${alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '🟠' : '🟢'}</div>
      <div class="alert-content">
        <div class="alert-header">
          <h3 class="alert-title">${alert.type}</h3>
          <span class="alert-time">${alert.time}</span>
        </div>
        <p class="alert-message">${alert.message} at ${alert.location}</p>
        <div class="alert-user">User: ${alert.user.name}</div>
      </div>
      <div class="alert-actions">
        <button class="btn btn-primary" style="padding: 8px 16px; font-size: 12px; margin-bottom: 4px;" onclick="viewUserOnMap(${alert.user.id})">View Map</button>
        <button class="btn btn-primary" style="padding: 8px 16px; font-size: 12px; margin-bottom: 4px;" onclick="messageUser(${alert.user.id})">Call User</button>
        <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 12px;" onclick="dismissAlert(${alert.id})">Acknowledge</button>
      </div>
    </div>
  `).join('');
}

function dismissAlert(alertId) {
  showConfirmModal(
    'Mark this alert as acknowledged?',
    () => {
      const alert = document.querySelector(`[data-alert-id="${alertId}"]`);
      if (alert) alert.remove();
      showSuccessModal('Alert acknowledged successfully');
      showToast('✓ Alert acknowledged', 'info');
    }
  );
}

// Reports
function setupReportsHandlers() {
  const generateBtn = document.getElementById('generate-report-btn');
  const exportBtn = document.getElementById('export-pdf-btn');
  
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      showToast('📊 Generating report...', 'info');
      setTimeout(() => {
        showSuccessModal('Report generated successfully!', {
          'Report Type': 'Analytics Report',
          'Date Range': document.getElementById('report-date-from')?.value + ' to ' + document.getElementById('report-date-to')?.value,
          'Total Records': '156',
          'Generated': new Date().toLocaleString()
        });
      }, 1000);
    });
  }
  
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      showConfirmModal(
        'Export report as PDF?',
        () => {
          showToast('📄 Exporting as PDF...', 'info');
          setTimeout(() => {
            showSuccessModal('PDF exported successfully!', {
              'Format': 'PDF',
              'Pages': '12',
              'File Size': '2.4 MB',
              'Download': 'Starting...'
            });
          }, 1500);
        },
        {
          'Report Type': 'Analytics Report',
          'Date Range': 'Last 7 days',
          'Users Included': '3'
        }
      );
    });
  }
}

function initializeReportsCharts() {
  const dailyCanvas = document.getElementById('daily-activity-chart');
  const weeklyCanvas = document.getElementById('weekly-pattern-chart');
  
  if (dailyCanvas) {
    new Chart(dailyCanvas, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Sarah Wong',
            data: [12, 19, 15, 17, 14, 13, 16],
            backgroundColor: '#1FB8CD'
          },
          {
            label: 'John Lee',
            data: [8, 11, 9, 12, 10, 8, 11],
            backgroundColor: '#FFC185'
          },
          {
            label: 'Emily Chen',
            data: [15, 18, 16, 19, 17, 15, 18],
            backgroundColor: '#B4413C'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
  
  if (weeklyCanvas) {
    new Chart(weeklyCanvas, {
      type: 'line',
      data: {
        labels: ['0h', '4h', '8h', '12h', '16h', '20h', '24h'],
        datasets: [{
          label: 'Activity Level',
          data: [2, 1, 3, 8, 12, 7, 4],
          borderColor: '#1FB8CD',
          backgroundColor: 'rgba(31, 184, 205, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
}

// Settings
function setupSettingsHandlers() {
  const saveProfileBtn = document.getElementById('save-profile-btn');
  const saveNotifBtn = document.getElementById('save-notifications-btn');
  const savePrivacyBtn = document.getElementById('save-privacy-btn');
  const saveAccessBtn = document.getElementById('save-accessibility-btn');
  const fontSlider = document.getElementById('font-size-slider');
  
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
      showSuccessModal('Profile settings saved successfully!', {
        'Name': document.getElementById('settings-name')?.value || 'Mary Johnson',
        'Phone': document.getElementById('settings-phone')?.value || '+852 9876 5432',
        'Last Updated': new Date().toLocaleString()
      });
      showToast('✓ Profile settings saved', 'success');
    });
  }
  
  if (saveNotifBtn) {
    saveNotifBtn.addEventListener('click', () => {
      showSuccessModal('Notification settings saved successfully!', {
        'Emergency Alerts': 'Always On',
        'Geofence Alerts': 'Enabled',
        'Battery Alerts': 'Enabled',
        'Sound': 'Default'
      });
      showToast('✓ Notification settings saved', 'success');
    });
  }
  
  if (savePrivacyBtn) {
    savePrivacyBtn.addEventListener('click', () => {
      showSuccessModal('Privacy settings saved successfully!', {
        'Session Timeout': document.getElementById('session-timeout')?.value + ' minutes',
        'Auto-logout': document.getElementById('auto-logout')?.checked ? 'Enabled' : 'Disabled',
        'Applied': new Date().toLocaleString()
      });
      showToast('✓ Privacy settings saved', 'success');
    });
  }
  
  if (saveAccessBtn) {
    saveAccessBtn.addEventListener('click', () => {
      showSuccessModal('Accessibility settings saved successfully!', {
        'Font Size': document.getElementById('font-size-slider')?.value + 'px',
        'High Contrast': document.getElementById('high-contrast')?.checked ? 'Enabled' : 'Disabled',
        'Dark Mode': document.getElementById('dark-mode')?.checked ? 'Enabled' : 'Disabled',
        'Language': document.getElementById('language-select')?.value === 'en' ? 'English' : 'Chinese'
      });
      showToast('✓ Accessibility settings saved', 'success');
    });
  }
  
  if (fontSlider) {
    fontSlider.addEventListener('input', (e) => {
      document.getElementById('font-size-value').textContent = e.target.value + 'px';
    });
  }
}

// Quick Actions
function viewUserOnMap(userId) {
  const user = mockUsers[userId];
  if (!user) return;
  
  showModal({
    title: `View ${user.name} on Map`,
    message: `Locating ${user.name} on live map...`,
    icon: '🗺️',
    type: 'info',
    buttons: [
      { text: 'Cancel', action: 'close', style: 'cancel' },
      { text: 'View Location', action: () => {
        switchSection('map');
        setTimeout(() => selectPinUser(userId), 300);
      }, style: 'confirm' }
    ],
    details: {
      'User': user.name,
      'Current Location': user.location,
      'Activity': user.activity,
      'Last Update': user.lastUpdate
    }
  });
}

function viewUserCamera(userId) {
  const user = mockUsers[userId];
  if (!user) return;
  
  showModal({
    title: `View ${user.name}'s Camera`,
    message: `Connect to ${user.name}'s live camera feed?`,
    icon: '📹',
    type: 'info',
    buttons: [
      { text: 'Cancel', action: 'close', style: 'cancel' },
      { text: 'Connect', action: () => {
        switchSection('camera');
        setTimeout(() => selectCameraUser(userId), 300);
      }, style: 'confirm' }
    ],
    details: {
      'User': user.name,
      'Camera Status': 'Available',
      'Quality': 'HD 1080p',
      'Battery': `${user.battery}%`
    }
  });
}

function messageUser(userId) {
  const user = mockUsers[userId];
  if (!user) return;
  
  showModal({
    title: `Send Message to ${user.name}`,
    message: '',
    type: 'info',
    buttons: [
      { text: 'Cancel', action: 'close', style: 'cancel' },
      { text: 'Open Messages', action: () => {
        switchSection('messages');
        setTimeout(() => selectConversation(userId), 300);
      }, style: 'confirm' }
    ],
    details: {
      'User': user.name,
      'Status': user.status === 'online' ? '🟢 Online' : '🟡 Warning',
      'Location': user.location,
      'Battery': `${user.battery}%`
    }
  });
}

function emergencyCall(userId) {
  const user = mockUsers[userId];
  showConfirmModal(
    `Initiate emergency call to ${user.name}?`,
    () => {
      showSuccessModal(`Emergency call initiated to ${user.name}`);
      showToast(`📞 Calling ${user.name}...`, 'error');
    },
    {
      'User': user.name,
      'Location': user.location,
      'Status': user.status,
      'Battery': `${user.battery}%`
    }
  );
}

  // User selection in sidebar
  document.querySelectorAll('.user-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const userId = parseInt(e.currentTarget.dataset.userId);
      selectUser(userId);
    });
  });
  
  // Send message
  const sendBtn = document.getElementById('send-message-btn');
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }
  
  const messageInput = document.getElementById('message-input');
  if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
  
  // Preset messages
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const message = e.target.textContent;
      sendPresetMessage(message);
    });
  });
  
  // Alert dismiss and actions
  document.querySelectorAll('.alert-dismiss-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const alertCard = e.target.closest('.alert-card');
      alertCard.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => alertCard.remove(), 300);
      showToast('✓ Alert dismissed', 'info');
    });
  });
  
  document.querySelectorAll('.alert-respond-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const userId = parseInt(e.target.closest('.alert-card').dataset.userId);
      selectUser(userId);
      switchTab('monitoring');
      showToast('🚨 Responding to emergency...', 'error');
    });
  });
  
  document.querySelectorAll('.alert-location-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const userId = parseInt(e.target.closest('.alert-card').dataset.userId);
      selectUser(userId);
      switchTab('monitoring');
      showToast('📍 Viewing location on map', 'info');
    });
  });
  
  document.querySelectorAll('.alert-notify-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      showToast('📧 Notification sent to user', 'success');
    });
  });
  
  document.querySelectorAll('.alert-renew-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchTab('subscriptions');
      showToast('📋 Opening subscription renewal', 'info');
    });
  });
  
  const clearAlertsBtn = document.getElementById('clear-alerts-btn');
  if (clearAlertsBtn) {
    clearAlertsBtn.addEventListener('click', () => {
      const alertsList = document.getElementById('alerts-list');
      if (alertsList) {
        alertsList.innerHTML = '<p style="text-align: center; color: #4B5563; padding: 40px;">No active alerts</p>';
        showToast('✓ All alerts cleared', 'success');
      }
    });
  }
  
  // Snapshot button
  const snapshotBtn = document.getElementById('snapshot-btn');
  if (snapshotBtn) {
    snapshotBtn.addEventListener('click', () => {
      showToast('Snapshot saved successfully', 'success');
    });
  }
  
  // Export report
  const exportBtn = document.getElementById('export-report-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      showToast('📊 Generating report...', 'info');
      setTimeout(() => {
        showToast('✓ Report exported successfully', 'success');
      }, 1000);
    });
  }
  
  // Subscription renewal buttons
  document.querySelectorAll('.subscription-table .btn-icon[aria-label="Renew subscription"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const row = e.target.closest('tr');
      const userName = row.querySelector('.user-cell span').textContent;
      const user = Object.values(mockUsers).find(u => u.name === userName);
      if (user) {
        handleSubscriptionRenewal(user.id);
      }
    });
  });
  
  // Subscription view details buttons
  document.querySelectorAll('.subscription-table .btn-icon[aria-label="View details"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const row = e.target.closest('tr');
      const userName = row.querySelector('.user-cell span').textContent;
      const user = Object.values(mockUsers).find(u => u.name === userName);
      if (user) {
        selectUser(user.id);
        showToast(`📊 Viewing details for ${user.name}`, 'info');
      }
    });
  });
  
  // View toggle buttons for monitoring
  document.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchMonitoringView(e.target.dataset.view);
    });
  });
  
  // Camera user selection
  document.querySelectorAll('.camera-user-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const userId = parseInt(e.currentTarget.dataset.cameraUser);
      selectUser(userId);
    });
  });
  
  // Map pin clicks
  document.querySelectorAll('.map-pin').forEach(pin => {
    pin.addEventListener('click', (e) => {
      const userName = e.currentTarget.dataset.user;
      const user = Object.values(mockUsers).find(u => u.name === userName);
      if (user) {
        selectUser(user.id);
      }
    });
  });
  
  // Map zoom controls
  const mapControls = document.querySelectorAll('.map-controls .btn-icon');
  mapControls.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      if (index === 0) handleMapZoom('in');
      else if (index === 1) handleMapZoom('out');
      else if (index === 2) handleMapCenter();
    });
  });
  
  // Camera controls
  const zoomSlider = document.getElementById('zoom-slider');
  if (zoomSlider) {
    zoomSlider.addEventListener('input', (e) => {
      const zoomValue = document.getElementById('zoom-value');
      if (zoomValue) {
        zoomValue.textContent = parseFloat(e.target.value).toFixed(1) + 'x';
      }
    });
  }
  
  const nightModeToggle = document.getElementById('night-mode-toggle');
  if (nightModeToggle) {
    nightModeToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        showToast('Night mode enabled', 'info');
      } else {
        showToast('Night mode disabled', 'info');
      }
    });
  }
  
  const takeSnapshotBtn = document.getElementById('take-snapshot');
  if (takeSnapshotBtn) {
    takeSnapshotBtn.addEventListener('click', () => {
      showToast('📸 Snapshot captured', 'success');
    });
  }
  
  const toggleRecordBtn = document.getElementById('toggle-record');
  if (toggleRecordBtn) {
    let isRecording = false;
    toggleRecordBtn.addEventListener('click', () => {
      isRecording = !isRecording;
      if (isRecording) {
        toggleRecordBtn.textContent = '⏹️ Stop Recording';
        showToast('🎥 Recording started', 'success');
      } else {
        toggleRecordBtn.textContent = '⏺️ Record';
        showToast('⏹️ Recording stopped', 'info');
      }
    });
  }
  
  const fullscreenBtn = document.getElementById('fullscreen-toggle');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      const cameraFeed = document.querySelector('.camera-feed-large');
      if (cameraFeed) {
        if (!document.fullscreenElement) {
          cameraFeed.requestFullscreen().catch(err => {
            showToast('⛶ Fullscreen mode activated', 'info');
          });
        } else {
          document.exitFullscreen();
        }
      }
    });
  }
  
  // Quality select
  const qualitySelect = document.getElementById('quality-select');
  if (qualitySelect) {
    qualitySelect.addEventListener('change', (e) => {
      showToast(`📹 Quality changed to ${e.target.value}`, 'info');
    });
  }
}

// Switch Tab
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Select User
function selectUser(userId) {
  appState.selectedUserId = userId;
  
  // Update UI
  document.querySelectorAll('.user-item').forEach(item => {
    item.classList.remove('active');
  });
  const selectedItem = document.querySelector(`[data-user-id="${userId}"]`);
  if (selectedItem) {
    selectedItem.classList.add('active');
  }
  
  // Update selected user info
  const user = mockUsers[userId];
  if (user) {
    const subtitleEl = document.querySelector('.info-panel .panel-subtitle');
    if (subtitleEl) {
      subtitleEl.textContent = `Selected User: ${user.name}`;
    }
    
    const infoRows = document.querySelectorAll('.info-row');
    if (infoRows.length >= 2) {
      infoRows[0].querySelector('.value').textContent = user.location;
      infoRows[1].querySelector('.value').textContent = user.activity;
    }
    
    // Update battery display
    updateBatteryDisplay(user);
    
    // Focus map on user
    focusMapOnUser(userId);
    
    // Switch camera to user
    switchCameraToUser(userId);
  }
  
  showToast(`✓ Switched to ${user.name}`, 'success');
}

// Update Battery Display
function updateBatteryDisplay(user) {
  const batteryEls = document.querySelectorAll('.battery-indicator');
  batteryEls.forEach(el => {
    const levelSpan = el.querySelector('.battery-level');
    if (levelSpan && el.closest(`[data-user-id="${user.id}"]`)) {
      levelSpan.textContent = `${user.battery}%`;
      el.classList.remove('low', 'medium');
      if (user.battery < 20) {
        el.classList.add('low');
      } else if (user.battery < 50) {
        el.classList.add('medium');
      }
    }
  });
}

// Focus Map on User
function focusMapOnUser(userId) {
  const user = mockUsers[userId];
  if (!user) return;
  
  const mapPins = document.querySelectorAll('.map-pin');
  mapPins.forEach(pin => {
    const pinUser = pin.dataset.user;
    if (pinUser === user.name) {
      // Highlight selected pin
      pin.style.transform = 'scale(1.2)';
      pin.style.zIndex = '100';
      setTimeout(() => {
        pin.style.transform = 'scale(1)';
      }, 500);
    } else {
      pin.style.zIndex = '1';
    }
  });
}

// Switch Camera to User
function switchCameraToUser(userId) {
  const user = mockUsers[userId];
  if (!user) return;
  
  // Update camera user cards
  const cameraCards = document.querySelectorAll('.camera-user-card');
  cameraCards.forEach(card => {
    const cardUserId = parseInt(card.dataset.cameraUser);
    card.classList.toggle('active', cardUserId === userId);
  });
}

// Handle SOS
function handleSOS() {
  showConfirmModal(
    'Activate Emergency SOS?',
    () => {
      showErrorModal('🚨 EMERGENCY SOS ACTIVATED!', {
        'Status': 'Notifying all carers',
        'Emergency Services': 'Contacting...',
        'Location': 'Broadcasting',
        'Time': new Date().toLocaleTimeString()
      });
      showToast('🚨 EMERGENCY SOS ACTIVATED!', 'error');
      
      setTimeout(() => {
        showSuccessModal('Emergency services contacted successfully', {
          'Response Time': '2 minutes',
          'Nearest Unit': 'Central Station',
          'ETA': '5-7 minutes'
        });
      }, 2000);
    },
    {
      'Alert Type': 'Emergency SOS',
      'Notification': 'All carers + Emergency services',
      'Location': 'Will be shared'
    }
  );
}

// Handle Voice Activation
function handleVoiceActivation() {
  const transcriptEl = document.getElementById('voice-transcript-text');
  
  showModal({
    title: 'Voice Assistant',
    message: '🎤 Listening... Speak your command',
    icon: '🎤',
    type: 'info',
    buttons: [{ text: 'Cancel', action: 'close', style: 'cancel' }]
  });
  
  showToast('Voice assistant activated. Listening...', 'info');
  
  // Simulate voice recognition
  setTimeout(() => {
    closeModal();
    transcriptEl.textContent = 'You said: "Where is the nearest accessible route?"';
    showSuccessModal('Voice command received!', {
      'Command': 'Where is the nearest accessible route?',
      'Confidence': '95%',
      'Action': 'Finding routes...'
    });
  }, 2000);
}

// Handle Voice Command
function handleVoiceCommand(command) {
  const transcriptEl = document.getElementById('voice-transcript-text');
  transcriptEl.textContent = `Recent: "${command}"`;
  
  if (command.includes('Where am I')) {
    showToast(`You are at ${mockUsers[1].location}`, 'info');
  } else if (command.includes('Call carer')) {
    showToast('Calling your carer...', 'info');
  } else if (command.includes('Route help')) {
    showToast('Finding accessible routes nearby...', 'info');
  }
}

// Handle Wellness Check
function handleWellnessCheck(status) {
  const icons = {
    'Good': '😊',
    'Okay': '😐',
    'Need Help': '😟'
  };
  
  const colors = {
    'Good': 'success',
    'Okay': 'info',
    'Need Help': 'warning'
  };
  
  if (status === 'Need Help') {
    showWarningModal(
      'You indicated you need help. Your carer will be notified immediately.',
      () => {
        showSuccessModal('Carer notified successfully!', {
          'Status': status,
          'Carer': 'Mary Johnson',
          'Notification': 'Sent',
          'Time': new Date().toLocaleTimeString()
        });
      }
    );
  } else {
    showModal({
      title: 'Wellness Check',
      message: `Thank you for checking in!`,
      icon: icons[status],
      type: colors[status],
      buttons: [{ text: 'OK', action: 'close', style: 'confirm' }],
      details: {
        'Status': status,
        'Recorded': new Date().toLocaleString(),
        'Next Check': 'In 4 hours'
      }
    });
  }
  
  showToast(`Wellness status recorded: ${status}`, 'success');
}

// Handle AI Identification
function handleIdentification() {
  showToast('📸 Opening camera... Point at an object', 'info');
  
  // Simulate camera activation and AI processing
  setTimeout(() => {
    showToast('🤖 Analyzing object...', 'info');
  }, 1000);
  
  setTimeout(() => {
    // Random identification from mock data
    const identification = mockIdentifications[Math.floor(Math.random() * mockIdentifications.length)];
    displayIdentificationResult(identification);
    
    // Add to history
    addToIdentificationHistory(identification);
    
    // Speak the result (simulated)
    showToast('🔊 ' + identification.description, 'success');
  }, 3000);
}

// Display Identification Result
function displayIdentificationResult(identification) {
  const resultDiv = document.getElementById('identification-result');
  const resultImage = document.getElementById('result-image');
  const resultText = document.getElementById('result-text');
  const resultConfidence = document.getElementById('result-confidence');
  
  if (resultDiv && resultImage && resultText && resultConfidence) {
    resultImage.textContent = identification.icon;
    resultText.textContent = identification.description;
    resultConfidence.textContent = `Confidence: ${identification.confidence}%`;
    resultDiv.style.display = 'block';
    
    // Scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Add to Identification History
function addToIdentificationHistory(identification) {
  identificationHistory.unshift({
    ...identification,
    time: 'Just now'
  });
  
  // Keep only last 5
  if (identificationHistory.length > 5) {
    identificationHistory.pop();
  }
  
  updateIdentificationHistoryUI();
}

// Update Identification History UI
function updateIdentificationHistoryUI() {
  const historyList = document.getElementById('history-list');
  if (!historyList) return;
  
  historyList.innerHTML = identificationHistory.map(item => `
    <div class="history-item">
      <span class="history-icon">${item.icon}</span>
      <span class="history-text">${item.item}</span>
      <span class="history-time">${item.time}</span>
    </div>
  `).join('');
}

// Switch Monitoring View
function switchMonitoringView(viewName) {
  // Update buttons
  document.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
  
  // Update views
  document.querySelectorAll('.monitoring-view').forEach(view => {
    view.classList.remove('active');
  });
  document.getElementById(`${viewName}-view`).classList.add('active');
  
  showToast(`Switched to ${viewName.charAt(0).toUpperCase() + viewName.slice(1)} View`, 'info');
}

// Handle Map Zoom
let mapZoomLevel = 1;
function handleMapZoom(direction) {
  if (direction === 'in') {
    mapZoomLevel = Math.min(3, mapZoomLevel + 0.2);
    showToast('🔍 Zoomed in', 'info');
  } else if (direction === 'out') {
    mapZoomLevel = Math.max(0.5, mapZoomLevel - 0.2);
    showToast('🔍 Zoomed out', 'info');
  }
  
  const mapPlaceholders = document.querySelectorAll('.map-placeholder');
  mapPlaceholders.forEach(map => {
    map.style.transform = `scale(${mapZoomLevel})`;
    map.style.transition = 'transform 0.3s ease';
  });
}

// Handle Map Center
function handleMapCenter() {
  mapZoomLevel = 1;
  const mapPlaceholders = document.querySelectorAll('.map-placeholder');
  mapPlaceholders.forEach(map => {
    map.style.transform = 'scale(1)';
  });
  showToast('🎯 Map centered', 'info');
}

// Enable Map Dragging
function enableMapDragging() {
  const maps = document.querySelectorAll('.map-placeholder');
  
  maps.forEach(map => {
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;
    
    map.style.cursor = 'grab';
    map.style.overflow = 'hidden';
    
    map.addEventListener('mousedown', (e) => {
      if (e.target.closest('.map-pin')) return;
      isDragging = true;
      map.style.cursor = 'grabbing';
      startX = e.pageX - map.offsetLeft;
      startY = e.pageY - map.offsetTop;
      scrollLeft = map.scrollLeft;
      scrollTop = map.scrollTop;
    });
    
    map.addEventListener('mouseleave', () => {
      isDragging = false;
      map.style.cursor = 'grab';
    });
    
    map.addEventListener('mouseup', () => {
      isDragging = false;
      map.style.cursor = 'grab';
    });
    
    map.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - map.offsetLeft;
      const y = e.pageY - map.offsetTop;
      const walkX = (x - startX) * 1.5;
      const walkY = (y - startY) * 1.5;
      
      const pins = map.querySelectorAll('.map-pin');
      pins.forEach(pin => {
        const currentLeft = parseFloat(pin.style.left) || 35;
        const currentTop = parseFloat(pin.style.top) || 40;
        pin.style.left = `${currentLeft - walkX * 0.01}%`;
        pin.style.top = `${currentTop - walkY * 0.01}%`;
      });
    });
  });
}

// Send Message
function sendMessage() {
  const input = document.getElementById('message-input');
  const message = input.value.trim();
  
  if (message) {
    const messageList = document.getElementById('message-list');
    const messageHtml = `
      <div class="message-item sent">
        <div class="message-content">
          <div class="message-header">
            <span class="message-sender">You</span>
            <span class="message-time">${getCurrentTime()}</span>
          </div>
          <p class="message-text">${message}</p>
        </div>
      </div>
    `;
    
    messageList.insertAdjacentHTML('beforeend', messageHtml);
    messageList.scrollTop = messageList.scrollHeight;
    input.value = '';
    
    showToast('Message sent', 'success');
  }
}

// Send Preset Message
function sendPresetMessage(message) {
  const messageList = document.getElementById('message-list');
  const messageHtml = `
    <div class="message-item sent">
      <div class="message-content">
        <div class="message-header">
          <span class="message-sender">You</span>
          <span class="message-time">${getCurrentTime()}</span>
        </div>
        <p class="message-text">${message}</p>
      </div>
    </div>
  `;
  
  messageList.insertAdjacentHTML('beforeend', messageHtml);
  messageList.scrollTop = messageList.scrollHeight;
  
  showToast('Quick message sent', 'success');
}

// Get Current Time
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Update Camera Timestamp
function updateCameraTimestamp() {
  const cameraTimestamp = document.getElementById('camera-timestamp');
  if (cameraTimestamp) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    cameraTimestamp.textContent = `${hours}:${minutes}:${seconds}`;
  }
}

// Start Real-Time Updates
function startRealTimeUpdates() {
  // Simulate battery drain
  appState.cameraUpdateInterval = setInterval(() => {
    Object.values(mockUsers).forEach(user => {
      if (Math.random() > 0.9) {
        user.battery = Math.max(15, user.battery - 1);
      }
    });
    
    // Re-render affected components
    if (document.getElementById('user-cards-grid')) {
      renderUserCards();
    }
    if (document.getElementById('users-table-body')) {
      renderUsersTable();
    }
  }, 10000);
  
  
  // Simulate location updates
  appState.mapUpdateInterval = setInterval(() => {
    document.querySelectorAll('.map-user-pin').forEach(pin => {
      const currentTop = parseFloat(pin.style.top) || 30;
      const currentLeft = parseFloat(pin.style.left) || 30;
      const newTop = currentTop + (Math.random() - 0.5) * 0.3;
      const newLeft = currentLeft + (Math.random() - 0.5) * 0.3;
      pin.style.top = `${Math.max(10, Math.min(90, newTop))}%`;
      pin.style.left = `${Math.max(10, Math.min(90, newLeft))}%`;
    });
  }, 8000);
}



// Handle Logout
function handleLogout() {
  showConfirmModal(
    'Are you sure you want to logout?',
    () => {
      // Clear intervals
      if (appState.cameraUpdateInterval) {
        clearInterval(appState.cameraUpdateInterval);
      }
      if (appState.mapUpdateInterval) {
        clearInterval(appState.mapUpdateInterval);
      }
      
      // Reset state
      appState.currentUser = null;
      appState.userType = null;
      activeConversation = null;
      selectedCameraUser = null;
      
      showSuccessModal('Logged out successfully');
      setTimeout(() => showScreen('login-screen'), 1000);
    },
    {
      'Current Session': 'Active',
      'Unsaved Changes': 'None',
      'Action': 'Return to login screen'
    }
  );
}

// Update Camera Timestamp
function updateCameraTimestamp() {
  const timestamp = document.getElementById('camera-live-timestamp');
  if (timestamp) {
    const now = new Date();
    timestamp.textContent = now.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  }
}

// Show Screen
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

// Modal System - All White Backgrounds
function showModal(options) {
  const {
    title = 'Notification',
    message = '',
    icon = '',
    type = 'info',
    buttons = [{ text: 'OK', action: 'close', style: 'primary' }],
    details = null
  } = options;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'active-modal-overlay';

  // Create modal
  const modal = document.createElement('div');
  modal.className = `modal ${type}`;

  // Modal header
  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = `
    <h3 class="modal-title">${title}</h3>
    <button class="modal-close" onclick="closeModal()" aria-label="Close">×</button>
  `;

  // Modal body
  const body = document.createElement('div');
  body.className = 'modal-body';
  
  let bodyContent = '';
  if (icon) {
    bodyContent += `<div class="modal-icon">${icon}</div>`;
  }
  if (message) {
    bodyContent += `<div class="modal-message">${message}</div>`;
  }
  if (details) {
    bodyContent += '<div class="modal-details">';
    Object.entries(details).forEach(([key, value]) => {
      bodyContent += `
        <div class="modal-detail-row">
          <span class="modal-detail-label">${key}:</span>
          <span class="modal-detail-value">${value}</span>
        </div>
      `;
    });
    bodyContent += '</div>';
  }
  body.innerHTML = bodyContent;

  // Modal footer
  const footer = document.createElement('div');
  footer.className = 'modal-footer';
  buttons.forEach((btn, index) => {
    const button = document.createElement('button');
    button.className = `modal-btn modal-btn-${btn.style || 'primary'}`;
    button.textContent = btn.text;
    button.onclick = () => {
      if (btn.action === 'close') {
        closeModal();
      } else if (typeof btn.action === 'function') {
        btn.action();
        closeModal();
      }
    };
    footer.appendChild(button);
  });

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close on Escape key
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

function closeModal() {
  const overlay = document.getElementById('active-modal-overlay');
  if (overlay) {
    overlay.style.animation = 'fadeOut 0.2s ease-out';
    setTimeout(() => overlay.remove(), 200);
  }
}

// Specific Modal Types
function showSuccessModal(message, details = null) {
  showModal({
    title: 'Success',
    message: message,
    icon: '✅',
    type: 'success',
    details: details,
    buttons: [{ text: 'OK', action: 'close', style: 'success' }]
  });
}

function showErrorModal(message, details = null) {
  showModal({
    title: 'Error',
    message: message,
    icon: '❌',
    type: 'error',
    details: details,
    buttons: [{ text: 'OK', action: 'close', style: 'danger' }]
  });
}

function showWarningModal(message, onProceed = null) {
  showModal({
    title: 'Warning',
    message: message,
    icon: '⚠️',
    type: 'warning',
    buttons: [
      { text: 'Cancel', action: 'close', style: 'cancel' },
      { text: 'Proceed', action: onProceed || (() => {}), style: 'confirm' }
    ]
  });
}

function showConfirmModal(message, onConfirm, details = null) {
  showModal({
    title: 'Confirm Action',
    message: message,
    icon: 'ℹ️',
    type: 'info',
    details: details,
    buttons: [
      { text: 'Cancel', action: 'close', style: 'cancel' },
      { text: 'Confirm', action: onConfirm, style: 'confirm' }
    ]
  });
}

// Show Toast Notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Add CSS animation for slideOut
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100px); }
  }
`;
document.head.appendChild(style);

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (appState.userType !== 'carer') return;
    
    // Only trigger if not typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key.toLowerCase()) {
      case 'm':
        switchTab('monitoring');
        showToast('Switched to Map View (M)', 'info');
        break;
      case 'c':
        switchTab('camera');
        showToast('Switched to Camera View (C)', 'info');
        break;
      case 'a':
        switchTab('alerts');
        showToast('Switched to Alerts (A)', 'info');
        break;
      case 's':
        if (e.shiftKey) {
          e.preventDefault();
          document.getElementById('carer-settings')?.click();
          showToast('Settings (Shift+S)', 'info');
        }
        break;
        case 'n':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          switchTab('communication');
          document.getElementById('message-input')?.focus();
          showToast('Compose Message (Ctrl+N)', 'info');
        }
        break;
      case '1':
        selectUser(1);
        break;
      case '2':
        selectUser(2);
        break;
      case '+':
      case '=':
        handleMapZoom('in');
        break;
      case '-':
      case '_':
        handleMapZoom('out');
        break;
    }
  });
}

// Subscription Management Functions
function handleSubscriptionRenewal(userId) {
  const user = mockUsers[userId];
  if (!user) return;
  
  showToast(`🔄 Processing renewal for ${user.name}...`, 'info');
  
  setTimeout(() => {
    showToast(`✓ Subscription renewed successfully for ${user.name}`, 'success');
    user.daysRemaining = 365;
    updateSubscriptionDisplay(userId);
  }, 1500);
}

function updateSubscriptionDisplay(userId) {
  const user = mockUsers[userId];
  if (!user) return;
  
  // Update subscription table if visible
  const rows = document.querySelectorAll('.subscription-table tbody tr');
  rows.forEach(row => {
    const userCell = row.querySelector('.user-cell span');
    if (userCell && userCell.textContent === user.name) {
      const daysCell = row.cells[2];
      const statusCell = row.querySelector('.status-badge');
      if (daysCell) daysCell.textContent = `${user.daysRemaining} days`;
      if (statusCell) {
        statusCell.textContent = 'Active';
        statusCell.className = 'status-badge success';
      }
    }
  });
}

// Keyboard Shortcuts (simplified for carer dashboard)
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (appState.userType !== 'carer') return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    
    switch(e.key) {
      case '1':
        switchSection('dashboard');
        break;
      case '2':
        switchSection('map');
        break;
      case '3':
        switchSection('camera');
        break;
      case '4':
        switchSection('messages');
        break;
      case '5':
        switchSection('alerts');
        break;
    }
  });
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init();
    setupKeyboardShortcuts();
  });
} else {
  init();
  setupKeyboardShortcuts();
}