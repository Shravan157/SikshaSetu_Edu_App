# SikshaSetu 

A modern, full‑stack portal for colleges and schools — user management, attendance, results, events, notes, notifications, AI assistant, and a virtual classroom powered by ZEGOCLOUD.

Java 17 · Spring Boot 3 · Maven · MySQL · JWT · React 18 · Tailwind CSS · ZEGOCLOUD UI Kit

---

## 🎬 Demo Video

[📹 Watch Demo Video](https://github.com/Shravan157/SikshaSetu_Edu_App/blob/main/frontend/public/WhatsApp%20Video%202025-10-29%20at%202%20(1).mp4)

---

## ✨ Features

- 🔐 Authentication & Authorization - JWT login/registration, role‑based access (Admin, Faculty, Student)
- 👥 Administration - Users, Students, Faculty, Branches with CRUD and search/filter
- 📝 Notes, 📅 Events, 🔔 Notifications
- 📊 Results and Attendance
- 🤖 AI Chatbot (Perplexity API) with clean Markdown answers and code blocks
- 🎥 Virtual Classroom - Schedule, Start/End, Join sessions (teacher & students)
  - ZEGOCLOUD prebuilt UI with copy‑link joining

---

## 🧭 Repository Layout

```
CollegePortal/
├── src/                    # Spring Boot backend
│   ├── main/java/com/ssid/collegeportal
│   └── main/resources      # application.properties (local, ignored)
├── frontend/               # React app (Create React App + Tailwind)
│   ├── src/
│   ├── public/
│   └── .env                # local env (ignored)
└── pom.xml, mvnw, mvnw.cmd # Maven wrapper
```

---

## ⚙️ Tech Stack

- Backend: Spring Boot 3 (Web, JPA, Security), Flyway, Lombok, MySQL
- Auth: JWT (custom provider & filter)
- Frontend: React 18, react‑router, Tailwind CSS, react‑markdown, highlight.js
- Video: ZEGOCLOUD UI Kit (virtual classroom)
- AI: Perplexity API (via Spring service)

---

## 🏗️ Architecture Overview

### Backend Architecture

- **Framework:** Spring Boot 3 with MVC pattern
- **Security:** JWT-based authentication with Spring Security
- **Database:** MySQL with JPA/Hibernate and Flyway migrations
- **API:** RESTful endpoints with role-based authorization
- **Services:** Modular service layer for business logic
- **Video Integration:** ZegoCloud SDK for real-time video conferencing

### Frontend Architecture

- **Framework:** React 18 with hooks and functional components
- **Routing:** React Router for client-side navigation
- **Styling:** Tailwind CSS for responsive design
- **State Management:** React Context for authentication
- **UI Components:** Headless UI and Heroicons for consistent design
- **Video UI:** ZegoCloud Prebuilt UI Kit for seamless video calls

### Database Schema

The application uses MySQL with the following key entities:

- **Users:** Authentication and role management (Admin, Faculty, Student)
- **Branches:** College branch/department management
- **Students/Faculty:** Extended user profiles
- **Attendance:** Student attendance records
- **Results:** Academic results and grades
- **Events:** College events and announcements
- **Notes:** Study materials organized by subject
- **Notifications:** System notifications
- **Video Sessions:** Virtual classroom sessions with ZegoCloud integration

---

## 🧑‍💻 Quick Start

### Prerequisites

- Java 17+, Maven
- Node 16+ (18 recommended), npm
- MySQL 8+ (or compatible)

### 1) Backend setup

1. Create your local config from the example:
   - Copy `src/main/resources/application-example.properties` → `src/main/resources/application.properties`

2. Edit the values:
   - Database: `spring.datasource.*`
   - JWT: `jwt.secret`
   - ZEGOCLOUD (server token, production‑grade): `zego.app.id`, `zego.server.secret`
   - Perplexity (optional for chatbot): `perplexity.api.key`

3. Run the server:
   - Windows: `mvnw.cmd spring-boot:run`
   - Mac/Linux: `./mvnw spring-boot:run`

Notes:
- DB migrations are applied via Flyway (files in `src/main/resources/db/migration`).
- Default CORS allows http://localhost:3000.

### 2) Frontend setup

1. Create env from the example:
   - Copy `frontend/.env.example` → `frontend/.env`

2. Edit the values:
   - `REACT_APP_API_URL` (default `http://localhost:8080/api`)
   - For local virtual classroom via ZEGOCLOUD Prebuilt UI (dev only):
     - `REACT_APP_ZEGO_APP_ID` and `REACT_APP_ZEGO_APP_SIGN`

3. Install & run:
   - `cd frontend`
   - `npm install`
   - `npm start`

---

## 🎥 Virtual Classroom (ZEGOCLOUD)

Two ways to use tokens:

- Dev (quick): Frontend generates a Kit Token using `REACT_APP_ZEGO_APP_SIGN`. Make sure your Zego console project whitelists `http://localhost:3000` and enables the Web Prebuilt/RTC product.
- Prod (secure): Backend generates tokens using `zego.server.secret`, and the frontend requests them (already wired if you switch to server tokens).

Flow:

1. Faculty: Virtual Classroom → Schedule → Start Now → joins `/video-call/:roomId`
2. Students: Join page → enter Room ID or open the copied invite link `/join/:roomId`

If you see Zego errors like `20014/50119/50120`, verify in Zego console:

- Web product is enabled for your AppId
- Your origin (localhost:3000) is whitelisted
- AppSign/AppId pair matches the project

---

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### User Management (Admin)

- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Student Management

- `GET /api/students` - List students
- `POST /api/students` - Create student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

### Faculty Management

- `GET /api/faculty` - List faculty
- `POST /api/faculty` - Create faculty
- `PUT /api/faculty/{id}` - Update faculty
- `DELETE /api/faculty/{id}` - Delete faculty

### Branch Management

- `GET /api/branches` - List branches
- `POST /api/branches` - Create branch
- `PUT /api/branches/{id}` - Update branch
- `DELETE /api/branches/{id}` - Delete branch

### Attendance

- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance

### Results

- `GET /api/results` - Get results
- `POST /api/results` - Add result
- `PUT /api/results/{id}` - Update result

### Events

- `GET /api/events` - List events
- `POST /api/events` - Create event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

### Notes

- `GET /api/notes` - List notes
- `POST /api/notes` - Create note
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note

### Notifications

- `GET /api/notifications` - List notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/{id}` - Update notification

### Virtual Classroom

- `POST /api/video-sessions` - Create video session (Faculty)
- `POST /api/video-sessions/{roomId}/join` - Join session (Student/Faculty)
- `GET /api/video-sessions/{roomId}` - Get session details
- `GET /api/video-sessions/teacher/{teacherId}` - Get teacher's sessions
- `POST /api/video-sessions/{roomId}/start` - Start session
- `POST /api/video-sessions/{roomId}/end` - End session
- `POST /api/video-sessions/zego/token` - Generate Zego token

### Chatbot

- `POST /api/chatbot/ask` - Ask AI question

---

## 🤖 Chatbot

- Renders clean Markdown with headings, bullets, and syntax‑highlighted code blocks.
- To enable Perplexity‑based responses, set `perplexity.api.key` in backend config.

---

## 🧪 Scripts & Commands

Backend

- Run: `mvnw.cmd spring-boot:run`

Frontend (from `frontend/`)

- Dev server: `npm start`
- Build: `npm run build`
- Test: `npm test`

---

## 🔐 Secrets & Local Configuration

- Never commit `frontend/.env` or `src/main/resources/application.properties` — both are ignored.
- Share `frontend/.env.example` and `application-example.properties` with collaborators.

---

## 🚀 Deployment

### Backend Deployment

1. **Build the application:**
   ```bash
   mvnw clean package
   ```

2. **Run with production profile:**
   ```bash
   java -jar target/CollegePortal-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
   ```

3. **Environment Variables for Production:**
   - Set up MySQL database
   - Configure JWT secret
   - Set ZegoCloud credentials
   - Configure Perplexity API key (optional)
   - Set upload directory path

### Frontend Deployment

1. **Build for production:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Serve static files:**
   - Deploy `build/` folder to web server (nginx, Apache, etc.)
   - Or use `serve -s build` for simple deployment

### Docker Deployment (Optional)

The project can be containerized using Docker:

- Create Dockerfile for backend
- Create Dockerfile for frontend
- Use docker-compose for orchestration

### Production Considerations

- Use HTTPS in production
- Configure CORS for your domain
- Set up proper logging
- Implement rate limiting
- Regular database backups
- Monitor application performance

---

## 🤝 Contributing

1. Fork → create a feature branch → commit → open PR.
2. Keep backend and frontend running locally to verify flows end‑to‑end.
3. For large UI changes, attach screenshots/GIFs.

---

## ❤️ Created with Love

created with ❤️ by Shravan
