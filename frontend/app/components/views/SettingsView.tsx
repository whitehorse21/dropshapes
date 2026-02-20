'use client';

// Settings View Component

import React from 'react';
import { useSettings, Settings } from '@/app/context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

export default function SettingsView() {
    const { settings, toggleSetting } = useSettings();
    const { user, login } = useAuth();

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        login(e.target.value);
    };

    const handleSubscription = () => {
        alert('Subscription portal coming soon via Stripe/Gumroad integration.');
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

                <div className="settings-item">
                    <div className="settings-item-content">
                        <div className="item-title">Display Name</div>
                        <div className="item-desc">How you appear in the app</div>
                    </div>
                    <input
                        type="text"
                        className="input-clean"
                        value={user || ''}
                        onChange={handleNameChange}
                        aria-label="Display name"
                    />
                </div>

                {renderSwitch('Light Mode', 'Switch between dark and light themes', 'theme')}

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

                <div className="group-title">NOTIFICATIONS</div>
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
