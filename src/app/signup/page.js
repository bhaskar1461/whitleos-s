import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Signup",
  description: "Create a Whiteloo account and join the premium protein launch.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
