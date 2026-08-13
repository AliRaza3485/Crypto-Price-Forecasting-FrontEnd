# BTC Forecast Monitor — Frontend

A production-quality Next.js dashboard for a live **BTC price-forecasting MLOps** project. It surfaces the whole MLOps loop — the live next-hour forecast **and** the health of the pipeline (backend availability, model status, data drift) — not just a price number.

> **This is an MLOps engineering showcase, not a trading system.** Hourly crypto price movement is close to a random walk; the point of this project is the pipeline, not alpha.

![Tech](https://img.shields.io/badge/Next.js-16-black) ![Tech](https://img.shields.io/badge/TypeScript-strict-blue) ![Tech](https://img.shields.io/badge/Tailwind-v4-38bdf8)

## Features

- **Live forecast card** — current BTC price, predicted next-hour price, signed % return with up/down color, and a small Recharts line comparing the two points.
- **Backend status pill** — green only when `/health` reports `status: ok` **and** `model_available: true`.
- **Drift monitoring panel** — overall "No drift" / "Drift detected" badge, `n_drifted / n_features`, and a per-feature table (PSI, level chip, KS p-value). Gracefully shows a friendly empty-state if the backend returns `503` (drift reference not shipped to prod yet) instead of crashing.
- **Auto-refresh every 60s** + manual **Refresh** button, without ever wiping the dashboard back to a loading state — stale data stays visible while a background refresh is in flight.
- **Skeleton loading states** and robust error handling for every panel independently (one endpoint failing doesn't take down the others).
- Responsive, dark-mode-friendly UI.

## Architecture — why the proxy exists

The frontend is served over **HTTPS** (Vercel). The FastAPI backend on EC2 is plain **HTTP**. A browser blocks HTTPS → HTTP requests as "mixed content", so the browser can never call the EC2 IP directly.

```
Browser ──HTTPS──▶ /api/health        ──▶ Next.js Route Handler ──HTTP──▶ ${BACKEND_URL}/health
Browser ──HTTPS──▶ /api/predict-live  ──▶ Next.js Route Handler ──HTTP──▶ ${BACKEND_URL}/predict/live
Browser ──HTTPS──▶ /api/drift         ──▶ Next.js Route Handler ──HTTP──▶ ${BACKEND_URL}/monitoring/drift
```

All three route handlers live under [`app/api/`](app/api/) and share one helper, [`lib/backend.ts`](lib/backend.ts), which:

- reads `BACKEND_URL` **server-side only** (no `NEXT_PUBLIC_` prefix — the raw EC2 IP never reaches the client bundle),
- applies a 10s timeout so a hung backend can't hang the dashboard,
- normalizes network errors, timeouts, and non-JSON bodies into a consistent `{ ok, status, body }` shape,
- forwards the upstream status code as-is (important for `/monitoring/drift`, which may legitimately return `503`).

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure the backend URL:

   ```bash
   cp .env.example .env.local
   ```

   | Variable      | Scope       | Purpose                                                         |
   | ------------- | ----------- | ---------------------------------------------------------------- |
   | `BACKEND_URL` | Server only | Base URL of the FastAPI backend, e.g. `http://<ELASTIC_IP>:8000` |

   **Do not** prefix this with `NEXT_PUBLIC_` — it must stay server-only so the EC2 IP is never exposed to the browser.

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Go to **Project → Settings → Environment Variables** and add:
   - `BACKEND_URL` = `http://<ELASTIC_IP>:8000` (apply to Production, Preview, and Development as needed)
3. Deploy. No other configuration is required — the App Router route handlers run as serverless functions automatically.

If you later put the backend behind HTTPS (e.g. Nginx + a real cert, or an ALB), you can swap the proxy for a direct client-side call and drop the route handlers — but as long as the backend is plain HTTP, keep the proxy.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # lint
```

## Tech stack

**Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS v4, Recharts.
**Backend (separate repo):** FastAPI, XGBoost/RandomForest, MLflow (registry on DagsHub), Docker, AWS EC2.

## Related repositories

- Backend API: `https://github.com/AliRaza3485/Crypto-Price-Forecasting-MLops`
<!-- TODO: confirm the actual frontend repo URL and replace the line below -->
- Frontend (this repo): `https://github.com/AliRaza3485/Crypto-Forecasting-Frontend`

---

Forecasts and drift metrics are produced by a machine learning pipeline for demonstration purposes only. This is not financial or trading advice.
