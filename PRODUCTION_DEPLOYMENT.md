# Production Deployment Guide

## Prerequisites

### System Requirements
- Node.js 18+ (LTS recommended)
- MongoDB 6.0+
- Redis 6.0+
- AWS Account (for S3 file storage)
- SMTP Email Service
- SSL/TLS Certificate

### Required Environment Variables

⚠️ **CRITICAL**: The following environment variables must be set for production:

```bash
# Application
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb://your-mongodb-url/freelancehub_prod

# Security (GENERATE SECURE VALUES!)
JWT_SECRET=<secure-random-string-32-chars-minimum>
JWT_REFRESH_SECRET=<secure-random-string-32-chars-minimum>
SESSION_SECRET=<secure-random-string-32-chars-minimum>

# File Storage
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_REGION=<your-aws-region>
AWS_S3_BUCKET=<your-s3-bucket-name>

# Email
EMAIL_HOST=<your-smtp-host>
EMAIL_USER=<your-email-user>
EMAIL_PASSWORD=<your-email-password>

# Payment (Production Keys)
STRIPE_SECRET_KEY=sk_live_<your-stripe-secret>
STRIPE_PUBLISHABLE_KEY=pk_live_<your-stripe-publishable>
STRIPE_WEBHOOK_SECRET=whsec_<your-webhook-secret>
```

## Security Checklist

### 🔒 Before Deployment

- [ ] Generate secure random secrets for JWT_SECRET, JWT_REFRESH_SECRET, SESSION_SECRET
- [ ] Use production Stripe keys (sk_live_, pk_live_)
- [ ] Configure CORS for your frontend domain only
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for MongoDB
- [ ] Set up Redis with authentication if accessible externally

### 🛠️ Deployment Steps

1. **Prepare Environment**
   ```bash
   # Create production environment file
   cp .env.example .env.production
   # Edit with production values
   nano .env.production
   ```

2. **Build Application**
   ```bash
   npm ci --production
   npm run build
   ```

3. **Start Production Server**
   ```bash
   NODE_ENV=production npm run start:prod
   ```

### 🐳 Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 8000
CMD ["node", "dist/main"]
```

### ☸️ Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: freelancehub-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: freelancehub-backend
  template:
    metadata:
      labels:
        app: freelancehub-backend
    spec:
      containers:
      - name: app
        image: your-registry/freelancehub-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: NODE_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /api/health/live
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health/ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Monitoring & Health Checks

### Health Endpoints
- **Liveness**: `GET /api/health/live` - Basic application alive check
- **Readiness**: `GET /api/health/ready` - Application ready to serve traffic
- **Health**: `GET /api/health` - Detailed health status

### Performance Monitoring
- Monitor MongoDB connection pool
- Track Redis performance
- Monitor S3 upload/download metrics
- Set up alerts for 5xx errors
- Monitor memory and CPU usage

## Security Headers

The application includes the following security features:
- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- JWT token expiration
- Bcrypt password hashing (12 rounds)

## Backup Strategy

### Database Backup
```bash
# Daily MongoDB backup
mongodump --uri="$MONGODB_URI" --out="/backups/$(date +%Y%m%d)"
```

### File Storage Backup
- Configure S3 bucket versioning
- Set up S3 Cross-Region Replication
- Implement lifecycle policies for old files

## Performance Optimization

### Production Settings
- Enable compression middleware
- Use connection pooling for MongoDB
- Configure Redis for session storage
- Set up CDN for static assets
- Enable HTTP/2
- Configure database indexes

### Scaling Considerations
- Use load balancer for multiple instances
- Implement database sharding if needed
- Consider Redis clustering for session storage
- Set up auto-scaling based on CPU/memory usage

## Troubleshooting

### Common Issues
1. **Database Connection Failures**
   - Check MongoDB URI and network connectivity
   - Verify authentication credentials
   - Check connection pool settings

2. **File Upload Issues**
   - Verify AWS credentials and S3 bucket permissions
   - Check file size limits
   - Verify CORS settings on S3 bucket

3. **Email Not Sending**
   - Verify SMTP credentials
   - Check email provider settings
   - Verify firewall allows SMTP traffic

### Logs
Application logs are available at:
- Console output (development)
- File logs (production) - configure winston
- Structured logging with correlation IDs

## Security Updates

- Regularly update dependencies: `npm audit && npm update`
- Monitor CVE databases for known vulnerabilities
- Keep Node.js and system packages updated
- Review and rotate secrets regularly