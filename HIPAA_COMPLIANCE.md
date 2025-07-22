# HIPAA Compliance Implementation

This document describes the HIPAA compliance features implemented in the Reflectica mental health app.

## Implemented Features

### 1. Session Timeout (15 minutes)
- **Location**: `src/hooks/useSessionTimeout.ts`, `src/provider/AuthProvider.tsx`
- **Features**:
  - Automatic logout after 15 minutes of inactivity (HIPAA requirement)
  - 2-minute warning before timeout
  - Handles app backgrounding/foregrounding
  - Clears all session data on timeout
  - Integrates with existing Firebase authentication

### 2. User Access Controls
- **Location**: `src/utils/accessControl.ts`, `src/hooks/useSessionAndSurroundingScores.ts`
- **Features**:
  - Validates users can only access their own PHI data
  - Access validation on all data fetching hooks
  - Prevents unauthorized data access
  - Input validation and sanitization
  - Rate limiting to prevent abuse

### 3. Audit Logging
- **Location**: `src/utils/auditLogger.ts`
- **Features**:
  - Logs all PHI access (user login, data access, session start/end)
  - Logs failed authentication attempts
  - Stores audit logs securely in Firestore
  - Timestamped with server timestamps
  - Includes user ID, event type, and session details

### 4. Secure Data Transmission
- **Location**: `src/utils/apiConfig.ts`, `src/screens/SessionScreen.tsx`
- **Features**:
  - HTTPS enforcement for all API calls
  - Security headers for requests
  - URL validation to prevent HTTP usage
  - Request validation headers
  - Secure endpoint configuration

## File Structure

```
src/
├── utils/
│   ├── auditLogger.ts       # Audit logging utilities
│   ├── accessControl.ts     # Access control and validation
│   ├── apiConfig.ts        # Secure API configuration
│   └── index.ts            # Utility exports
├── hooks/
│   └── useSessionTimeout.ts # Session timeout hook
├── provider/
│   └── AuthProvider.tsx    # Updated with audit logging and session timeout
└── screens/
    └── SessionScreen.tsx   # Updated with secure endpoints and validation
```

## Configuration

### Environment Variables
Add to your `.env` file:
```
API_BASE_URL=https://api.reflectica.com
```

### Firebase Collections
The implementation creates an `audit_logs` collection in Firestore with the following structure:
```javascript
{
  userId: string,
  eventType: 'USER_LOGIN' | 'USER_LOGOUT' | 'SESSION_START' | 'SESSION_END' | 'SESSION_TIMEOUT' | 'PHI_ACCESS' | 'FAILED_AUTH' | 'DATA_ACCESS',
  timestamp: ServerTimestamp,
  details?: string,
  sessionId?: string
}
```

## Usage

### Session Timeout
The session timeout is automatically enabled when users log in. It can be extended through user interaction:

```typescript
const { extendSession } = useAuth();

// Extend session on user activity
const handleUserActivity = () => {
  extendSession();
};
```

### Access Control
Data access is automatically validated in hooks:

```typescript
// This will automatically validate user access
const { mentalHealthScores, loading, error } = useSessionAndSurroundingScores(userId, sessionId);

// Error will be set if user tries to access another user's data
if (error?.message.includes('Access denied')) {
  // Handle unauthorized access
}
```

### Audit Logging
Audit events are automatically logged throughout the app:

```typescript
import { logPHIAccess, logSessionStart } from '../utils/auditLogger';

// Log PHI access
await logPHIAccess(userId, 'mental_health_scores', sessionId);

// Log session events
await logSessionStart(userId, sessionId);
```

### Secure API Calls
API calls automatically use secure HTTPS endpoints:

```typescript
import { getSecureEndpoint, createSecureApiConfig } from '../utils/apiConfig';

const response = await axios.post(
  getSecureEndpoint('CHAT'),
  data,
  createSecureApiConfig()
);
```

## HIPAA Compliance Checklist

- ✅ **15-minute session timeout** - Automatic logout after inactivity
- ✅ **Access controls** - Users can only access their own data
- ✅ **Audit logging** - All PHI access and authentication events logged
- ✅ **Secure transmission** - HTTPS required for all API calls
- ✅ **Input validation** - All user inputs sanitized
- ✅ **Session management** - Proper session handling with app state changes
- ✅ **Error handling** - Secure error messages without PHI exposure

## Security Best Practices

1. **Never log PHI data** - Only log that access occurred, not the actual data
2. **Validate all inputs** - Use the provided sanitization functions
3. **Use secure endpoints** - Always use the provided API configuration
4. **Monitor audit logs** - Regularly review audit logs for suspicious activity
5. **Session extension** - Call `extendSession()` on user interactions

## Testing

Run the manual verification script to test HIPAA compliance features:

```bash
# The test file is located at /tmp/hipaa-compliance-test.ts
# It contains validation tests for all implemented features
```

## Production Deployment

Before deploying to production:

1. Set `API_BASE_URL` to your production HTTPS endpoint
2. Configure proper Firebase security rules for the `audit_logs` collection
3. Set up monitoring for audit log events
4. Test session timeout functionality thoroughly
5. Verify all API calls use HTTPS
6. Review and test access control validations

## Compliance Notes

This implementation provides **minimum viable HIPAA compliance** for a mental health app. Additional considerations for full HIPAA compliance may include:

- Business Associate Agreements (BAAs) with cloud providers
- Additional encryption at rest
- More comprehensive audit logging
- Role-based access controls
- Data backup and recovery procedures
- Incident response procedures

Always consult with HIPAA compliance experts for production healthcare applications.