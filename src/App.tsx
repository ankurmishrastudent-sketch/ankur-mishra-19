import { useEffect, useState } from 'react';
import { AboutSection } from './components/AboutSection.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { CertificationsSection } from './components/CertificationsSection.tsx';
import { CompetitionsSection } from './components/CompetitionsSection.tsx';
import { ContactSection } from './components/ContactSection.tsx';
import { EducationSection } from './components/EducationSection.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { Navbar } from './components/Navbar.tsx';
import { SkillsLeadershipSection } from './components/SkillsLeadershipSection.tsx';
import { DEFAULT_PORTFOLIO } from './data/defaultPortfolio.ts';
import type { PortfolioData } from './types/portfolio.ts';

export default function App() {
  const [portfolio, setPortfolio] = useState<PortfolioData>(DEFAULT_PORTFOLIO);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('am_theme');
      if (saved === 'light') return false;
      return true; // Default to black/obsidian dark theme per user preference
    } catch {
      return true;
    }
  });
  const [showAdmin, setShowAdmin] = useState<boolean>(() => {
    return window.location.hash === '#admin';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('am_theme', isDark ? 'dark' : 'light');
    } catch {
      // Ignore storage failures
    }
  }, [isDark]);

  useEffect(() => {
    let active = true;
    fetch('/api/portfolio')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PortfolioData | null) => {
        if (active && data && data.profile) {
          setPortfolio(data);
        }
      })
      .catch(() => {
        // Keep default portfolio fallback if offline
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      setShowAdmin(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const openAdmin = () => {
    window.location.hash = 'admin';
    setShowAdmin(true);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const closeAdmin = () => {
    if (window.location.hash === '#admin') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setShowAdmin(false);
  };

  if (showAdmin) {
    return (
      <AdminDashboard
        portfolio={portfolio}
        onPublished={(updated) => setPortfolio(updated)}
        onClose={closeAdmin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] dark:bg-[#06080C] dark:text-[#F8FAFC] transition-colors duration-200">
      <Navbar
        fullName={portfolio.profile.fullName}
        resumeUrl={portfolio.contact.resumeFileUrl}
        resumeDownloadName={portfolio.contact.resumeDownloadName}
      />

      <main>
        <HeroSection
          profile={portfolio.profile}
          contact={portfolio.contact}
          competitionCount={portfolio.competitions.length}
          certificationCount={portfolio.certifications.length}
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          onOpenAdmin={openAdmin}
        />

        <AboutSection about={portfolio.about} />
        <EducationSection education={portfolio.education} />
        <CompetitionsSection competitions={portfolio.competitions} />
        <CertificationsSection
          certifications={portfolio.certifications}
          onOpenAdmin={openAdmin}
        />
        <SkillsLeadershipSection
          skills={portfolio.skills}
          leadership={portfolio.leadership}
        />
        <ContactSection contact={portfolio.contact} />
      </main>

      <footer className="border-t border-slate-200/80 dark:border-[#181D27] py-8">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
          <p>
            © {new Date().getFullYear()} {portfolio.profile.fullName} · {portfolio.profile.institution}
          </p>
          <div className="flex items-center gap-5">
            <a
              href={portfolio.contact.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={`mailto:${portfolio.contact.email}`}
              className="hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              Email
            </a>
            <button
              type="button"
              onClick={openAdmin}
              className="hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
