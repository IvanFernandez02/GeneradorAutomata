import React, { useState, useEffect, useRef } from 'react';
import { COLORS } from '../../constants/automata';

export function LabelModal({ editingLabel, onSubmit }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingLabel) {
      setValue(editingLabel.initialValue || '');
    }
  }, [editingLabel]);

  useEffect(() => {
    if (editingLabel && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingLabel]);

  if (!editingLabel) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSubmit(value);
    } else if (e.key === 'Escape') {
      onSubmit(editingLabel.initialValue); // Cancel
    }
  };

  const isState = editingLabel.type === 'state';

  return (
    <div
      style={{
        position: 'absolute',
        left: editingLabel.x,
        top: editingLabel.y,
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
        background: COLORS.STATE_FILL,
        padding: '4px',
        borderRadius: '4px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        border: `1px solid ${COLORS.STATE_SELECTED}`
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onSubmit(value)} // Submit on click outside
        style={{
          width: isState ? '60px' : '80px',
          background: 'transparent',
          border: 'none',
          color: 'white',
          textAlign: 'center',
          outline: 'none',
          fontSize: '14px'
        }}
        placeholder={isState ? 'Nombre' : 'a,b (vacío = ε)'}
      />
    </div>
  );
}
