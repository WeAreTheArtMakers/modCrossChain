<p align="center">
  <img src="./public/brand/modcrosschain-wordmark.svg" alt="modCrossChain" width="320" />
</p>

<p align="center">
  Non-custodial cross-chain bridge UI powered by LI.FI, wagmi, viem, and Next.js.
</p>

<p align="center">
  <a href="https://modcrosschain-production.up.railway.app">Live App</a>
  ·
  <a href="https://wearetheartmakers.github.io/modCrossChain/">GitHub Pages</a>
  ·
  <a href="https://wearetheartmakers.github.io/modCrossChain/terms.html">Terms</a>
  ·
  <a href="https://wearetheartmakers.github.io/modCrossChain/jurisdictions.html">Jurisdictions</a>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js_16-App_Router-0b0b0d?style=for-the-badge&logo=next.js&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React_19-Client_UI-111827?style=for-the-badge&logo=react&logoColor=61dafb">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-Strict-10223a?style=for-the-badge&logo=typescript&logoColor=3178c6">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/TailwindCSS_4-Dark_UI-082f49?style=for-the-badge&logo=tailwindcss&logoColor=38bdf8">
  <img alt="wagmi" src="https://img.shields.io/badge/wagmi-Wallets-22182e?style=for-the-badge&logo=walletconnect&logoColor=c8b4ff">
  <img alt="LI.FI" src="https://img.shields.io/badge/LI.FI-Aggregator-1c1025?style=for-the-badge&logoColor=white">
</p>

## Overview

modCrossChain is a wallet-native bridge frontend for Ethereum, BNB Chain, Polygon, Base, Arbitrum, and Avalanche. It uses the LI.FI aggregator SDK for route discovery and execution, keeps signing inside the user's wallet, and avoids custom bridge protocol logic entirely.

The UI stays focused on execution: a bridge card paired with a live desktop showcase panel, visible fee disclosure, route comparison for cheapest / fastest / best received, a net-after-fees metric, a transaction modal with copy-hash and retry actions, route risk and low-liquidity warnings, and local browser history for recent bridge attempts.

![modCrossChain desktop preview](./docs/assets/bridge-desktop.png)

## Product Surface

- Connect with a browser-injected wallet or WalletConnect.
- Select source chain, destination chain, token, amount, and route preference.
- Compare cheapest, fastest, and best received routes.
- Auto-fetch quotes after a 500 ms debounce.
- Show estimated gas, bridge fee, platform fee, receive amount, ETA, and route steps.
- Filter source tokens by destination support before the user requests a route.
- Score route risk and surface low-liquidity pressure before execution.
- Execute the selected route through LI.FI with client-side wallet prompts.
- Gate execution with live RPC health checks for the source and destination chains.
- Track the execution result, transaction hash, copy action, explorer link, and failure retry flow.
- Persist recent transfer attempts in local browser storage, including low-liquidity warnings and net-after-fees context.
- Support white-label brand copy, colors, and app URLs through env configuration.
- Include Sentry and GA4 hooks that can be enabled without further code changes.
- Protect `/api/lifi/*` with Upstash-backed rate limiting and short-lived response caches when Redis env vars are present.
- Expose an admin-only LI.FI diagnostics screen for API key, integrator, fee, and withdraw checks.
- Link to in-app Terms and Supported Jurisdictions pages.

## Stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript |
| Wallets | wagmi, viem, injected wallet, WalletConnect |
| Bridge Aggregation | LI.FI SDK |
| State | Zustand |
| Local persistence | Browser localStorage |
| Observability | Sentry, GA4-ready client hooks |
| Hosting | Railway |
| Product landing | GitHub Pages |

## Screens

<p align="center">
  <img src="./docs/assets/bridge-mobile.png" alt="modCrossChain mobile preview" width="280" />
</p>

## Supported Chains

- Ethereum
- BNB Chain
- Polygon
- Base
- Arbitrum
- Avalanche

The chain list is centralized and easy to extend through [lib/chains.ts](/Users/bg/Desktop/modBridge/lib/chains.ts).

## Security Model

- Non-custodial by default.
- No private keys, mnemonics, or backend signer.
- Token addresses validated before route requests.
- Zero and invalid amounts rejected client-side.
- Slippage applied explicitly to route requests.
- Integrator fee support can be enabled without changing the custody model.
- LI.FI API calls can be proxied through Next.js route handlers so the API key remains server-side.
- Terms and jurisdiction notices are visible from the app entrypoint.

## Monetization

LI.FI supports integrator fees. This repo includes UI disclosure and route integration through `NEXT_PUBLIC_LIFI_FEE`.

Suggested production starting range:

- `0.001` to `0.0035` (`0.10%` to `0.35%`)
- current recommended starting point: `0.0015` (`0.15%`)

Example:

```bash
NEXT_PUBLIC_LIFI_FEE=0.0015
NEXT_PUBLIC_MIN_PLATFORM_FEE_NOTICE_USD=0.50
```

Notes:

- The fee row is shown directly in the route panel.
- The small-transfer minimum fee is a disclosure target only in the current non-custodial flow.
- A true fixed minimum fee would require additional architecture and legal review; this repo intentionally preserves wallet-only execution.

Additional monetization layers prepared in product copy and roadmap:

- premium route analytics
- white-label bridge deployments for partners
- affiliate and referral campaigns
- API or key-backed pro dashboard

## Legal Pages

The repo now includes:

- in-app draft terms: [app/terms/page.tsx](/Users/bg/Desktop/modBridge/app/terms/page.tsx)
- in-app jurisdiction notice: [app/jurisdictions/page.tsx](/Users/bg/Desktop/modBridge/app/jurisdictions/page.tsx)
- GitHub Pages terms: [docs/terms.html](/Users/bg/Desktop/modBridge/docs/terms.html)
- GitHub Pages jurisdictions: [docs/jurisdictions.html](/Users/bg/Desktop/modBridge/docs/jurisdictions.html)

These are operational draft texts and should be reviewed by counsel before production launch.

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
LIFI_API_KEY=
NEXT_PUBLIC_LIFI_API_KEY=
NEXT_PUBLIC_LIFI_INTEGRATOR=modcrosschain
NEXT_PUBLIC_DEFAULT_SLIPPAGE=0.005
NEXT_PUBLIC_LIFI_FEE=0.0015
NEXT_PUBLIC_MIN_PLATFORM_FEE_NOTICE_USD=0.50
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.15
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
ADMIN_DIAGNOSTICS_TOKEN=
NEXT_PUBLIC_ETHEREUM_RPC_URL=
NEXT_PUBLIC_BNB_RPC_URL=
NEXT_PUBLIC_POLYGON_RPC_URL=
NEXT_PUBLIC_BASE_RPC_URL=
NEXT_PUBLIC_ARBITRUM_RPC_URL=
NEXT_PUBLIC_AVALANCHE_RPC_URL=
NEXT_PUBLIC_BRAND_NAME=modCrossChain
NEXT_PUBLIC_BRAND_TAGLINE=Non-custodial cross-chain bridge
NEXT_PUBLIC_BRAND_HEADLINE=Route capital across six networks without leaving the wallet.
NEXT_PUBLIC_BRAND_SUBHEAD=Live LI.FI quotes, wallet-native execution, visible fees, and faster route selection for real transfer flow.
NEXT_PUBLIC_BRAND_ACCENT=#ba9eff
NEXT_PUBLIC_BRAND_SECONDARY=#64f1ff
NEXT_PUBLIC_PRODUCT_URL=https://wearetheartmakers.github.io/modCrossChain/
NEXT_PUBLIC_SUPPORT_URL=https://wearetheartmakers.github.io/modCrossChain/
```

Operational notes:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is required for WalletConnect support.
- `LIFI_API_KEY` should be set server-side in production. Do not expose it in `NEXT_PUBLIC_*`.
- `NEXT_PUBLIC_LIFI_INTEGRATOR` must exactly match the string shown in the LI.FI portal. For this app, use `modcrosschain`.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` enable shared rate limiting and response caching across Railway instances.
- dedicated RPC endpoints are recommended for production reliability and now fall back to public RPCs if any chain is missing.
- `NEXT_PUBLIC_APP_URL` should match the production domain so wallet metadata is accurate.
- `NEXT_PUBLIC_LIFI_FEE` is optional but now fully surfaced in the UI.
- `NEXT_PUBLIC_ENABLE_TEST_WALLET=true` enables the mock connector used by Playwright.
- `NEXT_PUBLIC_LIFI_API_KEY` is supported only as a migration fallback. Production should prefer `LIFI_API_KEY`.
- `ADMIN_DIAGNOSTICS_TOKEN` protects `/admin/lifi?token=...` so diagnostics stay off the public surface.

## Scripts

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
npm run start
```

## Railway Deployment

```bash
railway login
railway link
railway variable set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
railway variable set LIFI_API_KEY=your_lifi_api_key
railway variable set NEXT_PUBLIC_LIFI_INTEGRATOR=modcrosschain
railway variable set NEXT_PUBLIC_LIFI_FEE=0.0015
railway variable set NEXT_PUBLIC_MIN_PLATFORM_FEE_NOTICE_USD=0.50
railway variable set NEXT_PUBLIC_APP_URL=https://your-domain.example
railway variable set UPSTASH_REDIS_REST_URL=your_upstash_rest_url
railway variable set UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token
railway variable set ADMIN_DIAGNOSTICS_TOKEN=your_private_admin_token
railway variable set NIXPACKS_NODE_VERSION=22
railway up
```

`NIXPACKS_NODE_VERSION=22` is pinned so Railway uses a Node version compatible with Next.js 16.

## White-label Presets

Preset files live in [config/presets](/Users/bg/Desktop/modBridge/config/presets):

- [modcrosschain.production.env](/Users/bg/Desktop/modBridge/config/presets/modcrosschain.production.env)
- [partner-aurora.production.env](/Users/bg/Desktop/modBridge/config/presets/partner-aurora.production.env)
- [partner-vector.production.env](/Users/bg/Desktop/modBridge/config/presets/partner-vector.production.env)

They are designed for Railway variable imports and partner-specific branding rollouts.

## Development Priorities

- Sentry DSN, release upload credentials, and analytics IDs in the production environment.
- Dedicated RPC URLs from a provider such as Alchemy, QuickNode, or Ankr for every supported chain.
- Verify LI.FI integrator fee activation against the exact `NEXT_PUBLIC_LIFI_INTEGRATOR` slug used by the app.
- White-label packs per partner deployment, including brand assets, support URL, and fee policy copy.
- Token destination override instead of symbol-first resolution.
- Optional notifications for route completion and failure follow-up.
