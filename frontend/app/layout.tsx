import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const ClientLayout = dynamic(() => import("./components/ClientLayout"), {
  loading: () => (
    <div
      className="min-h-screen flex items-center justify-center bg-[#05070a] antialiased"
      style={{ padding: "2rem" }}
      role="status"
      aria-label="Loading"
    >
      <div className="text-white/80">Loading…</div>
    </div>
  ),
  ssr: true,
});

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
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
