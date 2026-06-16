# GramSathi - Rural Village Services Platform

GramSathi is a full-stack production-ready platform designed to empower rural India by providing access to essential services like Tractor booking, JCB booking, Labour hiring, Electricians, Plumbers, Government Schemes, Lost & Found, and Emergency Contacts.

## Tech Stack
- **Frontend**: React 19, Vite, Material UI, Redux Toolkit, React Router DOM, Axios.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Authentication, Socket.io.

## Project Structure
```text
gramsathi/
├── frontend/    # React frontend application
└── backend/     # Express REST API backend
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   The backend uses a `.env` file for configuration. Modify the existing `.env` file if you need custom database URLs.
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   The frontend uses a `.env` file to map to the API. 
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
