/**
 * Environment detection utilities for cross-platform Passkey support
 * Detects OS, browser, and available authenticator capabilities
 */
import type { Environment } from '@passkey-orchestrator/shared';
/**
 * Detects the current environment and capabilities
 */
export declare function detectEnvironment(): Promise<Environment>;
/**
 * Validates that the current environment supports WebAuthn
 */
export declare function validateEnvironment(environment: Environment): void;
/**
 * Gets a user-friendly description of the environment
 */
export declare function getEnvironmentDescription(environment: Environment): string;
/**
 * Gets browser information
 */
export declare function getBrowserInfo(): Environment['browser'];
/**
 * Gets OS information
 */
export declare function getOSInfo(): Environment['os'];
/**
 * Checks if WebAuthn is supported
 */
export declare function checkWebAuthnSupport(): boolean;
/**
 * Checks if platform authenticator is supported
 */
export declare function checkPlatformAuthenticatorSupport(): Promise<boolean>;
/**
 * Detects the primary passkey provider
 */
export declare function detectPasskeyProvider(): string;
declare global {
    interface Window {
        BitwardenProviderApp?: unknown;
        OnePasswordProviderApp?: unknown;
        DashlaneProviderApp?: unknown;
    }
}
//# sourceMappingURL=environment.d.ts.map