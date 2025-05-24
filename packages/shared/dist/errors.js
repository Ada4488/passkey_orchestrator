/**
 * Custom error types for Passkey Orchestrator operations
 * These provide more specific error information than generic WebAuthn errors
 */
export class PasskeyOrchestratorError extends Error {
    originalError;
    constructor(message, originalError) {
        super(message);
        this.originalError = originalError;
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
    reason;
    code = 'REGISTRATION_FAILED';
    category = 'registration';
    constructor(message, reason, originalError) {
        super(message, originalError);
        this.reason = reason;
    }
}
/**
 * Errors related to Passkey authentication
 */
export class PasskeyAuthFailedError extends PasskeyOrchestratorError {
    reason;
    code = 'AUTHENTICATION_FAILED';
    category = 'authentication';
    constructor(message, reason, originalError) {
        super(message, originalError);
        this.reason = reason;
    }
}
/**
 * Errors related to environment detection and compatibility
 */
export class PasskeyEnvironmentError extends PasskeyOrchestratorError {
    reason;
    code = 'ENVIRONMENT_ERROR';
    category = 'environment';
    constructor(message, reason, originalError) {
        super(message, originalError);
        this.reason = reason;
    }
}
/**
 * Errors related to configuration and setup
 */
export class PasskeyConfigurationError extends PasskeyOrchestratorError {
    reason;
    code = 'CONFIGURATION_ERROR';
    category = 'configuration';
    constructor(message, reason, originalError) {
        super(message, originalError);
        this.reason = reason;
    }
}
/**
 * Errors related to server-side operations
 */
export class PasskeyServerError extends PasskeyOrchestratorError {
    reason;
    code = 'SERVER_ERROR';
    category = 'server';
    constructor(message, reason, originalError) {
        super(message, originalError);
        this.reason = reason;
    }
}
/**
 * Utility function to convert WebAuthn DOMException to appropriate PasskeyError
 */
export function convertWebAuthnError(error) {
    if (error instanceof DOMException) {
        switch (error.name) {
            case 'NotSupportedError':
                return new PasskeyEnvironmentError('WebAuthn is not supported in this environment', 'webauthn_not_supported', error);
            case 'SecurityError':
                return new PasskeyEnvironmentError('WebAuthn operation failed due to security restrictions', 'insecure_context', error);
            case 'NotAllowedError':
                return new PasskeyRegistrationFailedError('User denied the registration request or operation timed out', 'user_cancelled', error);
            case 'InvalidStateError':
                return new PasskeyRegistrationFailedError('Authenticator is in an invalid state for this operation', 'invalid_state', error);
            case 'TimeoutError':
                return new PasskeyRegistrationFailedError('The operation timed out', 'timeout', error);
            default:
                return new PasskeyRegistrationFailedError(`WebAuthn operation failed: ${error.message}`, 'unknown', error);
        }
    }
    // If it's not a DOMException, wrap it as an unknown error
    return new PasskeyRegistrationFailedError(`Unexpected error during WebAuthn operation: ${error.message}`, 'unknown', error);
}
/**
 * Check if an error is a PasskeyOrchestratorError
 */
export function isPasskeyError(error) {
    return error instanceof PasskeyOrchestratorError;
}
/**
 * Get a user-friendly error message for display
 */
export function getUserFriendlyErrorMessage(error) {
    switch (error.code) {
        case 'REGISTRATION_FAILED':
            const regError = error;
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
            const authError = error;
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
            const envError = error;
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
