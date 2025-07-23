import { auditLogger } from './auditLogger';

export interface AccessControlResult {
  granted: boolean;
  reason?: string;
}

class AccessControlManager {
  /**
   * Validates if the current user can access PHI data for the specified user
   * @param currentUserId - The ID of the user making the request
   * @param requestedUserId - The ID of the user whose data is being accessed
   * @param resourceType - Type of resource being accessed (e.g., 'session_scores', 'mental_health_data')
   * @returns Promise<AccessControlResult> - Whether access is granted and why
   */
  async validatePhiAccess(
    currentUserId: string | null | undefined,
    requestedUserId: string,
    resourceType: string
  ): Promise<AccessControlResult> {
    // Log the access attempt
    if (currentUserId) {
      await auditLogger.logPhiAccess(currentUserId, resourceType, requestedUserId, {
        accessAttempt: true,
      });
    }

    // Check if user is authenticated
    if (!currentUserId) {
      await auditLogger.logUnauthorizedAccess('anonymous', resourceType, {
        requestedUserId,
        reason: 'User not authenticated',
      });
      return {
        granted: false,
        reason: 'User not authenticated',
      };
    }

    // Check if user is trying to access their own data
    if (currentUserId !== requestedUserId) {
      await auditLogger.logUnauthorizedAccess(currentUserId, resourceType, {
        requestedUserId,
        reason: 'User attempting to access another user\'s PHI data',
      });
      return {
        granted: false,
        reason: 'Users can only access their own Protected Health Information',
      };
    }

    // Access granted - log successful PHI access
    await auditLogger.logPhiAccess(currentUserId, resourceType, requestedUserId, {
      accessGranted: true,
    });

    return {
      granted: true,
    };
  }

  /**
   * Validates if a user ID is valid and properly formatted
   * @param userId - The user ID to validate
   * @returns boolean - Whether the user ID is valid
   */
  isValidUserId(userId: string | null | undefined): userId is string {
    return typeof userId === 'string' && userId.length > 0;
  }

  /**
   * Sanitizes user input to prevent injection attacks
   * @param input - The input to sanitize
   * @returns string - Sanitized input
   */
  sanitizeInput(input: string): string {
    return input.replace(/[<>\"']/g, '');
  }
}

export const accessControl = new AccessControlManager();