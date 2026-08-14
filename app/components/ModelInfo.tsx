"use client";

import type { ModelInfoResponse } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

interface ModelInfoProps {
  data: ModelInfoResponse | null;
}

const SOURCE_LABEL: Record<string, string> = {
  initial_training: "initial training",
  retrain_promoted: "auto-retrained",
};

/**
 * "Model version / last retrained" line, sourced from GET /model/info — a
 * sidecar JSON the backend writes at train/promote time. Renders a small
 * muted note until the backend has metadata to report (e.g. before the
 * first retrain since this endpoint shipped), instead of fabricating one.
 */
export default function ModelInfo({ data }: ModelInfoProps) {
  if (!data || !data.available) {
    return (
      <p className="text-xs text-subtle-foreground">
        Model info: not yet reported by backend
      </p>
    );
  }

  const { algorithm, trained_at, source, metrics } = data;
  const sourceLabel = source ? SOURCE_LABEL[source] ?? source : null;

  return (
    <p className="text-xs text-subtle-foreground">
      {algorithm && <span className="capitalize">{algorithm.replace(/_/g, " ")}</span>}
      {algorithm && trained_at && <span> · </span>}
      {trained_at && <span>trained {formatDateTime(trained_at)}</span>}
      {sourceLabel && <span> ({sourceLabel})</span>}
      {metrics && (
        <span className="ml-1 text-subtle-foreground/80">
          · RMSE {metrics.rmse.toFixed(6)}
        </span>
      )}
    </p>
  );
}
