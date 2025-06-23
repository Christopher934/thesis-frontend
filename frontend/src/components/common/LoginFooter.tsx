'use client';

import React from 'react';
import { motion } from 'framer-motion';

const LoginFooter: React.FC = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="mt-8 text-center text-sm text-gray-500"
    >
      <div className="mb-3">
        <p className="font-medium">RSUD Anugerah © {new Date().getFullYear()}</p>
        <p className="text-gray-400">Jalan Kesehatan No. 123, Kota Sehat</p>
      </div>
      <div className="mt-4 text-xs text-gray-400">
        <p>Diakses pada {new Date().toLocaleDateString('id-ID', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>
    </motion.footer>
  );
};

export default LoginFooter;
