'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfileView() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        if (confirm('Are you sure you want to log out?')) {
            logout();
            router.push('/');
        }
    };

    const [status, setStatus] = React.useState('Online');
    const [statusColor, setStatusColor] = React.useState('var(--safe-green)');
    const [showStatusMenu, setShowStatusMenu] = React.useState(false);

    const statusOptions = [
        { label: 'Online', color: 'var(--safe-green)' },
        { label: 'Away', color: 'var(--warning)' },
        { label: 'At Work', color: 'var(--accent)' },
        { label: 'Do Not Disturb', color: 'var(--danger-red)' },
        { label: 'Offline', color: 'var(--text-tertiary)' }
    ];

    React.useEffect(() => {
        const savedStatus = localStorage.getItem('dropshapes_user_status_label');
        const savedColor = localStorage.getItem('dropshapes_user_status_color');
        if (savedStatus) setStatus(savedStatus);
        if (savedColor) setStatusColor(savedColor);
    }, []);

    const handleStatusSelect = (option: { label: string, color: string }) => {
        setStatus(option.label);
        setStatusColor(option.color);
        localStorage.setItem('dropshapes_user_status_label', option.label);
        localStorage.setItem('dropshapes_user_status_color', option.color);
        setShowStatusMenu(false);
    };

    return (
        <section id="view-profile" className="view-section active-view" aria-label="Profile">
            <div className="profile-header">
                <div className="avatar-large">
                    {user?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h1 className="profile-name">{user || 'User'}</h1>

                <div className="status-wrapper" style={{ position: 'relative' }}>
                    <div
                        className="profile-status-badge"
                        onClick={() => setShowStatusMenu(!showStatusMenu)}
                        title="Change Status"
                        style={{ cursor: 'pointer', gap: '8px', display: 'flex', alignItems: 'center' }}
                    >
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: statusColor,
                            display: 'inline-block'
                        }}></span>
                        {status}
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ opacity: 0.5 }}><path d="M19 9l-7 7-7-7" /></svg>
                    </div>

                    {showStatusMenu && (
                        <div className="status-dropdown">
                            {statusOptions.map((opt) => (
                                <button
                                    key={opt.label}
                                    className="status-option"
                                    onClick={() => handleStatusSelect(opt)}
                                >
                                    <span className="status-dot" style={{ backgroundColor: opt.color }}></span>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <p style={{ color: 'var(--text-secondary)' }}>Member since Jan 2024</p>
            </div>

            <div className="profile-stats">
                <div className="p-stat-card">
                    <span className="p-stat-val">128</span>
                    <span className="p-stat-lbl">Focus Hours</span>
                </div>
                <div className="p-stat-card">
                    <span className="p-stat-val">42</span>
                    <span className="p-stat-lbl">Notes Created</span>
                </div>
                <div className="p-stat-card">
                    <span className="p-stat-val">14</span>
                    <span className="p-stat-lbl">Day Streak</span>
                </div>
            </div>

            <div className="profile-socials">
                <a href="#" className="social-link-btn" title="Twitter">
                    <svg viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                </a>
                <a href="#" className="social-link-btn" title="Instagram">
                    <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
                <a href="#" className="social-link-btn" title="YouTube">
                    <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                </a>
                <a href="#" className="social-link-btn" title="Discord">
                    <svg viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                </a>
                <a href="#" className="social-link-btn" title="GitHub">
                    <svg viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </a>
            </div>

            <button className="btn-danger" onClick={handleLogout} style={{ maxWidth: '200px', margin: '0 auto' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Log Out
            </button>
        </section>
    );
}
