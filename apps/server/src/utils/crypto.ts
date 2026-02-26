import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

export function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

export function md5(data: string): string {
  return createHash('md5').update(data).digest('hex');
}

export function generateToken(byteLength = 32): string {
  return randomBytes(byteLength).toString('hex');
}

export function generateApiKey(prefix = 'vb'): string {
  const token = randomBytes(24).toString('base64url');
  return `${prefix}_${token}`;
}

export function hmacSign(payload: string, secret: string, algorithm = 'sha256'): string {
  return createHmac(algorithm, secret).update(payload).digest('hex');
}

export function hmacVerify(payload: string, secret: string, signature: string, algorithm = 'sha256'): boolean {
  const expected = hmacSign(payload, secret, algorithm);
  if (expected.length !== signature.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const usedSalt = salt ?? randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(`${usedSalt}:${password}`).digest('hex');
  return { hash, salt: usedSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const result = hashPassword(password, salt);
  if (result.hash.length !== hash.length) return false;
  try {
    return timingSafeEqual(Buffer.from(result.hash, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}
