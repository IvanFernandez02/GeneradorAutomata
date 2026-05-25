import React from 'react';
import { COLORS } from '../../constants/automata';

export function StatusBar({ state, alphabet }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '30px',
      background: '#1a1a20',
      borderTop: '1px solid var(--grid-line)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      color: 'var(--icon-color)',
      fontSize: '12px',
      gap: '24px'
    }}>
      <div>
        <strong>Estados:</strong> {state.states.length}
      </div>
      <div>
        <strong>Transiciones:</strong> {state.transitions.length}
      </div>
      <div>
        <strong>Alfabeto (Σ):</strong> {alphabet.length > 0 ? `{ ${alphabet.join(', ')} }` : '∅'}
      </div>
      <div style={{ flex: 1 }} />
    </div>
  );
}
