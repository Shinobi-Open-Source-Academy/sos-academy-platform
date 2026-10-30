'use client';

import { useRef, useState } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  /**
   * Upload an image and resolve with its public URL. When set, images can be dropped, pasted or
   * picked, and are inserted as `![alt](url)` at the cursor.
   */
  onImageUpload?: (file: File) => Promise<string>;
}

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // keep in sync with the server limit

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Alt text for an uploaded file: its name without extension or Markdown-breaking characters */
const altText = (file: File) =>
  file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[[\]]/g, '')
    .trim() || 'image';

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

  // Images (before links, which use the same syntax). Only http(s) URLs are rendered.
  html = html.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/gim,
    (_match, alt: string, url: string) =>
      `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" style="max-width: 100%; height: auto; border-radius: 4px; margin: 0.75rem 0;" />`
  );

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
  onImageUpload,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Uploads finish after more typing: always edit the latest value
  const valueRef = useRef(value);
  valueRef.current = value;

  const update = (next: string) => {
    valueRef.current = next;
    onChange(next);
  };

  const uploadImages = async (files: File[]) => {
    if (!onImageUpload || files.length === 0) return;
    setUploadError(null);

    for (const file of files) {
      if (!IMAGE_TYPES.includes(file.type)) {
        setUploadError(`${file.name}: only PNG, JPEG, GIF and WebP images can be uploaded`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setUploadError(`${file.name}: images must be 5 MB or smaller`);
        continue;
      }

      // Show where the image will go while it uploads
      const placeholder = `![Uploading ${altText(file)}…](#uploading-${crypto.randomUUID()})`;
      const current = valueRef.current;
      const textarea = textareaRef.current;
      const position = textarea ? textarea.selectionStart : current.length;
      const before = current.slice(0, position);
      const after = current.slice(position);
      const prefix = before && !before.endsWith('\n') ? '\n' : '';
      update(`${before}${prefix}${placeholder}\n${after}`);

      setUploading((n) => n + 1);
      try {
        const url = await onImageUpload(file);
        update(valueRef.current.replace(placeholder, `![${altText(file)}](${url})`));
      } catch (error) {
        update(valueRef.current.replace(`${placeholder}\n`, '').replace(placeholder, ''));
        setUploadError(
          `${file.name}: ${error instanceof Error ? error.message : 'the upload failed, please try again'}`
        );
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const imageFiles = (list: FileList | null) =>
    Array.from(list ?? []).filter((file) => file.type.startsWith('image/') || file.size > 0);

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
            ref={textareaRef}
            value={value}
            onChange={(e) => update(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            required={required}
            className={`w-full bg-transparent outline-none resize-none text-white placeholder-zinc-500 font-mono text-sm border border-dashed transition-colors ${
              dragOver ? 'border-blue-500/60 bg-blue-500/5' : 'border-transparent'
            }`}
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
            onDragOver={(e) => {
              if (!onImageUpload || !e.dataTransfer.types.includes('Files')) return;
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              setDragOver(false);
              const files = imageFiles(e.dataTransfer.files);
              if (!onImageUpload || files.length === 0) return;
              e.preventDefault();
              // Insert where the image was dropped
              textareaRef.current?.focus();
              uploadImages(files);
            }}
            onPaste={(e) => {
              const files = imageFiles(e.clipboardData.files);
              if (!onImageUpload || files.length === 0) return;
              e.preventDefault();
              uploadImages(files);
            }}
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
      <div className="px-4 pb-3 border-t border-white/10 pt-2 space-y-1.5">
        {uploadError && (
          <p role="alert" className="text-xs text-red-400">
            {uploadError}
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-zinc-500">
            <strong>Markdown supported:</strong> **bold**, *italic*, [links](url), # headers, -
            lists{onImageUpload && ', ![images](url) — drop or paste an image to upload it'}
          </p>
          {onImageUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={IMAGE_TYPES.join(',')}
                multiple
                className="hidden"
                onChange={(e) => {
                  uploadImages(Array.from(e.target.files ?? []));
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={activeTab !== 'edit'}
                className="shrink-0 text-xs text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
              >
                {uploading > 0 ? `Uploading ${uploading}…` : '+ Image'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
