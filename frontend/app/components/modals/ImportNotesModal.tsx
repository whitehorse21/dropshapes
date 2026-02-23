"use client";

import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";

type PasteMode = "single" | "split-dash" | "split-double";

const PASTE_MODE_OPTIONS: { value: PasteMode; label: string }[] = [
  { value: "single", label: "One note (entire text)" },
  { value: "split-dash", label: "Multiple notes (split by ---)" },
  { value: "split-double", label: "Multiple notes (split by blank lines)" },
];

export interface DriveItem {
  id: number;
  content: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const MAX_IMPORT = 100;
const ACCEPT_FILES = ".txt,.md,text/plain,text/markdown";

interface ImportNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: (items: DriveItem[]) => void;
  importNotes: (contents: string[]) => Promise<DriveItem[] | null>;
}

/** Normalize line endings to \n so splits work on Windows (\\r\\n) and pasted content */
function normalizeLineEndings(s: string): string {
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/** Split by "---" (2+ dashes) anywhere in text; optional spaces around it. No line breaks required. */
const SPLIT_BY_DASH_REGEX = /\s*[-–—]{2,}\s*/g;

function parsePastedText(text: string, mode: PasteMode): string[] {
  const normalized = normalizeLineEndings(text);
  const trimmed = normalized.trim();
  if (!trimmed) return [];

  if (mode === "single") {
    return [trimmed];
  }

  if (mode === "split-dash") {
    // Separator is just --- in the text (2+ dashes, optional spaces around). No line break required.
    const parts = trimmed.split(SPLIT_BY_DASH_REGEX);
    return parts.map((s) => s.trim()).filter(Boolean);
  }

  // split-double: one note per paragraph (paragraphs separated by one or more blank lines)
  const lines = trimmed.split("\n");
  const notes: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    const isEmpty = line.trim() === "";
    if (isEmpty) {
      const content = current.join("\n").trim();
      if (content) {
        notes.push(content);
        current = [];
      }
    } else {
      current.push(line);
    }
  }
  const last = current.join("\n").trim();
  if (last) notes.push(last);
  return notes;
}

export default function ImportNotesModal({
  isOpen,
  onClose,
  onImported,
  importNotes,
}: ImportNotesModalProps) {
  const [mode, setMode] = useState<"files" | "paste">("files");
  const [pastedText, setPastedText] = useState("");
  const [pasteSplitMode, setPasteSplitMode] = useState<PasteMode>("single");
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [fileContents, setFileContents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pasteModeOpen, setPasteModeOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteModeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pasteModeOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pasteModeRef.current &&
        !pasteModeRef.current.contains(e.target as Node)
      ) {
        setPasteModeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pasteModeOpen]);

  const getContentsToImport = (): string[] => {
    if (mode === "paste") {
      return parsePastedText(pastedText, pasteSplitMode);
    }
    return fileContents.filter((c) => c.trim().length > 0);
  };

  const contents = getContentsToImport();
  const count = contents.length;
  const canImport = count > 0 && count <= MAX_IMPORT;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) {
      setFileNames([]);
      setFileContents([]);
      return;
    }
    const names: string[] = [];
    const readerPromises: Promise<string>[] = [];
    for (let i = 0; i < Math.min(files.length, MAX_IMPORT); i++) {
      const file = files[i];
      names.push(file.name);
      readerPromises.push(
        new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve((r.result as string) || "");
          r.onerror = () => reject(new Error("Failed to read file"));
          r.readAsText(file, "UTF-8");
        }),
      );
    }
    Promise.all(readerPromises).then(
      (results) => {
        setFileNames(names);
        setFileContents(results);
      },
      () => {
        toast.error("Could not read one or more files.");
        setFileNames([]);
        setFileContents([]);
      },
    );
    e.target.value = "";
  };

  const handleImport = async () => {
    // Compute contents at click time from current state (avoids stale closure)
    const contentsToSend =
      mode === "paste"
        ? parsePastedText(pastedText, pasteSplitMode)
        : fileContents.filter((c) => c.trim().length > 0);
    if (!contentsToSend.length || contentsToSend.length > MAX_IMPORT) return;
    setLoading(true);
    try {
      const created = await importNotes(contentsToSend);
      if (created?.length) {
        onImported(created);
        toast.success(
          `${created.length} note${created.length === 1 ? "" : "s"} imported.`,
        );
        handleClose();
      }
    } catch {
      // Error toast in parent
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMode("files");
    setPastedText("");
    setPasteSplitMode("single");
    setFileNames([]);
    setFileContents([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        className="add-task-modal drive-import-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-notes-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="add-task-modal-close"
          onClick={handleClose}
          aria-label="Close"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <h2 id="import-notes-title" className="add-task-modal-title">
          Import Notes
        </h2>

        <div className="add-task-form-row">
          <div className="drive-import-tabs">
            <button
              type="button"
              className={`drive-import-tab ${mode === "files" ? "active" : ""}`}
              onClick={() => setMode("files")}
            >
              Upload files
            </button>
            <button
              type="button"
              className={`drive-import-tab ${mode === "paste" ? "active" : ""}`}
              onClick={() => setMode("paste")}
            >
              Paste text
            </button>
          </div>
        </div>

        {mode === "files" && (
          <div className="add-task-form-row">
            <label className="form-label">
              .txt or .md files (one note per file)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_FILES}
              multiple
              onChange={handleFileChange}
              className="drive-import-file-input"
            />
            {fileNames.length > 0 && (
              <p className="drive-import-file-hint">
                {fileNames.length} file{fileNames.length === 1 ? "" : "s"}{" "}
                selected.
                {fileNames.length > MAX_IMPORT &&
                  ` Only first ${MAX_IMPORT} will be imported.`}
              </p>
            )}
          </div>
        )}

        {mode === "paste" && (
          <>
            <div className="add-task-form-row">
              <label htmlFor="import-paste-content" className="form-label">
                Paste text
              </label>
              <textarea
                id="import-paste-content"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your notes here…"
                className="auth-input"
                rows={6}
              />
            </div>
            <div
              className="add-task-form-row drive-import-create-row"
              ref={pasteModeRef}
            >
              <label id="import-paste-mode-label" className="form-label">
                Create notes
              </label>
              <div className="add-task-priority-select">
                <button
                  type="button"
                  className="add-task-priority-trigger auth-input"
                  onClick={() => setPasteModeOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={pasteModeOpen}
                  aria-labelledby="import-paste-mode-label"
                >
                  <span className="drive-import-trigger-text">
                    {PASTE_MODE_OPTIONS.find((o) => o.value === pasteSplitMode)
                      ?.label ?? "One note (entire text)"}
                  </span>
                  <svg
                    className="add-task-priority-chevron"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {pasteModeOpen && (
                  <ul
                    className="add-task-priority-dropdown"
                    role="listbox"
                    aria-labelledby="import-paste-mode-label"
                  >
                    {PASTE_MODE_OPTIONS.map((opt) => (
                      <li
                        key={opt.value}
                        role="option"
                        aria-selected={pasteSplitMode === opt.value}
                        className="add-task-priority-option"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setPasteSplitMode(opt.value);
                          setPasteModeOpen(false);
                        }}
                      >
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}

        {count > 0 && (
          <p className="drive-import-count">
            {count} note{count === 1 ? "" : "s"} to import
            {count > MAX_IMPORT && (
              <span className="drive-import-count-warn">
                {" "}
                (max {MAX_IMPORT})
              </span>
            )}
          </p>
        )}

        <div className="add-task-actions">
          <button type="button" className="btn-resume" onClick={handleClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-resume btn-resume-primary"
            disabled={!canImport || loading}
            onClick={handleImport}
          >
            {loading
              ? "Importing…"
              : count > 0
                ? `Import ${count} note${count !== 1 ? "s" : ""}`
                : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
