'use client';

import { useState } from 'react';
import {
  Eye,
  Edit,
  Trash2,
  Copy,
  Calendar,
  MapPin,
  User,
} from 'lucide-react';

interface CoverLetterCardProps {
  coverLetter: {
    id: number;
    cover_letter_title?: string;
    cover_template_category?: string;
    status?: string;
    recipient?: {
      company_name?: string;
      job_title?: string;
      hiring_manager_name?: string;
    };
    introduction?: { greet_text?: string; intro_para?: string };
    updated_at?: string;
    created_at?: string;
  };
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => Promise<void>;
  onDuplicate: (id: number) => void;
}

export default function CoverLetterCard({
  coverLetter,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
}: CoverLetterCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(coverLetter.id);
    } catch (error) {
      console.error('Error deleting cover letter:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
  };

  const statusKey = (coverLetter.status || 'active').toLowerCase();
  const statusClass =
    statusKey === 'draft'
      ? 'cover-letter-card__status--draft'
      : statusKey === 'sent'
        ? 'cover-letter-card__status--sent'
        : 'cover-letter-card__status--active';

  return (
    <article
      className="cover-letter-card"
      aria-label={`Cover letter: ${coverLetter?.cover_letter_title || 'Untitled'}`}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
          <h3 className="cover-letter-card__title">
            {coverLetter?.cover_letter_title || 'Untitled'}
          </h3>
          <span className={`cover-letter-card__status ${statusClass}`}>
            {coverLetter.status || 'active'}
          </span>
        </div>
        <p className="cover-letter-card__meta">
          Template: {coverLetter.cover_template_category || '—'}
        </p>
      </div>

      <div className="cover-letter-card__body">
        {coverLetter.recipient?.company_name && (
          <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <MapPin style={{ width: 14, height: 14, flexShrink: 0 }} aria-hidden />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {coverLetter.recipient.company_name}
              {coverLetter.recipient.job_title ? ` • ${coverLetter.recipient.job_title}` : ''}
            </span>
          </p>
        )}
        {coverLetter.recipient?.hiring_manager_name && (
          <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <User style={{ width: 14, height: 14, flexShrink: 0 }} aria-hidden />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              To: {coverLetter.recipient.hiring_manager_name}
            </span>
          </p>
        )}
        {coverLetter?.introduction?.greet_text && (
          <p style={{ marginBottom: '6px' }}>{coverLetter.introduction.greet_text}</p>
        )}
        {coverLetter?.introduction?.intro_para && (
          <p>{stripHtml(coverLetter.introduction.intro_para)}</p>
        )}
      </div>

      <footer className="cover-letter-card__footer">
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar style={{ width: 14, height: 14, flexShrink: 0 }} aria-hidden />
          Updated {formatDate(coverLetter.updated_at || coverLetter.created_at)}
        </span>
        <div className="cover-letter-card__actions">
          <button type="button" onClick={() => onView(coverLetter.id)} title="Preview" aria-label="Preview">
            <Eye size={18} aria-hidden />
          </button>
          <button type="button" onClick={() => onEdit(coverLetter.id)} title="Edit" aria-label="Edit">
            <Edit size={18} aria-hidden />
          </button>
          <button type="button" onClick={() => onDuplicate(coverLetter.id)} title="Duplicate" aria-label="Duplicate">
            <Copy size={18} aria-hidden />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete"
            aria-label="Delete"
            style={isDeleting ? { opacity: 0.6 } : undefined}
          >
            <Trash2 size={18} aria-hidden />
          </button>
        </div>
      </footer>
    </article>
  );
}
