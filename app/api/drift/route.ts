import { fetchBackend } from "@/lib/backend";

// Proxies GET ${BACKEND_URL}/monitoring/drift server-side.
//
// This endpoint may legitimately return 503 in production (the drift
// reference dataset hasn't been shipped to the container yet). We forward
// that status as-is — the client treats 503 as a friendly empty-state, not
// an error to alarm the user with.
export async function GET() {
  const result = await fetchBackend("/monitoring/drift");
  return Response.json(result.body ?? { error: "Empty response from backend." }, {
    status: result.status,
  });
}
