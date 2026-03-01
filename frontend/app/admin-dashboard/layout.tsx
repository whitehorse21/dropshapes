"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowLeft,
  LayoutDashboard,
  Users,
  CreditCard,
  ClipboardList,
  DollarSign,
  Mail,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import AdminGuard from "@/app/components/AdminGuard";
import { useAuth } from "@/app/context/AuthContext";

const navItems = [
  { href: "/admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin-dashboard/users", label: "Users", icon: Users },
  {
    href: "/admin-dashboard/subscriptions",
    label: "Subscription Plans",
    icon: CreditCard,
  },
  {
    href: "/admin-dashboard/user-subscriptions",
    label: "User Subscriptions",
    icon: ClipboardList,
  },
  { href: "/admin-dashboard/credits", label: "Credits", icon: DollarSign },
  { href: "/admin-dashboard/contacts", label: "Contact Inquiries", icon: Mail },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <AdminGuard>
      {/* Full-screen admin: no app chrome (dock/profile/logo) when rendered from AuthWrapper. */}
      <div
        className="admin-layout-root fixed inset-0 z-[2001] flex flex-row min-h-screen w-full min-w-0 overflow-x-hidden bg-[var(--bg)]"
      >
        {/* Overlay when sidebar drawer is open (mobile only) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        {/* Sidebar wrapper: on desktop it's a flex child (always visible); on mobile it's a fixed drawer */}
        <div
          className={`admin-sidebar-wrapper${sidebarOpen ? " admin-sidebar-open" : ""}`}
          aria-hidden={isDesktop ? false : !sidebarOpen}
        >
          <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="admin-sidebar-close md:hidden"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="admin-sidebar-nav flex-1 overflow-y-auto">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={`admin-sidebar-link ${isActive ? "admin-sidebar-link-active" : ""}`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="admin-sidebar-footer">
              <Link
                href="/"
                onClick={() => setSidebarOpen(false)}
                className="admin-sidebar-link"
              >
                <ArrowLeft className="h-5 w-5 shrink-0" />
                <span>Back to Website</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="admin-sidebar-link w-full text-left"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>

        {/* Main content column */}
        <div className="admin-layout-main flex flex-col min-h-screen flex-1 min-w-0 bg-[var(--bg)]">
          <header
            className="admin-header sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-[var(--border)] bg-[var(--bg)] px-4 md:hidden md:px-6"
            style={{
              paddingLeft: "max(16px, env(safe-area-inset-left))",
              paddingRight: "max(16px, env(safe-area-inset-right))",
            }}
          >
            {/* Hamburger: only on small screens; hidden on desktop via CSS so sidebar is always visible */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSidebarOpen(true);
              }}
              className="admin-hamburger"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </header>

          <main
            className="admin-main-content flex-1 overflow-auto min-h-0 min-w-0 w-full max-w-full bg-[var(--bg)]"
            id="mainContent"
            style={{
              flex: "1 1 auto",
              minHeight: 0,
              paddingTop: "max(16px, env(safe-area-inset-top, 0px))",
              paddingBottom: "max(16px, env(safe-area-inset-bottom))",
              paddingLeft: "max(16px, env(safe-area-inset-left))",
              paddingRight: "max(16px, env(safe-area-inset-right))",
            }}
          >
            <div className="admin-page">{children}</div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
