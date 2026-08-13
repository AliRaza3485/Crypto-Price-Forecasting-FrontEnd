// Shared types for the BTC forecasting MLOps API.
// These mirror the FastAPI backend's response schemas exactly.

/** GET /health */
export interface HealthResponse {
  status: string; // "ok" when healthy
  model_available: boolean;
  // Not currently returned by the backend. Optional + forward-compatible:
  // the UI renders these the moment the backend starts sending them, and
  // degrades gracefully (omits / shows a muted note) while they're absent.
  model_version?: string;
  last_retrained?: string; // ISO timestamp, if/when the backend adds it
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

/** Uniform error shape returned by our own /api/* proxy routes. */
export interface ApiError {
  error: string;
}
