# Contexto oficial — jp-cashflow (FrontEnd)

Este documento define **o fluxo oficial de navegação/autenticação**, o papel do **middleware do App**, e as **regras de integração** com a API (**api-cashflow**).

---

## 1) Visão geral

O **jp-cashflow** é o **FrontEnd** do SaaS e roda em modo **multi-tenant por subdomínio**.

- **Sem subdomínio** (domínio raiz / “público”): rotas públicas.
- **Com subdomínio** (ex.: `usuario.jp-cashflow.app` / `usuario.localhost:3000`): carrega o aplicativo do usuário e aplica regras de acesso.

A autenticação é baseada em **cookie `token` (JWT)** e validações de:

1. **Subdomínio existe/é válido** (validação via API pública).
2. **Token existe e é válido**.
3. **Login contido no token corresponde ao subdomínio acessado**.

---

## 2) Middleware do App (FrontEnd)

Arquivo: `src/middleware.ts`

### Objetivo
Detectar **subdomínio**, organizar o fluxo inicial e reduzir acesso indevido ao `/login` quando o usuário já está autenticado.

### Regras oficiais

1. Lê `host` e extrai `hostname` (sem porta).
2. Identifica se é `localhost`.
3. Extrai **subdomínio**:
   - **Dev**: `jp.localhost:3000` → subdomínio `jp`
   - **Prod**: `jp.jp-cashflow.app` → subdomínio `jp`
4. Se **há subdomínio** e não é `www`:
   - Se o path for `/` → **rewrite** para `/inicio`.
   - Se o path for `/login` e existir cookie `token` → **redirect** para `/dashboard`.
   - Caso contrário → **rewrite** da URL (mantém o caminho).
5. Se **não há subdomínio** → segue normal com `NextResponse.next()`.

### matcher

`matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"]`

- **Não intercepta**:
  - `/api/*` (rotas internas do próprio front)
  - `/_next/*` (assets)
  - `favicon.ico`
  - arquivos estáticos (qualquer coisa com extensão)

---

## 3) Fluxo oficial — / → /inicio

### 3.1 Entrada

Quando o usuário acessa `https://<subdominio>.<dominio>/`:

- O middleware detecta o subdomínio e reescreve `/` → `/inicio`.

### 3.2 Página `/inicio` (Server/Client)

Arquivo: `src/app/(app)/inicio/page.tsx`

Responsabilidades oficiais:

1. Extrair o **subdomínio** do host.
2. Chamar a API pública para validar se o **login/subdomínio existe** (ex.: POST `/validaSubdominio`).
3. Se o subdomínio **não for válido** → redirecionar para o domínio público (`/`).
4. Se existir cookie `token`:
   - Decodificar o token.
   - Se `loginDoToken === subdominio` → redirecionar para `/dashboard`.
   - Se `loginDoToken !== subdominio` → redirecionar para `/login?user=<SUBDOMINIO>` (força logout).
5. Se **não existir token** → redirecionar para `/login?user=<SUBDOMINIO>`.

---

## 4) Fluxo oficial — /login

Arquivo: `src/app/(app)/login/page.tsx`

Responsabilidades oficiais:

1. Ler cookie `token`.
2. Decodificar com `decodeToken`.
3. Ler o parâmetro `user` da URL (`/login?user=JP`) e normalizar para **caixa alta**.
4. Se **já estiver logado** e **não** existir `?user`:
   - Redirecionar para `/dashboard` (evitar loop).
5. Se **já estiver logado** e `loginDoToken === user`:
   - Redirecionar para `/dashboard`.
6. Se **já estiver logado** mas `loginDoToken !== user`:
   - Renderizar `<ForceLogout user={urlUser} />`.
7. Se **não estiver logado**:
   - Exibir formulário de login `<LoginForm defaultLogin={urlUser} />`.

---

## 5) Fluxo oficial — ForceLogout

Arquivo: `src/app/(app)/_components/ForceLogout.tsx`

Responsabilidades oficiais:

1. Remover cookie `token` (ex.: `document.cookie = "token=; Max-Age=0;"`).
2. Limpar estado do contexto global:
   - `usuarioId`, `usuarioLogin`, `usuarioNome`, `usuarioPerfil`
   - `emailVerificacao`, `codigoVerificacao`
3. Redirecionar para `/login?user=<SUBDOMINIO>` (ex.: `router.replace`).

---

## 6) Fluxo oficial — /dashboard

Arquivos:
- `src/app/(app)/dashboard/page.tsx` (Server Component)
- `src/app/(app)/dashboard/_components/DashboardClient.tsx` (Client)

Responsabilidades oficiais:

1. **Server Component**
   - Lê cookie `token`.
   - Valida com `decodeToken`.
   - Se inválido/ausente → redireciona para `/login`.
   - Se válido → renderiza `<DashboardClient />`.

2. **Client Component (DashboardClient)**
   - Envolve conteúdo com o provider/contexto do dashboard.
   - Renderiza gráficos/cards.

---

## 7) Regras oficiais de consumo de API (api-cashflow)

### Token
- Requisições a endpoints privados devem enviar:

`Authorization: Bearer <token>`

### Onde buscar token
- Client-side: usar helper (ex.: `getTokenFromCookie` / `getToken.ts`).

### Padrão dos gráficos
- Cada gráfico chama uma função do tipo `RetEstatistica... (periodoId)`.
- A função faz `fetch` na API e alimenta o contexto.

---

## 8) Rotas internas `/app/api/*` do FrontEnd

Existe um conjunto de rotas internas do Next em:

`src/app/api/*`

Essas rotas **não passam pelo middleware do App** (por causa do matcher).

Regra do projeto:
- **Manter somente o que for estritamente necessário ao FrontEnd** (ex.: ponte server-side, redirect interno, e-mails do próprio front, etc.).
- **Evitar duplicar endpoints de dados do domínio financeiro** que já existem na **api-cashflow**.

---

## 9) Pontos críticos para evitar quebra/loop

1. **Subdomínio + token divergente**
   - Deve cair no ForceLogout e voltar para `/login?user=<subdominio>`.

2. **/login com token**
   - Middleware manda para `/dashboard`.

3. **/inicio sempre valida subdomínio**
   - Se subdomínio inválido, volta pro domínio público.

4. **Normalização de login**
   - Comparações devem usar **caixa alta** para consistência.

---

## 10) Referências (documentos de fluxo)

- “Fluxo Inicial CashFlow.pdf”
- “fluxo rotas com API CashFlow.pdf”

