'use client';

// Test individual imports to identify the problematic one
import React from 'react';

// Test basic React hooks
try {
  console.log('React hooks test:', React.useState, React.useEffect);
} catch (error) {
  console.error('React hooks error:', error);
}

// Test form libraries
try {
  const { z } = require('zod');
  console.log('Zod test:', z);
} catch (error) {
  console.error('Zod error:', error);
}

try {
  const { useForm } = require('react-hook-form');
  console.log('React Hook Form test:', useForm);
} catch (error) {
  console.error('React Hook Form error:', error);
}

try {
  const { zodResolver } = require('@hookform/resolvers/zod');
  console.log('Zod Resolver test:', zodResolver);
} catch (error) {
  console.error('Zod Resolver error:', error);
}

// Test our component directly
try {
  console.log('About to import TukarShiftForm...');
  const TukarShiftForm = require('@/components/forms/TukarShiftForm');
  console.log('TukarShiftForm import successful:', TukarShiftForm);
  console.log('TukarShiftForm default:', TukarShiftForm.default);
  console.log('TukarShiftForm type:', typeof TukarShiftForm.default);
} catch (error) {
  console.error('TukarShiftForm import error:', error);
}

export default function TestComponent() {
  return (
    <div>
      <h1>Test Component</h1>
      <p>Check console for import test results</p>
    </div>
  );
}
