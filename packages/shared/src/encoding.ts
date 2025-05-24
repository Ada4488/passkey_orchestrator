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
export function arrayBufferToBase64URL(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  // Convert to base64 and make it URL-safe
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Converts a Base64URL-encoded string to an ArrayBuffer
 * @param base64url - The Base64URL string to decode
 * @returns ArrayBuffer containing the decoded data
 */
export function base64URLToArrayBuffer(base64url: string): ArrayBuffer {
  // Add padding if necessary
  let base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  // Add padding
  while (base64.length % 4) {
    base64 += '=';
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

/**
 * Coerces various input types to ArrayBuffer
 * Useful for handling different input formats in WebAuthn operations
 * @param input - The input to coerce (string, Uint8Array, ArrayBuffer, etc.)
 * @returns ArrayBuffer
 */
export function coerceToArrayBuffer(
  input: string | ArrayBuffer | Uint8Array | number[]
): ArrayBuffer {
  if (input instanceof ArrayBuffer) {
    return input;
  }

  if (input instanceof Uint8Array) {
    return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
  }

  if (typeof input === 'string') {
    // Assume it's Base64URL encoded
    return base64URLToArrayBuffer(input);
  }

  if (Array.isArray(input)) {
    // Assume it's an array of numbers (bytes)
    const uint8Array = new Uint8Array(input);
    return uint8Array.buffer;
  }

  throw new Error(`Cannot coerce input of type ${typeof input} to ArrayBuffer`);
}

/**
 * Converts a Uint8Array to a Base64URL-encoded string
 * @param uint8Array - The Uint8Array to encode
 * @returns Base64URL-encoded string
 */
export function uint8ArrayToBase64URL(uint8Array: Uint8Array): string {
  return arrayBufferToBase64URL(uint8Array.buffer.slice(
    uint8Array.byteOffset,
    uint8Array.byteOffset + uint8Array.byteLength
  ));
}

/**
 * Converts a Base64URL-encoded string to a Uint8Array
 * @param base64url - The Base64URL string to decode
 * @returns Uint8Array containing the decoded data
 */
export function base64URLToUint8Array(base64url: string): Uint8Array {
  return new Uint8Array(base64URLToArrayBuffer(base64url));
}

/**
 * Safely converts various buffer types to Base64URL
 * @param buffer - The buffer to convert
 * @returns Base64URL-encoded string
 */
export function bufferToBase64URL(
  buffer: ArrayBuffer | Uint8Array | string
): string {
  if (typeof buffer === 'string') {
    // If it's already a string, assume it's Base64URL and return as-is
    return buffer;
  }

  if (buffer instanceof Uint8Array) {
    return uint8ArrayToBase64URL(buffer);
  }

  return arrayBufferToBase64URL(buffer);
}

/**
 * Generates a cryptographically secure random challenge
 * @param length - Length of the challenge in bytes (default: 32)
 * @returns Base64URL-encoded challenge string
 */
export function generateChallenge(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return uint8ArrayToBase64URL(array);
}

/**
 * Converts a string to UTF-8 encoded ArrayBuffer
 * @param str - The string to encode
 * @returns ArrayBuffer containing UTF-8 encoded string
 */
export function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

/**
 * Converts an ArrayBuffer containing UTF-8 data to a string
 * @param buffer - The ArrayBuffer to decode
 * @returns Decoded string
 */
export function arrayBufferToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}
