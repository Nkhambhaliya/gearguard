# GearGuard - Maintenance Management System

A full-stack maintenance management system built with **React**, **Vite**, **Firebase**, and **Tailwind CSS**, following **strict MVVM architecture**.

## 🏗️ Architecture

This project follows a strict **Model-View-ViewModel (MVVM)** pattern:

- **Models** (`src/models/`): Plain JavaScript data structures
- **ViewModels** (`src/viewmodels/`): All Firebase operations and business logic
- **Views** (`src/views/`): React components (JSX only, no Firebase imports)

## 📁 Project Structure

```
src/
├── models/              # Data structures
│   ├── equipment.model.js
│   ├── team.model.js
│   ├── request.model.js
│   └── user.model.js
│
├── viewmodels/          # Business logic & Firebase
│   ├── auth.viewmodel.js
│   ├── equipment.viewmodel.js
│   ├── request.viewmodel.js
│   ├── kanban.viewmodel.js
│   └── calendar.viewmodel.js
│
├── views/               # React components
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── equipment/
│   │   ├── EquipmentList.jsx
│   │   └── AddEquipment.jsx
│   ├── requests/
│   │   ├── CreateRequest.jsx
│   │   └── KanbanBoard.jsx
│   └── calendar/
│       └── CalendarView.jsx
│
├── services/            # Firebase configuration
│   └── firebase.js
│
├── context/             # React context
│   └── AuthContext.jsx
│
├── App.jsx              # Routing
└── main.jsx             # Entry point
```

## 🚀 Features

### Equipment Management
- Track equipment by department
- Assign equipment to maintenance teams
- Smart "Maintenance (count)" button
- Scrap functionality to disable equipment

### Maintenance Requests
- **Corrective** and **Preventive** maintenance types
- Auto-fill team based on equipment selection
- Default status: **New**
- Technician self-assignment
- Duration tracking on completion

### Kanban Board
- Drag & drop workflow: **New → In Progress → Repaired → Scrap**
- Real-time updates
- Overdue request highlighting
- Technician avatars

### Calendar View
- Monthly calendar for preventive maintenance
- Click dates to view scheduled tasks
- Visual task indicators

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable **Authentication** (Email/Password)
3. Create a **Firestore Database**
4. Copy your Firebase config
5. Update `src/services/firebase.js` with your credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

Or manually copy the rules from `firestore.rules` to your Firebase console.

### 4. Create Sample Teams (Optional)

In Firestore console, create a `teams` collection with at least one team:

```json
{
  "name": "Maintenance Team A",
  "members": [],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 5. Run Development Server

```bash
npm run dev
```

## 📊 Firestore Collections

### users
```javascript
{
  uid: string,
  name: string,
  email: string,
  role: "manager" | "technician",
  createdAt: Date
}
```

### teams
```javascript
{
  name: string,
  members: string[],  // array of user UIDs
  createdAt: Date
}
```

### equipment
```javascript
{
  name: string,
  serialNumber: string,
  department: string,
  purchaseDate: Date,
  warranty: string,
  location: string,
  teamId: string,
  isScrapped: boolean,
  createdAt: Date
}
```

### requests
```javascript
{
  subject: string,
  description: string,
  equipmentId: string,
  teamId: string,
  type: "Corrective" | "Preventive",
  status: "New" | "In Progress" | "Repaired" | "Scrap",
  assignedTo: string | null,
  scheduledDate: Date | null,
  duration: number,
  createdAt: Date,
  createdBy: string
}
```

## 🔒 Security Rules

Firestore rules require authentication for all operations:

- Users can read all documents
- Users can only modify their own user document
- All other collections require authentication for CRUD operations

## 📦 Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **Firebase 12** - Backend (Auth + Firestore)
- **Tailwind CSS** - Styling
- **React Router DOM** - Routing
- **@hello-pangea/dnd** - Drag & drop for Kanban

## 🎯 User Roles

- **Manager**: Full access to all features
- **Technician**: Can create requests, self-assign, and update status

## 📝 Usage Flow

1. **Sign up** with email/password
2. Add **teams** in Firestore (or via admin UI if implemented)
3. Add **equipment** and assign to teams
4. Create **maintenance requests**
5. Use **Kanban board** to manage request workflow
6. Schedule **preventive maintenance** via Calendar

## 🔧 Development Notes

- All Firebase operations are in ViewModels
- Views only import ViewModels, never Firebase directly
- Models are pure data structures
- Real-time updates via Firestore listeners
- Protected routes require authentication

## 📄 License

MIT

---

**Built with ❤️ following strict MVVM architecture**
