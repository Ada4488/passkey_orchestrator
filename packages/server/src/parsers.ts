import { base64UrlToArrayBuffer } from '@passkey-orchestrator/shared';
import { decodeFirst } from 'cbor-x';
import { PasskeyParsingError } from './errors';
import type { ParsedAttestationResponse, ParsedAssertionResponse, AuthenticatorData } from './types';

/**
 * Parses the clientDataJSON string into an object.
 */
function parseClientDataJSON(clientDataJSON: string): Record<string, any> {
  try {
    const decoded = new TextDecoder().decode(base64UrlToArrayBuffer(clientDataJSON));
    return JSON.parse(decoded);
  } catch (error) {
    throw new PasskeyParsingError('Failed to parse clientDataJSON', 'client_data_json_parsing_error', error as Error);
  }
}

/**
 * Parses the AuthenticatorData buffer.
 * See: https://www.w3.org/TR/webauthn-2/#sctn-authenticator-data
 */
function parseAuthenticatorData(authDataBuffer: ArrayBuffer): AuthenticatorData {
  const dataView = new DataView(authDataBuffer);
  let offset = 0;

  const rpIdHash = authDataBuffer.slice(offset, offset + 32);
  offset += 32;

  const flagsByte = dataView.getUint8(offset);
  offset += 1;

  const flags = {
    userPresent: (flagsByte & 0x01) !== 0, // UP
    userVerified: (flagsByte & 0x04) !== 0, // UV
    attestedCredentialDataIncluded: (flagsByte & 0x40) !== 0, // AT
    extensionDataIncluded: (flagsByte & 0x80) !== 0, // ED
    // WebAuthn Level 3 flags (optional for now, check buffer length if implementing)
    // backupEligible: (flagsByte & 0x02) !== 0, // BE - Note: This bit was RFU (0) in L1/L2, repurposed in L3
    // backedUp: (flagsByte & 0x08) !== 0,     // BS - Note: This bit was RFU (0) in L1/L2, repurposed in L3
  };

  const signCount = dataView.getUint32(offset, false); // Big-endian
  offset += 4;

  let attestedCredentialData: AuthenticatorData['attestedCredentialData'] | undefined;
  if (flags.attestedCredentialDataIncluded) {
    if (authDataBuffer.byteLength < offset + 16 + 2) {
      throw new PasskeyParsingError('Authenticator data too short for AAGUID and credential ID length.', 'auth_data_too_short');
    }
    const aaguid = authDataBuffer.slice(offset, offset + 16);
    offset += 16;

    const credentialIdLength = dataView.getUint16(offset, false); // Big-endian
    offset += 2;

    if (authDataBuffer.byteLength < offset + credentialIdLength) {
      throw new PasskeyParsingError('Authenticator data too short for credential ID.', 'auth_data_too_short');
    }
    const credentialId = authDataBuffer.slice(offset, offset + credentialIdLength);
    offset += credentialIdLength;

    // The rest is the credentialPublicKey (COSE format)
    const credentialPublicKeyBytes = authDataBuffer.slice(offset);
    let credentialPublicKey;
    try {
      credentialPublicKey = decodeFirst(credentialPublicKeyBytes) as Record<string, any>;
    } catch (e) {
      throw new PasskeyParsingError('Failed to decode credentialPublicKey from authenticator data.', 'cose_public_key_decode_error', e as Error);
    }
    offset += credentialPublicKeyBytes.byteLength;


    attestedCredentialData = {
      aaguid,
      credentialId,
      credentialPublicKey,
    };
  }

  let extensions: Record<string, any> | undefined;
  if (flags.extensionDataIncluded) {
    if (authDataBuffer.byteLength <= offset) {
      throw new PasskeyParsingError('Authenticator data indicates extensions but no data is present.', 'auth_data_extensions_missing');
    }
    const extensionsBuffer = authDataBuffer.slice(offset);
    try {
      extensions = decodeFirst(extensionsBuffer) as Record<string, any>;
    } catch (e) {
      throw new PasskeyParsingError('Failed to decode CBOR extension data from authenticator data.', 'extensions_cbor_decode_error', e as Error);
    }
  }

  return {
    rpIdHash,
    flags,
    signCount,
    attestedCredentialData,
    extensions,
  };
}


/**
 * Parses the attestation response from the client.
 *
 * @param clientDataJSON - The Base64URL encoded client data JSON string.
 * @param attestationObject - The Base64URL encoded attestation object string.
 * @returns The parsed attestation response.
 */
export function parseAttestationResponse(
  clientDataJSON: string,
  attestationObject: string
): ParsedAttestationResponse {
  const parsedClientData = parseClientDataJSON(clientDataJSON);
  let rawAttestationObject: Record<string, any>;

  try {
    const attestationBuffer = base64UrlToArrayBuffer(attestationObject);
    rawAttestationObject = decodeFirst(attestationBuffer) as Record<string, any>;
  } catch (error) {
    throw new PasskeyParsingError('Failed to decode attestationObject CBOR', 'attestation_object_cbor_error', error as Error);
  }

  if (!rawAttestationObject || typeof rawAttestationObject !== 'object' || !rawAttestationObject.fmt || !rawAttestationObject.attStmt || !rawAttestationObject.authData) {
    throw new PasskeyParsingError('Invalid attestation object structure. Missing fmt, attStmt, or authData.', 'attestation_object_invalid_structure');
  }

  const authDataBuffer = rawAttestationObject.authData as ArrayBuffer;
  if (!(authDataBuffer instanceof ArrayBuffer)) {
      throw new PasskeyParsingError('attestationObject.authData is not an ArrayBuffer.', 'auth_data_not_buffer');
  }

  const parsedAuthenticatorData = parseAuthenticatorData(authDataBuffer);
  const attestationStatement = rawAttestationObject.attStmt as Record<string, any>;


  return {
    clientDataJSON: parsedClientData,
    attestationObject: rawAttestationObject, // Return the raw decoded object
    authenticatorData: parsedAuthenticatorData,
    attestationStatement: attestationStatement,
  };
}

/**
 * Parses the assertion response from the client.
 *
 * @param clientDataJSON - The Base64URL encoded client data JSON string.
 * @param authenticatorData - The Base64URL encoded authenticator data string.
 * @param signature - The Base64URL encoded signature string.
 * @param userHandle - The Base64URL encoded user handle string (optional).
 * @returns The parsed assertion response.
 */
export function parseAssertionResponse(
  clientDataJSON: string,
  authenticatorData: string,
  signature: string,
  userHandle?: string
): ParsedAssertionResponse {
  const parsedClientData = parseClientDataJSON(clientDataJSON);
  let parsedAuthenticatorData: AuthenticatorData;

  try {
    const authenticatorDataBuffer = base64UrlToArrayBuffer(authenticatorData);
    // In assertion, authenticatorData is sent directly, not as part of a larger CBOR object.
    parsedAuthenticatorData = parseAuthenticatorData(authenticatorDataBuffer);
  } catch (error) {
    // If parseAuthenticatorData threw a PasskeyParsingError, rethrow it. Otherwise, wrap it.
    if (error instanceof PasskeyParsingError) {
      throw error;
    }
    throw new PasskeyParsingError('Failed to parse authenticatorData for assertion.', 'authenticator_data_parsing_error', error as Error);
  }

  const signatureBuffer = base64UrlToArrayBuffer(signature);
  const userHandleBuffer = userHandle ? base64UrlToArrayBuffer(userHandle) : undefined;

  return {
    clientDataJSON: parsedClientData,
    authenticatorData: parsedAuthenticatorData,
    signature: signatureBuffer,
    userHandle: userHandleBuffer,
  };
}
