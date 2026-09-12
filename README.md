# CampusIQ — AI-Powered Academic & Department Intelligence Platform

> **Comprehensive Department Management & Intelligence Platform**  
> Centralized workspace for managing academic curricula, faculty workloads, physical asset inventory, operational requests, financial budgets, and automated audit reports with an integrated, zero-hallucination Grounded AI intelligence layer.

---

## 🌟 Key Capabilities & Architecture

1. **🇵🇰 Regional Localization & Multi-Currency System**:
   - **Default Currency**: Pakistani Rupee (`PKR` / `Rs.`) configured across all metrics, transaction ledgers, budget charts, and valuation figures.
   - **Interactive Settings Studio**: Accessible via the gear icon on the top-right header, allowing live switching between **PKR (Rs.)**, **USD ($)**, and **EUR (€)** with real-time exchange rate calculation.
   - **Institution & Department Customization**: Configurable University and Department metadata (e.g. *NUST*, *FAST-NUCES*, *Punjab University*, *QAU*).

2. **📌 Fixed-Sidebar Viewport Layout & Dynamic 2-per-row Rearrangeable Cards**:
   - Sticky, non-scrolling left navigation sidebar locked to the screen viewport height (`100vh`).
   - Main page workspace scrolls smoothly and independently with a persistent top navigation bar.
   - Interactive Executive Dashboard with 2-cards-per-row grid layout and dedicated top-right drag handles.

3. **👥 Authentic Regional Dataset & Personalized User Profiles**:
   - Pre-seeded with authentic Pakistani faculty, administrative staff, student roll numbers (`2023-CS-041`), courses, and realistic financial figures in PKR.
   - Dedicated User Profile and Department Profile customization settings with instant persistence.

4. **🎓 Academic & Curriculum Management**:
   - Track students, GPA distributions, and academic standing watchlist.
   - Monitor faculty credit-hour workloads with safety threshold warnings ($\ge 12$ credit hours/week).
   - Real-time course capacity utilization and database-backed student enrollment roster.

5. **📦 Operations & Physical Asset Inventory**:
   - Hardware, lab equipment, computing nodes, and projectors with condition tags (`Good`, `Fair`, `Damaged`).
   - Dynamic asset assignment tracking (custody history by faculty member or lab location) with automated return workflows.

6. **📝 Requests & Approval Workflow with AI Extraction**:
   - Multi-role approval pipeline (`Pending` → `Under Review` → `Approved` / `Returned` / `Rejected`).
   - Instant NLP text analysis: automatically classifies request type, priority, and extracts structured JSON parameters (items, quantities, dates, budget requirements).
   - **Connected Purchase Workflow**: Approving equipment purchase atomically records an expense entry and adds the asset into physical inventory.

7. **💰 Financial & Budget Management**:
   - Real-time tracking of research grants, tuition allocations, and operational expense ledgers.
   - Budget period utilization, revenue goal progress indicators, and interactive monthly trend charts.

8. **🤖 Grounded AI Intelligence Assistant**:
   - Zero-hallucination natural language Q&A engine executing deterministic SQL queries against local MySQL database (`departmenthub_db`).
   - Displays real-time grounding verification badges, confidence scores, supporting SQL data rows, and direct module navigation links.

9. **📄 Verified Management Reports & PDF Generator**:
   - Instant 1-click generation of verified Academic, Financial, Inventory, and Procurement audit reports.
   - Synthesizes grounded AI executive summaries with interactive printable preview and PDF export.

---

## 1. Prerequisites

- **Node.js**: v18.0+ or v20.x / v22.x / v24.x
- **XAMPP / MySQL**: MySQL or MariaDB running on default port `3306`
- **Web Browser**: Modern Chromium (Chrome / Edge) or Firefox

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
JWT_SECRET=campusiq_jwt_secure_secret_key_2026
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
Run the automated schema creation and seeding script:
```bash
cd backend
npm run db:init
```
*This command initializes `departmenthub_db`, configures all 16 relational tables with foreign keys and indexes from `database/schema.sql`, and inserts 200+ realistic Pakistani records from `database/seed.sql`.*

---

## 3. Running the Application

### Option A: Start Services
1. **Start Backend Server (Port 5000)**:
   ```bash
   cd backend
   npm run dev
   # API running at http://localhost:5000
   # Health check: http://localhost:5000/api/health
   # DB health:    http://localhost:5000/api/health/db
   ```

2. **Start Frontend Client (Port 5173)**:
   ```bash
   cd frontend
   npm run dev
   # Web app opens at http://localhost:5173
   ```

---

## 4. Seeded Test Accounts

All demo accounts use the standard password: **`Password123!`**

| Role | Email | Name | Designation & Access |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@departmenthub.edu` | **Dr. Khurram Nadeem** | Professor & Department Chair • Full governance, financial authorization, executive report generation |
| **Officer / Manager** | `officer@departmenthub.edu` | **Syed Muhammad Ali** | Senior Administrative Officer • Request reviewer, asset issue/return, expense recording |
| **Faculty Member** | `faculty@departmenthub.edu` | **Dr. Ayesha Khan** | Associate Professor (AI & ML) • Request submission, course roster & workload overview, assigned assets |
| **Staff Member** | `staff@departmenthub.edu` | **Muhammad Rizwan** | Senior Hardware Lab Coordinator • Hardware maintenance and procurement requests |

> **Tip:** You can switch between demo accounts instantly from the top-right role dropdown in the application header without having to re-login.

---

## 5. API Endpoints Overview

| Category | Method & Path | Description | Access |
| :--- | :--- | :--- | :--- |
| **System** | `GET /api/health` | Server runtime status, uptime & environment | Public |
| **System** | `GET /api/health/db` | Real-time MySQL connection latency & table metrics | Public |
| **Auth** | `POST /api/auth/login` | Authenticate user & issue JWT token | Public |
| **Auth** | `GET /api/auth/me` | Retrieve current authenticated user profile | Authenticated |
| **Dashboard** | `GET /api/dashboard/stats` | Aggregated KPIs, charts, insights & recent feeds | Authenticated |
| **Academic** | `GET /api/students` | Search and filter student records & GPAs | Authenticated |
| **Academic** | `GET /api/faculty` | Faculty directory, teaching hours & workload status | Authenticated |
| **Academic** | `GET /api/courses` | Course catalog, capacity meters & enrolled rosters | Authenticated |
| **Academic** | `POST /api/courses/enroll` | Enroll a student into an active course offering | Officer / Admin |
| **Inventory** | `GET /api/inventory` | Hardware & physical asset registry with filters | Authenticated |
| **Inventory** | `POST /api/inventory` | Create new inventory asset | Officer / Admin |
| **Inventory** | `POST /api/inventory/:id/assign` | Assign equipment to faculty or lab location | Officer / Admin |
| **Inventory** | `POST /api/inventory/assignments/:id/return` | Mark assigned asset as returned to stock | Officer / Admin |
| **Requests** | `GET /api/requests` | List operational & procurement requests | Authenticated |
| **Requests** | `POST /api/requests` | Submit request (triggers automated AI extraction) | Authenticated |
| **Requests** | `POST /api/requests/analyze` | Live interactive AI text classification & JSON preview | Authenticated |
| **Requests** | `POST /api/requests/:id/status` | Approve, Return with Remarks, or Reject request | Officer / Admin |
| **Finance** | `GET /api/finance/overview` | Revenue, expenses, net surplus, budget utilization | Officer / Admin |
| **Finance** | `POST /api/finance/revenue` | Record external grant or income entry | Officer / Admin |
| **Finance** | `POST /api/finance/expenses` | Record operational expense item | Officer / Admin |
| **Finance** | `POST /api/finance/budgets` | Allocate new operating budget period | Officer / Admin |
| **AI Assistant** | `GET /api/ai/suggestions` | Suggested natural language database queries | Authenticated |
| **AI Assistant** | `POST /api/ai/query` | Grounded SQL execution with data verification | Authenticated |
| **Reports** | `GET /api/reports` | List historical generated reports archive | Officer / Admin |
| **Reports** | `POST /api/reports/generate` | Synthesize live report with AI summary & printable export | Officer / Admin |

---

## 6. Project Directory Structure

```
/campusiq
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers (academic, inventory, requests, finance, reports, ai)
│   │   ├── routes/           # Express REST route definitions
│   │   ├── services/         # Business logic, AI analysis & grounded SQL engine
│   │   ├── middleware/       # JWT auth, RBAC role guards, error handling
│   │   ├── db/               # MySQL connection pool & seed runners
│   │   ├── app.js            # Express app configuration & middleware
│   │   └── server.js         # HTTP server entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components & SettingsModal
│   │   ├── context/          # AuthContext & SettingsContext (Currency, Regional configs)
│   │   ├── layouts/          # AppLayout shell (Fixed sticky sidebar, Header, Nav)
│   │   ├── pages/            # Dashboard, Academic, Inventory, Requests, Finance, Reports, AI Assistant, Health
│   │   ├── services/         # Axios API client
│   │   ├── App.jsx           # Routing & global providers
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Design system tokens & typography
│   ├── package.json
│   └── vite.config.js
├── database/
│   ├── schema.sql            # Full MySQL schema (16 tables, constraints, indexes)
│   └── seed.sql              # Realistic Pakistani dataset (200+ records)
├── docs/
│   ├── PRD.md
│   └── API_NOTES.md
├── DEVELOPMENT_STATUS.md     # Development milestone verification tracker
└── README.md
```

---

## 7. License & Compliance
Built with ❤️ for advanced institutional management and academic operations.
