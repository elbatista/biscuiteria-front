type MelhorEnvioQuoteProduct = {
  id: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  insurance_value: number;
  quantity: number;
};

type MelhorEnvioQuoteRequest = {
  from: {
    postal_code: string;
  };
  to: {
    postal_code: string;
  };
  products: MelhorEnvioQuoteProduct[];
};

function getBaseUrl() {
  const env = process.env.MELHOR_ENVIO_ENV;

  if (env === "production") {
    return "https://www.melhorenvio.com.br";
  }

  return "https://sandbox.melhorenvio.com.br";
}

function getAccessToken() {
  const token = process.env.MELHOR_ENVIO_ACCESS_TOKEN;

  if (!token) {
    throw new Error("MELHOR_ENVIO_ACCESS_TOKEN não configurado.");
  }

  return token;
}

function getUserAgent() {
  const userAgent = process.env.MELHOR_ENVIO_USER_AGENT;

  if (!userAgent) {
    throw new Error("MELHOR_ENVIO_USER_AGENT não configurado.");
  }

  return userAgent;
}

export async function quoteShipmentWithMelhorEnvio(
  payload: MelhorEnvioQuoteRequest
) {
  const url = `${getBaseUrl()}/api/v2/me/shipment/calculate`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
      "User-Agent": getUserAgent(),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      "Não foi possível consultar o frete no Melhor Envio.";

    throw new Error(message);
  }

  return data;
}