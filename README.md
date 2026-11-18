# College Event Management System (CEMS)

> A modern, responsive, and fully functional campus event discovery and registration platform built strictly with **HTML5, CSS3, Vanilla JavaScript, and Browser LocalStorage**.

---

## 🎓 Project Idea Review & Viva Suitability

Your idea for the **College Event Management System (CEMS)** is **superb for an academic project and viva examination**:
1. **Real-world Campus Utility**: Solves practical university problems—event discovery, seat limits, duplicate registration chaos, and printable student passes.
2. **Adherence to Core Web Fundamentals**: Focuses on raw DOM manipulation, ES6+ logic, modern CSS flexbox/grid/variables, and browser storage APIs without relying on black-box frameworks like React or Next.js. Professors and external examiners value this deeply because it shows true understanding of web foundations.
3. **Zero Configuration / 100% Offline Capability**: Runs instantly in any standard browser with zero `npm install`, zero broken packages, and zero server crashes during your presentation.
4. **Complete Role Separation**: Clean distinction between the **Student Portal** (Explore, Filter, Register, My Passes) and the **Admin Dashboard** (Protected Login, Metrics, Event CRUD, Registrations Audit).

---

## 🛠️ Technology Stack (Strictly Implemented)

- **Markup**: HTML5 (Semantic elements: `<header>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<nav>`)
- **Styling**: Modern CSS3 (CSS Variables, Flexbox, CSS Grid, Media Queries, Micro-animations, Print Stylesheets)
- **Logic**: Vanilla JavaScript (ES6+ arrow functions, template literals, array methods like `.filter()`, `.map()`, `.some()`, DOM Event Listeners)
- **Data Persistence**: 
  - `localStorage` for permanent event and registration records (`cems_events`, `cems_registrations`)
  - `sessionStorage` for demo admin authentication status (`cems_admin_logged_in`)
- **External Dependencies**: **NONE** (Zero third-party libraries, frameworks, or backend APIs).

---

## 📁 Project Structure

```text
frontendproject/
│
├── index.html                # Home page with hero, live metrics, and featured events
├── events.html               # Event exploration with search, category pills & status filters
├── event-details.html        # Detailed event info, rules, and student registration form
├── my-registrations.html     # Student portal to lookup and print booked passes
├── admin-login.html          # Admin authentication with demo credentials helper
├── admin-dashboard.html      # Full admin dashboard: Overview, Events CRUD, Registrations
├── README.md                 # Complete documentation, viva guide & test checklist
│
├── css/
│   ├── style.css             # Global design system, CSS variables, typography & toasts
│   ├── events.css            # Events directory, card progress bars & ticket pass styles
│   └── admin.css             # Admin sidebar layout, stat cards & data tables
│
├── js/
│   ├── storage.js            # Central LocalStorage layer & sample data seeding
│   ├── main.js               # Global UI controller, toast system, navbar toggle
│   ├── events.js             # Event filtering, category pills, search & sorting
│   ├── registration.js       # Form validation, duplicate checks, & ticket pass generation
│   └── admin.js              # Admin authentication, dashboard metrics & event CRUD
│
└── assets/
    └── images/
        └── event-placeholder.svg # Local offline fallback graphic
```

---

## 🚀 How to Run the Project

### Option A: Using VS Code & Live Server (Recommended)
1. Open the `frontendproject` folder in **Visual Studio Code**.
2. If not already installed, install the **Live Server** extension (by *Ritwick Dey*) from the VS Code Extensions marketplace (`Ctrl+Shift+X` -> search `Live Server`).
3. Right-click on `index.html` in the file explorer and select **"Open with Live Server"**.
4. The website will open in your default browser at `http://127.0.0.1:5500/index.html`.

### Option B: Direct Browser Opening (No Server Required)
- Double-click `index.html` directly from your file manager (File Explorer).
- It will open in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari. All features (including LocalStorage) work seamlessly via file protocol.

---

## 🔑 Demo Credentials

| Role | Username | Password | Location |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | `admin123` | [admin-login.html](file:///c:/Users/lovis/Downloads/frontendproject/admin-login.html) |

> 💡 *Note: A convenient "✨ Auto-fill Demo Credentials" button is provided on `admin-login.html` for rapid demonstration during your viva.*

---

## 💾 LocalStorage Implementation & Data Architecture

All application state is stored locally inside the browser's `window.localStorage`.

### 1. Storage Keys
- `cems_events`: Array of event objects.
- `cems_registrations`: Array of student registration objects.
- `cems_admin_logged_in`: Key stored in `sessionStorage` to maintain admin session.

### 2. Events Schema (`cems_events`)
```json
[
  {
    "id": "evt_101",
    "title": "HackNova 2026: 24-Hour Inter-College Hackathon",
    "category": "Technical",
    "date": "2026-11-28",
    "time": "09:00 AM",
    "venue": "Turing Tech Hub, Block C",
    "maxParticipants": 80,
    "imageUrl": "https://images.unsplash.com/...",
    "description": "Build game-changing AI, Web3, and IoT solutions...",
    "organizer": "Department of Computer Science & ACM"
  }
]
```

### 3. Registrations Schema (`cems_registrations`)
```json
[
  {
    "id": "reg_201",
    "eventId": "evt_101",
    "studentName": "Rahul Sharma",
    "email": "rahul.sharma@college.edu",
    "phone": "9876543210",
    "rollNumber": "CS2023-042",
    "department": "Computer Science",
    "year": "3rd Year",
    "registeredAt": "2026-11-10T14:30:00.000Z",
    "status": "Confirmed"
  }
]
```

---

## 🧠 Key JavaScript Functions (Explained for Viva)

### 1. LocalStorage & Seeding (`js/storage.js`)
- `initStorage()`: Checks if `cems_events` or `cems_registrations` exists. If not, seeds 6 diverse college events and 3 sample registrations. It **never overwrites** existing user modifications on reload.
- `getAllEvents()` / `saveAllEvents(events)`: Reusable wrappers around `JSON.parse(localStorage.getItem(...))` and `JSON.stringify()`.
- `addEvent(eventData)`: Appends a newly created event with an auto-generated unique ID (`evt_` + timestamp).
- `updateEvent(id, updatedData)`: Finds the event by ID in memory, replaces properties, and saves back to LocalStorage.
- `deleteEvent(id)`: Removes the event and cascades removal of associated student registrations.
- `resetStorageToDefault()`: Restores initial seed data (available under Admin -> Viva Settings tab).

### 2. Smart Registration & Validation (`js/storage.js` & `js/registration.js`)
- `registerStudentForEvent(data)`: Performs a **4-step strict check** before accepting any registration:
  1. **Event Existence Check**: Verifies that the event ID is valid.
  2. **Past Event Guard (`isEventPast`)**: Compares the event date with today's date (`new Date()`). Past events reject registration.
  3. **Capacity Guard (`getRegisteredCount >= maxParticipants`)**: Counts existing records for that `eventId` in `cems_registrations`. If full, registration is blocked.
  4. **Duplicate Prevention Guard (`isStudentAlreadyRegistered`)**: Checks if the normalized student email already exists under the same event ID. Duplicate signups are blocked.

### 3. Events Filtering & Searching (`js/events.js`)
- `renderFilteredEvents()`: Real-time filtering pipeline combining search input (matching title, description, or venue), category pill filters (`Technical`, `Cultural`, `Sports`, `Workshop`), and status tabs (`Upcoming`, `Past`, `All`).

### 4. Admin Management (`js/admin.js`)
- `protectAdminRoute()`: Guards `admin-dashboard.html` by checking `sessionStorage.getItem('cems_admin_logged_in') === 'true'`. Unauthorized visitors are immediately redirected to `admin-login.html`.
- `getDashboardStats()`: Aggregates metrics for Total Events, Total Registrations, Upcoming Events, and Completed/Past Events.

---

## 📋 Comprehensive Feature Demonstration Checklist

Use this checklist during your viva to show the professor every feature step-by-step:

### A. Student Panel Demonstration
1. [ ] **Homepage (`index.html`)**:
   - Show responsive navbar, hero section, and live counter chips.
   - Show the 3 featured upcoming events loaded dynamically from LocalStorage.
   - Click "Explore Events" button.
2. [ ] **Events Explorer (`events.html`)**:
   - Type in the search box (e.g. `Hackathon` or `Amphitheatre`) to demonstrate instant live filtering.
   - Click category pills (`Technical`, `Cultural`, `Sports`, `Workshop`).
   - Switch between **"Upcoming Events"** and **"Past Events"** tabs.
   - Notice the "LensCraft" event is marked as **"Event Ended"** because its date is in the past.
3. [ ] **Event Details & Registration (`event-details.html`)**:
   - Click "Register Now" on an upcoming event.
   - View the detailed layout (Banner, Date, Time, Venue, Rules, Seats Remaining bar).
   - Try submitting an empty or invalid form: observe inline validation errors.
   - Fill in student details:
     - Name: `Aditya Verma`
     - Email: `aditya.verma@college.edu`
     - Phone: `9876501234`
     - Roll: `CS2024-110`
   - Submit the form: see the green toast notification and the **Official Event Entry Pass Modal**.
   - Try registering again with the exact same email on that event: observe the **Duplicate Registration Blocked** error!
4. [ ] **My Registrations Portal (`my-registrations.html`)**:
   - Click the demo button for `rahul.sharma@college.edu`.
   - View all registered events for Rahul.
   - Click **"🎟️ View Ticket"** to open and print Rahul's entry pass.
   - Click **"Cancel Booking"** to cancel a registration and confirm the seat is freed!

### B. Admin Panel Demonstration
1. [ ] **Admin Login (`admin-login.html`)**:
   - Try logging in with wrong credentials: see the error banner.
   - Click **"✨ Auto-fill Demo Credentials"** (`admin` / `admin123`) and submit.
2. [ ] **Dashboard Overview (`admin-dashboard.html`)**:
   - Observe the 4 real-time stat cards (Total Events, Total Signups, Upcoming, Past).
   - View the Recent Registrations table.
3. [ ] **Manage Events Tab**:
   - Click **"➕ Add New Event"**: fill in event title, date, venue, category, and capacity. Save and see it immediately appear on both the admin table and the student website!
   - Click **"✏️ Edit"** on an event: change its venue or time, save, and confirm update.
   - Click **"🗑️ Delete"** on an event: confirm prompt and see the event deleted.
4. [ ] **Student Registrations Tab**:
   - View the complete student registration list.
   - Type in the search box to filter registrations by student name, roll number, or event title.
   - Click **"🗑️ Delete"** to revoke a pass.
5. [ ] **Viva Settings Tab**:
   - Click **"🔄 Restore Default Sample Data"** to reset LocalStorage back to fresh sample data at the end of your presentation.

---

## 💬 Frequently Asked Viva Questions & Answers

**Q1: Why did you choose LocalStorage over an external database for this project?**  
*Answer:* For a frontend-focused academic project, LocalStorage provides immediate client-side data persistence without the overhead of maintaining an external backend server, database credentials, or active internet connection. It allows the complete CRUD lifecycle to be demonstrated reliably inside the browser.

**Q2: How does the system prevent duplicate registrations?**  
*Answer:* In `js/storage.js`, the `registerStudentForEvent()` function normalizes the entered email address (`.trim().toLowerCase()`) and queries the existing `cems_registrations` array using JavaScript's `.some()` method. If a record matches both the same `eventId` and `email`, the operation is aborted and an error message is returned.

**Q3: How is event capacity managed?**  
*Answer:* Every event has a `maxParticipants` property. When rendering event cards or processing registrations, `getRegisteredCount(eventId)` counts how many records exist for that event. If `registeredCount >= maxParticipants`, the registration form is locked with a "Housefull" notice.

**Q4: What is the difference between LocalStorage and SessionStorage in this project?**  
*Answer:* `LocalStorage` persists data indefinitely across browser sessions and tabs (ideal for events and registrations). `SessionStorage` is scoped to the active browser tab session and expires when the tab is closed, which is used for the demo admin authentication flag (`cems_admin_logged_in`).

**Q5: How did you ensure responsive design without Bootstrap or Tailwind?**  
*Answer:* By utilizing modern CSS3 Flexbox (`display: flex`), CSS Grid (`display: grid; grid-template-columns: repeat(auto-fit, minmax(...))`), and media queries (`@media (max-width: 768px)`). This keeps the stylesheet clean, lightweight, and fast.

---

*College Event Management System (CEMS) — Built for Academic Project Viva & Demonstration.*
