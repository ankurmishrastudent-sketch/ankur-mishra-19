import {
  AlertCircle,
  CheckCircle2,
  Download,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { ContactInfo } from '../types/portfolio.ts';

interface ContactSectionProps {
  contact: ContactInfo;
}

export function ContactSection({ contact }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setStatus({ type: 'error', text: 'Please complete all required fields.' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus({ type: 'error', text: 'Please provide a valid email address.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      const payload = (await res.json()) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok) {
        setStatus({
          type: 'error',
          text: payload.error || 'Unable to send your message right now.',
        });
      } else {
        setStatus({
          type: 'success',
          text:
            payload.message ||
            'Thank you for reaching out. Your message has been sent successfully.',
        });
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    } catch {
      setStatus({
        type: 'error',
        text: 'Network error while sending message. Please email directly.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const telHref = `tel:${contact.phone.replace(/\s+/g, '')}`;

  return (
    <section id="contact" className="py-16 sm:py-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14">
          {/* Direct Contact Details & Resume Download */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-8">
            <div>
              <p className="text-xs font-mono-tabular text-teal-700 dark:text-teal-400 mb-2">
                07. Contact Me
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white mb-4 text-balance">
                Let&apos;s Connect
              </h2>
              <p className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                Open to internship opportunities, business research collaborations, case team discussions, and professional networking.
              </p>

              <div className="divide-y divide-slate-200 dark:divide-[#1B212D] border-y border-slate-200 dark:border-[#1B212D]">
                <a
                  href={telHref}
                  className="py-4 flex items-center justify-between gap-4 group text-sm"
                >
                  <span className="inline-flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <Phone className="w-4 h-4 text-teal-700 dark:text-teal-400" aria-hidden="true" />
                    <span>Phone</span>
                  </span>
                  <span className="font-mono-tabular font-medium text-slate-950 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                    {contact.phone}
                  </span>
                </a>

                <a
                  href={`mailto:${contact.email}`}
                  className="py-4 flex items-center justify-between gap-4 group text-sm"
                >
                  <span className="inline-flex items-center gap-3 text-slate-600 dark:text-slate-400 shrink-0">
                    <Mail className="w-4 h-4 text-teal-700 dark:text-teal-400" aria-hidden="true" />
                    <span>Email</span>
                  </span>
                  <span className="font-medium text-slate-950 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate">
                    {contact.email}
                  </span>
                </a>

                <a
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-4 flex items-center justify-between gap-4 group text-sm"
                >
                  <span className="inline-flex items-center gap-3 text-slate-600 dark:text-slate-400 shrink-0">
                    <ExternalLink
                      className="w-4 h-4 text-teal-700 dark:text-teal-400"
                      aria-hidden="true"
                    />
                    <span>LinkedIn</span>
                  </span>
                  <span className="font-medium text-slate-950 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate">
                    {contact.linkedinHandle}
                  </span>
                </a>

                <div className="py-4 flex items-center justify-between gap-4 text-sm">
                  <span className="inline-flex items-center gap-3 text-slate-600 dark:text-slate-400 shrink-0">
                    <MapPin
                      className="w-4 h-4 text-teal-700 dark:text-teal-400"
                      aria-hidden="true"
                    />
                    <span>Location</span>
                  </span>
                  <span className="font-medium text-slate-950 dark:text-white text-right">
                    {contact.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Resume Download Block */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14]">
              <p className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400 mb-1">
                Curriculum Vitae · PDF
              </p>
              <h3 className="font-display text-base font-semibold text-slate-950 dark:text-white mb-2">
                {contact.resumeDownloadName}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-5">
                Download Ankur Mishra&apos;s complete academic profile, case participations, and verified certifications.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={contact.resumeFileUrl}
                  download={contact.resumeDownloadName}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-slate-950 text-white hover:bg-slate-800 dark:bg-teal-500 dark:text-[#041014] dark:hover:bg-teal-400 transition-colors whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Download My CV</span>
                </a>
                <a
                  href={`${contact.resumeFileUrl}?preview=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-[#232A38] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Preview PDF</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14] space-y-5"
            >
              <div>
                <h3 className="font-display text-xl font-semibold text-slate-950 dark:text-white">
                  Send a Message
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Messages go directly to {contact.name}&apos;s portfolio inbox.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rohan Sharma"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-[#232A38] bg-slate-50 dark:bg-[#07090D] text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-[#232A38] bg-slate-50 dark:bg-[#07090D] text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Internship inquiry, case collaboration, or networking"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-[#232A38] bg-slate-50 dark:bg-[#07090D] text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-[#232A38] bg-slate-50 dark:bg-[#07090D] text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
                />
              </div>

              {status && (
                <div
                  role="alert"
                  className={`flex items-start gap-2.5 p-3.5 rounded-lg border text-xs sm:text-sm ${
                    status.type === 'success'
                      ? 'border-teal-500/30 bg-teal-50 dark:bg-teal-500/10 text-teal-900 dark:text-teal-200'
                      : 'border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  {status.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  )}
                  <span>{status.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-slate-950 text-white hover:bg-slate-800 dark:bg-teal-500 dark:text-[#041014] dark:hover:bg-teal-400 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
