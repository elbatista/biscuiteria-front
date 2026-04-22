
# Blueprint detalhado de e-commerce

## Visão geral

Este documento descreve a arquitetura recomendada para transformar o site em um e-commerce enxuto, com foco em lançamento rápido, baixo custo operacional e possibilidade de crescimento posterior sem reescrever a base do sistema.

A recomendação principal é usar:

* **Next.js** como aplicação web
* **Vercel** para hospedagem
* **Supabase Postgres** como banco de dados principal
* **Prisma** como ORM
* **Mercado Pago Checkout Pro** para pagamentos
* **Plano free em tudo que for possível no início**, entendendo que isso é uma estratégia de validação, não de operação permanente

O objetivo é ter uma solução simples, segura e sustentável para vender no Brasil, com suporte a:

* cartão de crédito
* Pix
* boleto
* parcelamento
* carrinho próprio
* controle de pedidos
* confirmação automática de pagamento
* rastreabilidade mínima de eventos operacionais

---

# 1. Objetivos do projeto

## Objetivos de negócio

* lançar o e-commerce rapidamente
* vender para o público no Brasil
* aceitar os meios de pagamento mais importantes no mercado brasileiro
* reduzir custo de infraestrutura no início
* manter uma base técnica que permita crescimento futuro

## Objetivos técnicos

* separar claramente frontend, backend e pagamentos
* evitar lógica sensível de pagamento no cliente
* manter consistência entre pedido e pagamento
* usar tecnologias com boa integração entre si
* facilitar manutenção, evolução e observabilidade
* garantir trilha mínima de auditoria
* preparar a base para crescimento sem retrabalho estrutural

---

# 2. Stack recomendada

## Frontend e aplicação

### Next.js

Usar **Next.js com App Router**.

Responsabilidades:

* páginas públicas
* catálogo
* busca e filtros básicos
* página de produto
* carrinho
* checkout interno de preparação do pedido
* páginas de status do pedido
* rotas de API server-side

### React

Usado dentro do Next.js para construção da interface.

### TypeScript

Recomendado desde o início para reduzir erros e dar previsibilidade à base do projeto.

## Hospedagem

### Vercel

Usar a Vercel no plano gratuito para o início do projeto.

Responsabilidades:

* deploy do app Next.js
* execução das rotas server-side
* hospedagem do frontend
* variáveis de ambiente
* preview deployments

## Banco de dados

### Supabase Postgres

Usar **PostgreSQL hospedado no Supabase** como coração do sistema.

Responsabilidades:

* persistência relacional transacional
* painel e ferramentas administrativas
* gerenciamento do banco
* recursos auxiliares opcionais do ecossistema Supabase, se necessários no futuro

Observação:

* neste projeto, o foco principal do Supabase é ser o **Postgres gerenciado**
* autenticação, storage e outros recursos podem ser incorporados depois, apenas se fizerem sentido para a operação

## ORM e acesso a dados

### Prisma

Usar Prisma para modelagem do banco e acesso aos dados.

Responsabilidades:

* schema do banco
* migrations
* queries tipadas
* integração limpa com Next.js
* camada de acesso previsível aos dados

## Pagamentos

### Mercado Pago Checkout Pro

Usar checkout hospedado do Mercado Pago.

Responsabilidades:

* processamento de pagamentos
* cartão
* Pix
* boleto
* parcelamento
* ambiente seguro de pagamento
* webhooks para atualização dos pedidos

## Estado do carrinho

### Zustand

Minha recomendação é usar **Zustand** desde o início.

Responsabilidades:

* armazenar itens do carrinho
* atualizar quantidade
* persistir localmente
* facilitar evolução posterior

## Estilo

### Tailwind CSS

Para velocidade de desenvolvimento e manutenção simples do frontend.

---

# 3. Por que essa arquitetura é a melhor para o início

## 3.1. Evita complexidade desnecessária

O maior erro em projetos de e-commerce pequenos é tentar construir tudo do zero:

* checkout próprio
* antifraude caseiro
* conciliação manual improvisada
* lógica inconsistente de pagamento

Com esta arquitetura:

* o site continua sob seu controle
* o carrinho é seu
* o pedido é seu
* a lógica de negócio é sua
* o pagamento é processado por um provedor confiável

## 3.2. Reduz risco técnico

Ao usar Mercado Pago Checkout Pro:

* você não precisa armazenar dados sensíveis de cartão
* reduz o escopo de segurança e conformidade
* acelera a implementação
* diminui a chance de falhas no fluxo de pagamento

## 3.3. Combina melhor com e-commerce real

Postgres é a melhor base para modelar:

* produtos
* pedidos
* itens do pedido
* pagamentos
* eventos
* histórico de status

Esse tipo de dado é naturalmente relacional e transacional.

## 3.4. Permite crescer sem recomeçar

A mesma base serve para evoluir depois com:

* painel administrativo
* cupons
* cálculo de frete automático
* integrações logísticas
* automações de CRM
* métricas de conversão
* conciliação financeira mais sofisticada

---

# 4. Arquitetura geral do sistema

## Fluxo macro

1. cliente navega no catálogo
2. cliente adiciona produtos ao carrinho
3. cliente informa dados básicos de entrega
4. sistema cria um pedido pendente no banco
5. backend cria a preferência de pagamento no Mercado Pago
6. cliente é redirecionado para o checkout do Mercado Pago
7. Mercado Pago processa o pagamento
8. Mercado Pago envia webhook para o backend
9. backend valida a notificação
10. backend registra o evento recebido
11. backend atualiza o pagamento
12. backend atualiza o pedido
13. cliente visualiza o status do pedido

## Componentes principais

### Cliente web

Responsável por:

* navegação
* catálogo
* carrinho
* checkout inicial
* acompanhamento do pedido

### Backend no próprio Next.js

Responsável por:

* criar pedidos
* validar preços
* recalcular total
* gerar checkout no Mercado Pago
* receber webhooks
* atualizar status do pedido

### Banco de dados no Supabase Postgres

Responsável por:

* persistência de produtos
* persistência de pedidos
* persistência de pagamentos
* persistência de eventos
* persistência de históricos operacionais

### Mercado Pago

Responsável por:

* cobrar o cliente
* processar meios de pagamento
* informar o status do pagamento

---

# 5. Arquitetura de pastas sugerida

```txt
src/
  app/
    page.tsx
    produtos/
      [slug]/page.tsx
    carrinho/page.tsx
    checkout/page.tsx
    obrigado/page.tsx
    pedido/
      [publicId]/page.tsx
    api/
      checkout/route.ts
      webhooks/
        mercadopago/route.ts
      orders/
        [publicId]/route.ts
  components/
    layout/
    product/
    cart/
    checkout/
    ui/
  lib/
    prisma.ts
    mercadopago.ts
    validations.ts
    money.ts
    orders.ts
    payments.ts
    idempotency.ts
    logger.ts
  stores/
    cart-store.ts
  types/
    product.ts
    order.ts
    payment.ts
  prisma/
    schema.prisma
```

---

# 6. Modelagem de dados recomendada

## 6.1. Tabela products

Campos sugeridos:

* id
* slug
* sku
* name
* short_description
* description
* price_in_cents
* compare_at_price_in_cents
* currency
* active
* featured
* meta_title
* meta_description
* created_at
* updated_at

## 6.2. Tabela product_images

Campos sugeridos:

* id
* product_id
* url
* alt_text
* sort_order
* created_at

## 6.3. Tabela orders

Campos sugeridos:

* id
* public_id
* customer_name
* customer_email
* customer_phone
* customer_document
* status
* payment_status
* currency
* items_count
* subtotal_in_cents
* shipping_in_cents
* total_in_cents
* payment_provider
* mercadopago_preference_id
* mercadopago_external_reference
* source_channel
* approved_at
* canceled_at
* fulfilled_at
* created_at
* updated_at

## 6.4. Tabela order_items

Campos sugeridos:

* id
* order_id
* product_id
* product_name_snapshot
* product_slug_snapshot
* sku_snapshot
* unit_price_in_cents
* quantity
* line_total_in_cents
* created_at

## 6.5. Tabela shipping_addresses

Campos sugeridos:

* id
* order_id
* recipient_name
* zip_code
* street
* number
* complement
* neighborhood
* city
* state
* country
* created_at
* updated_at

## 6.6. Tabela payments

Campos sugeridos:

* id
* order_id
* provider
* provider_preference_id
* provider_payment_id
* provider_transaction_id
* provider_status
* provider_status_detail
* amount_in_cents
* currency
* payment_method
* paid_at
* status_last_synced_at
* raw_response_json
* created_at
* updated_at

## 6.7. Tabela payment_events

Campos sugeridos:

* id
* order_id
* provider
* event_type
* provider_event_id
* payload_json
* processed_at
* created_at

## 6.8. Tabela order_status_history

Campos sugeridos:

* id
* order_id
* from_status
* to_status
* reason
* source
* metadata_json
* created_at

---

# 7. Status recomendados

## Status do pedido

Os status do pedido devem representar o estado operacional do pedido.

* `draft`
* `pending_payment`
* `confirmed`
* `processing`
* `shipped`
* `delivered`
* `canceled`
* `refunded`

## Status do pagamento

Os status do pagamento devem representar o estado financeiro.

* `pending`
* `approved`
* `rejected`
* `cancelled`
* `expired`
* `refunded`
* `in_dispute`
* `chargeback`

---

# 8. Fluxos principais

## 8.1. Fluxo de navegação e carrinho

1. cliente acessa a página de produto
2. seleciona quantidade
3. adiciona ao carrinho
4. carrinho salva os itens localmente
5. sistema exibe subtotal e resumo

### Observação importante

O carrinho pode ser mantido no navegador inicialmente.

Recomendação:

* usar Zustand com persistência local

## 8.2. Fluxo de criação do pedido

Quando o cliente clicar em finalizar compra:

1. frontend envia os dados para `POST /api/checkout`
2. backend valida o payload
3. backend busca os produtos reais no banco
4. backend recalcula subtotal e total
5. backend cria um snapshot do pedido
6. backend cria o pedido com status `pending_payment`
7. backend cria os itens do pedido
8. backend cria o endereço de entrega
9. backend gera a preferência no Mercado Pago
10. backend salva os identificadores do pagamento
11. backend retorna a URL de checkout
12. frontend redireciona o cliente

## 8.3. Fluxo de pagamento

No ambiente do Mercado Pago, o cliente escolhe:

* Pix
* cartão
* boleto

O provedor processa o pagamento e atualiza o status na própria plataforma.

## 8.4. Fluxo de confirmação por webhook

Esse é um dos fluxos mais importantes do sistema.

1. Mercado Pago envia uma notificação ao endpoint do webhook
2. backend recebe o evento
3. backend registra o payload bruto
4. backend verifica idempotência
5. backend busca os dados oficiais do pagamento no provedor, se necessário
6. backend identifica o pedido correspondente
7. backend atualiza a tabela de payments
8. backend decide a transição de status do pedido
9. backend registra no histórico de status
10. backend marca o evento como processado

## 8.5. Fluxo de página de obrigado

A página de obrigado não deve ser a fonte da verdade do pagamento.

Ela serve apenas para:

* mostrar que o cliente concluiu o processo
* exibir uma mensagem adequada
* instruir o cliente a aguardar confirmação
* redirecionar para a página de acompanhamento do pedido

A confirmação oficial vem do webhook.

---

# 9. Funcionalidades principais que devem existir no MVP

## Catálogo

* listagem de produtos
* página de produto
* imagem principal e imagens adicionais
* descrição objetiva
* preço
* indicação de disponibilidade

## Carrinho

* adicionar item
* remover item
* atualizar quantidade
* calcular subtotal
* persistir localmente

## Checkout inicial

* captura de dados do cliente
* captura do endereço
* resumo do pedido
* botão para pagar

## Pagamentos

* integração com Mercado Pago Checkout Pro
* redirecionamento ao checkout
* retorno visual ao site
* webhook para confirmação real

## Pedidos

* criação de pedido
* acompanhamento por status
* tela de pedido por id público
* histórico mínimo de mudança de status

## Operação mínima

* visualização de pedidos no banco/painel
* atualização de produtos
* rastreabilidade mínima de eventos

---

# 10. Funcionalidades recomendadas para a fase 2

* painel administrativo interno
* autenticação de cliente
* histórico de pedidos do cliente
* cálculo de frete por transportadora
* integração com etiquetas de envio
* cupom de desconto
* produtos relacionados
* recuperação de carrinho abandonado
* e-mails transacionais
* nota fiscal via integração externa
* dashboard de vendas
* conciliação automatizada

---

# 11. API interna recomendada

## `POST /api/checkout`

Responsável por:

* validar payload
* buscar produtos reais
* recalcular valores
* criar pedido e itens
* criar endereço de entrega
* chamar Mercado Pago
* retornar URL de checkout

## `POST /api/webhooks/mercadopago`

Responsável por:

* receber notificações
* registrar payload
* verificar idempotência
* validar pagamento
* atualizar payment
* atualizar pedido
* atualizar histórico

## `GET /api/orders/[publicId]`

Responsável por:

* retornar status resumido do pedido
* retornar informações básicas do pedido
* permitir exibição da página de acompanhamento

---

# 12. Regras críticas de segurança e consistência

## Nunca confiar no frontend para valores

O frontend pode enviar os itens, mas o backend deve:

* buscar preço no banco
* recalcular total
* validar quantidade

## Nunca depender apenas do retorno do checkout

O usuário pode fechar a aba, perder a conexão ou voltar manualmente.

A confirmação oficial é o webhook.

## Proteger segredos

Guardar apenas no servidor:

* access token do Mercado Pago
* credenciais sensíveis do banco
* chaves privadas

## Garantir idempotência

Webhooks podem chegar mais de uma vez.

Seu processamento deve ser seguro para repetição.

## Separar status financeiro de status operacional

Pagamento aprovado não significa pedido enviado.

O sistema deve modelar isso separadamente.

---

# 13. Regras transacionais críticas

Estas regras devem ser tratadas com cuidado desde o início.

## Criação do pedido

A criação do pedido deve ocorrer de forma consistente:

* criar pedido
* criar itens
* criar endereço
* persistir snapshots

Idealmente em uma transação única.

## Processamento de webhook

O webhook deve:

* registrar o evento bruto primeiro
* verificar se já foi processado
* atualizar pagamento
* atualizar pedido
* registrar histórico

## Idempotência

Deve haver proteção contra:

* evento duplicado
* transição duplicada de status

---

# 14. Estratégia de hospedagem e ambiente

## Vercel

Usar a Vercel para:

* produção
* preview
* ambiente de desenvolvimento integrado

## Variáveis de ambiente esperadas

### Aplicação

* `NEXT_PUBLIC_APP_URL`

### Banco

* `DATABASE_URL`
* `DIRECT_URL`

### Mercado Pago

* `MERCADOPAGO_ACCESS_TOKEN`
* `MERCADOPAGO_WEBHOOK_SECRET`

### Outros

* `NODE_ENV`

## Ambientes recomendados

* local
* preview
* production

---

# 15. Estratégia de conexão com banco

## Prisma + Postgres em ambiente serverless

Como a aplicação usará Next.js em hospedagem serverless, a estratégia de conexão com banco deve ser definida desde o início.

### Regras

* usar pooling de conexão adequado
* evitar múltiplas instâncias desnecessárias do Prisma Client
* separar URL de runtime e URL direta para migrations quando necessário
* manter o client singleton no ambiente Node

### Recomendação prática

* `DATABASE_URL` para runtime
* `DIRECT_URL` para migrations e operações administrativas
* centralizar a criação do Prisma Client em `lib/prisma.ts`

---

# 16. Estratégia de desenvolvimento

## Fase 1 — base do projeto

Implementar:

* estrutura Next.js
* Tailwind
* Prisma
* conexão com Postgres
* modelagem inicial
* catálogo estático ou semi-dinâmico

## Fase 2 — carrinho

Implementar:

* store do carrinho
* persistência local
* resumo do pedido

## Fase 3 — pedidos

Implementar:

* criação do pedido no banco
* order items
* endereço de entrega
* histórico inicial

## Fase 4 — pagamentos

Implementar:

* integração com Mercado Pago Checkout Pro
* redirecionamento
* página de retorno
* webhook
* tabela de payment events

## Fase 5 — refinamento

Implementar:

* estados de erro
* logs
* UX do checkout
* SEO das páginas de produto
* reconciliação manual mínima

---

# 17. Estratégia de UX recomendada

## Página de produto

Deve conter:

* nome
* fotos boas
* descrição clara
* preço à vista
* destaque de parcelamento
* botão de compra forte

## Carrinho

Deve conter:

* imagem do item
* nome
* quantidade
* subtotal por item
* subtotal geral
* CTA claro para continuar

## Checkout

Deve conter:

* poucos campos
* mensagem de segurança
* resumo do pedido
* informação clara sobre meios de pagamento

## Pós-compra

Deve conter:

* mensagem clara
* número do pedido
* instrução sobre confirmação do pagamento
* status do pedido

---

# 18. Estratégia de observabilidade mínima

Implementar desde cedo:

* logs de criação de pedido
* logs de falha de integração
* logs de webhook recebido
* logs de transição de status

Idealmente:

* cada pedido deve ter trilha mínima de eventos
* cada pagamento deve ter rastreabilidade básica

---

# 19. Limitações do modo “tudo free”

No início, a stack gratuita é excelente para validar o negócio.

Mas há limites naturais:

* limites de uso da Vercel
* limites de recursos do Supabase
* limites operacionais do plano gratuito
* crescimento de tráfego e armazenamento ao longo do tempo

A estratégia correta é:

* começar grátis
* validar produto e conversão
* subir plano quando houver volume real ou necessidade operacional

---

# 20. Recomendação final consolidada

## Arquitetura final recomendada

* **Frontend:** Next.js
* **Hospedagem:** Vercel
* **Banco:** Supabase Postgres
* **ORM:** Prisma
* **Pagamentos:** Mercado Pago Checkout Pro
* **Estado do carrinho:** Zustand
* **Estilo:** Tailwind CSS

## Estratégia operacional recomendada

* catálogo pequeno
* checkout terceirizado no Mercado Pago
* pedido criado antes do pagamento
* confirmação oficial via webhook
* rastreabilidade mínima desde o MVP

## Prioridades de implementação

### Essenciais

* catálogo
* carrinho
* checkout
* pedido
* webhook
* histórico

### Depois

* painel
* frete
* cupons
* automações

---

# 21. Próximos passos recomendados

1. criar o projeto Next.js
2. criar projeto no Supabase
3. configurar Prisma
4. modelar tabelas iniciais
5. implementar catálogo
6. implementar carrinho
7. implementar criação do pedido
8. integrar Mercado Pago Checkout Pro
9. implementar webhook
10. implementar página de acompanhamento do pedido
11. testar fluxo completo em sandbox
12. colocar em produção

---

# 22. Decisão final sugerida

Se o objetivo é lançar com segurança, baixo custo e boa base técnica, esta é a melhor combinação para o seu caso:

**Next.js + Vercel + Supabase Postgres + Prisma + Mercado Pago Checkout Pro**

Ela é simples o suficiente para começar, mas sólida o suficiente para crescer.

---

# 23. SQL PostgreSQL pronto para rodar no Supabase

```sql
-- enums

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum (
      'draft',
      'pending_payment',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'canceled',
      'refunded'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type payment_status as enum (
      'pending',
      'approved',
      'rejected',
      'cancelled',
      'expired',
      'refunded',
      'in_dispute',
      'chargeback'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'history_source') then
    create type history_source as enum (
      'system',
      'webhook',
      'admin'
    );
  end if;
end $$;

-- updated_at helper

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- products

create table if not exists products (
  id integer generated always as identity primary key,
  slug text not null unique,
  sku text not null unique,
  name text not null,
  short_description text,
  description text,
  price_in_cents integer not null check (price_in_cents >= 0),
  compare_at_price_in_cents integer check (compare_at_price_in_cents is null or compare_at_price_in_cents >= 0),
  currency text not null default 'BRL',
  active boolean not null default true,
  featured boolean not null default false,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_active on products(active);
create index if not exists idx_products_featured on products(featured);

-- product_images

create table if not exists product_images (
  id integer generated always as identity primary key,
  product_id integer not null references products(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product_id on product_images(product_id);

-- orders

create table if not exists orders (
  id integer generated always as identity primary key,
  public_id text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  customer_document text,
  status order_status not null default 'pending_payment',
  payment_status payment_status not null default 'pending',
  currency text not null default 'BRL',
  items_count integer not null default 0 check (items_count >= 0),
  subtotal_in_cents integer not null check (subtotal_in_cents >= 0),
  shipping_in_cents integer not null default 0 check (shipping_in_cents >= 0),
  total_in_cents integer not null check (total_in_cents >= 0),
  payment_provider text not null default 'mercadopago',
  mercadopago_preference_id text,
  mercadopago_external_reference text unique,
  source_channel text not null default 'site',
  approved_at timestamptz,
  canceled_at timestamptz,
  fulfilled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_payment_status on orders(payment_status);
create index if not exists idx_orders_customer_email on orders(customer_email);
create index if not exists idx_orders_created_at on orders(created_at desc);

-- order_items

create table if not exists order_items (
  id integer generated always as identity primary key,
  order_id integer not null references orders(id) on delete cascade,
  product_id integer references products(id) on delete set null,
  product_name_snapshot text not null,
  product_slug_snapshot text,
  sku_snapshot text,
  unit_price_in_cents integer not null check (unit_price_in_cents >= 0),
  quantity integer not null check (quantity > 0),
  line_total_in_cents integer not null check (line_total_in_cents >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_order_items_product_id on order_items(product_id);

-- shipping_addresses

create table if not exists shipping_addresses (
  id integer generated always as identity primary key,
  order_id integer not null unique references orders(id) on delete cascade,
  recipient_name text not null,
  zip_code text not null,
  street text not null,
  number text not null,
  complement text,
  neighborhood text not null,
  city text not null,
  state text not null,
  country text not null default 'BR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_shipping_addresses_order_id on shipping_addresses(order_id);

-- payments

create table if not exists payments (
  id integer generated always as identity primary key,
  order_id integer not null references orders(id) on delete cascade,
  provider text not null,
  provider_preference_id text,
  provider_payment_id text,
  provider_transaction_id text,
  provider_status payment_status not null default 'pending',
  provider_status_detail text,
  amount_in_cents integer not null check (amount_in_cents >= 0),
  currency text not null default 'BRL',
  payment_method text,
  paid_at timestamptz,
  status_last_synced_at timestamptz,
  raw_response_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payments_order_id on payments(order_id);
create index if not exists idx_payments_provider_payment_id on payments(provider_payment_id);
create index if not exists idx_payments_provider_transaction_id on payments(provider_transaction_id);
create index if not exists idx_payments_provider_status on payments(provider_status);

-- payment_events

create table if not exists payment_events (
  id integer generated always as identity primary key,
  order_id integer references orders(id) on delete cascade,
  provider text not null,
  event_type text not null,
  provider_event_id text,
  payload_json jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_payment_events_order_id on payment_events(order_id);
create unique index if not exists uq_payment_events_provider_event_id
  on payment_events(provider, provider_event_id)
  where provider_event_id is not null;

-- order_status_history

create table if not exists order_status_history (
  id integer generated always as identity primary key,
  order_id integer not null references orders(id) on delete cascade,
  from_status order_status,
  to_status order_status not null,
  reason text,
  source history_source not null default 'system',
  metadata_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_status_history_order_id on order_status_history(order_id);
create index if not exists idx_order_status_history_created_at on order_status_history(created_at desc);

-- triggers updated_at

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
before update on products
for each row
execute function set_updated_at();

drop trigger if exists trg_orders_updated_at on orders;
create trigger trg_orders_updated_at
before update on orders
for each row
execute function set_updated_at();

drop trigger if exists trg_shipping_addresses_updated_at on shipping_addresses;
create trigger trg_shipping_addresses_updated_at
before update on shipping_addresses
for each row
execute function set_updated_at();

drop trigger if exists trg_payments_updated_at on payments;
create trigger trg_payments_updated_at
before update on payments
for each row
execute function set_updated_at();
```

---

# Modelos Prisma correspondentes — versão com `Int`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum OrderStatus {
  draft
  pending_payment
  confirmed
  processing
  shipped
  delivered
  canceled
  refunded
}

enum PaymentStatus {
  pending
  approved
  rejected
  cancelled
  expired
  refunded
  in_dispute
  chargeback
}

enum HistorySource {
  system
  webhook
  admin
}

model Product {
  id                    Int           @id @default(autoincrement())
  slug                  String        @unique
  sku                   String        @unique
  name                  String
  shortDescription      String?       @map("short_description")
  description           String?
  priceInCents          Int           @map("price_in_cents")
  compareAtPriceInCents Int?          @map("compare_at_price_in_cents")
  currency              String        @default("BRL")
  active                Boolean       @default(true)
  featured              Boolean       @default(false)
  metaTitle             String?       @map("meta_title")
  metaDescription       String?       @map("meta_description")
  createdAt             DateTime      @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt             DateTime      @updatedAt @map("updated_at") @db.Timestamptz(6)

  images                ProductImage[]
  orderItems            OrderItem[]

  @@map("products")
}

model ProductImage {
  id         Int       @id @default(autoincrement())
  productId  Int       @map("product_id")
  url        String
  altText    String?   @map("alt_text")
  sortOrder  Int       @default(0) @map("sort_order")
  createdAt  DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  product    Product   @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@map("product_images")
}

model Order {
  id                           Int                  @id @default(autoincrement())
  publicId                     String               @unique @map("public_id")
  customerName                 String               @map("customer_name")
  customerEmail                String               @map("customer_email")
  customerPhone                String?              @map("customer_phone")
  customerDocument             String?              @map("customer_document")
  status                       OrderStatus          @default(pending_payment)
  paymentStatus                PaymentStatus        @default(pending) @map("payment_status")
  currency                     String               @default("BRL")
  itemsCount                   Int                  @default(0) @map("items_count")
  subtotalInCents              Int                  @map("subtotal_in_cents")
  shippingInCents              Int                  @default(0) @map("shipping_in_cents")
  totalInCents                 Int                  @map("total_in_cents")
  paymentProvider              String               @default("mercadopago") @map("payment_provider")
  mercadopagoPreferenceId      String?              @map("mercadopago_preference_id")
  mercadopagoExternalReference String?              @unique @map("mercadopago_external_reference")
  sourceChannel                String               @default("site") @map("source_channel")
  approvedAt                   DateTime?            @map("approved_at") @db.Timestamptz(6)
  canceledAt                   DateTime?            @map("canceled_at") @db.Timestamptz(6)
  fulfilledAt                  DateTime?            @map("fulfilled_at") @db.Timestamptz(6)
  createdAt                    DateTime             @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt                    DateTime             @updatedAt @map("updated_at") @db.Timestamptz(6)

  items                        OrderItem[]
  shippingAddress              ShippingAddress?
  payments                     Payment[]
  paymentEvents                PaymentEvent[]
  statusHistory                OrderStatusHistory[]

  @@index([status])
  @@index([paymentStatus])
  @@index([customerEmail])
  @@map("orders")
}

model OrderItem {
  id                  Int       @id @default(autoincrement())
  orderId             Int       @map("order_id")
  productId           Int?      @map("product_id")
  productNameSnapshot String    @map("product_name_snapshot")
  productSlugSnapshot String?   @map("product_slug_snapshot")
  skuSnapshot         String?   @map("sku_snapshot")
  unitPriceInCents    Int       @map("unit_price_in_cents")
  quantity            Int
  lineTotalInCents    Int       @map("line_total_in_cents")
  createdAt           DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  order               Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product             Product?  @relation(fields: [productId], references: [id], onDelete: SetNull)

  @@index([orderId])
  @@index([productId])
  @@map("order_items")
}

model ShippingAddress {
  id            Int       @id @default(autoincrement())
  orderId       Int       @unique @map("order_id")
  recipientName String    @map("recipient_name")
  zipCode       String    @map("zip_code")
  street        String
  number        String
  complement    String?
  neighborhood  String
  city          String
  state         String
  country       String    @default("BR")
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt     DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)

  order         Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@map("shipping_addresses")
}

model Payment {
  id                    Int            @id @default(autoincrement())
  orderId               Int            @map("order_id")
  provider              String
  providerPreferenceId  String?        @map("provider_preference_id")
  providerPaymentId     String?        @map("provider_payment_id")
  providerTransactionId String?        @map("provider_transaction_id")
  providerStatus        PaymentStatus  @default(pending) @map("provider_status")
  providerStatusDetail  String?        @map("provider_status_detail")
  amountInCents         Int            @map("amount_in_cents")
  currency              String         @default("BRL")
  paymentMethod         String?        @map("payment_method")
  paidAt                DateTime?      @map("paid_at") @db.Timestamptz(6)
  statusLastSyncedAt    DateTime?      @map("status_last_synced_at") @db.Timestamptz(6)
  rawResponseJson       Json?          @map("raw_response_json")
  createdAt             DateTime       @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt             DateTime       @updatedAt @map("updated_at") @db.Timestamptz(6)

  order                 Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@index([providerPaymentId])
  @@index([providerTransactionId])
  @@index([providerStatus])
  @@map("payments")
}

model PaymentEvent {
  id              Int       @id @default(autoincrement())
  orderId         Int?      @map("order_id")
  provider        String
  eventType       String    @map("event_type")
  providerEventId String?   @map("provider_event_id")
  payloadJson     Json      @map("payload_json")
  processedAt     DateTime? @map("processed_at") @db.Timestamptz(6)
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  order           Order?    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@unique([provider, providerEventId])
  @@map("payment_events")
}

model OrderStatusHistory {
  id           Int           @id @default(autoincrement())
  orderId      Int           @map("order_id")
  fromStatus   OrderStatus?  @map("from_status")
  toStatus     OrderStatus   @map("to_status")
  reason       String?
  source       HistorySource @default(system)
  metadataJson Json?         @map("metadata_json")
  createdAt    DateTime      @default(now()) @map("created_at") @db.Timestamptz(6)

  order        Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@map("order_status_history")
}
```
