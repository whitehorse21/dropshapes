"use client";

import { Providers } from "./Providers";
import AuthWrapper from "./AuthWrapper";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AuthWrapper>{children}</AuthWrapper>
    </Providers>
  );
}
