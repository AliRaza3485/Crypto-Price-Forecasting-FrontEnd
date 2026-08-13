"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HistoryResponse } from "@/lib/types";
import { formatDateTime, formatPrice } from "@/lib/format";
import { HistoryPanelSkeleton } from "./Skeletons";

interface HistoryPanelProps {
  data: HistoryResponse | null;
  loading: boolean;
  error: string | null;
}

/** Short axis label, e.g. "2:00 PM" -- date is redundant on a same-day chart. */
function formatAxisTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", { timeStyle: "short" }).format(date);
}

export default function HistoryPanel({ data, loading, error }: HistoryPanelProps) {
  if (loading && !data) return <HistoryPanelSkeleton />;

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-danger-border bg-danger-surface p-6">
        <p className="text-sm font-medium text-danger">Prediction history unavailable</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  // Backend returns newest-first; the chart reads left-to-right chronologically.
  const chronological = [...data.entries].reverse();
  const resolved = chronological.filter((e) => e.actual_price !== null);

  if (chronological.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm font-medium">Predicted vs actual</p>
        <div className="mt-4 rounded-xl border border-dashed border-border bg-surface-muted px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            No prediction history yet — the background logger records one
            prediction per hour, so check back shortly.
          </p>
        </div>
      </div>
    );
  }

  const chartData = chronological.map((e) => ({
    time: formatAxisTime(e.as_of_time),
    fullTime: e.as_of_time,
    predicted: e.predicted_price,
    actual: e.actual_price ?? undefined,
  }));

  const meanAbsError =
    resolved.length > 0
      ? resolved.reduce((sum, e) => sum + Math.abs(e.error ?? 0), 0) / resolved.length
      : null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium">Predicted vs actual</p>
        <div className="flex items-center gap-3 text-xs text-subtle-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
            Predicted
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
            Actual
          </span>
        </div>
      </div>

      <p className="mt-2 text-xs text-subtle-foreground">
        {resolved.length} / {chronological.length} resolved
        {meanAbsError !== null && (
          <> · avg error {formatPrice(meanAbsError)}</>
        )}
      </p>

      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <XAxis
              dataKey="time"
              stroke="var(--subtle-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis
              stroke="var(--subtle-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={["dataMin - 50", "dataMax + 50"]}
              tickFormatter={(value) => formatPrice(Number(value))}
              width={80}
            />
            <Tooltip
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.fullTime
                  ? formatDateTime(payload[0].payload.fullTime)
                  : ""
              }
              formatter={(value, name) => [
                formatPrice(Number(value)),
                name === "predicted" ? "Predicted" : "Actual",
              ]}
              contentStyle={{
                background: "var(--surface-muted)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--foreground)",
              }}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="var(--success)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--success)" }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 border-t border-border pt-4 text-xs text-subtle-foreground">
        Actual price fills in once each prediction&apos;s target hour has
        passed — recent points on the right may still be pending.
      </p>
    </div>
  );
}
