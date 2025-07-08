// File: src/components/common/InputField.tsx
'use client';
import React from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form';

type InputFieldProps = {
  label: React.ReactNode; // Accept React elements as label
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  type?: string;
  defaultValue?: string;
  as?: 'textarea';
  rows?: number;
};

export default function InputField({
  label,
  name,
  register,
  error,
  type = 'text',
  defaultValue,
  as,
  rows,
}: InputFieldProps) {
  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea
          {...register(name)}
          defaultValue={defaultValue}
          rows={rows}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
      ) : (
        <input
          type={type}
          {...register(name)}
          defaultValue={defaultValue}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error.message}</p>
      )}
    </div>
  );
}
