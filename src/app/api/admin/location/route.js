import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { createLocationEntry, listLocations } from "@/lib/store";
import { locationSchema } from "@/lib/validation";
import { serializeDocument } from "@/lib/utils";

async function verifyAdmin() {
  const user = await getSessionUser();

  if (!user) {
    return { error: jsonError("Authentication required.", 401, "unauthorized") };
  }

  if (user.role !== "admin") {
    return { error: jsonError("Admin access required.", 403, "forbidden") };
  }

  return { user };
}

export async function GET() {
  const { error } = await verifyAdmin();
  if (error) return error;

  const locations = await listLocations();

  return Response.json({
    locations: locations.map((entry) => serializeDocument(entry)),
  });
}

export async function POST(request) {
  const { error } = await verifyAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = locationSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Invalid location payload.", 400, "validation_error");
  }

  const location = await createLocationEntry(parsed.data);

  return Response.json(
    {
      message: "Location created.",
      location: serializeDocument(location),
    },
    { status: 201 }
  );
}
