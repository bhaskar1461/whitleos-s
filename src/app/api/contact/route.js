import { jsonError } from "@/lib/http";
import { createContactSubmissionRecord } from "@/lib/store";
import { serializeDocument } from "@/lib/utils";
import { contactSchema } from "@/lib/validation";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || "Invalid contact payload.", 400, "validation_error");
  }

  const submission = await createContactSubmissionRecord(parsed.data);

  return Response.json(
    {
      message: "Message received. We'll get back to you shortly.",
      item: serializeDocument(submission),
    },
    { status: 201 }
  );
}
