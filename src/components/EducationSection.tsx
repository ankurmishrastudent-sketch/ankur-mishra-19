import { MapPin } from 'lucide-react';
import type { EducationItem } from '../types/portfolio.ts';

interface EducationSectionProps {
  education: EducationItem[];
}

export function EducationSection({ education }: EducationSectionProps) {
  return (
    <section
      id="education"
      className="py-16 sm:py-24 border-b border-slate-200/80 dark:border-[#181D27]"
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          <div className="lg:col-span-4">
            <p className="text-xs font-mono-tabular text-teal-700 dark:text-teal-400 mb-2">
              02. Education
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white text-balance">
              Academic Foundation
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Building a rigorous foundation in commerce, entrepreneurship, and strategic management.
            </p>
          </div>

          <div className="lg:col-span-8">
            <ol className="relative border-l border-slate-200 dark:border-[#1E2430] ml-2.5 space-y-10">
              {education.map((item, idx) => (
                <li key={item.id} className="pl-7 sm:pl-9 relative">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
                      idx === 0
                        ? 'bg-teal-600 dark:bg-teal-400 border-[#FAFAFA] dark:border-[#06080C]'
                        : 'bg-slate-400 dark:bg-slate-600 border-[#FAFAFA] dark:border-[#06080C]'
                    }`}
                  />

                  <div className="p-6 rounded-xl border border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14]">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                      <h3 className="font-display text-lg font-semibold text-slate-950 dark:text-white">
                        {item.institution}
                      </h3>
                      <span className="font-mono-tabular text-xs font-medium text-teal-700 dark:text-teal-400">
                        {item.period}
                      </span>
                    </div>

                    <p className="text-[15px] font-medium text-slate-800 dark:text-slate-200 mb-2">
                      {item.degree}
                    </p>

                    {item.location && (
                      <p className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
                        <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{item.location}</span>
                      </p>
                    )}

                    {item.details && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.details}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
