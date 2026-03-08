"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageContentProps {
  text: string;
  sender: "user" | "ai";
  className?: string;
}

export default function ChatMessageContent({
  text,
  sender,
  className = "",
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

  return (
    <div className={`chat-markdown ${className}`.trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {normalizedText}
      </ReactMarkdown>
    </div>
  );
}
