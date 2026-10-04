import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sprout & Crumb | سبراوت آند كرمب",
  description: "مخبوزات نباتية في الرياض. Vegan baking, made slowly. Preorder for pickup or delivery in Riyadh.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
