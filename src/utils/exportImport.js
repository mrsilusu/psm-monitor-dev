// src/utils/exportImport.js
// Responsabilidade: parse de ficheiros de entrada e geração de ficheiros de saída
// Máx. 280 linhas

export const buildBackupJSON = (data, justificativas) => ({
  version: '1.0.0',
  timestamp: new Date().toISOString(),
  data,
  justificativas,
  metadata: {
    totalRoutes: Object.values(data || {}).reduce((acc, psmData) => {
      return acc + Object.keys(psmData).length;
    }, 0)
  }
});

export const buildJustificativasCSV = (justificativas) => {
  let csv = 'PSM,Semana,Rota,Justificativa\n';
  Object.entries(justificativas || {}).forEach(([key, justificativa]) => {
    const parts = key.split('_');
    if (parts.length >= 3) {
      const psm = parts[0];
      const semana = parts[1];
      const rota = parts.slice(2).join('_');
      const justificativaEscaped = justificativa.replace(/"/g, '""');
      csv += `${psm},${semana},"${rota}","${justificativaEscaped}"\n`;
    }
  });
  return csv;
};

export const downloadFile = (filename, content, mimeType = 'text/csv;charset=utf-8;') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const parseCSVText = (text) => {
  const normalized = text.charCodeAt(0) === 0xFEFF ? text.substring(1) : text;
  const lines = normalized.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let char of line) {
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim().replace(/^"|"$/g, ''));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim().replace(/^"|"$/g, ''));

    const row = {};
    values.forEach((value, index) => {
      row[headers[index] || `col_${index}`] = value;
    });
    rows.push(row);
  }

  return rows;
};
