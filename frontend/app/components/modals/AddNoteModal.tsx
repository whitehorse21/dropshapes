'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export interface DriveItem {
    id: number;
    content: string | null;
    created_at: string | null;
    updated_at: string | null;
}

interface AddNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: (item: DriveItem) => void;
    saveNote: (content: string) => Promise<DriveItem | null>;
}

export default function AddNoteModal({
    isOpen,
    onClose,
    onSaved,
    saveNote,
}: AddNoteModalProps) {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = content.trim();
        if (!trimmed) {
            toast.error('Enter some note content.');
            return;
        }
        setLoading(true);
        try {
            const item = await saveNote(trimmed);
            if (item) {
                onSaved(item);
                setContent('');
                toast.success('Note saved.');
                onClose();
            }
        } catch {
            // Error toast is handled in parent
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setContent('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="add-task-modal-overlay active"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
            role="presentation"
        >
            <div
                className="add-task-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-note-title"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="add-task-modal-close"
                    onClick={handleClose}
                    aria-label="Close"
                >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>

                <h2 id="add-note-title" className="add-task-modal-title">
                    New Note
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="add-task-form-row">
                        <label htmlFor="add-note-content" className="form-label">Content</label>
                        <textarea
                            id="add-note-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter your note…"
                            className="auth-input"
                            rows={5}
                            autoFocus
                        />
                    </div>
                    <div className="add-task-actions">
                        <button type="button" className="btn-resume" onClick={handleClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-resume btn-resume-primary" disabled={loading}>
                            {loading ? 'Saving…' : 'Save note'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
