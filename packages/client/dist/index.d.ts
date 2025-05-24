/**
 * @passkey-orchestrator/client - Client-side library for Passkey management
 *
 * A comprehensive client-side library that provides:
 * - High-level PasskeyOrchestrator API for registration and authentication
 * - Intelligent environment detection and option generation
 * - Ready-to-use UI helpers for enhanced user experience
 * - Cross-platform compatibility with smart defaults
 *
 * @example
 * ```typescript
 * import { PasskeyOrchestrator } from '@passkey-orchestrator/client';
 *
 * const orchestrator = new PasskeyOrchestrator({
 *   rpId: 'example.com',
 *   rpName: 'Example Corp',
 *   expectedOrigin: 'https://example.com'
 * });
 *
 * // Register a new passkey
 * const credential = await orchestrator.register({
 *   userId: 'user123',
 *   username: 'john.doe@example.com'
 * });
 *
 * // Authenticate with existing passkey
 * const assertion = await orchestrator.authenticate();
 * ```
 */
export { PasskeyOrchestrator } from './orchestrator.js';
export { detectEnvironment, validateEnvironment, getBrowserInfo, getOSInfo, checkWebAuthnSupport, checkPlatformAuthenticatorSupport, detectPasskeyProvider } from './environment.js';
export { getRecommendedPasskeyOptions, getEnvironmentSpecificOptions, generateRegistrationOptions, generateAuthenticationOptions } from './options.js';
export { renderPasskeyPrompt, hidePasskeyPrompt, showPasskeyError, hidePasskeyError } from './ui-helpers.js';
export type { RegistrationOptions, AuthenticationOptions, SerializedAttestationResponse, SerializedAssertionResponse, PasskeyOrchestratorConfig, Environment, PasskeyProvider, AttestationConveyancePreference, AuthenticatorAttachment, AuthenticatorTransport, UserVerificationRequirement, ResidentKeyRequirement, PublicKeyCredentialDescriptor } from '@passkey-orchestrator/shared';
export { PasskeyOrchestratorError, PasskeyRegistrationFailedError, PasskeyAuthFailedError, PasskeyConfigurationError, PasskeyEnvironmentError, convertWebAuthnError, arrayBufferToBase64URL, base64URLToArrayBuffer, coerceToArrayBuffer, generateChallenge } from '@passkey-orchestrator/shared';
export type { PasskeyPromptConfig, PasskeyErrorConfig } from './ui-helpers.js';
//# sourceMappingURL=index.d.ts.map