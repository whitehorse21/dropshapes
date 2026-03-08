"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import axiosInstance from "@/app/apimodule/axiosConfig/Axios";
import ApiEndpoints from "@/app/apimodule/endpoints/ApiEndpoints";

export interface ChatMessage {
  id?: number;
  text: string;
  sender: "user" | "ai";
  timestamp: number;
  /** Blob URL for playable voice message (user messages only) */
  audioUrl?: string;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at?: string;
}

interface ChatContextValue {
  conversations: Conversation[];
  currentConversationId: number | null;
  messages: ChatMessage[];
  loading: boolean;
  fetchConversations: () => Promise<void>;
  selectConversation: (id: number) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;
  updateConversationTitle: (id: number, title: string) => Promise<void>;
  newChat: () => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setCurrentConversationId: (id: number | null) => void;
  appendMessages: (userMsg: ChatMessage, assistantMsg: ChatMessage) => void;
  setConversationIdAfterSend: (id: number) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationIdState] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await axiosInstance.get(ApiEndpoints.chatConversations);
      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
  }, []);

  const selectConversation = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(ApiEndpoints.chatConversation(id));
      const list = res.data?.messages ?? [];
      setMessages(
        list.map((m: { id: number; role: string; content: string; created_at: string; audio_url?: string }) => {
          const isUserVoice = m.role === "user" && m.content.startsWith("http");
          const assistantAudio = m.role === "assistant" && m.audio_url ? m.audio_url : undefined;
          return {
            id: m.id,
            text: isUserVoice ? "Voice message" : m.content,
            sender: m.role === "user" ? "user" : "ai",
            timestamp: new Date(m.created_at).getTime(),
            ...(isUserVoice ? { audioUrl: m.content } : assistantAudio ? { audioUrl: assistantAudio } : {}),
          };
        })
      );
      setCurrentConversationIdState(id);
    } catch (e) {
      console.error("Failed to load conversation:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteConversation = useCallback(async (id: number) => {
    try {
      await axiosInstance.delete(ApiEndpoints.chatConversation(id));
      setConversations((prev) => prev.filter((c) => c.id !== id));
      setCurrentConversationIdState((curr) => (curr === id ? null : curr));
      if (currentConversationId === id) setMessages([]);
    } catch (e) {
      console.error(e);
    }
  }, [currentConversationId]);

  const updateConversationTitle = useCallback(async (id: number, title: string) => {
    try {
      await axiosInstance.patch(ApiEndpoints.chatConversationUpdate(id), { title: title.trim() });
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: title.trim() } : c))
      );
    } catch (e) {
      console.error(e);
    }
  }, []);

  const newChat = useCallback(() => {
    setMessages([]);
    setCurrentConversationIdState(null);
  }, []);

  const appendMessages = useCallback((userMsg: ChatMessage, assistantMsg: ChatMessage) => {
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
  }, []);

  const setConversationIdAfterSend = useCallback((id: number) => {
    setCurrentConversationIdState(id);
  }, []);

  const value: ChatContextValue = {
    conversations,
    currentConversationId,
    messages,
    loading,
    fetchConversations,
    selectConversation,
    deleteConversation,
    updateConversationTitle,
    newChat,
    setMessages,
    setCurrentConversationId: setCurrentConversationIdState,
    appendMessages,
    setConversationIdAfterSend,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
