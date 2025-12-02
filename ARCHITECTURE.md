# MindTrack Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React 18 + TypeScript + Tailwind CSS                  │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │  Login   │  │ Patient  │  │ Provider │            │ │
│  │  │  Screen  │  │Dashboard │  │Dashboard │            │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  │                                                         │ │
│  │  Components: Home, Meds, Log, Reports, Profile        │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↕ HTTPS/TLS                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Express.js + TypeScript                               │ │
│  │  • Helmet (Security Headers)                           │ │
│  │  • CORS (Cross-Origin)                                 │ │
│  │  • Rate Limiting (100 req/15min)                       │ │
│  │  • JWT Authentication                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Auth   │  │   Meds   │  │   Logs   │  │ Provider │  │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Middleware: Authentication, Authorization, Validation ││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       Data Access Layer                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL 14+ with SSL                               │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │  Users   │  │   Meds   │  │  Logs    │            │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │ Provider │  │  Audit   │  │  Shared  │            │ │
│  │  │ Patients │  │  Logs    │  │ Reports  │            │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Patient Login Flow
```
User → LoginScreen → authApi.login() → POST /api/auth/login
                                              ↓
                                        Validate credentials
                                              ↓
                                        Generate JWT token
                                              ↓
                                        Return token + user
                                              ↓
                                    Store in localStorage
                                              ↓
                                    Redirect to PatientDashboard
```

### Medication Logging Flow
```
User clicks "Take" → handleMedicationAction() → medicationsApi.logMedication()
                                                        ↓
                                                POST /api/medications/log
                                                        ↓
                                                Validate JWT
                                                        ↓
                                                Check medication ownership
                                                        ↓
                                                Insert into medication_logs
                                                        ↓
                                                Create audit log entry
                                                        ↓
                                                Return success
                                                        ↓
                                                Refresh UI
```

### Daily Log Flow
```
User fills form → handleSave() → logsApi.create()
                                        ↓
                                POST /api/logs
                                        ↓
                                Validate JWT
                                        ↓
                                Validate input data
                                        ↓
                                Check for existing log (same date)
                                        ↓
                                Insert or Update daily_logs
                                        ↓
                                Create audit log entry
                                        ↓
                                Return log data
                                        ↓
                                Clear form & show success
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Network Security                                    │
│ • HTTPS/TLS encryption                                       │
│ • CORS configuration                                         │
│ • Rate limiting                                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Application Security                                │
│ • Helmet security headers                                    │
│ • Input validation (express-validator)                       │
│ • SQL injection prevention (parameterized queries)           │
│ • XSS protection                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Authentication & Authorization                       │
│ • JWT token validation                                       │
│ • Role-based access control                                  │
│ • Password hashing (bcrypt)                                  │
│ • Session management                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Data Security                                       │
│ • Database SSL connections                                   │
│ • Audit logging                                              │
│ • Data validation                                            │
│ • Access logging                                             │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

### Patient Dashboard
```
PatientDashboard
├── Header
├── Content (Tab-based)
│   ├── HomeTab
│   │   ├── WelcomeCard
│   │   ├── StatsCard
│   │   ├── ScheduleCard
│   │   └── QuickLogButton
│   ├── MedicationsTab
│   │   ├── MedicationList
│   │   ├── AddMedicationModal
│   │   └── EditMedicationModal
│   ├── LogTab
│   │   ├── MoodGrid
│   │   ├── SymptomChecklist
│   │   ├── SideEffectsChecklist
│   │   └── NotesTextarea
│   ├── ReportsTab
│   │   ├── DateRangeSelector
│   │   ├── MoodChart
│   │   ├── AdherenceChart
│   │   └── ExportButtons
│   └── ProfileTab
│       ├── ProfileInfo
│       ├── Settings
│       ├── Support
│       └── LogoutButton
└── BottomNavigation
```

### Provider Dashboard
```
ProviderDashboard
├── Header
├── Content (Tab-based)
│   ├── PatientsTab
│   │   └── PatientList
│   │       └── PatientCard[]
│   └── ProfileTab
│       ├── ProfileInfo
│       └── LogoutButton
└── BottomNavigation
```

## Database Schema Relationships

```
users (1) ──────────────────────────────────┐
  │                                          │
  │ (1:N)                                    │ (1:N)
  │                                          │
  ├─→ medications (N)                        ├─→ daily_logs (N)
  │     │                                    │
  │     │ (1:N)                              │
  │     │                                    │
  │     └─→ medication_logs (N)              │
  │                                          │
  │ (1:N)                                    │
  │                                          │
  └─→ reminders (N)                          │
                                             │
provider_patients (N:N relationship)         │
  ├─→ provider_id → users (provider)         │
  └─→ patient_id → users (patient) ──────────┘
        │
        │ (1:N)
        │
        └─→ provider_notes (N)

audit_logs (N) ← All actions logged
shared_reports (N) ← Patient can create
```

## API Request/Response Flow

### Example: Create Medication

**Request:**
```http
POST /api/medications
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "name": "Sertraline",
  "dosage": "50mg",
  "frequency": "once",
  "timeOfDay": "08:00"
}
```

**Server Processing:**
1. Helmet adds security headers
2. CORS validates origin
3. Rate limiter checks request count
4. Body parser parses JSON
5. JWT middleware validates token
6. Express-validator validates input
7. Route handler processes request
8. Database query executes
9. Audit log created
10. Response sent

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "uuid-here",
  "user_id": "user-uuid",
  "name": "Sertraline",
  "dosage": "50mg",
  "frequency": "once",
  "time_of_day": "08:00",
  "is_active": true,
  "created_at": "2024-12-01T10:00:00Z",
  "updated_at": "2024-12-01T10:00:00Z"
}
```

## Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────────────┐
│                         Load Balancer                        │
│                      (HTTPS Termination)                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                                           ↓
┌──────────────────┐                      ┌──────────────────┐
│  Web Server 1    │                      │  Web Server 2    │
│  (Node.js)       │                      │  (Node.js)       │
└──────────────────┘                      └──────────────────┘
        │                                           │
        └─────────────────────┬─────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  PostgreSQL      │
                    │  (Primary)       │
                    └──────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  PostgreSQL      │
                    │  (Replica)       │
                    └──────────────────┘
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI framework |
| Frontend | TypeScript | Type safety |
| Frontend | Tailwind CSS | Styling |
| Frontend | Vite | Build tool |
| Frontend | Axios | HTTP client |
| Frontend | React Router | Routing |
| Backend | Node.js | Runtime |
| Backend | Express | Web framework |
| Backend | TypeScript | Type safety |
| Backend | PostgreSQL | Database |
| Backend | JWT | Authentication |
| Backend | bcrypt | Password hashing |
| Backend | Helmet | Security headers |
| Backend | CORS | Cross-origin |
| Testing | Jest | Test framework |
| Testing | Supertest | API testing |
| DevOps | Docker | Containerization |
| DevOps | Docker Compose | Local development |

## Performance Optimizations

1. **Database**
   - Indexes on frequently queried columns
   - Connection pooling (max 20 connections)
   - Prepared statements

2. **API**
   - Rate limiting to prevent abuse
   - Efficient query design
   - Pagination (can be added)

3. **Frontend**
   - Code splitting (can be added)
   - Lazy loading (can be added)
   - Optimized bundle size
   - Efficient re-renders

4. **Caching**
   - Browser caching for static assets
   - API response caching (can be added)
   - Database query caching (can be added)

## Monitoring & Observability

### Recommended Tools
- **Application Monitoring**: New Relic, Datadog
- **Error Tracking**: Sentry
- **Log Aggregation**: ELK Stack, Splunk
- **Uptime Monitoring**: Pingdom, UptimeRobot
- **Database Monitoring**: pgAdmin, DataDog

### Key Metrics to Monitor
- API response times
- Error rates
- Database query performance
- Connection pool usage
- Memory usage
- CPU usage
- Disk space
- Active users
- Failed login attempts
- Audit log volume
