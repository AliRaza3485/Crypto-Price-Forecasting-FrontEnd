"use client";

import type { DriftResponse, PsiLevel } from "@/lib/types";
import { formatPsi } from "@/lib/format";
import { DriftPanelSkeleton } from "./Skeletons";

interface DriftPanelProps {
  data: DriftResponse | null;
  loading: boolean;
  unavailable: boolean; // backend returned 503 — reference not shipped yet
  error: string | null;
}

const LEVEL_STYLES: Record<PsiLevel, string> = {
  stable: "bg-success/10 text-success border-success/30",
  moderate: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  major: "bg-danger-surface text-danger border-danger-border",
};

export default function DriftPanel({ data, loading, unavailable, error }: DriftPanelProps) {
  if (loading && !data && !unavailable) return <DriftPanelSkeleton />;

  if (unavailable) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm font-medium">Data drift monitoring</p>
        <div className="mt-4 rounded-xl border border-dashed border-border bg-surface-muted px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Drift monitoring unavailable — reference dataset not shipped to
            production yet.
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-danger-border bg-danger-surface p-6">
        <p className="text-sm font-medium text-danger">Drift monitoring unavailable</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium">Data drift monitoring</p>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
            data.drift_detected
              ? "border-danger-border bg-danger-surface text-danger"
              : "border-success/30 bg-success/10 text-success"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              data.drift_detected ? "bg-danger" : "bg-success"
            }`}
          />
          {data.drift_detected ? "Drift detected" : "No drift"}
        </span>
      </div>

      <p className="mt-2 text-xs text-subtle-foreground">
        {data.n_drifted} / {data.n_features} features drifted
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="pb-2 font-medium">Feature</th>
              <th className="pb-2 font-medium">PSI</th>
              <th className="pb-2 font-medium">Level</th>
              <th className="pb-2 font-medium">KS p-value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.features.map((f) => (
              <tr key={f.feature}>
                <td className="py-2 pr-2 font-mono text-xs text-foreground">
                  {f.feature}
                </td>
                <td className="py-2 pr-2 tabular-nums">{formatPsi(f.psi)}</td>
                <td className="py-2 pr-2">
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${LEVEL_STYLES[f.psi_level]}`}
                  >
                    {f.psi_level}
                  </span>
                </td>
                <td className="py-2 tabular-nums text-muted-foreground">
                  {f.ks_pvalue.toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
