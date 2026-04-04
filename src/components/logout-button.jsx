"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
      });
      toast.success("You have been signed out.");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Unable to sign out right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={handleLogout} className="ghost-button" disabled={loading}>
      <LogOut className="h-4 w-4" />
      {loading ? "Signing out..." : "Logout"}
    </button>
  );
}
