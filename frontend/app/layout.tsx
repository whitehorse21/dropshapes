import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./components/Providers";
import AuthWrapper from "./components/AuthWrapper";

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
  const criticalCSS = `
    html, body { background-color: #05070a !important; }
    .logo-link {
      position: fixed;
      top: max(24px, calc(env(safe-area-inset-top, 0px) + 12px));
      left: max(32px, calc(env(safe-area-inset-left, 0px) + 12px));
      z-index: 2000;
      display: block;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      overflow: hidden;
    }
    .logo-link .app-logo {
      object-fit: contain;
    }
  `;

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} antialiased`}>
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        <Providers>
          <Link href="/" className="logo-link" prefetch={false}>
            <img src="/logo.png" alt="Dropshapes Logo" className="app-logo" />
          </Link>
          <AuthWrapper>{children}</AuthWrapper>
        </Providers>
      </body>
    </html>
  );
}
