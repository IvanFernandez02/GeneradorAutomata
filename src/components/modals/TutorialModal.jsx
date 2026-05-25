import React, { useState, useMemo } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import { getEpsilonClosure, getNextStates } from '../../utils/simulationEngine';
import { convertToDFA } from '../../utils/automataOps';

export function TutorialModal({ isOpen, onClose, state, alphabet, dispatch, history }) {
  const [currentStep, setCurrentStep] = useState(0);

  // Generamos todos los pasos por adelantado
  const steps = useMemo(() => {
    if (!state || state.states.length === 0) return [];

    const { states, transitions } = state;
    const initialStates = states.filter(s => s.isInitial).map(s => s.id);
    if (initialStates.length === 0) return [];

    const startClosure = getEpsilonClosure(initialStates, transitions).sort();
    
    const calculatedSteps = [];
    
    // Paso inicial
    calculatedSteps.push({
      description: `1. Calculamos el Cierre-Épsilon del estado inicial {${initialStates.join(',')}}: {${startClosure.join(',')}}`,
      row: { from: '∅', symbol: 'ε', to: `{${startClosure.join(',')}}`, isNew: true }
    });

    const stateQueue = [startClosure];
    const processedSets = new Set();
    const stateMap = new Map();
    let stateCounter = 0;

    const getSetName = (arr) => `{${arr.join(',')}}`;

    while (stateQueue.length > 0) {
      const currentSet = stateQueue.shift();
      const setKey = JSON.stringify(currentSet);
      
      if (processedSets.has(setKey)) continue;
      processedSets.add(setKey);
      
      const newStateId = `q${stateCounter++}`;
      stateMap.set(setKey, newStateId);

      for (const symbol of alphabet) {
        if (symbol === 'ε') continue;
        
        // 1. Get direct transitions
        const directNext = new Set();
        currentSet.forEach(s => {
          transitions.forEach(t => {
            if (t.from === s && t.label.split(',').map(l=>l.trim()).includes(symbol)) {
              directNext.add(t.to);
            }
          });
        });
        const directArr = Array.from(directNext).sort();
        
        // 2. Get epsilon closure of those
        const nextSet = getEpsilonClosure(directArr, transitions).sort();
        
        if (nextSet.length > 0) {
          const isNew = !processedSets.has(JSON.stringify(nextSet)) && !stateQueue.some(q => JSON.stringify(q) === JSON.stringify(nextSet));
          
          if (isNew) {
            stateQueue.push(nextSet);
          }

          calculatedSteps.push({
            description: `Evaluamos transición con '${symbol}' desde ${getSetName(currentSet)}. Destinos directos: ${getSetName(directArr)}. Cierre-ε: ${getSetName(nextSet)}.`,
            row: { from: getSetName(currentSet), symbol, to: getSetName(nextSet), isNew }
          });
        }
      }
    }

    calculatedSteps.push({
      description: `¡Conversión terminada! Se han generado ${processedSets.size} estados nuevos en el AFD.`,
      isFinal: true
    });

    return calculatedSteps;
  }, [state, alphabet]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleApply = () => {
    const dfaState = convertToDFA(state, alphabet);
    if (dfaState) {
      dispatch({ type: 'LOAD_STATE', payload: dfaState });
      setTimeout(() => history.pushState(dfaState), 50);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        background: 'var(--surface-color)',
        borderRadius: '8px',
        width: '600px',
        maxWidth: '90%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--grid-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-color)' }}>
            Conversión Paso a Paso: AFND → AFD
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--icon-color)' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
          <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-color)', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
            <strong>Paso {currentStep + 1} de {steps.length}:</strong><br/>
            {steps[currentStep]?.description}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: 'var(--text-color)' }}>
            <thead>
              <tr style={{ background: 'var(--bg-color)' }}>
                <th style={{ padding: '8px', borderBottom: '2px solid var(--grid-line)', textAlign: 'left' }}>Estado de Origen</th>
                <th style={{ padding: '8px', borderBottom: '2px solid var(--grid-line)', textAlign: 'center' }}>Símbolo</th>
                <th style={{ padding: '8px', borderBottom: '2px solid var(--grid-line)', textAlign: 'left' }}>Estado Destino (Cierre-ε)</th>
                <th style={{ padding: '8px', borderBottom: '2px solid var(--grid-line)', textAlign: 'center' }}>¿Es Nuevo?</th>
              </tr>
            </thead>
            <tbody>
              {steps.slice(0, currentStep + 1).filter(s => s.row).map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--grid-line)', background: i === currentStep ? 'rgba(37, 99, 235, 0.1)' : 'transparent' }}>
                  <td style={{ padding: '8px' }}>{s.row.from}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{s.row.symbol}</td>
                  <td style={{ padding: '8px' }}>{s.row.to}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    {s.row.isNew ? <span style={{ color: '#10b981' }}>Sí</span> : <span style={{ color: 'var(--icon-color)' }}>No</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--grid-line)', display: 'flex', justifyContent: 'space-between' }}>
          <button 
            onClick={handleApply}
            style={{ padding: '8px 16px', background: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}
          >
            Saltar y Aplicar
          </button>
          
          <button 
            onClick={handleNext}
            disabled={currentStep >= steps.length - 1}
            style={{ 
              padding: '8px 16px', 
              background: currentStep >= steps.length - 1 ? 'var(--border-color)' : 'var(--primary-color)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: currentStep >= steps.length - 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {currentStep >= steps.length - 1 ? (
              <><Check size={16}/> Terminado</>
            ) : (
              <>Siguiente Paso <ArrowRight size={16}/></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
