/**
 * Generates recommended WebAuthn options based on environment and configuration
 */
import type { Environment, PasskeyOrchestratorConfig } from '@passkey-orchestrator/shared';
/**
 * Generates recommended PublicKeyCredentialCreationOptions based on environment
 */
export declare function getRecommendedPasskeyOptions(userId: string, username: string, environment: Environment, config: PasskeyOrchestratorConfig): Promise<PublicKeyCredentialCreationOptions>;
/**
 * Generates user-friendly suggestions for Passkey creation
 */
export declare function getPasskeySuggestions(environment: Environment): string[];
/**
 * Generates user-friendly explanations for authentication
 */
export declare function getAuthenticationInstructions(environment: Environment): string[];
/**
 * Gets environment-specific WebAuthn options
 */
export declare function getEnvironmentSpecificOptions(environment: Environment): {
    prefersPlatformAuthenticator: boolean;
    recommendedTimeout: number;
    supportedAlgorithms: PublicKeyCredentialParameters[];
    browserSpecificHints: {
        supportsConditionalUI: boolean;
        recommendedTimeout: number;
        preferredAttachment: "platform";
    } | {
        supportsConditionalUI: boolean;
        recommendedTimeout: number;
        preferredAttachment: "both";
    };
};
/**
 * Generates registration options for WebAuthn
 */
export declare function generateRegistrationOptions(userId: string, username: string, displayName?: string): Promise<PublicKeyCredentialCreationOptions>;
/**
 * Generates authentication options for WebAuthn
 */
export declare function generateAuthenticationOptions(allowCredentials?: PublicKeyCredentialDescriptor[]): Promise<PublicKeyCredentialRequestOptions>;
//# sourceMappingURL=options.d.ts.map