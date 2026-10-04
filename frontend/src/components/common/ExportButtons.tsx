import React from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

interface ExportButtonsProps {
  onExportCSV?: () => void;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  loading?: boolean;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportCSV,
  onExportExcel,
  onExportPDF,
  loading = false
}) => {
  return (
    <div className="inline-flex rounded-md shadow-sm space-x-2">
      {onExportCSV && (
        <button
          type="button"
          onClick={onExportCSV}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <FileText className="h-4 w-4 mr-1 text-gray-500" />
          CSV
        </button>
      )}
      {onExportExcel && (
        <button
          type="button"
          onClick={onExportExcel}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <FileSpreadsheet className="h-4 w-4 mr-1 text-green-600" />
          Excel
        </button>
      )}
      {onExportPDF && (
        <button
          type="button"
          onClick={onExportPDF}
          disabled={loading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <Download className="h-4 w-4 mr-1 text-red-600" />
          PDF
        </button>
      )}
    </div>
  );
};

export default ExportButtons;

