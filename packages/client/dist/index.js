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
// Core orchestrator
export { PasskeyOrchestrator } from './orchestrator.js';
// Environment detection utilities
export { detectEnvironment, validateEnvironment, getBrowserInfo, getOSInfo, checkWebAuthnSupport, checkPlatformAuthenticatorSupport, detectPasskeyProvider } from './environment.js';
// Options generation utilities
export { getRecommendedPasskeyOptions, getEnvironmentSpecificOptions, generateRegistrationOptions, generateAuthenticationOptions } from './options.js';
// UI helpers for enhanced UX
export { renderPasskeyPrompt, hidePasskeyPrompt, showPasskeyError, hidePasskeyError } from './ui-helpers.js';
export { PasskeyOrchestratorError, PasskeyRegistrationFailedError, PasskeyAuthFailedError, PasskeyConfigurationError, PasskeyEnvironmentError, convertWebAuthnError, arrayBufferToBase64URL, base64URLToArrayBuffer, coerceToArrayBuffer, generateChallenge } from '@passkey-orchestrator/shared';
