"use client";

import { formatClockTime } from "@/lib/format";

const BACKEND_REPO_URL = "https://github.com/AliRaza3485/Crypto-Price-Forecasting-MLops";
// TODO: confirm the actual frontend repo URL — this is a placeholder and
// may not match the real repo name/owner. Update once confirmed.
const FRONTEND_REPO_URL = "https://github.com/AliRaza3485/Crypto-Forecasting-Frontend";

interface FooterProps {
  lastUpdated: Date | null;
}

export default function Footer({ lastUpdated }: FooterProps) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium">RandomForest · MLflow registry @ DagsHub</p>
            <p className="mt-1 text-xs text-subtle-foreground">
              {lastUpdated
                ? `Last updated ${formatClockTime(lastUpdated)}`
                : "Waiting for first update…"}
            </p>
          </div>

          <nav className="flex items-center gap-5 text-sm">
            <a
              href={BACKEND_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Backend repo ↗
            </a>
            <a
              href={FRONTEND_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Frontend repo ↗
            </a>
          </nav>
        </div>

        <p className="mt-6 text-xs text-subtle-foreground">
          MLOps engineering showcase — not a trading system. Forecasts and
          drift metrics are for demonstration purposes only.
        </p>
      </div>
    </footer>
  );
}
