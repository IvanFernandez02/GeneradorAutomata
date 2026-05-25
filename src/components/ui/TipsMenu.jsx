import React, { useState } from 'react';

const shortcuts = [
  { keys: 'Doble clic', desc: 'Agregar estado' },
  { keys: 'Doble clic en estado', desc: 'Alternar aceptación' },
  { keys: 'Mayús + clic en estado', desc: 'Iniciar transición' },
  { keys: 'Clic en otro estado', desc: 'Completar transición' },
  { keys: 'Clic derecho en estado', desc: 'Renombrar' },
  { keys: 'Arrastrar estado', desc: 'Mover' },
  { keys: 'Mayús + arrastrar', desc: 'Seleccionar múltiples' },
  { keys: 'Supr / Backspace', desc: 'Eliminar selección' },
  { keys: 'Ctrl+Z', desc: 'Deshacer' },
  { keys: 'Ctrl+Y / Ctrl+Mayús+Z', desc: 'Rehacer' },
  { keys: 'Arrastrar handle de curva', desc: 'Curvar transición' },
];

export function TipsMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'absolute',
          bottom: '38px',
          right: '12px',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-color)',
          cursor: 'pointer',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          opacity: 0.75,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0.75'}
        title="Atajos e instrucciones"
      >
        ?
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '12px',
            width: '320px',
            maxHeight: '420px',
            background: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            zIndex: 20,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{
            padding: '12px 14px 8px 14px',
            borderBottom: '1px solid var(--grid-line)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            Atajos e Instrucciones
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--icon-color)',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0 2px',
              }}
            >
              ×
            </button>
          </div>

          <div style={{ padding: '8px 14px 12px 14px', overflowY: 'auto' }}>
            <div style={{ fontSize: '11px', color: 'var(--icon-color)', marginBottom: '8px', lineHeight: 1.5 }}>
              Arrastra desde el <strong>Panel izquierdo (☰)</strong> para convertir, minimizar o ver la tabla de transiciones.
              Usa el <strong>Panel derecho</strong> para simular cadenas.
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '3px 6px', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--grid-line)' }}>Acción</th>
                  <th style={{ textAlign: 'left', padding: '3px 6px', color: 'var(--primary-color)', fontWeight: 600, borderBottom: '1px solid var(--grid-line)' }}>Teclado / Ratón</th>
                </tr>
              </thead>
              <tbody>
                {shortcuts.map((s, i) => (
                  <tr key={i}>
                    <td style={{ padding: '4px 6px', color: 'var(--icon-color)', borderBottom: '1px solid var(--grid-line)', width: '50%' }}>{s.desc}</td>
                    <td style={{ padding: '4px 6px', color: 'var(--text-color)', borderBottom: '1px solid var(--grid-line)', fontFamily: '"Fira Code", monospace', fontWeight: 500 }}>
                      {s.keys}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
