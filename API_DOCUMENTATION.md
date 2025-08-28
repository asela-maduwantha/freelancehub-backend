# FreelanceHub API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL & Versioning](#base-url--versioning)
4. [Common Response Formats](#common-response-formats)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-1)
   - [Users & Profiles](#users--profiles)
   - [Projects](#projects)
   - [Proposals](#proposals)
   - [Contracts](#contracts)
   - [Payments](#payments)
   - [Messaging](#messaging)
   - [Notifications](#notifications)
   - [Reviews](#reviews)
   - [File Uploads](#file-uploads)
   - [Admin](#admin)
   - [Public](#public)

## Overview

FreelanceHub is a comprehensive freelancing platform API that connects clients with freelancers. The platform supports project posting, proposal submission, contract management, secure payments, real-time messaging, and review systems.

### Key Features
- **Multi-role authentication** (Client, Freelancer, Admin)
- **Advanced security** with 2FA, WebAuthn passkeys, and OTP verification
- **Project & proposal management** with filtering and search
- **Contract lifecycle management** with milestones
- **Escrow payment system** with Stripe integration
- **Real-time messaging** system
- **Review and rating** system
- **File upload** capabilities
- **Comprehensive admin** dashboard

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Authentication Flow
1. Register user account
2. Verify email address
3. Login to receive JWT tokens
4. Use access token for API requests
5. Refresh token when needed

## Base URL & Versioning

- **Base URL**: `https://api.freelancehub.com`
- **API Version**: `v1`
- **Full Base URL**: `https://api.freelancehub.com/v1`

## Common Response Formats

### Success Response
```json
{
  "message": "Operation successful",
  "data": {
    // Response data
  },
  "success": true
}
```

### Paginated Response
```json
{
  "data": [],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5,
  "hasNext": true,
  "hasPrev": false
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request",
  "timestamp": "2024-12-28T10:00:00Z",
  "path": "/v1/endpoint"
}
```

## Error Handling

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

## Rate Limiting

- **Default**: 100 requests per minute per IP
- **Authentication endpoints**: 10 requests per minute per IP
- **File uploads**: 20 requests per minute per user

## API Endpoints

---

## Authentication

### Register User
**POST** `/auth/register`

Register a new user account with email verification.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "username": "johndoe123",
  "firstName": "John",
  "lastName": "Doe",
  "primaryRole": "freelancer",
  "phone": "+94701234567",
  "location": {
    "country": "Sri Lanka",
    "city": "Colombo",
    "coordinates": [79.8612, 6.9271]
  },
  "password": "StrongPassword123!"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "verificationRequired": true
}
```

### Login
**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "StrongPassword123!"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user_id",
    "email": "john.doe@example.com",
    "username": "johndoe123",
    "role": "freelancer",
    "profile": {},
    "verification": {}
  },
  "expiresIn": 3600
}
```

### Verify Email
**POST** `/auth/verify-email`

Verify email address using verification token.

**Request Body:**
```json
{
  "token": "verification_token",
  "email": "john.doe@example.com"
}
```

### Send Email OTP
**POST** `/auth/send-email-otp`

Send OTP to email for verification or password reset.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "type": "verification"
}
```

### Verify Email OTP
**POST** `/auth/verify-email-otp`

Verify email using OTP and get access tokens.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

### Forgot Password
**POST** `/auth/forgot-password`

Send password reset OTP to email.

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

### Reset Password
**POST** `/auth/reset-password`

Reset password using OTP.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "otp": "123456",
  "newPassword": "NewStrongPassword123!"
}
```

### Enable 2FA
**POST** `/auth/2fa/enable`
*Requires Authentication*

Enable two-factor authentication and get QR code.

**Response (200):**
```json
{
  "qrCode": "data:image/png;base64,iVBOR...",
  "backupCodes": ["123456", "234567", "345678"]
}
```

### Get Current User
**GET** `/auth/me`
*Requires Authentication*

Get current user information.

**Response (200):**
```json
{
  "id": "user_id",
  "email": "john.doe@example.com",
  "username": "johndoe123",
  "role": "freelancer",
  "profile": {},
  "verification": {},
  "preferences": {}
}
```

### Refresh Token
**POST** `/auth/refresh`

Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

### Logout
**POST** `/auth/logout`
*Requires Authentication*

Logout from current device.

### Logout All
**POST** `/auth/logout-all`
*Requires Authentication*

Logout from all devices.

---

## Users & Profiles

### Client Dashboard
**GET** `/client/dashboard`
*Requires Authentication (Client)*

Get client dashboard data.

**Response (200):**
```json
{
  "stats": {
    "activeProjects": 5,
    "totalProjects": 20,
    "totalSpent": 15000,
    "activeFreelancers": 3,
    "pendingProposals": 8,
    "completedProjects": 15
  },
  "recentProjects": [],
  "recentApplications": [],
  "upcomingDeadlines": []
}
```

### Client Projects
**GET** `/client/projects`
*Requires Authentication (Client)*

Get client projects with filtering.

**Query Parameters:**
- `status` (optional): Project status (active, completed, draft, cancelled)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

### Search Freelancers
**GET** `/client/freelancers/search`
*Requires Authentication (Client)*

Search for freelancers.

**Query Parameters:**
- `skills`: Comma-separated skills
- `minRate`: Minimum hourly rate
- `maxRate`: Maximum hourly rate
- `location`: Location filter
- `availability`: Availability status
- `experience`: Experience level
- `page`: Page number
- `limit`: Items per page

### Freelancer Dashboard
**GET** `/freelancer/dashboard`
*Requires Authentication (Freelancer)*

Get freelancer dashboard data.

**Response (200):**
```json
{
  "stats": {
    "activeProjects": 3,
    "totalEarnings": 8500,
    "completedProjects": 12,
    "averageRating": 4.8,
    "totalHours": 320,
    "pendingPayments": 1200
  },
  "recentActivity": [],
  "upcomingDeadlines": [],
  "newOpportunities": []
}
```

### Update Freelancer Profile
**PUT** `/freelancer/profile`
*Requires Authentication (Freelancer)*

Update freelancer profile information.

**Request Body:**
```json
{
  "bio": "Experienced full-stack developer with 5+ years in React and Node.js",
  "hourlyRate": 50,
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "availability": "available",
  "title": "Senior Full-Stack Developer",
  "experience": "senior",
  "languages": ["English", "Spanish"],
  "timezone": "UTC-5"
}
```

### Create Complete Freelancer Profile
**POST** `/freelancer/profile/create`
*Requires Authentication (Freelancer)*

Create complete freelancer profile for onboarding.

**Request Body:**
```json
{
  "professional": {
    "title": "Senior Full-Stack Developer",
    "bio": "Professional description...",
    "experience": "senior",
    "hourlyRate": 50,
    "availability": "available"
  },
  "skills": {
    "primarySkills": ["JavaScript", "React", "Node.js"],
    "secondarySkills": ["MongoDB", "AWS"],
    "certifications": []
  },
  "languages": [
    {
      "language": "English",
      "proficiency": "native"
    }
  ],
  "pricing": {
    "hourlyRate": 50,
    "currency": "USD",
    "minimumBudget": 500
  }
}
```

### Add Portfolio Item
**POST** `/freelancer/portfolio`
*Requires Authentication (Freelancer)*

Add portfolio item.

**Request Body:**
```json
{
  "title": "E-commerce Dashboard",
  "description": "Modern dashboard for e-commerce management",
  "technologies": ["React", "Node.js", "MongoDB"],
  "projectUrl": "https://example.com",
  "imageUrl": "https://example.com/image.jpg",
  "category": "web-development",
  "completionDate": "2024-01-15"
}
```

---

## Projects

### Get Projects
**GET** `/projects`
*Requires Authentication*

Get all projects with filtering and pagination.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `category`: Project category
- `skills`: Required skills (comma-separated)
- `location`: Project location
- `projectType`: fixed or hourly
- `status`: Project status
- `sortBy`: Sort field
- `sortOrder`: asc or desc
- `search`: Search term

**Response (200):**
```json
{
  "data": [
    {
      "id": "project_id",
      "title": "Build a Modern E-commerce Website",
      "description": "Project description...",
      "category": "technology",
      "requiredSkills": ["React", "Node.js", "MongoDB"],
      "type": "fixed",
      "budget": {
        "amount": 1500,
        "currency": "USD",
        "type": "fixed"
      },
      "timeline": {
        "deadline": "2024-12-31T00:00:00Z",
        "duration": 30
      },
      "client": {
        "id": "client_id",
        "name": "John Smith",
        "avatar": "avatar_url",
        "rating": 4.8
      },
      "proposalCount": 12,
      "createdAt": "2024-01-01T00:00:00Z",
      "status": "open"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10,
  "hasNext": true,
  "hasPrev": false
}
```

### Create Project
**POST** `/projects`
*Requires Authentication (Client)*

Create a new project.

**Request Body:**
```json
{
  "title": "Build a Modern E-commerce Website",
  "description": "I need a modern, responsive e-commerce website built with React and Node.js...",
  "category": "technology",
  "subcategory": "web-development",
  "requiredSkills": ["React", "Node.js", "MongoDB"],
  "type": "fixed",
  "budget": {
    "amount": 1500,
    "currency": "USD",
    "type": "fixed"
  },
  "timeline": {
    "deadline": "2024-12-31T00:00:00Z",
    "duration": 30,
    "isUrgent": false,
    "isFlexible": true
  },
  "requirements": {
    "experienceLevel": "intermediate",
    "minimumRating": 4.0,
    "minimumCompletedProjects": 5,
    "preferredLanguages": ["English"],
    "preferredCountries": ["US", "UK", "CA"]
  },
  "visibility": "public",
  "tags": ["ecommerce", "responsive", "modern"]
}
```

### Get Project by ID
**GET** `/projects/:id`
*Requires Authentication*

Get project details by ID.

**Response (200):**
```json
{
  "id": "project_id",
  "title": "Build a Modern E-commerce Website",
  "description": "Detailed project description...",
  "category": "technology",
  "subcategory": "web-development",
  "requiredSkills": ["React", "Node.js", "MongoDB"],
  "type": "fixed",
  "budget": {
    "amount": 1500,
    "maxAmount": 2000,
    "currency": "USD",
    "type": "fixed"
  },
  "timeline": {
    "deadline": "2024-12-31T00:00:00Z",
    "duration": 30,
    "isUrgent": false,
    "isFlexible": true
  },
  "requirements": {
    "mustHaveSkills": ["React", "Node.js"],
    "niceToHaveSkills": ["TypeScript"],
    "experienceLevel": "intermediate",
    "minimumRating": 4.0,
    "minimumCompletedProjects": 5
  },
  "client": {
    "id": "client_id",
    "name": "John Smith",
    "avatar": "avatar_url",
    "rating": 4.8,
    "totalProjects": 15,
    "joinedDate": "2023-01-01T00:00:00Z"
  },
  "proposalCount": 12,
  "viewCount": 156,
  "attachments": [],
  "tags": ["ecommerce", "responsive", "modern"],
  "visibility": "public",
  "status": "open",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Update Project
**PUT** `/projects/:id`
*Requires Authentication (Client)*

Update a project.

### Delete Project
**DELETE** `/projects/:id`
*Requires Authentication (Client)*

Delete a project.

### Get Public Projects
**GET** `/projects/public`
*No Authentication Required*

Browse projects publicly without authentication.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `category`: Project category
- `minBudget`: Minimum budget
- `maxBudget`: Maximum budget
- `projectType`: fixed or hourly
- `skills`: Comma-separated skills

---

## Proposals

### Submit Proposal
**POST** `/projects/:id/proposals`
*Requires Authentication (Freelancer)*

Submit a proposal to a project.

**Request Body:**
```json
{
  "coverLetter": "I am excited to work on your project...",
  "pricing": {
    "amount": 1500,
    "currency": "USD",
    "type": "fixed",
    "estimatedHours": 40,
    "breakdown": "Detailed cost breakdown"
  },
  "timeline": {
    "deliveryTime": 30,
    "startDate": "2024-02-01T00:00:00Z",
    "milestones": [
      {
        "title": "Design Phase",
        "description": "Complete UI/UX design",
        "deliveryDate": "2024-02-10T00:00:00Z",
        "amount": 500
      }
    ]
  },
  "estimatedDuration": 14,
  "portfolioLinks": ["https://portfolio-link.com"],
  "attachments": [
    {
      "filename": "proposal.pdf",
      "url": "https://file-url.com",
      "fileType": "application/pdf",
      "fileSize": 90315,
      "description": "Detailed proposal document"
    }
  ],
  "additionalInfo": "Additional information about the proposal"
}
```

### Get Project Proposals
**GET** `/projects/:id/proposals`
*Requires Authentication (Client)*

Get proposals for a project.

### Accept Proposal
**POST** `/projects/proposals/:proposalId/accept`
*Requires Authentication (Client)*

Accept a proposal.

### Reject Proposal
**POST** `/projects/proposals/:proposalId/reject`
*Requires Authentication (Client)*

Reject a proposal.

### Get Freelancer Proposals
**GET** `/projects/freelancer/proposals`
*Requires Authentication (Freelancer)*

Get freelancer's submitted proposals.

**Query Parameters:**
- `status`: Filter by status (pending, accepted, rejected)

---

## Contracts

### Create Contract
**POST** `/contracts`
*Requires Authentication (Client)*

Create a new contract from accepted proposal.

**Request Body:**
```json
{
  "projectId": "project_id",
  "freelancerId": "freelancer_id",
  "proposalId": "proposal_id",
  "terms": {
    "totalAmount": 1500,
    "currency": "USD",
    "paymentType": "fixed",
    "scope": "Complete development of e-commerce website",
    "deliverables": [
      "Responsive website design",
      "Backend API development",
      "Database setup",
      "Testing and deployment"
    ],
    "deadline": "2024-12-31T00:00:00Z",
    "revisions": 2,
    "additionalTerms": "Additional contract terms"
  },
  "milestones": [
    {
      "title": "Design Phase",
      "description": "Complete UI/UX design and wireframes",
      "amount": 500,
      "dueDate": "2024-02-15T00:00:00Z",
      "deliverables": ["Wireframes", "UI Design", "Style Guide"]
    },
    {
      "title": "Development Phase",
      "description": "Backend and frontend development",
      "amount": 800,
      "dueDate": "2024-03-15T00:00:00Z",
      "deliverables": ["Frontend Implementation", "Backend API", "Database"]
    },
    {
      "title": "Testing & Deployment",
      "description": "Testing and deployment to production",
      "amount": 200,
      "dueDate": "2024-03-31T00:00:00Z",
      "deliverables": ["Testing Report", "Deployed Application"]
    }
  ]
}
```

### Get Contracts
**GET** `/contracts`
*Requires Authentication*

Get user contracts with filtering and pagination.

**Query Parameters:**
- `status`: Contract status (draft, active, completed, cancelled, disputed, paused)
- `category`: Project category
- `startDate`: Filter by date range start
- `endDate`: Filter by date range end
- `page`: Page number
- `limit`: Items per page
- `sortBy`: Sort field (createdAt, totalAmount, status, deadline)
- `sortOrder`: Sort order (asc, desc)

**Response (200):**
```json
{
  "contracts": [
    {
      "_id": "contract_id",
      "projectId": "project_id",
      "clientId": "client_id",
      "freelancerId": "freelancer_id",
      "proposalId": "proposal_id",
      "terms": {
        "totalAmount": 1500,
        "currency": "USD",
        "paymentType": "fixed",
        "scope": "Complete development of e-commerce website",
        "deliverables": ["Website", "API", "Database"],
        "deadline": "2024-12-31T00:00:00Z",
        "revisions": 2
      },
      "milestones": [
        {
          "title": "Design Phase",
          "description": "Complete UI/UX design",
          "amount": 500,
          "status": "pending",
          "dueDate": "2024-02-15T00:00:00Z",
          "deliverables": ["Wireframes", "UI Design"]
        }
      ],
      "currentMilestone": 0,
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### Get Contract by ID
**GET** `/contracts/:id`
*Requires Authentication*

Get contract details by ID.

### Update Contract
**PUT** `/contracts/:id`
*Requires Authentication (Client)*

Update contract details (draft contracts only).

### Activate Contract
**POST** `/contracts/:id/activate`
*Requires Authentication (Client)*

Activate contract (move from draft to active).

### Submit Milestone
**POST** `/contracts/:id/milestones/:milestoneIndex/submit`
*Requires Authentication (Freelancer)*

Submit milestone deliverables.

**Request Body:**
```json
{
  "files": [
    "file_url_1",
    "file_url_2"
  ],
  "notes": "Milestone completion notes and description of deliverables"
}
```

### Review Milestone
**POST** `/contracts/:id/milestones/:milestoneIndex/review`
*Requires Authentication (Client)*

Review submitted milestone.

**Request Body:**
```json
{
  "status": "approved",
  "feedback": "Great work! The deliverables meet all requirements.",
  "rejectionReason": ""
}
```

### Request Contract Modification
**POST** `/contracts/:id/modifications`
*Requires Authentication*

Request contract modification.

**Request Body:**
```json
{
  "type": "budget_increase",
  "description": "Additional features requested by client",
  "previousValue": 1500,
  "newValue": 2000
}
```

### Approve Contract Modification
**POST** `/contracts/:id/modifications/:modificationIndex/approve`
*Requires Authentication*

Approve or reject contract modification.

**Query Parameters:**
- `approve`: Boolean (true to approve, false to reject)
- `rejectionReason`: Reason for rejection if approve=false

### Update Contract Status
**PUT** `/contracts/:id/status`
*Requires Authentication*

Update contract status.

**Request Body:**
```json
{
  "status": "completed",
  "reason": "Project completed successfully"
}
```

### Delete Contract
**DELETE** `/contracts/:id`
*Requires Authentication (Client)*

Delete contract (draft contracts only).

### Get Contract Statistics
**GET** `/contracts/stats`
*Requires Authentication*

Get contract statistics for the user.

**Response (200):**
```json
{
  "role": "freelancer",
  "stats": {
    "active": {
      "count": 3,
      "totalValue": 4500
    },
    "completed": {
      "count": 12,
      "totalValue": 18000
    },
    "draft": {
      "count": 1,
      "totalValue": 1200
    }
  }
}
```

---

## Payments

### Create Payment Intent
**POST** `/payments/intent`
*Requires Authentication (Client)*

Create payment intent for contract payment.

**Request Body:**
```json
{
  "contractId": "contract_id",
  "amount": 1500
}
```

### Confirm Payment
**POST** `/payments/confirm/:paymentIntentId`

Confirm payment completion.

### Create Escrow Payment
**POST** `/payments/escrow`
*Requires Authentication (Client)*

Create escrow payment.

**Request Body:**
```json
{
  "contractId": "contract_id",
  "amount": 1500,
  "description": "Payment for milestone 1"
}
```

### Release Escrow Payment
**POST** `/payments/escrow/:paymentId/release`
*Requires Authentication (Client)*

Release escrow payment to freelancer.

### Refund Payment
**POST** `/payments/:paymentId/refund`
*Requires Authentication (Client)*

Refund a payment.

**Request Body:**
```json
{
  "reason": "Client requested refund due to project cancellation"
}
```

### Get Payment History
**GET** `/payments/contract/:contractId`
*Requires Authentication*

Get payment history for a contract.

### Get User Payments
**GET** `/payments/my-payments`
*Requires Authentication*

Get user payments (client or freelancer).

### Create Connected Account
**POST** `/payments/connected-account`
*Requires Authentication (Freelancer)*

Create Stripe connected account for freelancer.

### Get Account Status
**GET** `/payments/account-status`
*Requires Authentication (Freelancer)*

Get Stripe account status.

---

## Messaging

### Send Message
**POST** `/messaging/messages`
*Requires Authentication*

Send a new message.

**Request Body:**
```json
{
  "receiverId": "user_id",
  "content": "Hello! I'm interested in discussing your project.",
  "projectId": "project_id",
  "type": "text",
  "attachments": [
    {
      "filename": "document.pdf",
      "url": "file_url",
      "size": 90315,
      "mimeType": "application/pdf"
    }
  ],
  "metadata": {
    "proposalId": "proposal_id"
  }
}
```

### Get Messages
**GET** `/messaging/messages`
*Requires Authentication*

Retrieve messages with pagination and filtering.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `conversationId`: Filter by conversation
- `projectId`: Filter by project
- `unreadOnly`: Show only unread messages

### Get Conversations
**GET** `/messaging/conversations`
*Requires Authentication*

Retrieve all conversations.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page

**Response (200):**
```json
{
  "conversations": [
    {
      "id": "conversation_id",
      "participants": [
        {
          "id": "user_id",
          "name": "John Doe",
          "avatar": "avatar_url",
          "role": "client"
        }
      ],
      "lastMessage": {
        "content": "Great! When can we start?",
        "sender": "user_id",
        "timestamp": "2024-01-01T12:00:00Z",
        "type": "text"
      },
      "unreadCount": 2,
      "projectId": "project_id",
      "type": "project",
      "isArchived": false,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T12:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

### Create Conversation
**POST** `/messaging/conversations`
*Requires Authentication*

Start a new conversation.

**Request Body:**
```json
{
  "participants": ["user_id_1", "user_id_2"],
  "projectId": "project_id",
  "title": "Project Discussion",
  "type": "project"
}
```

### Update Message
**PUT** `/messaging/messages/:messageId`
*Requires Authentication*

Edit a message (within 24 hours).

**Request Body:**
```json
{
  "content": "Updated message content"
}
```

### Delete Message
**DELETE** `/messaging/messages/:messageId`
*Requires Authentication*

Delete a message.

### Mark Message as Read
**POST** `/messaging/messages/:messageId/read`
*Requires Authentication*

Mark a message as read.

### Mark Conversation as Read
**POST** `/messaging/conversations/:conversationId/read`
*Requires Authentication*

Mark all messages in a conversation as read.

### Archive Conversation
**POST** `/messaging/conversations/:conversationId/archive`
*Requires Authentication*

Archive a conversation.

### Get Unread Count
**GET** `/messaging/unread-count`
*Requires Authentication*

Get total unread message count.

**Response (200):**
```json
{
  "unreadMessages": 5,
  "unreadConversations": 3
}
```

### Search Messages
**GET** `/messaging/search`
*Requires Authentication*

Search through messages.

**Query Parameters:**
- `q`: Search term (required)
- `limit`: Maximum results to return

---

## Notifications

### Create Notification
**POST** `/notifications`
*Requires Authentication*

Create a notification.

**Request Body:**
```json
{
  "title": "New Proposal Received",
  "message": "You have received a new proposal for your project",
  "type": "proposal_received",
  "priority": "medium",
  "data": {
    "projectId": "project_id",
    "proposalId": "proposal_id",
    "amount": 1500,
    "currency": "USD"
  },
  "actionUrl": "/projects/project_id/proposals",
  "actionText": "View Proposal",
  "channels": ["in_app", "email"],
  "category": "projects"
}
```

### Get Notifications
**GET** `/notifications`
*Requires Authentication*

Retrieve notifications with filtering and pagination.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `type`: Notification type
- `priority`: Priority level
- `isRead`: Read status
- `category`: Notification category

**Response (200):**
```json
{
  "notifications": [
    {
      "id": "notification_id",
      "title": "New Proposal Received",
      "message": "You have received a new proposal for your project",
      "type": "proposal_received",
      "priority": "medium",
      "isRead": false,
      "data": {
        "projectId": "project_id",
        "proposalId": "proposal_id",
        "amount": 1500
      },
      "actionUrl": "/projects/project_id/proposals",
      "actionText": "View Proposal",
      "category": "projects",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

### Get Unread Count
**GET** `/notifications/unread-count`
*Requires Authentication*

Get unread notification count.

### Get Notification Statistics
**GET** `/notifications/stats`
*Requires Authentication*

Get detailed notification statistics.

### Get Notification Preferences
**GET** `/notifications/preferences`
*Requires Authentication*

Get notification preferences.

### Update Notification Preferences
**PUT** `/notifications/preferences`
*Requires Authentication*

Update notification preferences.

**Request Body:**
```json
{
  "email": true,
  "push": true,
  "sms": false,
  "inApp": true,
  "disabledTypes": ["system_update"]
}
```

### Get Notifications by Type
**GET** `/notifications/type/:type`
*Requires Authentication*

Get notifications of a specific type.

### Mark Notification as Read
**PUT** `/notifications/:notificationId/read`
*Requires Authentication*

Mark a notification as read.

### Mark All as Read
**PUT** `/notifications/mark-all-read`
*Requires Authentication*

Mark all notifications as read.

### Delete Notification
**DELETE** `/notifications/:notificationId`
*Requires Authentication*

Delete a notification.

---

## Reviews

### Create Review
**POST** `/reviews`
*Requires Authentication*

Create a review for a completed project.

**Request Body:**
```json
{
  "revieweeId": "user_id",
  "projectId": "project_id",
  "contractId": "contract_id",
  "rating": 5,
  "comment": "Excellent work! The freelancer delivered high-quality results on time.",
  "reviewType": "client_to_freelancer",
  "criteria": {
    "communication": 5,
    "quality": 5,
    "timeliness": 5,
    "professionalism": 5,
    "valueForMoney": 5,
    "wouldRecommend": true
  },
  "tags": ["professional", "timely", "high-quality"],
  "isPublic": true,
  "metadata": {
    "projectTitle": "E-commerce Website",
    "projectCategory": "web-development",
    "projectBudget": 1500,
    "contractDuration": 30,
    "completionDate": "2024-01-31T00:00:00Z"
  }
}
```

### Get Reviews
**GET** `/reviews`
*No Authentication Required*

Retrieve reviews with filtering and pagination.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `revieweeId`: Filter by reviewee
- `reviewerId`: Filter by reviewer
- `projectId`: Filter by project
- `reviewType`: Type of review
- `minRating`: Minimum rating
- `maxRating`: Maximum rating
- `publicOnly`: Show only public reviews
- `featuredOnly`: Show only featured reviews
- `tags`: Filter by tags

**Response (200):**
```json
{
  "reviews": [
    {
      "id": "review_id",
      "reviewer": {
        "id": "reviewer_id",
        "name": "John Smith",
        "avatar": "avatar_url",
        "role": "client"
      },
      "reviewee": {
        "id": "reviewee_id",
        "name": "Jane Doe",
        "avatar": "avatar_url",
        "role": "freelancer"
      },
      "project": {
        "id": "project_id",
        "title": "E-commerce Website",
        "category": "web-development"
      },
      "rating": 5,
      "comment": "Excellent work! Delivered on time with high quality.",
      "reviewType": "client_to_freelancer",
      "criteria": {
        "communication": 5,
        "quality": 5,
        "timeliness": 5,
        "professionalism": 5,
        "valueForMoney": 5,
        "wouldRecommend": true
      },
      "tags": ["professional", "timely", "high-quality"],
      "isPublic": true,
      "isFeatured": false,
      "helpfulVotes": 8,
      "response": {
        "comment": "Thank you for the great review!",
        "createdAt": "2024-02-01T10:00:00Z"
      },
      "createdAt": "2024-01-31T15:00:00Z",
      "updatedAt": "2024-01-31T15:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

### Get Featured Reviews
**GET** `/reviews/featured`

Get featured reviews for the platform.

### Get Top-Rated Users
**GET** `/reviews/top-rated`

Get top-rated freelancers or clients.

**Query Parameters:**
- `userType`: freelancer or client
- `limit`: Maximum number of users

### Get User Rating Statistics
**GET** `/reviews/user/:userId/stats`

Get detailed rating statistics for a user.

**Response (200):**
```json
{
  "userId": "user_id",
  "overallRating": 4.8,
  "totalReviews": 25,
  "ratingDistribution": {
    "5": 18,
    "4": 5,
    "3": 2,
    "2": 0,
    "1": 0
  },
  "criteriaAverages": {
    "communication": 4.9,
    "quality": 4.8,
    "timeliness": 4.7,
    "professionalism": 4.9,
    "valueForMoney": 4.6
  },
  "recentReviews": [],
  "recommendationRate": 96
}
```

### Get Review by ID
**GET** `/reviews/:reviewId`

Get a specific review by ID.

### Update Review
**PUT** `/reviews/:reviewId`
*Requires Authentication*

Update your own review (within 30 days).

### Delete Review
**DELETE** `/reviews/:reviewId`
*Requires Authentication*

Delete your own review.

### Add Review Response
**POST** `/reviews/:reviewId/response`
*Requires Authentication*

Add a response to a review about yourself.

**Request Body:**
```json
{
  "comment": "Thank you for the great review! It was a pleasure working with you."
}
```

### Update Review Response
**PUT** `/reviews/:reviewId/response`
*Requires Authentication*

Update your response to a review.

### Vote Review as Helpful
**POST** `/reviews/:reviewId/helpful`
*Requires Authentication*

Vote a review as helpful.

### Report Review
**POST** `/reviews/:reviewId/report`
*Requires Authentication*

Report a review for inappropriate content.

**Request Body:**
```json
{
  "reason": "inappropriate",
  "comment": "This review contains inappropriate language"
}
```

---

## File Uploads

### Upload Single File
**POST** `/uploads/single`
*Requires Authentication*

Upload a single file.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: File to upload
- `category`: File category (profile, project, portfolio, document)
- `relatedTo`: ID of related entity (optional)
- `onModel`: Model name for related entity (optional)

**Response (201):**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": "file_id",
    "filename": "unique_filename.jpg",
    "originalName": "original_name.jpg",
    "mimetype": "image/jpeg",
    "size": 245760,
    "url": "https://domain.com/uploads/unique_filename.jpg",
    "category": "profile",
    "uploadedAt": "2024-01-01T10:00:00Z"
  }
}
```

### Upload Multiple Files
**POST** `/uploads/multiple`
*Requires Authentication*

Upload multiple files (max 10).

**Content-Type:** `multipart/form-data`

**Form Data:**
- `files`: Files to upload (max 10)
- `category`: File category
- `relatedTo`: ID of related entity (optional)
- `onModel`: Model name for related entity (optional)

### Get User Files
**GET** `/uploads`
*Requires Authentication*

Get user files with optional filters.

**Query Parameters:**
- `category`: Filter by category
- `relatedTo`: Filter by related entity
- `mimetype`: Filter by MIME type
- `page`: Page number
- `limit`: Items per page

### Get Project Files
**GET** `/uploads/project/:projectId`
*Requires Authentication*

Get files for a specific project.

### Get Message Files
**GET** `/uploads/message/:messageId`
*Requires Authentication*

Get files for a specific message.

### Get File by ID
**GET** `/uploads/:fileId`
*Requires Authentication*

Get file details by ID.

### Serve File
**GET** `/uploads/serve/:filename`

Serve uploaded file.

### Delete File
**DELETE** `/uploads/:fileId`
*Requires Authentication*

Delete a file.

---

## Admin

### Get Dashboard Statistics
**GET** `/admin/dashboard/stats`
*Requires Authentication (Admin)*

Get dashboard statistics.

**Query Parameters:**
- `dateRange`: Date range for statistics (optional)

**Response (200):**
```json
{
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "overview": {
      "totalUsers": 5000,
      "totalProjects": 1200,
      "totalRevenue": 150000,
      "activeUsers": 800,
      "completedProjects": 950
    },
    "growth": {
      "newUsers": 45,
      "newProjects": 12,
      "revenue": 8500
    },
    "distribution": {
      "usersByRole": {
        "freelancers": 3000,
        "clients": 2000
      },
      "projectsByCategory": {
        "technology": 600,
        "design": 300,
        "writing": 200,
        "marketing": 100
      }
    }
  }
}
```

### Get Users
**GET** `/admin/users`
*Requires Authentication (Admin)*

Get users with filtering and pagination.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `role`: Filter by role (client, freelancer, admin)
- `status`: Filter by status (active, inactive, suspended)
- `search`: Search term

### Get User Details
**GET** `/admin/users/:userId`
*Requires Authentication (Admin)*

Get detailed user information.

### Perform User Action
**POST** `/admin/users/:userId/action`
*Requires Authentication (Admin)*

Perform action on user (suspend, activate, delete, make_admin).

**Request Body:**
```json
{
  "action": "suspend",
  "reason": "Violation of terms of service"
}
```

### Get System Health
**GET** `/admin/system/health`
*Requires Authentication (Admin)*

Get system health status.

**Response (200):**
```json
{
  "message": "System health retrieved successfully",
  "status": "healthy",
  "uptime": "15 days, 6 hours",
  "activeConnections": 127,
  "memoryUsage": "65%",
  "cpuUsage": "23%",
  "databaseStatus": "connected",
  "redisStatus": "connected",
  "recentErrors": 0
}
```

### Get Recent Activity
**GET** `/admin/activity/recent`
*Requires Authentication (Admin)*

Get recent platform activity.

### Get Analytics Overview
**GET** `/admin/analytics/overview`
*Requires Authentication (Admin)*

Get platform analytics overview.

### Get Summary Report
**GET** `/admin/reports/summary`
*Requires Authentication (Admin)*

Get comprehensive platform summary report.

---

## Public

### Get Platform Statistics
**GET** `/public/stats`
*No Authentication Required*

Get platform statistics for landing page.

**Response (200):**
```json
{
  "totalProjects": 5000,
  "totalFreelancers": 3000,
  "totalClients": 2000,
  "totalEarnings": 500000,
  "completedProjects": 4200,
  "activeProjects": 800,
  "averageRating": 4.6,
  "countriesRepresented": 75
}
```

### Get Categories
**GET** `/public/categories`
*No Authentication Required*

Get project categories.

**Response (200):**
```json
[
  {
    "id": "technology",
    "name": "Technology",
    "description": "Software development, web design, mobile apps",
    "icon": "💻",
    "projectCount": 1200,
    "averageBudget": 2500,
    "popular": true
  },
  {
    "id": "design",
    "name": "Design",
    "description": "Graphic design, UI/UX, branding",
    "icon": "🎨",
    "projectCount": 800,
    "averageBudget": 1200,
    "popular": true
  }
]
```

### Get Testimonials
**GET** `/public/testimonials`
*No Authentication Required*

Get featured testimonials.

**Query Parameters:**
- `limit`: Number of testimonials to return

### Get Skills
**GET** `/public/skills`
*No Authentication Required*

Get available skills.

**Query Parameters:**
- `category`: Filter by category
- `popular`: Get only popular skills

### Get Featured Projects
**GET** `/public/featured-projects`
*No Authentication Required*

Get featured projects for landing page.

### Get Featured Freelancers
**GET** `/public/featured-freelancers`
*No Authentication Required*

Get featured freelancers for landing page.

---

## Webhooks

### Stripe Webhook
**POST** `/payments/webhook`

Handle Stripe webhooks for payment processing.

**Headers:**
- `stripe-signature`: Stripe signature for verification

---

## WebSocket Events

The platform supports real-time communication through WebSocket connections for:

### Message Events
- `message:new` - New message received
- `message:read` - Message marked as read
- `message:typing` - User is typing

### Notification Events
- `notification:new` - New notification
- `notification:read` - Notification marked as read

### Project Events
- `project:proposal` - New proposal received
- `project:update` - Project updated

### Contract Events
- `contract:milestone:submitted` - Milestone submitted
- `contract:milestone:approved` - Milestone approved
- `contract:status:changed` - Contract status changed

### Connection
Connect to WebSocket at: `wss://api.freelancehub.com/ws`

**Authentication:** Include JWT token in connection headers or as query parameter.

---

## Rate Limits

| Endpoint Category | Limit | Window |
|------------------|-------|---------|
| Authentication | 10 requests | 1 minute |
| File Uploads | 20 requests | 1 minute |
| General API | 100 requests | 1 minute |
| WebSocket Messages | 60 messages | 1 minute |

## SDK & Code Examples

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'https://api.freelancehub.com/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
async function login(email, password) {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });
    
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response.data);
    throw error;
  }
}

// Create project
async function createProject(projectData) {
  try {
    const response = await apiClient.post('/projects', projectData);
    return response.data;
  } catch (error) {
    console.error('Project creation failed:', error.response.data);
    throw error;
  }
}

// Get projects
async function getProjects(filters = {}) {
  try {
    const response = await apiClient.get('/projects', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch projects:', error.response.data);
    throw error;
  }
}
```

### Python Example

```python
import requests
import json

class FreelanceHubAPI:
    def __init__(self, base_url="https://api.freelancehub.com/v1"):
        self.base_url = base_url
        self.session = requests.Session()
        self.token = None
    
    def set_token(self, token):
        self.token = token
        self.session.headers.update({
            'Authorization': f'Bearer {token}'
        })
    
    def login(self, email, password):
        response = self.session.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        response.raise_for_status()
        
        data = response.json()
        self.set_token(data['accessToken'])
        return data
    
    def create_project(self, project_data):
        response = self.session.post(
            f"{self.base_url}/projects",
            json=project_data
        )
        response.raise_for_status()
        return response.json()
    
    def get_projects(self, **filters):
        response = self.session.get(
            f"{self.base_url}/projects",
            params=filters
        )
        response.raise_for_status()
        return response.json()

# Usage
api = FreelanceHubAPI()

# Login
user_data = api.login("user@example.com", "password")
print(f"Logged in as: {user_data['user']['username']}")

# Create project
project = api.create_project({
    "title": "Build a Web App",
    "description": "Need a modern web application...",
    "category": "technology",
    "requiredSkills": ["React", "Node.js"],
    "type": "fixed",
    "budget": {
        "amount": 2000,
        "currency": "USD",
        "type": "fixed"
    }
})
print(f"Created project: {project['id']}")
```

## Conclusion

This comprehensive API documentation covers all endpoints, request/response formats, authentication methods, and real-time features of the FreelanceHub platform. The API is designed to support a full-featured freelancing marketplace with robust security, payment processing, and communication features.

For additional support or questions, please contact the API team or refer to the developer portal for more detailed examples and tutorials.

---

**Last Updated:** December 28, 2024  
**API Version:** v1  
**Documentation Version:** 1.0.0
