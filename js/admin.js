/**
 * COLLEGE EVENT MANAGEMENT SYSTEM (CEMS)
 * admin.js - Admin Authentication, Dashboard Metrics, and Event/Registration CRUD Operations
 */

// Demo Admin Credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

const SESSION_KEY = 'cems_admin_logged_in';

document.addEventListener('DOMContentLoaded', () => {
  // Page 1: Admin Login
  if (document.getElementById('admin-login-form')) {
    initAdminLogin();
  }

  // Page 2: Admin Dashboard
  if (document.getElementById('admin-dashboard-app')) {
    protectAdminRoute();
    initAdminDashboard();
  }
});

// ==========================================================================
// 1. ADMIN AUTHENTICATION
// ==========================================================================

function initAdminLogin() {
  // Redirect to dashboard if already authenticated in this session
  if (sessionStorage.getItem(SESSION_KEY) === 'true') {
    window.location.href = 'admin-dashboard.html';
    return;
  }

  const form = document.getElementById('admin-login-form');
  const errorBox = document.getElementById('admin-login-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value.trim();

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      showToast('Welcome Admin', 'Login successful. Redirecting to dashboard...', 'success');
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 700);
    } else {
      if (errorBox) {
        errorBox.textContent = 'Invalid credentials. Please use the demo credentials provided.';
        errorBox.classList.add('visible');
      }
      showToast('Authentication Failed', 'Invalid username or password.', 'error');
    }
  });
}

function protectAdminRoute() {
  if (sessionStorage.getItem(SESSION_KEY) !== 'true') {
    window.location.href = 'admin-login.html';
  }
}

function handleAdminLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  showToast('Logged Out', 'You have been logged out of the admin panel.', 'info');
  setTimeout(() => {
    window.location.href = 'admin-login.html';
  }, 500);
}

// ==========================================================================
// 2. ADMIN DASHBOARD CONTROLLER
// ==========================================================================

let editingEventId = null;

function initAdminDashboard() {
  setupSidebarNavigation();
  setupTopbarAndModals();
  refreshDashboardData();

  // Mobile menu toggle
  const menuToggle = document.getElementById('admin-menu-toggle');
  const sidebar = document.querySelector('.admin-sidebar');
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

function setupSidebarNavigation() {
  const navItems = document.querySelectorAll('.admin-nav-item[data-panel]');
  const panels = document.querySelectorAll('.admin-panel');
  const pageTitle = document.getElementById('admin-page-title');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetPanel = item.getAttribute('data-panel');

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      panels.forEach(p => {
        p.classList.toggle('active', p.id === `panel-${targetPanel}`);
      });

      // Update Topbar Title
      const titles = {
        'overview': 'Dashboard Overview',
        'events': 'Manage College Events',
        'registrations': 'Student Registrations',
        'settings': 'Viva Demo & System Settings'
      };
      if (pageTitle) pageTitle.textContent = titles[targetPanel] || 'Admin Dashboard';

      // Auto close mobile sidebar
      const sidebar = document.querySelector('.admin-sidebar');
      if (sidebar) sidebar.classList.remove('open');
    });
  });

  // Logout button
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleAdminLogout();
    });
  }
}

function setupTopbarAndModals() {
  // New Event Form Submit
  const eventForm = document.getElementById('event-editor-form');
  if (eventForm) {
    eventForm.addEventListener('submit', handleSaveEvent);
  }

  // Registration search input
  const regSearchInput = document.getElementById('admin-reg-search');
  if (regSearchInput) {
    regSearchInput.addEventListener('input', () => {
      renderAdminRegistrationsTable();
    });
  }
}

function refreshDashboardData() {
  renderOverviewStats();
  renderAdminEventsTable();
  renderAdminRegistrationsTable();
}

/**
 * Render Overview Metric Cards and Recent Registrations
 */
function renderOverviewStats() {
  const stats = getDashboardStats();

  const totalEventsEl = document.getElementById('stat-total-events');
  const totalRegsEl = document.getElementById('stat-total-registrations');
  const upcomingEventsEl = document.getElementById('stat-upcoming-events');
  const pastEventsEl = document.getElementById('stat-past-events');

  if (totalEventsEl) totalEventsEl.textContent = stats.totalEvents;
  if (totalRegsEl) totalRegsEl.textContent = stats.totalRegistrations;
  if (upcomingEventsEl) upcomingEventsEl.textContent = stats.upcomingEvents;
  if (pastEventsEl) pastEventsEl.textContent = stats.pastEvents;

  // Recent registrations table in Overview
  const recentTableBody = document.getElementById('recent-registrations-tbody');
  if (recentTableBody) {
    const events = getAllEvents();
    if (stats.recentRegistrations.length === 0) {
      recentTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">
            No student registrations found yet.
          </td>
        </tr>
      `;
    } else {
      recentTableBody.innerHTML = stats.recentRegistrations.map(reg => {
        const event = events.find(e => e.id === reg.eventId) || { title: 'Unknown Event' };
        return `
          <tr>
            <td><strong>${escapeHTML(reg.studentName)}</strong></td>
            <td>${escapeHTML(reg.email)}</td>
            <td>${escapeHTML(event.title)}</td>
            <td><span class="badge badge-success">${escapeHTML(reg.status)}</span></td>
            <td>${new Date(reg.registeredAt).toLocaleDateString()}</td>
          </tr>
        `;
      }).join('');
    }
  }
}

/**
 * Render Events Table in Manage Events Panel
 */
function renderAdminEventsTable() {
  const tbody = document.getElementById('admin-events-tbody');
  if (!tbody) return;

  const events = getAllEvents();

  if (events.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem;">
          No events created yet. Click "Add New Event" to create one.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = events.map(evt => {
    const regCount = getRegisteredCount(evt.id);
    const isPast = isEventPast(evt.date);

    return `
      <tr>
        <td>
          <div class="table-event-preview">
            <img src="${escapeHTML(evt.imageUrl)}" alt="${escapeHTML(evt.title)}" class="table-event-thumb" onerror="this.onerror=null; this.src='assets/images/event-placeholder.svg';">
            <div>
              <div style="font-weight: 700; color: var(--text-main);">${escapeHTML(evt.title)}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">${evt.id}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge badge-general">${escapeHTML(evt.category)}</span>
        </td>
        <td>
          <div>${formatDisplayDate(evt.date)}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHTML(evt.time)}</div>
        </td>
        <td>${escapeHTML(evt.venue)}</td>
        <td>
          <strong>${regCount}</strong> / ${evt.maxParticipants}
          ${isPast ? '<span class="badge badge-past" style="margin-left: 4px;">Past</span>' : ''}
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn-secondary btn-sm" onclick="openEditEventModal('${evt.id}')" title="Edit Event">
              ✏️ Edit
            </button>
            <button class="btn btn-danger btn-sm" onclick="handleDeleteEvent('${evt.id}')" title="Delete Event">
              🗑️ Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Render Student Registrations Table in Registrations Panel
 */
function renderAdminRegistrationsTable() {
  const tbody = document.getElementById('admin-registrations-tbody');
  const countBadge = document.getElementById('admin-reg-count-badge');
  if (!tbody) return;

  let registrations = getAllRegistrations();
  const events = getAllEvents();

  // Search filter
  const searchInput = document.getElementById('admin-reg-search');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  if (query) {
    registrations = registrations.filter(r => {
      const event = events.find(e => e.id === r.eventId);
      const eventTitle = event ? event.title.toLowerCase() : '';
      return (
        r.studentName.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query) ||
        r.phone.includes(query) ||
        r.rollNumber.toLowerCase().includes(query) ||
        eventTitle.includes(query)
      );
    });
  }

  if (countBadge) {
    countBadge.textContent = `${registrations.length} record${registrations.length === 1 ? '' : 's'}`;
  }

  if (registrations.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 3rem;">
          No matching student registrations found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = registrations.map(reg => {
    const event = events.find(e => e.id === reg.eventId) || { title: 'Unknown Event' };

    return `
      <tr>
        <td style="font-family: var(--font-mono); font-size: 0.8rem;">${reg.id}</td>
        <td>
          <strong>${escapeHTML(reg.studentName)}</strong>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Roll: ${escapeHTML(reg.rollNumber)}</div>
        </td>
        <td>${escapeHTML(reg.email)}</td>
        <td>${escapeHTML(reg.phone)}</td>
        <td>
          <a href="event-details.html?id=${reg.eventId}" target="_blank" style="color: var(--primary); font-weight: 500;">
            ${escapeHTML(event.title)}
          </a>
        </td>
        <td>${new Date(reg.registeredAt).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="handleDeleteRegistration('${reg.id}')" title="Delete Registration">
            🗑️ Delete
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================================================
// 3. EVENT CRUD OPERATIONS
// ==========================================================================

window.openAddEventModal = function() {
  editingEventId = null;
  const modalTitle = document.getElementById('event-modal-title');
  const form = document.getElementById('event-editor-form');

  if (modalTitle) modalTitle.textContent = 'Add New Event';
  if (form) form.reset();

  // Set default future date (e.g. 7 days from today)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  const dateInput = document.getElementById('event-date');
  if (dateInput) dateInput.value = futureDate.toISOString().split('T')[0];

  openModal('event-editor-modal');
};

window.openEditEventModal = function(id) {
  const event = getEventById(id);
  if (!event) {
    showToast('Error', 'Event not found.', 'error');
    return;
  }

  editingEventId = id;
  const modalTitle = document.getElementById('event-modal-title');
  if (modalTitle) modalTitle.textContent = 'Edit Event Details';

  document.getElementById('event-title').value = event.title;
  document.getElementById('event-category').value = event.category;
  document.getElementById('event-date').value = event.date;
  document.getElementById('event-time').value = event.time;
  document.getElementById('event-venue').value = event.venue;
  document.getElementById('event-max-participants').value = event.maxParticipants;
  document.getElementById('event-image-url').value = event.imageUrl || '';
  document.getElementById('event-organizer').value = event.organizer || '';
  document.getElementById('event-description').value = event.description;

  openModal('event-editor-modal');
};

function handleSaveEvent(e) {
  e.preventDefault();

  const title = document.getElementById('event-title').value.trim();
  const category = document.getElementById('event-category').value;
  const date = document.getElementById('event-date').value;
  const time = document.getElementById('event-time').value.trim();
  const venue = document.getElementById('event-venue').value.trim();
  const maxParticipants = parseInt(document.getElementById('event-max-participants').value, 10);
  const imageUrl = document.getElementById('event-image-url').value.trim();
  const organizer = document.getElementById('event-organizer').value.trim();
  const description = document.getElementById('event-description').value.trim();

  // Validation
  if (!title || !date || !time || !venue || !description || isNaN(maxParticipants)) {
    showToast('Validation Error', 'Please complete all required fields properly.', 'error');
    return;
  }

  const eventPayload = {
    title,
    category,
    date,
    time,
    venue,
    maxParticipants,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    organizer: organizer || 'College Event Committee',
    description
  };

  if (editingEventId) {
    // Update existing event
    updateEvent(editingEventId, eventPayload);
    showToast('Event Updated', `"${title}" has been successfully updated.`, 'success');
  } else {
    // Add new event
    addEvent(eventPayload);
    showToast('Event Created', `"${title}" has been added to the system.`, 'success');
  }

  closeModal('event-editor-modal');
  refreshDashboardData();
}

window.handleDeleteEvent = function(id) {
  const event = getEventById(id);
  if (!event) return;

  const regCount = getRegisteredCount(id);
  let warningMessage = `Are you sure you want to delete "${event.title}"?`;
  if (regCount > 0) {
    warningMessage += `\n\nWarning: There are ${regCount} student registration(s) linked to this event. Deleting it will also remove these registrations!`;
  }

  if (confirm(warningMessage)) {
    const success = deleteEvent(id);
    if (success) {
      showToast('Event Deleted', `"${event.title}" was removed.`, 'info');
      refreshDashboardData();
    } else {
      showToast('Error', 'Failed to delete event.', 'error');
    }
  }
};

window.handleDeleteRegistration = function(regId) {
  if (confirm('Are you sure you want to delete this student registration record?')) {
    const success = deleteRegistration(regId);
    if (success) {
      showToast('Registration Removed', 'The student registration has been deleted.', 'info');
      refreshDashboardData();
    } else {
      showToast('Error', 'Failed to delete registration.', 'error');
    }
  }
};

// Reset demo data for Viva presentation
window.handleResetDemoData = function() {
  if (confirm('Reset all events and registrations back to initial sample state? This will clear any manual additions and restore the original 6 events and 3 registrations.')) {
    resetStorageToDefault();
    showToast('System Reset', 'Demo sample data has been restored!', 'success');
    refreshDashboardData();
  }
};
