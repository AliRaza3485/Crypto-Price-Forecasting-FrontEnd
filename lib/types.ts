// Shared types for the BTC forecasting MLOps API.
// These mirror the FastAPI backend's response schemas exactly.

/** GET /health */
export interface HealthResponse {
  status: string; // "ok" when healthy
  model_available: boolean;
}

/** Test-set metrics logged at train/promote time (see backend evaluate()). */
export interface ModelMetrics {
  rmse: number;
  mae: number;
  r2: number;
  directional_acc: number;
}

/**
 * GET /model/info
 * Metadata about the currently-served model version, read from a sidecar
 * JSON the backend writes at train/promote time. `available: false` means
 * no metadata exists yet (e.g. before the first retrain since this endpoint
 * shipped) — not an error, just "not yet reported".
 */
export interface ModelInfoResponse {
  available: boolean;
  algorithm: string | null;
  trained_at: string | null; // ISO timestamp
  source: "initial_training" | "retrain_promoted" | null;
  metrics: ModelMetrics | null;
  n_features: number | null;
  mlflow_run_id: string | null;
  registered_model_name: string | null;
}

/** GET /predict/live */
export interface LiveForecastResponse {
  as_of_time: string; // ISO timestamp
  current_price: number;
  predicted_return: number; // fraction, e.g. 0.0012 = +0.12%
  predicted_price: number;
  predicted_for_time: string; // ISO timestamp
}

export type PsiLevel = "stable" | "moderate" | "major";

export interface DriftFeature {
  feature: string;
  psi: number;
  psi_level: PsiLevel;
  ks_pvalue: number;
  drifted: boolean;
}

/** GET /monitoring/drift (may 503 if reference data isn't shipped yet) */
export interface DriftResponse {
  n_features: number;
  n_drifted: number;
  drift_detected: boolean;
  features: DriftFeature[];
}

/** One logged prediction row. GET /predict/history */
export interface HistoryEntry {
  as_of_time: string; // ISO timestamp
  current_price: number;
  predicted_return: number;
  predicted_price: number;
  predicted_for_time: string; // ISO timestamp
  actual_price: number | null; // null until predicted_for_time has passed
  error: number | null; // actual_price - predicted_price, null while pending
}

/** GET /predict/history */
export interface HistoryResponse {
  hours: number;
  count: number;
  entries: HistoryEntry[];
}

/** Uniform error shape returned by our own /api/* proxy routes. */
export interface ApiError {
  error: string;
}