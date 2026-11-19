import type { AboutInfo } from '../types/portfolio.ts';

interface AboutSectionProps {
  about: AboutInfo;
}

export function AboutSection({ about }: AboutSectionProps) {
  return (
    <section
      id="about"
      className="py-16 sm:py-24 border-b border-slate-200/80 dark:border-[#181D27]"
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Section Anchor Column */}
          <div className="lg:col-span-4">
            <p className="text-xs font-mono-tabular text-teal-700 dark:text-teal-400 mb-2">
              01. About Me
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white leading-tight text-balance">
              {about.heading}
            </h2>
            <p className="mt-5 font-editorial italic text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              &ldquo;{about.leadQuote}&rdquo;
            </p>
          </div>

          {/* Narrative & Pillars Column */}
          <div className="lg:col-span-8">
            <div className="space-y-5 text-[15px] sm:text-base text-slate-700 dark:text-slate-300 leading-[1.75]">
              {about.paragraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* 3 Focus Pillars separated by clean hairline rules */}
            <div className="mt-10 pt-8 border-t border-slate-200 dark:border-[#1B212D] grid grid-cols-1 sm:grid-cols-3 gap-6">
              {about.pillars.map((pillar, index) => (
                <div key={pillar.id} className="space-y-2">
                  <p className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
                    0{index + 1}
                  </p>
                  <h3 className="font-display text-sm font-semibold text-slate-950 dark:text-white">
                    {pillar.title}
                  </h3>
                  <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
