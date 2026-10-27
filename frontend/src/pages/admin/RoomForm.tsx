import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { roomApi, roomTypeApi } from '../../api/roomApi';
import { hostelApi } from '../../api/hostelApi';
import { FormField } from '../../components/common/FormField';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SelectOption } from '../../types/common';
import toast from 'react-hot-toast';

export const RoomForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    hostelId: '',
    roomTypeId: '',
    roomNumber: '',
    building: 'Block A',
    floorNumber: 1,
    totalCapacity: 0
  });
  
  const [hostels, setHostels] = useState<SelectOption[]>([]);
  const [roomTypes, setRoomTypes] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [hostelRes, typeRes] = await Promise.all([
          hostelApi.getAll(0, 100),
          roomTypeApi.getAll()
        ]);
        
        setHostels(hostelRes.data.content.map(h => ({ label: h.name, value: h.id })));
        setRoomTypes(typeRes.data.map(rt => ({ label: `${rt.name} (${rt.capacity} beds)`, value: rt.id })));

        if (isEdit) {
          const roomRes = await roomApi.getById(id!);
          setFormData({
            hostelId: String(roomRes.data.hostelId),
            roomTypeId: String(roomRes.data.roomTypeId),
            roomNumber: roomRes.data.roomNumber,
            building: roomRes.data.building || 'Block A',
            floorNumber: roomRes.data.floorNumber,
            totalCapacity: roomRes.data.totalCapacity || roomRes.data.capacity || 0
          });
        }
      } catch (error) {
        toast.error('Failed to load form data');
        navigate('/admin/rooms');
      } finally {
        setLoading(false);
      }
    };
    
    initData();
  }, [id, isEdit, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'floorNumber' || name === 'totalCapacity') ? (parseInt(value) || 0) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hostelId || !formData.roomTypeId || !formData.roomNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        totalCapacity: formData.totalCapacity > 0 ? formData.totalCapacity : undefined
      };
      if (isEdit) {
        await roomApi.update(id!, payload);
        toast.success('Room updated successfully');
      } else {
        await roomApi.create(payload);
        toast.success('Room created successfully');
      }
      navigate('/admin/rooms');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-12"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Room' : 'Add New Room'}</h1>
        <p className="text-sm text-gray-500 mt-1">Configure room building, floor number, room type, and usable bed capacity.</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            as="select"
            label="Hostel"
            name="hostelId"
            required
            options={hostels}
            value={formData.hostelId}
            onChange={handleChange}
          />
          
          <FormField
            as="select"
            label="Room Type"
            name="roomTypeId"
            required
            options={roomTypes}
            value={formData.roomTypeId}
            onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Building / Block"
              name="building"
              value={formData.building}
              onChange={handleChange}
              placeholder="e.g. Block A, Kaveri Block"
            />

            <FormField
              label="Room Number"
              name="roomNumber"
              required
              value={formData.roomNumber}
              onChange={handleChange}
              placeholder="e.g. 101A"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Floor Number"
              name="floorNumber"
              type="number"
              required
              value={formData.floorNumber}
              onChange={handleChange}
            />

            <FormField
              label="Total Usable Beds (Override)"
              name="totalCapacity"
              type="number"
              value={formData.totalCapacity}
              onChange={handleChange}
              placeholder="0 to use Room Type default"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/rooms')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomForm;
