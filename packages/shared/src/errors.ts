/**
 * Custom error types for Passkey Orchestrator operations
 * These provide more specific error information than generic WebAuthn errors
 */

export abstract class PasskeyOrchestratorError extends Error {
  abstract readonly code: string;
  abstract readonly category: 'registration' | 'authentication' | 'environment' | 'configuration' | 'server';

  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = this.constructor.name;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Errors related to Passkey registration
 */
export class PasskeyRegistrationFailedError extends PasskeyOrchestratorError {
  readonly code = 'REGISTRATION_FAILED';
  readonly category = 'registration' as const;

  constructor(
    message: string,
    public readonly reason: RegistrationFailureReason,
    originalError?: Error
  ) {
    super(message, originalError);
  }
}

export type RegistrationFailureReason =
  | 'user_cancelled'
  | 'not_supported'
  | 'invalid_state'
  | 'not_allowed'
  | 'security_error'
  | 'timeout'
  | 'unknown';

/**
 * Errors related to Passkey authentication
 */
export class PasskeyAuthFailedError extends PasskeyOrchestratorError {
  readonly code = 'AUTHENTICATION_FAILED';
  readonly category = 'authentication' as const;

  constructor(
    message: string,
    public readonly reason: AuthenticationFailureReason,
    originalError?: Error
  ) {
    super(message, originalError);
  }
}

export type AuthenticationFailureReason =
  | 'user_cancelled'
  | 'not_supported'
  | 'invalid_state'
  | 'not_allowed'
  | 'security_error'
  | 'timeout'
  | 'no_credentials'
  | 'unknown';

/**
 * Errors related to environment detection and compatibility
 */
export class PasskeyEnvironmentError extends PasskeyOrchestratorError {
  readonly code = 'ENVIRONMENT_ERROR';
  readonly category = 'environment' as const;

  constructor(
    message: string,
    public readonly reason: EnvironmentErrorReason,
    originalError?: Error
  ) {
    super(message, originalError);
  }
}

export type EnvironmentErrorReason =
  | 'webauthn_not_supported'
  | 'platform_authenticator_not_available'
  | 'insecure_context'
  | 'detection_failed'
  | 'unknown';

/**
 * Errors related to configuration and setup
 */
export class PasskeyConfigurationError extends PasskeyOrchestratorError {
  readonly code = 'CONFIGURATION_ERROR';
  readonly category = 'configuration' as const;

  constructor(
    message: string,
    public readonly reason: ConfigurationErrorReason,
    originalError?: Error
  ) {
    super(message, originalError);
  }
}

export type ConfigurationErrorReason =
  | 'invalid_rp_id'
  | 'invalid_origin'
  | 'missing_required_field'
  | 'invalid_timeout'
  | 'invalid_user_verification'
  | 'unknown';

/**
 * Errors related to server-side operations
 */
export class PasskeyServerError extends PasskeyOrchestratorError {
  readonly code = 'SERVER_ERROR';
  readonly category = 'server' as const;

  constructor(
    message: string,
    public readonly reason: ServerErrorReason,
    originalError?: Error
  ) {
    super(message, originalError);
  }
}

export type ServerErrorReason =
  | 'verification_failed'
  | 'invalid_challenge'
  | 'invalid_origin'
  | 'invalid_signature'
  | 'counter_mismatch'
  | 'parsing_failed'
  | 'unknown';

/**
 * Utility function to convert WebAuthn DOMException to appropriate PasskeyError
 */
export function convertWebAuthnError(error: Error): PasskeyOrchestratorError {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotSupportedError':
        return new PasskeyEnvironmentError(
          'WebAuthn is not supported in this environment',
          'webauthn_not_supported',
          error
        );
      case 'SecurityError':
        return new PasskeyEnvironmentError(
          'WebAuthn operation failed due to security restrictions',
          'insecure_context',
          error
        );
      case 'NotAllowedError':
        return new PasskeyRegistrationFailedError(
          'User denied the registration request or operation timed out',
          'user_cancelled',
          error
        );
      case 'InvalidStateError':
        return new PasskeyRegistrationFailedError(
          'Authenticator is in an invalid state for this operation',
          'invalid_state',
          error
        );
      case 'TimeoutError':
        return new PasskeyRegistrationFailedError(
          'The operation timed out',
          'timeout',
          error
        );
      default:
        return new PasskeyRegistrationFailedError(
          `WebAuthn operation failed: ${error.message}`,
          'unknown',
          error
        );
    }
  }

  // If it's not a DOMException, wrap it as an unknown error
  return new PasskeyRegistrationFailedError(
    `Unexpected error during WebAuthn operation: ${error.message}`,
    'unknown',
    error
  );
}

/**
 * Check if an error is a PasskeyOrchestratorError
 */
export function isPasskeyError(error: unknown): error is PasskeyOrchestratorError {
  return error instanceof PasskeyOrchestratorError;
}

/**
 * Get a user-friendly error message for display
 */
export function getUserFriendlyErrorMessage(error: PasskeyOrchestratorError): string {
  switch (error.code) {
    case 'REGISTRATION_FAILED':
      const regError = error as PasskeyRegistrationFailedError;
      switch (regError.reason) {
        case 'user_cancelled':
          return 'Registration was cancelled. Please try again.';
        case 'not_supported':
          return 'Passkeys are not supported on this device or browser.';
        case 'timeout':
          return 'Registration timed out. Please try again.';
        case 'security_error':
          return 'Registration failed due to security restrictions.';
        default:
          return 'Registration failed. Please try again.';
      }

    case 'AUTHENTICATION_FAILED':
      const authError = error as PasskeyAuthFailedError;
      switch (authError.reason) {
        case 'user_cancelled':
          return 'Authentication was cancelled. Please try again.';
        case 'no_credentials':
          return 'No passkeys found for this account.';
        case 'timeout':
          return 'Authentication timed out. Please try again.';
        default:
          return 'Authentication failed. Please try again.';
      }

    case 'ENVIRONMENT_ERROR':
      const envError = error as PasskeyEnvironmentError;
      switch (envError.reason) {
        case 'webauthn_not_supported':
          return 'Passkeys are not supported on this device or browser.';
        case 'platform_authenticator_not_available':
          return 'No compatible authenticator found on this device.';
        case 'insecure_context':
          return 'Passkeys require a secure connection (HTTPS).';
        default:
          return 'This device or browser does not support passkeys.';
      }

    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
