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
  <a href="#getting-started">Local Setup</a>
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

modCrossChain is a wallet-native bridge frontend for Ethereum, BNB Chain, and Polygon. It uses the LI.FI aggregator SDK for route discovery and execution, keeps signing inside the user's wallet, and avoids custom bridge protocol logic entirely.

The UI is intentionally compact: one centered bridge card, fast route feedback, clear fee visibility, and a transaction status flow that follows execution end to end.

![modCrossChain desktop preview](./docs/assets/bridge-desktop.png)

## Product Surface

- Connect wallet with injected providers and WalletConnect.
- Select source chain, destination chain, token, amount, and route preference.
- Auto-fetch cheapest or fastest route after a 500 ms debounce.
- Show estimated gas, bridge fee, receive amount, ETA, and route steps.
- Execute the selected route through LI.FI with client-side wallet prompts.
- Track the execution result, transaction hash, and explorer link.
- Keep the supported network list configurable and easy to extend.

## Stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript |
| Wallets | wagmi, viem, MetaMask, WalletConnect |
| Bridge Aggregation | LI.FI SDK |
| State | Zustand |
| Hosting | Railway |
| Product Landing | GitHub Pages |

## Screens

<p align="center">
  <img src="./docs/assets/bridge-mobile.png" alt="modCrossChain mobile preview" width="280" />
</p>

## Security Model

- Non-custodial by default.
- No private keys, mnemonics, or backend signer.
- Token addresses validated before route requests.
- Zero and invalid amounts rejected client-side.
- Slippage applied explicitly to route requests.
- Integrator fee support can be enabled without changing the custody model.

## Monetization

LI.FI supports integrator fees. This repo includes optional support through `NEXT_PUBLIC_LIFI_FEE`.

Example:

```bash
NEXT_PUBLIC_LIFI_FEE=0.0025
```

That value represents a 0.25% fee routed through LI.FI's integrator flow. For production use, this should be disclosed clearly in the UI and validated against LI.FI's current integrator requirements.

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
NEXT_PUBLIC_LIFI_API_KEY=
NEXT_PUBLIC_LIFI_INTEGRATOR=modCrossChain
NEXT_PUBLIC_DEFAULT_SLIPPAGE=0.005
NEXT_PUBLIC_LIFI_FEE=
NEXT_PUBLIC_ETHEREUM_RPC_URL=
NEXT_PUBLIC_BNB_RPC_URL=
NEXT_PUBLIC_POLYGON_RPC_URL=
```

Notes:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is required for WalletConnect support.
- `NEXT_PUBLIC_LIFI_API_KEY` is optional but recommended for production rate limits.
- RPC variables are optional; public endpoints are used if omitted.
- `NEXT_PUBLIC_LIFI_FEE` is optional and disabled by default.

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
railway variables set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
railway variables set NIXPACKS_NODE_VERSION=22
railway up
```

`NIXPACKS_NODE_VERSION=22` is recommended so Railway builds with a Node version compatible with Next.js 16.

## Roadmap

- Route comparison view for cheapest, fastest, and best received.
- Persistent transaction history in local storage.
- Destination token override instead of symbol-only matching.
- Integrator analytics and conversion tracking.
- Better route risk labelling and warnings for low-liquidity paths.
