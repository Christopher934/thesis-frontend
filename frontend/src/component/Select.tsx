'use client';

import React from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form';

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  options: SelectOption[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

const Select: React.FC<SelectProps> = ({
  label,
  name,
  register,
  error,
  options,
  disabled = false,
  placeholder = "Pilih...",
  className = "",
}) => {
  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      <select
        id={name}
        {...register(name)}
        disabled={disabled}
        className={`w-full p-2 border rounded-md 
          ${error ? 'border-red-500' : 'border-gray-300'} 
          ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white'}
          focus:outline-none focus:ring-1 focus:ring-blue-500`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options && options.length > 0 ? (
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        ) : (
          <option value="" disabled>
            Tidak ada opsi tersedia
          </option>
        )}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error.message}</p>
      )}
    </div>
  );
};

export default Select;
