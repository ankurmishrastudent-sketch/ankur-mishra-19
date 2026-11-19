import { useEffect, useRef, useState } from 'react';
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
    return window.location.pathname === '/admin' || window.location.hash === '#admin';
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
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) {
          return null;
        }
        return (await res.json()) as PortfolioData;
      })
      .then((data) => {
        if (!active) return;
        if (data && data.profile) {
          setPortfolio(data);
        } else {
          setPortfolio((prev) => ({
            ...prev,
            contact: {
              ...prev.contact,
              resumeFileUrl: '/Ankur_Mishra_Resume.pdf',
            },
          }));
        }
      })
      .catch(() => {
        if (!active) return;
        setPortfolio((prev) => ({
          ...prev,
          contact: {
            ...prev.contact,
            resumeFileUrl: '/Ankur_Mishra_Resume.pdf',
          },
        }));
      });
    return () => {
      active = false;
    };
  }, []);

  const footerTapRef = useRef<{ count: number; lastAt: number }>({ count: 0, lastAt: 0 });

  useEffect(() => {
    const syncAdminFromUrl = () => {
      setShowAdmin(
        window.location.pathname === '/admin' || window.location.hash === '#admin'
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (
        (e.altKey && e.shiftKey && key === 'a') ||
        ((e.ctrlKey || e.metaKey) && e.altKey && key === 'a')
      ) {
        e.preventDefault();
        window.location.hash = 'admin';
        setShowAdmin(true);
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    };

    window.addEventListener('hashchange', syncAdminFromUrl);
    window.addEventListener('popstate', syncAdminFromUrl);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('hashchange', syncAdminFromUrl);
      window.removeEventListener('popstate', syncAdminFromUrl);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleSecretCopyrightTap = () => {
    const now = Date.now();
    if (now - footerTapRef.current.lastAt > 1200) {
      footerTapRef.current = { count: 1, lastAt: now };
      return;
    }
    footerTapRef.current.count += 1;
    footerTapRef.current.lastAt = now;
    if (footerTapRef.current.count >= 3) {
      footerTapRef.current = { count: 0, lastAt: 0 };
      window.location.hash = 'admin';
      setShowAdmin(true);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const closeAdmin = () => {
    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      history.replaceState(null, '', '/');
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
        />

        <AboutSection about={portfolio.about} />
        <EducationSection education={portfolio.education} />
        <CompetitionsSection competitions={portfolio.competitions} />
        <CertificationsSection certifications={portfolio.certifications} />
        <SkillsLeadershipSection
          skills={portfolio.skills}
          leadership={portfolio.leadership}
        />
        <ContactSection contact={portfolio.contact} />
      </main>

      <footer className="border-t border-slate-200/80 dark:border-[#181D27] py-8">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
          <p
            onClick={handleSecretCopyrightTap}
            className="select-none"
          >
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
            <a
              href={`tel:${portfolio.contact.phone.replace(/\s+/g, '')}`}
              className="hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              Phone
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
