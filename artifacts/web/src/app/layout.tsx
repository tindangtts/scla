import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Star City Living",
  description: "Resident community management for StarCity Estate",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
