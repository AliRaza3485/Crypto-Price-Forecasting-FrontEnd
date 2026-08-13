import { fetchBackend } from "@/lib/backend";

// Proxies GET ${BACKEND_URL}/predict/history?hours=24 server-side.
//
// Fixed at 24 hours for now (matches the dashboard's single history chart).
// If a caller-configurable window is ever needed, this can read `hours`
// from the request's own URL instead of hard-coding it.
export async function GET() {
  const result = await fetchBackend("/predict/history?hours=24");
  return Response.json(result.body ?? { error: "Empty response from backend." }, {
    status: result.status,
  });
}
