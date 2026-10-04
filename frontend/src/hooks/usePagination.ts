import { useState } from 'react';

export const usePagination = (initialPage = 0, initialSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0); // Reset to first page when size changes
  };

  return {
    page,
    size,
    setPage,
    setSize,
    handlePageChange,
    handleSizeChange,
  };
};

export default usePagination;

