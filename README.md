# MindTrack - Mental Health Tracking Application

A secure, HIPAA-compliant mental health tracking platform built with React, TypeScript, Node.js, and PostgreSQL.

## Features

### Patient Features
- **Medication Management**: Track medications with dosage, frequency, and reminders
- **Daily Logging**: Record mood, symptoms, side effects, and notes
- **Medication Adherence**: Mark medications as taken or skipped
- **Reports & Analytics**: View mood trends and adherence statistics
- **Data Export**: Export reports as PDF
- **Secure Sharing**: Share reports with healthcare providers via secure links

### Provider Features
- **Patient Dashboard**: View all assigned patients
- **Patient Data Access**: Access patient logs, medications, and trends
- **Clinical Notes**: Add provider notes to patient records
- **Medication Prescribing**: Add/edit medications for patients

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- Axios for API calls
- date-fns for date handling
- jsPDF for PDF generation

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- JWT authentication
- bcrypt for password hashing
- Helmet for security headers
- Rate limiting

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository

2. Start PostgreSQL (using Docker):
```bash
docker-compose up -d
```

3. Install dependencies:
```bash
npm run install:all
```

4. Set up environment variables:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

5. Configure your database in `server/.env` (defaults work with Docker setup)

6. Run database migration:
```bash
npm run migrate
```

7. Start development servers:
```bash
npm run dev
```

The client will run on http://localhost:5173 and the server on http://localhost:5000.

### Test Accounts

After migration, you can create test accounts via the signup flow or use the fixtures:
```bash
# Load test data (optional)
psql -U postgres -d mindtrack -f server/src/db/fixtures.sql
```

Default test password: `Test123!`

## Project Structure

```
mindtrack/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # React components
│   │   │   └── tabs/      # Tab components
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── db/            # Database schema & migrations
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Utility functions
│   │   └── index.ts       # Server entry point
│   └── package.json
└── package.json           # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login

### Medications
- `GET /api/medications` - Get all medications
- `POST /api/medications` - Create medication
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication
- `POST /api/medications/log` - Log medication taken/skipped
- `GET /api/medications/logs` - Get medication logs

### Daily Logs
- `GET /api/logs` - Get daily logs
- `POST /api/logs` - Create/update daily log

### Reports
- `GET /api/reports/stats` - Get statistics
- `POST /api/reports/share` - Create share link
- `GET /api/reports/shared/:token` - Access shared report

### Provider
- `GET /api/provider/patients` - Get patient list
- `GET /api/provider/patients/:id/data` - Get patient data
- `POST /api/provider/patients/:id/notes` - Add provider note
- `POST /api/provider/patients/:id/medications` - Prescribe medication

## Testing

```bash
# Run all tests
npm test

# Run server tests only
npm test --prefix server

# Run client tests only
npm test --prefix client
```

## Security Features

- JWT-based authentication with 7-day expiration
- Password hashing with bcrypt (10 rounds)
- HTTPS/TLS encryption (production)
- Rate limiting (100 requests per 15 minutes)
- Helmet security headers
- CORS configuration
- SQL injection prevention via parameterized queries
- XSS protection
- Audit logging for all data access

## HIPAA Compliance

This application implements HIPAA-aware design principles:

- **Audit Logging**: All data access is logged with user, action, timestamp, and IP
- **Access Controls**: Role-based access (patient/provider)
- **Data Encryption**: HTTPS for data in transit, database SSL for connections
- **Data Minimization**: Only necessary health information collected
- **Secure Sharing**: Time-limited share links (7-day expiration)
- **Session Management**: Automatic logout after 7 days

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full HIPAA compliance checklist.

## Database Schema

Key tables:
- `users` - User accounts (patients and providers)
- `medications` - Medication records
- `medication_logs` - Medication adherence logs
- `daily_logs` - Daily mood, symptoms, and notes
- `provider_patients` - Provider-patient relationships
- `provider_notes` - Clinical notes
- `audit_logs` - Audit trail for HIPAA compliance
- `shared_reports` - Secure report sharing

## Development

### Adding New Features

1. Create feature branch
2. Implement backend API endpoint
3. Add TypeScript types
4. Create React component
5. Add tests
6. Update documentation
7. Submit PR

### Code Style

- TypeScript strict mode enabled
- ESLint for linting
- Prettier for formatting
- Conventional commits

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions and HIPAA compliance checklist.

## License

Proprietary - All rights reserved

## Support

For support, email support@mindtrack.com

## Emergency Resources

If you're experiencing thoughts of self-harm or suicide:
- Call 988 (Suicide & Crisis Lifeline)
- Text "HELLO" to 741741 (Crisis Text Line)
- Call 911 for immediate emergency assistance
