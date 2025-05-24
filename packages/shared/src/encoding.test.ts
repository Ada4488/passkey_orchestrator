import { describe, it, expect } from 'vitest';
import {
  arrayBufferToBase64URL,
  base64URLToArrayBuffer,
  coerceToArrayBuffer,
  generateChallenge,
  uint8ArrayToBase64URL,
  base64URLToUint8Array,
  bufferToBase64URL,
  stringToArrayBuffer,
  arrayBufferToString,
} from '../src/encoding.js';

describe('Encoding utilities', () => {
  describe('arrayBufferToBase64URL', () => {
    it('should encode ArrayBuffer to Base64URL', () => {
      const input = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const result = arrayBufferToBase64URL(input.buffer);
      expect(result).toBe('SGVsbG8');
    });

    it('should produce URL-safe output', () => {
      const input = new Uint8Array([62, 63, 254, 255]); // Characters that would produce +/= in base64
      const result = arrayBufferToBase64URL(input.buffer);
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
      expect(result).not.toContain('=');
    });
  });

  describe('base64URLToArrayBuffer', () => {
    it('should decode Base64URL to ArrayBuffer', () => {
      const input = 'SGVsbG8';
      const result = base64URLToArrayBuffer(input);
      const uint8Array = new Uint8Array(result);
      expect(Array.from(uint8Array)).toEqual([72, 101, 108, 108, 111]);
    });

    it('should handle URL-safe characters', () => {
      const input = 'Pj_-_w'; // URL-safe version of base64
      const result = base64URLToArrayBuffer(input);
      expect(result).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain data integrity through encode/decode cycle', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5, 255, 254, 253]);
      const encoded = arrayBufferToBase64URL(original.buffer);
      const decoded = new Uint8Array(base64URLToArrayBuffer(encoded));
      expect(Array.from(decoded)).toEqual(Array.from(original));
    });
  });

  describe('coerceToArrayBuffer', () => {
    it('should handle ArrayBuffer input', () => {
      const input = new Uint8Array([1, 2, 3]).buffer;
      const result = coerceToArrayBuffer(input);
      expect(result).toBe(input);
    });

    it('should handle Uint8Array input', () => {
      const input = new Uint8Array([1, 2, 3]);
      const result = coerceToArrayBuffer(input);
      expect(new Uint8Array(result)).toEqual(input);
    });

    it('should handle Base64URL string input', () => {
      const input = 'AQID'; // Base64URL for [1, 2, 3]
      const result = coerceToArrayBuffer(input);
      const uint8Array = new Uint8Array(result);
      expect(Array.from(uint8Array)).toEqual([1, 2, 3]);
    });

    it('should handle number array input', () => {
      const input = [1, 2, 3];
      const result = coerceToArrayBuffer(input);
      const uint8Array = new Uint8Array(result);
      expect(Array.from(uint8Array)).toEqual([1, 2, 3]);
    });

    it('should throw for unsupported input types', () => {
      expect(() => coerceToArrayBuffer({} as any)).toThrow();
    });
  });

  describe('generateChallenge', () => {
    it('should generate a challenge of default length', () => {
      const challenge = generateChallenge();
      const decoded = base64URLToArrayBuffer(challenge);
      expect(decoded.byteLength).toBe(32);
    });

    it('should generate a challenge of specified length', () => {
      const challenge = generateChallenge(16);
      const decoded = base64URLToArrayBuffer(challenge);
      expect(decoded.byteLength).toBe(16);
    });

    it('should generate different challenges each time', () => {
      const challenge1 = generateChallenge();
      const challenge2 = generateChallenge();
      expect(challenge1).not.toBe(challenge2);
    });

    it('should produce valid Base64URL', () => {
      const challenge = generateChallenge();
      expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  describe('uint8ArrayToBase64URL and base64URLToUint8Array', () => {
    it('should handle round-trip conversion', () => {
      const original = new Uint8Array([10, 20, 30, 40, 50]);
      const encoded = uint8ArrayToBase64URL(original);
      const decoded = base64URLToUint8Array(encoded);
      expect(decoded).toEqual(original);
    });
  });

  describe('bufferToBase64URL', () => {
    it('should handle ArrayBuffer input', () => {
      const input = new Uint8Array([72, 101, 108, 108, 111]).buffer; // "Hello"
      const result = bufferToBase64URL(input);
      expect(result).toBe('SGVsbG8');
    });

    it('should handle Uint8Array input', () => {
      const input = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const result = bufferToBase64URL(input);
      expect(result).toBe('SGVsbG8');
    });

    it('should handle string input (pass-through)', () => {
      const input = 'SGVsbG8';
      const result = bufferToBase64URL(input);
      expect(result).toBe('SGVsbG8');
    });
  });

  describe('stringToArrayBuffer and arrayBufferToString', () => {
    it('should handle round-trip conversion for standard ASCII strings', () => {
      const originalString = 'Hello, WebAuthn!';
      const buffer = stringToArrayBuffer(originalString);
      expect(buffer).toBeInstanceOf(ArrayBuffer);
      const decodedString = arrayBufferToString(buffer);
      expect(decodedString).toBe(originalString);
    });

    it('should handle round-trip conversion for strings with UTF-8 characters', () => {
      const originalString = '你好，世界！🔑✨';
      const buffer = stringToArrayBuffer(originalString);
      expect(buffer).toBeInstanceOf(ArrayBuffer);
      const decodedString = arrayBufferToString(buffer);
      expect(decodedString).toBe(originalString);
    });

    it('stringToArrayBuffer should produce correct byte sequence for known string', () => {
      const input = 'Hi'; // H = 72, i = 105
      const buffer = stringToArrayBuffer(input);
      const uint8Array = new Uint8Array(buffer);
      expect(Array.from(uint8Array)).toEqual([72, 105]);
    });

    it('arrayBufferToString should produce correct string for known byte sequence', () => {
      const input = new Uint8Array([65, 66, 67]); // A, B, C
      const str = arrayBufferToString(input.buffer);
      expect(str).toBe('ABC');
    });

    it('should handle empty strings', () => {
      const originalString = '';
      const buffer = stringToArrayBuffer(originalString);
      expect(buffer.byteLength).toBe(0);
      const decodedString = arrayBufferToString(buffer);
      expect(decodedString).toBe('');
    });
  });
});
