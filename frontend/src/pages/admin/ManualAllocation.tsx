import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../api/studentApi';
import { hostelApi } from '../../api/hostelApi';
import { roomApi } from '../../api/roomApi';
import { allocationApi } from '../../api/allocationApi';
import { Student } from '../../types/student';
import { Hostel } from '../../types/hostel';
import { Room } from '../../types/room';
import { FormField } from '../../components/common/FormField';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { UserPlus, ArrowLeft, Building, DoorOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export const ManualAllocation: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedHostelId, setSelectedHostelId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [bedNumber, setBedNumber] = useState<number>(1);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [studentRes, hostelRes] = await Promise.all([
          studentApi.getStudents(0, 100, undefined, 'NOT_APPLIED'),
          hostelApi.getAll(0, 50)
        ]);

        if (studentRes.data?.content) {
          setStudents(studentRes.data.content);
        }
        if (hostelRes.data?.content) {
          setHostels(hostelRes.data.content);
          if (hostelRes.data.content.length > 0) {
            setSelectedHostelId(hostelRes.data.content[0].id);
          }
        }
      } catch {
        toast.error('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // Fetch rooms when hostel changes
  useEffect(() => {
    const fetchRooms = async () => {
      if (!selectedHostelId) return;
      try {
        const res = await roomApi.getAll(0, 100, selectedHostelId);
        if (res.data?.content) {
          // Filter rooms that have at least 1 available bed
          const availableRooms = res.data.content.filter((r) => r.availableBeds > 0);
          setRooms(availableRooms);
          if (availableRooms.length > 0) {
            setSelectedRoomId(availableRooms[0].id);
          } else {
            setSelectedRoomId('');
          }
        }
      } catch {
        toast.error('Failed to load rooms for selected hostel');
      }
    };

    fetchRooms();
  }, [selectedHostelId]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedRoomId || !bedNumber) {
      toast.error('Please complete all allocation fields');
      return;
    }

    // Gender check
    if (selectedStudent && selectedRoom) {
      const hostel = hostels.find((h) => h.id === selectedHostelId);
      if (hostel) {
        if (selectedStudent.gender === 'MALE' && hostel.hostelType !== 'BOYS') {
          toast.error('Validation error: Male students must be assigned to Boys Hostel');
          return;
        }
        if (selectedStudent.gender === 'FEMALE' && hostel.hostelType !== 'GIRLS') {
          toast.error('Validation error: Female students must be assigned to Girls Hostel');
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      await allocationApi.manualAllocate({
        studentId: selectedStudentId,
        roomId: selectedRoomId,
        bedNumber: Number(bedNumber)
      });
      toast.success('Manual room allocation successful!');
      navigate('/admin/allocations');
    } catch {
      toast.error('Failed to assign room');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Loading allocation form..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/allocations')}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Allocations
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-indigo-600" />
            Manual Room Allocation
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Override or directly assign a specific room and bed number to a student.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="student-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Student <span className="text-red-500">*</span>
            </label>
            <select
              id="student-select"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
            >
              <option value="">-- Choose student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.registerNumber}) &bull; {s.department} Year {s.year} &bull; {s.gender}
                </option>
              ))}
            </select>
            {selectedStudent && (
              <div className="mt-2 text-xs text-indigo-700 bg-indigo-50 p-2 rounded">
                Selected: <strong>{selectedStudent.name}</strong> ({selectedStudent.gender}) &bull; Target Hostel: {selectedStudent.gender === 'MALE' ? 'Boys Hostel' : 'Girls Hostel'}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hostel-select" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Building className="h-4 w-4 text-gray-500" /> Hostel <span className="text-red-500">*</span>
              </label>
              <select
                id="hostel-select"
                value={selectedHostelId}
                onChange={(e) => setSelectedHostelId(e.target.value)}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
              >
                {hostels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.hostelType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="room-select" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <DoorOpen className="h-4 w-4 text-gray-500" /> Room <span className="text-red-500">*</span>
              </label>
              <select
                id="room-select"
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
              >
                {rooms.length === 0 ? (
                  <option value="">No rooms with vacancies</option>
                ) : (
                  rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber} ({r.roomTypeName || `${r.capacity}-in-1`}) - {r.availableBeds} beds available
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <FormField
              label="Bed Number"
              type="number"
              name="bedNumber"
              min={1}
              max={selectedRoom ? selectedRoom.capacity : 10}
              required
              value={bedNumber}
              onChange={(e) => setBedNumber(Number(e.target.value))}
            />
            {selectedRoom && (
              <p className="mt-1 text-xs text-gray-500">
                Room capacity is {selectedRoom.capacity}. Bed numbers: 1 to {selectedRoom.capacity}.
              </p>
            )}
          </div>

          <div className="pt-4 border-t flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/allocations')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedRoomId || !selectedStudentId}
              className="px-5 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Allocating...' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualAllocation;
