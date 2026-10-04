import React from 'react';
import { Search } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface FilterConfig {
  label: string;
  key: string;
  value?: string;
  options: FilterOption[];
  onChange?: (value: string) => void;
}

interface SearchFilterProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  filterValues,
  onFilterChange
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
      {onSearchChange && (
        <div className="relative w-full md:w-80">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      )}

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {filters.map((filter) => {
            const currentValue = filterValues
              ? filterValues[filter.key] || ''
              : filter.value || '';

            const handleChange = (val: string) => {
              if (onFilterChange) {
                onFilterChange(filter.key, val);
              } else if (filter.onChange) {
                filter.onChange(val);
              }
            };

            return (
              <div key={filter.key} className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-500">{filter.label}:</span>
                <select
                  value={currentValue}
                  onChange={(e) => handleChange(e.target.value)}
                  className="rounded-md border border-gray-300 bg-white py-1.5 px-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All</option>
                  {filter.options.map((opt) => (
                    <option key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;

