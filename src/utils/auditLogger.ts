import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export enum AuditEventType {
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  SESSION_START = 'SESSION_START',
  SESSION_END = 'SESSION_END',
  SESSION_TIMEOUT = 'SESSION_TIMEOUT',
  PHI_ACCESS = 'PHI_ACCESS',
  FAILED_AUTH = 'FAILED_AUTH',
  DATA_ACCESS = 'DATA_ACCESS',
}

interface AuditLogEntry {
  userId: string;
  eventType: AuditEventType;
  timestamp: any; // Firestore ServerTimestamp
  details?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

const auditCollection = collection(db, 'audit_logs');

export const logAuditEvent = async (
  userId: string,
  eventType: AuditEventType,
  details?: string,
  sessionId?: string
): Promise<void> => {
  try {
    const auditEntry: AuditLogEntry = {
      userId,
      eventType,
      timestamp: serverTimestamp(),
      details,
      sessionId,
      // Note: IP address and user agent collection would require additional implementation
      // for mobile apps, these may not be readily available
    };

    await addDoc(auditCollection, auditEntry);
    console.log(`Audit log created: ${eventType} for user ${userId}`);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // In a production environment, you might want to implement a fallback logging mechanism
    // or alert system when audit logging fails
  }
};

export const logUserLogin = (userId: string): Promise<void> => {
  return logAuditEvent(userId, AuditEventType.USER_LOGIN, 'User successfully logged in');
};

export const logUserLogout = (userId: string): Promise<void> => {
  return logAuditEvent(userId, AuditEventType.USER_LOGOUT, 'User logged out');
};

export const logSessionTimeout = (userId: string, sessionId?: string): Promise<void> => {
  return logAuditEvent(
    userId,
    AuditEventType.SESSION_TIMEOUT,
    'Session timed out due to inactivity',
    sessionId
  );
};

export const logSessionStart = (userId: string, sessionId: string): Promise<void> => {
  return logAuditEvent(
    userId,
    AuditEventType.SESSION_START,
    'Therapy session started',
    sessionId
  );
};

export const logSessionEnd = (userId: string, sessionId: string): Promise<void> => {
  return logAuditEvent(
    userId,
    AuditEventType.SESSION_END,
    'Therapy session ended',
    sessionId
  );
};

export const logFailedAuth = (userId: string, reason: string): Promise<void> => {
  return logAuditEvent(
    userId,
    AuditEventType.FAILED_AUTH,
    `Authentication failed: ${reason}`
  );
};

export const logPHIAccess = (userId: string, dataType: string, sessionId?: string): Promise<void> => {
  return logAuditEvent(
    userId,
    AuditEventType.PHI_ACCESS,
    `Accessed PHI data: ${dataType}`,
    sessionId
  );
};

export const logDataAccess = (userId: string, collection: string, operation: string): Promise<void> => {
  return logAuditEvent(
    userId,
    AuditEventType.DATA_ACCESS,
    `${operation} operation on ${collection}`
  );
};