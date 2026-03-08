"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Typing speed: ms per character (smaller = faster). */
const TYPING_MS_PER_CHAR = 5;
/** Chunk size: reveal this many characters per tick. */
const TYPING_CHUNK = 4;

interface ChatMessageContentProps {
  text: string;
  sender: "user" | "ai";
  className?: string;
  /** If true, show full text immediately (e.g. when restoring from history). */
  skipTyping?: boolean;
  /** Called when displayed content changes (e.g. for scroll-into-view during typing). */
  onDisplayChange?: () => void;
}

export default function ChatMessageContent({
  text,
  sender,
  className = "",
  skipTyping = false,
  onDisplayChange,
}: ChatMessageContentProps) {
  if (!text?.trim()) return null;

  if (sender === "user") {
    return (
      <span className={className}>
        {text}
      </span>
    );
  }

  // Normalize newlines so Markdown lists/paragraphs parse correctly
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const fullLength = normalizedText.length;

  const [displayedLength, setDisplayedLength] = useState(() =>
    skipTyping ? fullLength : 0
  );
  const prevTextRef = useRef(text);

  useEffect(() => {
    if (skipTyping) {
      setDisplayedLength(fullLength);
      return;
    }
    if (text !== prevTextRef.current) {
      prevTextRef.current = text;
      setDisplayedLength(0);
    }
  }, [text, fullLength, skipTyping]);

  useEffect(() => {
    if (skipTyping || displayedLength >= fullLength) return;
    const delay = Math.max(16, Math.floor(TYPING_MS_PER_CHAR * TYPING_CHUNK));
    const id = setInterval(() => {
      setDisplayedLength((prev) => {
        const next = Math.min(prev + TYPING_CHUNK, fullLength);
        return next;
      });
    }, delay);
    return () => clearInterval(id);
  }, [displayedLength, fullLength, skipTyping]);

  useEffect(() => {
    onDisplayChange?.();
  }, [displayedLength, onDisplayChange]);

  const displayedText = normalizedText.slice(0, displayedLength);
  const isTyping = displayedLength < fullLength;

  return (
    <div className={`chat-markdown ${className}`.trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {displayedText}
      </ReactMarkdown>
      {isTyping && (
        <span className="chat-typing-cursor" aria-hidden>
          |
        </span>
      )}
    </div>
  );
}
