# Messaging API Documentation

## Overview
The Messaging API provides real-time communication capabilities between freelancers and clients. Supports direct messaging, conversation management, message status tracking, and search functionality.

## Base URL
```
/api/v1/messaging
```

## Authentication
All endpoints require JWT authentication.

---

## Endpoints

### 1. Send Message

**POST** `/messages`

Send a new message to another user.

**Authentication Required**: Yes

**Request Body**:
```json
{
  "receiverId": "user_id_456",
  "content": "Hi! I'm interested in your project and would like to discuss the requirements.",
  "attachments": [
    {
      "id": "file_id_123",
      "name": "portfolio.pdf",
      "url": "https://storage.url/portfolio.pdf"
    }
  ],
  "projectId": "project_id_789",
  "messageType": "text"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "message_id_123",
    "conversationId": "conv_id_456",
    "senderId": "user_id_123",
    "receiverId": "user_id_456",
    "content": "Hi! I'm interested in your project...",
    "messageType": "text",
    "status": "sent",
    "sentAt": "2024-01-16T14:30:00Z",
    "attachments": [
      {
        "id": "file_id_123",
        "name": "portfolio.pdf",
        "url": "https://storage.url/portfolio.pdf"
      }
    ]
  }
}
```

### 2. Get Messages

**GET** `/messages`

Retrieve messages with pagination and filtering.

**Authentication Required**: Yes

**Query Parameters**:
- `conversationId` (string): Filter by conversation
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `before` (string): Messages before timestamp
- `after` (string): Messages after timestamp
- `unreadOnly` (boolean): Only unread messages

**Response**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message_id_123",
        "conversationId": "conv_id_456",
        "sender": {
          "id": "user_id_123",
          "name": "Jane Smith",
          "profilePicture": "https://storage.url/jane.jpg",
          "role": "freelancer"
        },
        "content": "Hi! I'm interested in your project...",
        "messageType": "text",
        "status": "read",
        "sentAt": "2024-01-16T14:30:00Z",
        "readAt": "2024-01-16T14:35:00Z",
        "attachments": [],
        "isEdited": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 3. Get Conversations

**GET** `/conversations`

Retrieve all conversations for the authenticated user.

**Authentication Required**: Yes

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

**Response**:
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv_id_456",
        "participants": [
          {
            "id": "user_id_123",
            "name": "Jane Smith",
            "profilePicture": "https://storage.url/jane.jpg",
            "role": "freelancer",
            "isOnline": true,
            "lastSeen": "2024-01-16T15:00:00Z"
          },
          {
            "id": "user_id_789",
            "name": "John Doe",
            "profilePicture": "https://storage.url/john.jpg",
            "role": "client",
            "isOnline": false,
            "lastSeen": "2024-01-16T13:45:00Z"
          }
        ],
        "lastMessage": {
          "id": "message_id_890",
          "content": "Sounds great! When can we start?",
          "sentBy": "user_id_789",
          "sentAt": "2024-01-16T14:45:00Z",
          "messageType": "text"
        },
        "unreadCount": 2,
        "project": {
          "id": "project_id_789",
          "title": "E-commerce Website Development"
        },
        "isArchived": false,
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-16T14:45:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

### 4. Create Conversation

**POST** `/conversations`

Start a new conversation with specified participants.

**Authentication Required**: Yes

**Request Body**:
```json
{
  "participantIds": ["user_id_456"],
  "projectId": "project_id_789",
  "initialMessage": "Hi! I'd like to discuss your project requirements."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "conv_id_456",
    "participants": [
      {
        "id": "user_id_123",
        "name": "Jane Smith",
        "role": "freelancer"
      },
      {
        "id": "user_id_456",
        "name": "John Doe",
        "role": "client"
      }
    ],
    "project": {
      "id": "project_id_789",
      "title": "E-commerce Website"
    },
    "createdAt": "2024-01-16T15:00:00Z",
    "firstMessage": {
      "id": "message_id_901",
      "content": "Hi! I'd like to discuss your project requirements.",
      "sentAt": "2024-01-16T15:00:00Z"
    }
  }
}
```

### 5. Edit Message

**PUT** `/messages/:messageId`

Edit your own message (within 24 hours).

**Authentication Required**: Yes (message sender only)

**Request Body**:
```json
{
  "content": "Hi! I'm very interested in your project and would love to discuss the requirements in detail."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "message_id_123",
    "content": "Hi! I'm very interested in your project...",
    "isEdited": true,
    "editedAt": "2024-01-16T14:35:00Z",
    "originalContent": "Hi! I'm interested in your project..."
  }
}
```

### 6. Delete Message

**DELETE** `/messages/:messageId`

Delete your own message.

**Authentication Required**: Yes (message sender only)

**Response**:
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

### 7. Mark Message as Read

**POST** `/messages/:messageId/read`

Mark a received message as read.

**Authentication Required**: Yes (message receiver only)

**Response**:
```json
{
  "success": true,
  "data": {
    "messageId": "message_id_123",
    "readAt": "2024-01-16T14:35:00Z"
  }
}
```

### 8. Mark Conversation as Read

**POST** `/conversations/:conversationId/read`

Mark all messages in a conversation as read.

**Authentication Required**: Yes (conversation participant only)

**Response**:
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_id_456",
    "markedRead": 3,
    "readAt": "2024-01-16T14:40:00Z"
  }
}
```

### 9. Archive Conversation

**POST** `/conversations/:conversationId/archive`

Archive a conversation to hide it from active conversations.

**Authentication Required**: Yes (conversation participant only)

**Response**:
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_id_456",
    "isArchived": true,
    "archivedAt": "2024-01-16T15:00:00Z"
  }
}
```

### 10. Get Unread Count

**GET** `/unread-count`

Get total count of unread messages and conversations.

**Authentication Required**: Yes

**Response**:
```json
{
  "success": true,
  "data": {
    "unreadMessages": 12,
    "unreadConversations": 3,
    "breakdown": {
      "directMessages": 8,
      "projectMessages": 4
    },
    "lastUpdated": "2024-01-16T15:00:00Z"
  }
}
```

### 11. Search Messages

**GET** `/search`

Search through user messages by content.

**Authentication Required**: Yes

**Query Parameters**:
- `q` (string): Search term (required)
- `limit` (number): Maximum results (default: 20)
- `conversationId` (string): Search within specific conversation
- `before` (string): Search messages before timestamp
- `after` (string): Search messages after timestamp

**Response**:
```json
{
  "success": true,
  "data": {
    "query": "project requirements",
    "results": [
      {
        "id": "message_id_123",
        "content": "Hi! I'd like to discuss your project requirements in detail...",
        "conversationId": "conv_id_456",
        "sender": {
          "id": "user_id_123",
          "name": "Jane Smith"
        },
        "sentAt": "2024-01-16T14:30:00Z",
        "highlights": [
          {
            "field": "content",
            "snippet": "...discuss your <mark>project requirements</mark> in detail..."
          }
        ]
      }
    ],
    "totalResults": 8,
    "searchTime": "0.05s"
  }
}
```

## WebSocket Integration

### Real-time Events

The messaging system integrates with WebSocket for real-time updates:

**Connection**: `wss://api.freelancehub.com/ws`

**Events Received**:
- `message.new` - New message received
- `message.read` - Message marked as read
- `message.edited` - Message edited
- `message.deleted` - Message deleted
- `typing.start` - User started typing
- `typing.stop` - User stopped typing
- `user.online` - User came online
- `user.offline` - User went offline

**Event Example**:
```json
{
  "event": "message.new",
  "data": {
    "messageId": "message_id_123",
    "conversationId": "conv_id_456",
    "senderId": "user_id_789",
    "content": "Hello there!",
    "sentAt": "2024-01-16T15:30:00Z"
  }
}
```

## Message Types

### Supported Message Types

- **text**: Plain text message
- **file**: File attachment
- **image**: Image attachment
- **proposal**: Proposal-related message
- **contract**: Contract-related message
- **system**: System-generated message

### System Messages

Automatically generated for:
- Project milestones completed
- Payments processed
- Contract status changes
- Proposal submissions

## Error Responses

### Common Error Codes

- **400 Bad Request**: Invalid message data or empty content
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Cannot message this user or access conversation
- **404 Not Found**: Message, conversation, or user not found
- **413 Payload Too Large**: Attachment size exceeds limit
- **429 Too Many Requests**: Rate limit exceeded

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "MESSAGE_TOO_LONG",
    "message": "Message content exceeds maximum length of 2000 characters",
    "details": {
      "maxLength": 2000,
      "currentLength": 2150
    }
  }
}
```

## Rate Limiting

- Message sending: 30 messages per minute per user
- Conversation creation: 10 new conversations per hour per user
- Search requests: 20 searches per minute per user
- File uploads: 5 files per minute per user

## File Attachments

### Supported File Types
- Documents: PDF, DOC, DOCX, TXT
- Images: JPG, PNG, GIF, WebP
- Archives: ZIP, RAR
- Code: Most source code files

### File Size Limits
- Images: 10 MB maximum
- Documents: 25 MB maximum
- Archives: 50 MB maximum
- Total per message: 100 MB maximum

## Privacy & Security

### Message Encryption
- All messages encrypted in transit (TLS 1.3)
- Message content encrypted at rest
- End-to-end encryption for sensitive contract discussions

### Data Retention
- Messages retained for 7 years for legal compliance
- Deleted messages marked as deleted but not permanently removed
- File attachments deleted after 30 days of message deletion

### Blocked Users
- Users can block other users from messaging
- Blocked users cannot start new conversations
- Existing conversations remain accessible but no new messages allowed

## Webhooks

### Messaging Events

Available webhook events:
- `message.sent`
- `message.delivered`
- `message.read`
- `conversation.created`
- `conversation.archived`

**Webhook Payload Example**:
```json
{
  "event": "message.sent",
  "timestamp": "2024-01-16T15:30:00Z",
  "data": {
    "messageId": "message_id_123",
    "conversationId": "conv_id_456",
    "senderId": "user_id_789",
    "receiverId": "user_id_123",
    "projectId": "project_id_890"
  }
}
```
