import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentApi } from '../../api/studentApi';
import { Student } from '../../types/student';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { ArrowLeft, User, Mail, Phone, BookOpen, Calendar, Building, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await studentApi.getStudentById(id);
        if (res.data) {
          setStudent(res.data);
        }
      } catch {
        toast.error('Failed to load student details');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Loading student record..." />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Student not found.</p>
        <button
          onClick={() => navigate('/admin/students')}
          className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          &larr; Back to Students List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/students')}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Students
        </button>
        <StatusBadge status={String(student.allocationStatus)} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {student.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{student.name}</h1>
              <p className="text-indigo-100 text-sm">Register No: <span className="font-mono font-medium">{student.registerNumber}</span></p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 border-b pb-2">Academic Information</h2>
            <div className="flex items-center text-sm text-gray-700">
              <BookOpen className="h-4 w-4 text-indigo-500 mr-3 flex-shrink-0" />
              <span className="text-gray-500 w-28">Department:</span>
              <span className="font-medium text-gray-900">{student.department}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Calendar className="h-4 w-4 text-indigo-500 mr-3 flex-shrink-0" />
              <span className="text-gray-500 w-28">Current Year:</span>
              <span className="font-medium text-gray-900">Year {student.year}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <User className="h-4 w-4 text-indigo-500 mr-3 flex-shrink-0" />
              <span className="text-gray-500 w-28">Gender:</span>
              <span className="font-medium text-gray-900 capitalize">{student.gender.toLowerCase()}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <ShieldCheck className="h-4 w-4 text-indigo-500 mr-3 flex-shrink-0" />
              <span className="text-gray-500 w-28">Registered On:</span>
              <span className="font-medium text-gray-900">{formatDate(student.createdAt)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 border-b pb-2">Contact Details</h2>
            <div className="flex items-center text-sm text-gray-700">
              <Mail className="h-4 w-4 text-indigo-500 mr-3 flex-shrink-0" />
              <span className="text-gray-500 w-28">Email:</span>
              <a href={`mailto:${student.email}`} className="font-medium text-indigo-600 hover:underline">{student.email}</a>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Phone className="h-4 w-4 text-indigo-500 mr-3 flex-shrink-0" />
              <span className="text-gray-500 w-28">Phone:</span>
              <span className="font-medium text-gray-900">{student.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Building className="h-4 w-4 text-indigo-500 mr-3 flex-shrink-0" />
              <span className="text-gray-500 w-28">Hostel Type:</span>
              <span className="font-medium text-gray-900">{student.gender === 'MALE' ? 'Boys Hostel' : 'Girls Hostel'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-xs text-gray-500">Student ID: {student.id}</span>
          <button
            onClick={() => navigate('/admin/allocations/manual')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Assign Room Manually
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
