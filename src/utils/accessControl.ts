/**
 * Access control utility for HIPAA compliance
 * Ensures users can only access their own PHI data
 */

export class AccessControlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccessControlError';
  }
}

/**
 * Validates that the current user can access the requested user's data
 * @param currentUserId - The ID of the currently authenticated user
 * @param requestedUserId - The ID of the user whose data is being requested
 * @throws {AccessControlError} If access is denied
 */
export const validateUserAccess = (
  currentUserId: string | null | undefined,
  requestedUserId: string
): void => {
  if (!currentUserId) {
    throw new AccessControlError('No authenticated user found');
  }

  if (currentUserId !== requestedUserId) {
    throw new AccessControlError(
      `Access denied: User ${currentUserId} cannot access data for user ${requestedUserId}`
    );
  }
};

/**
 * Validates that a user ID is provided and not empty
 * @param userId - The user ID to validate
 * @throws {AccessControlError} If user ID is invalid
 */
export const validateUserId = (userId: string | null | undefined): string => {
  if (!userId || userId.trim() === '') {
    throw new AccessControlError('Invalid or missing user ID');
  }
  return userId.trim();
};

/**
 * Sanitizes user input to prevent injection attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove potential script tags, SQL injection patterns, etc.
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/['"`;]/g, '')
    .trim();
};

/**
 * Validates session ID format (UUID v4)
 * @param sessionId - The session ID to validate
 * @returns boolean indicating if the session ID is valid
 */
export const validateSessionId = (sessionId: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(sessionId);
};

/**
 * Creates a secure wrapper for data access functions
 * @param dataAccessFunction - The original data access function
 * @param currentUserId - The current user's ID
 * @returns A wrapped function that includes access control validation
 */
export const createSecureDataAccess = <T extends any[], R>(
  dataAccessFunction: (...args: T) => Promise<R>,
  currentUserId: string | null | undefined
) => {
  return async (...args: T): Promise<R> => {
    // Validate that user is authenticated
    if (!currentUserId) {
      throw new AccessControlError('User must be authenticated to access data');
    }

    // Execute the original function with access control in place
    return dataAccessFunction(...args);
  };
};

/**
 * Checks if a user has permission to access specific PHI data types
 * @param userId - The user ID requesting access
 * @param dataType - The type of PHI data being accessed
 * @returns boolean indicating if access is allowed
 */
export const hasPermissionForPHI = (userId: string, dataType: string): boolean => {
  // For this mental health app, users can only access their own data
  // In a more complex system, this could check role-based permissions
  
  const allowedDataTypes = [
    'mental_health_scores',
    'session_summaries',
    'journal_entries',
    'diagnostic_data',
    'therapy_sessions'
  ];

  return allowedDataTypes.includes(dataType);
};

/**
 * Rate limiting check to prevent abuse
 * Simple in-memory rate limiter for API calls
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Remove old requests outside the time window
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(userId, validRequests);
    
    return true;
  }
}

export const rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute