import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediSimplify Dashboard",
  description: "Secure clinical jargon translation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 font-sans text-gray-800">{children}</body>
    </html>
  );
}