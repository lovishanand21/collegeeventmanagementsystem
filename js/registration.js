/**
 * COLLEGE EVENT MANAGEMENT SYSTEM (CEMS)
 * registration.js - Event Details, Student Registration, & My Registrations Portal
 */

document.addEventListener('DOMContentLoaded', () => {
  // Page 1: Event Details & Registration
  if (document.getElementById('event-details-container')) {
    initEventDetailsPage();
  }

  // Page 2: My Registrations Portal
  if (document.getElementById('my-registrations-container')) {
    initMyRegistrationsPage();
  }
});

// ==========================================================================
// 1. EVENT DETAILS & REGISTRATION LOGIC
// ==========================================================================

let currentEvent = null;

function initEventDetailsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');

  if (!eventId) {
    renderEventNotFound('No event specified in URL.');
    return;
  }

  currentEvent = getEventById(eventId);
  if (!currentEvent) {
    renderEventNotFound('The event you requested could not be found or has been removed.');
    return;
  }

  renderEventDetails(currentEvent);
  setupRegistrationForm(currentEvent);
}

function renderEventNotFound(message) {
  const container = document.getElementById('event-details-container');
  if (container) {
    container.innerHTML = `
      <div class="empty-state" style="margin-top: 3rem;">
        <div class="empty-state-icon">⚠️</div>
        <h2 class="empty-state-title">Event Not Found</h2>
        <p class="empty-state-desc">${escapeHTML(message)}</p>
        <a href="events.html" class="btn btn-primary">← Browse All Events</a>
      </div>
    `;
  }
}

function renderEventDetails(event) {
  // Page Title & Breadcrumb
  document.title = `${event.title} - CEMS`;
  const breadcrumbTitle = document.getElementById('breadcrumb-event-title');
  if (breadcrumbTitle) breadcrumbTitle.textContent = event.title;

  // Banner image
  const bannerImg = document.getElementById('detail-banner-img');
  if (bannerImg) {
    bannerImg.onerror = function() {
      this.onerror = null;
      this.src = 'assets/images/event-placeholder.svg';
    };
    bannerImg.src = event.imageUrl;
    bannerImg.alt = event.title;
  }

  // Category badge
  const categoryBadge = document.getElementById('detail-category-badge');
  if (categoryBadge) {
    categoryBadge.textContent = event.category;
    let categoryClass = 'badge-general';
    if (event.category === 'Technical') categoryClass = 'badge-tech';
    else if (event.category === 'Cultural') categoryClass = 'badge-cultural';
    else if (event.category === 'Sports') categoryClass = 'badge-sports';
    else if (event.category === 'Workshop') categoryClass = 'badge-workshop';
    categoryBadge.className = `badge ${categoryClass}`;
  }

  // Titles & Metas
  const titleEl = document.getElementById('detail-title');
  const orgEl = document.getElementById('detail-organizer');
  const dateEl = document.getElementById('detail-date');
  const timeEl = document.getElementById('detail-time');
  const venueEl = document.getElementById('detail-venue');
  const descEl = document.getElementById('detail-description');

  if (titleEl) titleEl.textContent = event.title;
  if (orgEl) orgEl.textContent = event.organizer || 'College Event Committee';
  if (dateEl) dateEl.textContent = formatDisplayDate(event.date);
  if (timeEl) timeEl.textContent = event.time;
  if (venueEl) venueEl.textContent = event.venue;
  if (descEl) descEl.textContent = event.description;

  // Update capacity bar & indicators
  updateCapacityUI(event);
}

function updateCapacityUI(event) {
  const isPast = isEventPast(event.date);
  const registeredCount = getRegisteredCount(event.id);
  const seatsRemaining = Math.max(0, event.maxParticipants - registeredCount);
  const isFull = seatsRemaining === 0;
  const capacityPercent = Math.min(100, Math.round((registeredCount / event.maxParticipants) * 100));

  const seatsCountEl = document.getElementById('detail-seats-count');
  const capacityFill = document.getElementById('detail-capacity-fill');
  const statusBadge = document.getElementById('detail-status-badge');
  const submitBtn = document.getElementById('submit-registration-btn');
  const formBox = document.getElementById('registration-form-box');
  const noticeBox = document.getElementById('registration-notice-box');

  if (seatsCountEl) {
    seatsCountEl.textContent = `${registeredCount} / ${event.maxParticipants} Seats Filled (${seatsRemaining} Remaining)`;
  }

  if (capacityFill) {
    capacityFill.style.width = `${capacityPercent}%`;
    if (isFull) capacityFill.style.background = 'var(--danger)';
  }

  if (statusBadge) {
    if (isPast) {
      statusBadge.textContent = 'Event Ended';
      statusBadge.className = 'badge badge-past';
      statusBadge.style.display = 'inline-flex';
    } else if (isFull) {
      statusBadge.textContent = 'Housefull';
      statusBadge.className = 'badge badge-danger';
      statusBadge.style.display = 'inline-flex';
    } else {
      statusBadge.textContent = 'Registrations Open';
      statusBadge.className = 'badge badge-success';
      statusBadge.style.display = 'inline-flex';
    }
  }

  // Handle past or full event form locking
  if (isPast) {
    if (formBox) formBox.style.display = 'none';
    if (noticeBox) {
      noticeBox.style.display = 'block';
      noticeBox.innerHTML = `
        <div style="text-align: center; padding: 1.5rem 0;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔒</div>
          <h4 style="font-weight: 700; color: var(--text-main);">Registration Closed</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">
            This event took place on ${formatDisplayDate(event.date)}. Registrations are closed.
          </p>
        </div>
      `;
    }
  } else if (isFull) {
    if (formBox) formBox.style.display = 'none';
    if (noticeBox) {
      noticeBox.style.display = 'block';
      noticeBox.innerHTML = `
        <div style="text-align: center; padding: 1.5rem 0;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎟️</div>
          <h4 style="font-weight: 700; color: var(--danger);">All Seats Are Full</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">
            Maximum capacity of ${event.maxParticipants} students has been reached for this event.
          </p>
        </div>
      `;
    }
  } else {
    if (formBox) formBox.style.display = 'block';
    if (noticeBox) noticeBox.style.display = 'none';
    if (submitBtn) submitBtn.disabled = false;
  }
}

function setupRegistrationForm(event) {
  const form = document.getElementById('student-registration-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear previous errors
    clearFormErrors(form);

    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const phoneInput = document.getElementById('reg-phone');
    const rollInput = document.getElementById('reg-roll');
    const deptInput = document.getElementById('reg-department');
    const yearInput = document.getElementById('reg-year');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const phone = phoneInput.value.trim();
    const rollNumber = rollInput.value.trim();
    const department = deptInput ? deptInput.value : 'Computer Science';
    const year = yearInput ? yearInput.value : '1st Year';

    // 1. Validation Checks
    let isValid = true;

    if (name.length < 3) {
      setFieldError('reg-name', 'Please enter your full name (at least 3 characters).');
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFieldError('reg-email', 'Please provide a valid college email address.');
      isValid = false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/[^0-9]/g, ''))) {
      setFieldError('reg-phone', 'Please enter a valid 10-digit mobile number.');
      isValid = false;
    }

    if (rollNumber.length < 2) {
      setFieldError('reg-roll', 'Please enter your college roll / registration number.');
      isValid = false;
    }

    if (!isValid) return;

    // 2. Submit Registration to Storage
    const result = registerStudentForEvent({
      eventId: event.id,
      studentName: name,
      email: email,
      phone: phone,
      rollNumber: rollNumber,
      department: department,
      year: year
    });

    if (!result.success) {
      showToast('Registration Blocked', result.message, 'error');
      // Highlight duplicate email or capacity error
      setFieldError('reg-email', result.message);
      return;
    }

    // 3. Success Workflow
    showToast('Registration Confirmed!', 'Your ticket has been generated successfully.', 'success');
    form.reset();
    updateCapacityUI(event);

    // 4. Show Ticket Pass Modal
    renderPassModal(result.registration, event);
  });
}

function setFieldError(fieldId, errorMsg) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.style.borderColor = 'var(--danger)';
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (errorEl) {
    errorEl.textContent = errorMsg;
    errorEl.classList.add('visible');
  }
}

function clearFormErrors(form) {
  form.querySelectorAll('.form-control').forEach(ctrl => {
    ctrl.style.borderColor = '';
  });
  form.querySelectorAll('.form-error').forEach(err => {
    err.textContent = '';
    err.classList.remove('visible');
  });
}

/**
 * Show printable Pass modal with barcode & details
 */
function renderPassModal(registration, event) {
  const modalContainer = document.getElementById('pass-modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-overlay active" id="ticket-modal">
      <div class="modal-card" style="max-width: 580px;">
        <div class="modal-header">
          <h3 class="modal-title">🎟️ Official Event Entry Pass</h3>
          <button class="modal-close" onclick="closeModal('ticket-modal')">&times;</button>
        </div>
        <div class="modal-body" id="printable-pass-area">
          <div class="ticket-card">
            <div class="ticket-header">
              <div>
                <span class="ticket-college-title">College Event Management System</span>
                <h2 class="ticket-event-name">${escapeHTML(event.title)}</h2>
              </div>
              <span class="ticket-id-badge">${escapeHTML(registration.id)}</span>
            </div>
            <div class="ticket-body-grid">
              <div>
                <span class="ticket-item-label">Student Name</span>
                <p class="ticket-item-val">${escapeHTML(registration.studentName)}</p>
              </div>
              <div>
                <span class="ticket-item-label">Roll Number</span>
                <p class="ticket-item-val">${escapeHTML(registration.rollNumber)}</p>
              </div>
              <div>
                <span class="ticket-item-label">Date & Time</span>
                <p class="ticket-item-val">${formatDisplayDate(event.date)} @ ${escapeHTML(event.time)}</p>
              </div>
              <div>
                <span class="ticket-item-label">Venue</span>
                <p class="ticket-item-val">${escapeHTML(event.venue)}</p>
              </div>
              <div>
                <span class="ticket-item-label">Department</span>
                <p class="ticket-item-val">${escapeHTML(registration.department)} (${escapeHTML(registration.year)})</p>
              </div>
              <div>
                <span class="ticket-item-label">College Email</span>
                <p class="ticket-item-val">${escapeHTML(registration.email)}</p>
              </div>
            </div>
            <div class="ticket-footer">
              <div class="ticket-barcode-mock">||| | |||| | ||||| |||</div>
              <div class="ticket-confirmed-stamp">✓ Verified Pass</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <a href="my-registrations.html?email=${encodeURIComponent(registration.email)}" class="btn btn-secondary">
            View in My Registrations
          </a>
          <button class="btn btn-primary" onclick="printPass()">
            🖨️ Print / Save Ticket
          </button>
        </div>
      </div>
    </div>
  `;
}

window.printPass = function() {
  window.print();
};

// ==========================================================================
// 2. MY REGISTRATIONS LOOKUP PORTAL
// ==========================================================================

function initMyRegistrationsPage() {
  const form = document.getElementById('my-reg-search-form');
  const emailInput = document.getElementById('my-reg-email-input');
  const resultsContainer = document.getElementById('my-registrations-container');

  // Check if URL has ?email=...
  const urlParams = new URLSearchParams(window.location.search);
  const emailFromUrl = urlParams.get('email');
  if (emailFromUrl && emailInput) {
    emailInput.value = emailFromUrl;
    renderStudentRegistrations(emailFromUrl);
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim().toLowerCase();
      if (!email) {
        showToast('Input Required', 'Please enter your registered college email.', 'warning');
        return;
      }
      renderStudentRegistrations(email);
    });
  }
}

function renderStudentRegistrations(email) {
  const container = document.getElementById('my-registrations-container');
  if (!container) return;

  const registrations = getRegistrationsByEmail(email);

  if (registrations.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h3 class="empty-state-title">No Registrations Found</h3>
        <p class="empty-state-desc">No events are registered under <strong>${escapeHTML(email)}</strong>. Double-check your spelling or explore upcoming events to register.</p>
        <a href="events.html" class="btn btn-primary">Browse Upcoming Events</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
      <h3 style="font-size: 1.25rem; font-weight: 700;">
        Found ${registrations.length} registered event${registrations.length === 1 ? '' : 's'} for 
        <span style="color: var(--primary);">${escapeHTML(email)}</span>
      </h3>
    </div>
    <div class="registrations-list-grid">
      ${registrations.map(reg => {
        const isPast = isEventPast(reg.event.date);
        return `
          <div class="registration-item-card" id="card-${reg.id}">
            <div class="registration-info">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
                <span class="badge ${isPast ? 'badge-past' : 'badge-success'}">
                  ${isPast ? 'Attended / Completed' : 'Registration Confirmed'}
                </span>
                <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">
                  ID: ${escapeHTML(reg.id)}
                </span>
              </div>
              <h4 class="reg-event-title">${escapeHTML(reg.event.title)}</h4>
              <div class="reg-meta-row">
                <span>🗓 <strong>Date:</strong> ${formatDisplayDate(reg.event.date)}</span>
                <span>⏰ <strong>Time:</strong> ${escapeHTML(reg.event.time)}</span>
                <span>📍 <strong>Venue:</strong> ${escapeHTML(reg.event.venue)}</span>
                <span>👤 <strong>Student:</strong> ${escapeHTML(reg.studentName)} (${escapeHTML(reg.rollNumber)})</span>
              </div>
            </div>
            <div class="registration-actions">
              <button class="btn btn-secondary btn-sm" onclick="showExistingPass('${reg.id}')">
                🎟️ View Ticket
              </button>
              ${!isPast ? `
                <button class="btn btn-danger btn-sm" onclick="handleCancelRegistration('${reg.id}', '${escapeHTML(email)}')">
                  Cancel Booking
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

window.showExistingPass = function(regId) {
  const registrations = getAllRegistrations();
  const reg = registrations.find(r => r.id === regId);
  if (!reg) {
    showToast('Error', 'Registration record not found.', 'error');
    return;
  }
  const event = getEventById(reg.eventId) || {
    id: reg.eventId,
    title: 'Event Record (Archived)',
    date: '2026-12-01',
    time: 'TBA',
    venue: 'Campus Main Hall'
  };
  renderPassModal(reg, event);
};

window.handleCancelRegistration = function(regId, studentEmail) {
  if (confirm('Are you sure you want to cancel this registration? Your seat will be released for other students.')) {
    const success = deleteRegistration(regId);
    if (success) {
      showToast('Registration Cancelled', 'Your ticket has been cancelled and seat released.', 'info');
      renderStudentRegistrations(studentEmail);
    } else {
      showToast('Error', 'Failed to cancel registration.', 'error');
    }
  }
};
