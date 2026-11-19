import { Download, ExternalLink, FileText, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CertificationItem } from '../types/portfolio.ts';

interface CertificationsSectionProps {
  certifications: CertificationItem[];
}

export function CertificationsSection({
  certifications,
}: CertificationsSectionProps) {
  const [selectedCert, setSelectedCert] = useState<CertificationItem | null>(null);

  useEffect(() => {
    if (!selectedCert) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCert(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedCert]);

  return (
    <section
      id="certifications"
      className="py-16 sm:py-24 border-b border-slate-200/80 dark:border-[#181D27]"
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-mono-tabular text-teal-700 dark:text-teal-400 mb-2">
              04. Certifications
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white text-balance">
              Verified Training & Credentials
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md">
            Continuous skill development across business writing, communication, risk simulation, and enterprise AI.
          </p>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-[#1B212D] border-y border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14] rounded-xl overflow-hidden">
          {certifications.map((cert, idx) => {
            const hasFile = Boolean(cert.fileUrl);
            return (
              <div
                key={cert.id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-[#0F131C] transition-colors"
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  <span className="font-mono-tabular text-xs font-medium text-slate-500 dark:text-slate-400 pt-1 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <div>
                    <h3 className="font-display text-base sm:text-lg font-semibold text-slate-950 dark:text-white leading-snug">
                      {cert.title}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-[13px] text-slate-600 dark:text-slate-400">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {cert.issuer}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{cert.credentialType}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">{cert.date}</span>
                    </div>
                  </div>
                </div>

                <div className="sm:shrink-0 pl-8 sm:pl-0">
                  <button
                    type="button"
                    onClick={() => setSelectedCert(cert)}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                      hasFile
                        ? 'border-teal-600/30 dark:border-teal-400/30 bg-teal-50/70 dark:bg-teal-500/10 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-500/20'
                        : 'border-slate-200 dark:border-[#222938] bg-slate-50 dark:bg-[#11151F] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{hasFile ? 'View Certificate' : 'Certificate Details'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Certificate Viewer Modal */}
      {selectedCert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cert-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 dark:border-[#222938] bg-white dark:bg-[#0B0E14] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1B212D] flex items-center justify-between gap-4">
              <div>
                <h3
                  id="cert-modal-title"
                  className="font-display text-lg font-semibold text-slate-950 dark:text-white"
                >
                  {selectedCert.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {selectedCert.issuer} · {selectedCert.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                aria-label="Close certificate preview"
                className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#222938] text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {selectedCert.fileUrl ? (
                selectedCert.fileMimeType === 'application/pdf' ||
                selectedCert.fileUrl.toLowerCase().endsWith('.pdf') ? (
                  <div className="space-y-4">
                    <div className="w-full h-[60vh] rounded-xl overflow-hidden border border-slate-200 dark:border-[#1E2430] bg-slate-100 dark:bg-[#07090D]">
                      <iframe
                        src={selectedCert.fileUrl}
                        title={`${selectedCert.title} PDF`}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {selectedCert.fileName || 'Certificate Document'}
                      </span>
                      <div className="flex items-center gap-3">
                        <a
                          href={selectedCert.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-[#232A38] text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141924]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open in New Tab</span>
                        </a>
                        <a
                          href={selectedCert.fileUrl}
                          download={selectedCert.fileName || `${selectedCert.title}.pdf`}
                          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-950 text-white dark:bg-teal-500 dark:text-[#041014]"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-[#1E2430] bg-slate-100 dark:bg-[#07090D] flex items-center justify-center">
                      <img
                        src={selectedCert.fileUrl}
                        alt={`${selectedCert.title} certificate`}
                        referrerPolicy="no-referrer"
                        className="max-h-[62vh] w-auto object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {selectedCert.fileName || 'Certificate Image'}
                      </span>
                      <a
                        href={selectedCert.fileUrl}
                        download={selectedCert.fileName || `${selectedCert.title}.png`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-950 text-white dark:bg-teal-500 dark:text-[#041014]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Certificate</span>
                      </a>
                    </div>
                  </div>
                )
              ) : (
                <div className="py-10 px-6 text-center rounded-xl border border-dashed border-slate-300 dark:border-[#242C3D] bg-slate-50 dark:bg-[#080B10]">
                  <FileText className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                  <h4 className="font-display text-base font-semibold text-slate-900 dark:text-white mb-2">
                    Verified Credential Details
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    Completed <strong className="font-medium text-slate-800 dark:text-slate-200">{selectedCert.title}</strong> issued by {selectedCert.issuer} ({selectedCert.date}). Digital certificate copy is available upon direct request.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
