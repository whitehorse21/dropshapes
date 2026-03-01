'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Mail } from 'lucide-react';
import apiService from '@/app/apimodule/utils/apiService';
import endpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import ConfirmDeleteModal from '@/app/components/modals/ConfirmDeleteModal';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  created_at: string;
}

export default function AdminContactsPage() {
  const [inquiries, setInquiries] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await apiService.get(endpoints.adminContactList);
      setInquiries(Array.isArray(res.data) ? res.data : []);
    } catch {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const openDetail = (inquiry: Contact) => setSelected(inquiry);
  const confirmDelete = (id: number) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const doDelete = async () => {
    if (deletingId == null) return;
    try {
      await apiService.delete(endpoints.adminContactDelete(deletingId));
      if (selected?.id === deletingId) setSelected(null);
      setDeletingId(null);
      setDeleteModalOpen(false);
      await fetchInquiries();
    } catch {
      setDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1>Contact Inquiries</h1>
        <p>View and manage form submissions</p>
      </div>

      <section className="admin-section-card" aria-labelledby="admin-contacts-heading">
        <div className="admin-section-card-header">
          <Mail className="admin-section-card-icon" aria-hidden />
          <h2 id="admin-contacts-heading" className="admin-section-card-title">
            Inquiries
          </h2>
          <p className="admin-section-card-desc">
            Click a row to view details or delete.
          </p>
        </div>
        <div className="admin-section-card-body">
          <div className="admin-section-table-wrap">
            <table className="admin-section-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th className="hidden sm:table-cell">Phone</th>
                  <th>Subject</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="admin-section-loading-cell">
                      <Loader2 className="admin-section-spinner" aria-hidden />
                      <span>Loading inquiries…</span>
                    </td>
                  </tr>
                ) : inquiries.length > 0 ? (
                  inquiries.map((inquiry) => (
                    <tr
                      key={inquiry.id}
                      className="cursor-pointer"
                      onClick={() => openDetail(inquiry)}
                    >
                      <td className="font-medium text-[var(--text-primary)]">{inquiry.name}</td>
                      <td className="text-[var(--text-secondary)]">{inquiry.email}</td>
                      <td className="text-[var(--text-secondary)] hidden sm:table-cell">{inquiry.phone ?? '—'}</td>
                      <td className="text-[var(--text-secondary)] max-w-[180px] truncate">{inquiry.subject ?? '—'}</td>
                      <td className="text-[var(--text-tertiary)] text-xs sm:text-sm">{formatDate(inquiry.created_at)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => confirmDelete(inquiry.id)}
                          className="text-[var(--danger-red)] hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="admin-section-empty-cell">
                      <p>No inquiries found</p>
                      <span>Form submissions will appear here</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          style={{ paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-detail-title"
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="contact-detail-title" className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-4">
              Contact inquiry
            </h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-[var(--surface)] p-3">
                <p className="text-sm text-[var(--text-secondary)]">From</p>
                <p className="font-medium text-[var(--text-primary)]">{selected.name}</p>
                <p className="text-sm text-[var(--accent)]">{selected.email}</p>
                {selected.phone && <p className="text-sm text-[var(--text-secondary)]">{selected.phone}</p>}
              </div>
              {selected.subject && (
                <div className="rounded-lg bg-[var(--surface)] p-3">
                  <p className="text-sm text-[var(--text-secondary)]">Subject</p>
                  <p className="text-[var(--text-primary)]">{selected.subject}</p>
                </div>
              )}
              {selected.message && (
                <div className="rounded-lg bg-[var(--surface)] p-3">
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Message</p>
                  <p className="text-[var(--text-primary)] whitespace-pre-wrap">{selected.message}</p>
                </div>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Received {formatDate(selected.created_at)}</p>
            </div>
            <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="btn-action w-full sm:w-auto px-4 py-2"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => { confirmDelete(selected.id); setSelected(null); }}
                className="btn-action w-full sm:w-auto px-4 py-2 bg-[var(--danger-red)]/20 border-[var(--danger-red)] text-[var(--danger-red)]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingId(null); }}
        onConfirm={doDelete}
        title="Delete inquiry?"
        message="This contact inquiry will be permanently deleted."
        confirmLabel="Delete"
      />
    </div>
  );
}
