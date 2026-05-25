import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAutomata } from './hooks/useAutomata';
import { useHistory } from './hooks/useHistory';
import { useCanvasInteractions } from './hooks/useCanvasInteractions';
import { useSimulation } from './hooks/useSimulation';
import { useViewport } from './hooks/useViewport';
import { AutomataCanvas } from './components/canvas/AutomataCanvas';
import { LabelModal } from './components/modals/LabelModal';
import { JflapModal } from './components/modals/JflapModal';
import { Toolbar } from './components/panels/Toolbar';
import { SimulationPanel } from './components/panels/SimulationPanel';
import { Sidebar } from './components/ui/Sidebar';
import { TipsMenu } from './components/ui/TipsMenu';
import { ZoomControls } from './components/ui/ZoomControls';
import { StatusBar } from './components/ui/StatusBar';
import './App.css';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('automata_theme') || 'dark');
  const [snapToGrid, setSnapToGrid] = useState(localStorage.getItem('automata_snap') !== 'false');
  const [jflapModalOpen, setJflapModalOpen] = useState(false);

  const { state, dispatch, alphabet } = useAutomata();
  const history = useHistory(state);
  const viewport = useViewport();
  const interactions = useCanvasInteractions(state, dispatch, history, snapToGrid, viewport);
  const simulation = useSimulation(state);
  const containerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('automata_save', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('automata_theme', theme);
    document.body.className = theme === 'light' ? 'light-theme' : '';
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('automata_snap', snapToGrid);
  }, [snapToGrid]);

  const centerView = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    viewport.resetView(state.states, state.notes, container.clientWidth, container.clientHeight - 30);
  }, [state.states, state.notes, viewport]);

  useEffect(() => {
    if (state.states.length > 0) {
      const timer = setTimeout(centerView, 100);
      return () => clearTimeout(timer);
    }
  }, [state.states.length]);

  useEffect(() => {
    if (state.states.length === 0) {
      viewport.resetView();
    }
  }, [state.states.length, viewport]);

  const handleLabelSubmitWrapper = (val) => {
    interactions.handleLabelSubmit(val);
    setTimeout(() => history.pushState(state), 50);
  };

  return (
    <div ref={containerRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <Sidebar state={state} alphabet={alphabet} dispatch={dispatch} history={history} />
      <Toolbar 
        history={history} 
        state={state} 
        dispatch={dispatch} 
        theme={theme}
        setTheme={setTheme}
        snapToGrid={snapToGrid}
        setSnapToGrid={setSnapToGrid}
        onOpenJflapImport={() => setJflapModalOpen(true)}
      />
      <SimulationPanel simulation={simulation} state={state} />
      
      <AutomataCanvas 
        state={state} 
        interactions={interactions}
        simulation={simulation}
        viewport={viewport}
      />
      
      <LabelModal 
        editingLabel={interactions.editingLabel} 
        onSubmit={handleLabelSubmitWrapper} 
      />
      
      <JflapModal
        isOpen={jflapModalOpen}
        onClose={() => setJflapModalOpen(false)}
        dispatch={dispatch}
        history={history}
        state={state}
      />
      
      <StatusBar state={state} alphabet={alphabet} />
      <ZoomControls
        zoom={viewport.zoom}
        onZoomIn={() => viewport.zoomAtPoint(0.15, window.innerWidth / 2, window.innerHeight / 2, true)}
        onZoomOut={() => viewport.zoomAtPoint(-0.15, window.innerWidth / 2, window.innerHeight / 2, true)}
        onReset={() => {
          const container = containerRef.current;
          if (container) {
            viewport.resetView(state.states, state.notes, container.clientWidth, container.clientHeight - 30);
          }
        }}
        onFit={() => {
          const container = containerRef.current;
          if (container) {
            viewport.fitToContent(state.states, state.notes, container.clientWidth, container.clientHeight - 30);
          }
        }}
      />
      <TipsMenu />
    </div>
  );
}

export default App;
