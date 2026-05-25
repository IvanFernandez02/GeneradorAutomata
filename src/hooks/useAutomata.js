import { useReducer, useMemo } from 'react';
import { CANVAS_MODES } from '../constants/automata';
import { extractSymbols } from '../utils/labelUtils';

const initialState = {
  states: [],
  transitions: [],
  mode: CANVAS_MODES.SELECT,
  selectedIds: [],
  pendingTransition: null,
  stateCounter: 0,
  transitionCounter: 0,
};

function automataReducer(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload, selectedIds: [], pendingTransition: null };
      
    case 'ADD_STATE': {
      const newState = {
        id: `q${state.stateCounter}`,
        name: `q${state.stateCounter}`,
        x: action.payload.x,
        y: action.payload.y,
        isInitial: state.states.length === 0, // First state is initial
        isAccepting: false,
      };
      return {
        ...state,
        states: [...state.states, newState],
        stateCounter: state.stateCounter + 1,
      };
    }
      
    case 'ADD_NOTE': {
      const newNote = {
        id: `n${Date.now()}`,
        x: action.payload.x,
        y: action.payload.y,
        width: 150,
        height: 100,
        text: 'Doble click para editar',
      };
      return {
        ...state,
        notes: [...(state.notes || []), newNote],
      };
    }

    case 'UPDATE_NOTE_TEXT': {
      return {
        ...state,
        notes: (state.notes || []).map(n => 
          n.id === action.payload.id 
            ? { ...n, text: action.payload.text } 
            : n
        )
      };
    }

    case 'UPDATE_NOTE_SIZE': {
      return {
        ...state,
        notes: (state.notes || []).map(n => 
          n.id === action.payload.id 
            ? { ...n, width: action.payload.width, height: action.payload.height } 
            : n
        )
      };
    }

    case 'UPDATE_NOTE_BOUNDS': {
      return {
        ...state,
        notes: (state.notes || []).map(n => 
          n.id === action.payload.id 
            ? { ...n, ...action.payload.bounds } 
            : n
        )
      };
    }

    case 'UPDATE_TRANSITION_CURVATURE': {
      return {
        ...state,
        transitions: state.transitions.map(t => 
          t.id === action.payload.id 
            ? { ...t, curvature: action.payload.curvature } 
            : t
        )
      };
    }

    case 'MOVE_STATES': {
      const { ids, deltaX, deltaY } = action.payload;
      return {
        ...state,
        states: state.states.map(s => 
          ids.includes(s.id) ? { ...s, x: s.x + deltaX, y: s.y + deltaY } : s
        ),
        notes: (state.notes || []).map(n => 
          ids.includes(n.id) ? { ...n, x: n.x + deltaX, y: n.y + deltaY } : n
        )
      };
    }

    case 'TOGGLE_ACCEPTING': {
      return {
        ...state,
        states: state.states.map(s => 
          s.id === action.payload 
            ? { ...s, isAccepting: !s.isAccepting } 
            : s
        )
      };
    }

    case 'SET_INITIAL_STATE': {
      return {
        ...state,
        states: state.states.map(s => ({
          ...s,
          isInitial: s.id === action.payload
        }))
      };
    }

    case 'RENAME_STATE': {
      return {
        ...state,
        states: state.states.map(s => 
          s.id === action.payload.id 
            ? { ...s, name: action.payload.name } 
            : s
        )
      };
    }

    case 'START_TRANSITION': {
      return {
        ...state,
        pendingTransition: { fromId: action.payload.fromId }
      };
    }

    case 'CANCEL_TRANSITION': {
      return {
        ...state,
        pendingTransition: null
      };
    }

    case 'ADD_TRANSITION': {
      const { fromId, toId, label } = action.payload;
      
      const existingIdx = state.transitions.findIndex(t => t.from === fromId && t.to === toId);
      
      if (existingIdx !== -1) {
        const updatedTransitions = [...state.transitions];
        const existingLabels = updatedTransitions[existingIdx].label.split(',').map(s => s.trim());
        const newLabels = label.split(',').map(s => s.trim());
        const combined = Array.from(new Set([...existingLabels, ...newLabels])).join(', ');
        
        updatedTransitions[existingIdx] = {
          ...updatedTransitions[existingIdx],
          label: combined
        };
        
        return {
          ...state,
          transitions: updatedTransitions,
          pendingTransition: null,
        };
      }
      
      const newTransition = {
        id: `t${state.transitionCounter}`,
        from: fromId,
        to: toId,
        label: label || 'ε',
        curvature: 0
      };
      
      return {
        ...state,
        transitions: [...state.transitions, newTransition],
        transitionCounter: state.transitionCounter + 1,
        pendingTransition: null,
      };
    }
    
    case 'UPDATE_TRANSITION_LABEL': {
      return {
        ...state,
        transitions: state.transitions.map(t => 
          t.id === action.payload.id 
            ? { ...t, label: action.payload.label || 'ε' } 
            : t
        )
      };
    }

    case 'SELECT': {
      const { id, isShift } = action.payload;
      let newSelectedIds = [...state.selectedIds];
      
      if (isShift) {
        if (newSelectedIds.includes(id)) {
          newSelectedIds = newSelectedIds.filter(selectedId => selectedId !== id);
        } else {
          newSelectedIds.push(id);
        }
      } else {
        if (!newSelectedIds.includes(id)) {
          newSelectedIds = [id];
        }
      }
      return { ...state, selectedIds: newSelectedIds };
    }
    
    case 'CLEAR_SELECTION': {
      return { ...state, selectedIds: [] };
    }

    case 'SELECT_BOX': {
      const { minX, minY, maxX, maxY, isShift } = action.payload;
      const STATE_RADIUS = 25; // SIZES.STATE_RADIUS
      
      const newlySelectedStateIds = state.states
        .filter(s => {
          return (
            s.x + STATE_RADIUS >= minX &&
            s.x - STATE_RADIUS <= maxX &&
            s.y + STATE_RADIUS >= minY &&
            s.y - STATE_RADIUS <= maxY
          );
        })
        .map(s => s.id);
        
      const newlySelectedNoteIds = (state.notes || [])
        .filter(n => {
          return (
            n.x + 150 >= minX && n.x <= maxX &&
            n.y + 100 >= minY && n.y <= maxY
          );
        })
        .map(n => n.id);

      const newlySelectedIds = [...newlySelectedStateIds, ...newlySelectedNoteIds];

      let newSelectedIds = [...state.selectedIds];
      if (!isShift) {
        newSelectedIds = newlySelectedIds;
      } else {
        newlySelectedIds.forEach(id => {
          if (!newSelectedIds.includes(id)) {
            newSelectedIds.push(id);
          }
        });
      }
      
      return { ...state, selectedIds: newSelectedIds };
    }

    case 'DELETE_SELECTED': {
      if (state.selectedIds.length === 0) return state;
      
      const excludeNotes = action.payload?.excludeNotes || false;
      const notesToDelete = excludeNotes ? [] : state.selectedIds;
      
      const newSelectedIds = excludeNotes 
        ? state.selectedIds.filter(id => id.startsWith('n'))
        : [];
      
      const remainingStates = state.states.filter(s => !state.selectedIds.includes(s.id));
      const remainingTransitions = state.transitions.filter(t => 
        !state.selectedIds.includes(t.from) && 
        !state.selectedIds.includes(t.to) &&
        !state.selectedIds.includes(t.id)
      );
      
      const maxStateNum = remainingStates.reduce((max, s) => {
        const m = s.id.match(/^q(\d+)$/);
        return m ? Math.max(max, parseInt(m[1], 10) + 1) : max;
      }, 0);
      
      const maxTransNum = remainingTransitions.reduce((max, t) => {
        const m = t.id.match(/^t(\d+)$/);
        return m ? Math.max(max, parseInt(m[1], 10) + 1) : max;
      }, 0);
      
      return {
        ...state,
        states: remainingStates,
        notes: (state.notes || []).filter(n => !notesToDelete.includes(n.id)),
        transitions: remainingTransitions,
        selectedIds: newSelectedIds,
        stateCounter: maxStateNum,
        transitionCounter: maxTransNum,
      };
    }
    
    case 'LOAD_STATE': {
      return { selectedIds: [], ...action.payload };
    }

    default:
      return state;
  }
}

export function useAutomata() {
  const [state, dispatch] = useReducer(automataReducer, initialState, () => {
    try {
      const savedState = localStorage.getItem('automata_save');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        return { 
          ...initialState, 
          ...parsed, 
          mode: CANVAS_MODES.SELECT, 
          pendingTransition: null, 
          selectedIds: [] 
        };
      }
    } catch (e) {
      console.error("Failed to load saved state", e);
    }
    return initialState;
  });
  
  const alphabet = useMemo(() => {
    const symbols = new Set();
    state.transitions.forEach(t => {
      extractSymbols(t.label).forEach(s => symbols.add(s));
    });
    return Array.from(symbols).sort();
  }, [state.transitions]);

  return { state, dispatch, alphabet };
}
