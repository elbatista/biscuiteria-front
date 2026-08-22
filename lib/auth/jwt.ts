import jwt from "jsonwebtoken";

export type AdminTokenPayload = {
  userId: string;
  email: string;
  role: string;
  sessionVersion: number;
};

function getJwtSecret(): string {
  const secret =
    process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET não foi definido."
    );
  }

  return secret;
}

export function signAdminToken(
  payload: AdminTokenPayload
) {
  return jwt.sign(
    payload,
    getJwtSecret(),
    {
      expiresIn: "7d",
    }
  );
}

export function verifyAdminToken(
  token: string
): AdminTokenPayload {
  return jwt.verify(
    token,
    getJwtSecret()
  ) as AdminTokenPayload;
}