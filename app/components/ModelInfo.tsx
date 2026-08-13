"use client";

import type { HealthResponse } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

interface ModelInfoProps {
  health: HealthResponse | null;
}

/**
 * Optional "model version / last retrained" line. The backend doesn't
 * expose this yet — `model_version` / `last_retrained` are optional fields
 * on HealthResponse for forward-compatibility. Until the backend sends
 * them, this renders a small muted note instead of fabricating a value.
 */
export default function ModelInfo({ health }: ModelInfoProps) {
  if (!health) return null;

  const { model_version, last_retrained } = health;

  if (!model_version && !last_retrained) {
    return (
      <p className="text-xs text-subtle-foreground">
        Model info: not yet reported by backend
      </p>
    );
  }

  return (
    <p className="text-xs text-subtle-foreground">
      {model_version && <span>Model {model_version}</span>}
      {model_version && last_retrained && <span> · </span>}
      {last_retrained && <span>Last retrained {formatDateTime(last_retrained)}</span>}
    </p>
  );
}
