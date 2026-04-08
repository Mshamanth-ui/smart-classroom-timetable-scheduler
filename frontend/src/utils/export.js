/**
 * export.js — CSV and PDF/Print export utilities
 */

/** Download any data as a CSV file */
export function downloadCSV(filename, headers, rows) {
  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/** Open a print-ready timetable in a new tab */
export function printTimetable(slots, days, times, filterCls = '') {
  const title = filterCls ? `Timetable — ${filterCls}` : 'Full Weekly Timetable';
  const filtered = filterCls ? slots.filter(s => s.cls === filterCls) : slots;

  const cells = (day, time) => {
    const sl = filtered.find(s => s.day === day && s.timeSlot === time);
    if (!sl) return '<td></td>';
    return `<td style="vertical-align:top">
      <div style="background:#e8f0ff;border-left:3px solid ${sl.color};padding:4px 6px;border-radius:3px;font-size:10px">
        <strong>${sl.subject}</strong><br/>${sl.cls}<br/>${sl.teacher}<br/>${sl.room}
      </div></td>`;
  };

  const rows = times.map(time =>
    `<tr><td style="background:#f0f4ff;font-weight:bold;font-size:10px;width:60px;text-align:center">${time}</td>
    ${days.map(day => cells(day, time)).join('')}</tr>`
  ).join('');

  const html = `<!DOCTYPE html><html><head><title>${title}</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #000; padding: 16px; }
    h2  { font-size: 16px; color: #1a3a6e; margin-bottom: 4px; }
    p   { font-size: 10px; color: #666; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th  { background: #1a3a6e; color: #fff; padding: 7px 6px; font-size: 11px; text-align: center; }
    td  { border: 1px solid #ddd; padding: 4px; min-height: 48px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style></head><body>
  <h2>🏫 Presidency University — ${title}</h2>
  <p>Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; Total Classes: ${filtered.length}</p>
  <table>
    <thead><tr><th>Time</th>${days.map(d => `<th>${d}</th>`).join('')}</tr></thead>
    <tbody>${rows}</tbody>
  </table>
  </body></html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 500);
}
