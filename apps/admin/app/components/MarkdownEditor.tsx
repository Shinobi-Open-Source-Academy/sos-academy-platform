'use client';

import { useState } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

// Markdown to HTML converter
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Code blocks (preserve before other processing)
  html = html.replace(
    /```([\s\S]*?)```/gim,
    '<pre style="background: #1a1a1a; padding: 1rem; border-radius: 4px; overflow-x: auto; margin: 1rem 0;"><code>$1</code></pre>'
  );
  html = html.replace(
    /`([^`]+)`/gim,
    '<code style="background: #1a1a1a; padding: 0.2rem 0.4rem; border-radius: 3px; font-family: monospace;">$1</code>'
  );

  // Headers
  html = html.replace(
    /^#### (.*$)/gim,
    '<h4 style="font-size: 1rem; font-weight: 600; margin: 1rem 0 0.5rem 0;">$1</h4>'
  );
  html = html.replace(
    /^### (.*$)/gim,
    '<h3 style="font-size: 1.125rem; font-weight: 600; margin: 1rem 0 0.5rem 0;">$1</h3>'
  );
  html = html.replace(
    /^## (.*$)/gim,
    '<h2 style="font-size: 1.25rem; font-weight: 600; margin: 1.25rem 0 0.75rem 0;">$1</h2>'
  );
  html = html.replace(
    /^# (.*$)/gim,
    '<h1 style="font-size: 1.5rem; font-weight: 600; margin: 1.5rem 0 1rem 0;">$1</h1>'
  );

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*([^*]+)\*/gim, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/gim, '<em>$1</em>');

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/gim,
    '<a href="$2" style="color: #3b82f6; text-decoration: underline;">$1</a>'
  );

  // Horizontal rule
  html = html.replace(
    /^---$/gim,
    '<hr style="border: none; border-top: 1px solid #e9ecef; margin: 1.5rem 0;">'
  );

  // Blockquotes
  html = html.replace(
    /^> (.*$)/gim,
    '<blockquote style="border-left: 3px solid #3b82f6; padding-left: 1rem; margin: 1rem 0; color: #a1a1aa;">$1</blockquote>'
  );

  // Ordered lists
  const lines = html.split('\n');
  let inOrderedList = false;
  let orderedListItems: string[] = [];
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const orderedMatch = line.match(/^(\d+)\.\s+(.+)$/);

    if (orderedMatch) {
      if (!inOrderedList) {
        inOrderedList = true;
        orderedListItems = [];
      }
      orderedListItems.push(`<li style="margin: 0.25rem 0;">${orderedMatch[2]}</li>`);
    } else {
      if (inOrderedList) {
        processedLines.push(
          `<ol style="margin: 0.5rem 0; padding-left: 1.5rem;">${orderedListItems.join('')}</ol>`
        );
        inOrderedList = false;
        orderedListItems = [];
      }
      processedLines.push(line);
    }
  }
  if (inOrderedList) {
    processedLines.push(
      `<ol style="margin: 0.5rem 0; padding-left: 1.5rem;">${orderedListItems.join('')}</ol>`
    );
  }
  html = processedLines.join('\n');

  // Unordered lists
  let inUnorderedList = false;
  let unorderedListItems: string[] = [];
  const finalLines: string[] = [];

  for (const line of html.split('\n')) {
    const unorderedMatch = line.match(/^[-*]\s+(.+)$/);

    if (unorderedMatch) {
      if (!inUnorderedList) {
        inUnorderedList = true;
        unorderedListItems = [];
      }
      unorderedListItems.push(`<li style="margin: 0.25rem 0;">${unorderedMatch[1]}</li>`);
    } else {
      if (inUnorderedList) {
        finalLines.push(
          `<ul style="margin: 0.5rem 0; padding-left: 1.5rem;">${unorderedListItems.join('')}</ul>`
        );
        inUnorderedList = false;
        unorderedListItems = [];
      }
      finalLines.push(line);
    }
  }
  if (inUnorderedList) {
    finalLines.push(
      `<ul style="margin: 0.5rem 0; padding-left: 1.5rem;">${unorderedListItems.join('')}</ul>`
    );
  }
  html = finalLines.join('\n');

  // Line breaks - convert double newlines to paragraph breaks
  html = html
    .split(/\n\n+/)
    .map((chunk) => {
      const trimmed = chunk.trim();
      if (!trimmed) return '';

      // Don't wrap if already a block element
      if (trimmed.match(/^<(h[1-6]|ul|ol|pre|blockquote|hr)/)) {
        return trimmed;
      }

      // Convert single newlines to <br> within paragraphs
      const withBreaks = trimmed.replace(/\n/g, '<br>');
      return `<p style="margin: 0.75rem 0; line-height: 1.6;">${withBreaks}</p>`;
    })
    .filter(Boolean)
    .join('');

  return html;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Enter your message here. Markdown is supported.',
  rows = 8,
  required = false,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const previewHtml = markdownToHtml(value || '');

  return (
    <div className="border border-white/10 bg-white/5">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'edit'
              ? 'text-white border-b-2 border-blue-500 bg-white/5'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'preview'
              ? 'text-white border-b-2 border-blue-500 bg-white/5'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'edit' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            required={required}
            className="w-full bg-transparent border-none outline-none resize-none text-white placeholder-zinc-500 font-mono text-sm"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          />
        ) : (
          <div
            className="prose prose-invert max-w-none text-sm"
            style={{
              color: '#e4e4e7',
              lineHeight: '1.6',
            }}
            dangerouslySetInnerHTML={{
              __html: previewHtml || '<p class="text-zinc-500">Nothing to preview</p>',
            }}
          />
        )}
      </div>

      {/* Help text */}
      <div className="px-4 pb-3 border-t border-white/10 pt-2">
        <p className="text-xs text-zinc-500">
          <strong>Markdown supported:</strong> **bold**, *italic*, [links](url), # headers, - lists
        </p>
      </div>
    </div>
  );
}
