'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface SortOption {
  label: string;
  value: string;
  direction?: 'asc' | 'desc';
}

interface SortButtonProps {
  options: SortOption[];
  onSort: (value: string, direction: 'asc' | 'desc') => void;
}

const SortButton = ({ options, onSort }: SortButtonProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeSort, setActiveSort] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSortSelect = (value: string) => {
    // If clicking the same option again, toggle the direction
    if (activeSort === value) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      onSort(value, newDirection);
    } else {
      // New sort option, use default direction (asc)
      setActiveSort(value);
      setSortDirection('asc');
      onSort(value, 'asc');
    }
    
    setShowDropdown(false);
  };

  const handleClearSort = () => {
    setActiveSort(null);
    setSortDirection('asc');
    onSort('', 'asc');
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button 
        className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all ${activeSort ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
        onClick={handleToggleDropdown}
        aria-label="Sort"
        title={activeSort ? `Urut: ${activeSort} (${sortDirection === 'asc' ? 'A-Z' : 'Z-A'})` : "Urutkan"}
      >
        <Image src="/sort.png" alt="Sort" width={14} height={14} />
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            <div className="px-4 py-2 text-xs font-medium text-gray-700 border-b">
              Urutkan Berdasarkan
            </div>
            
            {options.map((option) => (
              <button
                key={option.value}
                className={`block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100 ${
                  activeSort === option.value ? 'bg-blue-50 text-blue-700' : ''
                }`}
                onClick={() => handleSortSelect(option.value)}
              >
                {option.label}
                {activeSort === option.value && (
                  <span className="float-right">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>
            ))}
            
            {activeSort && (
              <button
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={handleClearSort}
              >
                Hapus pengurutan
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortButton;
