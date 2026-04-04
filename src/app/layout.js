import { Manrope, Sora } from "next/font/google";

import { ToasterProvider } from "@/components/providers/toaster-provider";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Whiteloo | Automated Protein Rituals",
    template: "%s | Whiteloo",
  },
  description:
    "Premium automated protein drink experiences for luxury gyms, with a launch page, JWT auth, user dashboard, admin console, and waitlist flow.",
  openGraph: {
    title: "Whiteloo",
    description: "Fresh protein shakes in 2 minutes via smart machines in premium gyms.",
    url: appUrl,
    siteName: "Whiteloo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Whiteloo",
    description: "Fresh protein shakes in 2 minutes via smart machines in premium gyms.",
  },
};

export const viewport = {
  colorScheme: "dark",
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${manrope.variable} ${sora.variable}`}>
      <body>
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
