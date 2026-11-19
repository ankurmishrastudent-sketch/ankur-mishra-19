export interface ProfileInfo {
  fullName: string;
  headline: string;
  institution: string;
  tagline: string;
  introduction: string;
  photoUrl: string;
  photoCaption: string;
  showGreetingClock: boolean;
}

export interface AboutPillar {
  id: string;
  title: string;
  description: string;
}

export interface AboutInfo {
  heading: string;
  leadQuote: string;
  paragraphs: string[];
  pillars: AboutPillar[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  period: string;
  location: string;
  details: string;
}

export interface CompetitionItem {
  id: string;
  title: string;
  organizer: string;
  date: string;
  category: string;
  participationNote: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialType: string;
  fileUrl: string;
  fileName: string;
  fileMimeType: string;
}

export interface SkillItem {
  id: string;
  name: string;
  focus: string;
}

export interface LeadershipItem {
  id: string;
  title: string;
  context: string;
  description: string;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  linkedinUrl: string;
  linkedinHandle: string;
  location: string;
  resumeFileUrl: string;
  resumeDownloadName: string;
  resumeOriginalName: string;
  resumeUpdatedAt: string;
}

export interface PortfolioData {
  profile: ProfileInfo;
  about: AboutInfo;
  education: EducationItem[];
  competitions: CompetitionItem[];
  certifications: CertificationItem[];
  skills: SkillItem[];
  leadership: LeadershipItem[];
  contact: ContactInfo;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}
