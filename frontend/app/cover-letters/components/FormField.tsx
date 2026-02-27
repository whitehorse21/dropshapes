'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface FormFieldProps {
  label?: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  success?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
  helperText?: string;
  children?: React.ReactNode;
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  success,
  rows,
  className = '',
  disabled = false,
  helperText,
  children,
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const baseInputClasses = `
    form-field-input
    w-full px-4 py-3 border rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
    disabled:opacity-70 disabled:cursor-not-allowed
  `;

  const inputClasses = `
    ${baseInputClasses}
    ${error
      ? 'border-red-500'
      : success
        ? 'border-green-500'
        : isFocused
          ? 'border-[var(--accent)]'
          : ''
    }
    ${className}
  `;

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows || 4}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
      );
    }

    return (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={inputClasses}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
      />
    );
  };

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={name}
          className="form-field-label block text-sm font-medium"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {renderInput()}
        {(error || success) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {error ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
        )}
      </div>

      {helperText && !error && !success && (
        <p className="form-field-helper text-sm">{helperText}</p>
      )}
      {error && (
        <p className="form-field-error text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center form-field-success">
          <CheckCircle className="h-4 w-4 mr-1" />
          {success}
        </p>
      )}
    </div>
  );
}
