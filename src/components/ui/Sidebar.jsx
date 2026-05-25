import React, { useState } from 'react';
import { Menu, X, Table, Cpu } from 'lucide-react';
import { TransitionTable } from '../panels/TransitionTable';
import { isDeterministic, convertToDFA, minimizeDFA } from '../../utils/automataOps';
import { TutorialModal } from '../modals/TutorialModal';

export function Sidebar({ state, alphabet, dispatch, history }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const handleConvertToDFA = () => {
    if (isDeterministic(state, alphabet)) {
      alert("El autómata ya es determinista (AFD).");
      return;
    }
    const dfaState = convertToDFA(state, alphabet);
    if (dfaState) {
      history.pushState(state); // Save current state
      dispatch({ type: 'LOAD_STATE', payload: dfaState });
      alert("Conversión completada. Los estados fueron reposicionados automáticamente.");
    } else {
      alert("No se pudo convertir. Asegúrate de tener al menos un estado inicial.");
    }
  };

  const handleMinimizeDFA = () => {
    if (!isDeterministic(state, alphabet)) {
      alert("El autómata debe ser Determinista (AFD) para poder minimizarlo.");
      return;
    }
    const minimized = minimizeDFA(state, alphabet);
    if (minimized) {
      history.pushState(state); // Save current state
      dispatch({ type: 'LOAD_STATE', payload: minimized });
      alert("Minimización completada.");
    }
  };

  return (
    <>
      {/* Botón para abrir */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'var(--surface-color)',
          border: 'none',
          padding: '8px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          cursor: 'pointer',
          zIndex: 10,
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-color)'
        }}
        title="Abrir menú"
      >
        <Menu size={20} />
      </button>

      {/* Overlay transparente para cerrar al hacer click fuera */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 15,
            background: 'rgba(0,0,0,0.2)' // Ligero oscurecimiento
          }}
        />
      )}

      {/* Panel lateral */}
      <div 
        style={{
          width: '300px',
          height: '100%',
          background: 'var(--bg-color)',
          borderRight: '1px solid var(--border-color)',
          position: 'absolute',
          left: isOpen ? 0 : '-300px',
          top: 0,
          transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isOpen ? '4px 0 16px rgba(0,0,0,0.1)' : 'none'
        }}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid var(--grid-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-color)' }}>
            <Table size={20} />
            Datos y Operaciones
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--icon-color)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--grid-line)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--icon-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={16} />
              Operaciones
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
              <button 
                onClick={handleConvertToDFA}
                style={{ background: 'var(--primary-color)', color: 'white', padding: '8px', fontSize: '14px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
              >
                Convertir AFND a AFD (Rápido)
              </button>
              <button 
                onClick={() => setIsTutorialOpen(true)}
                style={{ background: '#8b5cf6', color: 'white', padding: '8px', fontSize: '14px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
              >
                Conversión AFND a AFD (Paso a Paso)
              </button>
              <button 
                onClick={handleMinimizeDFA}
                style={{ background: '#10b981', color: 'white', padding: '8px', fontSize: '14px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
              >
                Minimizar AFD (Hopcroft)
              </button>
            </div>
          </div>

          <h3 style={{ margin: '16px 16px 0 16px', fontSize: '14px', color: 'var(--icon-color)' }}>Tabla de Transiciones (δ)</h3>
          <TransitionTable state={state} alphabet={alphabet} />
        </div>
      </div>

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        state={state}
        alphabet={alphabet}
        dispatch={dispatch}
        history={history}
      />
    </>
  );
}
