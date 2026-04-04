import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { createJournalEntryRecord, listJournalEntriesForUser } from "@/lib/store";
import { serializeDocument } from "@/lib/utils";
import { journalSchema } from "@/lib/validation";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError("Authentication required.", 401, "unauthorized");

  const entries = await listJournalEntriesForUser(user.id);

  return Response.json({ items: entries.map((entry) => serializeDocument(entry)) });
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return jsonError("Authentication required.", 401, "unauthorized");

  const body = await request.json().catch(() => null);
  const parsed = journalSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Invalid journal payload.", 400, "validation_error");
  }

  const entry = await createJournalEntryRecord(user.id, parsed.data);

  return Response.json(
    { message: "Entry saved.", item: serializeDocument(entry) },
    { status: 201 }
  );
}
