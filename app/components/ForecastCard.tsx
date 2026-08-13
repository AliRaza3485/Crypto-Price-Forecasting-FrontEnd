"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LiveForecastResponse } from "@/lib/types";
import { formatDateTime, formatPrice, formatSignedPercent } from "@/lib/format";
import { ForecastCardSkeleton } from "./Skeletons";

interface ForecastCardProps {
  data: LiveForecastResponse | null;
  loading: boolean;
  error: string | null;
}

export default function ForecastCard({ data, loading, error }: ForecastCardProps) {
  if (loading && !data) return <ForecastCardSkeleton />;

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-danger-border bg-danger-surface p-6">
        <p className="text-sm font-medium text-danger">Forecast unavailable</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const up = data.predicted_return > 0;
  const flat = data.predicted_return === 0;
  const trendColor = flat
    ? "text-muted-foreground"
    : up
      ? "text-success"
      : "text-danger";

  const chartData = [
    { label: "Now", price: data.current_price },
    { label: "Next hour", price: data.predicted_price },
  ];

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Current price */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Current BTC price
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {formatPrice(data.current_price)}
          </p>
          <p className="mt-1 text-xs text-subtle-foreground">
            As of {formatDateTime(data.as_of_time)}
          </p>
        </div>

        {/* Predicted price */}
        <div className="sm:border-l sm:border-border sm:pl-6">
          <p className="text-sm font-medium text-muted-foreground">
            Predicted next-hour price
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {formatPrice(data.predicted_price)}
          </p>
          <p className={`mt-1 flex items-center gap-1 text-sm font-medium ${trendColor}`}>
            <span aria-hidden>{flat ? "→" : up ? "↑" : "↓"}</span>
            {formatSignedPercent(data.predicted_return)}
          </p>
          <p className="mt-1 text-xs text-subtle-foreground">
            For {formatDateTime(data.predicted_for_time)}
          </p>
        </div>
      </div>

      {/* Mini chart */}
      <div className="mt-6 h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <XAxis
              dataKey="label"
              stroke="var(--subtle-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis hide domain={["dataMin - 50", "dataMax + 50"]} />
            <Tooltip
              formatter={(value) => formatPrice(Number(value))}
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
              dataKey="price"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--primary)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 border-t border-border pt-4 text-xs text-subtle-foreground">
        Hourly BTC price movement is close to a random walk — this next-hour
        forecast is an engineering demo of the pipeline, not a trading signal.
      </p>
    </div>
  );
}
