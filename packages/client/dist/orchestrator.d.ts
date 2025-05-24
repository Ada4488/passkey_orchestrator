/**
 * Core PasskeyOrchestrator class for registration and authentication
 * Provides a high-level API for WebAuthn operations with intelligent defaults
 */
import type { RegistrationOptions, AuthenticationOptions, SerializedAttestationResponse, SerializedAssertionResponse, PasskeyOrchestratorConfig, Environment } from '@passkey-orchestrator/shared';
export declare class PasskeyOrchestrator {
    private config;
    private environment?;
    constructor(config: PasskeyOrchestratorConfig);
    /**
     * Initialize the orchestrator by detecting the environment
     */
    initialize(): Promise<Environment>;
    /**
     * Register a new Passkey for the user
     */
    register(options: RegistrationOptions): Promise<SerializedAttestationResponse>;
    /**
     * Authenticate using an existing Passkey
     */
    authenticate(options?: AuthenticationOptions): Promise<SerializedAssertionResponse>;
    /**
     * Get the current environment information
     */
    getEnvironment(): Environment | undefined;
    /**
     * Get the current configuration
     */
    getConfig(): PasskeyOrchestratorConfig;
    /**
     * Update the configuration
     */
    updateConfig(newConfig: Partial<PasskeyOrchestratorConfig>): void;
    /**
     * Check if Passkeys are supported in the current environment
     */
    static isSupported(): Promise<boolean>;
    /**
     * Create a new PasskeyOrchestrator instance with automatic initialization
     */
    static create(config: PasskeyOrchestratorConfig): Promise<PasskeyOrchestrator>;
    private validateConfig;
}
//# sourceMappingURL=orchestrator.d.ts.map