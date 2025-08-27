# FreelanceHub Backend API Documentation

## Overview
Complete API documentation for the FreelanceHub platform - a comprehensive freelancing marketplace connecting clients with skilled freelancers. This backend provides all the necessary endpoints for user management, project workflows, contract management, payments, messaging, and platform administration.

## Table of Contents

### Core Authentication & User Management
1. [Freelancer Registration & Onboarding API](./freelancer-registration-api.md)
2. [Client Registration & Onboarding API](./client-registration-api.md)

### Business Logic Modules
3. [Projects API](./projects-api.md) - Project lifecycle management
4. [Contracts API](./contracts-api.md) - Contract and milestone management
5. [Payments API](./payments-api.md) - Payment processing and escrow

### Communication & Social
6. [Messaging API](./messaging-api.md) - Real-time messaging system
7. [Reviews & Rating API](./reviews-api.md) - Review and rating system

### Supporting Services
8. [Additional Modules API](./additional-modules-api.md) - Uploads, Notifications, Admin, Public APIs

---

## Quick Start Guide

### Base URLs
- **Production**: `https://api.freelancehub.com`
- **Staging**: `https://staging-api.freelancehub.com`
- **Development**: `http://localhost:3000`

### API Versioning
All endpoints are versioned with `/api/v1/` prefix:
```
https://api.freelancehub.com/api/v1/{module}/{endpoint}
```

### Authentication
Most endpoints require JWT authentication:
```bash
Authorization: Bearer {jwt_token}
```

### Response Format
All responses follow this structure:
```json
{
  "success": true|false,
  "data": {}, // Response data (success only)
  "error": {}, // Error details (failure only)
  "pagination": {}, // Pagination info (where applicable)
}
```

---

## API Modules Overview

### 1. Authentication & User Management

**Freelancer Registration Flow**:
1. `POST /auth/register` - Create account
2. `POST /auth/verify-email` - Verify email
3. `POST /auth/setup-2fa` - Setup two-factor auth
4. `POST /freelancer/profile` - Complete profile
5. `POST /freelancer/portfolio` - Add portfolio items
6. `POST /auth/passkey/setup` - Setup passkey authentication

**Client Registration Flow**:
1. `POST /auth/register` - Create account
2. `POST /auth/verify-email` - Verify email
3. `POST /client/profile` - Complete business profile
4. `POST /client/verify-business` - Business verification

### 2. Project Lifecycle

**Complete Project Workflow**:
1. **Client Posts Project**: `POST /projects`
2. **Freelancers Browse**: `GET /projects` or `GET /projects/recommended`
3. **Freelancer Submits Proposal**: `POST /projects/{id}/proposals`
4. **Client Reviews Proposals**: `GET /projects/{id}/proposals`
5. **Client Accepts Proposal**: `POST /proposals/{id}/accept`
6. **Contract Created**: Automatic contract generation
7. **Project Execution**: Via Contracts API
8. **Project Completion**: `POST /projects/{id}/complete`
9. **Mutual Reviews**: Via Reviews API

### 3. Contract & Payment Management

**Contract Workflow**:
1. **Contract Creation**: `POST /contracts` (from accepted proposal)
2. **Contract Activation**: `POST /contracts/{id}/activate`
3. **Milestone Execution**:
   - Freelancer submits: `POST /contracts/{id}/milestones/{index}/submit`
   - Client reviews: `POST /contracts/{id}/milestones/{index}/review`
   - Payment released: Automatic via Payments API
4. **Contract Completion**: All milestones approved

**Payment Workflow**:
1. **Payment Intent**: `POST /payments/intent`
2. **Escrow Payment**: `POST /payments/escrow`
3. **Milestone Approval**: Triggers payment release
4. **Payment Release**: `POST /payments/escrow/{id}/release`

### 4. Communication System

**Messaging Features**:
- Direct messaging between users
- Project-specific conversations
- File attachments and media sharing
- Real-time notifications via WebSocket
- Message search and archiving

### 5. Review & Rating System

**Review Process**:
1. Project completion triggers review eligibility
2. Both parties can submit reviews
3. Reviews affect user ratings and rankings
4. Featured reviews boost user visibility

---

## Complete Endpoint Reference

### Authentication Endpoints
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/resend-verification
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/setup-2fa
POST   /api/v1/auth/verify-2fa
POST   /api/v1/auth/passkey/setup
POST   /api/v1/auth/passkey/authenticate
```

### Freelancer Management
```
GET    /api/v1/freelancer/profile
POST   /api/v1/freelancer/profile
PUT    /api/v1/freelancer/profile
GET    /api/v1/freelancer/dashboard
GET    /api/v1/freelancer/analytics
POST   /api/v1/freelancer/portfolio
PUT    /api/v1/freelancer/portfolio/{id}
DELETE /api/v1/freelancer/portfolio/{id}
GET    /api/v1/freelancer/bookmarks
POST   /api/v1/freelancer/availability
```

### Client Management
```
GET    /api/v1/client/profile
POST   /api/v1/client/profile
PUT    /api/v1/client/profile
GET    /api/v1/client/dashboard
GET    /api/v1/client/analytics
GET    /api/v1/client/freelancers
POST   /api/v1/client/freelancers/{id}/favorite
GET    /api/v1/client/payment-history
POST   /api/v1/client/verify-business
```

### Projects Management
```
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/{id}
PUT    /api/v1/projects/{id}
DELETE /api/v1/projects/{id}
GET    /api/v1/projects/my-projects
POST   /api/v1/projects/{id}/proposals
GET    /api/v1/projects/{id}/proposals
POST   /api/v1/projects/proposals/{id}/accept
POST   /api/v1/projects/proposals/{id}/reject
GET    /api/v1/projects/freelancer/proposals
GET    /api/v1/projects/recommended
GET    /api/v1/projects/templates
POST   /api/v1/projects/{id}/invite
GET    /api/v1/projects/{id}/analytics
POST   /api/v1/projects/{id}/complete
```

### Contracts Management
```
GET    /api/v1/contracts
POST   /api/v1/contracts
GET    /api/v1/contracts/{id}
PUT    /api/v1/contracts/{id}
DELETE /api/v1/contracts/{id}
POST   /api/v1/contracts/{id}/activate
GET    /api/v1/contracts/stats
POST   /api/v1/contracts/{id}/milestones/{index}/submit
POST   /api/v1/contracts/{id}/milestones/{index}/review
POST   /api/v1/contracts/{id}/modifications
POST   /api/v1/contracts/{id}/modifications/{index}/approve
PUT    /api/v1/contracts/{id}/status
```

### Payments Management
```
POST   /api/v1/payments/intent
POST   /api/v1/payments/confirm/{paymentIntentId}
POST   /api/v1/payments/escrow
POST   /api/v1/payments/escrow/{id}/release
POST   /api/v1/payments/{id}/refund
GET    /api/v1/payments/contract/{contractId}
GET    /api/v1/payments/my-payments
POST   /api/v1/payments/connected-account
GET    /api/v1/payments/account-status
POST   /api/v1/payments/webhook
```

### Messaging System
```
GET    /api/v1/messaging/messages
POST   /api/v1/messaging/messages
PUT    /api/v1/messaging/messages/{id}
DELETE /api/v1/messaging/messages/{id}
GET    /api/v1/messaging/conversations
POST   /api/v1/messaging/conversations
POST   /api/v1/messaging/messages/{id}/read
POST   /api/v1/messaging/conversations/{id}/read
POST   /api/v1/messaging/conversations/{id}/archive
GET    /api/v1/messaging/unread-count
GET    /api/v1/messaging/search
```

### Reviews & Ratings
```
GET    /api/v1/reviews
POST   /api/v1/reviews
GET    /api/v1/reviews/{id}
PUT    /api/v1/reviews/{id}
DELETE /api/v1/reviews/{id}
GET    /api/v1/reviews/featured
GET    /api/v1/reviews/top-rated
GET    /api/v1/reviews/user/{userId}/stats
POST   /api/v1/reviews/{id}/response
PUT    /api/v1/reviews/{id}/response
DELETE /api/v1/reviews/{id}/response
POST   /api/v1/reviews/{id}/vote
POST   /api/v1/reviews/{id}/report
```

### File Uploads
```
POST   /api/v1/uploads/single
POST   /api/v1/uploads/multiple
GET    /api/v1/uploads
GET    /api/v1/uploads/project/{projectId}
GET    /api/v1/uploads/message/{messageId}
GET    /api/v1/uploads/download/{fileId}
DELETE /api/v1/uploads/{fileId}
```

### Notifications
```
GET    /api/v1/notifications
POST   /api/v1/notifications
PUT    /api/v1/notifications/{id}/read
PUT    /api/v1/notifications/mark-all-read
GET    /api/v1/notifications/unread-count
GET    /api/v1/notifications/preferences
PUT    /api/v1/notifications/preferences
```

### Public Endpoints (No Auth Required)
```
GET    /api/v1/public/stats
GET    /api/v1/public/projects
GET    /api/v1/public/freelancers
GET    /api/v1/public/search
```

### Admin Endpoints (Admin Role Required)
```
GET    /api/v1/admin/stats
GET    /api/v1/admin/users
PUT    /api/v1/admin/users/{id}/status
GET    /api/v1/admin/projects/flagged
PUT    /api/v1/admin/projects/{id}/moderate
GET    /api/v1/admin/payments/disputes
POST   /api/v1/admin/payments/{id}/resolve
```

---

## Development Setup

### Prerequisites
```bash
Node.js >= 16.x
MongoDB >= 5.x
Redis >= 6.x
```

### Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/freelancehub
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# WebSocket
WS_PORT=3001
```

### Installation & Setup
```bash
# Clone repository
git clone <repository-url>
cd freelancehub-backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run start:dev

# Run tests
npm run test

# Build for production
npm run build
```

---

## API Testing

### Using the Documentation
Each module documentation includes:
- Complete endpoint specifications
- Request/response examples
- Authentication requirements
- Error handling
- Rate limiting information

### Testing Tools
- **Postman Collection**: Available in `/docs/postman/`
- **OpenAPI/Swagger**: Available at `/api/docs`
- **Unit Tests**: `npm run test`
- **Integration Tests**: `npm run test:e2e`

### Example API Calls

**Register Freelancer**:
```bash
curl -X POST https://api.freelancehub.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "SecurePassword123!",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "freelancer"
  }'
```

**Create Project**:
```bash
curl -X POST https://api.freelancehub.com/api/v1/projects \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "E-commerce Website Development",
    "description": "Looking for a React developer...",
    "budget": {"min": 2000, "max": 5000},
    "skills": ["React", "Node.js"]
  }'
```

---

## Support & Resources

### Documentation Links
- [API Reference Documentation](./README.md)
- [Authentication Guide](./freelancer-registration-api.md#authentication)
- [WebSocket Events](./messaging-api.md#websocket-integration)
- [Error Handling](./additional-modules-api.md#error-handling)
- [Rate Limiting](./payments-api.md#rate-limiting)

### Development Resources
- **GitHub Repository**: [Link to repository]
- **Issue Tracker**: [Link to issues]
- **Development Blog**: [Link to blog]
- **API Status**: [Link to status page]

### Contact Information
- **Technical Support**: tech-support@freelancehub.com
- **API Questions**: api-support@freelancehub.com
- **Business Inquiries**: business@freelancehub.com

---

## Changelog & Versioning

### Version 1.0.0 (Current)
- Complete authentication system with passkey support
- Project lifecycle management
- Contract and milestone system
- Integrated payment processing with Stripe
- Real-time messaging system
- Review and rating system
- File upload and management
- Admin panel and analytics
- WebSocket real-time events

### Upcoming Features (v1.1.0)
- Advanced search and filtering
- Video calling integration
- Mobile app API enhancements
- Advanced analytics dashboard
- AI-powered project matching

---

*This documentation covers the complete FreelanceHub backend API. For specific implementation details, refer to the individual module documentation files.*
