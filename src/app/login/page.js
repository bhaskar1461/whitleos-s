import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Login",
  description: "Login to the Whiteloo dashboard and admin console.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
