import { fetchBackend } from "@/lib/backend";

// Proxies GET ${BACKEND_URL}/health server-side so the browser never has to
// make a direct HTTPS -> HTTP call to the EC2 instance (mixed content).
export async function GET() {
  const result = await fetchBackend("/health");
  return Response.json(result.body ?? { error: "Empty response from backend." }, {
    status: result.status,
  });
}
