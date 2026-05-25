import React from 'react';
import { COLORS } from '../../constants/automata';
import { labelMatchesSymbol } from '../../utils/labelUtils';

export function TransitionTable({ state, alphabet }) {
  const { states, transitions } = state;
  
  const hasEpsilon = transitions.some(t => t.label.split(',').map(s=>s.trim()).includes('ε'));
  const cols = [...alphabet];
  if (hasEpsilon && !cols.includes('ε')) cols.push('ε');

  const getTransitions = (fromId, symbol) => {
    const nextStates = new Set();
    transitions.forEach(t => {
      if (t.from === fromId && labelMatchesSymbol(t.label, symbol)) {
        const toState = states.find(s => s.id === t.to);
        if (toState) nextStates.add(toState.name);
      }
    });
    const arr = Array.from(nextStates);
    return arr.length > 0 ? arr.join(', ') : '∅';
  };

  if (states.length === 0) {
    return <div style={{ color: 'var(--icon-color)', padding: '16px' }}>No hay estados definidos.</div>;
  }

  return (
    <div style={{ overflowX: 'auto', padding: '16px' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        color: 'var(--text-color)',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        <thead>
          <tr>
            <th style={{ padding: '8px', borderBottom: `1px solid ${COLORS.STATE_STROKE}` }}>Estado</th>
            {cols.map(symbol => (
              <th key={symbol} style={{ padding: '8px', borderBottom: `1px solid ${COLORS.STATE_STROKE}` }}>
                {symbol}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {states.map(s => {
            let prefix = '';
            if (s.isInitial) prefix += '→ ';
            if (s.isAccepting) prefix += '* ';

            return (
              <tr key={s.id} style={{ borderBottom: `1px solid var(--grid-line)` }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>
                  {prefix}{s.name}
                </td>
                {cols.map(symbol => (
                  <td key={symbol} style={{ padding: '8px', color: getTransitions(s.id, symbol) === '∅' ? 'var(--state-stroke)' : 'var(--text-color)' }}>
                    {getTransitions(s.id, symbol)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--icon-color)' }}>
        <p>→ Estado Inicial</p>
        <p>* Estado de Aceptación</p>
      </div>
    </div>
  );
}
