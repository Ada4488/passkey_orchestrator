/**
 * Test setup for client package
 */
import { vi } from 'vitest';
// Mock navigator.credentials.create and get for WebAuthn
Object.defineProperty(global, 'navigator', {
    value: {
        credentials: {
            create: vi.fn().mockResolvedValue({
                id: 'test-credential-id',
                type: 'public-key',
                rawId: new ArrayBuffer(16),
                response: {
                    clientDataJSON: new ArrayBuffer(32),
                    attestationObject: new ArrayBuffer(64),
                },
                getClientExtensionResults: () => ({}),
            }),
            get: vi.fn().mockResolvedValue({
                id: 'test-credential-id',
                type: 'public-key',
                rawId: new ArrayBuffer(16),
                response: {
                    clientDataJSON: new ArrayBuffer(32),
                    authenticatorData: new ArrayBuffer(32),
                    signature: new ArrayBuffer(64),
                    userHandle: new ArrayBuffer(8),
                },
                getClientExtensionResults: () => ({}),
            }),
        },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
    writable: true,
});
// Mock crypto for base64URL operations
Object.defineProperty(global, 'crypto', {
    value: {
        getRandomValues: (array) => {
            for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
            return array;
        },
        randomUUID: () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    }
});
// Mock TextEncoder/TextDecoder
global.TextEncoder = class TextEncoder {
    encode(input) {
        const bytes = new Uint8Array(input.length);
        for (let i = 0; i < input.length; i++) {
            bytes[i] = input.charCodeAt(i);
        }
        return bytes;
    }
    get encoding() { return 'utf-8'; }
    encodeInto() { throw new Error('encodeInto not implemented'); }
};
global.TextDecoder = class TextDecoder {
    decode(input) {
        return Array.from(input, byte => String.fromCharCode(byte)).join('');
    }
    get encoding() { return 'utf-8'; }
    get fatal() { return false; }
    get ignoreBOM() { return false; }
};
// Mock PublicKeyCredential for WebAuthn support
Object.defineProperty(global, 'PublicKeyCredential', {
    value: class PublicKeyCredential {
        static isUserVerifyingPlatformAuthenticatorAvailable = vi.fn().mockResolvedValue(true);
        static isConditionalMediationAvailable = vi.fn().mockResolvedValue(true);
    },
    writable: true,
});
// Mock setTimeout for tests
vi.stubGlobal('setTimeout', (fn, delay) => {
    return setTimeout(fn, 0); // Use immediate execution for tests
});
