# MindTrack Deployment Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- SSL certificate for HTTPS (required for production)

## Environment Setup

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb mindtrack

# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Update server/.env with your database credentials
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Run Database Migration

```bash
npm run migrate
```

### 4. Development

```bash
# Run both client and server
npm run dev

# Or run separately:
npm run dev:client  # Client on http://localhost:5173
npm run dev:server  # Server on http://localhost:5000
```

## Production Deployment

### Security Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Enable HTTPS/TLS
- [ ] Set NODE_ENV=production
- [ ] Configure CORS to allow only your domain
- [ ] Enable database SSL connections
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Review and enable audit logging
- [ ] Set up monitoring and alerting

### Build for Production

```bash
npm run build
```

### Environment Variables (Production)

```bash
# Server
PORT=5000
NODE_ENV=production
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=mindtrack
DB_USER=your-db-user
DB_PASSWORD=strong-password
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
CLIENT_URL=https://yourdomain.com
APP_URL=https://yourdomain.com

# Client
VITE_API_URL=https://api.yourdomain.com/api
```

## HIPAA Compliance Considerations

### Technical Safeguards

1. **Encryption**
   - All data transmitted over HTTPS/TLS
   - Database connections use SSL
   - Consider encrypting sensitive fields at rest

2. **Access Controls**
   - JWT-based authentication
   - Role-based access (patient/provider)
   - Session timeout after 7 days

3. **Audit Logging**
   - All data access logged in `audit_logs` table
   - Includes user ID, action, timestamp, IP address

4. **Data Minimization**
   - Only collect necessary health information
   - Automatic session expiration
   - Shared reports expire after 7 days

### Administrative Safeguards

1. **Business Associate Agreements (BAA)**
   - Required with hosting provider
   - Required with any third-party services

2. **Training**
   - Staff must complete HIPAA training
   - Document all training sessions

3. **Policies & Procedures**
   - Incident response plan
   - Breach notification procedures
   - Data retention and disposal policies

### Physical Safeguards

1. **Server Security**
   - Use reputable cloud provider with HIPAA compliance
   - Enable encryption at rest
   - Regular security updates

## Monitoring

### Health Check

```bash
curl http://localhost:5000/health
```

### Database Monitoring

Monitor these metrics:
- Connection pool usage
- Query performance
- Disk space
- Backup status

## Backup Strategy

```bash
# Daily automated backups
pg_dump mindtrack > backup_$(date +%Y%m%d).sql

# Retention: 30 days minimum
```

## Disaster Recovery

1. Database backups stored in separate region
2. Recovery Time Objective (RTO): 4 hours
3. Recovery Point Objective (RPO): 24 hours
4. Test recovery procedures quarterly
