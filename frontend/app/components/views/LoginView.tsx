"use client";

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { signIn } from "next-auth/react";

export default function LoginView() {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock auth for "Sign Up" or "Sign In" with email/password
    // In a real app with NextAuth, "Sign In" with credentials would also use signIn('credentials', ...)
    // For now, we simulate the "Credentials" flow to keep the existing simple logic working alongside OAuth.
    setTimeout(() => {
      login(name || email.split("@")[0] || "User");
      setLoading(false);
    }, 1000);
  };

  const handleSocialLogin = (provider: string) => {
    // This will redirect to the provider's login page
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div id="view-login">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome to Dropshapes</h1>
          <p>Your distraction-free workspace awaits.</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${activeTab === "signin" ? "active" : ""}`}
            onClick={() => setActiveTab("signin")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => setActiveTab("signup")}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleAuth}>
          {activeTab === "signup" && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Display Name
              </label>
              <input
                type="text"
                id="name"
                className="auth-input"
                placeholder="What should we call you?"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="auth-input"
              placeholder="name@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="auth-input"
              placeholder="••••••••"
              autoComplete={
                activeTab === "signin" ? "current-password" : "new-password"
              }
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-submit-auth" disabled={loading}>
            {loading
              ? "Processing..."
              : activeTab === "signin"
                ? "Enter Dropshapes"
                : "Create Account"}
          </button>

          {activeTab === "signin" && (
            <a
              href="#"
              className="forgot-password"
              onClick={(e) => {
                e.preventDefault();
                alert("Password reset coming soon!");
              }}
            >
              Forgot password?
            </a>
          )}
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="social-row">
          <button
            type="button"
            className="social-btn"
            onClick={() => handleSocialLogin("google")}
            title="Google"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.04-1.133 7.973-3.067 1.96-1.96 2.533-4.707 2.533-6.947 0-.467-.04-.933-.093-1.373h-10.413z" />
            </svg>
          </button>
          <button
            type="button"
            className="social-btn"
            onClick={() => handleSocialLogin("apple")}
            title="Apple"
          >
            <svg viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.02 3.47-1.06.73 0 2.27.18 3.11 1.41-.03.02-1.87 1.09-1.89 4.38-.02 3.51 3.09 4.7 3.09 4.7-.01 0-.52 1.83-1.86 3.8zM12.03 7.25c-.06-3.01 2.46-4.52 2.46-4.52-.06 0-2.65-.18-4.54 2.1-1.6 1.93-1.35 4.67-1.35 4.67 2.09 0 3.5-2.23 3.43-2.25z" />
            </svg>
          </button>
          <button
            type="button"
            className="social-btn"
            onClick={() => handleSocialLogin("twitter")}
            title="X (Twitter)"
          >
            <svg viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>
          <button
            type="button"
            className="social-btn"
            onClick={() => handleSocialLogin("github")}
            title="GitHub"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
