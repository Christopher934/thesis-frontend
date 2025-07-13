'use client';

import { useState, useEffect } from 'react';
import { Menu as MenuIcon, X } from 'lucide-react';
import Menu from './Menu';
import Image from 'next/image';
import Link from 'next/link';

interface MobileSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const MobileSidebar = ({ isOpen, onToggle, onClose }: MobileSidebarProps) => {
  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.mobile-sidebar') && !target.closest('.mobile-menu-trigger')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close sidebar on route change
  useEffect(() => {
    const handleRouteChange = () => {
      onClose();
    };

    // Listen for navigation events
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [onClose]);

  return (
    <>
      {/* Mobile Menu Trigger Button */}
      <button
        onClick={onToggle}
        className="mobile-menu-trigger lg:hidden fixed top-6 left-6 z-[60] p-3 bg-blue-600 rounded-xl shadow-xl border-2 border-blue-700 hover:bg-blue-700 transition-all duration-200 active:scale-95"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MenuIcon className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[40] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <div 
        className={`mobile-sidebar lg:hidden fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-[50] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <Link 
                href="/" 
                className="flex items-center gap-2"
                onClick={onClose}
              >
                <Image src="/logo.png" alt="logo" width={32} height={32} />
                <span className="font-bold text-gray-800">RSUD Anugerah</span>
              </Link>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mobile-menu-wrapper">
              <Menu />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              © 2025 RSUD Anugerah
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles for Mobile Menu */}
      <style jsx global>{`
        .mobile-menu-wrapper .lg\\:justify-start {
          justify-content: flex-start !important;
        }
        
        .mobile-menu-wrapper .hidden.lg\\:block {
          display: block !important;
        }
        
        .mobile-menu-wrapper .lg\\:hidden {
          display: none !important;
        }
        
        .mobile-menu-wrapper .dropdown-container .absolute {
          position: static !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
          margin-left: 1rem !important;
          margin-top: 0.5rem !important;
        }
        
        .mobile-menu-wrapper .mobile-dropdown {
          position: static !important;
          box-shadow: none !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 0.5rem !important;
          background-color: #f9fafb !important;
          padding: 0.5rem !important;
        }

        /* Smooth transitions */
        .mobile-sidebar {
          backdrop-filter: blur(8px);
        }
        
        /* Prevent scroll bounce on iOS */
        .mobile-sidebar {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
      `}</style>
    </>
  );
};

export default MobileSidebar;
