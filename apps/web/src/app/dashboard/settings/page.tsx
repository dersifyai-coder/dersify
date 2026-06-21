'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Lock } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface LearnerSource {
  id:            string;
  topic:         string;
  sourceType:    'pdf' | 'url' | 'youtube';
  title:         string;
  status:        'processing' | 'ready' | 'failed';
  chunkCount:    number;
  errorMessage?: string | null;
  createdAt:     string;
}

function buildApiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  const apiBase = base.endsWith('/api/v1') ? base : `${base}/api/v1`;
  return `${apiBase}${p}`;
}

async function apiBrowserFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(buildApiUrl(path), {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  const body = (await res.json()) as { data: T };
  return body.data;
}

const SOURCE_TYPE_LABEL: Record<LearnerSource['sourceType'], string> = {
  pdf:     'PDF',
  url:     'URL',
  youtube: 'YouTube',
};

const STATUS_COLORS: Record<LearnerSource['status'], { bg: string; text: string; border: string }> = {
  processing: { bg: 'rgba(234,179,8,0.08)',  text: 'var(--warning)',  border: 'rgba(234,179,8,0.25)' },
  ready:      { bg: 'var(--accent-soft)',     text: 'var(--accent)',   border: 'var(--accent-soft-border)' },
  failed:     { bg: 'rgba(239,68,68,0.08)',   text: 'var(--error)',    border: 'rgba(239,68,68,0.2)'  },
};

type ModalTab = 'pdf' | 'url' | 'youtube';

const inputClass =
  'w-full rounded-lg px-3 py-2 text-sm outline-none transition-all';
const inputStyle = {
  border: '1px solid var(--border-default)',
  backgroundColor: 'var(--bg-base)',
  color: 'var(--text-primary)',
};

function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = 'var(--border-focus)';
  e.currentTarget.style.boxShadow   = 'var(--focus-ring)';
}
function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = 'var(--border-default)';
  e.currentTarget.style.boxShadow   = 'none';
}

export default function SettingsPage() {
  const [token, setToken]                         = useState<string | null>(null);
  const [sources, setSources]                     = useState<LearnerSource[]>([]);
  const [loadingError, setLoadingError]           = useState<string | null>(null);
  const [expandedTopics, setExpandedTopics]       = useState<Set<string>>(new Set());

  const [showModal, setShowModal]                 = useState(false);
  const [activeTab, setActiveTab]                 = useState<ModalTab>('pdf');
  const [formTopic, setFormTopic]                 = useState('');
  const [formTitle, setFormTitle]                 = useState('');
  const [formUrl, setFormUrl]                     = useState('');
  const [formYouTubeId, setFormYouTubeId]         = useState('');
  const [formFile, setFormFile]                   = useState<File | null>(null);
  const [submitting, setSubmitting]               = useState(false);
  const [formError, setFormError]                 = useState<string | null>(null);
  const [deletingId, setDeletingId]               = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
    });
  }, []);

  const fetchSources = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiBrowserFetch<LearnerSource[]>('/sources', token);
      setSources(data);
      setExpandedTopics(new Set(data.map((s) => s.topic)));
      setLoadingError(null);
    } catch (err) {
      setLoadingError((err as Error).message);
    }
  }, [token]);

  useEffect(() => {
    if (token) void fetchSources();
  }, [token, fetchSources]);

  const handleDelete = async (sourceId: string) => {
    if (!token) return;
    setDeletingId(sourceId);
    try {
      await apiBrowserFetch<void>(`/sources/${sourceId}`, token, { method: 'DELETE' });
      setSources((prev) => prev.filter((s) => s.id !== sourceId));
    } catch (err) {
      setLoadingError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  const resetModal = () => {
    setFormTopic('');
    setFormTitle('');
    setFormUrl('');
    setFormYouTubeId('');
    setFormFile(null);
    setFormError(null);
    setActiveTab('pdf');
  };

  const handleSubmit = async () => {
    if (!token) return;
    if (!formTopic.trim() || !formTitle.trim()) {
      setFormError('Topic and title are required');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      if (activeTab === 'pdf') {
        if (!formFile) { setFormError('Select a PDF file'); return; }
        const fd = new FormData();
        fd.append('file', formFile);
        fd.append('topic', formTopic.trim());
        fd.append('title', formTitle.trim());
        await apiBrowserFetch<{ id: string }>('/sources/pdf', token, { method: 'POST', body: fd });
      } else if (activeTab === 'url') {
        if (!formUrl.trim()) { setFormError('Enter a URL'); return; }
        await apiBrowserFetch('/sources/url', token, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: formTopic.trim(), title: formTitle.trim(), url: formUrl.trim() }),
        });
      } else {
        if (!formYouTubeId.trim()) { setFormError('Enter a YouTube video ID'); return; }
        await apiBrowserFetch('/sources/youtube', token, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: formTopic.trim(), title: formTitle.trim(), youtubeId: formYouTubeId.trim() }),
        });
      }
      setShowModal(false);
      resetModal();
      await fetchSources();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const byTopic = sources.reduce<Record<string, LearnerSource[]>>((acc, s) => {
    (acc[s.topic] ??= []).push(s);
    return acc;
  }, {});

  const toggleTopic = (topic: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic); else next.add(topic);
      return next;
    });
  };

  return (
    <div
      className="min-h-screen px-6 py-10"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p
            className="text-[12px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--accent)' }}
          >
            Settings
          </p>
          <h1
            className="mt-2 text-2xl font-semibold"
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            Account &amp; sources
          </h1>
        </div>

        {/* Sources section */}
        <section
          className="rounded-xl p-6"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2
                className="text-lg font-semibold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                Your sources
              </h2>
              <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Attach PDFs, URLs, or YouTube videos to a topic. Dersify injects relevant excerpts into your sessions.
              </p>
            </div>
            <button
              onClick={() => { resetModal(); setShowModal(true); }}
              className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}
            >
              Add source
            </button>
          </div>

          {/* Pro tier notice */}
          <div
            className="mb-5 flex items-center gap-3 rounded-lg px-4 py-3 text-sm"
            style={{
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-soft-border)',
            }}
          >
            <Lock size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)' }}>
              Your sources is a{' '}
              <strong style={{ color: 'var(--text-primary)' }}>Pro</strong>{' '}
              feature. Upgrade at $12/mo to unlock unlimited sources.
            </span>
          </div>

          {loadingError && (
            <p className="mb-4 text-sm" style={{ color: 'var(--error)' }}>
              {loadingError}
            </p>
          )}

          {token === null ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Loading...
            </p>
          ) : sources.length === 0 ? (
            <div
              className="rounded-lg border border-dashed py-10 text-center"
              style={{ borderColor: 'var(--border-strong)' }}
            >
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No sources yet. Add a PDF, URL, or YouTube video to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(byTopic).map(([topic, topicSources]) => (
                <div
                  key={topic}
                  className="rounded-lg"
                  style={{ border: '1px solid var(--border-default)' }}
                >
                  <button
                    onClick={() => toggleTopic(topic)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span
                      className="font-medium text-sm capitalize"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {topic}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {topicSources.length} source{topicSources.length !== 1 ? 's' : ''}{' '}
                      {expandedTopics.has(topic) ? '▲' : '▼'}
                    </span>
                  </button>

                  {expandedTopics.has(topic) && (
                    <ul
                      className="divide-y"
                      style={{ borderTopColor: 'var(--border-default)' }}
                    >
                      {topicSources.map((src) => {
                        const statusColor = STATUS_COLORS[src.status];
                        return (
                          <li
                            key={src.id}
                            className="flex items-center justify-between px-4 py-3"
                            style={{ borderColor: 'var(--border-default)' }}
                          >
                            <div className="min-w-0 flex-1">
                              <p
                                className="truncate text-sm font-medium"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {src.title}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <span
                                  className="rounded-full px-2 py-0.5 text-xs"
                                  style={{
                                    border: '1px solid var(--border-default)',
                                    color: 'var(--text-muted)',
                                  }}
                                >
                                  {SOURCE_TYPE_LABEL[src.sourceType]}
                                </span>
                                <span
                                  className="rounded-full px-2 py-0.5 text-xs capitalize"
                                  style={{
                                    background: statusColor.bg,
                                    color: statusColor.text,
                                    border: `1px solid ${statusColor.border}`,
                                  }}
                                >
                                  {src.status}
                                </span>
                                {src.status === 'ready' && (
                                  <span
                                    className="text-xs"
                                    style={{ color: 'var(--text-muted)' }}
                                  >
                                    {src.chunkCount} chunks
                                  </span>
                                )}
                              </div>
                              {src.status === 'failed' && src.errorMessage && (
                                <p
                                  className="mt-1 truncate text-xs"
                                  style={{ color: 'var(--error)' }}
                                >
                                  {src.errorMessage}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => void handleDelete(src.id)}
                              disabled={deletingId === src.id}
                              className="ml-4 rounded px-2 py-1 text-xs transition-opacity hover:opacity-80 disabled:opacity-40"
                              style={{ color: 'var(--error)' }}
                            >
                              {deletingId === src.id ? '...' : 'Delete'}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Upload modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            className="w-full max-w-md rounded-xl p-6"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3
                className="font-semibold"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-primary)',
                }}
              >
                Add source
              </h3>
              <button
                onClick={() => { setShowModal(false); resetModal(); }}
                className="text-sm transition-opacity hover:opacity-80"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Close"
              >
                x
              </button>
            </div>

            {/* Tabs */}
            <div
              className="mb-5 flex rounded-lg p-1"
              style={{ backgroundColor: 'var(--bg-subtle)' }}
            >
              {(['pdf', 'url', 'youtube'] as ModalTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 rounded-md py-1.5 text-sm font-medium transition-all"
                  style={
                    activeTab === tab
                      ? { background: 'var(--accent)', color: 'var(--accent-contrast)' }
                      : { color: 'var(--text-muted)' }
                  }
                >
                  {tab === 'pdf' ? 'Upload PDF' : tab === 'url' ? 'URL' : 'YouTube'}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label
                  className="mb-1 block text-xs font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Topic
                </label>
                <input
                  type="text"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="e.g. machine-learning"
                  className={inputClass}
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              <div>
                <label
                  className="mb-1 block text-xs font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Descriptive name for this source"
                  className={inputClass}
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              {activeTab === 'pdf' && (
                <div>
                  <label
                    className="mb-1 block text-xs font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    PDF file (max 10 MB)
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFormFile(e.target.files?.[0] ?? null)}
                    className="w-full text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  />
                  {formFile && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formFile.name} ({(formFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'url' && (
                <div>
                  <label
                    className="mb-1 block text-xs font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    URL
                  </label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://example.com/article"
                    className={inputClass}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              )}

              {activeTab === 'youtube' && (
                <div>
                  <label
                    className="mb-1 block text-xs font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    YouTube video ID
                  </label>
                  <input
                    type="text"
                    value={formYouTubeId}
                    onChange={(e) => setFormYouTubeId(e.target.value)}
                    placeholder="dQw4w9WgXcQ  (11-character ID from the URL)"
                    maxLength={11}
                    className={`${inputClass} font-mono`}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              )}
            </div>

            {formError && (
              <p className="mt-3 text-sm" style={{ color: 'var(--error)' }}>
                {formError}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => { setShowModal(false); resetModal(); }}
                className="rounded-lg px-4 py-2 text-sm transition-opacity hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}
              >
                {submitting ? 'Adding...' : 'Add source'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
