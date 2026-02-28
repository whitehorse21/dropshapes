'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useUI } from '../context/UIContext';
import { useChat } from '../context/ChatContext';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';

function formatChatDate(created_at: string): string {
  if (!created_at) return '';
  const d = new Date(created_at);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export default function ChatSidebar() {
  const { sidebarOpen, closeSidebar } = useUI();
  const { conversations, currentConversationId, fetchConversations, selectConversation, deleteConversation } = useChat();
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSelect = (id: number) => {
    selectConversation(id);
    closeSidebar();
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeleteModalId(id);
  };

  const confirmDelete = () => {
    if (deleteModalId != null) {
      deleteConversation(deleteModalId);
      setDeleteModalId(null);
    }
  };

  return (
    <aside className={`chat-sidebar ${sidebarOpen ? 'active' : ''}`} id="chatSidebar">
      <div className="sidebar-header">
        <span>Chat History</span>
        <button className="sidebar-close" onClick={closeSidebar} aria-label="Close sidebar">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="chat-history-list" id="chatHistoryList">
        {conversations.length === 0 && (
          <p className="chat-history-empty">No chat history yet.</p>
        )}
        {conversations.map((chat) => (
          <div
            key={chat.id}
            className={`history-item ${currentConversationId === chat.id ? 'active' : ''}`}
            onClick={() => handleSelect(chat.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleSelect(chat.id)}
          >
            <div>
              <div className="history-title">{chat.title}</div>
              <div className="history-date">{formatChatDate(chat.created_at)}</div>
            </div>
            <button
              type="button"
              className="btn-delete-chat"
              title="Delete"
              onClick={(e) => handleDeleteClick(e, chat.id)}
              aria-label={`Delete ${chat.title}`}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        ))}
      </div>

      {typeof document !== 'undefined' &&
        deleteModalId != null &&
        createPortal(
          <ConfirmDeleteModal
            isOpen
            onClose={() => setDeleteModalId(null)}
            onConfirm={confirmDelete}
            title="Delete conversation?"
            message="This will clear all chats in this conversation. This cannot be undone."
            confirmLabel="Delete"
          />,
          document.body
        )}
    </aside>
  );
}
