import React from 'react';
import { Student } from '../../types/student';
import { StatusBadge } from '../common/StatusBadge';
import { User, Phone, Mail, BookOpen, Calendar, Edit } from 'lucide-react';

interface ProfileCardProps {
  student: Student;
  onEdit?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ student, onEdit }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-white">Student Profile</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-white hover:text-indigo-200 focus:outline-none">
            <Edit className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="px-6 py-5 border-t border-gray-200">
        <div className="flex items-center mb-6">
          <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold uppercase">
            {student.name.charAt(0)}
          </div>
          <div className="ml-5">
            <h4 className="text-xl font-bold text-gray-900">{student.name}</h4>
            <p className="text-sm text-gray-500">{student.registerNumber}</p>
            <div className="mt-1">
              <StatusBadge status={student.allocationStatus} />
            </div>
          </div>
        </div>
        
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-400" /> Email
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{student.email}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-400" /> Phone
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{student.phone}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-gray-400" /> Department
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{student.department}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" /> Year
            </dt>
            <dd className="mt-1 text-sm text-gray-900">Year {student.year}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-400" /> Gender
            </dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">{student.gender.toLowerCase()}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
