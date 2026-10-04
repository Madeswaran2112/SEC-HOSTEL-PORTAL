import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { hostelApi } from '../../api/hostelApi';
import { FormField } from '../../components/common/FormField';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { HostelType } from '../../types/hostel';
import toast from 'react-hot-toast';

export const HostelForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    hostelType: HostelType.BOYS,
    address: '',
    totalFloors: 1
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchHostel = async () => {
        try {
          const res = await hostelApi.getById(id!);
          setFormData({
            name: res.data.name,
            hostelType: res.data.hostelType as HostelType,
            address: res.data.address,
            totalFloors: res.data.totalFloors
          });
        } catch (error) {
          toast.error('Failed to load hostel');
          navigate('/admin/hostels');
        } finally {
          setLoading(false);
        }
      };
      fetchHostel();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalFloors' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) return;

    try {
      setSaving(true);
      if (isEdit) {
        await hostelApi.update(id!, formData);
        toast.success('Hostel updated successfully');
      } else {
        await hostelApi.create(formData);
        toast.success('Hostel created successfully');
      }
      navigate('/admin/hostels');
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
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Hostel' : 'Add New Hostel'}</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Hostel Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
          />
          
          <FormField
            as="select"
            label="Hostel Type"
            name="hostelType"
            required
            options={[
              { label: 'Boys', value: 'BOYS' },
              { label: 'Girls', value: 'GIRLS' }
            ]}
            value={formData.hostelType}
            onChange={handleChange}
          />
          
          <FormField
            label="Total Floors"
            name="totalFloors"
            type="number"
            min="1"
            required
            value={formData.totalFloors}
            onChange={handleChange}
          />
          
          <FormField
            as="textarea"
            label="Address"
            name="address"
            required
            rows={3}
            value={formData.address}
            onChange={handleChange}
          />

          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/hostels')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Hostel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HostelForm;

