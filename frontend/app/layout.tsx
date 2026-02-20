import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./components/Providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-main",
});

export const metadata: Metadata = {
  title: "Dropshapes",
  description: "Focused Workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} antialiased`}
      >
        <Providers>
          <Link href="/" className="logo-link" prefetch={false}>
            <img src="/logo.png" alt="Dropshapes Logo" className="app-logo" />
          </Link>
          {children}
        </Providers>
      </body>
    </html>
  );
}
