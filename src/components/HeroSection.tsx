import { ArrowRight, Download, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { ContactInfo, ProfileInfo } from '../types/portfolio.ts';

interface HeroSectionProps {
  profile: ProfileInfo;
  contact: ContactInfo;
  competitionCount: number;
  certificationCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
}

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function HeroSection({
  profile,
  contact,
  competitionCount,
  certificationCount,
  isDark,
  onToggleTheme,
}: HeroSectionProps) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const greeting = getGreeting(now.getHours());
  const formattedDate = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const hasPhoto = Boolean(profile.photoUrl && profile.photoUrl.trim().length > 0);

  return (
    <section
      id="top"
      className="pt-6 pb-16 sm:pt-8 sm:pb-24 border-b border-slate-200/80 dark:border-[#181D27]"
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        {/* Hero Utility Strip: Live Greeting + Date + Time, Theme Toggle, Admin Access */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-12 border-b border-slate-200/70 dark:border-[#161B24]">
          {profile.showGreetingClock ? (
            <div
              className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300"
              aria-live="polite"
            >
              <span className="font-semibold text-teal-700 dark:text-teal-400">{greeting}</span>
              <span aria-hidden="true" className="text-slate-400 dark:text-slate-600">
                ·
              </span>
              <span>{formattedDate}</span>
              <span aria-hidden="true" className="text-slate-400 dark:text-slate-600">
                ·
              </span>
              <span className="font-mono-tabular text-slate-800 dark:text-slate-200">
                {formattedTime}
              </span>
            </div>
          ) : (
            <div className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400">
              {profile.institution}
            </div>
          )}

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-[#1F2633] bg-white dark:bg-[#0D1017] text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hero Main Content */}
        <div
          className={
            hasPhoto
              ? 'grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch'
              : 'max-w-4xl'
          }
        >
          {/* Typographic Hierarchy */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={hasPhoto ? 'lg:col-span-7 flex flex-col justify-between py-1' : 'py-2'}
          >
            <div>
              <p className="text-sm sm:text-[15px] font-medium text-teal-700 dark:text-teal-400 tracking-wide mb-4">
                {profile.headline}{' '}
                <span aria-hidden="true" className="mx-1.5 text-slate-400 dark:text-slate-600">
                  |
                </span>{' '}
                {profile.institution}
              </p>

              <h1
                className="font-display font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.04] mb-5 text-balance"
                style={{ fontSize: 'clamp(2.75rem, 5.6vw, 4.65rem)' }}
              >
                {profile.fullName}
              </h1>

              <p className="font-editorial italic text-xl sm:text-2xl text-slate-700 dark:text-slate-200 leading-snug mb-6 max-w-2xl">
                &ldquo;{profile.tagline}&rdquo;
              </p>

              <p className="text-[15px] sm:text-base text-slate-600 dark:text-slate-300 leading-[1.75] max-w-2xl mb-10">
                {profile.introduction}
              </p>
            </div>

            {/* Action Row */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <a
                href={contact.resumeFileUrl}
                download={contact.resumeDownloadName}
                className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-semibold rounded-lg bg-slate-950 text-white hover:bg-slate-800 dark:bg-teal-500 dark:text-[#041014] dark:hover:bg-teal-400 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#06080C]"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>Download My CV</span>
              </a>

              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg border border-slate-300 dark:border-[#232A38] bg-white dark:bg-[#0D1017] text-slate-900 dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-500 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <span>Contact Me</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <a
                href={contact.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ankur Mishra LinkedIn Profile"
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg border border-slate-200 dark:border-[#1E2430] text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:border-slate-300 dark:hover:border-slate-600 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </motion.div>

          {/* Optional Profile Photograph (only rendered if uploaded) */}
          {hasPhoto && (
            <motion.div
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <div className="relative w-full aspect-[3/4] lg:aspect-auto lg:h-full min-h-[380px] rounded-2xl overflow-hidden border border-slate-200 dark:border-[#1E2430] bg-slate-100 dark:bg-[#0D1017]">
                <img
                  src={profile.photoUrl}
                  alt={`${profile.fullName} — ${profile.headline} at ${profile.institution}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
                {profile.photoCaption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 sm:p-6">
                    <p className="text-xs font-medium text-slate-200 tracking-wide">
                      {profile.photoCaption}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Full-Width 4-Column Summary Row Below Hero Split */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 dark:border-[#181D27] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div>
            <p className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400 mb-1">
              01 · Program
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              BBA (Entrepreneurship)
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              IIM Udaipur · 2026–Present
            </p>
          </div>

          <div>
            <p className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400 mb-1">
              02 · Focus Areas
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Strategy, Finance & Startups
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Business Research & Operations
            </p>
          </div>

          <div>
            <p className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400 mb-1">
              03 · Case Challenges
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white font-mono-tabular">
              {competitionCount} National Participations
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              IIT Kanpur, IIM Lucknow & more
            </p>
          </div>

          <div>
            <p className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400 mb-1">
              04 · Credentials
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white font-mono-tabular">
              {certificationCount} Verified Certifications
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Harvard Business Impact, IIM Rohtak
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
