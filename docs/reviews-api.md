# Reviews & Rating API Documentation

## Overview
The Reviews API manages the rating and review system for the FreelanceHub platform. Handles review creation, rating calculations, featured reviews, user statistics, and review moderation.

## Base URL
```
/api/v1/reviews
```

## Authentication
All endpoints require JWT authentication.

---

## Endpoints

### 1. Create Review

**POST** `/`

Create a new review for a completed project.

**Authentication Required**: Yes

**Request Body**:
```json
{
  "revieweeId": "user_id_456",
  "projectId": "project_id_789",
  "contractId": "contract_id_123",
  "rating": 5,
  "title": "Outstanding work and communication",
  "comment": "Jane delivered exceptional work on our e-commerce platform. Her attention to detail, proactive communication, and technical expertise exceeded our expectations. The project was completed on time and within budget.",
  "skills": [
    {
      "name": "React Development",
      "rating": 5
    },
    {
      "name": "Communication",
      "rating": 5
    },
    {
      "name": "Project Management",
      "rating": 4
    }
  ],
  "categories": {
    "quality": 5,
    "communication": 5,
    "timeliness": 5,
    "professionalism": 5
  },
  "wouldRecommend": true,
  "isPublic": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "review_id_123",
    "reviewer": {
      "id": "user_id_123",
      "name": "John Doe",
      "profilePicture": "https://storage.url/john.jpg",
      "role": "client"
    },
    "reviewee": {
      "id": "user_id_456",
      "name": "Jane Smith",
      "profilePicture": "https://storage.url/jane.jpg",
      "role": "freelancer"
    },
    "project": {
      "id": "project_id_789",
      "title": "E-commerce Website Development"
    },
    "rating": 5,
    "title": "Outstanding work and communication",
    "comment": "Jane delivered exceptional work...",
    "skills": [
      {
        "name": "React Development",
        "rating": 5
      }
    ],
    "categories": {
      "quality": 5,
      "communication": 5,
      "timeliness": 5,
      "professionalism": 5
    },
    "wouldRecommend": true,
    "isPublic": true,
    "status": "published",
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

### 2. Get Reviews

**GET** `/`

Retrieve reviews with filtering and pagination.

**Authentication Required**: Yes

**Query Parameters**:
- `userId` (string): Filter by reviewee user ID
- `reviewerId` (string): Filter by reviewer user ID
- `projectId` (string): Filter by project ID
- `rating` (number): Filter by minimum rating
- `userType` (enum): "freelancer" or "client"
- `featured` (boolean): Only featured reviews
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `sortBy` (enum): "rating", "date", "helpful"
- `sortOrder` (enum): "asc" or "desc"

**Response**:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review_id_123",
        "reviewer": {
          "id": "user_id_123",
          "name": "John Doe",
          "profilePicture": "https://storage.url/john.jpg",
          "role": "client",
          "verifiedClient": true
        },
        "reviewee": {
          "id": "user_id_456",
          "name": "Jane Smith",
          "profilePicture": "https://storage.url/jane.jpg",
          "role": "freelancer"
        },
        "project": {
          "id": "project_id_789",
          "title": "E-commerce Website Development",
          "category": "Web Development"
        },
        "rating": 5,
        "title": "Outstanding work and communication",
        "comment": "Jane delivered exceptional work...",
        "categories": {
          "quality": 5,
          "communication": 5,
          "timeliness": 5,
          "professionalism": 5
        },
        "wouldRecommend": true,
        "helpfulCount": 8,
        "isFeatured": true,
        "createdAt": "2024-01-20T10:30:00Z",
        "response": {
          "id": "response_id_456",
          "content": "Thank you for the wonderful review! It was a pleasure working on this project.",
          "createdAt": "2024-01-20T14:30:00Z"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    },
    "aggregation": {
      "averageRating": 4.7,
      "totalReviews": 45,
      "ratingDistribution": {
        "5": 28,
        "4": 12,
        "3": 3,
        "2": 1,
        "1": 1
      }
    }
  }
}
```

### 3. Get Featured Reviews

**GET** `/featured`

Retrieve featured reviews for the platform.

**Authentication Required**: Yes

**Query Parameters**:
- `limit` (number): Maximum reviews to return (default: 10)
- `userType` (enum): "freelancer" or "client"
- `category` (string): Project category filter

**Response**:
```json
{
  "success": true,
  "data": {
    "featuredReviews": [
      {
        "id": "review_id_123",
        "reviewer": {
          "name": "Tech Startup Inc.",
          "profilePicture": "https://storage.url/company.jpg",
          "role": "client",
          "verifiedClient": true
        },
        "reviewee": {
          "name": "Jane Smith",
          "profilePicture": "https://storage.url/jane.jpg",
          "role": "freelancer",
          "topRated": true
        },
        "rating": 5,
        "title": "Exceptional React Developer",
        "comment": "Jane built our entire e-commerce platform from scratch...",
        "project": {
          "title": "E-commerce Platform",
          "category": "Web Development",
          "budget": 5000
        },
        "featuredReason": "high_impact_project",
        "createdAt": "2024-01-20T10:30:00Z"
      }
    ]
  }
}
```

### 4. Get Top-Rated Users

**GET** `/top-rated`

Retrieve top-rated freelancers or clients.

**Authentication Required**: Yes

**Query Parameters**:
- `userType` (enum): "freelancer" or "client" (default: "freelancer")
- `limit` (number): Maximum users to return (default: 10)
- `category` (string): Filter by expertise category
- `minReviews` (number): Minimum number of reviews required

**Response**:
```json
{
  "success": true,
  "data": {
    "topRatedUsers": [
      {
        "id": "user_id_456",
        "name": "Jane Smith",
        "profilePicture": "https://storage.url/jane.jpg",
        "role": "freelancer",
        "averageRating": 4.9,
        "totalReviews": 47,
        "completedProjects": 52,
        "successRate": 96,
        "topSkills": ["React", "Node.js", "MongoDB"],
        "recentReview": {
          "rating": 5,
          "comment": "Amazing developer, highly recommended!",
          "projectTitle": "SaaS Dashboard"
        },
        "badges": ["Top Rated", "Expert Verified", "Quick Responder"],
        "hourlyRate": 85,
        "isAvailable": true
      }
    ],
    "metadata": {
      "category": "Web Development",
      "averageRating": 4.6,
      "totalUsers": 1250
    }
  }
}
```

### 5. Get User Rating Statistics

**GET** `/user/:userId/stats`

Get detailed rating statistics for a specific user.

**Authentication Required**: Yes

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "user_id_456",
    "userType": "freelancer",
    "overall": {
      "averageRating": 4.8,
      "totalReviews": 47,
      "totalProjects": 52,
      "responseRate": 94
    },
    "categories": {
      "quality": {
        "average": 4.9,
        "count": 47
      },
      "communication": {
        "average": 4.8,
        "count": 47
      },
      "timeliness": {
        "average": 4.7,
        "count": 47
      },
      "professionalism": {
        "average": 4.9,
        "count": 47
      }
    },
    "ratingDistribution": {
      "5": 35,
      "4": 10,
      "3": 2,
      "2": 0,
      "1": 0
    },
    "skills": [
      {
        "name": "React Development",
        "averageRating": 4.9,
        "reviewCount": 28
      },
      {
        "name": "Node.js",
        "averageRating": 4.8,
        "reviewCount": 22
      }
    ],
    "trends": {
      "last30Days": {
        "averageRating": 4.9,
        "reviewCount": 3
      },
      "last90Days": {
        "averageRating": 4.8,
        "reviewCount": 8
      },
      "yearOverYear": {
        "ratingChange": 0.2,
        "reviewsChange": 15
      }
    },
    "badges": ["Top Rated", "Expert Verified"],
    "recommendationRate": 96.2
  }
}
```

### 6. Get Review by ID

**GET** `/:reviewId`

Retrieve a specific review by its ID.

**Authentication Required**: Yes

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "review_id_123",
    "reviewer": {
      "id": "user_id_123",
      "name": "John Doe",
      "profilePicture": "https://storage.url/john.jpg",
      "role": "client",
      "joinedAt": "2022-03-15T00:00:00Z",
      "totalProjectsPosted": 12
    },
    "reviewee": {
      "id": "user_id_456",
      "name": "Jane Smith",
      "profilePicture": "https://storage.url/jane.jpg",
      "role": "freelancer",
      "joinedAt": "2021-08-20T00:00:00Z",
      "totalProjectsCompleted": 52
    },
    "project": {
      "id": "project_id_789",
      "title": "E-commerce Website Development",
      "category": "Web Development",
      "budget": 3500,
      "duration": "2 months",
      "completedAt": "2024-01-18T00:00:00Z"
    },
    "contract": {
      "id": "contract_id_123",
      "totalAmount": 3500,
      "completionTime": "6 weeks"
    },
    "rating": 5,
    "title": "Outstanding work and communication",
    "comment": "Jane delivered exceptional work on our e-commerce platform...",
    "skills": [
      {
        "name": "React Development",
        "rating": 5
      },
      {
        "name": "Communication",
        "rating": 5
      }
    ],
    "categories": {
      "quality": 5,
      "communication": 5,
      "timeliness": 5,
      "professionalism": 5
    },
    "wouldRecommend": true,
    "helpfulVotes": {
      "helpful": 8,
      "notHelpful": 1
    },
    "isPublic": true,
    "isFeatured": true,
    "status": "published",
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-01-20T10:30:00Z",
    "response": {
      "id": "response_id_456",
      "content": "Thank you for the wonderful review! It was a pleasure working on this project.",
      "createdAt": "2024-01-20T14:30:00Z"
    }
  }
}
```

### 7. Update Review

**PUT** `/:reviewId`

Update your own review (within 30 days of creation).

**Authentication Required**: Yes (reviewer only)

**Request Body**:
```json
{
  "rating": 5,
  "title": "Updated: Outstanding work and exceptional communication",
  "comment": "Updated review: Jane delivered exceptional work on our e-commerce platform...",
  "categories": {
    "quality": 5,
    "communication": 5,
    "timeliness": 5,
    "professionalism": 5
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "review_id_123",
    "rating": 5,
    "title": "Updated: Outstanding work and exceptional communication",
    "comment": "Updated review: Jane delivered exceptional work...",
    "isEdited": true,
    "editedAt": "2024-01-21T09:15:00Z",
    "updatedAt": "2024-01-21T09:15:00Z"
  }
}
```

### 8. Delete Review

**DELETE** `/:reviewId`

Delete your own review.

**Authentication Required**: Yes (reviewer only)

**Response**:
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

### 9. Add Review Response

**POST** `/:reviewId/response`

Add a response to a review about yourself.

**Authentication Required**: Yes (reviewee only)

**Request Body**:
```json
{
  "content": "Thank you for the wonderful review, John! It was a pleasure working with you on this project. I'm glad the e-commerce platform met all your expectations."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "response_id_456",
    "reviewId": "review_id_123",
    "responderId": "user_id_456",
    "content": "Thank you for the wonderful review, John!...",
    "createdAt": "2024-01-20T14:30:00Z"
  }
}
```

### 10. Update Review Response

**PUT** `/:reviewId/response`

Update your response to a review.

**Authentication Required**: Yes (original responder only)

**Request Body**:
```json
{
  "content": "Updated response: Thank you for the wonderful review, John! It was truly a pleasure working with you on this challenging and rewarding project."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "response_id_456",
    "content": "Updated response: Thank you for the wonderful review...",
    "isEdited": true,
    "editedAt": "2024-01-20T15:00:00Z"
  }
}
```

### 11. Delete Review Response

**DELETE** `/:reviewId/response`

Delete your response to a review.

**Authentication Required**: Yes (original responder only)

**Response**:
```json
{
  "success": true,
  "message": "Review response deleted successfully"
}
```

### 12. Vote on Review Helpfulness

**POST** `/:reviewId/vote`

Vote on whether a review is helpful.

**Authentication Required**: Yes

**Request Body**:
```json
{
  "vote": "helpful"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "reviewId": "review_id_123",
    "userVote": "helpful",
    "helpfulCount": 9,
    "notHelpfulCount": 1,
    "totalVotes": 10
  }
}
```

### 13. Report Review

**POST** `/:reviewId/report`

Report a review for inappropriate content.

**Authentication Required**: Yes

**Request Body**:
```json
{
  "reason": "inappropriate_content",
  "description": "This review contains offensive language and personal attacks not related to the work performed.",
  "category": "harassment"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "reportId": "report_id_789",
    "reviewId": "review_id_123",
    "status": "submitted",
    "submittedAt": "2024-01-21T10:00:00Z",
    "ticketNumber": "REP-2024-001"
  }
}
```

## Review Analytics

### 14. Get Platform Review Analytics

**GET** `/analytics`

Get overall platform review statistics (Admin only).

**Authentication Required**: Yes (Admin role)

**Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalReviews": 12540,
      "averageRating": 4.6,
      "totalUsers": 8920,
      "responseRate": 78
    },
    "trends": {
      "thisMonth": {
        "reviews": 456,
        "averageRating": 4.7,
        "change": 12
      },
      "lastMonth": {
        "reviews": 407,
        "averageRating": 4.6,
        "change": 8
      }
    },
    "ratingDistribution": {
      "5": 7524,
      "4": 3762,
      "3": 940,
      "2": 235,
      "1": 79
    },
    "categories": {
      "quality": 4.7,
      "communication": 4.6,
      "timeliness": 4.5,
      "professionalism": 4.8
    },
    "topCategories": [
      {
        "name": "Web Development",
        "reviews": 3254,
        "averageRating": 4.7
      },
      {
        "name": "Mobile Apps",
        "reviews": 1876,
        "averageRating": 4.6
      }
    ]
  }
}
```

## Review Validation

### Review Eligibility Rules

1. **Project Completion**: Project must be marked as completed
2. **No Duplicate Reviews**: One review per project per user
3. **Time Limit**: Must be submitted within 90 days of project completion
4. **Participation**: Only project participants can leave reviews
5. **Mutual Reviews**: Both client and freelancer can review each other

### Content Moderation

- **Automated Filtering**: Profanity and spam detection
- **Manual Review**: Flagged content reviewed by moderators
- **Community Reporting**: Users can report inappropriate reviews
- **Appeal Process**: Users can appeal moderation decisions

## Error Responses

### Common Error Codes

- **400 Bad Request**: Invalid review data or business logic violation
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Cannot review this user or access review
- **404 Not Found**: Review, user, or project not found
- **409 Conflict**: Review already exists or duplicate vote
- **422 Unprocessable Entity**: Content violates platform guidelines

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "REVIEW_ALREADY_EXISTS",
    "message": "You have already reviewed this user for this project",
    "details": {
      "projectId": "project_id_789",
      "existingReviewId": "review_id_456"
    }
  }
}
```

## Webhooks

### Review Events

Available webhook events:
- `review.created`
- `review.updated`
- `review.deleted`
- `review.responded`
- `review.reported`
- `review.featured`

**Webhook Payload Example**:
```json
{
  "event": "review.created",
  "timestamp": "2024-01-20T10:30:00Z",
  "data": {
    "reviewId": "review_id_123",
    "reviewerId": "user_id_123",
    "revieweeId": "user_id_456",
    "projectId": "project_id_789",
    "rating": 5,
    "isPublic": true
  }
}
```

## Rate Limiting

- Review creation: 5 reviews per day per user
- Review updates: 3 updates per review
- Voting: 50 votes per hour per user
- Response creation: 10 responses per day per user
