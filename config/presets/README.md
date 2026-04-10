# White-label Presets

These files are deployment presets for Railway or other env-based hosting targets.

Rules:
- Prefer `LIFI_API_KEY` over `NEXT_PUBLIC_LIFI_API_KEY`.
- Keep `NEXT_PUBLIC_LIFI_API_KEY` only as a migration fallback if an older deployment still expects it.
- Replace every `__FILL_ME__` placeholder before production rollout.
- Pair these presets with dedicated RPC URLs for each supported chain.

Suggested usage on Railway:

```bash
railway variables set --file ./config/presets/modcrosschain.production.env
```

For partners, start from a partner preset and adjust:
- brand name
- support URL
- product URL
- app URL
- fee disclosure copy inputs
- analytics and Sentry IDs
