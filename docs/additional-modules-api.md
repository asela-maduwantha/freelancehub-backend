# Additional Modules API Documentation

## Uploads API

### Overview
The Uploads API handles file management including single/multiple file uploads, file retrieval, and file organization by projects and messages.

### Base URL
```
/api/v1/uploads
```

### Authentication
All endpoints require JWT authentication.

---

### Endpoints

#### 1. Upload Single File

**POST** `/single`

Upload a single file.

**Authentication Required**: Yes

**Content-Type**: `multipart/form-data`

**Request Body (Form Data)**:
- `file` (file): File to upload
- `category` (string): File category ("profile", "project", "message", "portfolio", "document")
- `relatedTo` (string): Related entity ID (optional)
- `onModel` (string): Related model type ("Project", "Message", "User")
- `description` (string): File description (optional)

**Response**:
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": "file_id_123",
    "filename": "a1b2c3d4e5f6.pdf",
    "originalName": "project_requirements.pdf",
    "mimetype": "application/pdf",
    "size": 1024000,
    "url": "https://storage.url/uploads/a1b2c3d4e5f6.pdf",
    "category": "project",
    "uploadedAt": "2024-01-16T10:30:00Z"
  }
}
```

#### 2. Upload Multiple Files

**POST** `/multiple`

Upload multiple files at once.

**Authentication Required**: Yes

**Content-Type**: `multipart/form-data`

**Request Body (Form Data)**:
- `files` (files[]): Array of files to upload (max 10 files)
- `category` (string): File category
- `relatedTo` (string): Related entity ID (optional)

**Response**:
```json
{
  "message": "3 files uploaded successfully",
  "files": [
    {
      "id": "file_id_123",
      "filename": "a1b2c3d4e5f6.pdf",
      "originalName": "requirements.pdf",
      "mimetype": "application/pdf",
      "size": 1024000,
      "url": "https://storage.url/uploads/a1b2c3d4e5f6.pdf",
      "category": "project",
      "uploadedAt": "2024-01-16T10:30:00Z"
    }
  ]
}
```

#### 3. Get User Files

**GET** `/`

Retrieve files for the authenticated user.

**Authentication Required**: Yes

**Query Parameters**:
- `category` (string): Filter by file category
- `mimetype` (string): Filter by MIME type
- `page` (number): Page number
- `limit` (number): Items per page

**Response**:
```json
{
  "message": "Files retrieved successfully",
  "files": [
    {
      "id": "file_id_123",
      "filename": "a1b2c3d4e5f6.pdf",
      "originalName": "requirements.pdf",
      "mimetype": "application/pdf",
      "size": 1024000,
      "url": "https://storage.url/uploads/a1b2c3d4e5f6.pdf",
      "category": "project",
      "relatedTo": "project_id_456",
      "onModel": "Project",
      "uploadedAt": "2024-01-16T10:30:00Z"
    }
  ],
  "total": 25
}
```

#### 4. Get Project Files

**GET** `/project/:projectId`

Retrieve all files for a specific project.

**Response**: Similar to Get User Files

#### 5. Get Message Files

**GET** `/message/:messageId`

Retrieve all files for a specific message.

#### 6. Download File

**GET** `/download/:fileId`

Download a specific file.

#### 7. Delete File

**DELETE** `/:fileId`

Delete a file (owner only).

**File Size Limits**:
- Images: 10MB
- Documents: 25MB  
- Videos: 100MB

**Supported File Types**:
- Images: JPG, PNG, GIF, WebP
- Documents: PDF, DOC, DOCX, TXT, RTF
- Archives: ZIP, RAR, 7Z
- Code: Most source code files

---

## Notifications API

### Overview
The Notifications API manages user notifications including real-time alerts, email notifications, push notifications, and notification preferences.

### Base URL
```
/api/v1/notifications
```

### Authentication
All endpoints require JWT authentication.

---

### Endpoints

#### 1. Get Notifications

**GET** `/`

Retrieve notifications for the authenticated user.

**Authentication Required**: Yes

**Query Parameters**:
- `type` (string): Filter by notification type
- `isRead` (boolean): Filter by read status
- `page` (number): Page number
- `limit` (number): Items per page
- `priority` (enum): "low", "medium", "high", "urgent"

**Response**:
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_id_123",
        "type": "proposal_received",
        "title": "New Proposal Received",
        "message": "You received a new proposal for 'E-commerce Website Development'",
        "priority": "medium",
        "isRead": false,
        "data": {
          "projectId": "project_id_456",
          "proposalId": "proposal_id_789",
          "freelancerId": "freelancer_id_123"
        },
        "actionUrl": "/projects/project_id_456/proposals",
        "createdAt": "2024-01-16T14:30:00Z",
        "readAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "unreadCount": 12
    }
  }
}
```

#### 2. Get Unread Count

**GET** `/unread-count`

Get total count of unread notifications.

**Response**:
```json
{
  "success": true,
  "data": {
    "unreadCount": 12,
    "breakdown": {
      "proposals": 3,
      "messages": 5,
      "payments": 2,
      "system": 2
    }
  }
}
```

#### 3. Mark as Read

**PUT** `/:notificationId/read`

Mark a specific notification as read.

#### 4. Mark All as Read

**PUT** `/mark-all-read`

Mark all notifications as read.

#### 5. Get Notification Preferences

**GET** `/preferences`

Get user notification preferences.

**Response**:
```json
{
  "success": true,
  "data": {
    "email": {
      "proposals": true,
      "messages": true,
      "payments": true,
      "marketing": false
    },
    "push": {
      "proposals": true,
      "messages": true,
      "payments": true
    },
    "inApp": {
      "all": true
    },
    "frequency": "immediate"
  }
}
```

#### 6. Update Notification Preferences

**PUT** `/preferences`

Update user notification preferences.

### Notification Types

- `proposal_received` - New proposal submitted
- `proposal_accepted` - Proposal accepted
- `proposal_rejected` - Proposal rejected
- `message_received` - New message
- `payment_received` - Payment processed
- `milestone_submitted` - Milestone submitted
- `milestone_approved` - Milestone approved
- `contract_created` - New contract
- `contract_completed` - Contract completed
- `review_received` - New review
- `project_posted` - New project (for freelancers)

---

## Admin API

### Overview
Admin API provides administrative functions for platform management, user moderation, analytics, and system operations.

### Base URL
```
/api/v1/admin
```

### Authentication
All endpoints require JWT authentication with Admin role.

---

### Key Admin Endpoints

#### 1. Get Platform Statistics

**GET** `/stats`

Get comprehensive platform statistics.

**Response**:
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 15420,
      "freelancers": 9240,
      "clients": 6180,
      "thisMonth": 342,
      "growth": 8.2
    },
    "projects": {
      "total": 8920,
      "active": 1240,
      "completed": 6890,
      "thisMonth": 245
    },
    "transactions": {
      "totalVolume": 2840000,
      "thisMonth": 124000,
      "averageProject": 3200,
      "platformRevenue": 142000
    },
    "reviews": {
      "total": 7650,
      "averageRating": 4.6,
      "thisMonth": 89
    }
  }
}
```

#### 2. User Management

**GET** `/users`

Get all users with advanced filtering.

**PUT** `/users/:userId/status`

Update user status (active, suspended, banned).

**POST** `/users/:userId/verify`

Manually verify user account.

#### 3. Project Moderation

**GET** `/projects/flagged`

Get flagged projects requiring review.

**PUT** `/projects/:projectId/moderate`

Approve or reject flagged projects.

#### 4. Payment Management

**GET** `/payments/disputes`

Get payment disputes requiring resolution.

**POST** `/payments/:paymentId/resolve`

Resolve payment disputes.

---

## Public API

### Overview
Public API provides endpoints that don't require authentication, used for public browsing and platform information.

### Base URL
```
/api/v1/public
```

### Authentication
No authentication required.

---

### Endpoints

#### 1. Get Public Statistics

**GET** `/stats`

Get public platform statistics.

**Response**:
```json
{
  "success": true,
  "data": {
    "totalProjects": 8920,
    "totalFreelancers": 9240,
    "totalClients": 6180,
    "averageRating": 4.6,
    "projectsCompleted": 6890,
    "categories": [
      {
        "name": "Web Development",
        "count": 2340
      },
      {
        "name": "Mobile Apps",
        "count": 1890
      }
    ]
  }
}
```

#### 2. Browse Public Projects

**GET** `/projects`

Browse projects without authentication (limited information).

#### 3. Get Freelancer Profiles

**GET** `/freelancers`

Browse freelancer profiles publicly.

#### 4. Search

**GET** `/search`

Public search across projects and freelancers.

**Query Parameters**:
- `q` (string): Search term
- `type` (enum): "projects", "freelancers", "all"
- `category` (string): Filter by category

---

## WebSocket Events

### Real-time Notifications

**Connection**: `wss://api.freelancehub.com/ws`

**Events**:
- `notification.new` - New notification received
- `message.new` - New message received  
- `proposal.new` - New proposal received
- `payment.processed` - Payment completed
- `milestone.approved` - Milestone approved

---

## Error Handling

### Common HTTP Status Codes

- **200 OK** - Success
- **201 Created** - Resource created
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Business logic violation
- **413 Payload Too Large** - File size exceeds limit
- **422 Unprocessable Entity** - Validation failed
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid file type",
    "details": {
      "field": "file",
      "allowedTypes": ["jpg", "png", "pdf"],
      "receivedType": "exe"
    }
  }
}
```

## Rate Limiting

### Global Limits
- Authenticated users: 1000 requests per hour
- Anonymous users: 100 requests per hour
- File uploads: 50 uploads per hour per user
- Admin operations: 500 requests per hour

### Specific Limits
- File uploads: 10MB per file, 100MB total per hour
- Notifications: 100 per hour per user
- Search requests: 60 per hour per user

## Security

### File Upload Security
- Virus scanning on all uploads
- File type validation
- Size limits enforced
- Malicious content detection

### Data Protection
- GDPR compliance
- Data encryption at rest and in transit
- Regular security audits
- User data export/deletion capabilities
