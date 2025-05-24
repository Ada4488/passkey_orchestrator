/**
 * Custom error types for Passkey Orchestrator operations
 * These provide more specific error information than generic WebAuthn errors
 */
export declare abstract class PasskeyOrchestratorError extends Error {
    readonly originalError?: Error | undefined;
    abstract readonly code: string;
    abstract readonly category: 'registration' | 'authentication' | 'environment' | 'configuration' | 'server';
    constructor(message: string, originalError?: Error | undefined);
}
/**
 * Errors related to Passkey registration
 */
export declare class PasskeyRegistrationFailedError extends PasskeyOrchestratorError {
    readonly reason: RegistrationFailureReason;
    readonly code = "REGISTRATION_FAILED";
    readonly category: "registration";
    constructor(message: string, reason: RegistrationFailureReason, originalError?: Error);
}
export type RegistrationFailureReason = 'user_cancelled' | 'not_supported' | 'invalid_state' | 'not_allowed' | 'security_error' | 'timeout' | 'unknown';
/**
 * Errors related to Passkey authentication
 */
export declare class PasskeyAuthFailedError extends PasskeyOrchestratorError {
    readonly reason: AuthenticationFailureReason;
    readonly code = "AUTHENTICATION_FAILED";
    readonly category: "authentication";
    constructor(message: string, reason: AuthenticationFailureReason, originalError?: Error);
}
export type AuthenticationFailureReason = 'user_cancelled' | 'not_supported' | 'invalid_state' | 'not_allowed' | 'security_error' | 'timeout' | 'no_credentials' | 'unknown';
/**
 * Errors related to environment detection and compatibility
 */
export declare class PasskeyEnvironmentError extends PasskeyOrchestratorError {
    readonly reason: EnvironmentErrorReason;
    readonly code = "ENVIRONMENT_ERROR";
    readonly category: "environment";
    constructor(message: string, reason: EnvironmentErrorReason, originalError?: Error);
}
export type EnvironmentErrorReason = 'webauthn_not_supported' | 'platform_authenticator_not_available' | 'insecure_context' | 'detection_failed' | 'unknown';
/**
 * Errors related to configuration and setup
 */
export declare class PasskeyConfigurationError extends PasskeyOrchestratorError {
    readonly reason: ConfigurationErrorReason;
    readonly code = "CONFIGURATION_ERROR";
    readonly category: "configuration";
    constructor(message: string, reason: ConfigurationErrorReason, originalError?: Error);
}
export type ConfigurationErrorReason = 'invalid_rp_id' | 'invalid_origin' | 'missing_required_field' | 'invalid_timeout' | 'invalid_user_verification' | 'unknown';
/**
 * Errors related to server-side operations
 */
export declare class PasskeyServerError extends PasskeyOrchestratorError {
    readonly reason: ServerErrorReason;
    readonly code = "SERVER_ERROR";
    readonly category: "server";
    constructor(message: string, reason: ServerErrorReason, originalError?: Error);
}
export type ServerErrorReason = 'verification_failed' | 'invalid_challenge' | 'invalid_origin' | 'invalid_signature' | 'counter_mismatch' | 'parsing_failed' | 'unknown';
/**
 * Utility function to convert WebAuthn DOMException to appropriate PasskeyError
 */
export declare function convertWebAuthnError(error: Error): PasskeyOrchestratorError;
/**
 * Check if an error is a PasskeyOrchestratorError
 */
export declare function isPasskeyError(error: unknown): error is PasskeyOrchestratorError;
/**
 * Get a user-friendly error message for display
 */
export declare function getUserFriendlyErrorMessage(error: PasskeyOrchestratorError): string;
//# sourceMappingURL=errors.d.ts.map