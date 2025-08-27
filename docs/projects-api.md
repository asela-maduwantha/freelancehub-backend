# Projects API Documentation

## Overview
The Projects API provides complete project lifecycle management including creation, discovery, proposal management, and project completion workflows for the FreelanceHub platform.

## Base URL
```
/api/v1/projects
```

## Authentication
Most endpoints require JWT authentication with appropriate role-based access.

---

## Endpoints

### 1. Create Project (Client Only)

**POST** `/`

Creates a new project posting.

**Authentication Required**: Yes (Client role)

**Request Body**:
```json
{
  "title": "Modern E-commerce Website Development",
  "description": "Looking for an experienced developer to build a modern e-commerce platform...",
  "category": "Web Development",
  "skills": ["React", "Node.js", "MongoDB", "Stripe"],
  "projectType": "fixed",
  "budget": {
    "min": 2000,
    "max": 5000
  },
  "duration": "2-3 months",
  "location": "Remote",
  "requirements": [
    "5+ years experience with React",
    "Experience with payment integration",
    "Portfolio of e-commerce projects"
  ],
  "attachments": ["file_id_1", "file_id_2"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "project_id_123",
    "title": "Modern E-commerce Website Development",
    "description": "Looking for an experienced developer...",
    "status": "open",
    "clientId": "client_id_456",
    "createdAt": "2024-01-15T10:30:00Z",
    "proposalsCount": 0,
    "budget": {
      "min": 2000,
      "max": 5000
    }
  }
}
```

### 2. Browse All Projects

**GET** `/`

Retrieve projects with advanced filtering and pagination.

**Authentication Required**: Optional (returns more details if authenticated)

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `category` (string): Filter by project category
- `skills` (array): Required skills filter
- `location` (string): Project location filter
- `projectType` (enum): "fixed" or "hourly"
- `status` (enum): "open", "in_progress", "completed", "cancelled"
- `sortBy` (string): Sort field
- `sortOrder` (enum): "asc" or "desc"
- `search` (string): Search term

**Response**:
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project_id_123",
        "title": "Modern E-commerce Website",
        "description": "Brief description...",
        "category": "Web Development",
        "skills": ["React", "Node.js"],
        "budget": {
          "min": 2000,
          "max": 5000
        },
        "proposalsCount": 12,
        "createdAt": "2024-01-15T10:30:00Z",
        "client": {
          "name": "John Doe",
          "rating": 4.8,
          "totalProjects": 15
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### 3. Get My Projects (Client Only)

**GET** `/my-projects`

Retrieve current user's projects.

**Authentication Required**: Yes (Client role)

**Query Parameters**:
- `status` (string): Filter by project status

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "project_id_123",
      "title": "E-commerce Website",
      "status": "in_progress",
      "proposalsCount": 12,
      "activeContract": {
        "id": "contract_id_789",
        "freelancer": {
          "name": "Jane Smith",
          "rating": 4.9
        }
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 4. Get Project Details

**GET** `/:id`

Retrieve detailed information about a specific project.

**Authentication Required**: Optional (more details if authenticated)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "project_id_123",
    "title": "Modern E-commerce Website Development",
    "description": "Full detailed description...",
    "category": "Web Development",
    "skills": ["React", "Node.js", "MongoDB"],
    "projectType": "fixed",
    "budget": {
      "min": 2000,
      "max": 5000
    },
    "status": "open",
    "duration": "2-3 months",
    "location": "Remote",
    "requirements": ["5+ years experience..."],
    "attachments": [
      {
        "id": "file_id_1",
        "name": "requirements.pdf",
        "url": "https://storage.url/file1"
      }
    ],
    "client": {
      "id": "client_id_456",
      "name": "John Doe",
      "rating": 4.8,
      "totalProjects": 15,
      "memberSince": "2022-01-01T00:00:00Z"
    },
    "proposalsCount": 12,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### 5. Update Project (Client Only)

**PUT** `/:id`

Update project details.

**Authentication Required**: Yes (Client role, own projects only)

**Request Body**: Same as Create Project

**Response**: Updated project object

### 6. Delete Project (Client Only)

**DELETE** `/:id`

Delete a project.

**Authentication Required**: Yes (Client role, own projects only)

**Response**:
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

## Proposal Management

### 7. Submit Proposal (Freelancer Only)

**POST** `/:id/proposals`

Submit a proposal to a project.

**Authentication Required**: Yes (Freelancer role)

**Request Body**:
```json
{
  "coverLetter": "I'm excited to work on your e-commerce project...",
  "proposedAmount": 3500,
  "proposedDuration": "8 weeks",
  "milestones": [
    {
      "title": "Design and Planning",
      "description": "Create wireframes and project plan",
      "amount": 1000,
      "duration": "2 weeks"
    },
    {
      "title": "Development Phase 1",
      "description": "Core functionality implementation",
      "amount": 1500,
      "duration": "3 weeks"
    },
    {
      "title": "Final Implementation",
      "description": "Testing and deployment",
      "amount": 1000,
      "duration": "3 weeks"
    }
  ],
  "attachments": ["portfolio_item_1", "portfolio_item_2"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "proposal_id_789",
    "projectId": "project_id_123",
    "freelancerId": "freelancer_id_456",
    "status": "pending",
    "proposedAmount": 3500,
    "submittedAt": "2024-01-16T09:15:00Z"
  }
}
```

### 8. Get Project Proposals (Client Only)

**GET** `/:id/proposals`

Retrieve all proposals for a project.

**Authentication Required**: Yes (Client role, own projects only)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "proposal_id_789",
      "freelancer": {
        "id": "freelancer_id_456",
        "name": "Jane Smith",
        "rating": 4.9,
        "profilePicture": "https://storage.url/profile.jpg",
        "skills": ["React", "Node.js"],
        "successRate": 95,
        "completedProjects": 45
      },
      "coverLetter": "I'm excited to work on your project...",
      "proposedAmount": 3500,
      "proposedDuration": "8 weeks",
      "milestones": [...],
      "status": "pending",
      "submittedAt": "2024-01-16T09:15:00Z"
    }
  ]
}
```

### 9. Accept Proposal (Client Only)

**POST** `/proposals/:proposalId/accept`

Accept a freelancer's proposal.

**Authentication Required**: Yes (Client role)

**Response**:
```json
{
  "success": true,
  "data": {
    "proposal": {
      "id": "proposal_id_789",
      "status": "accepted"
    },
    "contract": {
      "id": "contract_id_890",
      "status": "draft"
    }
  }
}
```

### 10. Reject Proposal (Client Only)

**POST** `/proposals/:proposalId/reject`

Reject a freelancer's proposal.

**Authentication Required**: Yes (Client role)

**Response**:
```json
{
  "success": true,
  "message": "Proposal rejected successfully"
}
```

### 11. Get My Proposals (Freelancer Only)

**GET** `/freelancer/proposals`

Retrieve freelancer's submitted proposals.

**Authentication Required**: Yes (Freelancer role)

**Query Parameters**:
- `status` (string): Filter by proposal status

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "proposal_id_789",
      "project": {
        "id": "project_id_123",
        "title": "E-commerce Website",
        "client": {
          "name": "John Doe"
        }
      },
      "proposedAmount": 3500,
      "status": "pending",
      "submittedAt": "2024-01-16T09:15:00Z"
    }
  ]
}
```

## Project Management

### 12. Complete Project (Client Only)

**POST** `/:id/complete`

Mark project as completed.

**Authentication Required**: Yes (Client role)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "project_id_123",
    "status": "completed",
    "completedAt": "2024-03-15T14:30:00Z"
  }
}
```

### 13. Get Project Analytics (Client Only)

**GET** `/:id/analytics`

Retrieve analytics for a project.

**Authentication Required**: Yes (Client role, own projects only)

**Response**:
```json
{
  "success": true,
  "data": {
    "views": 156,
    "proposalsReceived": 12,
    "averageProposalAmount": 3200,
    "timeToFirstProposal": "2 hours",
    "demographics": {
      "freelancerExperience": {
        "beginner": 2,
        "intermediate": 6,
        "expert": 4
      },
      "freelancerLocations": {
        "United States": 5,
        "Europe": 4,
        "Asia": 3
      }
    }
  }
}
```

## Discovery & Recommendations

### 14. Browse Public Projects

**GET** `/public`

Browse projects without authentication (limited information).

**Authentication Required**: No

**Query Parameters**:
- `page`, `limit`, `category`, `minBudget`, `maxBudget`, `projectType`, `skills`

**Response**: Similar to regular browse but with limited project details

### 15. Bookmark Project (Freelancer Only)

**GET** `/:id/bookmark`

Bookmark a project for later.

**Authentication Required**: Yes (Freelancer role)

**Response**:
```json
{
  "success": true,
  "message": "Project bookmarked successfully"
}
```

### 16. Remove Bookmark (Freelancer Only)

**DELETE** `/:id/bookmark`

Remove bookmark from project.

**Authentication Required**: Yes (Freelancer role)

**Response**:
```json
{
  "success": true,
  "message": "Bookmark removed successfully"
}
```

### 17. Get Recommended Projects (Freelancer Only)

**GET** `/recommended`

Get AI-powered project recommendations based on freelancer profile.

**Authentication Required**: Yes (Freelancer role)

**Query Parameters**:
- `limit` (number): Number of recommendations (default: 20)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "project_id_123",
      "title": "React Dashboard Development",
      "matchScore": 95,
      "matchReasons": [
        "Perfect skill match (React, TypeScript)",
        "Budget within your range",
        "Similar to your recent projects"
      ],
      "budget": {
        "min": 2000,
        "max": 4000
      },
      "client": {
        "name": "Tech Startup",
        "rating": 4.7
      }
    }
  ]
}
```

### 18. Get Project Templates (Client Only)

**GET** `/templates`

Get pre-built project templates.

**Authentication Required**: Yes (Client role)

**Query Parameters**:
- `category` (string): Filter by category

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "template_1",
      "name": "E-commerce Website",
      "category": "Web Development",
      "description": "Complete template for e-commerce project posting",
      "template": {
        "title": "E-commerce Website Development",
        "description": "Template description...",
        "skills": ["React", "Node.js", "MongoDB"],
        "requirements": ["5+ years experience..."]
      }
    }
  ]
}
```

### 19. Invite Freelancer (Client Only)

**POST** `/:id/invite`

Directly invite a freelancer to submit a proposal.

**Authentication Required**: Yes (Client role)

**Request Body**:
```json
{
  "freelancerId": "freelancer_id_456",
  "message": "Hi Jane, I reviewed your profile and think you'd be perfect for this project..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "data": {
    "invitationId": "invite_id_123",
    "sentAt": "2024-01-16T11:30:00Z"
  }
}
```

## Error Responses

### Common Error Codes

- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Project not found
- **409 Conflict**: Business logic violation (e.g., already submitted proposal)

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PROJECT_DATA",
    "message": "Project title is required",
    "details": {
      "field": "title",
      "value": null
    }
  }
}
```

## Rate Limiting

- Authenticated users: 100 requests per minute
- Anonymous users: 20 requests per minute
- Project creation: 10 projects per day per client
- Proposal submission: 20 proposals per day per freelancer

## Webhooks

### Project Events

The system can send webhooks for the following events:
- `project.created`
- `project.updated`
- `proposal.submitted`
- `proposal.accepted`
- `proposal.rejected`
- `project.completed`

Webhook payload example:
```json
{
  "event": "proposal.submitted",
  "timestamp": "2024-01-16T09:15:00Z",
  "data": {
    "projectId": "project_id_123",
    "proposalId": "proposal_id_789",
    "freelancerId": "freelancer_id_456"
  }
}
```
