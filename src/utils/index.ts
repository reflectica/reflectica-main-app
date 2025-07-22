/**
 * Utility exports for HIPAA compliance features
 */

// Audit logging utilities
export {
  logAuditEvent,
  logUserLogin,
  logUserLogout,
  logSessionTimeout,
  logSessionStart,
  logSessionEnd,
  logFailedAuth,
  logPHIAccess,
  logDataAccess,
  AuditEventType,
} from './auditLogger';

// Access control utilities
export {
  validateUserAccess,
  validateUserId,
  sanitizeInput,
  validateSessionId,
  createSecureDataAccess,
  hasPermissionForPHI,
  rateLimiter,
  AccessControlError,
} from './accessControl';

// API configuration utilities
export {
  API_BASE_URL,
  API_ENDPOINTS,
  SECURITY_HEADERS,
  validateSecureUrl,
  createSecureApiConfig,
  getSecureEndpoint,
} from './apiConfig';