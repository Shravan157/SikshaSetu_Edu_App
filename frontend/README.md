# College Portal Frontend

A modern, responsive React frontend for the College Portal management system.

## Features

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Professional Interface**: Clean, modern design with intuitive navigation
- **Dark/Light Theme**: Consistent color scheme with primary blue theme
- **Interactive Components**: Smooth animations and transitions

### 🔐 Authentication & Authorization
- **Role-based Access Control**: Different interfaces for Admin, Faculty, and Students
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Route-level security based on user roles
- **Session Management**: Automatic token refresh and logout

### 📊 Dashboard & Analytics
- **Role-specific Dashboards**: Customized dashboards for each user type
- **Statistics Cards**: Key metrics and KPIs at a glance
- **Recent Activity**: Latest notifications and events
- **Quick Actions**: Easy access to frequently used features

### 👥 User Management (Admin)
- **User CRUD Operations**: Create, read, update, delete users
- **Role Management**: Assign and modify user roles
- **User Search & Filter**: Find users quickly
- **Bulk Operations**: Manage multiple users at once

### 🎓 Student Management
- **Student Profiles**: Comprehensive student information
- **Branch Assignment**: Link students to academic branches
- **Year & Semester Tracking**: Academic progress tracking
- **Search & Filter**: Advanced filtering options

### 👨‍🏫 Faculty Management
- **Faculty Profiles**: Faculty information and assignments
- **Branch Association**: Link faculty to departments
- **Contact Information**: Easy access to faculty details

### 🏢 Branch Management
- **Department Setup**: Create and manage academic branches
- **Branch Information**: Detailed branch descriptions
- **Student/Faculty Counts**: Track enrollment and assignments

### 📅 Attendance System
- **Mark Attendance**: Individual and bulk attendance marking
- **Attendance Reports**: Comprehensive attendance statistics
- **Student View**: Students can view their attendance records
- **Faculty Tools**: Easy attendance management for faculty

### 📈 Results Management
- **Grade Entry**: Input and manage student results
- **GPA Calculation**: Automatic GPA and grade calculations
- **Result Reports**: Detailed academic performance reports
- **Student Access**: Students can view their results

### 📅 Events Management
- **Event Creation**: Create and manage college events
- **File Attachments**: Attach documents to events
- **Event Calendar**: Visual event scheduling
- **Notifications**: Automatic event notifications

### 📚 Notes System
- **Study Materials**: Upload and manage study notes
- **File Attachments**: Support for various file types
- **Subject Organization**: Organize notes by subject
- **Download Access**: Easy access to study materials

### 🔔 Notification System
- **Real-time Notifications**: Instant notification delivery
- **Notification Types**: Different types for various purposes
- **Read/Unread Status**: Track notification status
- **Bulk Actions**: Mark all as read functionality

### 🤖 AI Chatbot
- **Interactive Chat**: AI-powered assistance
- **Context-aware**: Understands college portal context
- **Quick Questions**: Pre-defined common questions
- **Chat History**: Maintain conversation history

## Technology Stack

### Frontend Framework
- **React 18**: Latest React with hooks and functional components
- **React Router v6**: Modern routing with nested routes
- **Context API**: State management for authentication

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Beautiful SVG icons
- **Custom Components**: Reusable UI components
- **Responsive Grid**: Mobile-first responsive design

### HTTP & API
- **Axios**: HTTP client with interceptors
- **JWT Handling**: Automatic token management
- **Error Handling**: Comprehensive error management
- **File Upload**: Support for file uploads

### Notifications & UX
- **React Toastify**: Toast notifications
- **Loading States**: Loading spinners and states
- **Form Validation**: Client-side form validation
- **Confirmation Dialogs**: User action confirmations

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── ConfirmDialog.js
│   │   │   ├── LoadingSpinner.js
│   │   │   ├── Modal.js
│   │   │   └── ProtectedRoute.js
│   │   └── layout/
│   │       ├── Header.js
│   │       ├── Layout.js
│   │       └── Sidebar.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── constants/
│   │   └── roles.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── Attendance.js
│   │   ├── Branches.js
│   │   ├── Chatbot.js
│   │   ├── Dashboard.js
│   │   ├── Events.js
│   │   ├── Faculty.js
│   │   ├── Notes.js
│   │   ├── NotFound.js
│   │   ├── Notifications.js
│   │   ├── Results.js
│   │   ├── Students.js
│   │   ├── Unauthorized.js
│   │   └── Users.js
│   ├── utils/
│   │   └── api.js
│   ├── App.js
│   ├── index.css
│   └── index.js
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running on http://localhost:8080

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Configuration

### API Configuration
Update the API base URL in `src/utils/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

### Environment Variables
Create a `.env` file in the frontend directory:
```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_NAME=College Portal
```

## User Roles & Permissions

### Admin
- Full access to all features
- User management
- System configuration
- All CRUD operations

### Faculty
- Student management
- Attendance marking
- Result entry
- Event creation
- Note management

### Student
- View personal information
- Check attendance
- View results
- Access events and notes
- Use chatbot

## API Integration

The frontend integrates with the following backend endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/request-password-reset` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `PUT /api/users/{id}/role` - Change user role

### Student Management
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

### Faculty Management
- `GET /api/faculties` - Get all faculties
- `POST /api/faculties` - Create faculty
- `PUT /api/faculties/{id}` - Update faculty
- `DELETE /api/faculties/{id}` - Delete faculty

### Branch Management
- `GET /api/branches` - Get all branches
- `POST /api/branches` - Create branch
- `PUT /api/branches/{id}` - Update branch
- `DELETE /api/branches/{id}` - Delete branch

### Attendance
- `GET /api/attendance` - Get all attendance
- `POST /api/attendance` - Mark attendance
- `POST /api/attendance/mark` - Bulk mark attendance
- `GET /api/attendance/my` - Get my attendance

### Results
- `GET /api/results` - Get all results
- `POST /api/results` - Create result
- `GET /api/results/student/{id}` - Get student results

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (with file upload)
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event
- `GET /api/events/attachment/{id}` - Download attachment

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note (with file upload)
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note
- `GET /api/notes/attachment/{id}` - Download attachment

### Notifications
- `GET /api/notifications/my` - Get my notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/{id}/mark-read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read

### Chatbot
- `POST /api/chatbot/ask` - Ask question
- `POST /api/chatbot/clear` - Clear chat

## Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured interface with sidebar navigation
- **Tablet**: Collapsible sidebar with touch-friendly interactions
- **Mobile**: Mobile-optimized interface with hamburger menu

### Breakpoints
- `sm`: 640px and up
- `md`: 768px and up
- `lg`: 1024px and up
- `xl`: 1280px and up

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.