/**
 * Base64URL encoding/decoding utilities for WebAuthn
 * These functions handle the conversion between ArrayBuffer and Base64URL strings
 * as required by the WebAuthn specification.
 */
/**
 * Converts an ArrayBuffer to a Base64URL-encoded string
 * @param buffer - The ArrayBuffer to encode
 * @returns Base64URL-encoded string
 */
export declare function arrayBufferToBase64URL(buffer: ArrayBuffer): string;
/**
 * Converts a Base64URL-encoded string to an ArrayBuffer
 * @param base64url - The Base64URL string to decode
 * @returns ArrayBuffer containing the decoded data
 */
export declare function base64URLToArrayBuffer(base64url: string): ArrayBuffer;
/**
 * Coerces various input types to ArrayBuffer
 * Useful for handling different input formats in WebAuthn operations
 * @param input - The input to coerce (string, Uint8Array, ArrayBuffer, etc.)
 * @returns ArrayBuffer
 */
export declare function coerceToArrayBuffer(input: string | ArrayBuffer | Uint8Array | number[]): ArrayBuffer;
/**
 * Converts a Uint8Array to a Base64URL-encoded string
 * @param uint8Array - The Uint8Array to encode
 * @returns Base64URL-encoded string
 */
export declare function uint8ArrayToBase64URL(uint8Array: Uint8Array): string;
/**
 * Converts a Base64URL-encoded string to a Uint8Array
 * @param base64url - The Base64URL string to decode
 * @returns Uint8Array containing the decoded data
 */
export declare function base64URLToUint8Array(base64url: string): Uint8Array;
/**
 * Safely converts various buffer types to Base64URL
 * @param buffer - The buffer to convert
 * @returns Base64URL-encoded string
 */
export declare function bufferToBase64URL(buffer: ArrayBuffer | Uint8Array | string): string;
/**
 * Generates a cryptographically secure random challenge
 * @param length - Length of the challenge in bytes (default: 32)
 * @returns Base64URL-encoded challenge string
 */
export declare function generateChallenge(length?: number): string;
/**
 * Converts a string to UTF-8 encoded ArrayBuffer
 * @param str - The string to encode
 * @returns ArrayBuffer containing UTF-8 encoded string
 */
export declare function stringToArrayBuffer(str: string): ArrayBuffer;
/**
 * Converts an ArrayBuffer containing UTF-8 data to a string
 * @param buffer - The ArrayBuffer to decode
 * @returns Decoded string
 */
export declare function arrayBufferToString(buffer: ArrayBuffer): string;
//# sourceMappingURL=encoding.d.ts.map