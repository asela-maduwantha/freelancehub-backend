# Freelancer Onboarding Endpoints

This document outlines the new endpoints created for comprehensive freelancer profile onboarding after email verification.

## Authentication Flow

1. **Register**: `POST /v1/auth/register` with `primaryRole: 'freelancer'`
2. **Verify Email**: `POST /v1/auth/verify-email-otp` with OTP ✅ **NOW RETURNS TOKENS**
3. **Create Profile**: Use tokens from step 2 with onboarding endpoints below

**Note**: Email verification now returns authentication tokens, eliminating the need for a separate login step!

## Core Onboarding Endpoints

### Complete Profile Management
- `POST /v1/freelancer/profile/create` - Create complete freelancer profile
- `GET /v1/freelancer/profile/complete` - Get complete freelancer profile
- `GET /v1/freelancer/profile/completion` - Get profile completion status

### Section-wise Profile Building
- `PUT /v1/freelancer/profile/professional` - Update professional info
- `PUT /v1/freelancer/profile/skills` - Update skills & categories
- `PUT /v1/freelancer/profile/languages` - Update languages
- `PUT /v1/freelancer/profile/pricing` - Update pricing info
- `PUT /v1/freelancer/profile/visibility` - Update visibility settings

### Additional Profile Elements
- `POST /v1/freelancer/education` - Add education
- `POST /v1/freelancer/certification` - Add certification
- `POST /v1/freelancer/profile/portfolio` - Add portfolio item

## Key Features

### 1. Complete Profile Creation
Creates a comprehensive FreelancerProfile document with:
- Professional information (title, description, experience, working hours)
- Skills (primary, secondary, categories, detailed skill levels)
- Languages with proficiency levels
- Optional pricing (hourly rates, fixed packages)
- Visibility settings

### 2. Section-wise Updates
Allows incremental profile building:
- Each section can be updated independently
- Validation ensures data integrity
- Profile completion percentage auto-calculated

### 3. Profile Completion Tracking
- Automatic completion percentage calculation
- Section-by-section completion status
- Personalized suggestions for improvement

### 4. Rich Data Structure
Supports comprehensive freelancer information:
- Detailed skill proficiency levels
- Working hours and availability
- Multiple pricing models
- Portfolio with technologies and links
- Education and certifications
- Visibility controls

## Example Usage

### 1. Create Complete Profile
```typescript
POST /v1/freelancer/profile/create
{
  "professional": {
    "title": "Senior Full-Stack Developer",
    "description": "Experienced developer with 5+ years...",
    "experience": "expert",
    "availability": "available",
    "workingHours": {
      "timezone": "UTC-5",
      "monday": { "start": "09:00", "end": "17:00", "available": true },
      // ... other days
    }
  },
  "skills": {
    "primary": ["JavaScript", "React", "Node.js"],
    "secondary": ["Docker", "AWS"],
    "categories": ["Web Development"],
    "detailed": [
      { "name": "React", "level": "expert", "yearsOfExperience": 5 }
    ]
  },
  "languages": {
    "languages": [
      { "name": "English", "proficiency": "native" },
      { "name": "Spanish", "proficiency": "conversational" }
    ]
  },
  "pricing": {
    "hourlyRate": { "min": 50, "max": 100, "currency": "USD" }
  }
}
```

### 2. Update Professional Info
```typescript
PUT /v1/freelancer/profile/professional
{
  "title": "Updated Title",
  "description": "Updated description...",
  "experience": "expert",
  "workingHours": { /* working hours object */ }
}
```

### 3. Check Completion Status
```typescript
GET /v1/freelancer/profile/completion
// Returns:
{
  "completionPercentage": 75,
  "sectionsCompleted": {
    "professional": true,
    "skills": true,
    "languages": true,
    "pricing": false,
    "portfolio": false,
    "education": false,
    "certifications": false
  },
  "suggestions": [
    "Add pricing information to attract clients",
    "Upload portfolio items to showcase your work"
  ]
}
```

## Frontend Integration

### Complete Authentication & Onboarding Flow

#### Step 1: Registration
```typescript
POST /v1/auth/register
{
  "email": "john@example.com",
  "username": "johndev",
  "firstName": "John",
  "lastName": "Doe", 
  "primaryRole": "freelancer",
  "password": "SecurePass123!",
  "location": {
    "country": "Sri Lanka",
    "city": "Colombo"
  }
}
// Returns: { message: "...", verificationRequired: true }
```

#### Step 2: Email Verification (NOW RETURNS TOKENS!)
```typescript
POST /v1/auth/verify-email-otp
{
  "email": "john@example.com",
  "otp": "123456"
}
// Returns: {
//   success: true,
//   message: "Email verified successfully",
//   accessToken: "eyJhbGciOiJIUzI1NiIs...",
//   refreshToken: "a1b2c3d4e5f6...",
//   user: { id, email, username, role, profile },
//   expiresIn: 900
// }
```

#### Step 3: Immediate Onboarding (Using tokens from Step 2)
```typescript
// Store tokens from verification response
const { accessToken, refreshToken, user } = verificationResponse;
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Check if freelancer profile exists
const completion = await fetch('/v1/freelancer/profile/completion', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

// If profile doesn't exist, start onboarding
if (completion.status === 404) {
  // Create complete profile
  const profileResponse = await fetch('/v1/freelancer/profile/create', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  });
}
```

### Recommended Onboarding Flow
1. **After email verification**: Tokens are immediately available
2. **Check profile status**: Use completion endpoint to see if profile exists
3. **Start onboarding**: Create complete profile or update sections
4. **Track progress**: Show completion percentage and suggestions
5. **Finalize**: Allow profile preview before publishing

### Progressive Enhancement
- Start with required fields (professional, skills, languages)
- Add optional sections (pricing, portfolio, education) incrementally
- Use completion percentage to gamify the process
- Provide suggestions for profile improvement

## Schema Integration

The endpoints work with the comprehensive `FreelancerProfile` schema that includes:
- Pre-save middleware for completion percentage calculation
- Proper indexing for search and filtering
- Rich embedded documents for complex data structures
- Automatic timestamp management

This provides a complete foundation for freelancer onboarding and profile management.
