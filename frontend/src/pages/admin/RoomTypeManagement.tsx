import React, { useEffect, useState } from 'react';
import { roomTypeApi } from '../../api/roomApi';
import { RoomType } from '../../types/room';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { FormField } from '../../components/common/FormField';
import { Edit, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export const RoomTypeManagement: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    capacity: 2,
    isAc: false,
    baseFee: 1000
  });

  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      const res = await roomTypeApi.getAll();
      setRoomTypes(res.data);
    } catch (error) {
      toast.error('Failed to load room types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const openModal = (rt: RoomType | null = null) => {
    setEditingType(rt);
    if (rt) {
      setFormData({ name: rt.name, capacity: rt.capacity, isAc: rt.isAc, baseFee: rt.baseFee });
    } else {
      setFormData({ name: '', capacity: 2, isAc: false, baseFee: 1000 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (editingType) {
        await roomTypeApi.update(editingType.id, formData);
        toast.success('Room type updated');
      } else {
        await roomTypeApi.create(formData);
        toast.success('Room type created');
      }
      setIsModalOpen(false);
      fetchRoomTypes();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this room type? This may fail if rooms are assigned to it.')) return;
    try {
      await roomTypeApi.delete(id);
      toast.success('Room type deleted');
      fetchRoomTypes();
    } catch (error) {
      toast.error('Failed to delete. Rooms might be using it.');
    }
  };

  if (loading && roomTypes.length === 0) return <div className="py-12"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Room Types</h1>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Room Type
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {roomTypes.map((rt) => (
            <li key={rt.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <div className="text-lg font-medium text-gray-900">{rt.name}</div>
                <div className="text-sm text-gray-500">
                  Capacity: {rt.capacity} | Base Fee: ${rt.baseFee} | {rt.isAc ? 'AC' : 'Non-AC'}
                </div>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => openModal(rt)} className="text-indigo-600 hover:text-indigo-900 p-2">
                  <Edit className="h-5 w-5" />
                </button>
                <button onClick={() => handleDelete(rt.id)} className="text-red-600 hover:text-red-900 p-2">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
          {roomTypes.length === 0 && (
            <li className="px-6 py-8 text-center text-gray-500">No room types found.</li>
          )}
        </ul>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingType ? 'Edit Room Type' : 'Add Room Type'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Type Name (e.g. 2 Sharing AC)" name="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <FormField label="Capacity" type="number" min="1" required value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 1})} />
          <FormField label="Base Fee" type="number" min="0" required value={formData.baseFee} onChange={(e) => setFormData({...formData, baseFee: parseInt(e.target.value) || 0})} />
          <div className="flex items-center">
            <input type="checkbox" id="isAc" checked={formData.isAc} onChange={(e) => setFormData({...formData, isAc: e.target.checked})} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
            <label htmlFor="isAc" className="ml-2 block text-sm text-gray-900">Air Conditioned (AC)</label>
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoomTypeManagement;
