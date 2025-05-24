import { describe, it, expect } from 'vitest';
import {
  PasskeyRegistrationFailedError,
  PasskeyAuthFailedError,
  PasskeyEnvironmentError,
  PasskeyConfigurationError,
  PasskeyServerError,
  convertWebAuthnError,
  isPasskeyError,
  getUserFriendlyErrorMessage,
} from '../src/errors.js';

describe('Error handling', () => {
  describe('PasskeyRegistrationFailedError', () => {
    it('should create error with correct properties', () => {
      const error = new PasskeyRegistrationFailedError(
        'Registration failed',
        'user_cancelled'
      );
      expect(error.code).toBe('REGISTRATION_FAILED');
      expect(error.category).toBe('registration');
      expect(error.reason).toBe('user_cancelled');
      expect(error.message).toBe('Registration failed');
    });
  });

  describe('PasskeyAuthFailedError', () => {
    it('should create error with correct properties', () => {
      const error = new PasskeyAuthFailedError(
        'Authentication failed',
        'no_credentials'
      );
      expect(error.code).toBe('AUTHENTICATION_FAILED');
      expect(error.category).toBe('authentication');
      expect(error.reason).toBe('no_credentials');
      expect(error.message).toBe('Authentication failed');
    });
  });

  describe('convertWebAuthnError', () => {
    it('should convert NotSupportedError to PasskeyEnvironmentError', () => {
      const domError = new DOMException('Not supported', 'NotSupportedError');
      const result = convertWebAuthnError(domError);
      expect(result).toBeInstanceOf(PasskeyEnvironmentError);
      expect(result.reason).toBe('webauthn_not_supported');
    });

    it('should convert NotAllowedError to PasskeyRegistrationFailedError', () => {
      const domError = new DOMException('Not allowed', 'NotAllowedError');
      const result = convertWebAuthnError(domError);
      expect(result).toBeInstanceOf(PasskeyRegistrationFailedError);
      expect(result.reason).toBe('user_cancelled');
    });

    it('should convert SecurityError to PasskeyEnvironmentError', () => {
      const domError = new DOMException('Security error', 'SecurityError');
      const result = convertWebAuthnError(domError);
      expect(result).toBeInstanceOf(PasskeyEnvironmentError);
      expect(result.reason).toBe('insecure_context');
    });

    it('should handle unknown DOMException', () => {
      const domError = new DOMException('Unknown error', 'UnknownError');
      const result = convertWebAuthnError(domError);
      expect(result).toBeInstanceOf(PasskeyRegistrationFailedError);
      expect(result.reason).toBe('unknown');
    });

    it('should handle non-DOMException errors', () => {
      const genericError = new Error('Generic error');
      const result = convertWebAuthnError(genericError);
      expect(result).toBeInstanceOf(PasskeyRegistrationFailedError);
      expect(result.reason).toBe('unknown');
    });
  });

  describe('isPasskeyError', () => {
    it('should identify PasskeyOrchestratorError instances', () => {
      const error = new PasskeyRegistrationFailedError('Test', 'user_cancelled');
      expect(isPasskeyError(error)).toBe(true);
    });

    it('should reject non-PasskeyOrchestratorError instances', () => {
      const error = new Error('Generic error');
      expect(isPasskeyError(error)).toBe(false);
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    it('should provide friendly message for registration cancellation', () => {
      const error = new PasskeyRegistrationFailedError('Test', 'user_cancelled');
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toBe('Registration was cancelled. Please try again.');
    });

    it('should provide friendly message for environment errors', () => {
      const error = new PasskeyEnvironmentError('Test', 'webauthn_not_supported');
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toBe('Passkeys are not supported on this device or browser.');
    });

    it('should provide fallback message for unknown errors', () => {
      const error = new PasskeyServerError('Test', 'unknown');
      const message = getUserFriendlyErrorMessage(error);
      expect(message).toBe('An unexpected error occurred. Please try again.');
    });
  });
});
