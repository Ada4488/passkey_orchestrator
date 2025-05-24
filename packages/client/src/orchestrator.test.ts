/**
 * Tests for PasskeyOrchestrator class
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { PasskeyOrchestrator } from '../src/orchestrator.js';
import {
  PasskeyConfigurationError,
  PasskeyRegistrationFailedError,
  PasskeyAuthFailedError,
  base64URLToArrayBuffer // Corrected import name
} from '@passkey-orchestrator/shared';

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'https://example.com',
  pretendToBeVisual: true,
  resources: 'usable'
});

// Mock WebAuthn API
const mockNavigator = {
  credentials: {
    create: vi.fn(),
    get: vi.fn()
  },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

const validConfig = {
  rpId: 'example.com',
  rpName: 'Example Corp',
  expectedOrigin: 'https://example.com'
};

beforeEach(() => {
  // @ts-ignore
  global.window = dom.window;
  // @ts-ignore
  global.document = dom.window.document;
  // @ts-ignore
  global.navigator = mockNavigator;

  // Force isSecureContext to true for the JSDOM window object.
  // JSDOM with an https URL should set this to true, but this ensures it.
  Object.defineProperty(global.window, 'isSecureContext', {
    value: true,
    writable: true,
    configurable: true,
  });

  // Reset mocks
  vi.clearAllMocks();
});

afterEach(() => {
  // @ts-ignore
  delete global.window;
  // @ts-ignore
  delete global.document;
  // @ts-ignore
  delete global.navigator;
});

describe('PasskeyOrchestrator', () => {
  describe('constructor', () => {
    it('should create instance with valid config', () => {
      const orchestrator = new PasskeyOrchestrator(validConfig);
      expect(orchestrator).toBeInstanceOf(PasskeyOrchestrator);
    });

    it('should throw error for missing rpId', () => {
      expect(() => {
        new PasskeyOrchestrator({
          ...validConfig,
          rpId: undefined as any
        });
      }).toThrow(PasskeyConfigurationError);
    });

    it('should throw error for missing rpName', () => {
      expect(() => {
        new PasskeyOrchestrator({
          ...validConfig,
          rpName: undefined as any
        });
      }).toThrow(PasskeyConfigurationError);
    });

    it('should throw error for missing expectedOrigin', () => {
      expect(() => {
        new PasskeyOrchestrator({
          ...validConfig,
          expectedOrigin: undefined as any
        });
      }).toThrow(PasskeyConfigurationError);
    });

    it('should throw error for invalid expectedOrigin', () => {
      expect(() => {
        new PasskeyOrchestrator({
          ...validConfig,
          expectedOrigin: 'not-a-url'
        });
      }).toThrow(PasskeyConfigurationError);
    });

    it('should throw error for invalid timeout', () => {
      expect(() => {
        new PasskeyOrchestrator({
          ...validConfig,
          timeout: -1
        });
      }).toThrow(PasskeyConfigurationError);
    });

    it('should merge default config with provided config', () => {
      const orchestrator = new PasskeyOrchestrator(validConfig);
      const config = orchestrator.getConfig();

      expect(config.timeout).toBe(60000);
      expect(config.preferredAuthenticatorType).toBe('both');
      expect(config.requireUserVerification).toBe(true);
      expect(config.requireResidentKey).toBe(true);
    });

    it('should override defaults with provided values', () => {
      const orchestrator = new PasskeyOrchestrator({
        ...validConfig,
        timeout: 30000,
        requireUserVerification: false
      });
      const config = orchestrator.getConfig();

      expect(config.timeout).toBe(30000);
      expect(config.requireUserVerification).toBe(false);
    });
  });

  describe('initialize', () => {
    it('should detect environment', async () => {
      const orchestrator = new PasskeyOrchestrator(validConfig);
      const environment = await orchestrator.initialize();

      expect(environment).toBeDefined();
      expect(environment.os).toBeDefined();
      expect(environment.browser).toBeDefined();
      expect(typeof environment.isWebAuthnSupported).toBe('boolean');
    });

    it('should cache environment after first detection', async () => {
      const orchestrator = new PasskeyOrchestrator(validConfig);

      const env1 = await orchestrator.initialize();
      const env2 = await orchestrator.initialize();

      expect(env1).toStrictEqual(env2); // Changed toBe to toStrictEqual
    });
  });

  describe('register', () => {
    const sampleUserId = 'user123';
    const sampleUsername = 'test@example.com';
    const sampleRawId = new Uint8Array(Array.from({length: 16}, (_, i) => i)).buffer;
    const sampleClientDataJSON = new Uint8Array(Array.from({length: 32}, (_, i) => i + 16)).buffer;
    const sampleAttestationObject = new Uint8Array(Array.from({length: 64}, (_, i) => i + 48)).buffer;

    it('should register successfully with valid response and verify Base64URL encoding', async () => {
      const mockCredential = {
        id: 'credential-id',
        rawId: sampleRawId,
        type: 'public-key',
        response: {
          clientDataJSON: sampleClientDataJSON,
          attestationObject: sampleAttestationObject,
          getTransports: () => ['internal'] as AuthenticatorTransport[]
        }
      };

      mockNavigator.credentials.create.mockResolvedValue(mockCredential);

      const orchestrator = new PasskeyOrchestrator(validConfig);

      const result = await orchestrator.register({
        userId: sampleUserId,
        username: sampleUsername
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('credential-id');
      expect(result.type).toBe('public-key');
      expect(result.transports).toEqual(['internal']);

      // Verify Base64URL encoding by decoding and comparing ArrayBuffers
      expect(new Uint8Array(base64URLToArrayBuffer(result.rawId))).toEqual(new Uint8Array(sampleRawId));
      expect(new Uint8Array(base64URLToArrayBuffer(result.clientDataJSON))).toEqual(new Uint8Array(sampleClientDataJSON));
      expect(new Uint8Array(base64URLToArrayBuffer(result.attestationObject))).toEqual(new Uint8Array(sampleAttestationObject));
    });

    it('should throw error when no credential is created', async () => {
      mockNavigator.credentials.create.mockResolvedValue(null);

      const orchestrator = new PasskeyOrchestrator(validConfig);

      await expect(orchestrator.register({
        userId: 'user123',
        username: 'test@example.com'
      })).rejects.toThrow(PasskeyRegistrationFailedError);
    });

    it('should handle WebAuthn errors', async () => {
      const error = new Error('NotAllowedError');
      error.name = 'NotAllowedError';
      mockNavigator.credentials.create.mockRejectedValue(error);

      const orchestrator = new PasskeyOrchestrator(validConfig);

      await expect(orchestrator.register({
        userId: 'user123',
        username: 'test@example.com'
      })).rejects.toThrow(PasskeyRegistrationFailedError);
    });

    it('should use excludeCredentials when provided', async () => {
      const mockCredential = {
        id: 'credential-id',
        rawId: new ArrayBuffer(16),
        type: 'public-key',
        response: {
          clientDataJSON: new ArrayBuffer(32),
          attestationObject: new ArrayBuffer(64),
          getTransports: () => ['internal'] as AuthenticatorTransport[]
        }
      };

      mockNavigator.credentials.create.mockResolvedValue(mockCredential);

      const orchestrator = new PasskeyOrchestrator(validConfig);

      await orchestrator.register({
        userId: 'user123',
        username: 'test@example.com',
        excludeCredentials: [
          {
            type: 'public-key',
            id: new ArrayBuffer(16), // Changed to ArrayBuffer
            transports: ['internal']
          }
        ]
      });

      expect(mockNavigator.credentials.create).toHaveBeenCalled();
      const call = mockNavigator.credentials.create.mock.calls[0][0];
      expect(call.publicKey.excludeCredentials).toBeDefined();
      expect(call.publicKey.excludeCredentials).toHaveLength(1);
    });
  });

  describe('authenticate', () => {
    const sampleRawIdAuth = new Uint8Array(Array.from({length: 16}, (_, i) => i + 100)).buffer;
    const sampleClientDataJSONAuth = new Uint8Array(Array.from({length: 32}, (_, i) => i + 116)).buffer;
    const sampleAuthenticatorData = new Uint8Array(Array.from({length: 64}, (_, i) => i + 148)).buffer;
    const sampleSignature = new Uint8Array(Array.from({length: 32}, (_, i) => i + 212)).buffer;
    const sampleUserHandle = new Uint8Array(Array.from({length: 8}, (_, i) => i + 244)).buffer;

    it('should authenticate successfully with valid response and verify Base64URL encoding', async () => {
      const mockCredential = {
        id: 'credential-id-auth',
        rawId: sampleRawIdAuth,
        type: 'public-key',
        response: {
          clientDataJSON: sampleClientDataJSONAuth,
          authenticatorData: sampleAuthenticatorData,
          signature: sampleSignature,
          userHandle: sampleUserHandle
        }
      };

      mockNavigator.credentials.get.mockResolvedValue(mockCredential);

      const orchestrator = new PasskeyOrchestrator(validConfig);

      const result = await orchestrator.authenticate();

      expect(result).toBeDefined();
      expect(result.id).toBe('credential-id-auth');
      expect(result.type).toBe('public-key');

      // Verify Base64URL encoding
      expect(new Uint8Array(base64URLToArrayBuffer(result.rawId))).toEqual(new Uint8Array(sampleRawIdAuth));
      expect(new Uint8Array(base64URLToArrayBuffer(result.clientDataJSON))).toEqual(new Uint8Array(sampleClientDataJSONAuth));
      expect(new Uint8Array(base64URLToArrayBuffer(result.authenticatorData))).toEqual(new Uint8Array(sampleAuthenticatorData));
      expect(new Uint8Array(base64URLToArrayBuffer(result.signature))).toEqual(new Uint8Array(sampleSignature));
      expect(new Uint8Array(base64URLToArrayBuffer(result.userHandle!))).toEqual(new Uint8Array(sampleUserHandle));
    });

    it('should handle null userHandle and verify Base64URL for other fields', async () => {
      const mockCredential = {
        id: 'credential-id-null-handle',
        rawId: sampleRawIdAuth,
        type: 'public-key',
        response: {
          clientDataJSON: sampleClientDataJSONAuth,
          authenticatorData: sampleAuthenticatorData,
          signature: sampleSignature,
          userHandle: null
        }
      };

      mockNavigator.credentials.get.mockResolvedValue(mockCredential);

      const orchestrator = new PasskeyOrchestrator(validConfig);

      const result = await orchestrator.authenticate();

      expect(result.userHandle).toBeUndefined();
      // Verify other fields
      expect(new Uint8Array(base64URLToArrayBuffer(result.rawId))).toEqual(new Uint8Array(sampleRawIdAuth));
      expect(new Uint8Array(base64URLToArrayBuffer(result.clientDataJSON))).toEqual(new Uint8Array(sampleClientDataJSONAuth));
      expect(new Uint8Array(base64URLToArrayBuffer(result.authenticatorData))).toEqual(new Uint8Array(sampleAuthenticatorData));
      expect(new Uint8Array(base64URLToArrayBuffer(result.signature))).toEqual(new Uint8Array(sampleSignature));
    });

    it('should throw error when no credential is provided', async () => {
      mockNavigator.credentials.get.mockResolvedValue(null);

      const orchestrator = new PasskeyOrchestrator(validConfig);

      await expect(orchestrator.authenticate()).rejects.toThrow(PasskeyAuthFailedError);
    });

    it('should handle WebAuthn errors', async () => {
      const error = new Error('NotAllowedError');
      error.name = 'NotAllowedError';
      mockNavigator.credentials.get.mockRejectedValue(error);

      const orchestrator = new PasskeyOrchestrator(validConfig);

      await expect(orchestrator.authenticate()).rejects.toThrow(PasskeyAuthFailedError);
    });

    it('should use allowCredentials when provided', async () => {
      const mockCredential = {
        id: 'credential-id',
        rawId: new ArrayBuffer(16),
        type: 'public-key',
        response: {
          clientDataJSON: new ArrayBuffer(32),
          authenticatorData: new ArrayBuffer(64),
          signature: new ArrayBuffer(32),
          userHandle: null
        }
      };

      mockNavigator.credentials.get.mockResolvedValue(mockCredential);

      const orchestrator = new PasskeyOrchestrator(validConfig);

      await orchestrator.authenticate({
        allowCredentials: [
          {
            type: 'public-key',
            id: new ArrayBuffer(16), // Changed to ArrayBuffer
            transports: ['internal']
          }
        ]
      });

      expect(mockNavigator.credentials.get).toHaveBeenCalled();
      const call = mockNavigator.credentials.get.mock.calls[0][0];
      expect(call.publicKey.allowCredentials).toBeDefined();
      expect(call.publicKey.allowCredentials).toHaveLength(1);
    });
  });

  describe('getEnvironment', () => {
    it('should return undefined before initialization', () => {
      const orchestrator = new PasskeyOrchestrator(validConfig);
      expect(orchestrator.getEnvironment()).toBeUndefined();
    });

    it('should return environment after initialization', async () => {
      const orchestrator = new PasskeyOrchestrator(validConfig);
      await orchestrator.initialize();

      const environment = orchestrator.getEnvironment();
      expect(environment).toBeDefined();
    });
  });

  describe('getConfig', () => {
    it('should return current configuration', () => {
      const orchestrator = new PasskeyOrchestrator(validConfig);
      const config = orchestrator.getConfig();

      expect(config.rpId).toBe('example.com');
      expect(config.rpName).toBe('Example Corp');
      expect(config.expectedOrigin).toBe('https://example.com');
    });

    it('should return a copy of the configuration', () => {
      const orchestrator = new PasskeyOrchestrator(validConfig);
      const config1 = orchestrator.getConfig();
      const config2 = orchestrator.getConfig();

      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      const orchestrator = new PasskeyOrchestrator(validConfig);

      orchestrator.updateConfig({ timeout: 30000 });

      const config = orchestrator.getConfig();
      expect(config.timeout).toBe(30000);
    });

    it('should validate new configuration', () => {
      const orchestrator = new PasskeyOrchestrator(validConfig);

      expect(() => {
        orchestrator.updateConfig({ rpId: '' });
      }).toThrow(PasskeyConfigurationError);
    });
  });

  describe('isSupported', () => {
    it('should check WebAuthn support', async () => {
      const supported = await PasskeyOrchestrator.isSupported();
      expect(typeof supported).toBe('boolean');
    });
  });

  describe('create', () => {
    it('should create and initialize orchestrator', async () => {
      const orchestrator = await PasskeyOrchestrator.create(validConfig);

      expect(orchestrator).toBeInstanceOf(PasskeyOrchestrator);
      expect(orchestrator.getEnvironment()).toBeDefined();
    });
  });
});
