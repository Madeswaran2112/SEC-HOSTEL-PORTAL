import React from 'react';

interface Option {
  label: string;
  value: string | number;
}

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label: string;
  error?: string;
  as?: 'input' | 'select' | 'textarea';
  options?: Option[];
  rows?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  as = 'input',
  options = [],
  id,
  name,
  required,
  className = '',
  rows = 3,
  ...props
}) => {
  const fieldId = id || name || label.toLowerCase().replace(/\s+/g, '-');
  const baseClasses = `block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border ${
    error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : ''
  } ${className}`;

  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {as === 'select' ? (
        <select
          id={fieldId}
          name={name}
          required={required}
          className={baseClasses}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : as === 'textarea' ? (
        <textarea
          id={fieldId}
          name={name}
          required={required}
          rows={rows}
          className={baseClasses}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={fieldId}
          name={name}
          required={required}
          className={baseClasses}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormField;

