/*
 * Internship Logbook PDF Generator
 * Reads the markdown/text logbook and outputs a simple, professional PDF.
 */

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const workspaceRoot = path.resolve(__dirname, '..', '..', '..');

const inputPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(workspaceRoot, 'docs', 'internship-logbook', 'daily-logbook.md');

const outputPath = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.join(workspaceRoot, 'docs', 'internship-logbook', 'daily-logbook.pdf');

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const content = fs.readFileSync(inputPath, 'utf8');
const lines = content.split(/\r?\n/);

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 56, bottom: 56, left: 56, right: 56 },
  info: {
    Title: 'Internship Daily Logbook (Nepal Election Portal 2082)',
    Author: 'Intern',
    Subject: 'Daily Logbook',
  },
});

doc.pipe(fs.createWriteStream(outputPath));

// Header

doc.font('Helvetica-Bold').fontSize(16).text('Internship Daily Logbook', { align: 'left' });
doc.moveDown(0.2);
doc.font('Helvetica').fontSize(11).fillColor('#333333').text('Project: Nepal Election Portal 2082 (Full-Stack Development Internship)');
doc.text('Date range: January 6, 2026 – January 22, 2026 (weekdays only)');
doc.moveDown(0.8);
doc.fillColor('#000000');

const isWeekHeader = (line) => /^WEEK\s+\d+/i.test(line.trim());

for (const rawLine of lines) {
  const line = rawLine.trimEnd();

  if (line.trim().length === 0) {
    doc.moveDown(0.6);
    continue;
  }

  if (isWeekHeader(line)) {
    doc.moveDown(0.2);
    doc.font('Helvetica-Bold').fontSize(13).text(line.trim(), { underline: false });
    doc.moveDown(0.4);
    continue;
  }

  // Daily entry
  doc.font('Helvetica').fontSize(11).text(line.trim(), {
    align: 'left',
    lineGap: 3,
  });
}

doc.end();

console.log(`✅ PDF generated: ${outputPath}`);
console.log(`ℹ️  Source: ${inputPath}`);
