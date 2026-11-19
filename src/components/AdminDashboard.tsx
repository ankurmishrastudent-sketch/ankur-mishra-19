import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Inbox,
  KeyRound,
  Lock,
  LogOut,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type {
  CertificationItem,
  CompetitionItem,
  ContactMessage,
  EducationItem,
  LeadershipItem,
  PortfolioData,
  SkillItem,
} from '../types/portfolio.ts';

interface AdminDashboardProps {
  portfolio: PortfolioData;
  onPublished: (updated: PortfolioData) => void;
  onClose: () => void;
}

type AdminTab =
  | 'profile'
  | 'about'
  | 'education'
  | 'competitions'
  | 'certifications'
  | 'skills'
  | 'contact'
  | 'inbox'
  | 'security';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function AdminDashboard({ portfolio, onPublished, onClose }: AdminDashboardProps) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  const [draft, setDraft] = useState<PortfolioData>(() => structuredClone(portfolio));
  const [activeTab, setActiveTab] = useState<AdminTab>('profile');
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  useEffect(() => {
    setDraft(structuredClone(portfolio));
  }, [portfolio]);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/session')
      .then((res) => res.json())
      .then((data: { authenticated?: boolean }) => {
        if (active) setAuthenticated(Boolean(data.authenticated));
      })
      .catch(() => {
        if (active) setAuthenticated(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!authenticated || activeTab !== 'inbox') return;
    setLoadingMessages(true);
    fetch('/api/admin/messages')
      .then((res) => (res.ok ? res.json() : []))
      .then((rows: ContactMessage[]) => setMessages(rows))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }, [authenticated, activeTab]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthBusy(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = (await res.json()) as { authenticated?: boolean; error?: string };
      if (!res.ok || !data.authenticated) {
        setAuthError(data.error || 'Incorrect password.');
      } else {
        setAuthenticated(true);
        setPasswordInput('');
      }
    } catch {
      setAuthError('Network error during login.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setNotice(null);
  };

  const handleSavePublish = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        portfolio?: PortfolioData;
        error?: string;
      };
      if (!res.ok || !payload.portfolio) {
        setNotice({ type: 'error', text: payload.error || 'Could not publish changes.' });
      } else {
        onPublished(payload.portfolio);
        setDraft(structuredClone(payload.portfolio));
        setNotice({ type: 'success', text: 'Changes saved and published live.' });
      }
    } catch {
      setNotice({ type: 'error', text: 'Failed to reach server while saving.' });
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (
    file: File,
    kind: 'avatar' | 'resume' | 'certificate',
    key: string
  ): Promise<{ fileUrl: string; originalName: string; mimeType: string; storedName: string } | null> => {
    setUploadingKey(key);
    setNotice(null);
    try {
      const dataBase64 = await readFileAsDataUrl(file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          dataBase64,
          kind,
        }),
      });
      const payload = (await res.json()) as {
        ok?: boolean;
        fileUrl?: string;
        originalName?: string;
        mimeType?: string;
        storedName?: string;
        error?: string;
      };
      if (!res.ok || !payload.fileUrl) {
        setNotice({ type: 'error', text: payload.error || 'Upload failed.' });
        return null;
      }
      return {
        fileUrl: payload.fileUrl,
        originalName: payload.originalName || file.name,
        mimeType: payload.mimeType || file.type,
        storedName: payload.storedName || file.name,
      };
    } catch {
      setNotice({ type: 'error', text: 'Failed to upload file.' });
      return null;
    } finally {
      setUploadingKey(null);
    }
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploaded = await uploadFile(file, 'avatar', 'avatar');
    if (uploaded) {
      setDraft((prev) => ({
        ...prev,
        profile: { ...prev.profile, photoUrl: uploaded.fileUrl },
      }));
      setNotice({
        type: 'success',
        text: 'Profile photo uploaded. Click "Save & Publish" to update the live site.',
      });
    }
    e.target.value = '';
  };

  const handleResumeUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploaded = await uploadFile(file, 'resume', 'resume');
    if (uploaded) {
      setDraft((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          resumeFileUrl: '/api/resume/download',
          resumeOriginalName: uploaded.storedName,
          resumeUpdatedAt: new Date().toISOString().slice(0, 10),
        },
      }));
      setNotice({
        type: 'success',
        text: `New resume "${uploaded.originalName}" uploaded and active for download.`,
      });
    }
    e.target.value = '';
  };

  const handleCertFileUpload = async (certId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploaded = await uploadFile(file, 'certificate', certId);
    if (uploaded) {
      setDraft((prev) => ({
        ...prev,
        certifications: prev.certifications.map((c) =>
          c.id === certId
            ? {
                ...c,
                fileUrl: uploaded.fileUrl,
                fileName: uploaded.originalName,
                fileMimeType: uploaded.mimeType,
              }
            : c
        ),
      }));
      setNotice({
        type: 'success',
        text: `Certificate file "${uploaded.originalName}" attached. Click "Save & Publish" to save.`,
      });
    }
    e.target.value = '';
  };

  const handleDeleteMessage = async (id: string) => {
    const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setNotice(null);
    if (newPw !== confirmPw) {
      setNotice({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string; message?: string };
    if (!res.ok) {
      setNotice({ type: 'error', text: data.error || 'Could not update password.' });
    } else {
      setNotice({ type: 'success', text: data.message || 'Password updated.' });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    }
  };

  const inputClass =
    'w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-[#232A38] bg-slate-50 dark:bg-[#07090D] text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500';
  const labelClass = 'block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5';

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#06080C] flex items-center justify-center p-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">Checking admin session...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#06080C] flex items-center justify-center p-5">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#1E2430] bg-white dark:bg-[#0B0E14] p-7 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portfolio</span>
            </button>
            <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>

          <h1 className="font-display text-2xl font-bold text-slate-950 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Sign in to update profile information, upload certificates, replace your resume PDF, and view contact messages.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-password" className={labelClass}>
                Admin Passcode
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter admin passcode"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <p className="text-xs text-rose-600 dark:text-rose-400" role="alert">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authBusy}
              className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg bg-slate-950 text-white hover:bg-slate-800 dark:bg-teal-500 dark:text-[#041014] dark:hover:bg-teal-400 transition-colors cursor-pointer"
            >
              {authBusy ? 'Signing In...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <p className="mt-5 pt-4 border-t border-slate-100 dark:border-[#181D27] text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Default initial passcode: <code className="font-mono-tabular text-slate-700 dark:text-slate-300">IIMU2026@Ankur</code> (you can change it anytime in the Security tab).
          </p>
        </div>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'profile', label: 'Profile & Photo' },
    { id: 'about', label: 'About Me' },
    { id: 'education', label: 'Education' },
    { id: 'competitions', label: 'Competitions' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'skills', label: 'Skills & Leadership' },
    { id: 'contact', label: 'Resume & Contact' },
    { id: 'inbox', label: 'Inbox' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#06080C] text-slate-950 dark:text-slate-100">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-[#1B212D] bg-white/95 dark:bg-[#080B10]/95 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Portfolio</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
              /
            </span>
            <h1 className="font-display text-sm sm:text-base font-semibold whitespace-nowrap">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleSavePublish}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-950 text-white hover:bg-slate-800 dark:bg-teal-500 dark:text-[#041014] dark:hover:bg-teal-400 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Publishing...' : 'Save & Publish'}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-[#232A38] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#131822] cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
        {notice && (
          <div
            role="status"
            className={`mb-6 flex items-center gap-2.5 p-3.5 rounded-xl border text-xs sm:text-sm ${
              notice.type === 'success'
                ? 'border-teal-500/30 bg-teal-50 dark:bg-teal-500/10 text-teal-900 dark:text-teal-200'
                : 'border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-900 dark:text-rose-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice.text}</span>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pb-6 mb-8 border-b border-slate-200 dark:border-[#1B212D]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-950 text-white dark:bg-teal-500 dark:text-[#041014]'
                  : 'bg-white dark:bg-[#0D1017] border border-slate-200 dark:border-[#1E2430] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Profile & Photo */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 p-6 rounded-xl border border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14] space-y-4">
              <h2 className="font-display text-base font-semibold">Profile Photograph (Optional)</h2>
              {draft.profile.photoUrl ? (
                <div className="aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 dark:border-[#1E2430] bg-slate-100 dark:bg-[#07090D]">
                  <img
                    src={draft.profile.photoUrl}
                    alt={draft.profile.fullName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              ) : (
                <div className="py-10 px-4 rounded-xl border border-dashed border-slate-300 dark:border-[#242C3D] bg-slate-50 dark:bg-[#07090D] text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No photo displayed. Upload a portrait anytime if desired.
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-[#232A38] hover:bg-slate-50 dark:hover:bg-[#121722] cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {uploadingKey === 'avatar' ? 'Uploading Photo...' : 'Upload Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    className="sr-only"
                  />
                </label>
                {draft.profile.photoUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, photoUrl: '', photoCaption: '' },
                      }))
                    }
                    className="inline-flex w-full items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-8 p-6 rounded-xl border border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14] space-y-4">
              <h2 className="font-display text-base font-semibold">Hero Profile Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    value={draft.profile.fullName}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        profile: { ...draft.profile, fullName: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Program / Headline</label>
                  <input
                    type="text"
                    value={draft.profile.headline}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        profile: { ...draft.profile, headline: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Institution</label>
                  <input
                    type="text"
                    value={draft.profile.institution}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        profile: { ...draft.profile, institution: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Photo Caption</label>
                  <input
                    type="text"
                    value={draft.profile.photoCaption}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        profile: { ...draft.profile, photoCaption: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Tagline</label>
                <input
                  type="text"
                  value={draft.profile.tagline}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      profile: { ...draft.profile, tagline: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Hero Introduction</label>
                <textarea
                  rows={4}
                  value={draft.profile.introduction}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      profile: { ...draft.profile, introduction: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <label className="inline-flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={draft.profile.showGreetingClock}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      profile: { ...draft.profile, showGreetingClock: e.target.checked },
                    })
                  }
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>Display live time-of-day greeting, date, and clock in hero</span>
              </label>
            </div>
          </div>
        )}

        {/* Tab 2: About Me */}
        {activeTab === 'about' && (
          <div className="p-6 rounded-xl border border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14] space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Section Heading</label>
                <input
                  type="text"
                  value={draft.about.heading}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      about: { ...draft.about, heading: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Lead Editorial Quote</label>
                <input
                  type="text"
                  value={draft.about.leadQuote}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      about: { ...draft.about, leadQuote: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={labelClass}>About Paragraphs</label>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      about: {
                        ...draft.about,
                        paragraphs: [...draft.about.paragraphs, ''],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 dark:text-teal-400 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Paragraph
                </button>
              </div>
              {draft.about.paragraphs.map((p, idx) => (
                <div key={idx} className="flex gap-2">
                  <textarea
                    rows={3}
                    value={p}
                    onChange={(e) => {
                      const next = [...draft.about.paragraphs];
                      next[idx] = e.target.value;
                      setDraft({ ...draft, about: { ...draft.about, paragraphs: next } });
                    }}
                    className={inputClass}
                  />
                  {draft.about.paragraphs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = draft.about.paragraphs.filter((_, i) => i !== idx);
                        setDraft({ ...draft, about: { ...draft.about, paragraphs: next } });
                      }}
                      aria-label="Remove paragraph"
                      className="p-2 text-slate-400 hover:text-rose-500 self-start cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Education */}
        {activeTab === 'education' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const newItem: EducationItem = {
                    id: `edu_${Date.now()}`,
                    institution: 'Institution Name',
                    degree: 'Degree / Program',
                    period: '2026 – Present',
                    location: 'City, India',
                    details: '',
                  };
                  setDraft({ ...draft, education: [newItem, ...draft.education] });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-[#232A38] bg-white dark:bg-[#0D1017] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Education
              </button>
            </div>

            {draft.education.map((edu) => (
              <div
                key={edu.id}
                className="p-6 rounded-xl border border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-tabular text-slate-500">{edu.period}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        education: draft.education.filter((x) => x.id !== edu.id),
                      })
                    }
                    className="text-xs text-rose-600 dark:text-rose-400 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          education: draft.education.map((x) =>
                            x.id === edu.id ? { ...x, institution: e.target.value } : x
                          ),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Degree / Stream</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          education: draft.education.map((x) =>
                            x.id === edu.id ? { ...x, degree: e.target.value } : x
                          ),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Period</label>
                    <input
                      type="text"
                      value={edu.period}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          education: draft.education.map((x) =>
                            x.id === edu.id ? { ...x, period: e.target.value } : x
                          ),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Location</label>
                    <input
                      type="text"
                      value={edu.location}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          education: draft.education.map((x) =>
                            x.id === edu.id ? { ...x, location: e.target.value } : x
                          ),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Details</label>
                  <textarea
                    rows={2}
                    value={edu.details}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        education: draft.education.map((x) =>
                          x.id === edu.id ? { ...x, details: e.target.value } : x
                        ),
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Competitions */}
        {activeTab === 'competitions' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const item: CompetitionItem = {
                    id: `comp_${Date.now()}`,
                    title: 'New Case Competition',
                    organizer: 'Institute / Organizer',
                    date: 'October 2026',
                    category: 'Business Case Challenge',
                    participationNote: 'Competition Participation',
                  };
                  setDraft({ ...draft, competitions: [item, ...draft.competitions] });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-[#232A38] bg-white dark:bg-[#0D1017] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Competition
              </button>
            </div>

            {draft.competitions.map((comp) => (
              <div
                key={comp.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14] space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-teal-700 dark:text-teal-400">
                    {comp.participationNote}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        competitions: draft.competitions.filter((x) => x.id !== comp.id),
                      })
                    }
                    className="text-xs text-rose-600 dark:text-rose-400 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Competition Title</label>
                    <input
                      type="text"
                      value={comp.title}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          competitions: draft.competitions.map((x) =>
                            x.id === comp.id ? { ...x, title: e.target.value } : x
                          ),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Organizer / Host</label>
                    <input
                      type="text"
                      value={comp.organizer}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          competitions: draft.competitions.map((x) =>
                            x.id === comp.id ? { ...x, organizer: e.target.value } : x
                          ),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Date</label>
                    <input
                      type="text"
                      value={comp.date}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          competitions: draft.competitions.map((x) =>
                            x.id === comp.id ? { ...x, date: e.target.value } : x
                          ),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Category</label>
                    <input
                      type="text"
                      value={comp.category}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          competitions: draft.competitions.map((x) =>
                            x.id === comp.id ? { ...x, category: e.target.value } : x
                          ),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Certifications & Certificate Uploads */}
        {activeTab === 'certifications' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const item: CertificationItem = {
                    id: `cert_${Date.now()}`,
                    title: 'New Certification',
                    issuer: 'Issuing Organization',
                    date: 'November 2026',
                    credentialType: 'Professional Development',
                    fileUrl: '',
                    fileName: '',
                    fileMimeType: '',
                  };
                  setDraft({ ...draft, certifications: [item, ...draft.certifications] });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-[#232A38] bg-white dark:bg-[#0D1017] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Certification
              </button>
            </div>

            {draft.certifications.map((cert) => (
              <div
                key={cert.id}
                className="p-6 rounded-xl border border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14] space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {cert.fileUrl ? `Attached: ${cert.fileName}` : 'No certificate file uploaded'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        certifications: draft.certifications.filter((x) => x.id !== cert.id),
                      })
                    }
                    className="text-xs text-rose-600 dark:text-rose-400 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Title</label>
                    <input
                      type="text"
                      value={cert.title}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          certifications: draft.certifications.map((x) =>
                            x.id === cert.id ? { ...x, title: e.target.value } : x
                          ),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Issuer</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          certifications: draft.certifications.map((x) =>
                            x.id === cert.id ? { ...x, issuer: e.target.value } : x
                          ),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Completion Date</label>
                    <input
                      type="text"
                      value={cert.date}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          certifications: draft.certifications.map((x) =>
                            x.id === cert.id ? { ...x, date: e.target.value } : x
                          ),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Category</label>
                    <input
                      type="text"
                      value={cert.credentialType}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          certifications: draft.certifications.map((x) =>
                            x.id === cert.id ? { ...x, credentialType: e.target.value } : x
                          ),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-[#232A38] hover:bg-slate-50 dark:hover:bg-[#141924] cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {uploadingKey === cert.id
                        ? 'Uploading...'
                        : cert.fileUrl
                          ? 'Replace Certificate File'
                          : 'Upload Certificate PDF / Image'}
                    </span>
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/webp"
                      onChange={(e) => handleCertFileUpload(cert.id, e)}
                      className="sr-only"
                    />
                  </label>

                  {cert.fileUrl && (
                    <>
                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" /> Preview Attached File
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            certifications: draft.certifications.map((x) =>
                              x.id === cert.id
                                ? { ...x, fileUrl: '', fileName: '', fileMimeType: '' }
                                : x
                            ),
                          })
                        }
                        className="text-xs text-slate-500 hover:text-rose-500 cursor-pointer"
                      >
                        Detach file
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 6: Skills & Leadership */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-semibold">Core Skills</h2>
                <button
                  type="button"
                  onClick={() => {
                    const skill: SkillItem = {
                      id: `skill_${Date.now()}`,
                      name: 'New Skill',
                      focus: 'Concise practical application.',
                    };
                    setDraft({ ...draft, skills: [...draft.skills, skill] });
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Skill
                </button>
              </div>
              {draft.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14] space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          skills: draft.skills.map((s) =>
                            s.id === skill.id ? { ...s, name: e.target.value } : s
                          ),
                        })
                      }
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          skills: draft.skills.filter((s) => s.id !== skill.id),
                        })
                      }
                      aria-label="Remove skill"
                      className="p-2 text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={skill.focus}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        skills: draft.skills.map((s) =>
                          s.id === skill.id ? { ...s, focus: e.target.value } : s
                        ),
                      })
                    }
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-semibold">
                  Leadership & Extracurriculars
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    const item: LeadershipItem = {
                      id: `lead_${Date.now()}`,
                      title: 'Leadership Role / Activity',
                      context: 'Context',
                      description: '',
                    };
                    setDraft({ ...draft, leadership: [...draft.leadership, item] });
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Activity
                </button>
              </div>
              {draft.leadership.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14] space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          leadership: draft.leadership.map((l) =>
                            l.id === item.id ? { ...l, title: e.target.value } : l
                          ),
                        })
                      }
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          leadership: draft.leadership.filter((l) => l.id !== item.id),
                        })
                      }
                      aria-label="Remove activity"
                      className="p-2 text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.context}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        leadership: draft.leadership.map((l) =>
                          l.id === item.id ? { ...l, context: e.target.value } : l
                        ),
                      })
                    }
                    placeholder="Context"
                    className={inputClass}
                  />
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        leadership: draft.leadership.map((l) =>
                          l.id === item.id ? { ...l, description: e.target.value } : l
                        ),
                      })
                    }
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Resume PDF & Contact Info */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 p-6 rounded-xl border border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14] space-y-4">
              <h2 className="font-display text-base font-semibold">Resume PDF</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Active file: <strong className="text-slate-900 dark:text-white">{draft.contact.resumeOriginalName}</strong>
                <br />
                Download filename: <span className="font-mono-tabular">{draft.contact.resumeDownloadName}</span>
              </p>

              <div>
                <label className={labelClass}>Public Download Filename</label>
                <input
                  type="text"
                  value={draft.contact.resumeDownloadName}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      contact: { ...draft.contact, resumeDownloadName: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <label className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-[#232A38] hover:bg-slate-50 dark:hover:bg-[#121722] cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {uploadingKey === 'resume' ? 'Uploading PDF...' : 'Replace Resume PDF'}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeUpload}
                  className="sr-only"
                />
              </label>

              <a
                href="/api/resume/download?preview=1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 dark:text-teal-400 hover:underline"
              >
                <FileText className="w-3.5 h-3.5" /> Preview Current Resume PDF
              </a>
            </div>

            <div className="lg:col-span-7 p-6 rounded-xl border border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14] space-y-4">
              <h2 className="font-display text-base font-semibold">Contact Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Contact Name</label>
                  <input
                    type="text"
                    value={draft.contact.name}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        contact: { ...draft.contact, name: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    type="text"
                    value={draft.contact.phone}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        contact: { ...draft.contact, phone: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={draft.contact.email}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        contact: { ...draft.contact, email: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    type="text"
                    value={draft.contact.location}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        contact: { ...draft.contact, location: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>LinkedIn URL</label>
                  <input
                    type="url"
                    value={draft.contact.linkedinUrl}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        contact: { ...draft.contact, linkedinUrl: e.target.value },
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Contact Inbox */}
        {activeTab === 'inbox' && (
          <div className="p-6 rounded-xl border border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14]">
            <div className="flex items-center gap-2.5 mb-6">
              <Inbox className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h2 className="font-display text-base font-semibold">Contact Form Messages</h2>
            </div>

            {loadingMessages ? (
              <p className="text-sm text-slate-500">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No contact form submissions yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-[#1B212D]">
                {messages.map((msg) => (
                  <div key={msg.id} className="py-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {msg.name}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{msg.email}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">
                        {msg.subject}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(msg.id)}
                      aria-label="Delete message"
                      className="p-2 text-slate-400 hover:text-rose-500 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 9: Security */}
        {activeTab === 'security' && (
          <form
            onSubmit={handlePasswordChange}
            className="max-w-lg p-6 rounded-xl border border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14] space-y-4"
          >
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h2 className="font-display text-base font-semibold">Change Admin Passcode</h2>
            </div>

            <div>
              <label className={labelClass}>Current Passcode</label>
              <input
                type="password"
                required
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>New Passcode (min 6 characters)</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Confirm New Passcode</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-slate-950 text-white dark:bg-teal-500 dark:text-[#041014] cursor-pointer"
            >
              Update Passcode
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
