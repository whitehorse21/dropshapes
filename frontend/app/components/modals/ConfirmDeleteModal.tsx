'use client';

import React from 'react';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    loading?: boolean;
}

export default function ConfirmDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Delete note?',
    message = 'This note will be permanently deleted. This cannot be undone.',
    confirmLabel = 'Delete',
    loading = false,
}: ConfirmDeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="add-task-modal-overlay active"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            role="presentation"
        >
            <div
                className="add-task-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-delete-title"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="add-task-modal-close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>

                <h2 id="confirm-delete-title" className="add-task-modal-title">
                    {title}
                </h2>
                <p className="confirm-delete-message">{message}</p>

                <div className="add-task-actions">
                    <button type="button" className="btn-resume" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn-resume btn-resume-danger"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Deleting…' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
