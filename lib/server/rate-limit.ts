import { createHash } from "node:crypto";

import { prisma } from "@/lib/prisma";

type RateLimitOptions = {
  namespace: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
};

type RateLimitRow = {
  request_count: number;
  window_started_at: Date;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

function hashIdentifier(value: string) {
  return createHash("sha256")
    .update(value)
    .digest("hex");
}

export function getRequestIdentifier(
  request: Request
) {
  /**
   * Na Vercel, o IP original normalmente chega
   * através de x-forwarded-for.
   *
   * O header pode conter uma lista:
   *
   * 203.0.113.10, proxy1, proxy2
   *
   * Nesse caso usamos o primeiro valor.
   */
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  const ip =
    forwardedFor
      ?.split(",")[0]
      ?.trim() ||
    request.headers.get("x-real-ip")?.trim();

  if (ip) {
    return `ip:${ip}`;
  }

  /**
   * Fallback.
   *
   * Em produção na Vercel normalmente teremos IP.
   * Porém não queremos que todas as requisições
   * sem esse header compartilhem literalmente
   * uma única chave.
   */
  const userAgent =
    request.headers.get("user-agent") ||
    "unknown";

  return `fallback:${userAgent}`;
}

export async function checkRateLimit({
  namespace,
  identifier,
  limit,
  windowSeconds,
}: RateLimitOptions): Promise<RateLimitResult> {
  /**
   * Não armazenamos o IP diretamente no banco.
   *
   * A tabela recebe apenas um SHA-256.
   */
  const hashedIdentifier =
    hashIdentifier(identifier);

  const key =
    `${namespace}:${hashedIdentifier}`;

  /**
   * Esta operação precisa ser atômica.
   *
   * Se várias requisições chegarem ao mesmo
   * tempo, o PostgreSQL será responsável
   * por incrementar corretamente o contador.
   */
  const rows =
    await prisma.$queryRaw<RateLimitRow[]>`
      INSERT INTO public.rate_limits (
        key,
        request_count,
        window_started_at,
        updated_at
      )
      VALUES (
        ${key},
        1,
        NOW(),
        NOW()
      )

      ON CONFLICT (key)
      DO UPDATE SET

        request_count =
          CASE
            WHEN
              public.rate_limits.window_started_at
              <= NOW() - make_interval(
                secs => ${windowSeconds}
              )
            THEN 1
            ELSE
              public.rate_limits.request_count + 1
          END,

        window_started_at =
          CASE
            WHEN
              public.rate_limits.window_started_at
              <= NOW() - make_interval(
                secs => ${windowSeconds}
              )
            THEN NOW()
            ELSE
              public.rate_limits.window_started_at
          END,

        updated_at = NOW()

      RETURNING
        request_count,
        window_started_at;
    `;

  const row = rows[0];

  if (!row) {
    throw new Error(
      "Rate limit query returned no result."
    );
  }

  const requestCount =
    Number(row.request_count);

  const windowStartedAt =
    new Date(row.window_started_at);

  const windowEndsAt =
    windowStartedAt.getTime() +
    windowSeconds * 1000;

  const retryAfterSeconds =
    Math.max(
      1,
      Math.ceil(
        (windowEndsAt - Date.now()) / 1000
      )
    );

  return {
    allowed: requestCount <= limit,

    limit,

    remaining: Math.max(
      0,
      limit - requestCount
    ),

    retryAfterSeconds:
      requestCount > limit
        ? retryAfterSeconds
        : 0,
  };
}