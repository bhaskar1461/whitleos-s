import { ContactView } from "@/components/contact-view";
import { getSessionUser } from "@/lib/auth";

export const metadata = {
  title: "Contact",
  description: "Contact Whiteloo about launch partnerships, product feedback, and support.",
};

export default async function ContactPage() {
  const user = await getSessionUser();

  return <ContactView user={user} />;
}
