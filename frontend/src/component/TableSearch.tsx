// src/component/TableSearch.tsx
'use client';

import React from 'react';

type TableSearchProps = {
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
};

export default function TableSearch({ placeholder, value, onChange }: TableSearchProps) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded px-3 py-1 w-full md:w-64 text-sm"
    />
  );
}
