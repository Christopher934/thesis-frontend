// Test import file to debug TukarShiftForm import issue
'use client';

import React from 'react';

// Test if TukarShiftForm can be imported correctly
try {
  const TukarShiftForm = require('@/component/forms/TukarShiftForm');
  console.log('TukarShiftForm import test:', TukarShiftForm);
  console.log('TukarShiftForm.default:', TukarShiftForm.default);
  console.log('typeof TukarShiftForm:', typeof TukarShiftForm);
  console.log('typeof TukarShiftForm.default:', typeof TukarShiftForm.default);
} catch (error) {
  console.error('Error importing TukarShiftForm:', error);
}

export default function TestImport() {
  return <div>Test Import Component</div>;
}
