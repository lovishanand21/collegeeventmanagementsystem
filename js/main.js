/**
 * COLLEGE EVENT MANAGEMENT SYSTEM (CEMS)
 * main.js - Core UI Controller, Navigation, Toast Notifications, and Helpers
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initToastContainer();
  initModals();

  // If we are on the home page, load homepage stats and featured events
  if (document.getElementById('home-featured-events')) {
    renderHomeStats();
    renderHomeFeaturedEvents();
  }
});

/**
 * Mobile Navigation Toggle and Link Highlighting
 */
function initNavbar() {
  const toggleBtn = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking any nav link on mobile
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!toggleBtn.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
      }
    });
  }

  // Highlight current page in navbar
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = document.querySelectorAll('.nav-link');
  navItems.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/**
 * Setup Toast Notification Container in DOM
 */
function initToastContainer() {
  if (!document.querySelector('.toast-container')) {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

/**
 * Display modern toast notification
 * @param {string} title - Header text
 * @param {string} message - Description
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 * @param {number} duration - Milliseconds before auto-dismiss
 */
function showToast(title, message, type = 'info', duration = 4000) {
  const container = document.querySelector('.toast-container') || document.body;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || 'ℹ'}</div>
    <div class="toast-body">
      <div class="toast-title">${escapeHTML(title)}</div>
      <div class="toast-message">${escapeHTML(message)}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Global Modal Event Listeners
 */
function initModals() {
  // Close buttons inside modals
  document.querySelectorAll('.modal-close, [data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Close when clicking overlay backdrop
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * Format ISO date string into readable format (e.g., "Nov 28, 2026")
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string}
 */
function formatDisplayDate(dateStr) {
  if (!dateStr) return 'N/A';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;

  const dateObj = new Date(year, month, day);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Prevent XSS by safely escaping HTML entities in user and data strings
 * @param {*} val 
 * @returns {string}
 */
function escapeHTML(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Ensure global availability
window.escapeHTML = escapeHTML;
window.formatDisplayDate = formatDisplayDate;
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;

/**
 * Render quick live stats in the homepage hero
 */
function renderHomeStats() {
  const stats = getDashboardStats();
  const eventsCountEl = document.getElementById('stat-events-count');
  const registrationsCountEl = document.getElementById('stat-registrations-count');
  const upcomingCountEl = document.getElementById('stat-upcoming-count');

  if (eventsCountEl) eventsCountEl.textContent = stats.totalEvents;
  if (registrationsCountEl) registrationsCountEl.textContent = stats.totalRegistrations;
  if (upcomingCountEl) upcomingCountEl.textContent = stats.upcomingEvents;
}

/**
 * Render featured upcoming events on the homepage
 */
function renderHomeFeaturedEvents() {
  const container = document.getElementById('home-featured-events');
  if (!container) return;

  const events = getAllEvents();
  // Filter for upcoming events (date and time) and take top 3
  const upcomingEvents = events
    .filter(evt => !isEventPast(evt))
    .slice(0, 3);

  if (upcomingEvents.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <h3 class="empty-state-title">No Upcoming Events Right Now</h3>
        <p class="empty-state-desc">New campus workshops, hackathons, and fests are being scheduled soon. Stay tuned!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = upcomingEvents.map(event => {
    const registeredCount = getRegisteredCount(event.id);
    const seatsRemaining = Math.max(0, event.maxParticipants - registeredCount);
    const isFull = seatsRemaining === 0;
    const capacityPercent = Math.min(100, Math.round((registeredCount / event.maxParticipants) * 100));

    let categoryClass = 'badge-general';
    if (event.category === 'Technical') categoryClass = 'badge-tech';
    else if (event.category === 'Cultural') categoryClass = 'badge-cultural';
    else if (event.category === 'Sports') categoryClass = 'badge-sports';
    else if (event.category === 'Workshop') categoryClass = 'badge-workshop';

    return `
      <article class="event-card">
        <div class="event-card-image-wrapper">
          <img src="${escapeHTML(event.imageUrl)}" alt="${escapeHTML(event.title)}" class="event-card-img" loading="lazy" onerror="this.onerror=null; this.src='assets/images/event-placeholder.svg';">
          <span class="badge ${categoryClass} event-card-category">${escapeHTML(event.category)}</span>
          ${isFull ? '<span class="badge badge-danger event-card-status-badge">Full</span>' : ''}
        </div>
        <div class="event-card-body">
          <div class="event-card-date-strip">
            <span>🗓 ${formatDisplayDate(event.date)}</span>
            <span>•</span>
            <span>⏰ ${escapeHTML(event.time)}</span>
          </div>
          <h3 class="event-card-title">
            <a href="event-details.html?id=${encodeURIComponent(event.id)}">${escapeHTML(event.title)}</a>
          </h3>
          <p class="event-card-desc">${escapeHTML(event.description)}</p>
          <div class="event-card-meta">
            <div class="event-card-meta-item">
              <span>📍 Venue:</span>
              <strong>${escapeHTML(event.venue)}</strong>
            </div>
            <div class="event-card-meta-item">
              <span>👥 Seats:</span>
              <span>${registeredCount} / ${event.maxParticipants} (${seatsRemaining} left)</span>
            </div>
            <div class="event-card-capacity-bar">
              <div class="event-card-capacity-fill" style="width: ${capacityPercent}%;"></div>
            </div>
          </div>
        </div>
        <div class="event-card-footer">
          <a href="event-details.html?id=${encodeURIComponent(event.id)}" class="btn ${isFull ? 'btn-secondary' : 'btn-primary'}">
            ${isFull ? 'View Details' : 'Register Now →'}
          </a>
        </div>
      </article>
    `;
  }).join('');
}
