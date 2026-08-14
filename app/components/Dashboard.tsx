"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ApiError,
  DriftResponse,
  HealthResponse,
  HistoryResponse,
  LiveForecastResponse,
  ModelInfoResponse,
} from "@/lib/types";
import StatusPill from "./StatusPill";
import ModelInfo from "./ModelInfo";
import ForecastCard from "./ForecastCard";
import DriftPanel from "./DriftPanel";
import HistoryPanel from "./HistoryPanel";
import Footer from "./Footer";

const POLL_INTERVAL_MS = 60_000;

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function initialState<T>(): FetchState<T> {
  return { data: null, loading: true, error: null };
}

/** Parses a fetch Response from one of our own /api/* routes. */
async function readJson<T>(res: Response): Promise<{ ok: boolean; status: number; body: T | ApiError }> {
  let body: T | ApiError;
  try {
    body = (await res.json()) as T | ApiError;
  } catch {
    body = { error: "Received an unreadable response." };
  }
  return { ok: res.ok, status: res.status, body };
}

export default function Dashboard() {
  const [health, setHealth] = useState<FetchState<HealthResponse>>(initialState);
  const [modelInfo, setModelInfo] = useState<FetchState<ModelInfoResponse>>(initialState);
  const [forecast, setForecast] = useState<FetchState<LiveForecastResponse>>(initialState);
  const [drift, setDrift] = useState<FetchState<DriftResponse>>(initialState);
  const [driftUnavailable, setDriftUnavailable] = useState(false);
  const [history, setHistory] = useState<FetchState<HistoryResponse>>(initialState);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const isFirstLoad = useRef(true);

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    if (!isFirstLoad.current) {
      // Keep showing stale data while a background refresh is in flight —
      // only flip `loading` back on for the very first fetch.
    }

    const [healthRes, modelInfoRes, forecastRes, driftRes, historyRes] = await Promise.all([
      fetch("/api/health", { cache: "no-store" }),
      fetch("/api/model-info", { cache: "no-store" }),
      fetch("/api/predict-live", { cache: "no-store" }),
      fetch("/api/drift", { cache: "no-store" }),
      fetch("/api/history", { cache: "no-store" }),
    ]);

    const [healthJson, modelInfoJson, forecastJson, driftJson, historyJson] = await Promise.all([
      readJson<HealthResponse>(healthRes),
      readJson<ModelInfoResponse>(modelInfoRes),
      readJson<LiveForecastResponse>(forecastRes),
      readJson<DriftResponse>(driftRes),
      readJson<HistoryResponse>(historyRes),
    ]);

    setHealth({
      data: healthJson.ok ? (healthJson.body as HealthResponse) : null,
      loading: false,
      error: healthJson.ok ? null : (healthJson.body as ApiError).error,
    });

    setModelInfo({
      data: modelInfoJson.ok ? (modelInfoJson.body as ModelInfoResponse) : null,
      loading: false,
      error: modelInfoJson.ok ? null : (modelInfoJson.body as ApiError).error,
    });

    setForecast({
      data: forecastJson.ok ? (forecastJson.body as LiveForecastResponse) : null,
      loading: false,
      error: forecastJson.ok ? null : (forecastJson.body as ApiError).error,
    });

    if (driftJson.status === 503) {
      setDriftUnavailable(true);
      setDrift({ data: null, loading: false, error: null });
    } else {
      setDriftUnavailable(false);
      setDrift({
        data: driftJson.ok ? (driftJson.body as DriftResponse) : null,
        loading: false,
        error: driftJson.ok ? null : (driftJson.body as ApiError).error,
      });
    }

    setHistory({
      data: historyJson.ok ? (historyJson.body as HistoryResponse) : null,
      loading: false,
      error: historyJson.ok ? null : (historyJson.body as ApiError).error,
    });

    setLastUpdated(new Date());
    setRefreshing(false);
    isFirstLoad.current = false;
  }, []);

  useEffect(() => {
    // Intentional: kick off the first fetch + a 60s poll. fetchAll is async,
    // so its setState calls run after this effect body has finished.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
    const id = setInterval(fetchAll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchAll]);

  return (
    <>
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-10">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                BTC Forecast Monitor
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                MLOps engineering showcase — not a trading system.
              </p>
              <div className="mt-2">
                <ModelInfo data={modelInfo.data} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StatusPill loading={health.loading} health={health.data} error={health.error} />
              <button
                onClick={fetchAll}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span
                  className={`inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent ${refreshing ? "animate-spin" : ""}`}
                  aria-hidden
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Forecast */}
          <div className="mt-6">
            <ForecastCard data={forecast.data} loading={forecast.loading} error={forecast.error} />
          </div>

          {/* Drift */}
          <div className="mt-6">
            <DriftPanel
              data={drift.data}
              loading={drift.loading}
              unavailable={driftUnavailable}
              error={drift.error}
            />
          </div>

          {/* History */}
          <div className="mt-6">
            <HistoryPanel data={history.data} loading={history.loading} error={history.error} />
          </div>
        </div>
      </main>

      <Footer lastUpdated={lastUpdated} />
    </>
  );
}
