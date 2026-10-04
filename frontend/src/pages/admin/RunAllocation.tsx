import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { windowApi, allocationApi } from '../../api/allocationApi';
import { AllocationWindow } from '../../types/allocation';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PlayCircle, CheckCircle2, AlertTriangle, ArrowRight, Layers, Users, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const RunAllocation: React.FC = () => {
  const navigate = useNavigate();
  const [windows, setWindows] = useState<AllocationWindow[]>([]);
  const [selectedWindowId, setSelectedWindowId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any | null>(null);

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

  const handleRun = async () => {
    if (!selectedWindowId) {
      toast.error('Please select an allocation window');
      return;
    }

    if (!window.confirm('Run auto-allocation now? The 3-phase algorithm will process Complete Groups, Partial Groups, and Individuals.')) {
      return;
    }

    try {
      setRunning(true);
      setResult(null);
      const res = await allocationApi.autoRun(selectedWindowId);
      toast.success('Auto-allocation completed successfully!');
      setResult(res.data || { success: true, message: 'All eligible students processed.' });
    } catch {
      toast.error('Failed to run auto-allocation');
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Loading allocation parameters..." />
      </div>
    );
  }

  const selectedWindow = windows.find((w) => w.id === selectedWindowId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <PlayCircle className="h-6 w-6 text-indigo-600" />
          Execute Auto-Allocation Algorithm
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Trigger the greedy room allocation engine for complete groups, partial groups, and individual students in the waiting pool.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label htmlFor="window-select" className="block text-sm font-semibold text-gray-700 mb-2">
            Target Allocation Window
          </label>
          <select
            id="window-select"
            value={selectedWindowId}
            onChange={(e) => setSelectedWindowId(e.target.value)}
            disabled={running}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border"
          >
            {windows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} &bull; {w.academicYear} ({w.status})
              </option>
            ))}
          </select>
          {selectedWindow && (
            <p className="mt-2 text-xs text-gray-500">
              Current Status: <span className="font-semibold text-indigo-600">{selectedWindow.status}</span> &bull; Semester: {selectedWindow.semester}
            </p>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Allocation Phase Hierarchy:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-indigo-50/60 border border-indigo-100">
              <div className="flex items-center text-indigo-700 font-bold text-sm mb-1">
                <Layers className="h-4 w-4 mr-1.5" /> Phase 1: Complete Groups
              </div>
              <p className="text-xs text-indigo-900">
                Groups where all members accepted invitations. Matched to preferred room types and exact capacity first.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-100">
              <div className="flex items-center text-amber-700 font-bold text-sm mb-1">
                <Users className="h-4 w-4 mr-1.5" /> Phase 2: Partial Groups
              </div>
              <p className="text-xs text-amber-900">
                Groups with partial membership. Placed in rooms with sufficient remaining beds.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center text-emerald-700 font-bold text-sm mb-1">
                <Sparkles className="h-4 w-4 mr-1.5" /> Phase 3: Waiting Pool
              </div>
              <p className="text-xs text-emerald-900">
                Individual students prioritized by priority score and FIFO join timestamp, assigned to remaining vacancies.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <p className="font-semibold mb-0.5">Pre-Execution Validation Notice</p>
              <p>
                Strict gender-hostel segregation will be enforced (Boys Hostel for male students, Girls Hostel for female students). Existing room capacity limits and duplicate allocations are protected by database transactions.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleRun}
            disabled={running || !selectedWindowId}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {running ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Running Allocation Engine...</span>
              </>
            ) : (
              <>
                <PlayCircle className="h-5 w-5 mr-2" /> Start Auto-Allocation
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 space-y-4">
          <div className="flex items-center text-green-700 font-bold text-lg gap-2">
            <CheckCircle2 className="h-6 w-6" /> Allocation Batch Complete
          </div>
          <p className="text-sm text-gray-600">
            The allocation engine has finished evaluating requests for window <strong>{selectedWindow?.name}</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
              <div className="text-xs text-emerald-700 font-semibold uppercase">Total Students Allocated</div>
              <div className="text-2xl font-black text-emerald-900 mt-1">{result.totalAllocated ?? 0}</div>
            </div>
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
              <div className="text-xs text-indigo-700 font-semibold uppercase">Group Placements</div>
              <div className="text-2xl font-black text-indigo-900 mt-1">{result.groupAllocations ?? 0}</div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <div className="text-xs text-blue-700 font-semibold uppercase">Individual Placements</div>
              <div className="text-2xl font-black text-blue-900 mt-1">{result.individualAllocations ?? 0}</div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              onClick={() => navigate('/admin/allocations')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Review Allocations
            </button>
            <button
              onClick={() => navigate('/admin/allocations/final-list')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View Final Allocation List <ArrowRight className="h-4 w-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunAllocation;
