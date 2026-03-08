"use client";

// Home View Component – Chat assistant with Claude API, history, and audio

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useChat } from "@/app/context/ChatContext";
import axiosInstance from "@/app/apimodule/axiosConfig/Axios";
import ApiEndpoints from "@/app/apimodule/endpoints/ApiEndpoints";
import ConfirmDeleteModal from "@/app/components/modals/ConfirmDeleteModal";
import ChatMessageContent from "@/app/components/chat/ChatMessageContent";

export default function HomeView() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    messages,
    conversations,
    currentConversationId,
    loading,
    setMessages,
    appendMessages,
    setConversationIdAfterSend,
    fetchConversations,
    newChat: contextNewChat,
    deleteConversation,
    updateConversationTitle,
  } = useChat();
  const [inputVal, setInputVal] = useState("");
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [clearChatModalOpen, setClearChatModalOpen] = useState(false);
  const [saveTitleModalOpen, setSaveTitleModalOpen] = useState(false);
  const [saveTitleValue, setSaveTitleValue] = useState("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [responseVoice, setResponseVoice] = useState<"female" | "male">("female");
  const [playbackUrls, setPlaybackUrls] = useState<Record<number, string>>({});
  const playbackRequestedRef = useRef<Set<number>>(new Set());
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  /** When true, skip typing animation (e.g. after loading a conversation from history). Cleared when user sends a new message. */
  const [justLoadedConversation, setJustLoadedConversation] = useState(false);
  const prevLoadingRef = useRef(loading);

  const isChatActive = messages.length > 0;

  /* When a conversation finishes loading (loading true → false), show all messages without typing animation. */
  useEffect(() => {
    if (prevLoadingRef.current && !loading) setJustLoadedConversation(true);
    prevLoadingRef.current = loading;
  }, [loading]);

  /* When mounting with messages already loaded (e.g. navigated from another page after selecting a conversation), skip typing. */
  useEffect(() => {
    if (!loading && messages.length > 0) setJustLoadedConversation(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchConversations();
  }, [isAuthenticated, fetchConversations]);

  const scrollChatToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollChatToBottom();
  }, [messages, sending, scrollChatToBottom]);

  // Fetch playable URL for stored voice messages (S3 presigned via backend)
  useEffect(() => {
    messages.forEach((msg) => {
      const hasAudio =
        (msg.audioUrl != null && String(msg.audioUrl).trim() !== "") ||
        (msg.sender === "user" && msg.text === "Voice message");
      if (msg.id != null && hasAudio && !playbackRequestedRef.current.has(msg.id)) {
        playbackRequestedRef.current.add(msg.id);
        axiosInstance
          .get(ApiEndpoints.chatMessageAudioUrl(msg.id))
          .then((res) => {
            const url = res.data?.url ?? res.data?.URL;
            if (url) setPlaybackUrls((prev) => ({ ...prev, [msg.id!]: url }));
          })
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
    setJustLoadedConversation(false);
    setMessages((prev) => [
      ...prev,
      { text, sender: "user", timestamp: Date.now() },
    ]);
    setSending(true);
    try {
      const res = await axiosInstance.post(ApiEndpoints.chatMessage, {
        message: text,
        conversation_id: currentConversationId,
      });
      const data = res.data;
      setConversationIdAfterSend(data.conversation_id);
      const userMsg = {
        id: data.user_message?.id,
        text: data.user_message?.content ?? text,
        sender: "user" as const,
        timestamp: new Date(
          data.user_message?.created_at || Date.now(),
        ).getTime(),
      };
      const assistantMsg = {
        id: data.assistant_message?.id,
        text: data.assistant_message?.content ?? "",
        sender: "ai" as const,
        timestamp: new Date(
          data.assistant_message?.created_at || Date.now(),
        ).getTime(),
      };
      // Replace optimistic user message with server version, then add assistant reply (avoid duplicate user bubble)
      setMessages((prev) => {
        const withoutLast = prev.slice(0, -1);
        return [...withoutLast, userMsg, assistantMsg];
      });
      fetchConversations();
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      const detail =
        err.response?.data?.detail || err.message || "Failed to send message.";
      setMessages((prev) => [
        ...prev,
        { text: `Error: ${detail}`, sender: "ai", timestamp: Date.now() },
      ]);
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
        form.append("response_voice", responseVoice);
        const audioUrl = URL.createObjectURL(blob);

        setJustLoadedConversation(false);
        // Show user's voice message in chat immediately with playable audio
        setMessages((prev) => [
          ...prev,
          {
            text: VOICE_PLACEHOLDER,
            sender: "user" as const,
            timestamp: Date.now(),
            audioUrl,
          },
        ]);
        setSending(true);
        setIsRecording(false);

        try {
          const url =
            currentConversationId != null
              ? `${ApiEndpoints.chatAudio}?conversation_id=${currentConversationId}`
              : ApiEndpoints.chatAudio;
          const res = await axiosInstance.post(url, form, {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 60000, // transcription + Claude can take 30–60s
          });
          const data = res.data;
          setConversationIdAfterSend(data.conversation_id);
          const um = data.user_message ?? data.userMessage;
          const am = data.assistant_message ?? data.assistantMessage;
          const userContent = um?.content?.trim?.();
          const userMsg = {
            id: um?.id,
            text: "Voice message",
            sender: "user" as const,
            timestamp: new Date((um?.created_at ?? um?.createdAt) || Date.now()).getTime(),
            audioUrl: typeof userContent === "string" && userContent.length > 0 ? userContent : audioUrl,
          };
          const assistantMsg = {
            id: am?.id,
            text: am?.content ?? "",
            sender: "ai" as const,
            timestamp: new Date((am?.created_at ?? am?.createdAt) || Date.now()).getTime(),
            audioUrl: (am?.audio_url ?? am?.audioUrl) ?? undefined,
          };
          // Replace optimistic placeholder with real user message (with audio) + assistant reply
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            const isPlaceholder =
              last?.sender === "user" && last?.text === VOICE_PLACEHOLDER;
            const rest = isPlaceholder ? prev.slice(0, -1) : prev;
            return [...rest, userMsg, assistantMsg];
          });
          if (userMsg.audioUrl !== audioUrl) URL.revokeObjectURL(audioUrl);
          fetchConversations();
        } catch (err: unknown) {
          const e = err as {
            response?: { data?: { detail?: string } };
            message?: string;
          };
          URL.revokeObjectURL(audioUrl); // release blob URL on error
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            const isPlaceholder =
              last?.sender === "user" && last?.text === VOICE_PLACEHOLDER;
            const rest = isPlaceholder ? prev.slice(0, -1) : prev;
            return [
              ...rest,
              {
                text: `Voice error: ${e.response?.data?.detail || e.message || "Unknown"}`,
                sender: "ai" as const,
                timestamp: Date.now(),
              },
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
  }, [
    isAuthenticated,
    currentConversationId,
    responseVoice,
    router,
    appendMessages,
    setMessages,
    setConversationIdAfterSend,
    fetchConversations,
  ]);

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
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

  const openSaveTitleModal = () => {
    const current = conversations.find((c) => c.id === currentConversationId);
    setSaveTitleValue(current?.title ?? "New Chat");
    setSaveTitleModalOpen(true);
  };

  const confirmSaveTitle = async () => {
    if (currentConversationId != null && saveTitleValue.trim()) {
      await updateConversationTitle(
        currentConversationId,
        saveTitleValue.trim(),
      );
    }
    setSaveTitleModalOpen(false);
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
          {!loading &&
            messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.sender}`}>
                <div className="chat-bubble">
                  {((msg.audioUrl != null && msg.audioUrl !== "") ||
                    (msg.sender === "user" && msg.text === "Voice message")) &&
                    (() => {
                      const src = (msg.id != null && playbackUrls[msg.id]) || msg.audioUrl || "";
                      return src ? (
                        <audio
                          className="chat-audio-player"
                          src={src}
                          controls
                          preload="metadata"
                          aria-label="Play voice message"
                        />
                      ) : (
                        <span className="chat-audio-loading" aria-live="polite">
                          Loading audio…
                        </span>
                      );
                    })()}
                  {msg.text != null &&
                    msg.text !== "" &&
                    (msg.sender !== "user" ||
                      (!msg.audioUrl && msg.text !== "Voice message")) &&
                    (msg.sender !== "ai" || !msg.audioUrl) && (
                    <ChatMessageContent
                      text={msg.text}
                      sender={msg.sender}
                      className={msg.audioUrl ? "chat-bubble-text" : ""}
                      skipTyping={
                        justLoadedConversation ||
                        !(
                          idx === messages.length - 1 &&
                          msg.sender === "ai"
                        )
                      }
                      onDisplayChange={
                        idx === messages.length - 1 &&
                        msg.sender === "ai" &&
                        !justLoadedConversation
                          ? scrollChatToBottom
                          : undefined
                      }
                    />
                  )}
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
            <div
              className="chat-message ai chat-typing"
              aria-live="polite"
              aria-label="Assistant is typing"
            >
              <div className="chat-bubble chat-typing-bubble">
                <span className="chat-typing-dot" />
                <span className="chat-typing-dot" />
                <span className="chat-typing-dot" />
              </div>
            </div>
          )}
        </div>

        <div className="input-zone">
          <div className="chat-toolbar">
            <div className="chat-controls">
              {(currentConversationId != null || isChatActive) && (
                <button
                  type="button"
                  className="control-btn"
                  onClick={handleNewChat}
                  title="New Chat"
                  aria-label="Start new chat"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
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
              {currentConversationId != null && (
                <button
                  type="button"
                  className="control-btn"
                  onClick={openSaveTitleModal}
                  title="Save / Edit conversation name"
                  aria-label="Edit conversation name"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                </button>
              )}
            </div>
            <div className="chat-voice-setting" role="group" aria-label="Assistant reply voice">
              <span className="chat-voice-setting-label">Reply voice</span>
              <div className="chat-voice-setting-btns">
                <button
                  type="button"
                  className={`chat-voice-btn ${responseVoice === "female" ? "active" : ""}`}
                  onClick={() => setResponseVoice("female")}
                  aria-pressed={responseVoice === "female"}
                  aria-label="Female voice"
                  title="Female voice"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="12" cy="9" r="4" />
                    <path d="M12 13v8" />
                    <path d="M9 17h6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`chat-voice-btn ${responseVoice === "male" ? "active" : ""}`}
                  onClick={() => setResponseVoice("male")}
                  aria-pressed={responseVoice === "male"}
                  aria-label="Male voice"
                  title="Male voice"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="10" cy="14" r="4" />
                    <path d="M14 10l6-6" />
                    <path d="M20 4v6h-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="search-aura-container">
            {isRecording && (
              <div className="recording-bar" role="status" aria-live="polite">
                <span className="recording-bar-dot" aria-hidden />
                <span className="recording-bar-label">Recording</span>
                <span className="recording-bar-timer">
                  {Math.floor(recordingSeconds / 60)}:
                  {(recordingSeconds % 60).toString().padStart(2, "0")}
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
            <div
              className={`search-aura ${isRecording ? "search-aura-recording" : ""}`}
              role="search"
              aria-label="Main input"
            >
              <input
                type="text"
                id="mainInput"
                placeholder={
                  isRecording
                    ? "Speak now…"
                    : "Tell me what you're thinking or working on..."
                }
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
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
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
              onClick={() => router.push("/job")}
              aria-label="Job – Resumes & Cover Letters"
            >
              <span className="tool-pill-icon-wrap tool-pill-icon--blue" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              Job
            </button>
            <button
              type="button"
              className="tool-pill"
              onClick={() => router.push("/interview-training")}
              aria-label="Interview Prep Bot"
            >
              <span className="tool-pill-icon-wrap tool-pill-icon--amber" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <span className="tool-pill-icon-wrap tool-pill-icon--teal" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <span className="tool-pill-icon-wrap tool-pill-icon--indigo" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <span className="tool-pill-icon-wrap tool-pill-icon--pink" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <span className="tool-pill-icon-wrap tool-pill-icon--cyan" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <span className="tool-pill-icon-wrap tool-pill-icon--green" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
              <span className="tool-pill-icon-wrap tool-pill-icon--yellow" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      {saveTitleModalOpen && (
        <div
          className="add-task-modal-overlay active"
          onClick={(e) =>
            e.target === e.currentTarget && setSaveTitleModalOpen(false)
          }
          role="presentation"
        >
          <div
            className="add-task-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-title-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="add-task-modal-close"
              onClick={() => setSaveTitleModalOpen(false)}
              aria-label="Close"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <h2 id="save-title-title" className="add-task-modal-title">
              Edit conversation name
            </h2>
            <input
              type="text"
              className="auth-input add-task-form-row"
              value={saveTitleValue}
              onChange={(e) => setSaveTitleValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmSaveTitle()}
              placeholder="Conversation name"
              maxLength={500}
              autoFocus
            />
            <div className="add-task-actions">
              <button
                type="button"
                className="btn-resume"
                onClick={() => setSaveTitleModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-resume"
                onClick={confirmSaveTitle}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
