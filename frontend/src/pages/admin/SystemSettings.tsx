import React, { useState } from 'react';
import { FormField } from '../../components/common/FormField';
import { Settings, Save, Bell, Shield, Sliders } from 'lucide-react';
import toast from 'react-hot-toast';

export const SystemSettings: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    academicYear: '2026-2027',
    institutionName: 'State Engineering College Hostels',
    maxGroupSize: '10',
    allocationRoundTimeoutDays: '3',
    allowPartialGroupAllocation: true,
    enableEmailNotifications: true,
    strictGenderEnforcement: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('System settings updated successfully');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-600" />
          System Settings & Policy Configuration
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Global hosteling parameters, allocation algorithm weights, and institutional rules.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-600" /> General Institutional Info
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Institution / Hostel Brand Name"
              name="institutionName"
              value={settings.institutionName}
              onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
              required
            />
            <FormField
              label="Default Academic Year"
              name="academicYear"
              value={settings.academicYear}
              onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Allocation Engine Rules */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-600" /> Room Allocation Algorithm Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Max Group Member Limit"
              type="number"
              name="maxGroupSize"
              min={2}
              max={10}
              value={settings.maxGroupSize}
              onChange={(e) => setSettings({ ...settings, maxGroupSize: e.target.value })}
              required
            />
            <FormField
              label="Student Offer Acceptance Deadline (Days)"
              type="number"
              name="allocationRoundTimeoutDays"
              min={1}
              max={14}
              value={settings.allocationRoundTimeoutDays}
              onChange={(e) => setSettings({ ...settings, allocationRoundTimeoutDays: e.target.value })}
              required
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowPartialGroupAllocation}
                onChange={(e) => setSettings({ ...settings, allowPartialGroupAllocation: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Allow Partial Group Allocation (Phase 2)</span>
                <p className="text-xs text-gray-500">
                  When enabled, groups with fewer accepted members than room capacity will be accommodated in rooms with matching empty beds.
                </p>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.strictGenderEnforcement}
                onChange={(e) => setSettings({ ...settings, strictGenderEnforcement: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Enforce Strict Hostel Gender Segregation</span>
                <p className="text-xs text-gray-500">
                  Mandatory segregation between Boys Hostel and Girls Hostel blocks.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Notifications Config */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-600" /> Communication Settings
          </h2>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableEmailNotifications}
              onChange={(e) => setSettings({ ...settings, enableEmailNotifications: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Dispatch Email Alerts</span>
              <p className="text-xs text-gray-500">
                Send automated email alerts on group invitations, allocation offers, and status changes.
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving Changes...' : 'Save System Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;
