# Security Features Documentation

This document outlines the security enhancements implemented for HIPAA compliance in the Reflectica mental health app.

## Overview

The app now includes comprehensive security features to meet HIPAA requirements:

- **Session Timeout Management**: 15-minute inactivity timeout with warnings
- **Enhanced Authentication**: Account lockout, password complexity, failed attempt monitoring
- **Multi-Factor Authentication**: SMS-based 2FA with backup codes
- **Security Questions**: Identity verification for account recovery
- **Secure Storage**: Encrypted storage using React Native Keychain
- **Session Management**: Automatic background/foreground handling

## Components

### SecurityProvider
Central provider that manages all security state and operations.

```tsx
import {SecurityProvider} from './src/provider/SecurityProvider';

// Wrap your app with SecurityProvider
<SecurityProvider>
  <App />
</SecurityProvider>
```

### SecurityContext
React context for accessing security state and actions.

```tsx
import {useSecurityContext} from './src/context/SecurityContext';

const {state, actions} = useSecurityContext();

// Check MFA status
if (state.isMFAEnabled) {
  // Handle MFA flow
}

// Handle login attempts
await actions.handleLoginAttempt(email, success);
```

## Security Features

### 1. Session Timeout Management

- **Timeout Duration**: 15 minutes of inactivity
- **Warning**: 2 minutes before timeout
- **Auto-cleanup**: Clears sensitive data on timeout
- **Background handling**: Validates session when app becomes active

```tsx
// The session is automatically managed, but you can manually extend it
actions.extendSession();

// Check session status
const timeRemaining = await SessionManager.getTimeUntilExpiry();
```

### 2. Enhanced Authentication Security

- **Account Lockout**: 5 failed attempts = 30-minute lockout
- **Password Complexity**: Minimum 8 characters with uppercase, lowercase, digit, special character
- **Progressive Delays**: Increasing delays for failed attempts
- **Audit Logging**: All security events are logged

```tsx
// Validate password complexity
const validation = actions.validatePassword(password);
if (!validation.isValid) {
  console.log(validation.errors);
}

// Check account lockout
const isLocked = await actions.checkAccountLockout(email);
```

### 3. Multi-Factor Authentication (MFA)

- **SMS-based 2FA**: Verification codes sent via SMS
- **Backup Codes**: 10 single-use backup codes
- **Setup Flow**: Guided setup for new users
- **Recovery Options**: Multiple ways to regain access

```tsx
// Enable MFA
const success = await actions.enableMFA();

// Verify MFA code
const isValid = await actions.verifyMFACode(code);

// Use backup code
const accepted = await actions.useBackupCode(code);
```

### 4. Security Questions

- **Setup**: 3 questions from predefined list
- **Verification**: Identity verification for sensitive operations
- **Secure Storage**: Encrypted storage of questions and answers

```tsx
// Setup security questions
const questions = [
  {id: '1', question: 'What was your first pet?', answer: 'Fluffy'},
  // ... more questions
];
await actions.setupSecurityQuestions(questions);

// Verify answer
const isCorrect = await actions.verifySecurityAnswer(questionId, answer);
```

### 5. Secure Storage

- **Keychain Integration**: Uses React Native Keychain for sensitive data
- **Encryption**: All sensitive data is encrypted at rest
- **Auto-cleanup**: Clears data on logout/timeout

```tsx
// Automatically handled by security helpers
import {secureStorage} from './src/utils/securityHelpers';

await secureStorage.set('key', 'sensitive_data');
const data = await secureStorage.get('key');
```

## Usage Examples

### Basic Security Setup

```tsx
import {SecurityProvider} from './src/provider/SecurityProvider';
import {AuthProvider} from './src/provider/AuthProvider';

function App() {
  return (
    <SecurityProvider>
      <AuthProvider>
        <YourAppContent />
      </AuthProvider>
    </SecurityProvider>
  );
}
```

### Login with Security Features

```tsx
import {useSecurityContext} from './src/context/SecurityContext';
import {useAuth} from './src/context/AuthContext';

function LoginScreen() {
  const {actions} = useSecurityContext();
  const {loginWithEmail} = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      // Check if account is locked
      const isLocked = await actions.checkAccountLockout(email);
      if (isLocked) {
        // Show lockout message
        return;
      }

      // Attempt login
      await loginWithEmail(email, password);
      
      // Login successful - attempts are automatically reset
    } catch (error) {
      // Login failed - attempt is automatically recorded
    }
  };
}
```

### MFA Setup Flow

```tsx
// Navigate to MFA setup
navigation.navigate('MFASetup', {isFirstTime: true});

// The MFASetupScreen handles the complete flow:
// 1. Information about MFA
// 2. Phone number entry
// 3. Verification code
// 4. Backup code display
```

### Security Question Setup

```tsx
// Navigate to security questions
navigation.navigate('SecurityQuestion', {mode: 'setup'});

// For verification
navigation.navigate('SecurityQuestion', {
  mode: 'verify',
  onComplete: () => {
    // Handle successful verification
  }
});
```

## Security Events

All security-related events are automatically logged:

- Login attempts (success/failure)
- Account lockouts
- Session timeouts
- MFA setup/usage
- Password changes
- Biometric setup

## HIPAA Compliance

The implemented security features meet HIPAA requirements:

- ✅ **Access Control**: User authentication with strong passwords
- ✅ **Audit Controls**: Comprehensive security event logging
- ✅ **Integrity**: Data encryption and secure storage
- ✅ **Person or Entity Authentication**: Multi-factor authentication
- ✅ **Transmission Security**: Secure session management
- ✅ **Automatic Logoff**: 15-minute session timeout
- ✅ **Unique User Identification**: Individual user accounts
- ✅ **Emergency Access**: Backup codes for MFA recovery

## Configuration

Security constants can be found in `src/utils/securityHelpers.ts`:

```typescript
export const SECURITY_CONSTANTS = {
  SESSION_TIMEOUT: 15 * 60 * 1000, // 15 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  PASSWORD_MIN_LENGTH: 8,
  SESSION_WARNING_TIME: 2 * 60 * 1000, // 2 minutes
};
```

## Testing

Security features are tested in `__tests__/securityHelpers.test.ts`:

```bash
npm test
```

Tests cover:
- Password validation logic
- Session timeout calculations
- MFA code generation
- HIPAA compliance requirements

## Best Practices

1. **Always use SecurityProvider**: Wrap your app with SecurityProvider
2. **Handle security events**: Listen to security alerts and respond appropriately
3. **Validate user input**: Use provided validation functions
4. **Clear sensitive data**: Use the provided cleanup functions
5. **Monitor security compliance**: Regular checks using `checkSecurityCompliance()`

## Troubleshooting

### Common Issues

1. **Session expires too quickly**
   - Check SECURITY_CONSTANTS.SESSION_TIMEOUT
   - Ensure user activity is being tracked

2. **Account lockout not working**
   - Verify AsyncStorage permissions
   - Check login attempt tracking

3. **MFA codes not working**
   - Ensure SMS service is configured
   - Check backup code storage

4. **Tests failing**
   - Run `npm test` to check security logic
   - Verify Jest configuration for React Native

For additional support, refer to the security helper functions in `src/utils/securityHelpers.ts`.