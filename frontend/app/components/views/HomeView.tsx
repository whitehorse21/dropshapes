"use client";

// Home View Component – Chat assistant with Claude API, history, and audio

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useChat } from "@/app/context/ChatContext";
import axiosInstance from "@/app/apimodule/axiosConfig/Axios";
import ApiEndpoints from "@/app/apimodule/endpoints/ApiEndpoints";
import ConfirmDeleteModal from "@/app/components/modals/ConfirmDeleteModal";

export default function HomeView() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    messages,
    currentConversationId,
    loading,
    setMessages,
    appendMessages,
    setConversationIdAfterSend,
    fetchConversations,
    newChat: contextNewChat,
    deleteConversation,
  } = useChat();
  const [inputVal, setInputVal] = useState("");
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTempMode, setIsTempMode] = useState(false);
  const [clearChatModalOpen, setClearChatModalOpen] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playbackUrls, setPlaybackUrls] = useState<Record<number, string>>({});
  const playbackRequestedRef = useRef<Set<number>>(new Set());
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const isChatActive = messages.length > 0;

  useEffect(() => {
    if (isAuthenticated) fetchConversations();
  }, [isAuthenticated, fetchConversations]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch playable URL for stored voice messages (S3 presigned via backend)
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.id != null && msg.audioUrl && !playbackRequestedRef.current.has(msg.id)) {
        playbackRequestedRef.current.add(msg.id);
        axiosInstance
          .get(ApiEndpoints.chatMessageAudioUrl(msg.id))
          .then((res) => setPlaybackUrls((prev) => ({ ...prev, [msg.id!]: res.data.url })))
          .catch(() => {});
      }
    });
  }, [messages]);

  // Recording duration timer
  useEffect(() => {
    if (!isRecording) {
      setRecordingSeconds(0);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      setRecordingSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSend = async () => {
    const text = inputVal.trim();
    if (!text) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setInputVal("");
    setMessages((prev) => [...prev, { text, sender: "user", timestamp: Date.now() }]);
    setSending(true);
    try {
      const res = await axiosInstance.post(ApiEndpoints.chatMessage, {
        message: text,
        conversation_id: currentConversationId,
      });
      const data = res.data;
      setConversationIdAfterSend(data.conversation_id);
      appendMessages(
        {
          id: data.user_message?.id,
          text: data.user_message?.content ?? text,
          sender: "user",
          timestamp: new Date(data.user_message?.created_at || Date.now()).getTime(),
        },
        {
          id: data.assistant_message?.id,
          text: data.assistant_message?.content ?? "",
          sender: "ai",
          timestamp: new Date(data.assistant_message?.created_at || Date.now()).getTime(),
        }
      );
      fetchConversations();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } }; message?: string };
      const detail = err.response?.data?.detail || err.message || "Failed to send message.";
      setMessages((prev) => [...prev, { text: `Error: ${detail}`, sender: "ai", timestamp: Date.now() }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startRecording = useCallback(async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      const VOICE_PLACEHOLDER = "🎤 Voice message…";
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (chunksRef.current.length === 0) {
          setIsRecording(false);
          return;
        }
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("audio", blob, "audio.webm");
        const audioUrl = URL.createObjectURL(blob);

        // Show user's voice message in chat immediately with playable audio
        setMessages((prev) => [
          ...prev,
          { text: VOICE_PLACEHOLDER, sender: "user" as const, timestamp: Date.now(), audioUrl },
        ]);
        setSending(true);
        setIsRecording(false);

        try {
          const url = currentConversationId != null
            ? `${ApiEndpoints.chatAudio}?conversation_id=${currentConversationId}`
            : ApiEndpoints.chatAudio;
          const res = await axiosInstance.post(url, form, {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 60000, // transcription + Claude can take 30–60s
          });
          const data = res.data;
          setConversationIdAfterSend(data.conversation_id);
          const userMsg = {
            id: data.user_message?.id,
            text: "Voice message",
            sender: "user" as const,
            timestamp: new Date(data.user_message?.created_at || Date.now()).getTime(),
            audioUrl: (data.user_message?.content && data.user_message.content.startsWith("http"))
              ? data.user_message.content
              : audioUrl,
          };
          const assistantMsg = {
            id: data.assistant_message?.id,
            text: data.assistant_message?.content ?? "",
            sender: "ai" as const,
            timestamp: new Date(data.assistant_message?.created_at || Date.now()).getTime(),
          };
          // Replace optimistic placeholder with real user message (with audio) + assistant reply
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            const isPlaceholder = last?.sender === "user" && last?.text === VOICE_PLACEHOLDER;
            const rest = isPlaceholder ? prev.slice(0, -1) : prev;
            return [...rest, userMsg, assistantMsg];
          });
          if (userMsg.audioUrl !== audioUrl) URL.revokeObjectURL(audioUrl);
          fetchConversations();
        } catch (err: unknown) {
          const e = err as { response?: { data?: { detail?: string } }; message?: string };
          URL.revokeObjectURL(audioUrl); // release blob URL on error
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            const isPlaceholder = last?.sender === "user" && last?.text === VOICE_PLACEHOLDER;
            const rest = isPlaceholder ? prev.slice(0, -1) : prev;
            return [
              ...rest,
              { text: `Voice error: ${e.response?.data?.detail || e.message || "Unknown"}`, sender: "ai" as const, timestamp: Date.now() },
            ];
          });
        } finally {
          setSending(false);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Microphone access failed:", e);
      setIsRecording(false);
    }
  }, [isAuthenticated, currentConversationId, router, appendMessages, setMessages, setConversationIdAfterSend, fetchConversations]);

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const clearChat = () => setClearChatModalOpen(true);

  const confirmClearChat = () => {
    if (currentConversationId != null) {
      deleteConversation(currentConversationId);
    } else {
      setMessages([]);
    }
    setClearChatModalOpen(false);
  };

  const handleNewChat = () => {
    contextNewChat();
  };

  return (
    <section
      id="view-home"
      className={`view-section active-view ${isChatActive ? "chat-active" : ""}`}
      aria-label="Home"
    >
      <div
        className={`home-content-wrapper ${isChatActive ? "chat-mode" : ""}`}
      >
        <div className="header-minimal">
          <h1>
            Hello,{" "}
            {user
              ? (user.name || user.email || user.username || "User").split(
                  " ",
                )[0]
              : "Amar"}
            .
          </h1>
          <p>How can we elevate your work today?</p>
        </div>

        <div
          id="chatContainer"
          className="chat-container"
          ref={chatContainerRef}
        >
          {loading && (
            <div className="chat-loading" aria-live="polite">
              Loading conversation…
            </div>
          )}
          {!loading && messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.sender}`}>
              <div className="chat-bubble">
                {msg.audioUrl && (
                  <audio
                    className="chat-audio-player"
                    src={msg.id && playbackUrls[msg.id] ? playbackUrls[msg.id] : msg.audioUrl}
                    controls
                    preload="metadata"
                    aria-label="Play voice message"
                  />
                )}
                {msg.text && <span className={msg.audioUrl ? "chat-bubble-text" : ""}>{msg.text}</span>}
              </div>
              <div className="chat-time">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
          {!loading && sending && (
            <div className="chat-message ai chat-typing" aria-live="polite" aria-label="Assistant is typing">
              <div className="chat-bubble chat-typing-bubble">
                <span className="chat-typing-dot" />
                <span className="chat-typing-dot" />
                <span className="chat-typing-dot" />
              </div>
            </div>
          )}
        </div>

        <div className="input-zone">
          <div className="chat-controls">
            <button
              type="button"
              className="control-btn"
              onClick={handleNewChat}
              title="New Chat"
              aria-label="Start new chat"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {isChatActive && (
              <button
                type="button"
                className="control-btn"
                onClick={clearChat}
                title="Clear Chat"
                aria-label="Clear current chat"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <button
              type="button"
              className={`control-btn ${isTempMode ? "active" : ""}`}
              id="tempModeBtn"
              onClick={() => setIsTempMode(!isTempMode)}
              title="Temporary Chat (Incognito)"
              aria-label="Toggle temporary chat"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>

          <div className="search-aura-container">
            {isRecording && (
              <div className="recording-bar" role="status" aria-live="polite">
                <span className="recording-bar-dot" aria-hidden />
                <span className="recording-bar-label">Recording</span>
                <span className="recording-bar-timer">
                  {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, "0")}
                </span>
                <button
                  type="button"
                  className="recording-bar-stop"
                  onClick={stopRecording}
                  aria-label="Stop recording"
                >
                  Stop
                </button>
              </div>
            )}
            <div className={`search-aura ${isRecording ? "search-aura-recording" : ""}`} role="search" aria-label="Main input">
              <input
                type="text"
                id="mainInput"
                placeholder={isRecording ? "Speak now…" : "Tell me what you're thinking or working on..."}
                autoComplete="off"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isRecording}
              />
              <button
                type="button"
                className={`btn-mic ${isRecording ? "recording" : ""}`}
                id="micBtn"
                aria-label={isRecording ? "Stop recording" : "Voice input"}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={sending}
              >
                {isRecording ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                className="btn-submit"
                id="submitBtn"
                aria-label="Send message"
                onClick={handleSend}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="tools-section">
          <div className="section-title">Quick Tools</div>
          <div className="grid-minimal home-tools-grid">
            <button
              type="button"
              className="tool-pill"
              onClick={() => router.push("/resumes")}
              aria-label="Resumes"
            >
              <span className="tool-pill-icon" aria-hidden>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                  <path d="M10 9H8" />
                </svg>
              </span>
              Resumes
            </button>
            <button
              type="button"
              className="tool-pill"
              onClick={() => router.push("/cover-letters")}
              aria-label="Cover Letters"
            >
              <span className="tool-pill-icon" aria-hidden>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
              </span>
              Cover Letters
            </button>
            <button
              type="button"
              className="tool-pill"
              onClick={() => router.push("/interview-training")}
              aria-label="Interview Prep Bot"
            >
              <span className="tool-pill-icon" aria-hidden>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a3 3 0 013 3v2a3 3 0 01-6 0V5a3 3 0 013-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2" />
                  <path d="M12 19v4" />
                  <path d="M8 23h8" />
                </svg>
              </span>
              Prep Bot
            </button>
            <button
              type="button"
              className="tool-pill"
              onClick={() => router.push("/grammar-check")}
              aria-label="Grammar Check / Writer"
            >
              <span className="tool-pill-icon" aria-hidden>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </span>
              Writer
            </button>
            <button
              type="button"
              className="tool-pill"
              onClick={() => router.push("/task-management")}
              aria-label="Task management"
            >
              <span className="tool-pill-icon" aria-hidden>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              </span>
              Roadmap
            </button>
            <button
              type="button"
              className="tool-pill"
              onClick={() => router.push("/text-to-speech")}
              aria-label="Text-to-Speech"
            >
              <span className="tool-pill-icon" aria-hidden>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2" />
                  <path d="M12 19v4" />
                  <path d="M8 23h8" />
                </svg>
              </span>
              Text-to-Speech
            </button>
            <button
              type="button"
              className="tool-pill"
              onClick={() => router.push("/professional-networking")}
              aria-label="Professional Networking"
            >
              <span className="tool-pill-icon" aria-hidden>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </span>
              Professional Networking
            </button>
            <button
              type="button"
              className="tool-pill"
              onClick={() => router.push("/education")}
              aria-label="Education"
            >
              <span className="tool-pill-icon" aria-hidden>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                  <path d="M8 7h8" />
                  <path d="M8 11h8" />
                </svg>
              </span>
              Education
            </button>
            <button
              type="button"
              className="tool-pill"
              onClick={() => router.push("/tools/games")}
              aria-label="Games"
            >
              <span className="tool-pill-icon" aria-hidden>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                </svg>
              </span>
              Games
            </button>
          </div>
        </div>

        <div className="privacy-shield" aria-label="Privacy status">
          <div className="pulse-dot"></div>
          <span>Secure & Private Session • End-to-End Encrypted</span>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={clearChatModalOpen}
        onClose={() => setClearChatModalOpen(false)}
        onConfirm={confirmClearChat}
        title="Clear chat?"
        message="This will clear the current conversation. This cannot be undone."
        confirmLabel="Clear"
      />
    </section>
  );
}
