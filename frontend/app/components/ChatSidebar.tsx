'use client';

import React, { useEffect, useState } from 'react';
import { useUI } from '../context/UIContext';

interface ChatSession {
    id: string;
    title: string;
    date: string;
}

export default function ChatSidebar() {
    const { sidebarOpen, closeSidebar } = useUI();
    const [history, setHistory] = useState<ChatSession[]>([]);

    useEffect(() => {
        // Mock history or load from LS
        const mockHistory: ChatSession[] = [
            { id: '1', title: 'Project Planning', date: 'Just now' },
            { id: '2', title: 'React Components', date: 'Yesterday' },
            { id: '3', title: 'Life goals', date: 'Jan 4' },
        ];
        setHistory(mockHistory);
    }, []);

    return (
        <aside className={`chat-sidebar ${sidebarOpen ? 'active' : ''}`} id="chatSidebar">
            <div className="sidebar-header">
                <span>Chat History</span>
                <button className="sidebar-close" onClick={closeSidebar} aria-label="Close sidebar">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="chat-history-list" id="chatHistoryList">
                {history.map(chat => (
                    <div key={chat.id} className="history-item">
                        <div>
                            <div className="history-title">{chat.title}</div>
                            <div className="history-date">{chat.date}</div>
                        </div>
                        <button className="btn-delete-chat" title="Delete">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                ))}
            </div>
        </aside>
    );
}
