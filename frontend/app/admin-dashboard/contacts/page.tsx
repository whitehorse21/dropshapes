'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
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
        <p>View & manage form submissions</p>
      </div>

      <div className="group-title">INQUIRIES</div>
      <div className="admin-table-wrap">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
              <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Name</th>
              <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Email</th>
              <th className="px-4 py-3 font-medium text-[var(--text-primary)] hidden sm:table-cell">Phone</th>
              <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Subject</th>
              <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Created</th>
              <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--accent)]" aria-hidden />
                </td>
              </tr>
            ) : inquiries.length > 0 ? (
              inquiries.map((inquiry) => (
                <tr
                  key={inquiry.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--card-hover)] cursor-pointer"
                  onClick={() => openDetail(inquiry)}
                >
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{inquiry.name}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{inquiry.email}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] hidden sm:table-cell">{inquiry.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] max-w-[180px] truncate">{inquiry.subject ?? '—'}</td>
                  <td className="px-4 py-3 text-[var(--text-tertiary)] text-xs sm:text-sm">{formatDate(inquiry.created_at)}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  No inquiries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
