"use client";

import type { HealthResponse } from "@/lib/types";

interface StatusPillProps {
  loading: boolean;
  health: HealthResponse | null;
  error: string | null;
}

export default function StatusPill({ loading, health, error }: StatusPillProps) {
  if (loading && !health && !error) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        <span className="h-2 w-2 animate-pulse rounded-full bg-subtle-foreground" />
        Checking backend…
      </span>
    );
  }

  const healthy = !!health && health.status === "ok" && health.model_available;

  if (!healthy) {
    const reason = error
      ? "Unreachable"
      : health && !health.model_available
        ? "Model unavailable"
        : "Degraded";
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-danger-border bg-danger-surface px-3 py-1 text-xs font-medium text-danger">
        <span className="h-2 w-2 rounded-full bg-danger" />
        {reason}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
      <span className="h-2 w-2 rounded-full bg-success" />
      Backend online
    </span>
  );
}
