# FreelanceHub Backend - Client Registration API Documentation

## Overview
This document provides comprehensive API documentation for client registration, email verification, onboarding, and platform features in the FreelanceHub platform.

**Base URL**: `http://localhost:3000` (development)  
**API Version**: v1  
**Authentication**: JWT Bearer Token (for protected endpoints)

---

## 🔐 Authentication Flow

### 1. Register New Client

**Endpoint**: `POST /v1/auth/register`  
**Authentication**: None required  
**Description**: Register a new client account with email verification

#### Request

```http
POST /v1/auth/register
Content-Type: application/json

{
  "email": "client@company.com",
  "username": "techcorp123",
  "firstName": "Jane",
  "lastName": "Smith",
  "primaryRole": "client",
  "phone": "+1-555-0123",
  "location": {
    "country": "United States",
    "city": "San Francisco",
    "coordinates": [-122.4194, 37.7749]
  },
  "dateOfBirth": "1985-03-20",
  "password": "SecurePassword123!"
}
```

#### Response

**Success (201 Created)**:
```json
{
  "message": "User registered successfully. Please check your email for verification.",
  "verificationRequired": true
}
```

**Error (400 Bad Request)**:
```json
{
  "statusCode": 400,
  "message": [
    "Email must be a valid email address",
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  ],
  "error": "Bad Request"
}
```

**Error (409 Conflict)**:
```json
{
  "statusCode": 409,
  "message": "Email or username already exists",
  "error": "Conflict"
}
```

---

### 2. Email Verification

#### Option A: Token-Based Verification

**Endpoint**: `POST /v1/auth/verify-email`  
**Authentication**: None required  
**Description**: Verify email address using token from email

##### Request

```http
POST /v1/auth/verify-email
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "client@company.com"
}
```

##### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### Option B: OTP-Based Verification

##### Send Email OTP

**Endpoint**: `POST /v1/auth/send-email-otp`  
**Authentication**: None required

```http
POST /v1/auth/send-email-otp
Content-Type: application/json

{
  "email": "client@company.com",
  "type": "verification"
}
```

**Response (200 OK)**:
```json
{
  "message": "OTP sent successfully to your email",
  "expiresIn": 300
}
```

##### Verify Email OTP

**Endpoint**: `POST /v1/auth/verify-email-otp`  
**Authentication**: None required

```http
POST /v1/auth/verify-email-otp
Content-Type: application/json

{
  "email": "client@company.com",
  "otp": "123456"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### 3. Login

**Endpoint**: `POST /v1/auth/login`  
**Authentication**: None required  
**Description**: Login with email and password after email verification

#### Request

```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "client@company.com",
  "password": "SecurePassword123!"
}
```

#### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "64f7b1a2c3d4e5f6a7b8c9d0",
    "email": "client@company.com",
    "username": "techcorp123",
    "firstName": "Jane",
    "lastName": "Smith",
    "roles": ["client"],
    "isEmailVerified": true,
    "profile": {
      "avatar": null,
      "location": {
        "country": "United States",
        "city": "San Francisco"
      }
    }
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

---

## 👤 Client Dashboard & Profile Management

### 1. Get Client Dashboard

**Endpoint**: `GET /v1/client/dashboard`  
**Authentication**: Bearer Token required  
**Description**: Get comprehensive client dashboard overview

#### Request

```http
GET /v1/client/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Success (200 OK)**:
```json
{
  "stats": {
    "activeProjects": 5,
    "totalProjects": 23,
    "totalSpent": 45750.00,
    "activeFreelancers": 8,
    "pendingProposals": 12,
    "completedProjects": 18
  },
  "recentProjects": [
    {
      "id": "64f7b1a2c3d4e5f6a7b8c9d1",
      "title": "Mobile App Development",
      "status": "active",
      "budget": {
        "amount": 5000,
        "currency": "USD"
      },
      "deadline": "2025-09-15T23:59:59Z",
      "freelancerCount": 3,
      "proposalCount": 8
    }
  ],
  "recentApplications": [
    {
      "projectTitle": "Website Redesign",
      "freelancerName": "John Doe",
      "freelancerAvatar": "https://example.com/avatar.jpg",
      "freelancerRating": 4.8,
      "proposalAmount": 2500,
      "proposalStatus": "pending",
      "submittedAt": "2025-08-27T14:30:00Z",
      "coverLetter": "I'm excited to work on your website redesign project..."
    }
  ],
  "upcomingDeadlines": [
    {
      "projectTitle": "E-commerce Platform",
      "deadline": "2025-08-30T23:59:59Z",
      "daysLeft": 3,
      "status": "in_progress"
    }
  ]
}
```

---

### 2. Get Client Statistics

**Endpoint**: `GET /v1/client/stats`  
**Authentication**: Bearer Token required  
**Description**: Get detailed client statistics and analytics

#### Request

```http
GET /v1/client/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Success (200 OK)**:
```json
{
  "totalProjectsPosted": 23,
  "totalMoneySpent": 45750.00,
  "totalFreelancersHired": 15,
  "averageProjectBudget": 1989,
  "projectCompletionRate": 78,
  "averageFreelancerRating": 4.8,
  "repeatFreelancers": 6,
  "memberSince": "2024-01-15T10:00:00Z"
}
```

---

### 3. Get Recent Applications

**Endpoint**: `GET /v1/client/recent-applications`  
**Authentication**: Bearer Token required  
**Description**: Get recent freelancer applications to client's projects

#### Request

```http
GET /v1/client/recent-applications?limit=5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Success (200 OK)**:
```json
[
  {
    "projectTitle": "Mobile App Development",
    "freelancerName": "Alice Johnson",
    "freelancerAvatar": "https://example.com/avatar-alice.jpg",
    "freelancerRating": 4.9,
    "proposalAmount": 4500,
    "proposalStatus": "pending",
    "submittedAt": "2025-08-27T16:45:00Z",
    "coverLetter": "I have 5+ years of experience in React Native development..."
  }
]
```

---

## 📊 Project Management

### 1. Get Client Projects

**Endpoint**: `GET /v1/client/projects`  
**Authentication**: Bearer Token required  
**Description**: Get all projects posted by the client with filtering options

#### Request

```http
GET /v1/client/projects?status=active&page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Query Parameters

| Parameter | Type | Description | Values |
|-----------|------|-------------|---------|
| status | string | Filter by project status | `active`, `completed`, `draft`, `cancelled` |
| page | number | Page number (default: 1) | Any positive integer |
| limit | number | Items per page (default: 10) | 1-50 |

#### Response

**Success (200 OK)**:
```json
{
  "projects": [
    {
      "id": "64f7b1a2c3d4e5f6a7b8c9d1",
      "title": "E-commerce Website Development",
      "description": "Build a modern e-commerce platform with React and Node.js",
      "status": "active",
      "budget": {
        "amount": 5000,
        "currency": "USD",
        "type": "fixed"
      },
      "deadline": "2025-09-15T23:59:59Z",
      "skills": ["React", "Node.js", "MongoDB", "Payment Integration"],
      "proposalCount": 12,
      "createdAt": "2025-08-20T10:00:00Z",
      "updatedAt": "2025-08-27T15:30:00Z"
    }
  ],
  "total": 23,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

---

### 2. Get Payment History

**Endpoint**: `GET /v1/client/payments`  
**Authentication**: Bearer Token required  
**Description**: Get client's payment history with filtering options

#### Request

```http
GET /v1/client/payments?status=completed&page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Query Parameters

| Parameter | Type | Description | Values |
|-----------|------|-------------|---------|
| status | string | Filter by payment status | `pending`, `completed`, `failed` |
| page | number | Page number (default: 1) | Any positive integer |
| limit | number | Items per page (default: 20) | 1-50 |

#### Response

**Success (200 OK)**:
```json
{
  "payments": [
    {
      "id": "64f7b1a2c3d4e5f6a7b8c9d2",
      "amount": 2500.00,
      "status": "completed",
      "createdAt": "2025-08-25T14:20:00Z",
      "projectTitle": "Website Redesign",
      "freelancerName": "John Doe",
      "paymentMethod": "Credit Card",
      "transactionId": "txn_1234567890"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

## 🔍 Freelancer Discovery

### 1. Search Freelancers

**Endpoint**: `GET /v1/client/freelancers/search`  
**Authentication**: Bearer Token required  
**Description**: Search and filter freelancers based on various criteria

#### Request

```http
GET /v1/client/freelancers/search?skills=React,Node.js&minRate=25&maxRate=75&location=USA&availability=available&experience=intermediate&page=1&limit=12
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| skills | string | Comma-separated skills | `React,Node.js,Python` |
| minRate | number | Minimum hourly rate | `25` |
| maxRate | number | Maximum hourly rate | `75` |
| location | string | Location filter | `USA`, `New York` |
| availability | string | Availability status | `available`, `busy`, `unavailable` |
| experience | string | Experience level | `entry`, `intermediate`, `expert` |
| page | number | Page number | `1` |
| limit | number | Results per page | `12` |

#### Response

**Success (200 OK)**:
```json
{
  "freelancers": [
    {
      "id": "64f7b1a2c3d4e5f6a7b8c9d3",
      "username": "johndoe_dev",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://example.com/avatar-john.jpg",
        "location": {
          "country": "United States",
          "city": "New York"
        }
      },
      "freelancerProfile": {
        "title": "Full Stack Developer",
        "hourlyRate": {
          "amount": 65,
          "currency": "USD"
        },
        "skills": ["React", "Node.js", "MongoDB", "AWS"],
        "availability": "available",
        "experienceLevel": "intermediate",
        "rating": 4.8,
        "completedProjects": 23,
        "bio": "Experienced developer specializing in modern web applications..."
      }
    }
  ],
  "total": 156,
  "page": 1,
  "limit": 12,
  "totalPages": 13
}
```

---

### 2. Add Freelancer to Favorites

**Endpoint**: `POST /v1/client/favorites/freelancers`  
**Authentication**: Bearer Token required  
**Description**: Add a freelancer to client's favorites list

#### Request

```http
POST /v1/client/favorites/freelancers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "freelancerId": "64f7b1a2c3d4e5f6a7b8c9d3"
}
```

#### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "message": "Freelancer added to favorites successfully"
}
```

---

### 3. Get Favorite Freelancers

**Endpoint**: `GET /v1/client/favorites/freelancers`  
**Authentication**: Bearer Token required  
**Description**: Get client's favorite freelancers list

#### Request

```http
GET /v1/client/favorites/freelancers?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Success (200 OK)**:
```json
{
  "favorites": [
    {
      "id": "64f7b1a2c3d4e5f6a7b8c9d3",
      "username": "johndoe_dev",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://example.com/avatar-john.jpg"
      },
      "freelancerProfile": {
        "title": "Full Stack Developer",
        "hourlyRate": {
          "amount": 65,
          "currency": "USD"
        },
        "rating": 4.8,
        "availability": "available"
      },
      "addedAt": "2025-08-25T10:30:00Z"
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

## 📈 Analytics & Insights

### 1. Get Spending Analytics

**Endpoint**: `GET /v1/client/analytics/spending`  
**Authentication**: Bearer Token required  
**Description**: Get client's spending analytics and trends

#### Request

```http
GET /v1/client/analytics/spending?period=monthly&year=2025
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Query Parameters

| Parameter | Type | Description | Values |
|-----------|------|-------------|---------|
| period | string | Analytics period | `monthly`, `yearly` |
| year | number | Specific year | `2025`, `2024` |

#### Response

**Success (200 OK)**:
```json
{
  "period": "monthly",
  "year": 2025,
  "totalSpent": 45750.00,
  "monthlyData": [
    {
      "month": 1,
      "monthName": "January",
      "amount": 3200.00,
      "projectCount": 2,
      "averageProjectValue": 1600.00
    },
    {
      "month": 2,
      "monthName": "February", 
      "amount": 5800.00,
      "projectCount": 3,
      "averageProjectValue": 1933.33
    }
  ],
  "topCategories": [
    {
      "category": "Web Development",
      "amount": 18500.00,
      "percentage": 40.4
    },
    {
      "category": "Mobile Development",
      "amount": 12750.00,
      "percentage": 27.9
    }
  ],
  "insights": {
    "highestSpendingMonth": "July",
    "lowestSpendingMonth": "February",
    "averageMonthlySpend": 3812.50,
    "yearOverYearGrowth": 23.5
  }
}
```

---

## 🔖 Saved Searches

### 1. Get Saved Searches

**Endpoint**: `GET /v1/client/saved-searches`  
**Authentication**: Bearer Token required  
**Description**: Get client's saved freelancer search criteria

#### Request

```http
GET /v1/client/saved-searches
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Success (200 OK)**:
```json
[
  {
    "id": "64f7b1a2c3d4e5f6a7b8c9d4",
    "name": "React Developers - Mid Level",
    "criteria": {
      "skills": ["React", "JavaScript", "CSS"],
      "minRate": 30,
      "maxRate": 60,
      "location": "United States",
      "availability": "available",
      "experience": "intermediate"
    },
    "createdAt": "2025-08-20T09:15:00Z",
    "lastUsed": "2025-08-27T14:20:00Z"
  }
]
```

---

### 2. Save Search Criteria

**Endpoint**: `POST /v1/client/saved-searches`  
**Authentication**: Bearer Token required  
**Description**: Save freelancer search criteria for future use

#### Request

```http
POST /v1/client/saved-searches
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Mobile App Developers",
  "criteria": {
    "skills": ["React Native", "Flutter", "iOS", "Android"],
    "minRate": 40,
    "maxRate": 80,
    "location": "North America",
    "availability": "available",
    "experience": "expert"
  }
}
```

#### Response

**Success (201 Created)**:
```json
{
  "success": true,
  "message": "Search saved successfully",
  "searchId": "64f7b1a2c3d4e5f6a7b8c9d5"
}
```

---

## 🔑 Passkey Setup (WebAuthn)

### 1. Get Registration Challenge

**Endpoint**: `POST /v1/auth/passkey/registration-challenge`  
**Authentication**: Bearer Token required  
**Description**: Get WebAuthn registration challenge for authenticated client

#### Request

```http
POST /v1/auth/passkey/registration-challenge
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### Response

**Success (200 OK)**:
```json
{
  "challenge": "Y2hhbGxlbmdlX2V4YW1wbGU",
  "rp": {
    "name": "FreelanceHub",
    "id": "freelancehub.com"
  },
  "user": {
    "id": "64f7b1a2c3d4e5f6a7b8c9d0",
    "name": "client@company.com",
    "displayName": "Jane Smith"
  },
  "pubKeyCredParams": [
    {
      "type": "public-key",
      "alg": -7
    }
  ],
  "timeout": 60000,
  "attestation": "none",
  "authenticatorSelection": {
    "authenticatorAttachment": "platform",
    "userVerification": "required"
  }
}
```

---

### 2. Register Passkey

**Endpoint**: `POST /v1/auth/passkey/register`  
**Authentication**: Bearer Token required  
**Description**: Register new passkey for authenticated client

#### Request

```http
POST /v1/auth/passkey/register
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "MacBook TouchID",
  "registrationResponse": {
    "id": "credential_id_base64",
    "rawId": "credential_raw_id_buffer",
    "response": {
      "clientDataJSON": "client_data_json_base64",
      "attestationObject": "attestation_object_base64"
    },
    "type": "public-key"
  },
  "challenge": "Y2hhbGxlbmdlX2V4YW1wbGU"
}
```

#### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "message": "Passkey registered successfully"
}
```

---

## 🔒 Additional Security Features

### 1. Enable 2FA

**Endpoint**: `POST /v1/auth/2fa/enable`  
**Authentication**: Bearer Token required  
**Description**: Enable Two-Factor Authentication for client account

#### Request

```http
POST /v1/auth/2fa/enable
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### Response

**Success (200 OK)**:
```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "backupCodes": [
    "a1b2c3d4",
    "e5f6g7h8",
    "i9j0k1l2",
    "m3n4o5p6",
    "q7r8s9t0"
  ],
  "message": "2FA setup initiated. Scan the QR code with your authenticator app."
}
```

---

### 2. Get Current User Profile

**Endpoint**: `GET /v1/auth/me`  
**Authentication**: Bearer Token required  
**Description**: Get current authenticated user's profile information

#### Request

```http
GET /v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Success (200 OK)**:
```json
{
  "id": "64f7b1a2c3d4e5f6a7b8c9d0",
  "email": "client@company.com",
  "username": "techcorp123",
  "roles": ["client"],
  "profile": {
    "firstName": "Jane",
    "lastName": "Smith",
    "avatar": "https://example.com/avatar.jpg",
    "location": {
      "country": "United States",
      "city": "San Francisco"
    },
    "phone": "+1-555-0123"
  },
  "verification": {
    "isEmailVerified": true,
    "isPhoneVerified": false,
    "has2FA": true,
    "hasPasskey": true
  },
  "preferences": {
    "emailNotifications": true,
    "pushNotifications": true,
    "language": "en",
    "timezone": "America/Los_Angeles"
  },
  "activity": {
    "lastLoginAt": "2025-08-27T09:15:00Z",
    "lastActiveAt": "2025-08-27T16:45:00Z",
    "loginCount": 127
  }
}
```

---

### 3. Password Reset Flow

#### Request Password Reset

**Endpoint**: `POST /v1/auth/forgot-password`  
**Authentication**: None required

```http
POST /v1/auth/forgot-password
Content-Type: application/json

{
  "email": "client@company.com"
}
```

**Response (200 OK)**:
```json
{
  "message": "Password reset OTP sent to your email",
  "expiresIn": 600
}
```

#### Reset Password

**Endpoint**: `POST /v1/auth/reset-password`  
**Authentication**: None required

```http
POST /v1/auth/reset-password
Content-Type: application/json

{
  "email": "client@company.com",
  "otp": "123456",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 4. Token Management

#### Refresh Access Token

**Endpoint**: `POST /v1/auth/refresh`  
**Authentication**: None required

```http
POST /v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

#### Logout

**Endpoint**: `POST /v1/auth/logout`  
**Authentication**: Bearer Token required

```http
POST /v1/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Logout All Devices

**Endpoint**: `POST /v1/auth/logout-all`  
**Authentication**: Bearer Token required

```http
POST /v1/auth/logout-all
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

---

## ⚠️ Error Handling

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation failed |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    "Email must be a valid email address",
    "Password must be at least 8 characters long"
  ]
}
```

---

## 🔧 Rate Limiting

All authentication endpoints are rate-limited:
- Registration: 5 attempts per hour per IP
- Login: 10 attempts per 15 minutes per IP
- Email OTP: 3 attempts per 5 minutes per email
- Password reset: 3 attempts per hour per email

Client-specific endpoints (protected routes) have standard rate limiting:
- Search freelancers: 100 requests per minute
- Dashboard data: 60 requests per minute
- Other endpoints: 120 requests per minute

---

## 📊 Data Models

### Client Profile Structure

```json
{
  "clientProfile": {
    "favoriteFreelancers": ["64f7b1a2c3d4e5f6a7b8c9d3"],
    "projectHistory": ["64f7b1a2c3d4e5f6a7b8c9d1"],
    "totalSpent": 45750.00,
    "projectsPosted": 23,
    "savedSearches": [
      {
        "name": "React Developers",
        "criteria": {
          "skills": ["React", "JavaScript"],
          "minRate": 30,
          "maxRate": 60
        }
      }
    ]
  }
}
```

---

## 🚀 Client Onboarding Checklist

### Phase 1: Account Setup
- ✅ Register account with email verification
- ✅ Complete basic profile information
- ✅ Set up security (2FA/Passkey recommended)

### Phase 2: Platform Familiarization
- ✅ Explore freelancer search and filtering
- ✅ Save frequently used search criteria
- ✅ Add promising freelancers to favorites

### Phase 3: First Project
- ✅ Post first project (via Project Management API)
- ✅ Review incoming proposals
- ✅ Hire first freelancer

### Phase 4: Optimization
- ✅ Set up payment methods
- ✅ Configure notification preferences
- ✅ Explore analytics and reporting

---

## 📝 Notes

1. **JWT Tokens**: Access tokens expire in 1 hour, refresh tokens in 7 days
2. **Email Verification**: Required before full platform access
3. **Role-Based Access**: All `/client/*` endpoints require client role
4. **Search Optimization**: Use saved searches for frequently used criteria
5. **Security**: Passkey and 2FA strongly recommended for business accounts
6. **Analytics**: Spending analytics help track project ROI
7. **Favorites**: Build a network of trusted freelancers for repeat projects

---

*Last Updated: August 27, 2025*
