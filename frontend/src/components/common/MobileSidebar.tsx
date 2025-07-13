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
      {/* Backdrop Overlay */}
      {isOpen && (
        <div 
          className="block lg:hidden fixed inset-0 bg-black bg-opacity-50 z-[8000] transition-opacity duration-300"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 8000
          }}
        />
      )}

      {/* Mobile Sidebar */}
      <div 
        className={`mobile-sidebar block lg:hidden fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-[8500] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '320px',
          backgroundColor: 'white',
          zIndex: 8500,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          boxShadow: '4px 0 16px rgba(0, 0, 0, 0.1)'
        }}
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
        /* Force show all text labels in mobile sidebar */
        .mobile-menu-wrapper .hidden.lg\\:block {
          display: block !important;
        }
        
        /* Force show menu section titles */
        .mobile-menu-wrapper .hidden {
          display: block !important;
        }
        
        /* Ensure proper left alignment for all menu items */
        .mobile-menu-wrapper .flex.items-center.justify-center.lg\\:justify-start {
          justify-content: flex-start !important;
        }
        
        /* Force left alignment for all flex items */
        .mobile-menu-wrapper .flex.items-center {
          justify-content: flex-start !important;
          text-align: left !important;
        }
        
        /* Left align button content */
        .mobile-menu-wrapper button {
          text-align: left !important;
          justify-content: flex-start !important;
        }
        
        /* Left align dropdown items */
        .mobile-menu-wrapper .dropdown-container button {
          text-align: left !important;
          justify-content: flex-start !important;
        }
        
        /* Fix dropdown positioning in mobile */
        .mobile-menu-wrapper .dropdown-container .absolute {
          position: static !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
          margin-left: 1rem !important;
          margin-top: 0.5rem !important;
          background: transparent !important;
        }
        
        /* Remove mobile-specific dropdown styling */
        .mobile-menu-wrapper .mobile-dropdown {
          position: static !important;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
          background-color: transparent !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        /* Force show dropdown item labels in mobile */
        .mobile-menu-wrapper .mobile-dropdown .hidden.lg\\:block {
          display: block !important;
        }
        
        /* Hide mobile-only dropdown icons */
        .mobile-menu-wrapper .mobile-dropdown .lg\\:hidden {
          display: none !important;
        }
        
        /* Dropdown items alignment */
        .mobile-menu-wrapper .mobile-dropdown button {
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
          text-align: left !important;
          width: 100% !important;
        }
        
        /* Ensure proper indentation for dropdown items */
        .mobile-menu-wrapper .dropdown-container .space-y-1 {
          margin-left: 1rem !important;
          margin-top: 0.5rem !important;
        }
        
        /* Fix dropdown text visibility */
        .mobile-menu-wrapper .dropdown-container .space-y-1 span {
          display: block !important;
          text-align: left !important;
        }

        /* Ensure menu items show full content */
        .mobile-menu-wrapper .lg\\:hidden {
          display: none !important;
        }
        
        /* Fix text visibility and alignment */
        .mobile-menu-wrapper span {
          display: block !important;
          text-align: left !important;
        }
        
        /* Left align section titles */
        .mobile-menu-wrapper .text-grey-400 {
          text-align: left !important;
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
