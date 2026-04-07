const fs = require('fs');
const path = require('path');

const CRLF = '\r\n';
const PNG_SIGNATURE = Buffer.from('89504e470d0a1a0a', 'hex');
const DEFAULT_PDF_LOGO_PATH = path.resolve(__dirname, '../assets/gurukul-logo.png');

function escapePdfText(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r?\n/g, ' ');
}

function loadPngForPdf(filePath = DEFAULT_PDF_LOGO_PATH) {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  const buffer = fs.readFileSync(filePath);
  if (!buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    return null;
  }

  let offset = PNG_SIGNATURE.length;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let compression = 0;
  let filter = 0;
  let interlace = 0;
  const idatChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    offset += 4;

    const chunkType = buffer.subarray(offset, offset + 4).toString('ascii');
    offset += 4;

    const chunkData = buffer.subarray(offset, offset + length);
    offset += length + 4;

    if (chunkType === 'IHDR') {
      width = chunkData.readUInt32BE(0);
      height = chunkData.readUInt32BE(4);
      bitDepth = chunkData[8];
      colorType = chunkData[9];
      compression = chunkData[10];
      filter = chunkData[11];
      interlace = chunkData[12];
    }

    if (chunkType === 'IDAT') {
      idatChunks.push(chunkData);
    }

    if (chunkType === 'IEND') {
      break;
    }
  }

  const isSupported =
    width > 0 &&
    height > 0 &&
    bitDepth === 8 &&
    colorType === 2 &&
    compression === 0 &&
    filter === 0 &&
    interlace === 0 &&
    idatChunks.length > 0;

  if (!isSupported) {
    return null;
  }

  return {
    width,
    height,
    data: Buffer.concat(idatChunks)
  };
}

function buildPdfObject(index, contents) {
  const contentBuffer = Buffer.isBuffer(contents) ? contents : Buffer.from(contents, 'utf8');
  return Buffer.concat([
    Buffer.from(`${index} 0 obj${CRLF}`, 'utf8'),
    contentBuffer,
    Buffer.from(`${CRLF}endobj`, 'utf8')
  ]);
}

function buildPdfStreamObject(index, dictionary, streamBuffer) {
  return Buffer.concat([
    Buffer.from(`${index} 0 obj${CRLF}${dictionary}${CRLF}stream${CRLF}`, 'utf8'),
    streamBuffer,
    Buffer.from(`${CRLF}endstream${CRLF}endobj`, 'utf8')
  ]);
}

function buildSimplePdf({ title = 'Document', lines = [], logoPath = DEFAULT_PDF_LOGO_PATH } = {}) {
  const logo = loadPngForPdf(logoPath);
  const content = [];
  const titleX = logo ? 140 : 50;
  const titleY = logo ? 750 : 760;

  if (logo) {
    content.push('q');
    content.push('72 0 0 72 50 690 cm');
    content.push('/Im1 Do');
    content.push('Q');
  }

  content.push('BT');
  content.push('/F1 22 Tf');
  content.push(`${titleX} ${titleY} Td`);
  content.push(`(${escapePdfText(title)}) Tj`);
  content.push('/F1 12 Tf');

  lines.forEach((line, index) => {
    content.push(index === 0 ? '0 -34 Td' : '0 -18 Td');
    content.push(`(${escapePdfText(line)}) Tj`);
  });

  content.push('ET');

  const stream = Buffer.from(content.join(CRLF), 'utf8');
  const resources = logo
    ? '<< /Font << /F1 4 0 R >> /XObject << /Im1 5 0 R >> >>'
    : '<< /Font << /F1 4 0 R >> >>';
  const contentObjectId = logo ? 6 : 5;
  const objects = [
    buildPdfObject(1, '<< /Type /Catalog /Pages 2 0 R >>'),
    buildPdfObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
    buildPdfObject(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources ${resources} /Contents ${contentObjectId} 0 R >>`),
    buildPdfObject(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  ];

  if (logo) {
    objects.push(
      buildPdfStreamObject(
        5,
        `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /DecodeParms << /Predictor 15 /Colors 3 /BitsPerComponent 8 /Columns ${logo.width} >> /Length ${logo.data.length} >>`,
        logo.data
      )
    );
  }

  objects.push(buildPdfStreamObject(contentObjectId, `<< /Length ${stream.length} >>`, stream));

  let pdf = Buffer.from(`%PDF-1.4${CRLF}`, 'utf8');
  const offsets = [0];

  for (const object of objects) {
    offsets.push(pdf.length);
    pdf = Buffer.concat([pdf, object, Buffer.from(CRLF, 'utf8')]);
  }

  const xrefOffset = pdf.length;
  let xref = `xref${CRLF}`;
  xref += `0 ${objects.length + 1}${CRLF}`;
  xref += `0000000000 65535 f ${CRLF}`;

  for (let index = 1; index < offsets.length; index += 1) {
    xref += `${String(offsets[index]).padStart(10, '0')} 00000 n ${CRLF}`;
  }

  xref += `trailer${CRLF}`;
  xref += `<< /Size ${objects.length + 1} /Root 1 0 R >>${CRLF}`;
  xref += `startxref${CRLF}`;
  xref += `${xrefOffset}${CRLF}`;
  xref += '%%EOF';

  return Buffer.concat([pdf, Buffer.from(xref, 'utf8')]);
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
