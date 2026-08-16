type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

type ResendSendResponse = {
  id?: string;
  message?: string;
  name?: string;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}`);
  }

  return value;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailInput) {
  const apiKey = getRequiredEnv("RESEND_API_KEY");
  const from = getRequiredEnv("ORDER_FROM_EMAIL");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      reply_to: replyTo,
    }),
  });

  const data = (await response.json().catch(() => null)) as
    | ResendSendResponse
    | null;

  if (!response.ok) {
    throw new Error(
      data?.message || data?.name || "Não foi possível enviar o e-mail."
    );
  }

  return data;
}