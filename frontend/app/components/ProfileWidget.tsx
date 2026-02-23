"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfileWidget() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const displayName = user.name || user.email || user.username || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <button
      type="button"
      className="profile-widget"
      id="topProfileWidget"
      onClick={() => router.push("/profile")}
      aria-label="Open profile"
    >
      <span id="widgetInitials">{initial}</span>
    </button>
  );
}
