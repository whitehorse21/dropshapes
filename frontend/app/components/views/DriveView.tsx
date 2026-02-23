"use client";

import React, { useState, useEffect, useCallback } from "react";
import ApiEndpoints from "@/app/apimodule/endpoints/ApiEndpoints";
import axiosInstance from "@/app/apimodule/axiosConfig/Axios";
import { toast } from "react-hot-toast";
import AddNoteModal from "@/app/components/modals/AddNoteModal";
import ImportNotesModal from "@/app/components/modals/ImportNotesModal";
import ConfirmDeleteModal from "@/app/components/modals/ConfirmDeleteModal";

export interface DriveItem {
  id: number;
  content: string | null;
  created_at: string | null;
  updated_at: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function normalizeErrorMessage(detail: unknown): string {
  if (detail == null) return "Something went wrong.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return (
      detail
        .map((e) =>
          typeof e === "string" ? e : ((e as { msg?: string })?.msg ?? ""),
        )
        .filter(Boolean)
        .join(" ") || "Something went wrong."
    );
  if (typeof detail === "object" && "msg" in (detail as object))
    return String((detail as { msg: unknown }).msg);
  return String(detail);
}

const driveBase = ApiEndpoints.drive?.replace(/\/$/, "") ?? "drive";

export default function DriveView() {
  const [items, setItems] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get<DriveItem[]>(
        ApiEndpoints.drive ?? "drive/",
      );
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e: unknown) {
      const raw =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { detail?: string | string[] } } })
              .response?.data?.detail
          : "Failed to load drive";
      setError(normalizeErrorMessage(raw));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const saveNote = useCallback(
    async (content: string): Promise<DriveItem | null> => {
      try {
        const res = await axiosInstance.post<DriveItem>(
          ApiEndpoints.drive ?? "drive/",
          { content },
        );
        return res.data;
      } catch (e: unknown) {
        const raw =
          e && typeof e === "object" && "response" in e
            ? (e as { response?: { data?: { detail?: string | string[] } } })
                .response?.data?.detail
            : "Failed to create note";
        toast.error(normalizeErrorMessage(raw));
        return null;
      }
    },
    [],
  );

  const importNotes = useCallback(
    async (contents: string[]): Promise<DriveItem[] | null> => {
      if (!contents.length) return null;
      try {
        const res = await axiosInstance.post<DriveItem[]>(
          ApiEndpoints.driveImport ?? "drive/import",
          { contents },
        );
        return Array.isArray(res.data) ? res.data : [];
      } catch (e: unknown) {
        const raw =
          e && typeof e === "object" && "response" in e
            ? (e as { response?: { data?: { detail?: string | string[] } } })
                .response?.data?.detail
            : "Failed to import notes";
        toast.error(normalizeErrorMessage(raw));
        return null;
      }
    },
    [],
  );

  const openNewNoteModal = () => {
    setError(null);
    setNoteModalOpen(true);
  };

  const openDeleteModal = (id: number) => {
    setError(null);
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTargetId(null);
  };

  const confirmDelete = async () => {
    if (deleteTargetId == null) return;
    setDeleteLoading(true);
    setError(null);
    try {
      await axiosInstance.delete(`${driveBase}/${deleteTargetId}`);
      setItems((prev) => prev.filter((f) => f.id !== deleteTargetId));
      toast.success("Note deleted.");
      closeDeleteModal();
    } catch (e: unknown) {
      const raw =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { detail?: string | string[] } } })
              .response?.data?.detail
          : "Failed to delete";
      const msg = normalizeErrorMessage(raw);
      setError(msg);
      toast.error(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openImportModal = () => {
    setError(null);
    setImportModalOpen(true);
  };

  return (
    <section
      id="view-drive"
      className="view-section active-view"
      aria-label="Drive"
    >
      <AddNoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onSaved={(item) => setItems((prev) => [item, ...prev])}
        saveNote={saveNote}
      />
      <ImportNotesModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImported={(created) => setItems((prev) => [...created, ...prev])}
        importNotes={importNotes}
      />
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete note?"
        message="This note will be permanently deleted. This cannot be undone."
        confirmLabel="Delete"
        loading={deleteLoading}
      />
      <div className="drive-header">
        <div className="header-minimal drive-title-block">
          <h1>Drive</h1>
          <p>All your saved thoughts and files</p>
        </div>
        <div className="drive-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={openNewNoteModal}
            disabled={loading}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 4v16m8-8H4" />
            </svg>
            New Note
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={openImportModal}
            disabled={loading}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2 2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            Import
          </button>
        </div>
      </div>

      {error && (
        <div className="drive-error-banner" role="alert">
          <p className="drive-error-message">{error}</p>
          <div className="drive-error-actions">
            <button
              type="button"
              className="drive-error-retry"
              onClick={() => {
                setError(null);
                fetchItems();
              }}
            >
              Retry
            </button>
            <button
              type="button"
              className="drive-error-dismiss"
              onClick={() => setError(null)}
              aria-label="Dismiss"
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div id="drive-container" className="drive-grid">
        {loading ? (
          <div className="empty-state">
            <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📂</div>
            <h3>No notes yet</h3>
            <p>Click &ldquo;New Note&rdquo; to add your first note.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="card file-card">
              <div>
                <div className="file-header">
                  <div className="file-icon">📝</div>
                  <div className="file-actions">
                    <button
                      className="btn-icon delete"
                      onClick={() => openDeleteModal(item.id)}
                      title="Delete"
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="file-content">{item.content ?? "—"}</div>
              </div>
              <div className="file-meta">
                <span>Text Note</span>
                <span>{formatDate(item.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
