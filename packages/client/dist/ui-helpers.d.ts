/**
 * UI helpers for enhanced user experience with Passkeys
 * Provides ready-to-use components and utilities for common Passkey scenarios
 */
import type { Environment } from '@passkey-orchestrator/shared';
import { PasskeyOrchestratorError } from '@passkey-orchestrator/shared';
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
 * Create and show a passkey prompt modal
 */
export declare function renderPasskeyPrompt(operation: 'register' | 'authenticate', environment: Environment, config?: PasskeyPromptConfig): HTMLElement;
/**
 * Hide a passkey prompt
 */
export declare function hidePasskeyPrompt(element: HTMLElement): void;
/**
 * Show a passkey error message
 */
export declare function showPasskeyError(error: PasskeyOrchestratorError, config?: PasskeyErrorConfig): HTMLElement;
/**
 * Hide a passkey error message
 */
export declare function hidePasskeyError(element: HTMLElement): void;
//# sourceMappingURL=ui-helpers.d.ts.map