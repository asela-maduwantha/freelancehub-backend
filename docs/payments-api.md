# Payments API Documentation

## Overview
The Payments API handles all financial transactions, including payment intents, escrow payments, Stripe integration, connected accounts for freelancers, and webhook processing. Provides secure payment processing with escrow protection for both clients and freelancers.

## Base URL
```
/api/v1/payments
```

## Authentication
All endpoints require JWT authentication with appropriate role-based access, except webhook endpoint.

---

## Endpoints

### 1. Create Payment Intent (Client Only)

**POST** `/intent`

Creates a Stripe payment intent for contract payment.

**Authentication Required**: Yes (Client role)

**Request Body**:
```json
{
  "contractId": "contract_id_890",
  "amount": 1000
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "paymentIntentId": "pi_1234567890",
    "clientSecret": "pi_1234567890_secret_abcdef",
    "amount": 1000,
    "currency": "usd",
    "status": "requires_payment_method",
    "contractId": "contract_id_890",
    "createdAt": "2024-02-15T10:00:00Z",
    "metadata": {
      "contractId": "contract_id_890",
      "clientId": "client_id_456",
      "freelancerId": "freelancer_id_789",
      "milestoneIndex": 0
    }
  }
}
```

### 2. Confirm Payment

**POST** `/confirm/:paymentIntentId`

Confirms payment completion after successful Stripe processing.

**Authentication Required**: No (called by Stripe or frontend after payment)

**Response**:
```json
{
  "success": true,
  "data": {
    "paymentId": "payment_id_123",
    "status": "succeeded",
    "amount": 1000,
    "contractId": "contract_id_890",
    "milestoneIndex": 0,
    "paidAt": "2024-02-15T10:05:00Z",
    "escrowStatus": "held",
    "releaseDate": "2024-02-16T10:05:00Z"
  }
}
```

### 3. Create Escrow Payment (Client Only)

**POST** `/escrow`

Creates an escrow payment that will be held until milestone completion.

**Authentication Required**: Yes (Client role)

**Request Body**:
```json
{
  "contractId": "contract_id_890",
  "amount": 1500,
  "description": "Payment for Development Phase 1 milestone"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "escrowPaymentId": "escrow_id_456",
    "contractId": "contract_id_890",
    "amount": 1500,
    "status": "held",
    "description": "Payment for Development Phase 1 milestone",
    "holdUntil": "milestone_approval",
    "estimatedReleaseDate": "2024-03-15T00:00:00Z",
    "createdAt": "2024-02-15T10:00:00Z",
    "fees": {
      "platformFee": 75,
      "processingFee": 45,
      "freelancerReceives": 1380
    }
  }
}
```

### 4. Release Escrow Payment (Client Only)

**POST** `/escrow/:paymentId/release`

Releases escrowed funds to freelancer upon milestone completion.

**Authentication Required**: Yes (Client role)

**Response**:
```json
{
  "success": true,
  "data": {
    "escrowPaymentId": "escrow_id_456",
    "status": "released",
    "releasedAt": "2024-03-15T09:30:00Z",
    "transferId": "tr_1234567890",
    "freelancerAmount": 1380,
    "transferredTo": {
      "freelancerId": "freelancer_id_789",
      "stripeAccountId": "acct_freelancer123",
      "transferStatus": "pending"
    },
    "fees": {
      "platformFee": 75,
      "processingFee": 45
    }
  }
}
```

### 5. Refund Payment (Client Only)

**POST** `/:paymentId/refund`

Initiates a refund for a payment.

**Authentication Required**: Yes (Client role)

**Request Body**:
```json
{
  "reason": "Project cancelled by mutual agreement"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "refundId": "re_1234567890",
    "paymentId": "payment_id_123",
    "amount": 1000,
    "reason": "Project cancelled by mutual agreement",
    "status": "pending",
    "estimatedArrival": "2024-02-20T00:00:00Z",
    "createdAt": "2024-02-16T14:30:00Z"
  }
}
```

### 6. Get Payment History for Contract

**GET** `/contract/:contractId`

Retrieves complete payment history for a specific contract.

**Authentication Required**: Yes (Client or Freelancer on contract)

**Response**:
```json
{
  "success": true,
  "data": {
    "contractId": "contract_id_890",
    "totalPaid": 2500,
    "totalRefunded": 0,
    "totalEscrowed": 1000,
    "payments": [
      {
        "id": "payment_id_123",
        "type": "milestone_payment",
        "amount": 1000,
        "status": "completed",
        "milestoneIndex": 0,
        "paidAt": "2024-02-15T10:05:00Z",
        "method": "card",
        "last4": "4242",
        "escrow": {
          "status": "released",
          "releasedAt": "2024-02-16T10:05:00Z"
        }
      },
      {
        "id": "payment_id_124",
        "type": "milestone_payment", 
        "amount": 1500,
        "status": "completed",
        "milestoneIndex": 1,
        "paidAt": "2024-03-10T15:20:00Z",
        "method": "card",
        "last4": "4242",
        "escrow": {
          "status": "held",
          "holdReason": "pending_milestone_approval"
        }
      }
    ],
    "upcomingPayments": [
      {
        "milestoneIndex": 2,
        "amount": 1000,
        "estimatedDueDate": "2024-04-01T00:00:00Z",
        "status": "pending_milestone_completion"
      }
    ],
    "summary": {
      "totalContractValue": 3500,
      "amountPaid": 2500,
      "amountPending": 1000,
      "platformFeesCollected": 125,
      "freelancerReceived": 2255
    }
  }
}
```

### 7. Get User Payments

**GET** `/my-payments`

Retrieves payment history for the authenticated user (different data based on role).

**Authentication Required**: Yes

**Response (Client)**:
```json
{
  "success": true,
  "data": {
    "role": "client",
    "summary": {
      "totalSpent": 45000,
      "totalRefunded": 2000,
      "activeEscrow": 3500,
      "thisMonth": 5500,
      "lastMonth": 8200
    },
    "recentPayments": [
      {
        "id": "payment_id_123",
        "contractId": "contract_id_890",
        "freelancer": {
          "name": "Jane Smith",
          "profilePicture": "https://storage.url/jane.jpg"
        },
        "project": {
          "title": "E-commerce Website"
        },
        "amount": 1000,
        "status": "completed",
        "paidAt": "2024-02-15T10:05:00Z"
      }
    ],
    "paymentMethods": [
      {
        "id": "pm_1234567890",
        "type": "card",
        "brand": "visa",
        "last4": "4242",
        "expiryMonth": 12,
        "expiryYear": 2027,
        "isDefault": true
      }
    ]
  }
}
```

**Response (Freelancer)**:
```json
{
  "success": true,
  "data": {
    "role": "freelancer",
    "summary": {
      "totalEarned": 38000,
      "pendingPayments": 2500,
      "availableBalance": 1200,
      "thisMonth": 4500,
      "lastMonth": 6800
    },
    "recentPayments": [
      {
        "id": "payment_id_123",
        "contractId": "contract_id_890",
        "client": {
          "name": "John Doe",
          "profilePicture": "https://storage.url/john.jpg"
        },
        "project": {
          "title": "E-commerce Website"
        },
        "amount": 1000,
        "platformFee": 50,
        "receivedAmount": 950,
        "status": "transferred",
        "transferredAt": "2024-02-16T10:05:00Z"
      }
    ],
    "stripeAccount": {
      "id": "acct_freelancer123",
      "status": "complete",
      "payoutsEnabled": true,
      "chargesEnabled": true
    }
  }
}
```

## Stripe Connected Accounts (Freelancer)

### 8. Create Connected Account (Freelancer Only)

**POST** `/connected-account`

Creates a Stripe connected account for freelancer to receive payments.

**Authentication Required**: Yes (Freelancer role)

**Response**:
```json
{
  "success": true,
  "data": {
    "accountId": "acct_freelancer123",
    "status": "pending",
    "onboardingUrl": "https://connect.stripe.com/express/oauth/authorize?client_id=ca_xxx&state=freelancer_id_789",
    "requirements": {
      "currentlyDue": [
        "individual.first_name",
        "individual.last_name",
        "individual.email",
        "business_type",
        "tos_acceptance.date"
      ],
      "pastDue": [],
      "pendingVerification": []
    },
    "createdAt": "2024-02-01T09:00:00Z"
  }
}
```

### 9. Get Account Status (Freelancer Only)

**GET** `/account-status`

Retrieves current status of freelancer's Stripe connected account.

**Authentication Required**: Yes (Freelancer role)

**Response**:
```json
{
  "success": true,
  "data": {
    "accountId": "acct_freelancer123",
    "status": "complete",
    "details": {
      "payoutsEnabled": true,
      "chargesEnabled": true,
      "detailsSubmitted": true,
      "type": "express"
    },
    "capabilities": {
      "card_payments": "active",
      "transfers": "active"
    },
    "requirements": {
      "currentlyDue": [],
      "pastDue": [],
      "pendingVerification": [],
      "disabledReason": null
    },
    "balance": {
      "available": [
        {
          "amount": 120000,
          "currency": "usd"
        }
      ],
      "pending": [
        {
          "amount": 25000,
          "currency": "usd"
        }
      ]
    },
    "payoutSchedule": {
      "interval": "daily",
      "delayDays": 2
    },
    "country": "US",
    "defaultCurrency": "usd",
    "email": "jane@freelancer.com"
  }
}
```

## Webhook Processing

### 10. Handle Stripe Webhooks

**POST** `/webhook`

Processes Stripe webhooks for payment status updates.

**Authentication Required**: No (Stripe signature verification)

**Webhook Events Handled**:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `transfer.created`
- `transfer.paid`
- `transfer.failed`
- `account.updated`
- `capability.updated`
- `payout.created`
- `payout.paid`
- `payout.failed`

**Response**:
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "eventType": "payment_intent.succeeded",
  "processed": true
}
```

**Webhook Processing Examples**:

**Payment Intent Succeeded**:
```json
{
  "id": "evt_1234567890",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "amount": 100000,
      "status": "succeeded",
      "metadata": {
        "contractId": "contract_id_890",
        "clientId": "client_id_456",
        "milestoneIndex": "0"
      }
    }
  }
}
```

## Payment Flow

### Standard Payment Process

1. **Client creates payment intent** → Stripe PaymentIntent created
2. **Client completes payment** → Funds captured to platform account  
3. **Payment confirmed** → Funds moved to escrow
4. **Freelancer submits milestone** → Escrow status updated
5. **Client approves milestone** → Funds released to freelancer's connected account
6. **Platform fees deducted** → Net amount transferred to freelancer

### Escrow Protection

- **Client Protection**: Funds held until work is approved
- **Freelancer Protection**: Guaranteed payment once work is approved
- **Dispute Resolution**: Funds remain in escrow during disputes
- **Automatic Release**: Configurable auto-release after approval timeout

## Payment Security

### Fraud Prevention

- **Stripe Radar**: Built-in fraud detection
- **3D Secure**: Strong customer authentication
- **Risk Scoring**: Transaction risk assessment
- **Velocity Checking**: Payment frequency limits

### Data Security

- **PCI Compliance**: Stripe handles all card data
- **Encryption**: All payment data encrypted in transit and at rest
- **Tokenization**: No raw card data stored
- **Audit Logging**: Complete payment audit trail

## Fee Structure

### Platform Fees

- **Service Fee**: 5% of transaction amount
- **Processing Fee**: 2.9% + $0.30 per transaction (Stripe)
- **International**: Additional 1% for international cards
- **Disputes**: $15 per chargeback

### Fee Calculation Example

```json
{
  "transactionAmount": 1000,
  "fees": {
    "platformFee": 50,
    "stripeFee": 29.30,
    "totalFees": 79.30,
    "freelancerReceives": 920.70
  }
}
```

## Error Responses

### Common Error Codes

- **400 Bad Request**: Invalid payment data or insufficient funds
- **401 Unauthorized**: Authentication required
- **402 Payment Required**: Payment method required or failed
- **403 Forbidden**: Insufficient permissions or account restricted
- **404 Not Found**: Payment or contract not found
- **409 Conflict**: Payment already processed or invalid state

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Your card was declined",
    "details": {
      "declineCode": "insufficient_funds",
      "paymentIntentId": "pi_1234567890",
      "suggestedActions": [
        "Try a different payment method",
        "Contact your bank",
        "Add funds to your account"
      ]
    }
  }
}
```

## Webhooks

### Payment Events

The system sends webhooks for:
- `payment.created`
- `payment.succeeded`
- `payment.failed`
- `payment.refunded`
- `escrow.created`
- `escrow.released`
- `transfer.completed`
- `payout.created`

**Webhook Payload Example**:
```json
{
  "event": "payment.succeeded",
  "timestamp": "2024-02-15T10:05:00Z",
  "data": {
    "paymentId": "payment_id_123",
    "contractId": "contract_id_890",
    "amount": 1000,
    "clientId": "client_id_456",
    "freelancerId": "freelancer_id_789",
    "milestoneIndex": 0,
    "paymentMethod": "card",
    "escrowStatus": "held"
  }
}
```

## Rate Limiting

- Payment operations: 20 requests per minute per user
- Webhook processing: No limit (Stripe manages retry logic)
- Connected account operations: 10 requests per hour per freelancer

## Testing

### Test Cards (Stripe Test Mode)

- **Success**: `4242424242424242`
- **Declined**: `4000000000000002`
- **Insufficient Funds**: `4000000000009995`
- **Authentication Required**: `4000002500003155`

### Test Webhooks

Use Stripe CLI to forward webhooks to local development:
```bash
stripe listen --forward-to localhost:3000/api/v1/payments/webhook
```
