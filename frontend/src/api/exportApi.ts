import axiosInstance from './axiosInstance';

export const exportApi = {
  exportAllocationsCSV: async (windowId?: string) => {
    let url = '/export/allocations/csv';
    if (windowId) url += `?windowId=${windowId}`;
    const response = await axiosInstance.get(url, { responseType: 'blob' });
    return response.data;
  },
  
  exportAllocationsExcel: async (windowId?: string) => {
    let url = '/export/allocations/excel';
    if (windowId) url += `?windowId=${windowId}`;
    const response = await axiosInstance.get(url, { responseType: 'blob' });
    return response.data;
  },
  
  exportAllocationsPDF: async (windowId?: string) => {
    let url = '/export/allocations/pdf';
    if (windowId) url += `?windowId=${windowId}`;
    const response = await axiosInstance.get(url, { responseType: 'blob' });
    return response.data;
  },
  
  exportStudentsCSV: async () => {
    const response = await axiosInstance.get('/export/students/csv', { responseType: 'blob' });
    return response.data;
  }
};

