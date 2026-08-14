import { fetchBackend } from "@/lib/backend";

// Proxies GET ${BACKEND_URL}/model/info server-side so the browser never has
// to make a direct HTTPS -> HTTP call to the EC2 instance (mixed content).
//
// The backend always returns 200 here, even when no metadata exists yet
// (it responds with { available: false, ... } instead of a 503) — so unlike
// /api/drift, there's no special status handling needed on this route.
export async function GET() {
  const result = await fetchBackend("/model/info");
  return Response.json(result.body ?? { error: "Empty response from backend." }, {
    status: result.status,
  });
}
