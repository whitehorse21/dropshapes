'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import ApiEndpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import { BookOpen, ClipboardList, MessageSquare, FolderOpen, BookMarked, ChevronRight } from 'lucide-react';

interface CourseUnit {
  id: number;
  title: string;
  description?: string | null;
  module?: string;
  points?: string;
}

const QUICK_ACCESS = [
  { href: '/education/units', title: 'Units', description: 'Course modules', icon: BookOpen },
  { href: '/education/assignments', title: 'Assignments', description: 'Tasks & submissions', icon: ClipboardList },
  { href: '/education/discussions', title: 'Discussions', description: 'Forum threads', icon: MessageSquare },
  { href: '/education/resources', title: 'Resources', description: 'Learning materials', icon: FolderOpen },
  { href: '/education/textbook', title: 'Textbook', description: 'Course textbook', icon: BookMarked },
];

export default function EducationPage() {
  const router = useRouter();
  const [recentUnits, setRecentUnits] = useState<CourseUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const response = await axiosInstance.get(ApiEndpoints.courseUnits);
        const data = response.data as { items?: CourseUnit[] };
        const units = data?.items ?? [];
        setRecentUnits(units.slice(0, 3));
      } catch (error) {
        console.error('Error loading units:', error);
        setRecentUnits([]);
      } finally {
        setLoading(false);
      }
    };
    loadUnits();
  }, []);

  return (
    <section
      id="view-education"
      className="view-section active-view"
      aria-label="Education"
    >
      <div className="tool-page-wrap education-page">
        <header className="header-minimal">
          <h1>Education</h1>
          <p>Your personalized learning journey. Access units, assignments, and resources.</p>
        </header>

        <div className="tool-page-nav">
          <button
            type="button"
            className="btn-resume"
            onClick={() => router.push('/')}
            aria-label="Back to Home"
          >
            ← Back to Home
          </button>
          <Link
            href="/education/units"
            className="btn-resume btn-resume-primary"
            aria-label="View all units"
          >
            View all units
          </Link>
        </div>

        <section className="education-quick-access" aria-label="Quick Access">
          <h2 className="education-section-title">Quick Access</h2>
          <div className="education-quick-grid">
            {QUICK_ACCESS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="education-quick-card"
                  aria-label={`${item.title}: ${item.description}`}
                >
                  <span className="education-quick-icon" aria-hidden>
                    <Icon size={28} strokeWidth={2} />
                  </span>
                  <h3 className="education-quick-title">{item.title}</h3>
                  <p className="education-quick-desc">{item.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="education-recent" aria-label="Recent Units">
          <div className="education-recent-header">
            <h2 className="education-section-title">Recent Units</h2>
            <Link href="/education/units" className="education-view-all">
              View All
              <ChevronRight size={18} strokeWidth={2} aria-hidden />
            </Link>
          </div>
          <div className="education-units-grid">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="education-unit-card education-unit-card--skeleton">
                  <div className="education-unit-skeleton-line education-unit-skeleton-title" />
                  <div className="education-unit-skeleton-line" />
                  <div className="education-unit-skeleton-line" />
                  <div className="education-unit-skeleton-line education-unit-skeleton-short" />
                </div>
              ))
            ) : recentUnits.length > 0 ? (
              recentUnits.map((unit) => (
                <div key={unit.id} className="education-unit-card">
                  <h3 className="education-unit-title">{unit.title}</h3>
                  {unit.description && (
                    <p className="education-unit-desc">{unit.description}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="education-empty">No recent units available</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
