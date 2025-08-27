# Contracts API Documentation

## Overview
The Contracts API manages the complete contract lifecycle from creation after proposal acceptance through milestone management, modifications, and completion. Handles contract status transitions, milestone submissions, reviews, and payment coordination.

## Base URL
```
/api/v1/contracts
```

## Authentication
All endpoints require JWT authentication with appropriate role-based access.

---

## Endpoints

### 1. Create Contract (Client Only)

**POST** `/`

Creates a new contract from an accepted proposal.

**Authentication Required**: Yes (Client role)

**Request Body**:
```json
{
  "proposalId": "proposal_id_789",
  "projectId": "project_id_123",
  "freelancerId": "freelancer_id_456",
  "contractTerms": {
    "totalAmount": 3500,
    "startDate": "2024-02-01T00:00:00Z",
    "endDate": "2024-04-01T00:00:00Z",
    "paymentSchedule": "milestone-based"
  },
  "milestones": [
    {
      "title": "Design and Planning",
      "description": "Create wireframes, mockups, and detailed project plan",
      "amount": 1000,
      "dueDate": "2024-02-15T00:00:00Z",
      "deliverables": [
        "Wireframes in Figma",
        "Technical specification document",
        "Project timeline"
      ]
    },
    {
      "title": "Development Phase 1",
      "description": "Core functionality implementation",
      "amount": 1500,
      "dueDate": "2024-03-15T00:00:00Z",
      "deliverables": [
        "Working MVP",
        "Database schema",
        "API documentation"
      ]
    },
    {
      "title": "Final Implementation",
      "description": "Testing, optimization, and deployment",
      "amount": 1000,
      "dueDate": "2024-04-01T00:00:00Z",
      "deliverables": [
        "Production deployment",
        "Test results",
        "User manual"
      ]
    }
  ],
  "terms": {
    "revisionLimit": 3,
    "communicationRequirements": "Weekly progress updates",
    "intellectual_property": "Client retains all rights",
    "cancellationPolicy": "7 days notice required"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "contract_id_890",
    "projectId": "project_id_123",
    "clientId": "client_id_456",
    "freelancerId": "freelancer_id_789",
    "status": "draft",
    "totalAmount": 3500,
    "milestones": [
      {
        "index": 0,
        "title": "Design and Planning",
        "status": "pending",
        "amount": 1000,
        "dueDate": "2024-02-15T00:00:00Z"
      }
    ],
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

### 2. Get User Contracts

**GET** `/`

Retrieve contracts for the authenticated user with filtering and pagination.

**Authentication Required**: Yes

**Query Parameters**:
- `status` (enum): "draft", "active", "completed", "cancelled", "disputed", "paused"
- `category` (string): Project category filter
- `startDate` (string): Filter contracts starting from date
- `endDate` (string): Filter contracts ending before date
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `sortBy` (enum): "createdAt", "totalAmount", "status", "deadline"
- `sortOrder` (enum): "asc", "desc"

**Response**:
```json
{
  "success": true,
  "data": {
    "contracts": [
      {
        "id": "contract_id_890",
        "project": {
          "id": "project_id_123",
          "title": "E-commerce Website Development"
        },
        "client": {
          "id": "client_id_456",
          "name": "John Doe",
          "profilePicture": "https://storage.url/profile.jpg"
        },
        "freelancer": {
          "id": "freelancer_id_789",
          "name": "Jane Smith",
          "profilePicture": "https://storage.url/freelancer.jpg"
        },
        "status": "active",
        "totalAmount": 3500,
        "milestonesCount": 3,
        "completedMilestones": 1,
        "nextMilestoneDue": "2024-03-15T00:00:00Z",
        "progress": 33.3,
        "createdAt": "2024-01-20T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### 3. Get Contract Statistics

**GET** `/stats`

Get statistical overview of user's contracts.

**Authentication Required**: Yes

**Response**:
```json
{
  "success": true,
  "data": {
    "role": "freelancer",
    "stats": {
      "active": {
        "count": 3,
        "totalValue": 8500
      },
      "completed": {
        "count": 15,
        "totalValue": 45000
      },
      "draft": {
        "count": 1,
        "totalValue": 2000
      },
      "cancelled": {
        "count": 2,
        "totalValue": 3000
      }
    },
    "earnings": {
      "thisMonth": 5500,
      "lastMonth": 4200,
      "total": 45000
    },
    "averageProjectValue": 3000,
    "averageCompletionTime": "45 days",
    "successRate": 88.2
  }
}
```

### 4. Get Contract Details

**GET** `/:id`

Retrieve detailed information about a specific contract.

**Authentication Required**: Yes (Client or Freelancer on contract)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "contract_id_890",
    "project": {
      "id": "project_id_123",
      "title": "E-commerce Website Development",
      "description": "Full project description...",
      "category": "Web Development"
    },
    "client": {
      "id": "client_id_456",
      "name": "John Doe",
      "email": "john@example.com",
      "profilePicture": "https://storage.url/profile.jpg",
      "rating": 4.8,
      "totalProjects": 15
    },
    "freelancer": {
      "id": "freelancer_id_789",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "profilePicture": "https://storage.url/freelancer.jpg",
      "rating": 4.9,
      "completedProjects": 45
    },
    "status": "active",
    "totalAmount": 3500,
    "paidAmount": 1000,
    "remainingAmount": 2500,
    "startDate": "2024-02-01T00:00:00Z",
    "endDate": "2024-04-01T00:00:00Z",
    "milestones": [
      {
        "index": 0,
        "title": "Design and Planning",
        "description": "Create wireframes and project plan",
        "amount": 1000,
        "status": "completed",
        "dueDate": "2024-02-15T00:00:00Z",
        "deliverables": ["Wireframes in Figma", "Technical specification"],
        "submission": {
          "submittedAt": "2024-02-14T16:30:00Z",
          "submittedBy": "freelancer_id_789",
          "description": "Milestone completed as requested",
          "attachments": [
            {
              "id": "file_id_1",
              "name": "wireframes.fig",
              "url": "https://storage.url/wireframes"
            }
          ]
        },
        "review": {
          "reviewedAt": "2024-02-15T09:00:00Z",
          "reviewedBy": "client_id_456",
          "status": "approved",
          "feedback": "Excellent work, exactly what we needed",
          "rating": 5
        },
        "payment": {
          "paidAt": "2024-02-15T10:00:00Z",
          "paymentId": "payment_id_123"
        }
      },
      {
        "index": 1,
        "title": "Development Phase 1",
        "description": "Core functionality implementation",
        "amount": 1500,
        "status": "in_progress",
        "dueDate": "2024-03-15T00:00:00Z",
        "deliverables": ["Working MVP", "Database schema"],
        "progress": 65
      }
    ],
    "modifications": [
      {
        "index": 0,
        "requestedBy": "client_id_456",
        "requestedAt": "2024-02-20T14:00:00Z",
        "type": "scope_change",
        "description": "Add mobile responsive design",
        "budgetImpact": 500,
        "timelineImpact": "1 week",
        "status": "approved",
        "approvedAt": "2024-02-21T09:00:00Z",
        "approvedBy": "freelancer_id_789"
      }
    ],
    "terms": {
      "revisionLimit": 3,
      "communicationRequirements": "Weekly progress updates",
      "cancellationPolicy": "7 days notice required"
    },
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-02-21T09:00:00Z"
  }
}
```

### 5. Update Contract (Client Only)

**PUT** `/:id`

Update contract details (only for draft contracts).

**Authentication Required**: Yes (Client role, own contracts only)

**Request Body**: Similar to Create Contract

**Response**: Updated contract object

### 6. Activate Contract (Client Only)

**POST** `/:id/activate`

Move contract from draft to active status.

**Authentication Required**: Yes (Client role)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "contract_id_890",
    "status": "active",
    "activatedAt": "2024-02-01T09:00:00Z",
    "firstMilestone": {
      "index": 0,
      "dueDate": "2024-02-15T00:00:00Z",
      "amount": 1000
    }
  }
}
```

## Milestone Management

### 7. Submit Milestone (Freelancer Only)

**POST** `/:id/milestones/:milestoneIndex/submit`

Submit deliverables for a milestone.

**Authentication Required**: Yes (Freelancer role, assigned to contract)

**Request Body**:
```json
{
  "description": "Completed all wireframes and technical specifications as requested. Added mobile-first responsive design approach.",
  "attachments": [
    {
      "id": "file_id_1",
      "name": "wireframes.fig",
      "url": "https://storage.url/wireframes"
    },
    {
      "id": "file_id_2", 
      "name": "technical_spec.pdf",
      "url": "https://storage.url/tech_spec"
    }
  ],
  "additionalNotes": "Included extra mobile mockups based on our discussion"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "milestone": {
      "index": 0,
      "status": "submitted",
      "submittedAt": "2024-02-14T16:30:00Z",
      "description": "Completed all wireframes...",
      "attachments": [...]
    },
    "contract": {
      "id": "contract_id_890",
      "status": "active"
    }
  }
}
```

### 8. Review Milestone (Client Only)

**POST** `/:id/milestones/:milestoneIndex/review`

Review and approve/reject submitted milestone.

**Authentication Required**: Yes (Client role, own contracts only)

**Request Body**:
```json
{
  "status": "approved",
  "feedback": "Excellent work! The wireframes perfectly capture our vision. The mobile-first approach is exactly what we needed.",
  "rating": 5,
  "requestRevisions": false,
  "revisionNotes": ""
}
```

**For revision requests**:
```json
{
  "status": "revision_requested",
  "feedback": "Good work overall, but need some adjustments to the navigation flow.",
  "rating": 4,
  "requestRevisions": true,
  "revisionNotes": [
    "Update main navigation to include search functionality",
    "Adjust product page layout based on competitor analysis",
    "Add wishlist functionality to wireframes"
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "milestone": {
      "index": 0,
      "status": "approved",
      "reviewedAt": "2024-02-15T09:00:00Z",
      "feedback": "Excellent work!",
      "rating": 5,
      "payment": {
        "status": "processing",
        "expectedReleaseDate": "2024-02-16T09:00:00Z"
      }
    },
    "contract": {
      "progress": 33.3,
      "nextMilestone": {
        "index": 1,
        "dueDate": "2024-03-15T00:00:00Z"
      }
    }
  }
}
```

## Contract Modifications

### 9. Request Modification

**POST** `/:id/modifications`

Request a change to the contract terms.

**Authentication Required**: Yes (Client or Freelancer on contract)

**Request Body**:
```json
{
  "type": "scope_change",
  "description": "Client requests addition of mobile app development alongside the web platform",
  "budgetImpact": 2000,
  "timelineImpact": "3 weeks",
  "justification": "Market research shows mobile users represent 70% of target audience",
  "affectedMilestones": [1, 2],
  "proposedChanges": {
    "newMilestones": [
      {
        "title": "Mobile App Development",
        "description": "iOS and Android applications",
        "amount": 2000,
        "dueDate": "2024-04-15T00:00:00Z"
      }
    ],
    "updatedTotalAmount": 5500,
    "updatedEndDate": "2024-04-22T00:00:00Z"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "modification": {
      "index": 1,
      "requestedBy": "client_id_456",
      "requestedAt": "2024-02-20T14:00:00Z",
      "type": "scope_change",
      "status": "pending",
      "budgetImpact": 2000,
      "timelineImpact": "3 weeks"
    },
    "contract": {
      "id": "contract_id_890",
      "status": "active",
      "pendingModifications": 1
    }
  }
}
```

### 10. Handle Modification

**POST** `/:id/modifications/:modificationIndex/approve`

Approve or reject a contract modification.

**Authentication Required**: Yes (Other party in contract)

**Query Parameters**:
- `approve` (boolean): Whether to approve or reject
- `rejectionReason` (string): Required if approve=false

**Request Examples**:

**Approval**:
```
POST /contracts/contract_id_890/modifications/1/approve?approve=true
```

**Rejection**:
```
POST /contracts/contract_id_890/modifications/1/approve?approve=false&rejectionReason=Budget increase is too high for current scope
```

**Response (Approval)**:
```json
{
  "success": true,
  "data": {
    "modification": {
      "index": 1,
      "status": "approved",
      "approvedAt": "2024-02-21T09:00:00Z",
      "approvedBy": "freelancer_id_789"
    },
    "contract": {
      "id": "contract_id_890",
      "totalAmount": 5500,
      "endDate": "2024-04-22T00:00:00Z",
      "milestones": [
        {
          "index": 3,
          "title": "Mobile App Development",
          "amount": 2000,
          "status": "pending"
        }
      ]
    }
  }
}
```

### 11. Update Contract Status

**PUT** `/:id/status`

Update contract status (pause, resume, complete, cancel).

**Authentication Required**: Yes (Client or Freelancer on contract)

**Request Body**:
```json
{
  "status": "paused",
  "reason": "Client requested temporary pause due to budget review",
  "notes": "Will resume after Q1 budget approval, expected in 2 weeks"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "contract_id_890",
    "status": "paused",
    "statusUpdatedAt": "2024-02-25T11:30:00Z",
    "statusReason": "Client requested temporary pause...",
    "pausedMilestones": [
      {
        "index": 1,
        "title": "Development Phase 1",
        "originalDueDate": "2024-03-15T00:00:00Z",
        "pausedAt": "2024-02-25T11:30:00Z"
      }
    ]
  }
}
```

### 12. Delete Contract (Client Only)

**DELETE** `/:id`

Delete a contract (only draft contracts).

**Authentication Required**: Yes (Client role, own contracts only)

**Response**:
```json
{
  "success": true,
  "message": "Contract deleted successfully"
}
```

## Contract Status Flow

### Status Transitions

1. **Draft** → **Active** (Client activates)
2. **Active** → **Paused** (Either party with reason)
3. **Paused** → **Active** (Resume work)
4. **Active** → **Completed** (All milestones approved)
5. **Active** → **Cancelled** (Either party with notice)
6. **Active** → **Disputed** (Dispute resolution process)

### Milestone Status Flow

1. **Pending** → **In Progress** (Freelancer starts work)
2. **In Progress** → **Submitted** (Freelancer submits deliverables)
3. **Submitted** → **Approved** (Client approves)
4. **Submitted** → **Revision Requested** (Client requests changes)
5. **Revision Requested** → **Submitted** (Freelancer resubmits)
6. **Approved** → **Paid** (Payment processed)

## Error Responses

### Common Error Codes

- **400 Bad Request**: Invalid request data or business logic violation
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions or contract access denied
- **404 Not Found**: Contract or milestone not found
- **409 Conflict**: Invalid status transition or already processed

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Cannot move from completed to active status",
    "details": {
      "currentStatus": "completed",
      "requestedStatus": "active",
      "allowedTransitions": ["archived"]
    }
  }
}
```

## Webhooks

### Contract Events

The system sends webhooks for:
- `contract.created`
- `contract.activated` 
- `contract.paused`
- `contract.resumed`
- `contract.completed`
- `contract.cancelled`
- `milestone.submitted`
- `milestone.approved`
- `milestone.revision_requested`
- `modification.requested`
- `modification.approved`
- `modification.rejected`

**Webhook Payload Example**:
```json
{
  "event": "milestone.submitted",
  "timestamp": "2024-02-14T16:30:00Z",
  "data": {
    "contractId": "contract_id_890",
    "milestoneIndex": 0,
    "freelancerId": "freelancer_id_789",
    "clientId": "client_id_456",
    "milestone": {
      "title": "Design and Planning",
      "amount": 1000,
      "status": "submitted"
    }
  }
}
```

## Rate Limiting

- Contract operations: 50 requests per hour per user
- Milestone submissions: 10 submissions per hour per freelancer
- Modification requests: 5 requests per day per contract
