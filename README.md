# Live Chats 

A full-stack real-time video conferencing application built using **React, Node.js, Express, MongoDB, WebRTC, and Socket.IO**.

Users can create or join meetings, communicate through video/audio calls, share screens, chat in real-time, and maintain meeting history.

---

## 🚀 Features

### 🔐 Authentication

* User Registration
* User Login
* Secure Password Hashing using bcrypt
* Session Token Generation

### 🎥 Video Conferencing

* Real-time Peer-to-Peer Video Calls using WebRTC
* Multiple Participants Support
* Camera On/Off Controls
* Microphone Mute/Unmute Controls

### 🖥️ Screen Sharing

* Share Entire Screen
* Stop Screen Sharing Anytime
* Automatic Stream Switching

### 💬 Real-Time Chat

* Instant Messaging during Meetings
* Chat History for Active Meeting
* Unread Message Counter

### 👤 Guest Support

* Join meetings without creating an account
* Avatar fallback when camera permission is unavailable

### 📜 Meeting History

* Store Meeting Codes
* View Previous Meetings
* Meeting Date Tracking

### 📱 Responsive Design

* Mobile Friendly Interface
* Adaptive Meeting Layout

### ⚠️ Error Handling

* Camera Permission Errors
* Microphone Permission Errors
* Connection Errors
* Screen Sharing Errors

---

## 🛠️ Tech Stack

### Frontend

* React
* React Router
* Material UI (MUI)
* Axios
* Socket.IO Client
* Vite

### Backend

* Node.js
* Express.js
* Socket.IO
* MongoDB
* Mongoose
* bcrypt
* dotenv

### Real-Time Communication

* WebRTC
* Socket.IO

---

## 📂 Project Structure

```text
Live-Chats/
│
├── Frontend/
│   ├── src/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── utils/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── app.js
│   │
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-username/live-chats.git
cd live-chats
```

---

### 2. Install Backend Dependencies

```bash
cd Backend
npm install
```

---

### 3. Install Frontend Dependencies

```bash
cd ../Frontend
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file inside the Backend folder:

```env
PORT=8000

MONGODB_URL=your_mongodb_connection_string
```

Create a `.env` file inside the Frontend folder:

```env
VITE_API_URL=http://localhost:8000
```

---

## ▶️ Running the Application

### Start Backend

```bash
cd Backend
npm run dev
```

Backend runs on:

```text
http://localhost:8000
```

---

### Start Frontend

```bash
cd Frontend
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

---

## 🔄 Application Flow

### Authentication

1. User registers an account.
2. Password is hashed using bcrypt.
3. User logs in.
4. Token is generated and stored.

### Meeting

1. User enters a meeting code.
2. Meeting code is stored in history.
3. Socket.IO establishes communication.
4. WebRTC creates peer-to-peer connections.
5. Users can:

   * Enable/Disable Camera
   * Mute/Unmute Microphone
   * Share Screen
   * Chat in Real Time

### History

1. Meeting codes are stored in MongoDB.
2. Users can access previous meeting records.

---

## 🗄️ Database Models

### User

```javascript
{
  name: String,
  username: String,
  password: String,
  token: String
}
```

### Meeting

```javascript
{
  user_id: String,
  meetingCode: String,
  date: Date
}
```

---

## 📸 Screens

* Landing Page
* Login / Register Page
* Home Dashboard
* Video Meeting Room
* Meeting History Page
* 404 Not Found Page

---

## 🔮 Future Improvements

* JWT Authentication
* Meeting Scheduling
* File Sharing
* Recording Meetings
* Participant List
* Chat Persistence
* TURN Server Support
* Dark Mode
* Meeting Invitations

---

## 👨‍💻 Author

**Bhavya Kumawat**

Built with ❤️ using React, Node.js, WebRTC, Socket.IO, and MongoDB.
