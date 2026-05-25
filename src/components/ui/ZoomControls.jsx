import React from 'react';

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onReset, onFit }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '38px',
      right: '56px',
      display: 'flex',
      gap: '4px',
      background: 'var(--surface-color)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      zIndex: 20,
      opacity: 0.75,
      transition: 'opacity 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
      onMouseLeave={e => e.currentTarget.style.opacity = '0.75'}
    >
      <button
        onClick={onZoomOut}
        title="Alejar"
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--text-color)', fontSize: '16px', fontWeight: 700,
          width: '28px', height: '28px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', borderRadius: '4px',
        }}
      >−</button>
      <span style={{
        display: 'flex', alignItems: 'center', fontSize: '11px',
        color: 'var(--icon-color)', minWidth: '36px', textAlign: 'center',
        justifyContent: 'center', fontVariantNumeric: 'tabular-nums',
      }}>{Math.round(zoom * 100)}%</span>
      <button
        onClick={onZoomIn}
        title="Acercar"
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--text-color)', fontSize: '16px', fontWeight: 700,
          width: '28px', height: '28px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', borderRadius: '4px',
        }}
      >+</button>
      <div style={{ width: '1px', background: 'var(--border-color)', margin: '2px 2px' }} />
      <button
        onClick={onReset}
        title="Restablecer zoom"
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--text-color)', fontSize: '12px',
          width: '28px', height: '28px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', borderRadius: '4px',
        }}
      >⟲</button>
      <button
        onClick={onFit}
        title="Ajustar contenido"
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--text-color)', fontSize: '14px',
          width: '28px', height: '28px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', borderRadius: '4px',
        }}
      >⛶</button>
    </div>
  );
}
