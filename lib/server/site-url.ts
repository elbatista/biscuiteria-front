export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  /**
   * Em desenvolvimento local, permitimos o fallback
   * para localhost por conveniência.
   */
  if (!configuredUrl) {
    if (process.env.NODE_ENV !== "production") {
      return "http://localhost:3000";
    }

    /**
     * Em produção preferimos falhar explicitamente.
     *
     * É muito melhor registrar um erro de configuração
     * do que enviar ao cliente um link apontando para
     * localhost.
     */
    throw new Error(
      "Variável de ambiente ausente: NEXT_PUBLIC_SITE_URL"
    );
  }

  /**
   * Remove barras finais para evitar URLs como:
   *
   * https://site.com//pedido/ABC
   */
  return configuredUrl.replace(/\/+$/, "");
}