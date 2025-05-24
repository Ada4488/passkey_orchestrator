/**
 * Core PasskeyOrchestrator class for registration and authentication
 * Provides a high-level API for WebAuthn operations with intelligent defaults
 */
import { arrayBufferToBase64URL, base64URLToArrayBuffer, generateChallenge, convertWebAuthnError, PasskeyRegistrationFailedError, PasskeyAuthFailedError, PasskeyConfigurationError, } from '@passkey-orchestrator/shared';
import { detectEnvironment, validateEnvironment } from './environment.js';
import { getRecommendedPasskeyOptions } from './options.js';
export class PasskeyOrchestrator {
    config;
    environment;
    constructor(config) {
        this.validateConfig(config);
        this.config = {
            timeout: 60000,
            preferredAuthenticatorType: 'both',
            requireUserVerification: true,
            requireResidentKey: true,
            ...config,
        };
    }
    /**
     * Initialize the orchestrator by detecting the environment
     */
    async initialize() {
        this.environment = await detectEnvironment();
        validateEnvironment(this.environment);
        return this.environment;
    }
    /**
     * Register a new Passkey for the user
     */
    async register(options) {
        try {
            // Ensure environment is detected
            if (!this.environment) {
                await this.initialize();
            }
            // Generate recommended options based on environment
            const webAuthnOptions = await getRecommendedPasskeyOptions(options.userId, options.username, this.environment, {
                ...this.config,
                ...options.config,
            });
            // Override with any provided excludeCredentials
            if (options.excludeCredentials) {
                webAuthnOptions.excludeCredentials = options.excludeCredentials.map(cred => ({
                    ...cred,
                    id: typeof cred.id === 'string' ? base64URLToArrayBuffer(cred.id) : cred.id,
                }));
            }
            // Call WebAuthn API
            const credential = await navigator.credentials.create({
                publicKey: webAuthnOptions,
            });
            if (!credential) {
                throw new PasskeyRegistrationFailedError('No credential was created', 'unknown');
            }
            // Serialize the response for transport
            const response = credential.response;
            return {
                id: credential.id,
                rawId: arrayBufferToBase64URL(credential.rawId),
                type: 'public-key',
                clientDataJSON: arrayBufferToBase64URL(response.clientDataJSON),
                attestationObject: arrayBufferToBase64URL(response.attestationObject),
                transports: response.getTransports?.(),
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw convertWebAuthnError(error);
            }
            throw new PasskeyRegistrationFailedError('Unexpected error during registration', 'unknown', error);
        }
    }
    /**
     * Authenticate using an existing Passkey
     */
    async authenticate(options = {}) {
        try {
            // Ensure environment is detected
            if (!this.environment) {
                await this.initialize();
            }
            const mergedConfig = {
                ...this.config,
                ...options.config,
            };
            // Create WebAuthn request options
            const webAuthnOptions = {
                challenge: base64URLToArrayBuffer(generateChallenge()),
                timeout: mergedConfig.timeout,
                rpId: mergedConfig.rpId,
                userVerification: mergedConfig.requireUserVerification ? 'required' : 'preferred',
            };
            // Add allowCredentials if provided
            if (options.allowCredentials) {
                webAuthnOptions.allowCredentials = options.allowCredentials.map(cred => ({
                    ...cred,
                    id: typeof cred.id === 'string' ? base64URLToArrayBuffer(cred.id) : cred.id,
                }));
            }
            // Call WebAuthn API
            const credential = await navigator.credentials.get({
                publicKey: webAuthnOptions,
            });
            if (!credential) {
                throw new PasskeyAuthFailedError('No credential was provided', 'no_credentials');
            }
            // Serialize the response for transport
            const response = credential.response;
            return {
                id: credential.id,
                rawId: arrayBufferToBase64URL(credential.rawId),
                type: 'public-key',
                clientDataJSON: arrayBufferToBase64URL(response.clientDataJSON),
                authenticatorData: arrayBufferToBase64URL(response.authenticatorData),
                signature: arrayBufferToBase64URL(response.signature),
                userHandle: response.userHandle ? arrayBufferToBase64URL(response.userHandle) : undefined,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                const passkeyError = convertWebAuthnError(error);
                // Convert registration errors to authentication errors for this context
                if (passkeyError instanceof PasskeyRegistrationFailedError) {
                    throw new PasskeyAuthFailedError(passkeyError.message, passkeyError.reason, passkeyError.originalError);
                }
                throw passkeyError;
            }
            throw new PasskeyAuthFailedError('Unexpected error during authentication', 'unknown', error);
        }
    }
    /**
     * Get the current environment information
     */
    getEnvironment() {
        return this.environment;
    }
    /**
     * Get the current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update the configuration
     */
    updateConfig(newConfig) {
        this.validateConfig({ ...this.config, ...newConfig });
        this.config = { ...this.config, ...newConfig };
    }
    /**
     * Check if Passkeys are supported in the current environment
     */
    static async isSupported() {
        try {
            const environment = await detectEnvironment();
            return environment.isWebAuthnSupported;
        }
        catch {
            return false;
        }
    }
    /**
     * Create a new PasskeyOrchestrator instance with automatic initialization
     */
    static async create(config) {
        const orchestrator = new PasskeyOrchestrator(config);
        await orchestrator.initialize();
        return orchestrator;
    }
    validateConfig(config) {
        if (!config.rpId) {
            throw new PasskeyConfigurationError('rpId is required', 'missing_required_field');
        }
        if (!config.rpName) {
            throw new PasskeyConfigurationError('rpName is required', 'missing_required_field');
        }
        if (!config.expectedOrigin) {
            throw new PasskeyConfigurationError('expectedOrigin is required', 'missing_required_field');
        }
        // Validate rpId format
        if (typeof config.rpId !== 'string' || config.rpId.length === 0) {
            throw new PasskeyConfigurationError('rpId must be a non-empty string', 'invalid_rp_id');
        }
        // Validate expectedOrigin format
        if (typeof config.expectedOrigin !== 'string') {
            throw new PasskeyConfigurationError('expectedOrigin must be a string', 'invalid_origin');
        }
        try {
            new URL(config.expectedOrigin);
        }
        catch {
            throw new PasskeyConfigurationError('expectedOrigin must be a valid URL', 'invalid_origin');
        }
        // Validate timeout
        if (config.timeout !== undefined) {
            if (typeof config.timeout !== 'number' || config.timeout <= 0) {
                throw new PasskeyConfigurationError('timeout must be a positive number', 'invalid_timeout');
            }
        }
    }
}
