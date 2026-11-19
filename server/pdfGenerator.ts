import type { PortfolioData } from '../src/types/portfolio.ts';

function escapePdfText(input: string): string {
  return input
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function buildResumePdfBuffer(data: PortfolioData): Buffer {
  const ops: string[] = [];
  let y = 755;

  const drawText = (
    text: string,
    x: number,
    size: number,
    font: 'F1' | 'F2' = 'F1',
    rgb: [number, number, number] = [0.08, 0.1, 0.14]
  ) => {
    ops.push(
      `BT /${font} ${size} Tf ${rgb[0].toFixed(2)} ${rgb[1].toFixed(2)} ${rgb[2].toFixed(2)} rg 1 0 0 1 ${x} ${y} Tm (${escapePdfText(text)}) Tj ET`
    );
  };

  const drawRule = (yPos: number) => {
    ops.push(`0.82 0.85 0.89 RG 0.7 w 48 ${yPos} m 564 ${yPos} l S`);
  };

  // Header
  drawText(data.profile.fullName.toUpperCase(), 48, 20, 'F2', [0.05, 0.08, 0.13]);
  y -= 18;
  drawText(`${data.profile.headline} | ${data.profile.institution}`, 48, 11, 'F2', [0.06, 0.46, 0.43]);
  y -= 15;
  drawText(
    `${data.contact.phone}  |  ${data.contact.email}  |  ${data.contact.location}`,
    48,
    9.5,
    'F1',
    [0.32, 0.36, 0.42]
  );
  y -= 13;
  drawText(`LinkedIn: ${data.contact.linkedinHandle}`, 48, 9.5, 'F1', [0.32, 0.36, 0.42]);
  y -= 10;
  drawRule(y);
  y -= 18;

  // Profile Summary
  drawText('PROFILE SUMMARY', 48, 10.5, 'F2', [0.06, 0.46, 0.43]);
  y -= 14;
  for (const line of wrapText(data.profile.introduction, 94)) {
    drawText(line, 48, 9.5, 'F1', [0.15, 0.18, 0.23]);
    y -= 12.5;
  }
  y -= 8;

  // Education
  drawText('EDUCATION', 48, 10.5, 'F2', [0.06, 0.46, 0.43]);
  y -= 4;
  drawRule(y);
  y -= 14;
  for (const edu of data.education) {
    drawText(edu.institution, 48, 10, 'F2', [0.06, 0.09, 0.14]);
    drawText(edu.period, 455, 9.5, 'F1', [0.32, 0.36, 0.42]);
    y -= 13;
    drawText(edu.degree, 48, 9.5, 'F1', [0.22, 0.25, 0.31]);
    y -= 15;
  }
  y -= 4;

  // Case Competitions
  drawText('CASE COMPETITIONS & CHALLENGES (PARTICIPATION)', 48, 10.5, 'F2', [0.06, 0.46, 0.43]);
  y -= 4;
  drawRule(y);
  y -= 14;
  for (const comp of data.competitions) {
    drawText(`- ${comp.title} (${comp.organizer})`, 48, 9.5, 'F1', [0.12, 0.15, 0.2]);
    drawText(comp.date, 470, 9, 'F1', [0.35, 0.39, 0.45]);
    y -= 13;
  }
  y -= 6;

  // Certifications
  drawText('CERTIFICATIONS', 48, 10.5, 'F2', [0.06, 0.46, 0.43]);
  y -= 4;
  drawRule(y);
  y -= 14;
  for (const cert of data.certifications) {
    drawText(`- ${cert.title} - ${cert.issuer}`, 48, 9.5, 'F1', [0.12, 0.15, 0.2]);
    drawText(cert.date, 470, 9, 'F1', [0.35, 0.39, 0.45]);
    y -= 13;
  }
  y -= 6;

  // Skills
  drawText('SKILLS', 48, 10.5, 'F2', [0.06, 0.46, 0.43]);
  y -= 4;
  drawRule(y);
  y -= 14;
  const skillNames = data.skills.map((s) => s.name).join('  |  ');
  for (const line of wrapText(skillNames, 94)) {
    drawText(line, 48, 9.5, 'F1', [0.12, 0.15, 0.2]);
    y -= 13;
  }
  y -= 6;

  // Leadership & Extracurriculars
  drawText('LEADERSHIP & EXTRACURRICULAR ACTIVITIES', 48, 10.5, 'F2', [0.06, 0.46, 0.43]);
  y -= 4;
  drawRule(y);
  y -= 14;
  for (const item of data.leadership) {
    if (y < 52) break;
    drawText(`- ${item.title}`, 48, 9.5, 'F2', [0.12, 0.15, 0.2]);
    y -= 12.5;
  }

  const streamContent = ops.join('\n');
  const objects: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${Buffer.byteLength(streamContent, 'utf8')} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }
  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'utf8');
}
