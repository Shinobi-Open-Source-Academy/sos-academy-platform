import { createHash } from 'node:crypto';

/**
 * Hash stored in the session for a refresh token.
 *
 * bcrypt only looks at the first 72 bytes of its input, and every refresh JWT of a user starts
 * with the same 72 bytes (same header and claims), so bcrypt can't tell them apart. Refresh
 * tokens are long random-looking JWTs, so a plain SHA-256 of the whole token is enough and
 * also lets us look the session up directly.
 */
export const hashRefreshToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');
