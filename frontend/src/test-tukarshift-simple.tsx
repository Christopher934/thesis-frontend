'use client';

import React from 'react';

type CommonFormProps = {
  type: 'create' | 'update';
  data?: any;
  onClose: () => void;
  onCreate: (newData: any) => void;
  onUpdate?: (updatedData: any) => void;
};

const TukarShiftFormSimple: React.FC<CommonFormProps> = ({
  type,
  data,
  onClose,
  onCreate,
  onUpdate,
}) => {
  return (
    <div>
      <h3>Simple TukarShift Form</h3>
      <p>Type: {type}</p>
    </div>
  );
};

export default TukarShiftFormSimple;
