# FreelanceHub Backend - Freelancer Registration API Documentation

## Overview
This document provides comprehensive API documentation for freelancer registration, email verification, onboarding, and passkey setup in the FreelanceHub platform.

**Base URL**: `http://localhost:3000` (development)  
**API Version**: v1  
**Authentication**: JWT Bearer Token (for protected endpoints)

---

## 🔐 Authentication Flow

### 1. Register New Freelancer

**Endpoint**: `POST /v1/auth/register`  
**Authentication**: None required  
**Description**: Register a new freelancer account with email verification

#### Request

```http
POST /v1/auth/register
Content-Type: application/json

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
  "dateOfBirth": "1990-01-15",
  "password": "StrongPassword123!"
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
  "email": "john.doe@example.com"
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

**Error (400 Bad Request)**:
```json
{
  "statusCode": 400,
  "message": "Invalid or expired verification token",
  "error": "Bad Request"
}
```

#### Option B: OTP-Based Verification

##### Send Email OTP

**Endpoint**: `POST /v1/auth/send-email-otp`  
**Authentication**: None required  
**Description**: Send OTP to email for verification

```http
POST /v1/auth/send-email-otp
Content-Type: application/json

{
  "email": "john.doe@example.com",
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
**Description**: Verify email using 6-digit OTP

```http
POST /v1/auth/verify-email-otp
Content-Type: application/json

{
  "email": "john.doe@example.com",
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
  "email": "john.doe@example.com",
  "password": "StrongPassword123!"
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
    "email": "john.doe@example.com",
    "username": "johndoe123",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["freelancer"],
    "isEmailVerified": true,
    "profile": {
      "avatar": null,
      "location": {
        "country": "Sri Lanka",
        "city": "Colombo"
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

**Error (401 Unauthorized)**:
```json
{
  "statusCode": 401,
  "message": "Invalid credentials or email not verified",
  "error": "Unauthorized"
}
```

---

## 👤 Freelancer Profile Management

### 1. Update Freelancer Profile

**Endpoint**: `PUT /v1/freelancer/profile`  
**Authentication**: Bearer Token required  
**Description**: Complete or update freelancer profile information

#### Request

```http
PUT /v1/freelancer/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "bio": "Experienced full-stack developer with 5+ years of experience in React, Node.js, and MongoDB. Passionate about creating scalable web applications.",
  "title": "Full Stack Developer",
  "hourlyRate": {
    "amount": 50,
    "currency": "USD"
  },
  "skills": [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "MongoDB",
    "PostgreSQL",
    "AWS"
  ],
  "availability": "available",
  "experience": "intermediate"
}
```

#### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

### 2. Add Portfolio Item

**Endpoint**: `POST /v1/freelancer/portfolio`  
**Authentication**: Bearer Token required  
**Description**: Add a new portfolio item to showcase work

#### Request

```http
POST /v1/freelancer/portfolio
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "E-commerce Platform",
  "description": "Built a full-stack e-commerce platform using React and Node.js with integrated payment processing, user authentication, and admin dashboard.",
  "technologies": [
    "React",
    "Node.js", 
    "MongoDB",
    "Stripe",
    "AWS S3",
    "Redis"
  ],
  "images": [
    "https://example.com/portfolio/ecommerce-screenshot1.jpg",
    "https://example.com/portfolio/ecommerce-screenshot2.jpg"
  ],
  "links": [
    {
      "type": "live",
      "url": "https://myecommerce-demo.com"
    },
    {
      "type": "github",
      "url": "https://github.com/johndoe/ecommerce-platform"
    }
  ]
}
```

#### Response

**Success (201 Created)**:
```json
{
  "success": true,
  "message": "Portfolio item added successfully",
  "item": {
    "id": "64f7b1a2c3d4e5f6a7b8c9d1",
    "title": "E-commerce Platform",
    "description": "Built a full-stack e-commerce platform...",
    "technologies": ["React", "Node.js", "MongoDB", "Stripe", "AWS S3", "Redis"],
    "images": ["https://example.com/portfolio/ecommerce-screenshot1.jpg"],
    "links": [
      {
        "type": "live",
        "url": "https://myecommerce-demo.com"
      }
    ],
    "createdAt": "2025-08-27T10:30:00Z"
  }
}
```

---

### 3. Get Portfolio

**Endpoint**: `GET /v1/freelancer/portfolio`  
**Authentication**: Bearer Token required  
**Description**: Retrieve all portfolio items for the freelancer

#### Request

```http
GET /v1/freelancer/portfolio
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Success (200 OK)**:
```json
[
  {
    "id": "64f7b1a2c3d4e5f6a7b8c9d1",
    "title": "E-commerce Platform",
    "description": "Built a full-stack e-commerce platform...",
    "technologies": ["React", "Node.js", "MongoDB", "Stripe"],
    "images": ["https://example.com/portfolio/ecommerce-screenshot1.jpg"],
    "links": [
      {
        "type": "live",
        "url": "https://myecommerce-demo.com"
      }
    ],
    "createdAt": "2025-08-27T10:30:00Z"
  }
]
```

---

### 4. Get Dashboard Data

**Endpoint**: `GET /v1/freelancer/dashboard`  
**Authentication**: Bearer Token required  
**Description**: Get freelancer dashboard overview with stats and recent activity

#### Request

```http
GET /v1/freelancer/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Success (200 OK)**:
```json
{
  "stats": {
    "activeProjects": 3,
    "pendingProposals": 2,
    "totalEarnings": 15750,
    "profileViews": 87,
    "completedProjects": 12,
    "successRate": 95
  },
  "recentActivity": [
    {
      "id": "64f7b1a2c3d4e5f6a7b8c9d2",
      "type": "proposal",
      "action": "Submitted proposal for \"Mobile App Development\"",
      "date": "2025-08-27T09:15:00Z",
      "status": "pending"
    },
    {
      "id": "64f7b1a2c3d4e5f6a7b8c9d3", 
      "type": "contract",
      "action": "Contract completed for \"Website Redesign\"",
      "date": "2025-08-26T16:30:00Z",
      "status": "completed"
    }
  ],
  "upcomingDeadlines": [
    {
      "projectTitle": "API Integration Project",
      "deadline": "2025-08-30T23:59:59Z",
      "daysLeft": 3
    }
  ],
  "recentMessages": [
    {
      "from": "Client Name",
      "preview": "Hi John, I have some questions about the project timeline...",
      "timestamp": "2025-08-27T08:45:00Z",
      "unread": true
    }
  ]
}
```

---

## 🔑 Passkey Setup (WebAuthn)

### 1. Get Registration Challenge

**Endpoint**: `POST /v1/auth/passkey/registration-challenge`  
**Authentication**: Bearer Token required  
**Description**: Get WebAuthn registration challenge for authenticated user

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
    "name": "john.doe@example.com",
    "displayName": "John Doe"
  },
  "pubKeyCredParams": [
    {
      "type": "public-key",
      "alg": -7
    },
    {
      "type": "public-key", 
      "alg": -257
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
**Description**: Register new passkey for authenticated user

#### Request

```http
POST /v1/auth/passkey/register
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "iPhone TouchID",
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

**Error (400 Bad Request)**:
```json
{
  "statusCode": 400,
  "message": "Passkey registration failed - invalid attestation",
  "error": "Bad Request"
}
```

---

### 3. Passkey Login Flow

#### Get Authentication Challenge

**Endpoint**: `POST /v1/auth/login/challenge`  
**Authentication**: None required  
**Description**: Get WebAuthn authentication challenge

```http
POST /v1/auth/login/challenge
Content-Type: application/json

{
  "identifier": "john.doe@example.com"
}
```

**Response (200 OK)**:
```json
{
  "challenge": "YXV0aF9jaGFsbGVuZ2VfZXhhbXBsZQ",
  "timeout": 60000,
  "rpId": "freelancehub.com",
  "allowCredentials": [
    {
      "type": "public-key",
      "id": "credential_id_base64"
    }
  ],
  "userVerification": "required"
}
```

#### Verify Authentication

**Endpoint**: `POST /v1/auth/login/verify`  
**Authentication**: None required  
**Description**: Verify WebAuthn authentication

```http
POST /v1/auth/login/verify
Content-Type: application/json

{
  "identifier": "john.doe@example.com",
  "authenticationResponse": {
    "id": "credential_id_base64",
    "rawId": "credential_raw_id_buffer", 
    "response": {
      "clientDataJSON": "client_data_json_base64",
      "authenticatorData": "authenticator_data_base64",
      "signature": "signature_base64"
    },
    "type": "public-key"
  },
  "challenge": "YXV0aF9jaGFsbGVuZ2VfZXhhbXBsZQ"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "id": "64f7b1a2c3d4e5f6a7b8c9d0",
    "email": "john.doe@example.com",
    "username": "johndoe123",
    "roles": ["freelancer"]
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

---

## 🔒 Additional Security Features

### 1. Enable 2FA

**Endpoint**: `POST /v1/auth/2fa/enable`  
**Authentication**: Bearer Token required  
**Description**: Enable Two-Factor Authentication and get QR code

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

### 2. Refresh Token

**Endpoint**: `POST /v1/auth/refresh`  
**Authentication**: None required  
**Description**: Refresh JWT access token using refresh token

#### Request

```http
POST /v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response

**Success (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

---

### 3. Logout

**Endpoint**: `POST /v1/auth/logout`  
**Authentication**: Bearer Token required  
**Description**: Logout from current device

#### Request

```http
POST /v1/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 📊 Additional Freelancer Endpoints

### Get Freelancer Stats

**Endpoint**: `GET /v1/freelancer/stats`  
**Authentication**: Bearer Token required

```http
GET /v1/freelancer/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**:
```json
{
  "totalProposals": 25,
  "acceptedProposals": 18,
  "proposalAcceptanceRate": 72,
  "totalEarnings": 15750,
  "averageProjectValue": 1312,
  "completedProjects": 12,
  "ongoingProjects": 3,
  "totalClients": 8,
  "joinDate": "2024-01-15T10:00:00Z"
}
```

### Get Activity Feed

**Endpoint**: `GET /v1/freelancer/activity`  
**Authentication**: Bearer Token required  
**Query Parameters**: `limit` (default: 10), `page` (default: 1)

```http
GET /v1/freelancer/activity?limit=5&page=1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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

---

## 📝 Notes

1. **JWT Tokens**: Access tokens expire in 1 hour, refresh tokens in 7 days
2. **Email Verification**: Required before login
3. **Profile Completion**: Tracked automatically with percentage
4. **WebAuthn Support**: Modern passkey authentication supported
5. **Security**: All endpoints use HTTPS in production
6. **Validation**: Comprehensive input validation on all endpoints
7. **CORS**: Configured for frontend integration

---

*Last Updated: August 27, 2025*
