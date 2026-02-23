"use client";

import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../context/AuthContext";
import { SettingsProvider } from "../context/SettingsContext";
import { UIProvider } from "../context/UIContext";

import NextAuthProvider from "./NextAuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      // Suppress rejections that pass a DOM Event (e.g. from navigation/scripts)
      // so they don't reach Next.js and show "[object Event]" in the overlay.
      if (reason instanceof Event) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    window.addEventListener("unhandledrejection", handler, true);
    return () => window.removeEventListener("unhandledrejection", handler, true);
  }, []);

  return (
    <NextAuthProvider>
      <AuthProvider>
        <SettingsProvider>
          <UIProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: { zIndex: 9999 },
              }}
            />
          </UIProvider>
        </SettingsProvider>
      </AuthProvider>
    </NextAuthProvider>
  );
}
