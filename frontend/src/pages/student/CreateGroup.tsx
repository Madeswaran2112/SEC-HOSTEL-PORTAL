import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupApi } from '../../api/groupApi';
import { roomTypeApi } from '../../api/roomApi';
import { FormField } from '../../components/common/FormField';
import { SelectOption } from '../../types/common';
import toast from 'react-hot-toast';

export const CreateGroup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    groupName: '',
    preferredRoomTypeId: '',
    maxSize: 2
  });
  const [roomTypes, setRoomTypes] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTypes, setFetchingTypes] = useState(true);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const res = await roomTypeApi.getAll();
        const options = res.data.map(rt => ({
          label: `${rt.name} (Capacity: ${rt.capacity})`,
          value: rt.id
        }));
        setRoomTypes(options);
      } catch (error) {
        toast.error('Failed to load room types');
      } finally {
        setFetchingTypes(false);
      }
    };
    fetchRoomTypes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxSize' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.groupName || !formData.preferredRoomTypeId) return;

    try {
      setLoading(true);
      await groupApi.create(formData);
      toast.success('Group created successfully');
      navigate('/student/group');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Group</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Group Name"
          name="groupName"
          required
          value={formData.groupName}
          onChange={handleChange}
          placeholder="E.g. Study Buddies"
        />
        
        <FormField
          as="select"
          label="Preferred Room Type"
          name="preferredRoomTypeId"
          required
          options={roomTypes}
          value={formData.preferredRoomTypeId}
          onChange={handleChange}
          disabled={fetchingTypes}
        />
        
        <FormField
          as="select"
          label="Group Size (including you)"
          name="maxSize"
          required
          options={[
            { label: '2 Members', value: 2 },
            { label: '3 Members', value: 3 },
            { label: '4 Members', value: 4 },
            { label: '5 Members', value: 5 },
            { label: '6 Members', value: 6 }
          ]}
          value={formData.maxSize}
          onChange={handleChange}
        />
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/student/group')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || fetchingTypes}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroup;
