"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";
import LoginView from "./views/LoginView";
import Dock from "./Dock";
import ProfileWidget from "./ProfileWidget";
import ChatSidebar from "./ChatSidebar";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-loading-screen" role="status" aria-live="polite" aria-label="Loading">
        <div className="app-loading-backdrop" aria-hidden="true" />
        <div className="app-loading-card">
          <div className="app-loading-logo">
            <img src="/logo.png" alt="" width={72} height={72} />
          </div>
          <h1 className="app-loading-title">Dropshapes</h1>
          <p className="app-loading-subtitle">Preparing your workspace…</p>
          <div className="app-loading-spinner" aria-hidden="true">
            <span className="app-loading-spinner-dot" />
            <span className="app-loading-spinner-dot" />
            <span className="app-loading-spinner-dot" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <>
      <a className="skip-link" href="#mainContent">
        Skip to main content
      </a>
      <div
        id="srAnnounce"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      ></div>

      <ProfileWidget />
      <ChatSidebar />

      <Dock />

      <main
        id="mainContent"
        className="app-main"
        tabIndex={-1}
        style={{ width: "100%", maxWidth: "1000px" }}
      >
        {children}
      </main>

      <div
        id="toast"
        className="toast"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="toast-icon" aria-hidden="true">
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span id="toast-msg">Ready</span>
      </div>
    </>
  );
}
