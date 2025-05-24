/**
 * Tests for UI helpers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderPasskeyPrompt, hidePasskeyPrompt, showPasskeyError, hidePasskeyError } from '../src/ui-helpers.js';
import { PasskeyRegistrationFailedError, PasskeyAuthFailedError, PasskeyEnvironmentError } from '@passkey-orchestrator/shared';
import type { Environment } from '@passkey-orchestrator/shared';

// Setup DOM environment - happy-dom provides document and window globals automatically

const mockEnvironment: Environment = {
  os: 'macOS',
  browser: 'Chrome',
  isWebAuthnSupported: true,
  isPlatformAuthenticatorSupported: true,
  detectedProviders: [{
    type: 'platform',
    name: 'iCloud Keychain',
    confidence: 0.9
  }]
};

beforeEach(() => {
  // Clear DOM for each test - happy-dom provides global document and window
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});

afterEach(() => {
  // Clean up any remaining elements
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});

describe('UI Helpers', () => {
  describe('renderPasskeyPrompt', () => {
    it('should create and render a registration prompt', () => {
      const prompt = renderPasskeyPrompt('register', mockEnvironment);

      expect(prompt).toBeInstanceOf(HTMLElement);
      expect(prompt.className).toBe('passkey-prompt-overlay');
      expect(document.body.contains(prompt)).toBe(true);

      const title = prompt.querySelector('.passkey-prompt-title');
      expect(title?.textContent).toBe('Create Passkey');

      const message = prompt.querySelector('.passkey-prompt-message');
      expect(message?.textContent).toContain('Touch ID, Face ID, or your device passcode');
    });

    it('should create and render an authentication prompt', () => {
      const prompt = renderPasskeyPrompt('authenticate', mockEnvironment);

      const title = prompt.querySelector('.passkey-prompt-title');
      expect(title?.textContent).toBe('Sign In with Passkey');

      const message = prompt.querySelector('.passkey-prompt-message');
      expect(message?.textContent).toContain('Touch ID, Face ID, or your device passcode');
    });

    it('should show cancel button when configured', () => {
      const onCancel = vi.fn();
      const prompt = renderPasskeyPrompt('register', mockEnvironment, {
        showCancel: true,
        onCancel
      });

      const cancelButton = prompt.querySelector('.passkey-prompt-cancel');
      expect(cancelButton).toBeInstanceOf(HTMLButtonElement);

      cancelButton?.dispatchEvent(new Event('click'));
      expect(onCancel).toHaveBeenCalled();
    });

    it('should not show cancel button by default', () => {
      const prompt = renderPasskeyPrompt('register', mockEnvironment);

      const cancelButton = prompt.querySelector('.passkey-prompt-cancel');
      expect(cancelButton).toBeNull();
    });

    it('should apply theme attribute', () => {
      const prompt = renderPasskeyPrompt('register', mockEnvironment, { theme: 'dark' });
      expect(prompt.getAttribute('data-theme')).toBe('dark');
    });

    it('should apply position attribute', () => {
      const prompt = renderPasskeyPrompt('register', mockEnvironment, { position: 'top' });
      expect(prompt.getAttribute('data-position')).toBe('top');
    });

    it('should add CSS styles to document head', () => {
      renderPasskeyPrompt('register', mockEnvironment);

      const styles = document.querySelector('#passkey-prompt-styles');
      expect(styles).toBeInstanceOf(HTMLStyleElement);
    });

    it('should not duplicate CSS styles', () => {
      renderPasskeyPrompt('register', mockEnvironment);
      renderPasskeyPrompt('authenticate', mockEnvironment);

      const styles = document.querySelectorAll('#passkey-prompt-styles');
      expect(styles).toHaveLength(1);
    });

    it('should customize prompt for Android environment', () => {
      const androidEnv: Environment = {
        ...mockEnvironment,
        os: 'Android'
      };

      const prompt = renderPasskeyPrompt('register', androidEnv);
      const message = prompt.querySelector('.passkey-prompt-message');
      expect(message?.textContent).toContain('fingerprint, face unlock, or screen lock');
    });

    it('should customize prompt for Windows environment', () => {
      const windowsEnv: Environment = {
        ...mockEnvironment,
        os: 'Windows'
      };

      const prompt = renderPasskeyPrompt('register', windowsEnv);
      const message = prompt.querySelector('.passkey-prompt-message');
      expect(message?.textContent).toContain('Windows Hello or your security key');
    });
  });

  describe('hidePasskeyPrompt', () => {
    it('should hide prompt with animation', () => {
      const prompt = renderPasskeyPrompt('register', mockEnvironment);

      hidePasskeyPrompt(prompt);

      expect(prompt.classList.contains('passkey-prompt-hiding')).toBe(true);
    });

    it('should remove prompt from DOM after animation', async () => {
      const prompt = renderPasskeyPrompt('register', mockEnvironment);

      hidePasskeyPrompt(prompt);

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 350));
      expect(document.body.contains(prompt)).toBe(false);
    });
  });

  describe('showPasskeyError', () => {
    it('should display registration error', () => {
      const error = new PasskeyRegistrationFailedError(
        'User cancelled registration',
        'user_cancelled'
      );

      const errorElement = showPasskeyError(error);

      expect(errorElement).toBeInstanceOf(HTMLElement);
      expect(errorElement.className).toBe('passkey-error-container');
      expect(document.body.contains(errorElement)).toBe(true);

      const title = errorElement.querySelector('.passkey-error-title');
      expect(title?.textContent).toBe('Passkey Creation Cancelled');

      const message = errorElement.querySelector('.passkey-error-message');
      expect(message?.textContent).toBe('You cancelled the passkey creation process.');
    });

    it('should display authentication error', () => {
      const error = new PasskeyAuthFailedError(
        'No credentials found',
        'no_credentials'
      );

      const errorElement = showPasskeyError(error);

      const title = errorElement.querySelector('.passkey-error-title');
      expect(title?.textContent).toBe('No Passkey Found');
    });

    it('should display unsupported error', () => {
      const error = new PasskeyEnvironmentError(
        'WebAuthn not supported',
        'webauthn_not_supported'
      );

      const errorElement = showPasskeyError(error);

      const title = errorElement.querySelector('.passkey-error-title');
      expect(title?.textContent).toBe('Passkeys Not Supported');
    });

    it('should show retry button when configured', () => {
      const onRetry = vi.fn();
      const error = new PasskeyRegistrationFailedError(
        'Registration failed',
        'unknown'
      );

      const errorElement = showPasskeyError(error, {
        showRetry: true,
        onRetry
      });

      const retryButton = errorElement.querySelector('.passkey-error-retry');
      expect(retryButton).toBeInstanceOf(HTMLButtonElement);

      retryButton?.dispatchEvent(new Event('click'));
      expect(onRetry).toHaveBeenCalled();
    });

    it('should handle close button click', () => {
      const onDismiss = vi.fn();
      const error = new PasskeyRegistrationFailedError(
        'Registration failed',
        'unknown'
      );

      const errorElement = showPasskeyError(error, { onDismiss });

      const closeButton = errorElement.querySelector('.passkey-error-close');
      expect(closeButton).toBeInstanceOf(HTMLButtonElement);

      closeButton?.dispatchEvent(new Event('click'));
      expect(onDismiss).toHaveBeenCalled();
    });

    it('should auto-hide when configured', async () => {
      const error = new PasskeyRegistrationFailedError(
        'Registration failed',
        'unknown'
      );

      const errorElement = showPasskeyError(error, {
        autoHide: true,
        autoHideDelay: 100
      });

      // Wait for auto-hide to trigger
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(errorElement.classList.contains('passkey-error-hiding')).toBe(true);
    });

    it('should apply theme and position', () => {
      const error = new PasskeyRegistrationFailedError(
        'Registration failed',
        'unknown'
      );

      const errorElement = showPasskeyError(error, {
        theme: 'dark',
        position: 'bottom'
      });

      expect(errorElement.getAttribute('data-theme')).toBe('dark');
      expect(errorElement.getAttribute('data-position')).toBe('bottom');
    });

    it('should add CSS styles to document head', () => {
      const error = new PasskeyRegistrationFailedError(
        'Registration failed',
        'unknown'
      );

      showPasskeyError(error);

      const styles = document.querySelector('#passkey-error-styles');
      expect(styles).toBeInstanceOf(HTMLStyleElement);
    });

    it('should show suggestions for errors', () => {
      const error = new PasskeyRegistrationFailedError(
        'Authenticator not available',
        'not_supported'
      );

      const errorElement = showPasskeyError(error);

      const suggestions = errorElement.querySelector('.passkey-error-suggestions');
      expect(suggestions).toBeInstanceOf(HTMLElement);

      const listItems = errorElement.querySelectorAll('.passkey-error-suggestions li');
      expect(listItems.length).toBeGreaterThan(0);
    });
  });

  describe('hidePasskeyError', () => {
    it('should hide error with animation', () => {
      const error = new PasskeyRegistrationFailedError(
        'Registration failed',
        'unknown'
      );

      const errorElement = showPasskeyError(error);

      hidePasskeyError(errorElement);

      expect(errorElement.classList.contains('passkey-error-hiding')).toBe(true);
    });

    it('should remove error from DOM after animation', async () => {
      const error = new PasskeyRegistrationFailedError(
        'Registration failed',
        'unknown'
      );

      const errorElement = showPasskeyError(error);

      hidePasskeyError(errorElement);

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 350));
      expect(document.body.contains(errorElement)).toBe(false);
    });
  });
});
