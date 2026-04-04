import { jsonError } from "@/lib/http";
import { createWaitlistEntry, getWaitlistEntryByEmail } from "@/lib/store";
import { waitlistSchema } from "@/lib/validation";
import { normalizeEmail } from "@/lib/utils";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = waitlistSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid email address.", 400, "validation_error");
    }

    const email = normalizeEmail(parsed.data.email);
    const existingEntry = await getWaitlistEntryByEmail(email);

    if (existingEntry) {
      return Response.json({
        message: "You're already on the waitlist.",
        duplicate: true,
      });
    }

    await createWaitlistEntry(email);

    return Response.json(
      {
        message: "You're in. We'll reach out before launch.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error?.code === 11000) {
      return Response.json({
        message: "You're already on the waitlist.",
        duplicate: true,
      });
    }

    return jsonError("Unable to join the waitlist right now.", 500, "waitlist_failed");
  }
}
