import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { roomApi } from '../../api/roomApi';
import { hostelApi } from '../../api/hostelApi';
import { Hostel } from '../../types/hostel';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Check,
  X,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export const RoomUpload: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostelId, setSelectedHostelId] = useState<string>('');
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const res = await hostelApi.getAll(0, 50);
        if (res.data?.content) {
          setHostels(res.data.content);
        }
      } catch {
        console.warn('Failed to load hostels list for upload');
      }
    };
    fetchHostels();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreviewData(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      const blob = await roomApi.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'SEC_Hostel_Room_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Excel template downloaded successfully');
    } catch {
      toast.error('Failed to download Excel template');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      toast.error('Please select an Excel or CSV file first');
      return;
    }

    try {
      setIsValidating(true);
      const res = await roomApi.previewExcel(file, selectedHostelId || undefined);
      setPreviewData(res.data);
      if (res.data?.errorRows === 0) {
        toast.success(`Validation passed: All ${res.data.validRows} rows are ready for import!`);
      } else {
        toast.error(`Validation found issues in ${res.data.errorRows} of ${res.data.totalRows} rows.`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to parse Excel file');
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setIsImporting(true);
      const res = await roomApi.importExcel(file, selectedHostelId || undefined);
      toast.success(res.message || 'Rooms imported successfully!');
      navigate('/admin/rooms');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to import room inventory');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin/rooms" className="text-gray-500 hover:text-gray-700 text-xs flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Room Inventory
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            Excel Room Inventory Import
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Upload institutional room capacity spreadsheets with real-time validation and preview.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          disabled={isDownloadingTemplate}
          className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-xs"
        >
          <Download className="w-4 h-4 mr-1.5" />
          {isDownloadingTemplate ? 'Downloading...' : 'Download Template (.xlsx)'}
        </button>
      </div>

      {/* Upload & Setup Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Step 1: Choose File & Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <label className="block text-xs font-semibold text-gray-700">
              Select Room Inventory File (.xlsx, .xls, .csv)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-500 transition bg-gray-50/50">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <input
                type="file"
                id="excel-file-input"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="excel-file-input"
                className="cursor-pointer inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-xs mb-2"
              >
                Browse Spreadsheet
              </label>
              <p className="text-xs text-gray-500">
                {file ? (
                  <span className="font-semibold text-emerald-700">Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                ) : (
                  'Supports Microsoft Excel (.xlsx) and standard CSV rosters'
                )}
              </p>
            </div>
          </div>

          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Target Hostel Block
              </label>
              <select
                value={selectedHostelId}
                onChange={(e) => setSelectedHostelId(e.target.value)}
                className="w-full text-xs rounded-lg border-gray-300 shadow-xs focus:ring-emerald-500 focus:border-emerald-500 py-2.5 px-3 border"
              >
                <option value="">Auto-detect from Excel "Hostel" column</option>
                {hostels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.hostelType === 'BOYS' ? 'Boys Portal' : 'Girls Portal'})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                If omitted, rows will automatically assign to Boys Hostel or Girls Hostel based on the "Hostel" column.
              </p>
            </div>

            <button
              onClick={handlePreview}
              disabled={!file || isValidating}
              className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Validating Data...
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4 mr-2" />
                  Validate & Preview Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Validation Summary & Preview Section */}
      {previewData && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
              <span className="text-xs font-semibold text-gray-500">Total Rows Detected</span>
              <div className="text-2xl font-black text-gray-900 mt-1">{previewData.totalRows}</div>
              <span className="text-[11px] text-gray-400">In uploaded sheet</span>
            </div>
            <div className="bg-emerald-50/60 rounded-xl border border-emerald-200 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800">Valid Rows</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-900 mt-1">{previewData.validRows}</div>
              <span className="text-[11px] text-emerald-700">Ready to save to database</span>
            </div>
            <div className={`rounded-xl border p-4 shadow-xs ${
              previewData.errorRows > 0 ? 'bg-rose-50/60 border-rose-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${previewData.errorRows > 0 ? 'text-rose-800' : 'text-gray-500'}`}>
                  Errors / Invalid
                </span>
                {previewData.errorRows > 0 && <AlertTriangle className="w-4 h-4 text-rose-600" />}
              </div>
              <div className={`text-2xl font-black mt-1 ${previewData.errorRows > 0 ? 'text-rose-900' : 'text-gray-700'}`}>
                {previewData.errorRows}
              </div>
              <span className="text-[11px] text-gray-500">
                {previewData.errorRows > 0 ? 'Will be skipped during import' : 'No errors found'}
              </span>
            </div>
          </div>

          {/* Action Callout */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Step 2: Confirm & Import Valid Inventory</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {previewData.validRows > 0
                  ? `Proceeding will create or update ${previewData.validRows} rooms in the institutional database.`
                  : 'No valid rows found. Please fix the errors in your spreadsheet and re-upload.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewData(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={previewData.validRows === 0 || isImporting}
                className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm disabled:opacity-50 transition"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Importing Rooms...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirm & Import ({previewData.validRows} Rooms)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Sheet Rows Preview</h4>
              <span className="text-xs text-gray-500 font-medium">{previewData.rows?.length || 0} Total Rows</span>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Row</th>
                    <th className="py-2.5 px-3 text-left">Hostel</th>
                    <th className="py-2.5 px-3 text-center">Floor</th>
                    <th className="py-2.5 px-3 text-left">Room #</th>
                    <th className="py-2.5 px-3 text-left">Type</th>
                    <th className="py-2.5 px-3 text-center">AC</th>
                    <th className="py-2.5 px-3 text-center">Capacity</th>
                    <th className="py-2.5 px-3 text-center">Available</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-left">Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewData.rows?.map((row: any, idx: number) => (
                    <tr
                      key={idx}
                      className={row.valid ? 'hover:bg-gray-50/80' : 'bg-rose-50/40 hover:bg-rose-50/70'}
                    >
                      <td className="py-2.5 px-3 font-semibold text-gray-500">#{row.rowNumber}</td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">{row.hostelName}</td>
                      <td className="py-2.5 px-3 text-center font-medium">{row.floorNumber ?? '-'}</td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">{row.roomNumber}</td>
                      <td className="py-2.5 px-3 text-gray-600">{row.roomTypeName}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          row.isAc ? 'bg-sky-100 text-sky-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {row.isAc ? 'AC' : 'Non-AC'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-gray-800">{row.totalCapacity}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{row.availableBeds}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {row.valid ? (
                          <span className="inline-flex items-center text-emerald-700 font-semibold gap-1 text-[11px]">
                            <Check className="w-3.5 h-3.5" /> Valid
                          </span>
                        ) : (
                          <div className="text-rose-700 space-y-0.5">
                            {row.errors?.map((err: string, eIdx: number) => (
                              <div key={eIdx} className="flex items-start gap-1 text-[11px] font-medium">
                                <X className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                                <span>{err}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomUpload;
