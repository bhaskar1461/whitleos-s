import { redirect } from "next/navigation";

import { StepsView } from "@/components/steps-view";
import { getSessionUser } from "@/lib/auth";
import { listStepsForUser } from "@/lib/store";
import { serializeDocument } from "@/lib/utils";

export const metadata = {
  title: "Steps",
  description: "Restored steps tracker with the Whiteloo interface system.",
};

export const dynamic = "force-dynamic";

export default async function StepsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const steps = await listStepsForUser(user.id);

  return <StepsView user={user} initialSteps={steps.map((entry) => serializeDocument(entry))} />;
}
