'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import ConfirmDeleteModal from '@/app/components/modals/ConfirmDeleteModal';
const defaultForm: Record<string, string> = {
  name: '',
  username: '',
  email: '',
  phone: '',
  bio: '',
  location: '',
  website: '',
};

export default function ProfileView() {
  const { user, logout, updateUser, updateProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState(defaultForm);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: (user.name as string) ?? '',
        username: (user.username as string) ?? '',
        email: (user.email as string) ?? '',
        phone: (user.phone as string) ?? '',
        bio: (user.bio as string) ?? '',
        location: (user.location as string) ?? '',
        website: (user.website as string) ?? '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const result = await updateProfile({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
      });
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully.' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile. Please try again.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: (user.name as string) ?? '',
        username: (user.username as string) ?? '',
        email: (user.email as string) ?? '',
        phone: (user.phone as string) ?? '',
        bio: (user.bio as string) ?? '',
        location: (user.location as string) ?? '',
        website: (user.website as string) ?? '',
      });
    }
    setIsEditing(false);
    setMessage(null);
  };

  const handleLogoutClick = () => setLogoutModalOpen(true);

  const handleLogoutConfirm = () => {
    logout();
    setLogoutModalOpen(false);
    router.push('/');
  };

  const displayName = user?.name || user?.email || user?.username || 'User';
  const initial = displayName.charAt(0).toUpperCase();
  const memberSince = user?.created_at
    ? new Date(user.created_at as string).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  return (
    <section id="view-profile" className="view-section active-view" aria-label="Profile">
      <div className="profile-page-wrap">
        <div className="profile-page-nav">
          <button type="button" className="btn-resume" onClick={() => router.push('/')} aria-label="Back to Home">
            ← Back to Home
          </button>
          <button type="button" className="btn-resume" onClick={() => router.push('/settings')} aria-label="Settings">
            Settings
          </button>
        </div>

        <div className="profile-header-card">
          <div className="profile-avatar-wrap">
            {user?.profile_image ? (
              <img
                src={user.profile_image as string}
                alt=""
                className="profile-avatar-img"
                width={96}
                height={96}
              />
            ) : (
              <div className="avatar-large" aria-hidden>
                {initial}
              </div>
            )}
          </div>
          <h1 className="profile-display-name">{displayName}</h1>
          {formData.username && (
            <p className="profile-username">@{formData.username}</p>
          )}
          {memberSince && (
            <p className="profile-member-since">Member since {memberSince}</p>
          )}
        </div>

        <div className="tool-page-card profile-form-card">
          <div className="profile-form-header">
            <h2 className="profile-form-title">Account profile</h2>
            <p className="profile-form-subtitle">Manage your personal information</p>
            {!isEditing ? (
              <button type="button" className="btn-resume btn-resume-primary" onClick={() => setIsEditing(true)}>
                Edit profile
              </button>
            ) : (
              <div className="profile-form-actions">
                <button type="button" className="btn-resume" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </button>
                <button type="button" className="btn-resume btn-resume-primary" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            )}
          </div>

          {message && (
            <div
              className={`profile-message ${message.type === 'success' ? 'profile-message-success' : 'profile-message-error'}`}
              role="alert"
            >
              {message.text}
            </div>
          )}

          <div className="profile-form-grid">
            <div className="add-task-form-row">
              <label className="form-label" htmlFor="profile-name">Full name</label>
              {isEditing ? (
                <input
                  id="profile-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="auth-input"
                  placeholder="Your full name"
                />
              ) : (
                <p className="profile-field-read">{formData.name || 'Not provided'}</p>
              )}
            </div>
            <div className="add-task-form-row">
              <label className="form-label" htmlFor="profile-username">Username</label>
              {isEditing ? (
                <input
                  id="profile-username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="auth-input"
                  placeholder="Username"
                />
              ) : (
                <p className="profile-field-read">{formData.username || 'Not provided'}</p>
              )}
            </div>
            <div className="add-task-form-row">
              <label className="form-label" htmlFor="profile-email">Email</label>
              {isEditing ? (
                <input
                  id="profile-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="auth-input"
                  placeholder="Email address"
                />
              ) : (
                <p className="profile-field-read">{formData.email || 'Not provided'}</p>
              )}
            </div>
            <div className="add-task-form-row">
              <label className="form-label" htmlFor="profile-phone">Phone</label>
              {isEditing ? (
                <input
                  id="profile-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="auth-input"
                  placeholder="Phone number"
                />
              ) : (
                <p className="profile-field-read">{formData.phone || 'Not provided'}</p>
              )}
            </div>
            <div className="add-task-form-row">
              <label className="form-label" htmlFor="profile-location">Location</label>
              {isEditing ? (
                <input
                  id="profile-location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="auth-input"
                  placeholder="City, country"
                />
              ) : (
                <p className="profile-field-read">{formData.location || 'Not provided'}</p>
              )}
            </div>
            <div className="add-task-form-row">
              <label className="form-label" htmlFor="profile-website">Website</label>
              {isEditing ? (
                <input
                  id="profile-website"
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="auth-input"
                  placeholder="https://..."
                />
              ) : (
                <p className="profile-field-read">
                  {formData.website ? (
                    <a href={formData.website} target="_blank" rel="noopener noreferrer" className="profile-link">
                      {formData.website}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </p>
              )}
            </div>
            <div className="add-task-form-row profile-bio-row">
              <label className="form-label" htmlFor="profile-bio">Bio</label>
              {isEditing ? (
                <textarea
                  id="profile-bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="auth-input"
                  rows={4}
                  placeholder="Tell us about yourself"
                />
              ) : (
                <p className="profile-field-read profile-bio-read">{formData.bio || 'No bio provided'}</p>
              )}
            </div>
          </div>
        </div>

        <div className="profile-actions-bottom">
          <button type="button" className="btn-resume btn-resume-danger" onClick={handleLogoutClick} aria-label="Log out">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log out
          </button>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Log out?"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
      />
    </section>
  );
}
