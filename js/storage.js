/**
 * COLLEGE EVENT MANAGEMENT SYSTEM (CEMS)
 * storage.js - Centralized LocalStorage Management Layer
 * Handles initialization, CRUD operations, and data validation.
 */

// Storage Keys
const STORAGE_KEYS = {
  EVENTS: 'cems_events',
  REGISTRATIONS: 'cems_registrations'
};

// Initial Seed Data for Demo & Viva Presentation
const SAMPLE_EVENTS = [
  {
    id: 'evt_101',
    title: 'HackNova 2026: 24-Hour Inter-College Hackathon',
    category: 'Technical',
    date: '2026-11-28',
    time: '09:00 AM',
    venue: 'Turing Tech Hub, Block C',
    maxParticipants: 80,
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    description: 'Build game-changing AI, Web3, and IoT solutions in 24 hours of non-stop coding, mentorship, and pizza! Exciting cash prizes worth ₹1,00,000 up for grabs.',
    organizer: 'Department of Computer Science & ACM Student Chapter'
  },
  {
    id: 'evt_102',
    title: "Aura '26: Annual Cultural Fest & Battle of Bands",
    category: 'Cultural',
    date: '2026-12-05',
    time: '05:30 PM',
    venue: 'Open Air Amphitheatre',
    maxParticipants: 400,
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    description: 'Experience an electrifying night of live musical performances, rock bands, dance face-offs, and celebrity guest DJs under the starlit campus sky.',
    organizer: 'College Cultural Council'
  },
  {
    id: 'evt_103',
    title: 'RoboClash: Autonomous Robot Sumo & Maze Navigation',
    category: 'Technical',
    date: '2026-12-10',
    time: '10:00 AM',
    venue: 'Robotics Arena, Mechanical Block',
    maxParticipants: 50,
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    description: 'Put your microcontroller programming and chassis mechanics to the ultimate test in line-following, obstacle avoidance, and combat sumo rounds.',
    organizer: 'Robotics & Automation Society (RAS)'
  },
  {
    id: 'evt_104',
    title: 'Chancellor Invitational Football & Cricket Cup',
    category: 'Sports',
    date: '2026-12-18',
    time: '07:30 AM',
    venue: 'University Central Sports Stadium',
    maxParticipants: 120,
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80',
    description: 'The most awaited collegiate sports tournament featuring 16 top university teams competing for the prestigious Chancellor Gold Cup trophy.',
    organizer: 'Department of Physical Education'
  },
  {
    id: 'evt_105',
    title: 'Generative AI & LLM Hands-on Masterclass',
    category: 'Workshop',
    date: '2026-12-22',
    time: '02:00 PM',
    venue: 'Auditorium Hall 2 & Lab 4',
    maxParticipants: 60,
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    description: 'Hands-on training session on fine-tuning large language models, retrieval augmented generation (RAG), and building conversational agents. Free certificates provided.',
    organizer: 'AI Research & Innovation Lab'
  },
  {
    id: 'evt_106',
    title: 'LensCraft: Campus Photography & Short Film Expo',
    category: 'Cultural',
    date: '2026-11-05', // Intentionally past date to test past event logic & filtering
    time: '11:00 AM',
    venue: 'Fine Arts Gallery, Hall A',
    maxParticipants: 50,
    imageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80',
    description: 'A showcase of stunning student photography and short documentary films capturing stories of campus architecture, nature, and student life.',
    organizer: 'Photography & Media Club'
  }
];

const SAMPLE_REGISTRATIONS = [
  {
    id: 'reg_201',
    eventId: 'evt_101',
    studentName: 'Rahul Sharma',
    email: 'rahul.sharma@college.edu',
    phone: '9876543210',
    rollNumber: 'CS2023-042',
    department: 'Computer Science',
    year: '3rd Year',
    registeredAt: '2026-11-10T14:30:00.000Z',
    status: 'Confirmed'
  },
  {
    id: 'reg_202',
    eventId: 'evt_102',
    studentName: 'Priya Patel',
    email: 'priya.patel@college.edu',
    phone: '9812345678',
    rollNumber: 'IT2024-019',
    department: 'Information Technology',
    year: '2nd Year',
    registeredAt: '2026-11-12T10:15:00.000Z',
    status: 'Confirmed'
  },
  {
    id: 'reg_203',
    eventId: 'evt_105',
    studentName: 'Rahul Sharma',
    email: 'rahul.sharma@college.edu',
    phone: '9876543210',
    rollNumber: 'CS2023-042',
    department: 'Computer Science',
    year: '3rd Year',
    registeredAt: '2026-11-14T16:00:00.000Z',
    status: 'Confirmed'
  }
];

/**
 * Initialize storage with sample data if keys do not already exist.
 * Will not overwrite existing user modifications.
 */
function initStorage() {
  try {
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SAMPLE_EVENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(SAMPLE_REGISTRATIONS));
    }
  } catch (error) {
    console.error('Error initializing LocalStorage:', error);
  }
}

/**
 * Force reset LocalStorage back to initial sample state (useful for Viva demo)
 */
function resetStorageToDefault() {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SAMPLE_EVENTS));
  localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(SAMPLE_REGISTRATIONS));
}

// ---------------- EVENT OPERATIONS ----------------

/**
 * Retrieve all events from LocalStorage
 * @returns {Array} List of event objects
 */
function getAllEvents() {
  initStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading events from storage:', err);
    return [];
  }
}

/**
 * Save array of events to LocalStorage
 * @param {Array} events 
 */
function saveAllEvents(events) {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (err) {
    console.error('Error writing events to storage:', err);
  }
}

/**
 * Get single event by its unique ID
 * @param {string} id 
 * @returns {Object|null}
 */
function getEventById(id) {
  const events = getAllEvents();
  return events.find(event => event.id === id) || null;
}

/**
 * Add a new event to LocalStorage
 * @param {Object} eventData 
 * @returns {Object} Created event with generated ID
 */
function addEvent(eventData) {
  const events = getAllEvents();
  const newEvent = {
    id: 'evt_' + Date.now(),
    title: eventData.title.trim(),
    category: eventData.category,
    date: eventData.date,
    time: eventData.time,
    venue: eventData.venue.trim(),
    maxParticipants: parseInt(eventData.maxParticipants, 10) || 50,
    imageUrl: eventData.imageUrl ? eventData.imageUrl.trim() : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    description: eventData.description.trim(),
    organizer: eventData.organizer ? eventData.organizer.trim() : 'College Event Committee'
  };

  events.unshift(newEvent); // Add to beginning of array
  saveAllEvents(events);
  return newEvent;
}

/**
 * Update existing event
 * @param {string} id 
 * @param {Object} updatedData 
 * @returns {Object|null} Updated event
 */
function updateEvent(id, updatedData) {
  const events = getAllEvents();
  const index = events.findIndex(evt => evt.id === id);
  if (index === -1) return null;

  events[index] = {
    ...events[index],
    title: updatedData.title.trim(),
    category: updatedData.category,
    date: updatedData.date,
    time: updatedData.time,
    venue: updatedData.venue.trim(),
    maxParticipants: parseInt(updatedData.maxParticipants, 10) || events[index].maxParticipants,
    imageUrl: updatedData.imageUrl ? updatedData.imageUrl.trim() : events[index].imageUrl,
    description: updatedData.description.trim(),
    organizer: updatedData.organizer ? updatedData.organizer.trim() : events[index].organizer
  };

  saveAllEvents(events);
  return events[index];
}

/**
 * Delete an event by ID (and optionally cascade cleanup registrations)
 * @param {string} id 
 * @returns {boolean} Success status
 */
function deleteEvent(id) {
  let events = getAllEvents();
  const initialLength = events.length;
  events = events.filter(evt => evt.id !== id);

  if (events.length === initialLength) return false;

  saveAllEvents(events);

  // Clean up orphan registrations for deleted event
  let registrations = getAllRegistrations();
  registrations = registrations.filter(reg => reg.eventId !== id);
  saveAllRegistrations(registrations);

  return true;
}

// ---------------- REGISTRATION OPERATIONS ----------------

/**
 * Retrieve all registrations from LocalStorage
 * @returns {Array}
 */
function getAllRegistrations() {
  initStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading registrations from storage:', err);
    return [];
  }
}

/**
 * Save array of registrations to LocalStorage
 * @param {Array} registrations 
 */
function saveAllRegistrations(registrations) {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
  } catch (err) {
    console.error('Error writing registrations to storage:', err);
  }
}

/**
 * Get registration count for a given event ID
 * @param {string} eventId 
 * @returns {number}
 */
function getRegisteredCount(eventId) {
  const registrations = getAllRegistrations();
  return registrations.filter(r => r.eventId === eventId).length;
}

/**
 * Check if a student is already registered for an event
 * @param {string} email 
 * @param {string} eventId 
 * @returns {boolean}
 */
function isStudentAlreadyRegistered(email, eventId) {
  const registrations = getAllRegistrations();
  const normalizedEmail = email.trim().toLowerCase();
  return registrations.some(r => r.eventId === eventId && r.email.trim().toLowerCase() === normalizedEmail);
}

/**
 * Check if an event date has passed
 * @param {string} eventDateStr (YYYY-MM-DD)
 * @returns {boolean}
 */
function isEventPast(eventDateStr) {
  if (!eventDateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(eventDateStr + 'T00:00:00');
  return eventDate < today;
}

/**
 * Register a student for an event with comprehensive validation:
 * 1. Event must exist
 * 2. Event date must not be in the past
 * 3. Event capacity must not be exceeded
 * 4. Duplicate registration (same email + event ID) is blocked
 * 
 * @param {Object} data - { eventId, studentName, email, phone, rollNumber, department, year }
 * @returns {Object} { success: boolean, message: string, registration?: Object }
 */
function registerStudentForEvent(data) {
  const event = getEventById(data.eventId);
  if (!event) {
    return { success: false, message: 'Event not found.' };
  }

  // 1. Check if event is past
  if (isEventPast(event.date)) {
    return { success: false, message: 'Registration closed. This event has already taken place.' };
  }

  // 2. Check capacity
  const currentCount = getRegisteredCount(data.eventId);
  if (currentCount >= event.maxParticipants) {
    return { success: false, message: 'Registration full. All seats for this event have been filled.' };
  }

  // 3. Check duplicate registration
  if (isStudentAlreadyRegistered(data.email, data.eventId)) {
    return { success: false, message: 'You have already registered for this event with this email address.' };
  }

  // 4. Create new registration record
  const newRegistration = {
    id: 'reg_' + Date.now(),
    eventId: data.eventId,
    studentName: data.studentName.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    rollNumber: data.rollNumber ? data.rollNumber.trim() : 'N/A',
    department: data.department ? data.department.trim() : 'General',
    year: data.year ? data.year.trim() : '1st Year',
    registeredAt: new Date().toISOString(),
    status: 'Confirmed'
  };

  const registrations = getAllRegistrations();
  registrations.unshift(newRegistration);
  saveAllRegistrations(registrations);

  return {
    success: true,
    message: 'Registration successful! Your pass has been generated.',
    registration: newRegistration,
    event: event
  };
}

/**
 * Retrieve all registrations for a specific email with linked event info
 * @param {string} email 
 * @returns {Array} List of registration records with attached event object
 */
function getRegistrationsByEmail(email) {
  if (!email) return [];
  const normalizedEmail = email.trim().toLowerCase();
  const registrations = getAllRegistrations();
  const events = getAllEvents();

  return registrations
    .filter(r => r.email.toLowerCase() === normalizedEmail)
    .map(reg => {
      const event = events.find(e => e.id === reg.eventId);
      return {
        ...reg,
        event: event || {
          title: 'Event Removed',
          date: 'N/A',
          time: 'N/A',
          venue: 'N/A',
          category: 'General'
        }
      };
    });
}

/**
 * Delete a registration by ID
 * @param {string} id 
 * @returns {boolean}
 */
function deleteRegistration(id) {
  let registrations = getAllRegistrations();
  const initialLength = registrations.length;
  registrations = registrations.filter(r => r.id !== id);

  if (registrations.length === initialLength) return false;

  saveAllRegistrations(registrations);
  return true;
}

/**
 * Get aggregated dashboard statistics
 * @returns {Object} Total events, total registrations, upcoming events, past events
 */
function getDashboardStats() {
  const events = getAllEvents();
  const registrations = getAllRegistrations();

  let upcomingCount = 0;
  let pastCount = 0;

  events.forEach(event => {
    if (isEventPast(event.date)) {
      pastCount++;
    } else {
      upcomingCount++;
    }
  });

  return {
    totalEvents: events.length,
    totalRegistrations: registrations.length,
    upcomingEvents: upcomingCount,
    pastEvents: pastCount,
    recentRegistrations: registrations.slice(0, 5)
  };
}

// Automatically initialize on file load
initStorage();
