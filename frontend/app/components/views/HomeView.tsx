"use client";

// Home View Component

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useSettings } from "@/app/context/SettingsContext";
import { useUI } from "@/app/context/UIContext";
import { motion } from "framer-motion";

interface Message {
  text: string;
  sender: "user" | "ai";
  timestamp: number;
}

export default function HomeView() {
  const router = useRouter(); // Initialize router inside component
  const { user } = useAuth();
  const { toggleSidebar } = useUI();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isTempMode, setIsTempMode] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load chat history
  useEffect(() => {
    const saved = localStorage.getItem("dropshapes_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed);
        if (parsed.length > 0) setIsChatActive(true);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("dropshapes_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputVal.trim()) return;

    const newMsg: Message = {
      text: inputVal,
      sender: "user",
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setIsChatActive(true);
    setInputVal("");

    // Simulate AI response
    setTimeout(() => {
      let response = "I've saved that for you.";
      const lower = newMsg.text.toLowerCase();
      if (lower.includes("hello") || lower.includes("hi"))
        response = "Hello! Ready to focus?";

      setMessages((prev) => [
        ...prev,
        { text: response, sender: "ai", timestamp: Date.now() },
      ]);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  const clearChat = () => {
    if (confirm("Clear current chat?")) {
      setMessages([]);
      setIsChatActive(false);
      localStorage.removeItem("dropshapes_chat_history");
    }
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
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.sender}`}>
              <div className="chat-bubble">{msg.text}</div>
              <div className="chat-time">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="input-zone">
          <div className="chat-controls">
            <button
              type="button"
              className="control-btn"
              onClick={clearChat}
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
            <div className="search-aura" role="search" aria-label="Main input">
              <input
                type="text"
                id="mainInput"
                placeholder="Tell me what you're thinking or working on..."
                autoComplete="off"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                className="btn-mic"
                id="micBtn"
                aria-label="Voice input"
              >
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
    </section>
  );
}
