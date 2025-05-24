// Server-specific types
// Initially, this might re-export from shared or be empty

export interface ParsedAttestationResponse {
  clientDataJSON: Record<string, any>;
  attestationObject: Record<string, any>; // This is the raw CBOR-decoded attestation object
  authenticatorData: AuthenticatorData; // Parsed authenticator data
  attestationStatement: Record<string, any>; // Parsed attestation statement
}

export interface AuthenticatorData {
  rpIdHash: ArrayBuffer;
  flags: {
    userPresent: boolean;
    userVerified: boolean;
    attestedCredentialDataIncluded: boolean;
    extensionDataIncluded: boolean;
    backupEligible?: boolean; // For WebAuthn Level 3
    backedUp?: boolean; // For WebAuthn Level 3
  };
  signCount: number;
  attestedCredentialData?: {
    aaguid: ArrayBuffer;
    credentialId: ArrayBuffer;
    credentialPublicKey: Record<string, any>; // COSE public key structure
  };
  extensions?: Record<string, any>;
}

export interface ParsedAssertionResponse {
  clientDataJSON: Record<string, any>; // Adjust with more specific type later
  authenticatorData: AuthenticatorData; // Use the more detailed AuthenticatorData type
  signature: ArrayBuffer;
  userHandle?: ArrayBuffer;
}
