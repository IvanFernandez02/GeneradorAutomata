import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { parseJFLAP } from '../../utils/exportUtils';

export function JflapModal({ isOpen, onClose, dispatch, history, state }) {
  const [xml, setXml] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
    if (isOpen) {
      setXml('');
      setError('');
    }
  }, [isOpen]);

  const handleParse = () => {
    if (!xml.trim()) {
      setError('Pega el código XML del autómata.');
      return;
    }
    try {
      const newState = parseJFLAP(xml.trim());
      history.pushState(state);
      dispatch({ type: 'LOAD_STATE', payload: newState });
      onClose();
    } catch (err) {
      setError('Error al interpretar el XML: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          width: '600px', maxWidth: '90vw',
          maxHeight: '80vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid var(--grid-line)',
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', color: 'var(--text-color)' }}>
            Importar JFLAP (XML)
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--icon-color)', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--icon-color)' }}>
            Pega el código XML de JFLAP (.jff) para generar el autómata:
          </p>
          <textarea
            ref={textareaRef}
            value={xml}
            onChange={e => { setXml(e.target.value); setError(''); }}
            placeholder={`<?xml version="1.0" encoding="UTF-8"?>\n<structure>\n  <type>fa</type>\n  <automaton>\n    ...`}
            style={{
              width: '100%', minHeight: '300px',
              background: 'var(--surface-color)',
              color: 'var(--text-color)',
              border: `1px solid ${error ? '#ef4444' : 'var(--border-color)'}`,
              borderRadius: '8px',
              padding: '12px',
              fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
              fontSize: '13px',
              resize: 'vertical',
              outline: 'none',
              lineHeight: '1.5',
              tabSize: 2,
            }}
            spellCheck={false}
          />
          {error && (
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#ef4444' }}>
              {error}
            </p>
          )}
        </div>

        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: '8px',
          padding: '12px 20px', borderTop: '1px solid var(--grid-line)',
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid var(--border-color)',
              color: 'var(--text-color)', padding: '8px 16px', borderRadius: '6px',
              cursor: 'pointer', fontSize: '14px',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleParse}
            style={{
              background: 'var(--primary-color)', border: 'none',
              color: 'white', padding: '8px 16px', borderRadius: '6px',
              cursor: 'pointer', fontSize: '14px', fontWeight: 500,
            }}
          >
            Generar Autómata
          </button>
        </div>
      </div>
    </div>
  );
}
