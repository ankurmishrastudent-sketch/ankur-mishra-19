import type { CompetitionItem } from '../types/portfolio.ts';

interface CompetitionsSectionProps {
  competitions: CompetitionItem[];
}

export function CompetitionsSection({ competitions }: CompetitionsSectionProps) {
  return (
    <section
      id="competitions"
      className="py-16 sm:py-24 border-b border-slate-200/80 dark:border-[#181D27]"
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-mono-tabular text-teal-700 dark:text-teal-400 mb-2">
              03. Achievements & Case Competitions
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white text-balance">
              National Case Challenges & Business Quizzes
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md">
            Active competition participation across premier IITs, IIMs, and national business platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {competitions.map((comp, idx) => (
            <article
              key={comp.id}
              className="p-6 rounded-xl border border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14] flex flex-col justify-between transition-colors duration-150 hover:border-slate-300 dark:hover:border-[#2A3346]"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="font-mono-tabular text-xs text-slate-500 dark:text-slate-400">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-medium text-teal-700 dark:text-teal-400">
                    {comp.participationNote || 'Competition Participation'}
                  </span>
                </div>

                <h3 className="font-display text-base sm:text-lg font-semibold text-slate-950 dark:text-white leading-snug mb-3">
                  {comp.title}
                </h3>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-[#161B24] flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {comp.organizer}
                </span>
                <span aria-hidden="true">·</span>
                <span>{comp.category}</span>
                {comp.date && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">{comp.date}</span>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
