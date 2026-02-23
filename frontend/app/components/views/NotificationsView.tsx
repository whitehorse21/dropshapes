'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, Loader2, ChevronDown } from 'lucide-react';

const NOTIFICATION_PREFS_KEY = 'dropshapes_notification_prefs';

interface NotificationPrefs {
  emailNotifications: {
    newsletter: boolean;
    productUpdates: boolean;
    billing: boolean;
    security: boolean;
    marketing: boolean;
  };
  pushNotifications: {
    documentReady: boolean;
    subscriptionChanges: boolean;
    securityAlerts: boolean;
    tips: boolean;
  };
  frequency: {
    emailDigest: string;
    reminderEmails: boolean;
  };
}

const defaultPrefs: NotificationPrefs = {
  emailNotifications: {
    newsletter: true,
    productUpdates: true,
    billing: true,
    security: true,
    marketing: false,
  },
  pushNotifications: {
    documentReady: true,
    subscriptionChanges: true,
    securityAlerts: true,
    tips: false,
  },
  frequency: {
    emailDigest: 'weekly',
    reminderEmails: true,
  },
};

function loadPrefs(): NotificationPrefs {
  if (typeof window === 'undefined') return defaultPrefs;
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as NotificationPrefs;
      return { ...defaultPrefs, ...parsed };
    }
  } catch {
    // ignore
  }
  return defaultPrefs;
}

function savePrefs(prefs: NotificationPrefs): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

const EMAIL_DIGEST_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'never', label: 'Never' },
] as const;

function CustomDigestSelect({
  value,
  onChange,
  id,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  id: string;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const label = EMAIL_DIGEST_OPTIONS.find((o) => o.value === value)?.label ?? value;

  return (
    <div ref={ref} className="custom-digest-select" data-open={open}>
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="custom-digest-select-trigger"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{label}</span>
        <ChevronDown className="custom-digest-select-chevron" aria-hidden />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-labelledby={id}
          className="custom-digest-select-dropdown"
        >
          {EMAIL_DIGEST_OPTIONS.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              className="custom-digest-select-option"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PrefRow({
  title,
  desc,
  checked,
  onChange,
  ariaLabel,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
}) {
  return (
    <div className="settings-item">
      <div className="settings-item-content">
        <div className="item-title">{title}</div>
        <div className="item-desc">{desc}</div>
      </div>
      <label className="switch" aria-label={ariaLabel}>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="slider" aria-hidden />
      </label>
    </div>
  );
}

export default function NotificationsView() {
  const [settings, setSettings] = useState<NotificationPrefs>(defaultPrefs);
  const [isClient, setIsClient] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setSettings(loadPrefs());
    setIsClient(true);
  }, []);

  const handleToggle = (category: keyof Omit<NotificationPrefs, 'frequency'>, setting: string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] as Record<string, boolean>),
        [setting]: !(prev[category] as Record<string, boolean>)[setting],
      },
    }));
  };

  const handleFrequencyChange = (setting: keyof NotificationPrefs['frequency'], value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      frequency: {
        ...prev.frequency,
        [setting]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      savePrefs(settings);
      await new Promise((r) => setTimeout(r, 600));
      setMessage({ type: 'success', text: 'Notification preferences saved.' });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to save. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isClient) {
    return (
      <section id="view-notifications" className="view-section active-view" aria-label="Notification preferences">
        <div className="subscription-page-wrap">
          <div className="header-minimal">
            <h1>Notification Preferences</h1>
          </div>
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="animate-spin w-8 h-8 text-[var(--accent)]" aria-hidden />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="view-notifications" className="view-section active-view" aria-label="Notification preferences">
      <div className="subscription-page-wrap">
        <div className="subscription-page-nav">
          <Link href="/settings" className="subscription-nav-back" aria-label="Back to Settings">
            <ChevronLeft className="subscription-nav-back-icon" aria-hidden />
            Back to Settings
          </Link>
        </div>

        <div className="header-minimal">
          <h1>Notification Preferences</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Choose how and when you want to receive notifications from Dropshapes
          </p>
        </div>

        <div className="settings-wrapper mx-auto">
          {message && (
            <div
              className={`p-4 rounded-xl border ${
                message.type === 'success'
                  ? 'bg-[var(--safe-green)]/15 border-[var(--safe-green)]/30 text-[var(--safe-green)]'
                  : 'bg-[var(--danger-red)]/15 border-[var(--danger-red)]/30 text-[var(--danger-red)]'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="group-title">EMAIL NOTIFICATIONS</div>
          <PrefRow
            title="Newsletter"
            desc="Weekly updates and tips"
            checked={settings.emailNotifications.newsletter}
            onChange={() => handleToggle('emailNotifications', 'newsletter')}
            ariaLabel="Toggle Newsletter"
          />
          <PrefRow
            title="Product Updates"
            desc="New features and improvements"
            checked={settings.emailNotifications.productUpdates}
            onChange={() => handleToggle('emailNotifications', 'productUpdates')}
            ariaLabel="Toggle Product Updates"
          />
          <PrefRow
            title="Billing & Account"
            desc="Important account and billing updates"
            checked={settings.emailNotifications.billing}
            onChange={() => handleToggle('emailNotifications', 'billing')}
            ariaLabel="Toggle Billing & Account"
          />
          <PrefRow
            title="Security Alerts"
            desc="Login attempts and security notifications"
            checked={settings.emailNotifications.security}
            onChange={() => handleToggle('emailNotifications', 'security')}
            ariaLabel="Toggle Security Alerts"
          />
          <PrefRow
            title="Marketing Communications"
            desc="Promotional offers and special deals"
            checked={settings.emailNotifications.marketing}
            onChange={() => handleToggle('emailNotifications', 'marketing')}
            ariaLabel="Toggle Marketing"
          />

          <div className="group-title">BROWSER NOTIFICATIONS</div>
          <PrefRow
            title="Document Ready"
            desc="When your resume or cover letter is ready"
            checked={settings.pushNotifications.documentReady}
            onChange={() => handleToggle('pushNotifications', 'documentReady')}
            ariaLabel="Toggle Document Ready"
          />
          <PrefRow
            title="Subscription Changes"
            desc="Plan upgrades, downgrades, and renewals"
            checked={settings.pushNotifications.subscriptionChanges}
            onChange={() => handleToggle('pushNotifications', 'subscriptionChanges')}
            ariaLabel="Toggle Subscription Changes"
          />
          <PrefRow
            title="Security Alerts"
            desc="Important security notifications"
            checked={settings.pushNotifications.securityAlerts}
            onChange={() => handleToggle('pushNotifications', 'securityAlerts')}
            ariaLabel="Toggle Browser Security Alerts"
          />
          <PrefRow
            title="Career Tips"
            desc="Helpful career advice and tips"
            checked={settings.pushNotifications.tips}
            onChange={() => handleToggle('pushNotifications', 'tips')}
            ariaLabel="Toggle Career Tips"
          />

          <div className="group-title">EMAIL FREQUENCY</div>
          <div className="settings-item">
            <div className="settings-item-content">
              <div className="item-title">Email Digest Frequency</div>
              <div className="item-desc">How often to receive a summary email</div>
            </div>
            <CustomDigestSelect
              id="email-digest"
              value={settings.frequency.emailDigest}
              onChange={(v) => handleFrequencyChange('emailDigest', v)}
              ariaLabel="Email digest frequency"
            />
          </div>
          <PrefRow
            title="Reminder Emails"
            desc="Reminders for incomplete actions"
            checked={settings.frequency.reminderEmails}
            onChange={() => handleFrequencyChange('reminderEmails', !settings.frequency.reminderEmails)}
            ariaLabel="Toggle reminder emails"
          />

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="btn-action flex items-center gap-2 w-auto px-8 bg-[var(--accent)] border-[var(--accent)] text-white hover:opacity-90"
            >
              {isSaving && <Loader2 className="w-5 h-5 animate-spin" aria-hidden />}
              {isSaving ? 'Saving…' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
