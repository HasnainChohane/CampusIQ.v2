# DepartmentHub — AI-Powered Department Management & Intelligence Platform

> **Hackathon MVP v1.0**  
> Centralized departmental platform for managing academic, operational, administrative, and financial activities with an integrated AI intelligence layer.

---

## 1. Prerequisites
- **Node.js**: v18.0+ or v24.x
- **XAMPP / MySQL**: MySQL/MariaDB running on default port `3306` (or standalone MySQL)
- **Web Browser**: Modern Chromium or Firefox

---

## 2. Quick Local Setup

### Step 1: Start MySQL in XAMPP
Open the **XAMPP Control Panel** and click **Start** next to **MySQL** (and Apache if needed).

### Step 2: Configure Environment
Copy `.env.example` to `.env` in both the project root and `backend/`:
```bash
# Database Configuration (Default XAMPP credentials)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=departmenthub_db

PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=departmenthub_jwt_secure_secret_key_2026_mvp
```

### Step 3: Install Dependencies
```bash
# In backend directory:
cd backend
npm install

# In frontend directory:
cd ../frontend
npm install
```

### Step 4: Initialize and Seed MySQL Database
Run the automated schema and seed runner:
```bash
cd backend
npm run db:init
```
*This command creates the database `departmenthub_db`, establishes all 16 tables with foreign keys and indexes from `database/schema.sql`, and inserts 204+ realistic records from `database/seed.sql`.*

---

## 3. Starting the Application

### Option A: Start Services Individually
1. **Start Backend API (Port 5000)**:
   ```bash
   cd backend
   npm run dev
   # Server runs at http://localhost:5000
   # Health check: http://localhost:5000/api/health
   # DB health:    http://localhost:5000/api/health/db
   ```

2. **Start Frontend (Port 5173)**:
   ```bash
   cd frontend
   npm run dev
   # Application opens at http://localhost:5173
   ```

---

## 4. Seeded Test Accounts

All seeded accounts use the default password: **`Password123!`**

| Role | Email | Name | Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@departmenthub.edu` | Dr. Eleanor Vance | Full department management, approval authority, financial oversight, report exports |
| **Officer / Manager** | `officer@departmenthub.edu` | Marcus Thorne | Review requests, inventory tracking, budget & expense recording |
| **Faculty / Department Head** | `faculty@departmenthub.edu` | Dr. Alan Turing | Submit & track requests, course & workload overview, assigned assets |
| **Staff Member** | `staff@departmenthub.edu` | Sarah Jenkins | General and supply purchase requests |

---

## 5. Health Check API Endpoints

- **`GET /api/health`**: Returns backend runtime status, uptime, node version, and environment.
- **`GET /api/health/db`**: Returns live MySQL connection status, ping latency, and real-time count of all 16 database tables.

---

## 6. Project Architecture

```
/dphub
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers (healthController, etc.)
│   │   ├── routes/           # Express route definitions
│   │   ├── services/         # Business logic & AI service layers
│   │   ├── middleware/       # Error handling, JWT auth guards
│   │   ├── db/               # MySQL pool connection & seed scripts
│   │   ├── app.js            # Express application setup
│   │   └── server.js         # HTTP server entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components & HealthDashboard
│   │   ├── pages/            # View pages (Dashboard, Academic, Finance, etc.)
│   │   ├── layouts/          # Application shell (Sidebar, Topbar)
│   │   ├── services/         # API HTTP client
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Formatting & calculation utilities
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css         # Design system styling & design tokens
│   ├── package.json
│   └── vite.config.js
├── database/
│   ├── schema.sql            # Full MySQL schema (16 tables, constraints, indexes)
│   └── seed.sql              # Realistic seed data (204 records)
├── docs/
│   ├── PRD.md
│   └── API_NOTES.md
├── DEVELOPMENT_STATUS.md     # Development roadmap & milestone tracker
└── README.md
```
