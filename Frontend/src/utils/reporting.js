function escapeCsvValue(value) {
  const stringValue = value === null || value === undefined ? '' : String(value);
  const escaped = stringValue.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

export function downloadCsv(filename, rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const headers = safeRows.length ? Object.keys(safeRows[0]) : ['message'];
  const normalizedRows = safeRows.length ? safeRows : [{ message: 'No data available' }];
  const csv = [
    headers.join(','),
    ...normalizedRows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function formatDateTime(value) {
  if (!value) return 'N/A';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function renderSection(section) {
  const rows = Array.isArray(section.rows) ? section.rows : [];
  const columns = Array.isArray(section.columns) ? section.columns : [];

  if (!rows.length) {
    return `
      <section class="report-section">
        <h2>${section.title}</h2>
        <p class="report-empty">No data available.</p>
      </section>
    `;
  }

  return `
    <section class="report-section">
      <h2>${section.title}</h2>
      ${section.description ? `<p class="report-description">${section.description}</p>` : ''}
      <table>
        <thead>
          <tr>${columns.map((column) => `<th>${column.label}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              ${columns.map((column) => `<td>${row[column.key] ?? ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `;
}

export function openPrintReport({ title, subtitle, sections }) {
  const reportWindow = window.open('', '_blank');
  if (!reportWindow) return false;

  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          :root {
            color-scheme: light;
            font-family: Arial, Helvetica, sans-serif;
          }

          body {
            margin: 0;
            padding: 32px;
            color: #111827;
            background: #ffffff;
          }

          header {
            margin-bottom: 24px;
            padding-bottom: 18px;
            border-bottom: 2px solid #e5e7eb;
          }

          h1 {
            margin: 0 0 8px;
            font-size: 28px;
          }

          .subtitle {
            margin: 0;
            color: #4b5563;
            font-size: 14px;
          }

          .report-section {
            margin-bottom: 28px;
            page-break-inside: avoid;
          }

          h2 {
            margin: 0 0 12px;
            font-size: 18px;
          }

          .report-description,
          .report-empty {
            margin: 0 0 12px;
            color: #4b5563;
            font-size: 13px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }

          th,
          td {
            border: 1px solid #d1d5db;
            padding: 10px 12px;
            text-align: left;
            vertical-align: top;
            font-size: 12px;
            word-break: break-word;
          }

          th {
            background: #eff6ff;
            color: #1d4ed8;
            font-weight: 700;
          }

          @media print {
            body {
              padding: 18px;
            }
          }
        </style>
      </head>
      <body>
        <header>
          <h1>${title}</h1>
          <p class="subtitle">${subtitle}</p>
        </header>
        ${(sections || []).map(renderSection).join('')}
      </body>
    </html>
  `;

  reportWindow.document.open();
  reportWindow.document.write(html);
  reportWindow.document.close();
  reportWindow.focus();
  reportWindow.onload = () => {
    reportWindow.focus();
    setTimeout(() => {
      reportWindow.print();
    }, 250);
  };
  return true;
}
