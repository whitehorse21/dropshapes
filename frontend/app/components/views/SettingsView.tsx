'use client';

// Settings View Component

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSettings, Settings } from '@/app/context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

export default function SettingsView() {
    const router = useRouter();
    const { settings, toggleSetting } = useSettings();
    const { user, updateProfile, isAdmin } = useAuth();

    const serverName = user ? (user.name || user.email || user.username || '') : '';
    const [displayNameValue, setDisplayNameValue] = useState(serverName);
    const [displayNameDirty, setDisplayNameDirty] = useState(false);
    const [displayNameSaving, setDisplayNameSaving] = useState(false);
    const [displayNameMessage, setDisplayNameMessage] = useState<'success' | 'error' | null>(null);

    const replyVoice = (user?.reply_voice === 'female' ? 'female' : 'male') as 'female' | 'male';
    const [replyVoiceSaving, setReplyVoiceSaving] = useState(false);

    useEffect(() => {
        setDisplayNameValue(serverName);
    }, [serverName]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDisplayNameValue(value);
        setDisplayNameDirty(value !== serverName);
        setDisplayNameMessage(null);
    };

    const handleSaveDisplayName = async () => {
        if (!displayNameDirty) return;
        setDisplayNameSaving(true);
        setDisplayNameMessage(null);
        try {
            const result = await updateProfile({ name: displayNameValue });
            if (result.success) {
                setDisplayNameDirty(false);
                setDisplayNameMessage('success');
            } else {
                setDisplayNameMessage('error');
            }
        } catch {
            setDisplayNameMessage('error');
        } finally {
            setDisplayNameSaving(false);
        }
    };

    const handleSubscription = () => {
        router.push('/subscription');
    };

    const handleReplyVoiceChange = async (voice: 'female' | 'male') => {
        if (voice === replyVoice) return;
        setReplyVoiceSaving(true);
        try {
            const result = await updateProfile({ reply_voice: voice });
            if (result.success) setReplyVoiceSaving(false);
        } catch {
            setReplyVoiceSaving(false);
        }
    };

    const renderSwitch = (label: string, desc: string, key: keyof Settings) => {
        if (key === 'theme') {
            return (
                <div className="settings-item">
                    <div className="settings-item-content">
                        <div className="item-title">{label}</div>
                        <div className="item-desc">{desc}</div>
                    </div>
                    <label className="switch" aria-label={label}>
                        <input
                            type="checkbox"
                            checked={settings.theme === 'light'}
                            onChange={() => toggleSetting('theme')}
                        />
                        <span className="slider" aria-hidden="true"></span>
                    </label>
                </div>
            );
        }

        return (
            <div className="settings-item">
                <div className="settings-item-content">
                    <div className="item-title">{label}</div>
                    <div className="item-desc">{desc}</div>
                </div>
                <label className="switch" aria-label={label}>
                    <input
                        type="checkbox"
                        checked={settings[key] as boolean}
                        onChange={() => toggleSetting(key)}
                    />
                    <span className="slider" aria-hidden="true"></span>
                </label>
            </div>
        );
    };

    return (
        <section id="view-settings" className="view-section active-view" aria-label="Settings">
            <div className="header-minimal">
                <h1>Settings</h1>
                <p>Customize your experience</p>
            </div>

            <div className="settings-wrapper">
                <div className="group-title">GENERAL</div>

                <div className="settings-item settings-item-display-name">
                    <div className="settings-item-content">
                        <div className="item-title">Display Name</div>
                        <div className="item-desc">How you appear in the app</div>
                    </div>
                    <div className="settings-display-name-row">
                        <input
                            type="text"
                            className="input-clean"
                            value={displayNameValue}
                            onChange={handleNameChange}
                            aria-label="Display name"
                        />
                        {displayNameDirty && (
                            <button
                                type="button"
                                className="btn-resume btn-resume-primary settings-display-name-save"
                                onClick={handleSaveDisplayName}
                                disabled={displayNameSaving}
                            >
                                {displayNameSaving ? 'Saving…' : 'Save'}
                            </button>
                        )}
                    </div>
                    {displayNameMessage === 'success' && (
                        <p className="settings-display-name-feedback success" role="status">Display name saved.</p>
                    )}
                    {displayNameMessage === 'error' && (
                        <p className="settings-display-name-feedback error" role="alert">Failed to save. Try again.</p>
                    )}
                </div>

                {renderSwitch('Light Mode', 'Switch between dark and light themes', 'theme')}

                <div className="group-title">CHAT</div>
                <div className="settings-item settings-reply-voice">
                    <div className="settings-item-content">
                        <div className="item-title">Reply voice</div>
                        <div className="item-desc">Assistant voice when you send a voice message</div>
                    </div>
                    <div className="chat-voice-setting-btns" role="group" aria-label="Assistant reply voice">
                        <button
                            type="button"
                            className={`chat-voice-btn ${replyVoice === 'female' ? 'active' : ''}`}
                            onClick={() => handleReplyVoiceChange('female')}
                            disabled={replyVoiceSaving}
                            aria-pressed={replyVoice === 'female'}
                            aria-label="Female voice"
                            title="Female voice"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <circle cx="12" cy="9" r="4" />
                                <path d="M12 13v8" />
                                <path d="M9 17h6" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            className={`chat-voice-btn ${replyVoice === 'male' ? 'active' : ''}`}
                            onClick={() => handleReplyVoiceChange('male')}
                            disabled={replyVoiceSaving}
                            aria-pressed={replyVoice === 'male'}
                            aria-label="Male voice"
                            title="Male voice"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <circle cx="10" cy="14" r="4" />
                                <path d="M14 10l6-6" />
                                <path d="M20 4v6h-6" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="group-title">SUBSCRIPTION</div>

                <div className="settings-item">
                    <div className="settings-item-content">
                        <div className="item-title">Current Plan</div>
                        <div className="item-desc">Dropshapes Ultimate (Billed Annually)</div>
                    </div>
                    <span className="profile-badge" style={{ background: 'rgba(109, 226, 140, 0.1)', color: 'var(--safe-green)', fontSize: '0.8rem', padding: '4px 12px' }}>Active</span>
                </div>

                <button type="button" className="btn-action" onClick={handleSubscription}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    Manage Subscription
                </button>

                <Link href="/settings/billing" className="btn-action">
                    Billing &amp; invoices
                </Link>

                <div className="group-title">NOTIFICATIONS</div>
                <Link href="/settings/notifications" className="settings-item block">
                    <div className="settings-item-content">
                        <div className="item-title">Notification preferences</div>
                        <div className="item-desc">Email and browser notification settings</div>
                    </div>
                    <span className="text-[var(--text-secondary)]" aria-hidden>→</span>
                </Link>
                {renderSwitch('Notifications', 'Receive alerts for updates', 'notif')}
                {renderSwitch('Sound Effects', 'Play sounds for interactions', 'sound')}

                <div className="group-title">EDITOR</div>
                {renderSwitch('Auto-Clear Input', 'Clear text after saving', 'clear')}



                {renderSwitch('Reduce Motion', 'Disable animations', 'motion')}
                {renderSwitch('Low Stimulation', 'Reduce visual noise (no gradients / lighter shadows)', 'lowStim')}
                {renderSwitch('Always Show Focus Ring', 'Helpful for keyboard + mouse users', 'forceFocus')}
                {renderSwitch('Bigger Click Targets', 'Larger buttons for easier tapping', 'bigTargets')}


                <div className="group-title">DYSLEXIA SUPPORT</div>
                {renderSwitch('Dyslexia Font', 'Use OpenDyslexic-style font for readability', 'dysFont')}
                {renderSwitch('Dyslexia Spacing', 'Increase letter/word spacing + line height', 'dysSpacing')}
                {renderSwitch('Larger Text (Preset)', 'Bigger base font size across the app', 'dysLarge')}


                <div className="group-title">MODE</div>
                {renderSwitch('Zen Mode', 'Minimal interface, reduce noise', 'zen')}

                {isAdmin?.() && (
                    <>
                        <div className="group-title">ADMIN</div>
                        <Link href="/admin-dashboard" className="btn-action">
                            Admin Dashboard
                        </Link>
                    </>
                )}

                <div className="group-title">DATA</div>
                <div className="settings-item">
                    <div className="settings-item-content">
                        <div className="item-title">Storage Usage</div>
                        <div className="item-desc">Using LocalStorage</div>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>0.2 MB</div>
                </div>
            </div>
        </section>
    );
}
