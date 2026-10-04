import React, { useEffect, useState } from 'react';
import { windowApi } from '../../api/allocationApi';
import { exportApi } from '../../api/exportApi';
import { AllocationWindow } from '../../types/allocation';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FileDown, FileSpreadsheet, FileText, Download, Users, FileCheck2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ExportCenter: React.FC = () => {
  const [windows, setWindows] = useState<AllocationWindow[]>([]);
  const [selectedWindowId, setSelectedWindowId] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchWindows = async () => {
      try {
        setLoading(true);
        const res = await windowApi.getAll(0, 50);
        if (res.data?.content && res.data.content.length > 0) {
          setWindows(res.data.content);
          setSelectedWindowId(res.data.content[0].id);
        }
      } catch {
        toast.error('Failed to load allocation windows');
      } finally {
        setLoading(false);
      }
    };

    fetchWindows();
  }, []);

  const handleDownload = (blobData: any, filename: string) => {
    const url = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };

  const exportFile = async (type: string, fetcher: () => Promise<any>, filename: string) => {
    try {
      setDownloading(type);
      const data = await fetcher();
      handleDownload(data, filename);
      toast.success(`${filename} downloaded successfully`);
    } catch {
      toast.error(`Failed to export ${filename}`);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Loading export center..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileDown className="h-6 w-6 text-indigo-600" />
          Export & Reporting Center
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate and download official CSV, Excel, and PDF reports for institutional records, notices, and audit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Allocations Report Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Hostel Room Allocations Report</h2>
            <p className="text-sm text-gray-500 mt-1">
              Complete list of allocated rooms, bed assignments, student details, and confirmation statuses.
            </p>

            <div className="mt-4">
              <label htmlFor="window-select" className="block text-xs font-semibold text-gray-700 mb-1">
                Select Allocation Window
              </label>
              <select
                id="window-select"
                value={selectedWindowId}
                onChange={(e) => setSelectedWindowId(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border"
              >
                {windows.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} &bull; {w.academicYear}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2">
            <button
              onClick={() =>
                exportFile(
                  'alloc-csv',
                  () => exportApi.exportAllocationsCSV(selectedWindowId),
                  `room-allocations-${selectedWindowId}.csv`
                )
              }
              disabled={downloading !== null}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <FileText className="h-4 w-4 mr-1.5 text-gray-500" />
              {downloading === 'alloc-csv' ? 'Downloading...' : 'CSV Export'}
            </button>
            <button
              onClick={() =>
                exportFile(
                  'alloc-excel',
                  () => exportApi.exportAllocationsExcel(selectedWindowId),
                  `room-allocations-${selectedWindowId}.xlsx`
                )
              }
              disabled={downloading !== null}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4 mr-1.5 text-green-600" />
              {downloading === 'alloc-excel' ? 'Downloading...' : 'Excel Sheet'}
            </button>
            <button
              onClick={() =>
                exportFile(
                  'alloc-pdf',
                  () => exportApi.exportAllocationsPDF(selectedWindowId),
                  `room-allocations-${selectedWindowId}.pdf`
                )
              }
              disabled={downloading !== null}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-1.5 text-red-600" />
              {downloading === 'alloc-pdf' ? 'Downloading...' : 'Official PDF'}
            </button>
          </div>
        </div>

        {/* Student Master Directory Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="h-10 w-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-3">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Student Enrollment Directory</h2>
            <p className="text-sm text-gray-500 mt-1">
              Master register of all students registered in the system including contact details, department, year, and allocation status.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() =>
                exportFile(
                  'student-csv',
                  () => exportApi.exportStudentsCSV(),
                  'students-directory.csv'
                )
              }
              disabled={downloading !== null}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              {downloading === 'student-csv' ? 'Generating CSV...' : 'Download Student Directory (CSV)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportCenter;
