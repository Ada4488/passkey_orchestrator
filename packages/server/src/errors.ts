// Server-specific errors
import { PasskeyError } from '@passkey-orchestrator/shared';

export class PasskeyVerificationError extends PasskeyError {
  constructor(message: string, code: string, cause?: Error) {
    super(message, code, cause);
    this.name = 'PasskeyVerificationError';
  }
}

export class PasskeyParsingError extends PasskeyError {
  constructor(message: string, code: string, cause?: Error) {
    super(message, code, cause);
    this.name = 'PasskeyParsingError';
  }
}
