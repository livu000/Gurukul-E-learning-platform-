const CRLF = '\r\n';

function escapePdfText(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r?\n/g, ' ');
}

function buildSimplePdf({ title = 'Document', lines = [] } = {}) {
  const content = [
    'BT',
    '/F1 22 Tf',
    '50 760 Td',
    `(${escapePdfText(title)}) Tj`,
    '/F1 12 Tf'
  ];

  lines.forEach((line, index) => {
    content.push(index === 0 ? '0 -34 Td' : '0 -18 Td');
    content.push(`(${escapePdfText(line)}) Tj`);
  });

  content.push('ET');

  const stream = content.join(CRLF);
  const objects = [
    '1 0 obj' + CRLF + '<< /Type /Catalog /Pages 2 0 R >>' + CRLF + 'endobj',
    '2 0 obj' + CRLF + '<< /Type /Pages /Kids [3 0 R] /Count 1 >>' + CRLF + 'endobj',
    '3 0 obj' + CRLF + '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>' + CRLF + 'endobj',
    '4 0 obj' + CRLF + '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>' + CRLF + 'endobj',
    `5 0 obj${CRLF}<< /Length ${Buffer.byteLength(stream, 'utf8')} >>${CRLF}stream${CRLF}${stream}${CRLF}endstream${CRLF}endobj`
  ];

  let pdf = '%PDF-1.4' + CRLF;
  const offsets = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += object + CRLF;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += 'xref' + CRLF;
  pdf += `0 ${objects.length + 1}` + CRLF;
  pdf += '0000000000 65535 f ' + CRLF;

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n ${CRLF}`;
  }

  pdf += 'trailer' + CRLF;
  pdf += `<< /Size ${objects.length + 1} /Root 1 0 R >>` + CRLF;
  pdf += 'startxref' + CRLF;
  pdf += `${xrefOffset}` + CRLF;
  pdf += '%%EOF';

  return Buffer.from(pdf, 'utf8');
}

function csvValue(value) {
  const normalized = value === null || value === undefined ? '' : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
}

function buildCsv(columns, rows) {
  const header = columns.map((column) => csvValue(column.header)).join(',');
  const body = rows.map((row) => columns.map((column) => csvValue(row[column.key])).join(','));
  return [header, ...body].join(CRLF);
}

module.exports = {
  buildSimplePdf,
  buildCsv
};
