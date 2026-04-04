import { getStorageMode } from "@/lib/store";

export async function GET() {
  return Response.json({
    ok: true,
    app: "whiteloo-platform",
    frontend: "nextjs-app-router",
    database: getStorageMode(),
    auth: "jwt",
  });
}
