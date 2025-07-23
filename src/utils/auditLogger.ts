import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export interface AuditLogEntry {
  userId: string;
  action: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export enum AuditActions {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  SESSION_TIMEOUT = 'SESSION_TIMEOUT',
  PHI_ACCESS = 'PHI_ACCESS',
  SESSION_START = 'SESSION_START',
  SESSION_END = 'SESSION_END',
  DATA_ACCESS = 'DATA_ACCESS',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'UNAUTHORIZED_ACCESS_ATTEMPT',
}

class AuditLogger {
  private auditCollection = collection(db, 'audit_logs');

  async logEvent(
    userId: string,
    action: AuditActions,
    details: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        userId,
        action,
        details,
        timestamp: new Date(),
        ipAddress,
        userAgent,
      };

      await addDoc(this.auditCollection, auditEntry);
      console.log(`Audit log created: ${action} for user ${userId}`);
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw error to avoid breaking app functionality
    }
  }

  async logAuthentication(
    userId: string,
    success: boolean,
    details: Record<string, any> = {}
  ): Promise<void> {
    const action = success ? AuditActions.LOGIN_SUCCESS : AuditActions.LOGIN_FAILED;
    await this.logEvent(userId, action, details);
  }

  async logPhiAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.logEvent(userId, AuditActions.PHI_ACCESS, {
      resourceType,
      resourceId,
      ...details,
    });
  }

  async logSessionActivity(
    userId: string,
    activity: 'start' | 'end' | 'timeout',
    sessionId?: string
  ): Promise<void> {
    const actionMap = {
      start: AuditActions.SESSION_START,
      end: AuditActions.SESSION_END,
      timeout: AuditActions.SESSION_TIMEOUT,
    };

    await this.logEvent(userId, actionMap[activity], {
      sessionId,
      activity,
    });
  }

  async logUnauthorizedAccess(
    userId: string,
    attemptedResource: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.logEvent(userId, AuditActions.UNAUTHORIZED_ACCESS_ATTEMPT, {
      attemptedResource,
      ...details,
    });
  }
}

export const auditLogger = new AuditLogger();