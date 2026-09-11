# DepartmentHub API Notes & Endpoints

## Base URL
`http://localhost:5000/api`

## Implemented in Phase 1 (Foundation & Health Check)
- `GET /api/health` - Basic server health, uptime, environment, node version.
- `GET /api/health/db` - Real-time database connection test, latency, table metrics, row counts.

## Scheduled in Subsequent Phases
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard/stats`
- `GET /api/students`, `POST /api/students`, `PUT /api/students/:id`, `DELETE /api/students/:id`
- `GET /api/faculty`, `POST /api/faculty`, `PUT /api/faculty/:id`
- `GET /api/courses`, `POST /api/courses`
- `GET /api/inventory`, `POST /api/inventory`, `POST /api/inventory/:id/assign`
- `GET /api/requests`, `POST /api/requests`, `POST /api/requests/:id/status`, `POST /api/requests/analyze`
- `GET /api/finance/overview`, `GET /api/finance/revenue`, `GET /api/finance/expenses`, `GET /api/finance/budget`
- `POST /api/ai/assistant`, `GET /api/ai/insights`
- `POST /api/reports/generate`, `GET /api/reports`
