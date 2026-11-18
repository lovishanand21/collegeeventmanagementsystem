/**
 * COLLEGE EVENT MANAGEMENT SYSTEM (CEMS)
 * admin.js - Admin Authentication, Dashboard Metrics, and Event/Registration CRUD Operations
 */

// Demo Admin Credentials (Frontend Demonstration)
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
    window.location.replace('admin-dashboard.html');
    return;
  }

  const form = document.getElementById('admin-login-form');
  const errorBox = document.getElementById('admin-login-error');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('admin-username');
      const passwordInput = document.getElementById('admin-password');

      const username = usernameInput ? usernameInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value.trim() : '';

      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        showToast('Welcome Admin', 'Login successful. Redirecting to dashboard...', 'success');
        setTimeout(() => {
          window.location.replace('admin-dashboard.html');
        }, 500);
      } else {
        if (errorBox) {
          errorBox.textContent = 'Invalid credentials. Please use the demonstration credentials (admin / admin123).';
          errorBox.classList.add('visible');
        }
        showToast('Authentication Failed', 'Invalid username or password.', 'error');
      }
    });
  }
}

function protectAdminRoute() {
  if (sessionStorage.getItem(SESSION_KEY) !== 'true') {
    window.location.replace('admin-login.html');
  }
}

function handleAdminLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  showToast('Logged Out', 'You have been logged out of the admin panel.', 'info');
  setTimeout(() => {
    window.location.replace('admin-login.html');
  }, 400);
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
  const closeSidebarBtn = document.getElementById('admin-sidebar-close');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });

    if (closeSidebarBtn) {
      closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
      });
    }

    // Close when clicking outside of the sidebar on mobile
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      }
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
        const event = events.find(e => e.id === reg.eventId) || { title: 'Archived Event' };
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
    const isPast = isEventPast(evt);

    return `
      <tr>
        <td>
          <div class="table-event-preview">
            <img src="${escapeHTML(evt.imageUrl)}" alt="${escapeHTML(evt.title)}" class="table-event-thumb" onerror="this.onerror=null; this.src='assets/images/event-placeholder.svg';">
            <div>
              <div style="font-weight: 700; color: var(--text-main);">${escapeHTML(evt.title)}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">${escapeHTML(evt.id)}</div>
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
          <strong>${regCount}</strong> / ${escapeHTML(evt.maxParticipants)}
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
      const eventTitle = event && event.title ? event.title.toLowerCase() : '';
      return (
        (r.studentName && r.studentName.toLowerCase().includes(query)) ||
        (r.email && r.email.toLowerCase().includes(query)) ||
        (r.phone && r.phone.includes(query)) ||
        (r.rollNumber && r.rollNumber.toLowerCase().includes(query)) ||
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
    const event = events.find(e => e.id === reg.eventId) || { title: 'Archived Event' };

    return `
      <tr>
        <td style="font-family: var(--font-mono); font-size: 0.8rem;">${escapeHTML(reg.id)}</td>
        <td>
          <strong>${escapeHTML(reg.studentName)}</strong>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Roll: ${escapeHTML(reg.rollNumber)}</div>
        </td>
        <td>${escapeHTML(reg.email)}</td>
        <td>${escapeHTML(reg.phone)}</td>
        <td>
          <a href="event-details.html?id=${encodeURIComponent(reg.eventId)}" target="_blank" style="color: var(--primary); font-weight: 500;">
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
  if (dateInput) {
    const y = futureDate.getFullYear();
    const m = String(futureDate.getMonth() + 1).padStart(2, '0');
    const d = String(futureDate.getDate()).padStart(2, '0');
    dateInput.value = `${y}-${m}-${d}`;
  }

  const timeInput = document.getElementById('event-time');
  if (timeInput) timeInput.value = '10:00 AM';

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

  const titleInput = document.getElementById('event-title');
  const catInput = document.getElementById('event-category');
  const dateInput = document.getElementById('event-date');
  const timeInput = document.getElementById('event-time');
  const venueInput = document.getElementById('event-venue');
  const maxInput = document.getElementById('event-max-participants');
  const imgInput = document.getElementById('event-image-url');
  const orgInput = document.getElementById('event-organizer');
  const descInput = document.getElementById('event-description');

  if (titleInput) titleInput.value = event.title || '';
  if (catInput) catInput.value = event.category || 'General';
  if (dateInput) dateInput.value = event.date || '';
  if (timeInput) timeInput.value = event.time || '10:00 AM';
  if (venueInput) venueInput.value = event.venue || '';
  if (maxInput) maxInput.value = event.maxParticipants || 50;
  if (imgInput) imgInput.value = event.imageUrl || '';
  if (orgInput) orgInput.value = event.organizer || '';
  if (descInput) descInput.value = event.description || '';

  openModal('event-editor-modal');
};

function handleSaveEvent(e) {
  e.preventDefault();

  const titleInput = document.getElementById('event-title');
  const catInput = document.getElementById('event-category');
  const dateInput = document.getElementById('event-date');
  const timeInput = document.getElementById('event-time');
  const venueInput = document.getElementById('event-venue');
  const maxInput = document.getElementById('event-max-participants');
  const imgInput = document.getElementById('event-image-url');
  const orgInput = document.getElementById('event-organizer');
  const descInput = document.getElementById('event-description');

  const title = titleInput ? titleInput.value.trim() : '';
  const category = catInput ? catInput.value : 'General';
  const date = dateInput ? dateInput.value.trim() : '';
  const time = timeInput ? timeInput.value.trim() : '';
  const venue = venueInput ? venueInput.value.trim() : '';
  const maxParticipants = maxInput ? parseInt(maxInput.value, 10) : 50;
  const imageUrl = imgInput ? imgInput.value.trim() : '';
  const organizer = orgInput ? orgInput.value.trim() : 'College Event Committee';
  const description = descInput ? descInput.value.trim() : '';

  // Validation
  if (!title || !date || !time || !venue || !description || isNaN(maxParticipants) || maxParticipants <= 0) {
    showToast('Validation Error', 'Please complete all required fields properly with valid values.', 'error');
    return;
  }

  // Validate date & time format
  const parsedDateTime = parseEventDateTime(date, time);
  if (!parsedDateTime || isNaN(parsedDateTime.getTime())) {
    showToast('Invalid Time Format', 'Please enter time in a valid format such as "10:00 AM", "05:30 PM", or "14:30".', 'error');
    return;
  }

  const eventPayload = {
    title,
    category,
    date,
    time,
    venue,
    maxParticipants,
    imageUrl: imageUrl || 'assets/images/event-placeholder.svg',
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
