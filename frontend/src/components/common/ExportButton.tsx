import React from 'react';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  data: any[];
  filename?: string;
  label?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename = 'ets_dashboard_export.csv',
  label = 'Export CSV',
}) => {
  const handleExport = () => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header];
        const escaped = ('' + (val ?? '')).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200 rounded-md px-2 py-0.8 shadow-xs transition-colors"
      title="Download table data as CSV"
    >
      <Download className="w-3 h-3 text-cyan-600" />
      <span>{label}</span>
    </button>
  );
};
