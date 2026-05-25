import { useState, useCallback, useEffect } from 'react';

export function useCanvasInteractions(state, dispatch, history, snapToGrid = false, viewport = { zoom: 1, panX: 0, panY: 0 }) {
  const [draggedState, setDraggedState] = useState(null); // String ID
  const [lastMousePos, setLastMousePos] = useState(null); // For delta tracking
  const [selectionBox, setSelectionBox] = useState(null); // { startX, startY, currentX, currentY }
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // For transition drawing
  const [isShiftDown, setIsShiftDown] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null); 

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'Shift') setIsShiftDown(true);
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (history.canRedo) {
            history.redo();
            dispatch({ type: 'LOAD_STATE', payload: history.state });
          }
        } else {
          if (history.canUndo) {
            history.undo();
            dispatch({ type: 'LOAD_STATE', payload: history.state });
          }
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        if (history.canRedo) {
          history.redo();
          dispatch({ type: 'LOAD_STATE', payload: history.state });
        }
      }
      
      if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedIds.length > 0 && !editingLabel) {
        dispatch({ 
          type: 'DELETE_SELECTED', 
          payload: { excludeNotes: e.key === 'Backspace' } 
        });
        setTimeout(() => history.pushState(state), 50);
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') setIsShiftDown(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state.selectedIds, editingLabel, history, dispatch, state]);

  const handleCanvasDoubleClick = (e) => {
    if (editingLabel) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewport.panX) / viewport.zoom;
    const y = (e.clientY - rect.top - viewport.panY) / viewport.zoom;
    
    if (e.target.tagName.toLowerCase() === 'svg' || e.target.id === 'bg-grid') {
      const finalX = snapToGrid ? Math.round(x / 40) * 40 : x;
      const finalY = snapToGrid ? Math.round(y / 40) * 40 : y;
      
      dispatch({ type: 'ADD_STATE', payload: { x: finalX, y: finalY } });
      setEditingLabel({
        type: 'state',
        id: `q${state.stateCounter}`,
        x: finalX,
        y: finalY,
        initialValue: `q${state.stateCounter}`
      });
    }
  };

  const handleCanvasPointerDown = (e) => {
    if (editingLabel) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewport.panX) / viewport.zoom;
    const y = (e.clientY - rect.top - viewport.panY) / viewport.zoom;

    if (e.target.tagName.toLowerCase() === 'svg' || e.target.id === 'bg-grid') {
      if (!isShiftDown) {
        dispatch({ type: 'CLEAR_SELECTION' });
      }
      setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y });
    }
  };

  const handleStateDoubleClick = (e, id) => {
    e.stopPropagation();
    if (editingLabel) return;
    dispatch({ type: 'TOGGLE_ACCEPTING', payload: id });
  };

  const handleStatePointerDown = (e, id) => {
    e.stopPropagation();
    if (editingLabel) return;
    
    dispatch({ type: 'SELECT', payload: { id, isShift: isShiftDown } });

    if (isShiftDown) {
      dispatch({ type: 'START_TRANSITION', payload: { fromId: id } });
      const rect = e.currentTarget.closest('svg').getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left - viewport.panX) / viewport.zoom,
        y: (e.clientY - rect.top - viewport.panY) / viewport.zoom
      });
    } else {
      setDraggedState(id);
      const rect = e.currentTarget.closest('svg').getBoundingClientRect();
      setLastMousePos({
        x: (e.clientX - rect.left - viewport.panX) / viewport.zoom,
        y: (e.clientY - rect.top - viewport.panY) / viewport.zoom
      });
    }
  };

  const handleStatePointerUp = (e, id) => {
    if (state.pendingTransition && state.pendingTransition.fromId) {
      e.stopPropagation();
      const fromState = state.states.find(s => s.id === state.pendingTransition.fromId);
      const toState = state.states.find(s => s.id === id);
      
      const isLoop = fromState.id === toState.id;
      const midX = isLoop ? fromState.x : (fromState.x + toState.x) / 2;
      const midY = isLoop ? fromState.y - 40 : (fromState.y + toState.y) / 2;

      setEditingLabel({
        type: 'new_transition',
        fromId: fromState.id,
        toId: toState.id,
        x: midX,
        y: midY,
        initialValue: ''
      });
      
      dispatch({ type: 'CANCEL_TRANSITION' });
    }
  };

  const [draggedCurvature, setDraggedCurvature] = useState(null); // { id, fromState, toState, isBidirectional }
  const [draggedNoteResize, setDraggedNoteResize] = useState(null); // { id, direction, initialRect: {x,y,w,h}, startMouse: {x,y} }

  const handleCanvasPointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewport.panX) / viewport.zoom;
    const y = (e.clientY - rect.top - viewport.panY) / viewport.zoom;

    if (draggedNoteResize) {
      const { id, direction, initialRect, startMouse } = draggedNoteResize;
      const dx = x - startMouse.x;
      const dy = y - startMouse.y;
      
      let newX = initialRect.x;
      let newY = initialRect.y;
      let newW = initialRect.w;
      let newH = initialRect.h;

      if (direction.includes('e')) newW = Math.max(50, initialRect.w + dx);
      if (direction.includes('s')) newH = Math.max(30, initialRect.h + dy);
      if (direction.includes('w')) {
        const possibleW = initialRect.w - dx;
        if (possibleW >= 50) {
          newW = possibleW;
          newX = initialRect.x + dx;
        }
      }
      if (direction.includes('n')) {
        const possibleH = initialRect.h - dy;
        if (possibleH >= 30) {
          newH = possibleH;
          newY = initialRect.y + dy;
        }
      }

      dispatch({ 
        type: 'UPDATE_NOTE_BOUNDS', 
        payload: { id, bounds: { x: newX, y: newY, width: newW, height: newH } } 
      });
      return;
    }

    if (draggedCurvature) {
      // Calcular la nueva curvatura basada en la posición del ratón
      const { id, fromState, toState, isBidirectional } = draggedCurvature;
      const midX = (fromState.x + toState.x) / 2;
      const midY = (fromState.y + toState.y) / 2;
      
      const angle = Math.atan2(toState.y - fromState.y, toState.x - fromState.x);
      const perpAngle = angle - Math.PI / 2;
      
      // Proyección escalar del vector (mid -> mouse) sobre el vector perpendicular
      const mouseVecX = x - midX;
      const mouseVecY = y - midY;
      const perpVecX = Math.cos(perpAngle);
      const perpVecY = Math.sin(perpAngle);
      
      const projection = (mouseVecX * perpVecX + mouseVecY * perpVecY);
      
      // El offset base de isBidirectional es SIZES.TRANSITION_CURVE_OFFSET (30)
      const baseOffset = isBidirectional ? 30 : 0;
      const newCurvature = projection - baseOffset;
      
      dispatch({ type: 'UPDATE_TRANSITION_CURVATURE', payload: { id, curvature: newCurvature } });
      return;
    }

    if (draggedState && lastMousePos) {
      const idsToMove = state.selectedIds.includes(draggedState) 
        ? state.selectedIds 
        : [draggedState];

      if (snapToGrid) {
        const newX = Math.round(x / 40) * 40;
        const newY = Math.round(y / 40) * 40;
        const draggedStateObj = state.states.find(st => st.id === draggedState);
        
        if (draggedStateObj) {
          const deltaX = newX - draggedStateObj.x;
          const deltaY = newY - draggedStateObj.y;
          if (deltaX !== 0 || deltaY !== 0) {
            dispatch({ type: 'MOVE_STATES', payload: { ids: idsToMove, deltaX, deltaY } });
            setLastMousePos({ x, y }); // Update last position after snapping
          }
        }
      } else {
        const deltaX = x - lastMousePos.x;
        const deltaY = y - lastMousePos.y;
        dispatch({ type: 'MOVE_STATES', payload: { ids: idsToMove, deltaX, deltaY } });
        setLastMousePos({ x, y });
      }
    } else if (state.pendingTransition) {
      setMousePos({ x, y });
    } else if (selectionBox) {
      setSelectionBox({ ...selectionBox, currentX: x, currentY: y });
    }
  };

  const handleCanvasPointerUp = () => {
    if (draggedNoteResize) {
      setDraggedNoteResize(null);
    }
    if (draggedCurvature) {
      setDraggedCurvature(null);
    }
    if (draggedState) {
      setDraggedState(null);
      setLastMousePos(null);
    }
    if (state.pendingTransition) {
      dispatch({ type: 'CANCEL_TRANSITION' });
    }
    if (selectionBox) {
      // Calculate min and max X/Y
      const minX = Math.min(selectionBox.startX, selectionBox.currentX);
      const maxX = Math.max(selectionBox.startX, selectionBox.currentX);
      const minY = Math.min(selectionBox.startY, selectionBox.currentY);
      const maxY = Math.max(selectionBox.startY, selectionBox.currentY);
      
      // Only select if there was an actual drag
      if (maxX - minX > 5 || maxY - minY > 5) {
        dispatch({ type: 'SELECT_BOX', payload: { minX, minY, maxX, maxY, isShift: isShiftDown } });
      }
      setSelectionBox(null);
    }
  };

  const handleLabelSubmit = (val) => {
    if (editingLabel.type === 'state') {
      dispatch({ type: 'RENAME_STATE', payload: { id: editingLabel.id, name: val || editingLabel.initialValue } });
    } else if (editingLabel.type === 'new_transition') {
      dispatch({ 
        type: 'ADD_TRANSITION', 
        payload: { fromId: editingLabel.fromId, toId: editingLabel.toId, label: val } 
      });
    } else if (editingLabel.type === 'transition') {
      dispatch({ type: 'UPDATE_TRANSITION_LABEL', payload: { id: editingLabel.id, label: val } });
    }
    setEditingLabel(null);
  };

  const handleNoteChange = (id, text) => {
    dispatch({ type: 'UPDATE_NOTE_TEXT', payload: { id, text } });
  };

  const handleNoteResize = (id, width, height) => {
    dispatch({ type: 'UPDATE_NOTE_SIZE', payload: { id, width, height } });
  };

  return {
    handleCanvasDoubleClick,
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp,
    handleStateDoubleClick,
    handleStatePointerDown,
    handleStatePointerUp,
    mousePos,
    isShiftDown,
    editingLabel,
    setEditingLabel,
    handleLabelSubmit,
    selectionBox,
    handleNoteChange,
    handleNoteResize,
    setDraggedCurvature,
    setDraggedNoteResize
  };
}
