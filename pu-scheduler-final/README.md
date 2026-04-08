# 🏫 Presidency University — Smart Classroom & Timetable Scheduler
### Full-Stack: React 18 · Spring Boot 3 · MySQL 8 · JWT · RBAC

---

## 📁 Complete Project Structure

```
pu-scheduler/
│
├── 📄 .gitignore
├── 📄 docker-compose.yml          ← One-command Docker setup
├── 📄 README.md
│
├── 🗄️  database/
│   └── schema.sql                 ← MySQL schema + seed data (4 users, rooms, teachers, slots)
│
├── ☕ backend/                    ← Spring Boot 3 REST API
│   ├── Dockerfile
│   ├── .env.example
│   ├── pom.xml                    ← Maven dependencies
│   └── src/
│       ├── main/
│       │   ├── java/com/presidency/scheduler/
│       │   │   ├── SchedulerApplication.java   ← Entry point
│       │   │   │
│       │   │   ├── 📦 config/
│       │   │   │   └── SecurityConfig.java     ← Spring Security + CORS + RBAC rules
│       │   │   │
│       │   │   ├── 📦 controller/
│       │   │   │   ├── AuthController.java     ← POST /api/auth/login
│       │   │   │   ├── SlotController.java     ← CRUD + move + copy slots
│       │   │   │   ├── RoomController.java     ← CRUD rooms
│       │   │   │   ├── TeacherController.java  ← CRUD teachers
│       │   │   │   ├── ConflictController.java ← GET /api/conflicts
│       │   │   │   └── SettingsController.java ← Holidays, blocked slots, app settings
│       │   │   │
│       │   │   ├── 📦 dto/
│       │   │   │   ├── ApiResponse.java        ← Wrapper: { success, message, data }
│       │   │   │   ├── AuthRequest.java
│       │   │   │   ├── AuthResponse.java       ← JWT token + user info
│       │   │   │   ├── SlotRequest.java
│       │   │   │   ├── SlotResponse.java
│       │   │   │   ├── RoomRequest.java
│       │   │   │   ├── RoomResponse.java       ← Includes utilization stats
│       │   │   │   ├── TeacherRequest.java
│       │   │   │   ├── TeacherResponse.java    ← Includes assignedHours
│       │   │   │   └── ConflictResponse.java
│       │   │   │
│       │   │   ├── 📦 exception/
│       │   │   │   ├── GlobalExceptionHandler.java  ← Centralized error responses
│       │   │   │   └── ResourceNotFoundException.java
│       │   │   │
│       │   │   ├── 📦 model/                   ← JPA Entities
│       │   │   │   ├── User.java               ← id, username, password, role, avatar
│       │   │   │   ├── Room.java               ← id, name, capacity, type, status, notes
│       │   │   │   ├── RoomEquipment.java      ← room_id, equipment (OneToMany)
│       │   │   │   ├── Teacher.java            ← id, name, subject, email, maxHours
│       │   │   │   ├── TeacherAvailability.java← teacher_id, day, available
│       │   │   │   ├── Slot.java               ← subject, cls, teacher, room, day, time
│       │   │   │   ├── Holiday.java            ← date, label
│       │   │   │   ├── BlockedSlot.java        ← day, timeSlot, reason
│       │   │   │   └── AppSetting.java         ← key-value config store
│       │   │   │
│       │   │   ├── 📦 repository/              ← Spring Data JPA interfaces
│       │   │   │   ├── UserRepository.java
│       │   │   │   ├── RoomRepository.java
│       │   │   │   ├── TeacherRepository.java
│       │   │   │   ├── SlotRepository.java     ← Custom conflict-check queries
│       │   │   │   ├── HolidayRepository.java
│       │   │   │   ├── BlockedSlotRepository.java
│       │   │   │   └── AppSettingRepository.java
│       │   │   │
│       │   │   ├── 📦 security/
│       │   │   │   ├── JwtUtil.java            ← Generate + validate JWT tokens
│       │   │   │   ├── JwtFilter.java          ← Intercept requests, extract user
│       │   │   │   └── UserDetailsServiceImpl.java ← Load user from DB
│       │   │   │
│       │   │   └── 📦 service/                 ← Business logic
│       │   │       ├── AuthService.java        ← Login, token generation
│       │   │       ├── SlotService.java        ← CRUD + move + copy + conflict guard
│       │   │       ├── RoomService.java        ← CRUD + utilization calculation
│       │   │       ├── TeacherService.java     ← CRUD + availability + workload
│       │   │       └── ConflictService.java    ← O(n²) 5-type conflict detection
│       │   │
│       │   └── resources/
│       │       ├── application.properties      ← DB, JWT, server config
│       │       └── application-test.properties ← H2 for unit tests
│       │
│       └── test/
│           └── java/com/presidency/scheduler/
│               └── SchedulerApplicationTests.java
│
└── ⚛️  frontend/                  ← React 18 + Vite
    ├── Dockerfile
    ├── nginx.conf                 ← For Docker deployment
    ├── .env                       ← VITE_API_BASE_URL
    ├── .env.example
    ├── package.json               ← React, Axios, Recharts, React Router
    ├── vite.config.js             ← Proxy /api → localhost:8080
    ├── index.html
    └── src/
        │
        ├── main.jsx               ← ReactDOM root, providers, Toaster
        ├── App.jsx                ← Routes + ProtectedRoute wrapper
        ├── index.css              ← Global CSS variables + resets
        │
        ├── 📦 api/                ← Axios API layer (one file per resource)
        │   ├── axios.js           ← Base instance + JWT interceptor + 401 redirect
        │   ├── auth.js            ← login()
        │   ├── slots.js           ← getSlots, createSlot, updateSlot, deleteSlot, moveSlot, copySlot
        │   ├── rooms.js           ← getRooms, createRoom, updateRoom, deleteRoom
        │   ├── teachers.js        ← getTeachers, createTeacher, updateTeacher, deleteTeacher
        │   └── settings.js        ← conflicts, holidays, blocked slots, app settings
        │
        ├── 📦 context/            ← React global state
        │   ├── AuthContext.jsx    ← user, login(), logout(), can(permission)
        │   └── AppContext.jsx     ← slots, rooms, teachers, conflicts, days, times + refreshers
        │
        ├── 📦 hooks/              ← Custom React hooks
        │   ├── useApi.js          ← Generic loading/error wrapper for API calls
        │   └── useConflictPreview.js ← Real-time conflict warnings in form
        │
        ├── 📦 utils/              ← Pure utility functions
        │   ├── constants.js       ← DAYS, TIMES, COLORS, ROOM_TYPES, CONFLICT_TYPES
        │   ├── export.js          ← downloadCSV(), printTimetable()
        │   └── format.js          ← sortTimes(), timeToMinutes(), utilizationColor()
        │
        ├── 📦 components/common/  ← Reusable UI components
        │   ├── Layout.jsx + .css  ← Sidebar, header, mobile hamburger, role pill
        │   ├── Modal.jsx + .css   ← Accessible modal with ESC key + backdrop click
        │   ├── Button.jsx + .css  ← primary, success, danger, ghost, amber variants
        │   ├── FormField.jsx + .css ← Label, Input, Select, Textarea with error display
        │   ├── Badge.jsx + .css   ← green, blue, amber, red color variants
        │   ├── Card.jsx + .css    ← Surface card with optional accent top border
        │   └── Spinner.jsx + .css ← Animated loading spinner
        │
        └── 📦 pages/              ← One file per page view
            ├── LoginPage.jsx      ← Login form + demo account buttons
            ├── DashboardPage.jsx  ← Stats, recent bookings, charts, workload
            ├── TimetablePage.jsx  ← Full grid, drag-drop, copy-paste, conflict preview
            ├── RoomsPage.jsx      ← Cards with equipment, utilization bars, CRUD
            ├── TeachersPage.jsx   ← Directory with availability, workload tracking
            ├── ConflictsPage.jsx  ← Grouped conflict list with icons
            ├── ReportsPage.jsx    ← 4 tabs: utilization, workload, class summary, charts
            └── SettingsPage.jsx   ← Saturday toggle, time slots, holidays, blocked slots
```

---

## 🚀 Quick Start

### Option A — Docker (Recommended)
```bash
git clone <repo>
cd pu-scheduler
docker-compose up --build
```
- Frontend → http://localhost:5173
- Backend  → http://localhost:8080

### Option B — Manual

**1. MySQL Setup**
```bash
mysql -u root -p < database/schema.sql
```

**2. Backend**
```bash
cd backend
# Edit src/main/resources/application.properties
# Change: spring.datasource.password=YOUR_MYSQL_PASSWORD
mvn spring-boot:run
```

**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Demo Accounts

| Username | Password    | Role    |
|----------|-------------|---------|
| admin    | password123 | ADMIN   |
| smith    | password123 | TEACHER |
| patel    | password123 | TEACHER |
| viewer   | password123 | VIEWER  |

---

## 🔐 Role-Based Access Control (RBAC)

| Feature                  | ADMIN | TEACHER | VIEWER |
|--------------------------|:-----:|:-------:|:------:|
| View timetable           | ✅    | ✅      | ✅     |
| Add/Edit/Delete slots    | ✅    | ❌      | ❌     |
| Manage rooms             | ✅    | ❌      | ❌     |
| Manage teachers          | ✅    | ❌      | ❌     |
| View conflicts           | ✅    | ✅      | ✅     |
| View reports & charts    | ✅    | ✅      | ✅     |
| Export CSV / Print PDF   | ✅    | ✅      | ❌     |
| Settings & configuration | ✅    | ❌      | ❌     |

---

## 🌐 API Reference

| Method | Endpoint                    | Role   | Description                     |
|--------|-----------------------------|--------|---------------------------------|
| POST   | /api/auth/login             | Public | Login → JWT token               |
| GET    | /api/slots                  | All    | List all slots                  |
| POST   | /api/slots                  | ADMIN  | Create slot (with conflict guard)|
| PUT    | /api/slots/{id}             | ADMIN  | Update slot                     |
| PUT    | /api/slots/{id}/move        | ADMIN  | Drag & drop reschedule          |
| POST   | /api/slots/{id}/copy        | ADMIN  | Copy slot to new cell           |
| DELETE | /api/slots/{id}             | ADMIN  | Delete slot                     |
| GET    | /api/rooms                  | All    | List rooms with utilization     |
| POST   | /api/rooms                  | ADMIN  | Add room                        |
| PUT    | /api/rooms/{id}             | ADMIN  | Update room                     |
| DELETE | /api/rooms/{id}             | ADMIN  | Delete room (safety check)      |
| GET    | /api/teachers               | All    | List teachers with workload     |
| POST   | /api/teachers               | ADMIN  | Add teacher                     |
| PUT    | /api/teachers/{id}          | ADMIN  | Update teacher                  |
| DELETE | /api/teachers/{id}          | ADMIN  | Delete teacher (safety check)   |
| GET    | /api/conflicts              | All    | Run 5-type conflict detection   |
| GET    | /api/holidays               | All    | List holidays                   |
| POST   | /api/holidays               | ADMIN  | Add holiday                     |
| DELETE | /api/holidays/{id}          | ADMIN  | Delete holiday                  |
| GET    | /api/blocked-slots          | All    | List blocked slots              |
| POST   | /api/blocked-slots          | ADMIN  | Block a slot                    |
| DELETE | /api/blocked-slots/{id}     | ADMIN  | Unblock a slot                  |
| GET    | /api/settings               | All    | Get all app settings            |
| PUT    | /api/settings/{key}         | ADMIN  | Update a setting                |

---

## 🧩 Key Features

- **Interactive Timetable** — weekly grid with drag-and-drop rescheduling
- **Copy-Paste Slots** — duplicate any class to another time slot
- **5-Type Conflict Detection** — room, teacher, class, availability, workload
- **Real-Time Warnings** — conflict previews while filling the schedule form
- **Teacher Management** — profiles, day-wise availability, workload limits
- **Room Management** — equipment tags, maintenance status, utilization bars
- **Reports & Charts** — utilization, workload, class summary + Recharts graphs
- **Export** — CSV for all entities, print-ready PDF timetable
- **Settings** — Saturday toggle, custom time slots, holidays, blocked slots
- **JWT Auth** — stateless, token-based authentication
- **RBAC** — 3 roles with granular UI and API-level restrictions
- **Mobile Responsive** — collapsible sidebar, stacked layouts

---

## 🛠 Tech Stack

| Layer    | Technology                           |
|----------|--------------------------------------|
| Frontend | React 18, Vite, React Router 6       |
| Styling  | CSS Modules, Syne + DM Sans fonts    |
| Charts   | Recharts                             |
| HTTP     | Axios with JWT interceptor           |
| Backend  | Spring Boot 3.2, Java 17             |
| Security | Spring Security + JWT (JJWT 0.11)    |
| ORM      | Spring Data JPA + Hibernate          |
| Database | MySQL 8.0                            |
| Build    | Maven, Vite                          |
| Deploy   | Docker + Docker Compose              |
