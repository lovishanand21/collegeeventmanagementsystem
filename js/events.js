/**
 * COLLEGE EVENT MANAGEMENT SYSTEM (CEMS)
 * events.js - Handles Events Listing, Searching, Filtering, and Sorting
 */

// Filter state
const filterState = {
  searchQuery: '',
  category: 'ALL',
  status: 'UPCOMING', // 'ALL' | 'UPCOMING' | 'PAST'
  sortBy: 'date-asc'  // 'date-asc' | 'date-desc' | 'title-asc'
};

document.addEventListener('DOMContentLoaded', () => {
  // Check if we are on the events explorer page
  const eventsContainer = document.getElementById('events-grid');
  if (eventsContainer) {
    initEventsExplorer();
  }
});

/**
 * Initialize event listeners for search and filtering
 */
function initEventsExplorer() {
  const searchInput = document.getElementById('events-search-input');
  const categoryPills = document.querySelectorAll('.filter-pill');
  const statusTabs = document.querySelectorAll('.tab-btn[data-status]');
  const sortSelect = document.getElementById('events-sort-select');

  // Search input with debounce
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterState.searchQuery = e.target.value.toLowerCase().trim();
      renderFilteredEvents();
    });
  }

  // Category filter pills
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      filterState.category = pill.getAttribute('data-category') || 'ALL';
      renderFilteredEvents();
    });
  });

  // Status tabs (All, Upcoming, Past)
  statusTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      statusTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterState.status = tab.getAttribute('data-status') || 'ALL';
      renderFilteredEvents();
    });
  });

  // Sort dropdown
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      filterState.sortBy = e.target.value;
      renderFilteredEvents();
    });
  }

  // Check URL parameters for preset category (e.g. events.html?category=Technical)
  const urlParams = new URLSearchParams(window.location.search);
  const paramCategory = urlParams.get('category');
  if (paramCategory) {
    const matchingPill = Array.from(categoryPills).find(
      p => (p.getAttribute('data-category') || '').toLowerCase() === paramCategory.toLowerCase()
    );
    if (matchingPill) {
      matchingPill.click();
      return;
    }
  }

  // Initial render
  renderFilteredEvents();
}

/**
 * Filter, sort, and render events
 */
function renderFilteredEvents() {
  const container = document.getElementById('events-grid');
  const countBadge = document.getElementById('events-count-badge');
  if (!container) return;

  let events = getAllEvents();

  // 1. Filter by Search Query (Title, Description, or Venue)
  if (filterState.searchQuery) {
    events = events.filter(evt =>
      (evt.title && evt.title.toLowerCase().includes(filterState.searchQuery)) ||
      (evt.description && evt.description.toLowerCase().includes(filterState.searchQuery)) ||
      (evt.venue && evt.venue.toLowerCase().includes(filterState.searchQuery))
    );
  }

  // 2. Filter by Category
  if (filterState.category !== 'ALL') {
    events = events.filter(evt => 
      evt.category && evt.category.toUpperCase() === filterState.category.toUpperCase()
    );
  }

  // 3. Filter by Status (Upcoming vs Past) using date and time
  if (filterState.status === 'UPCOMING') {
    events = events.filter(evt => !isEventPast(evt));
  } else if (filterState.status === 'PAST') {
    events = events.filter(evt => isEventPast(evt));
  }

  // 4. Sort Events (handling both date and time for accurate chronology)
  events.sort((a, b) => {
    if (filterState.sortBy === 'date-asc') {
      const dtA = parseEventDateTime(a.date, a.time);
      const dtB = parseEventDateTime(b.date, b.time);
      return (dtA ? dtA.getTime() : 0) - (dtB ? dtB.getTime() : 0);
    } else if (filterState.sortBy === 'date-desc') {
      const dtA = parseEventDateTime(a.date, a.time);
      const dtB = parseEventDateTime(b.date, b.time);
      return (dtB ? dtB.getTime() : 0) - (dtA ? dtA.getTime() : 0);
    } else if (filterState.sortBy === 'title-asc') {
      return (a.title || '').localeCompare(b.title || '');
    }
    return 0;
  });

  // Update count indicator
  if (countBadge) {
    countBadge.textContent = `${events.length} event${events.length === 1 ? '' : 's'} found`;
  }

  // Render empty state if no events matched
  if (events.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3 class="empty-state-title">No Events Found</h3>
        <p class="empty-state-desc">We couldn't find any events matching your selected search query or filters. Try adjusting your filter options.</p>
        <button class="btn btn-secondary" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  // Render event cards
  container.innerHTML = events.map(event => {
    const isPast = isEventPast(event);
    const registeredCount = getRegisteredCount(event.id);
    const seatsRemaining = Math.max(0, event.maxParticipants - registeredCount);
    const isFull = seatsRemaining === 0;
    const capacityPercent = Math.min(100, Math.round((registeredCount / event.maxParticipants) * 100));

    let categoryClass = 'badge-general';
    if (event.category === 'Technical') categoryClass = 'badge-tech';
    else if (event.category === 'Cultural') categoryClass = 'badge-cultural';
    else if (event.category === 'Sports') categoryClass = 'badge-sports';
    else if (event.category === 'Workshop') categoryClass = 'badge-workshop';

    let statusBadgeHTML = '';
    if (isPast) {
      statusBadgeHTML = '<span class="badge badge-past event-card-status-badge">Event Ended</span>';
    } else if (isFull) {
      statusBadgeHTML = '<span class="badge badge-danger event-card-status-badge">Housefull</span>';
    }

    return `
      <article class="event-card ${isPast ? 'event-past' : ''}">
        <div class="event-card-image-wrapper">
          <img src="${escapeHTML(event.imageUrl)}" alt="${escapeHTML(event.title)}" class="event-card-img" loading="lazy" onerror="this.onerror=null; this.src='assets/images/event-placeholder.svg';">
          <span class="badge ${categoryClass} event-card-category">${escapeHTML(event.category)}</span>
          ${statusBadgeHTML}
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
              <span>👥 Capacity:</span>
              <span>${registeredCount} / ${event.maxParticipants} (${isPast ? 'Closed' : seatsRemaining + ' seats left'})</span>
            </div>
            <div class="event-card-capacity-bar">
              <div class="event-card-capacity-fill" style="width: ${capacityPercent}%; ${isFull ? 'background: var(--danger);' : ''}"></div>
            </div>
          </div>
        </div>
        <div class="event-card-footer">
          <a href="event-details.html?id=${encodeURIComponent(event.id)}" class="btn ${isPast ? 'btn-secondary' : (isFull ? 'btn-secondary' : 'btn-primary')}">
            ${isPast ? 'View Event Recap' : (isFull ? 'View Details (Full)' : 'Register Now →')}
          </a>
        </div>
      </article>
    `;
  }).join('');
}

/**
 * Reset all filters to default state
 */
function resetFilters() {
  filterState.searchQuery = '';
  filterState.category = 'ALL';
  filterState.status = 'ALL';
  filterState.sortBy = 'date-asc';

  const searchInput = document.getElementById('events-search-input');
  if (searchInput) searchInput.value = '';

  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.classList.toggle('active', pill.getAttribute('data-category') === 'ALL');
  });

  document.querySelectorAll('.tab-btn[data-status]').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-status') === 'ALL');
  });

  const sortSelect = document.getElementById('events-sort-select');
  if (sortSelect) sortSelect.value = 'date-asc';

  renderFilteredEvents();
}
