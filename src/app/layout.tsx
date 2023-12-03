import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Forum for Zuzalians",
  description: "A digital town square to learn from each other and explore the frontier."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">     
      <body className={inter.className}>{children}</body>
    </html>
  );
}
