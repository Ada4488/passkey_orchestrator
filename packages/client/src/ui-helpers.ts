/**
 * UI helpers for enhanced user experience with Passkeys
 * Provides ready-to-use components and utilities for common Passkey scenarios
 */

import type { Environment } from '@passkey-orchestrator/shared';
import {
  PasskeyOrchestratorError,
  PasskeyRegistrationFailedError,
  PasskeyAuthFailedError,
  PasskeyConfigurationError,
  PasskeyEnvironmentError
} from '@passkey-orchestrator/shared';

/**
 * Configuration for rendering Passkey prompts
 */
export interface PasskeyPromptConfig {
  theme?: 'light' | 'dark' | 'auto';
  position?: 'center' | 'top' | 'bottom';
  showCancel?: boolean;
  customStyles?: Partial<CSSStyleDeclaration>;
  onCancel?: () => void;
}

/**
 * Configuration for error display
 */
export interface PasskeyErrorConfig {
  theme?: 'light' | 'dark' | 'auto';
  position?: 'center' | 'top' | 'bottom';
  autoHide?: boolean;
  autoHideDelay?: number;
  showRetry?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Prompt information for different operations
 */
interface PromptInfo {
  title: string;
  message: string;
  icon: string;
  actionText: string;
}

/**
 * Get user-friendly prompt information based on environment and operation
 */
function getPromptInfo(operation: 'register' | 'authenticate', environment: Environment): PromptInfo {
  const isApple = environment.os === 'iOS' || environment.os === 'macOS';
  const isAndroid = environment.os === 'Android';
  const isWindows = environment.os === 'Windows';

  if (operation === 'register') {
    if (isApple) {
      return {
        title: 'Create Passkey',
        message: 'Use Touch ID, Face ID, or your device passcode to create a passkey for this account.',
        icon: '🔐',
        actionText: 'Create Passkey'
      };
    } else if (isAndroid) {
      return {
        title: 'Create Passkey',
        message: 'Use your fingerprint, face unlock, or screen lock to create a passkey.',
        icon: '🔐',
        actionText: 'Create Passkey'
      };
    } else if (isWindows) {
      return {
        title: 'Create Passkey',
        message: 'Use Windows Hello or your security key to create a passkey.',
        icon: '🔐',
        actionText: 'Create Passkey'
      };
    } else {
      return {
        title: 'Create Passkey',
        message: 'Use your authenticator to create a secure passkey for this account.',
        icon: '🔐',
        actionText: 'Create Passkey'
      };
    }
  } else {
    if (isApple) {
      return {
        title: 'Sign In with Passkey',
        message: 'Use Touch ID, Face ID, or your device passcode to sign in.',
        icon: '🔓',
        actionText: 'Sign In'
      };
    } else if (isAndroid) {
      return {
        title: 'Sign In with Passkey',
        message: 'Use your fingerprint, face unlock, or screen lock to sign in.',
        icon: '🔓',
        actionText: 'Sign In'
      };
    } else if (isWindows) {
      return {
        title: 'Sign In with Passkey',
        message: 'Use Windows Hello or your security key to sign in.',
        icon: '🔓',
        actionText: 'Sign In'
      };
    } else {
      return {
        title: 'Sign In with Passkey',
        message: 'Use your authenticator to sign in with your passkey.',
        icon: '🔓',
        actionText: 'Sign In'
      };
    }
  }
}

/**
 * Get user-friendly error message and suggestions
 */
function getErrorInfo(error: PasskeyOrchestratorError): { title: string; message: string; suggestions: string[] } {
  if (error instanceof PasskeyRegistrationFailedError) {
    switch (error.reason) {
      case 'user_cancelled':
        return {
          title: 'Passkey Creation Cancelled',
          message: 'You cancelled the passkey creation process.',
          suggestions: ['Try again when you\'re ready to create a passkey.']
        };
      case 'not_supported':
        return {
          title: 'Authenticator Unavailable',
          message: 'Your device\'s authenticator is not available right now.',
          suggestions: [
            'Make sure your device supports biometric authentication',
            'Check that you have a screen lock set up',
            'Try using a different device'
          ]
        };
      case 'not_allowed':
        return {
          title: 'Passkey Already Exists',
          message: 'You already have a passkey for this account.',
          suggestions: ['Try signing in with your existing passkey instead.']
        };
      case 'invalid_state':
        return {
          title: 'Invalid State',
          message: 'The passkey creation process is in an invalid state.',
          suggestions: ['Refresh the page and try again.']
        };
      default:
        return {
          title: 'Passkey Creation Failed',
          message: error.message || 'An unexpected error occurred while creating your passkey.',
          suggestions: [
            'Make sure your device supports passkeys',
            'Check your internet connection',
            'Try refreshing the page'
          ]
        };
    }
  }

  if (error instanceof PasskeyAuthFailedError) {
    switch (error.reason) {
      case 'user_cancelled':
        return {
          title: 'Sign In Cancelled',
          message: 'You cancelled the sign in process.',
          suggestions: ['Try again when you\'re ready to sign in.']
        };
      case 'no_credentials':
        return {
          title: 'No Passkey Found',
          message: 'No passkey was found for this account.',
          suggestions: [
            'Create a new passkey for this account',
            'Try a different sign in method',
            'Contact support if you believe this is an error'
          ]
        };
      case 'not_supported':
        return {
          title: 'Authenticator Unavailable',
          message: 'Your device\'s authenticator is not available right now.',
          suggestions: [
            'Make sure your device supports biometric authentication',
            'Check that you have a screen lock set up',
            'Try using a different device'
          ]
        };
      case 'not_allowed':
        return {
          title: 'Invalid Passkey',
          message: 'The passkey you used is not valid for this account.',
          suggestions: [
            'Try using a different passkey',
            'Create a new passkey for this account',
            'Contact support if the issue persists'
          ]
        };
      default:
        return {
          title: 'Sign In Failed',
          message: error.message || 'An unexpected error occurred while signing in.',
          suggestions: [
            'Make sure your device supports passkeys',
            'Check your internet connection',
            'Try refreshing the page'
          ]
        };
    }
  }

  if (error instanceof PasskeyEnvironmentError) {
    return {
      title: 'Passkeys Not Supported',
      message: 'Passkeys are not supported on this device or browser.',
      suggestions: [
        'Update your browser to the latest version',
        'Try using a different browser (Chrome, Safari, Edge)',
        'Use a device that supports modern web standards'
      ]
    };
  }

  if (error instanceof PasskeyConfigurationError) {
    return {
      title: 'Configuration Error',
      message: 'There\'s a problem with the passkey configuration.',
      suggestions: [
        'Contact the website administrator',
        'Try refreshing the page',
        'Check if the website is experiencing issues'
      ]
    };
  }

  return {
    title: 'Unexpected Error',
    message: error.message || 'An unexpected error occurred.',
    suggestions: [
      'Try refreshing the page',
      'Check your internet connection',
      'Contact support if the issue persists'
    ]
  };
}

/**
 * Create and show a passkey prompt modal
 */
export function renderPasskeyPrompt(
  operation: 'register' | 'authenticate',
  environment: Environment,
  config: PasskeyPromptConfig = {}
): HTMLElement {
  const promptInfo = getPromptInfo(operation, environment);

  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'passkey-prompt-overlay';

  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'passkey-prompt-modal';

  // Create modal content
  modal.innerHTML = `
    <div class="passkey-prompt-header">
      <span class="passkey-prompt-icon">${promptInfo.icon}</span>
      <h2 class="passkey-prompt-title">${promptInfo.title}</h2>
    </div>
    <div class="passkey-prompt-body">
      <p class="passkey-prompt-message">${promptInfo.message}</p>
      <div class="passkey-prompt-loading">
        <div class="passkey-prompt-spinner"></div>
        <p>Waiting for your device...</p>
      </div>
    </div>
    ${config.showCancel ? `
      <div class="passkey-prompt-footer">
        <button class="passkey-prompt-cancel">Cancel</button>
      </div>
    ` : ''}
  `;

  // Add event listeners
  if (config.showCancel) {
    const cancelButton = modal.querySelector('.passkey-prompt-cancel') as HTMLButtonElement;
    cancelButton.addEventListener('click', () => {
      hidePasskeyPrompt(overlay);
      config.onCancel?.();
    });
  }

  // Apply theme
  const theme = config.theme || 'auto';
  overlay.setAttribute('data-theme', theme);

  // Apply position
  const position = config.position || 'center';
  overlay.setAttribute('data-position', position);

  // Apply custom styles
  if (config.customStyles) {
    Object.assign(modal.style, config.customStyles);
  }

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Add CSS styles if not already present
  if (!document.querySelector('#passkey-prompt-styles')) {
    const styles = document.createElement('style');
    styles.id = 'passkey-prompt-styles';
    styles.textContent = getPasskeyPromptStyles();
    document.head.appendChild(styles);
  }

  return overlay;
}

/**
 * Hide a passkey prompt
 */
export function hidePasskeyPrompt(element: HTMLElement): void {
  element.classList.add('passkey-prompt-hiding');
  setTimeout(() => {
    element.remove();
  }, 300);
}

/**
 * Show a passkey error message
 */
export function showPasskeyError(
  error: PasskeyOrchestratorError,
  config: PasskeyErrorConfig = {}
): HTMLElement {
  const errorInfo = getErrorInfo(error);

  // Create error container
  const container = document.createElement('div');
  container.className = 'passkey-error-container';

  // Create error content
  container.innerHTML = `
    <div class="passkey-error-header">
      <span class="passkey-error-icon">⚠️</span>
      <h3 class="passkey-error-title">${errorInfo.title}</h3>
      <button class="passkey-error-close" aria-label="Close">×</button>
    </div>
    <div class="passkey-error-body">
      <p class="passkey-error-message">${errorInfo.message}</p>
      ${errorInfo.suggestions.length > 0 ? `
        <div class="passkey-error-suggestions">
          <p><strong>Suggestions:</strong></p>
          <ul>
            ${errorInfo.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
    <div class="passkey-error-footer">
      ${config.showRetry ? '<button class="passkey-error-retry">Try Again</button>' : ''}
    </div>
  `;

  // Add event listeners
  const closeButton = container.querySelector('.passkey-error-close') as HTMLButtonElement;
  closeButton.addEventListener('click', () => {
    hidePasskeyError(container);
    config.onDismiss?.();
  });

  if (config.showRetry) {
    const retryButton = container.querySelector('.passkey-error-retry') as HTMLButtonElement;
    retryButton.addEventListener('click', () => {
      hidePasskeyError(container);
      config.onRetry?.();
    });
  }

  // Apply theme
  const theme = config.theme || 'auto';
  container.setAttribute('data-theme', theme);

  // Apply position
  const position = config.position || 'top';
  container.setAttribute('data-position', position);

  document.body.appendChild(container);

  // Auto-hide if configured
  if (config.autoHide) {
    const delay = config.autoHideDelay || 5000;
    setTimeout(() => {
      if (container.parentNode) {
        hidePasskeyError(container);
      }
    }, delay);
  }

  // Add CSS styles if not already present
  if (!document.querySelector('#passkey-error-styles')) {
    const styles = document.createElement('style');
    styles.id = 'passkey-error-styles';
    styles.textContent = getPasskeyErrorStyles();
    document.head.appendChild(styles);
  }

  return container;
}

/**
 * Hide a passkey error message
 */
export function hidePasskeyError(element: HTMLElement): void {
  element.classList.add('passkey-error-hiding');
  setTimeout(() => {
    element.remove();
  }, 300);
}

/**
 * CSS styles for passkey prompts
 */
function getPasskeyPromptStyles(): string {
  return `
    .passkey-prompt-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      animation: passkey-fade-in 0.3s ease-out forwards;
    }

    .passkey-prompt-overlay[data-position="top"] {
      align-items: flex-start;
      padding-top: 20vh;
    }

    .passkey-prompt-overlay[data-position="bottom"] {
      align-items: flex-end;
      padding-bottom: 20vh;
    }

    .passkey-prompt-overlay.passkey-prompt-hiding {
      animation: passkey-fade-out 0.3s ease-out forwards;
    }

    .passkey-prompt-modal {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      max-width: 400px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      transform: scale(0.9) translateY(20px);
      animation: passkey-slide-in 0.3s ease-out forwards;
    }

    .passkey-prompt-overlay[data-theme="dark"] .passkey-prompt-modal {
      background: #2a2a2a;
      color: white;
    }

    @media (prefers-color-scheme: dark) {
      .passkey-prompt-overlay[data-theme="auto"] .passkey-prompt-modal {
        background: #2a2a2a;
        color: white;
      }
    }

    .passkey-prompt-header {
      text-align: center;
      padding: 24px 24px 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .passkey-prompt-overlay[data-theme="dark"] .passkey-prompt-header {
      border-bottom-color: #404040;
    }

    @media (prefers-color-scheme: dark) {
      .passkey-prompt-overlay[data-theme="auto"] .passkey-prompt-header {
        border-bottom-color: #404040;
      }
    }

    .passkey-prompt-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 16px;
    }

    .passkey-prompt-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    .passkey-prompt-body {
      padding: 24px;
      text-align: center;
    }

    .passkey-prompt-message {
      margin: 0 0 24px;
      font-size: 16px;
      line-height: 1.5;
      color: #666;
    }

    .passkey-prompt-overlay[data-theme="dark"] .passkey-prompt-message {
      color: #ccc;
    }

    @media (prefers-color-scheme: dark) {
      .passkey-prompt-overlay[data-theme="auto"] .passkey-prompt-message {
        color: #ccc;
      }
    }

    .passkey-prompt-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .passkey-prompt-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #f0f0f0;
      border-top: 3px solid #007aff;
      border-radius: 50%;
      animation: passkey-spin 1s linear infinite;
    }

    .passkey-prompt-footer {
      padding: 16px 24px 24px;
      text-align: center;
      border-top: 1px solid #f0f0f0;
    }

    .passkey-prompt-overlay[data-theme="dark"] .passkey-prompt-footer {
      border-top-color: #404040;
    }

    @media (prefers-color-scheme: dark) {
      .passkey-prompt-overlay[data-theme="auto"] .passkey-prompt-footer {
        border-top-color: #404040;
      }
    }

    .passkey-prompt-cancel {
      background: none;
      border: 2px solid #ccc;
      color: #666;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .passkey-prompt-cancel:hover {
      border-color: #999;
      color: #333;
    }

    @keyframes passkey-fade-in {
      to { opacity: 1; }
    }

    @keyframes passkey-fade-out {
      to { opacity: 0; }
    }

    @keyframes passkey-slide-in {
      to {
        transform: scale(1) translateY(0);
      }
    }

    @keyframes passkey-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
}

/**
 * CSS styles for passkey errors
 */
function getPasskeyErrorStyles(): string {
  return `
    .passkey-error-container {
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 1px solid #ff6b6b;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      max-width: 400px;
      width: 90%;
      z-index: 10001;
      transform: translateX(100%);
      animation: passkey-error-slide-in 0.3s ease-out forwards;
    }

    .passkey-error-container[data-position="center"] {
      top: 50%;
      left: 50%;
      right: auto;
      transform: translate(-50%, -50%) scale(0.9);
      animation: passkey-error-center-in 0.3s ease-out forwards;
    }

    .passkey-error-container[data-position="bottom"] {
      top: auto;
      bottom: 20px;
    }

    .passkey-error-container[data-theme="dark"] {
      background: #2a2a2a;
      color: white;
      border-color: #ff8a8a;
    }

    @media (prefers-color-scheme: dark) {
      .passkey-error-container[data-theme="auto"] {
        background: #2a2a2a;
        color: white;
        border-color: #ff8a8a;
      }
    }

    .passkey-error-container.passkey-error-hiding {
      animation: passkey-error-slide-out 0.3s ease-out forwards;
    }

    .passkey-error-container[data-position="center"].passkey-error-hiding {
      animation: passkey-error-center-out 0.3s ease-out forwards;
    }

    .passkey-error-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 16px 12px;
      border-bottom: 1px solid #ffe0e0;
    }

    .passkey-error-container[data-theme="dark"] .passkey-error-header {
      border-bottom-color: #404040;
    }

    @media (prefers-color-scheme: dark) {
      .passkey-error-container[data-theme="auto"] .passkey-error-header {
        border-bottom-color: #404040;
      }
    }

    .passkey-error-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .passkey-error-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      flex: 1;
    }

    .passkey-error-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      color: #999;
      transition: all 0.2s ease;
    }

    .passkey-error-close:hover {
      background: #f0f0f0;
      color: #666;
    }

    .passkey-error-container[data-theme="dark"] .passkey-error-close:hover {
      background: #404040;
      color: #ccc;
    }

    @media (prefers-color-scheme: dark) {
      .passkey-error-container[data-theme="auto"] .passkey-error-close:hover {
        background: #404040;
        color: #ccc;
      }
    }

    .passkey-error-body {
      padding: 16px;
    }

    .passkey-error-message {
      margin: 0 0 16px;
      font-size: 14px;
      line-height: 1.4;
    }

    .passkey-error-suggestions {
      font-size: 13px;
      color: #666;
    }

    .passkey-error-container[data-theme="dark"] .passkey-error-suggestions {
      color: #ccc;
    }

    @media (prefers-color-scheme: dark) {
      .passkey-error-container[data-theme="auto"] .passkey-error-suggestions {
        color: #ccc;
      }
    }

    .passkey-error-suggestions ul {
      margin: 8px 0 0;
      padding-left: 16px;
    }

    .passkey-error-suggestions li {
      margin-bottom: 4px;
    }

    .passkey-error-footer {
      padding: 12px 16px 16px;
      text-align: right;
    }

    .passkey-error-retry {
      background: #007aff;
      border: none;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .passkey-error-retry:hover {
      background: #0056b3;
    }

    @keyframes passkey-error-slide-in {
      to { transform: translateX(0); }
    }

    @keyframes passkey-error-slide-out {
      to { transform: translateX(100%); }
    }

    @keyframes passkey-error-center-in {
      to { transform: translate(-50%, -50%) scale(1); }
    }

    @keyframes passkey-error-center-out {
      to { transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
    }
  `;
}
