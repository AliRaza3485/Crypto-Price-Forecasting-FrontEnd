import { fetchBackend } from "@/lib/backend";

// Proxies GET ${BACKEND_URL}/predict/live server-side.
export async function GET() {
  const result = await fetchBackend("/predict/live");
  return Response.json(result.body ?? { error: "Empty response from backend." }, {
    status: result.status,
  });
}
