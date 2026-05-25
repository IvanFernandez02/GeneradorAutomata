import React, { useRef } from 'react';
import { Trash2, Undo2, Redo2, Image, FileJson, FileCode2, Upload, Magnet, Sun, Moon, StickyNote, Code2 } from 'lucide-react';
import { exportJSON, exportJFLAP, exportImage, parseJFLAP } from '../../utils/exportUtils';

export function Toolbar({ history, state, dispatch, theme, setTheme, snapToGrid, setSnapToGrid, onOpenJflapImport }) {
  const iconProps = { size: 20, color: 'var(--icon-color, #e5e7eb)' };
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        if (file.name.endsWith('.jff')) {
          const newState = parseJFLAP(content);
          history.pushState(state);
          dispatch({ type: 'LOAD_STATE', payload: newState });
        } else if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          // basic validation
          if (parsed.states && parsed.transitions) {
            history.pushState(state);
            dispatch({ type: 'LOAD_STATE', payload: { ...state, ...parsed, mode: 'select', selectedIds: [], pendingTransition: null } });
          } else {
            alert("El archivo JSON no tiene el formato correcto.");
          }
        } else {
          alert("Formato no soportado. Sube un archivo .jff o .json");
        }
      } catch (err) {
        alert("Error al cargar el archivo: " + err.message);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = null;
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '8px',
      background: 'var(--surface-color, var(--surface-color))',
      padding: '8px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      zIndex: 10
    }}>
      <button 
        title={theme === 'dark' ? "Cambiar a Tema Claro" : "Cambiar a Tema Oscuro"}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        {theme === 'dark' ? <Sun {...iconProps} /> : <Moon {...iconProps} />}
      </button>

      <button 
        title={snapToGrid ? "Desactivar Ajuste a Cuadrícula" : "Activar Ajuste a Cuadrícula"}
        onClick={() => setSnapToGrid(!snapToGrid)}
        style={{ 
          background: snapToGrid ? 'var(--primary-color, var(--primary-color))' : 'transparent', 
          border: 'none', 
          cursor: 'pointer',
          borderRadius: '4px',
          padding: '4px'
        }}
      >
        <Magnet {...iconProps} color={snapToGrid ? 'white' : iconProps.color} />
      </button>

      <div style={{ width: '1px', background: 'var(--border-color, var(--border-color))', margin: '0 4px' }} />

      <button 
        title="Deshacer (Ctrl+Z)"
        onClick={() => {
          if (history.canUndo) {
            history.undo();
            dispatch({ type: 'LOAD_STATE', payload: history.state });
          }
        }}
        disabled={!history.canUndo}
        style={{ background: 'transparent', border: 'none', cursor: history.canUndo ? 'pointer' : 'not-allowed', opacity: history.canUndo ? 1 : 0.5 }}
      >
        <Undo2 {...iconProps} />
      </button>

      <button 
        title="Rehacer (Ctrl+Y)"
        onClick={() => {
          if (history.canRedo) {
            history.redo();
            dispatch({ type: 'LOAD_STATE', payload: history.state });
          }
        }}
        disabled={!history.canRedo}
        style={{ background: 'transparent', border: 'none', cursor: history.canRedo ? 'pointer' : 'not-allowed', opacity: history.canRedo ? 1 : 0.5 }}
      >
        <Redo2 {...iconProps} />
      </button>

      <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />

      <button 
        title="Eliminar Seleccionado (Delete)"
        onClick={() => {
          dispatch({ type: 'DELETE_SELECTED' });
          setTimeout(() => history.pushState(state), 50);
        }}
        disabled={state.selectedIds.length === 0}
        style={{ background: 'transparent', border: 'none', cursor: state.selectedIds.length > 0 ? 'pointer' : 'not-allowed', opacity: state.selectedIds.length > 0 ? 1 : 0.5 }}
      >
        <Trash2 {...iconProps} color={state.selectedIds.length > 0 ? '#ef4444' : 'var(--icon-color)'} />
      </button>
      
      <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />

      <button 
        title="Añadir Nota Flotante"
        onClick={() => {
          dispatch({ type: 'ADD_NOTE', payload: { x: 100, y: 100 } });
          setTimeout(() => history.pushState(state), 50);
        }}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <StickyNote {...iconProps} />
      </button>
      
      <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />

      <button 
        title="Cargar archivo (.jff, .json)"
        onClick={() => fileInputRef.current?.click()}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <Upload {...iconProps} />
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".jff,.json" 
        onChange={handleFileUpload}
      />

      <button 
        title="Importar código JFLAP (XML)"
        onClick={onOpenJflapImport}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <Code2 {...iconProps} />
      </button>

      <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }} />

      <button 
        title="Exportar como Imagen (PNG)"
        onClick={() => exportImage(document.getElementById('automata-canvas'), true)}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <Image {...iconProps} />
      </button>

      <button 
        title="Exportar formato JFLAP (.jff)"
        onClick={() => exportJFLAP(state)}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <FileCode2 {...iconProps} />
      </button>

      <button 
        title="Exportar datos (.json)"
        onClick={() => exportJSON(state)}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <FileJson {...iconProps} />
      </button>
    </div>
  );
}
