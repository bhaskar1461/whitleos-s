import { redirect } from "next/navigation";

import { JournalView } from "@/components/journal-view";
import { getSessionUser } from "@/lib/auth";
import { listJournalEntriesForUser } from "@/lib/store";
import { serializeDocument } from "@/lib/utils";

export const metadata = {
  title: "Journal",
  description: "Restored journal page for Whiteloo members.",
};

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const entries = await listJournalEntriesForUser(user.id);

  return (
    <JournalView
      user={user}
      initialEntries={entries.map((entry) => serializeDocument(entry))}
    />
  );
}
