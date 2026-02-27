'use client';

import { LayoutTemplate, Type, List } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
// @ts-expect-error JS module
import { coverLetterTemplateMetaData } from '@/app/utils/coverLetterTemplatesMetadata';

interface CoverLetterSidebarProps {
  selectedTemplate: string;
  handleTemplateChange: (templateName: string, category: string) => void;
  font: string;
  setFont: (font: string) => void;
}

const COVERLETTER_OPTIONS = [
  { label: 'templates', icon: <LayoutTemplate className="w-5 h-5" /> },
  { label: 'fonts', icon: <Type className="w-5 h-5" /> },
  { label: 'sections', icon: <List className="w-5 h-5" /> },
];

export default function CoverLetterSidebar({
  selectedTemplate,
  handleTemplateChange,
  font,
  setFont,
}: CoverLetterSidebarProps) {
  const [activeTab, setActiveTab] = useState('templates');

  const grouped = (coverLetterTemplateMetaData as Array<{ name: string; category: string; image: string }>).reduce(
    (acc: Record<string, Array<{ name: string; category: string; image: string }>>, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="fixed left-0 top-36 h-full w-96 bg-gray-800 shadow-lg overflow-hidden z-20">
      <div className="flex h-full pt-2">
        <div className="flex flex-col gap-3 border-r border-gray-700 px-3 py-4 shrink-0">
          {COVERLETTER_OPTIONS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`p-2 rounded-md text-lg flex items-center justify-center transition ${
                activeTab === tab.label
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab.icon}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto mb-16 px-4 py-6">
          {activeTab === 'templates' && Object.keys(grouped).length > 0 && (
            <>
              {Object.entries(grouped).map(([category, templates], catIndex) => (
                <div key={catIndex} className="mb-8">
                  <h3 className="text-white font-semibold mb-4">{category}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {templates.map((item) => {
                      const cleanName = item.name.replace(/\s+/g, '');
                      const selectedClean = selectedTemplate.replace(/\s+/g, '');
                      const selectedTemplates =
                        category.toLowerCase() === 'classic'
                          ? `${cleanName}Template`
                          : `Template${cleanName}`;
                      const matchCheck = selectedTemplates === selectedClean;

                      return (
                        <div
                          key={item.name}
                          className="flex flex-col cursor-pointer items-center"
                          onClick={() =>
                            handleTemplateChange(item.name, category)
                          }
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className={`h-48 object-cover rounded ${
                              matchCheck
                                ? 'border-blue-400 border-4'
                                : 'hover:border-blue-400 border-2 border-transparent'
                            }`}
                          />
                          <span className="mt-2 text-gray-300 text-sm text-center">
                            {item.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === 'fonts' && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-gray-300">Font</h3>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Arial">Arial</option>
                <option value="roboto">Roboto</option>
                <option value="open-sans">Open Sans</option>
                <option value="inter">Inter</option>
              </select>
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="text-gray-300 space-y-3">
              <h3 className="text-white font-semibold mb-2">Sections</h3>
              <div className="flex flex-col gap-2">
                {['profile', 'introduction', 'body', 'closing'].map(
                  (section) => (
                    <Link
                      key={section}
                      href={`/cover-letters/create/${section}`}
                      className="w-full p-3 rounded-lg transition bg-gray-700 hover:bg-gray-600 text-left"
                    >
                      <span className="capitalize">{section}</span>
                    </Link>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
