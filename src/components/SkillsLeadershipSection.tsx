import type { LeadershipItem, SkillItem } from '../types/portfolio.ts';

interface SkillsLeadershipSectionProps {
  skills: SkillItem[];
  leadership: LeadershipItem[];
}

export function SkillsLeadershipSection({
  skills,
  leadership,
}: SkillsLeadershipSectionProps) {
  return (
    <section
      id="skills"
      className="py-16 sm:py-24 border-b border-slate-200/80 dark:border-[#181D27]"
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14">
          {/* Core Skills */}
          <div className="lg:col-span-7">
            <p className="text-xs font-mono-tabular text-teal-700 dark:text-teal-400 mb-2">
              05. Core Competencies
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white mb-8 text-balance">
              Practical Skills & Toolkit
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {skills.map((skill, idx) => (
                <div
                  key={skill.id}
                  className="p-5 rounded-xl border border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14]"
                >
                  <p className="font-mono-tabular text-xs text-slate-400 dark:text-slate-500 mb-1.5">
                    {String(idx + 1).padStart(2, '0')}
                  </p>
                  <h3 className="font-display text-[15px] font-semibold text-slate-950 dark:text-white mb-1.5">
                    {skill.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {skill.focus}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Leadership & Extracurricular Activities */}
          <div className="lg:col-span-5">
            <p className="text-xs font-mono-tabular text-teal-700 dark:text-teal-400 mb-2">
              06. Leadership & Extracurriculars
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white mb-8 text-balance">
              Initiative & Oratory
            </h2>

            <div className="space-y-4">
              {leadership.map((item) => (
                <article
                  key={item.id}
                  className="p-6 rounded-xl border border-slate-200 dark:border-[#1B212D] bg-white dark:bg-[#0B0E14]"
                >
                  <p className="text-xs font-medium text-teal-700 dark:text-teal-400 mb-2">
                    {item.context}
                  </p>
                  <h3 className="font-display text-lg font-semibold text-slate-950 dark:text-white mb-2.5 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
