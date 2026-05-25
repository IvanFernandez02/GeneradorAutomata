import React, { useState } from 'react';
import { Play, StepForward, FastForward, Square, CheckCircle2, XCircle, Plus, Trash2, Zap } from 'lucide-react';
import { quickEvaluateString } from '../../utils/simulationEngine';

export function SimulationPanel({ simulation, state }) {
  const [inputs, setInputs] = useState([{ id: Date.now(), value: '', result: null }]);
  const [activeInputId, setActiveInputId] = useState(null);
  
  const iconProps = { size: 16, color: 'var(--text-color)' };

  const handleAddInput = () => {
    setInputs([...inputs, { id: Date.now(), value: '', result: null }]);
  };

  const handleRemoveInput = (id) => {
    if (activeInputId === id) {
      simulation.stopSimulation();
      setActiveInputId(null);
    }
    setInputs(inputs.filter(i => i.id !== id));
  };

  const handleChangeInput = (id, value) => {
    setInputs(inputs.map(i => i.id === id ? { ...i, value, result: null } : i));
  };

  const handleQuickRun = (id, value) => {
    const result = quickEvaluateString(value, state);
    setInputs(inputs.map(i => i.id === id ? { ...i, result } : i));
  };

  const handleRunAll = () => {
    setInputs(inputs.map(i => ({ ...i, result: quickEvaluateString(i.value, state) })));
  };

  const handleStartStepByStep = (id, value) => {
    simulation.startSimulation(value);
    setActiveInputId(id);
  };

  const handleStopSimulation = () => {
    simulation.stopSimulation();
    if (activeInputId) {
      // Guardar el resultado si terminó
      setInputs(inputs.map(i => i.id === activeInputId ? { ...i, result: simulation.result } : i));
    }
    setActiveInputId(null);
  };

  return (
    <div style={{
      position: 'absolute',
      right: '20px',
      top: '20px',
      width: '320px',
      maxHeight: '80vh',
      background: 'var(--surface-color)',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 10,
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '14px', margin: 0, color: 'var(--text-color)' }}>Simulador de Cadenas</h3>
        <button 
          onClick={handleRunAll}
          title="Evaluar todas las cadenas"
          style={{ background: 'var(--border-color)', color: 'var(--text-color)', padding: '4px 8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Zap size={14} /> Todas
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {inputs.map((input) => {
          const isActive = activeInputId === input.id && simulation.active;

          return (
            <div key={input.id} style={{
              background: isActive ? 'var(--border-color, #374151)' : 'transparent',
              border: `1px solid ${isActive ? 'var(--primary-color, var(--primary-color))' : 'var(--border-color, var(--border-color))'}`,
              borderRadius: '6px',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {!isActive ? (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={input.value}
                    onChange={(e) => handleChangeInput(input.id, e.target.value)}
                    placeholder="ε"
                    style={{
                      flex: 1,
                      background: 'var(--bg-color, var(--bg-color))',
                      border: '1px solid var(--border-color, var(--border-color))',
                      borderRadius: '4px',
                      padding: '4px 6px',
                      color: 'var(--text-color, white)',
                      outline: 'none',
                      minWidth: '0'
                    }}
                  />
                  <button onClick={() => handleQuickRun(input.id, input.value)} style={{ padding: '4px', background: 'transparent' }} title="Ejecución Rápida">
                    <Zap size={16} color="#fbbf24" />
                  </button>
                  <button onClick={() => handleStartStepByStep(input.id, input.value)} style={{ padding: '4px', background: 'var(--primary-color, var(--primary-color))' }} title="Paso a paso en Canvas">
                    <Play size={16} color="white" />
                  </button>
                  <button onClick={() => handleRemoveInput(input.id)} style={{ padding: '4px', background: 'transparent' }}>
                    <Trash2 size={16} color="#ef4444" />
                  </button>

                  {/* Icono de resultado */}
                  {input.result === 'accepted' && <CheckCircle2 size={18} color="#34d399" />}
                  {input.result === 'rejected' && <XCircle size={18} color="#f87171" />}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ 
                    fontSize: '16px', 
                    letterSpacing: '2px', 
                    fontFamily: 'monospace',
                    textAlign: 'center',
                    background: 'var(--bg-color, var(--bg-color))',
                    padding: '8px',
                    borderRadius: '4px'
                  }}>
                    {simulation.inputString.split('').map((char, idx) => (
                      <span key={idx} style={{
                        color: idx === simulation.currentIndex ? 'var(--primary-color, var(--primary-color))' : (idx < simulation.currentIndex ? '#9ca3af' : 'var(--text-color, white)'),
                        fontWeight: idx === simulation.currentIndex ? 'bold' : 'normal',
                        textDecoration: idx === simulation.currentIndex ? 'underline' : 'none'
                      }}>
                        {char}
                      </span>
                    ))}
                    {simulation.inputString.length === 0 && <span style={{ color: 'var(--icon-color)' }}>ε</span>}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button
                      onClick={simulation.stepForward}
                      disabled={simulation.result !== null}
                      style={{ padding: '4px 8px', opacity: simulation.result !== null ? 0.5 : 1 }}
                      title="Siguiente Paso"
                    >
                      <StepForward {...iconProps} />
                    </button>
                    <button
                      onClick={simulation.fastForward}
                      disabled={simulation.result !== null}
                      style={{ padding: '4px 8px', opacity: simulation.result !== null ? 0.5 : 1 }}
                      title="Terminar Rápido"
                    >
                      <FastForward {...iconProps} />
                    </button>
                    <button
                      onClick={handleStopSimulation}
                      style={{ padding: '4px 8px' }}
                      title="Detener"
                    >
                      <Square {...iconProps} color="#ef4444" />
                    </button>
                  </div>

                  {simulation.result && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '4px',
                      borderRadius: '4px',
                      background: simulation.result === 'accepted' ? '#064e3b' : '#7f1d1d',
                      color: simulation.result === 'accepted' ? '#34d399' : '#f87171',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {simulation.result === 'accepted' ? 'ACEPTADA' : 'RECHAZADA'}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button 
        onClick={handleAddInput}
        style={{ background: 'transparent', border: '1px dashed var(--border-color)', color: 'var(--icon-color)', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}
      >
        <Plus size={16} /> Añadir cadena
      </button>

    </div>
  );
}
