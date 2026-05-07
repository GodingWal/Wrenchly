import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wrenchly — Should you flip it, part it, or walk?",
  description:
    "Decision tool for car flippers. Enter a vehicle and asking price; get FLIP, MARGINAL, PART, or WALK in under two minutes.",
  icons: { icon: "/favicon.svg" },
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
