"use client";

import React, { useEffect } from "react";
import { AuthProvider } from "../context/AuthContext";
import { SettingsProvider } from "../context/SettingsContext";
import { UIProvider } from "../context/UIContext";

import NextAuthProvider from "./NextAuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (reason instanceof Event && reason.type === "error") {
        event.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  return (
    <NextAuthProvider>
      <AuthProvider>
        <SettingsProvider>
          <UIProvider>{children}</UIProvider>
        </SettingsProvider>
      </AuthProvider>
    </NextAuthProvider>
  );
}
