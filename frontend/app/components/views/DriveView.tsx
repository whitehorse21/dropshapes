'use client';

import React, { useState, useEffect } from 'react';

interface SavedFile {
    id: number;
    content: string;
    date: string;
}

export default function DriveView() {
    const [files, setFiles] = useState<SavedFile[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('dropshapes_files');
        if (saved) {
            try {
                setFiles(JSON.parse(saved));
            } catch (e) {
                console.error('Error parsing files', e);
            }
        }
    }, []);

    const createNewFile = () => {
        // Basic implementation - in real app would open editor
        const text = prompt("Enter note content:");
        if (!text) return;

        const newFile: SavedFile = {
            id: Date.now(),
            content: text,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        const updated = [newFile, ...files];
        setFiles(updated);
        localStorage.setItem('dropshapes_files', JSON.stringify(updated));
    };

    const deleteFile = (id: number) => {
        if (confirm('Delete this note?')) {
            const updated = files.filter(f => f.id !== id);
            setFiles(updated);
            localStorage.setItem('dropshapes_files', JSON.stringify(updated));
        }
    };

    const importFiles = () => {
        alert('Import feature coming soon');
    };

    return (
        <section id="view-drive" className="view-section active-view" aria-label="Drive">
            <div className="drive-header">
                <div>
                    <h1 className="header-minimal" style={{ textAlign: 'left', margin: 0 }}>Drive</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>All your saved thoughts and files</p>
                </div>
                <div className="drive-actions">
                    <button type="button" className="btn-primary" onClick={createNewFile}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                        New Note
                    </button>
                    <button type="button" className="btn-secondary" onClick={importFiles}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2 2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                        Import
                    </button>
                </div>
            </div>
            <div id="drive-container" className="drive-grid">
                {files.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📂</div>
                        <h3>No files yet</h3>
                        <p>Create a new note or start a chat to save content.</p>
                    </div>
                ) : (
                    files.map(file => (
                        <div key={file.id} className="card file-card">
                            <div>
                                <div className="file-header">
                                    <div className="file-icon">📝</div>
                                    <div className="file-actions">
                                        <button className="btn-icon delete" onClick={() => deleteFile(file.id)} title="Delete">
                                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="file-content">{file.content}</div>
                            </div>
                            <div className="file-meta">
                                <span>Text Note</span>
                                <span>{file.date}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
