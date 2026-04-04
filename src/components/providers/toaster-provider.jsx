"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      theme="dark"
      richColors
      position="top-right"
      toastOptions={{
        style: {
          background: "rgba(15, 15, 15, 0.96)",
          border: "1px solid rgba(182, 255, 0, 0.18)",
          color: "#f5f5f5",
        },
      }}
    />
  );
}
