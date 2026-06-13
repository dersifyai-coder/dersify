'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

interface LearnerSource {
  id: string;
  topic: string;
  sourceType: 'pdf' | 'url' | 'youtube';
  title: string;
  status: 'processing' | 'ready' | 'failed';
  chunkCount: number;
  errorMessage?: string | null;
  createdAt: string;
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
  pdf: 'PDF',
  url: 'URL',
  youtube: 'YouTube',
};

const STATUS_STYLE: Record<LearnerSource['status'], string> = {
  processing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  ready: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
};

type ModalTab = 'pdf' | 'url' | 'youtube';

export default function SettingsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [sources, setSources] = useState<LearnerSource[]>([]);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>('pdf');
  const [formTopic, setFormTopic] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formYouTubeId, setFormYouTubeId] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      const allTopics = new Set(data.map((s) => s.topic));
      setExpandedTopics(allTopics);
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
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  };

  return (
    <div className="min-h-screen px-6 py-10" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-semibold" style={{ color: 'var(--teal)' }}>Settings</p>
          <h1 className="mt-1 font-sora text-2xl font-bold">Account &amp; Sources</h1>
        </div>

        {/* Your Sources section */}
        <section
          className="rounded-xl border p-6"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-sora text-lg font-semibold">Your Sources</h2>
              <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                Attach PDFs, URLs, or YouTube videos to a topic. Dersify injects relevant excerpts into your sessions.
              </p>
            </div>
            <button
              onClick={() => { resetModal(); setShowModal(true); }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--teal))' }}
            >
              + Add Source
            </button>
          </div>

          {/* Pro tier notice (placeholder until P-11) */}
          <div
            className="mb-5 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm"
            style={{ borderColor: 'var(--border-accent)', backgroundColor: 'var(--bg-surface-2)' }}
          >
            <span>🔒</span>
            <span style={{ color: 'var(--text-subtle)' }}>
              Your Sources is a <strong style={{ color: 'var(--text-primary)' }}>Pro</strong> feature.
              Upgrade at $12/mo to unlock unlimited sources.
            </span>
          </div>

          {loadingError && (
            <p className="mb-4 text-sm text-red-400">{loadingError}</p>
          )}

          {token === null ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
          ) : sources.length === 0 ? (
            <div
              className="rounded-lg border border-dashed py-10 text-center"
              style={{ borderColor: 'var(--border)' }}
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
                  className="rounded-lg border"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <button
                    onClick={() => toggleTopic(topic)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="font-medium text-sm capitalize">{topic}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {topicSources.length} source{topicSources.length !== 1 ? 's' : ''}{' '}
                      {expandedTopics.has(topic) ? '▲' : '▼'}
                    </span>
                  </button>

                  {expandedTopics.has(topic) && (
                    <ul
                      className="divide-y"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {topicSources.map((src) => (
                        <li key={src.id} className="flex items-center justify-between px-4 py-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{src.title}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className="rounded-full border px-2 py-0.5 text-xs"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                              >
                                {SOURCE_TYPE_LABEL[src.sourceType]}
                              </span>
                              <span
                                className={`rounded-full border px-2 py-0.5 text-xs capitalize ${STATUS_STYLE[src.status]}`}
                              >
                                {src.status}
                              </span>
                              {src.status === 'ready' && (
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {src.chunkCount} chunks
                                </span>
                              )}
                            </div>
                            {src.status === 'failed' && src.errorMessage && (
                              <p className="mt-1 truncate text-xs text-red-400">{src.errorMessage}</p>
                            )}
                          </div>
                          <button
                            onClick={() => void handleDelete(src.id)}
                            disabled={deletingId === src.id}
                            className="ml-4 rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-40"
                          >
                            {deletingId === src.id ? '…' : 'Delete'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div
            className="w-full max-w-md rounded-xl border p-6 shadow-xl"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-sora font-semibold">Add Source</h3>
              <button
                onClick={() => { setShowModal(false); resetModal(); }}
                className="text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div
              className="mb-5 flex rounded-lg p-1"
              style={{ backgroundColor: 'var(--bg-surface-2)' }}
            >
              {(['pdf', 'url', 'youtube'] as ModalTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                    activeTab === tab ? 'text-white shadow' : ''
                  }`}
                  style={
                    activeTab === tab
                      ? { background: 'linear-gradient(135deg, var(--primary), var(--teal))' }
                      : { color: 'var(--text-muted)' }
                  }
                >
                  {tab === 'pdf' ? 'Upload PDF' : tab === 'url' ? 'URL' : 'YouTube'}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {/* Common fields */}
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-subtle)' }}>
                  Topic
                </label>
                <input
                  type="text"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="e.g. machine-learning"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--bg-surface-2)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-subtle)' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Descriptive name for this source"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--bg-surface-2)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Tab-specific fields */}
              {activeTab === 'pdf' && (
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-subtle)' }}>
                    PDF File (max 10 MB)
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
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-subtle)' }}>
                    URL
                  </label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://example.com/article"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--bg-surface-2)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              )}

              {activeTab === 'youtube' && (
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--text-subtle)' }}>
                    YouTube Video ID
                  </label>
                  <input
                    type="text"
                    value={formYouTubeId}
                    onChange={(e) => setFormYouTubeId(e.target.value)}
                    placeholder="dQw4w9WgXcQ  (11-character ID from the URL)"
                    maxLength={11}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 font-mono"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--bg-surface-2)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              )}
            </div>

            {formError && (
              <p className="mt-3 text-sm text-red-400">{formError}</p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => { setShowModal(false); resetModal(); }}
                className="rounded-lg px-4 py-2 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--teal))' }}
              >
                {submitting ? 'Adding…' : 'Add Source'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
