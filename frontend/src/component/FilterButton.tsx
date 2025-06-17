'use client';

import { useState } from 'react';
import Image from 'next/image';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterButtonProps {
  options: FilterOption[];
  onFilter: (value: string) => void;
}

const FilterButton = ({ options, onFilter }: FilterButtonProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleFilterSelect = (value: string) => {
    setActiveFilter(value);
    onFilter(value);
    setShowDropdown(false);
  };

  const handleClearFilter = () => {
    setActiveFilter(null);
    onFilter('');
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button 
        className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all ${activeFilter ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
        onClick={handleToggleDropdown}
        aria-label="Filter"
        title={activeFilter ? `Filter aktif: ${activeFilter}` : "Filter"}
      >
        <Image src="/filter.png" alt="Filter" width={14} height={14} />
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            <div className="px-4 py-2 text-xs font-medium text-gray-700 border-b">
              Filter Data
            </div>
            
            {options.map((option) => (
              <button
                key={option.value}
                className={`block px-4 py-2 text-sm text-gray-700 w-full text-left hover:bg-gray-100 ${
                  activeFilter === option.value ? 'bg-blue-50 text-blue-700' : ''
                }`}
                onClick={() => handleFilterSelect(option.value)}
              >
                {option.label}
              </button>
            ))}
            
            {activeFilter && (
              <button
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={handleClearFilter}
              >
                Hapus filter
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterButton;
