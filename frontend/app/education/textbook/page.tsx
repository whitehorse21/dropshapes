'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Textbook {
  id: number;
  title: string;
  author: string;
  description: string;
  chapters: string[];
  currentChapter: number;
  progress: number;
}

const MOCK_TEXTBOOKS: Textbook[] = [
  {
    id: 1,
    title: 'Modern React Development',
    author: 'John Smith',
    description: 'A comprehensive guide to building modern web applications with React.',
    chapters: ['Introduction to React', 'Components and Props', 'State Management', 'Hooks in Depth', 'Testing React Applications'],
    currentChapter: 3,
    progress: 60,
  },
  {
    id: 2,
    title: 'Advanced Web Development Patterns',
    author: 'Jane Doe',
    description: 'Learn advanced patterns and best practices for web development.',
    chapters: ['Modern JavaScript Features', 'Architectural Patterns', 'Performance Optimization', 'Security Best Practices', 'Deployment Strategies'],
    currentChapter: 2,
    progress: 40,
  },
];

export default function EducationTextbookPage() {
  const router = useRouter();
  const [textbooks] = useState<Textbook[]>(MOCK_TEXTBOOKS);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddTextbook = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddForm(false);
  };

  return (
    <section id="view-education-textbook" className="view-section active-view" aria-label="Textbook">
      <div className="tool-page-wrap education-page">
        <header className="header-minimal">
          <h1>Course Textbooks</h1>
          <p>Course textbook and readings</p>
        </header>

        <div className="tool-page-nav">
          <button type="button" className="btn-resume" onClick={() => router.push('/education')} aria-label="Back to Education">
            ← Back to Education
          </button>
          <button type="button" className="btn-resume btn-resume-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Hide Form' : 'Add Textbook'}
          </button>
          <Link href="/education" className="btn-resume btn-resume-primary">Back to Education home</Link>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddTextbook} className="education-form-card">
            <div className="education-form">
              <div className="education-form-group">
                <label className="education-form-label">Textbook Title</label>
                <input type="text" name="title" required className="auth-input" />
              </div>
              <div className="education-form-group">
                <label className="education-form-label">Author</label>
                <input type="text" name="author" required className="auth-input" />
              </div>
              <div className="education-form-group">
                <label className="education-form-label">Description</label>
                <textarea name="description" required rows={3} className="auth-input" />
              </div>
              <div className="education-form-group">
                <label className="education-form-label">Chapters</label>
                <div className="education-form-row">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <input key={i} type="text" name={`chapter${i}`} placeholder={`Chapter ${i} Title`} className="auth-input" />
                  ))}
                </div>
              </div>
              <div className="education-form-actions">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-resume">Cancel</button>
                <button type="submit" className="btn-resume btn-resume-primary">Add Textbook</button>
              </div>
            </div>
          </form>
        )}

        <div className="education-list">
          {textbooks.map((textbook) => (
            <div key={textbook.id} className="education-card education-card--textbook">
              <div className="education-card__header">
                <div>
                  <h3 className="education-card__title">{textbook.title}</h3>
                  <p className="education-card__meta">By {textbook.author}</p>
                </div>
                <span className="education-badge">{textbook.progress}% Complete</span>
              </div>
              <p className="education-card__body">{textbook.description}</p>
              <div className="education-progress">
                <div className="education-progress__labels">
                  <span>Reading Progress</span>
                  <span>Chapter {textbook.currentChapter} of {textbook.chapters.length}</span>
                </div>
                <div className="education-progress__bar">
                  <div className="education-progress__fill" style={{ width: `${textbook.progress}%` }} />
                </div>
              </div>
              <div className="education-textbook-chapters">
                <h4 className="education-section-title">Chapters</h4>
                <div className="education-textbook-chapters-grid">
                  {textbook.chapters.map((chapter, index) => (
                    <div
                      key={index}
                      className={`education-textbook-chapter ${index + 1 === textbook.currentChapter ? 'education-textbook-chapter--current' : ''}`}
                    >
                      <span className="education-textbook-chapter-num">{index + 1}</span>
                      <span>{chapter}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="education-card__footer">
                <button type="button" className="btn-resume">Download PDF</button>
                <button type="button" className="btn-resume btn-resume-primary">Continue Reading</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
