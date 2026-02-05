import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType } from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read and parse data.json
const dataPath = path.join(__dirname, 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Deduplicate by ps_id to get unique problem statements
const seen = new Set();
const uniqueProblems = data.filter((item) => {
  if (seen.has(item.ps_id)) return false;
  seen.add(item.ps_id);
  return true;
});

// Sort by ps_id for orderly display
uniqueProblems.sort((a, b) => (a.ps_id || '').localeCompare(b.ps_id || ''));

/**
 * Create paragraphs from text (handles long text and newlines)
 */
function createParagraphs(text) {
  if (!text || !text.trim()) return [new Paragraph({ text: '-' })];
  const blocks = text.split(/\n\n+/).filter(Boolean);
  return blocks.map(
    (block) =>
      new Paragraph({
        children: [
          new TextRun({
            text: block.replace(/\n/g, ' ').trim(),
            size: 22, // 11pt
          }),
        ],
        spacing: { after: 80 },
      })
  );
}

// Build table rows
const tableRows = [
  // Header row
  new TableRow({
    tableHeader: true,
    children: [
        new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Sl No', bold: true, size: 24, color: 'FFFFFF' })],
          }),
        ],
        shading: { fill: '2E5090' },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'PS ID', bold: true, size: 24, color: 'FFFFFF' })],
          }),
        ],
        shading: { fill: '2E5090' },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Domain', bold: true, size: 24, color: 'FFFFFF' })],
          }),
        ],
        shading: { fill: '2E5090' },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Problem Title', bold: true, size: 24, color: 'FFFFFF' })],
          }),
        ],
        shading: { fill: '2E5090' },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Problem Statement', bold: true, size: 24, color: 'FFFFFF' })],
          }),
        ],
        shading: { fill: '2E5090' },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Expected Solution', bold: true, size: 24, color: 'FFFFFF' })],
          }),
        ],
        shading: { fill: '2E5090' },
      }),
    ],
  }),
];

// Data rows
uniqueProblems.forEach((item, index) => {
  const problemText = (item.problem_title ? item.problem_title + '\n\n' : '') + (item.problem_statement || '');
  const expectedText = item.expected_solutions || '';

  tableRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: String(index + 1) })],
          width: { size: 5, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: item.ps_id || '-' })],
          width: { size: 8, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: item.domain || '-' })],
          width: { size: 12, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph({ text: (item.problem_title || '-').substring(0, 150) + (item.problem_title?.length > 150 ? '...' : '') })],
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: createParagraphs(problemText),
          width: { size: 28, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: createParagraphs(expectedText),
          width: { size: 27, type: WidthType.PERCENTAGE },
        }),
      ],
    })
  );
});

const table = new Table({
  rows: tableRows,
  width: { size: 100, type: WidthType.PERCENTAGE },
  layout: 'autofit',
  borders: {
    top: { style: 'single', size: 1, color: '333333' },
    bottom: { style: 'single', size: 1, color: '333333' },
    left: { style: 'single', size: 1, color: '333333' },
    right: { style: 'single', size: 1, color: '333333' },
  },
});

const doc = new Document({
  title: 'CODE FEST 26 - Problem Statements',
  creator: 'CODE FEST 26',
  description: 'Problem Statements for Hackathon',
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: 'CODE FEST 26',
              bold: true,
              size: 48,
            }),
          ],
          alignment: 'center',
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Problem Statements',
              bold: true,
              size: 36,
            }),
          ],
          alignment: 'center',
          spacing: { after: 400 },
        }),
        table,
      ],
    },
  ],
});

// Generate and save
const buffer = await Packer.toBuffer(doc);
const outputPath = path.join(__dirname, 'Problem statements.docx');
fs.writeFileSync(outputPath, buffer);
console.log('Created: Problem statements.docx');
