import jwt from 'jsonwebtoken';

type TokenPayload = {
  userId: string;
  email: string;
  role: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET não foi definido.');
  }

  return secret;
}

export function signAdminToken(payload: TokenPayload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: '7d',
  });
}

export function verifyAdminToken(token: string): TokenPayload {
  return jwt.verify(token, getJwtSecret()) as TokenPayload;
}