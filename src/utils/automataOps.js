import { getEpsilonClosure, getNextStates } from './simulationEngine';
import { labelMatchesSymbol } from './labelUtils';

export function isDeterministic(state, alphabet) {
  const { states, transitions } = state;
  if (states.length === 0) return false;

  // 1. No epsilon transitions
  const hasEpsilon = transitions.some(t => t.label.split(',').map(s=>s.trim()).includes('ε'));
  if (hasEpsilon) return false;

  // 2. Exactly one transition per symbol per state (or at most one for deterministic)
  for (const s of states) {
    for (const symbol of alphabet) {
      if (symbol === 'ε') continue;
      
      const outgoing = transitions.filter(t => 
        t.from === s.id && labelMatchesSymbol(t.label, symbol)
      );
      
      if (outgoing.length > 1) {
        return false;
      }
    }
  }

  return true;
}

export function isComplete(state, alphabet) {
  const { states, transitions } = state;
  if (states.length === 0 || alphabet.length === 0) return false;

  for (const s of states) {
    for (const symbol of alphabet) {
      if (symbol === 'ε') continue;
      
      const outgoing = transitions.filter(t => 
        t.from === s.id && labelMatchesSymbol(t.label, symbol)
      );
      
      if (outgoing.length === 0) {
        return false;
      }
    }
  }

  return true;
}

// Convert NFA to DFA using subset construction
export function convertToDFA(state, alphabet) {
  const { states, transitions } = state;
  const initialStates = states.filter(s => s.isInitial).map(s => s.id);
  
  if (initialStates.length === 0) return null;

  const startClosure = getEpsilonClosure(initialStates, transitions).sort();
  
  const dfaStates = [];
  const dfaTransitions = [];
  
  // Usamos JSON.stringify para comparar arreglos de estados fácilmente
  const stateQueue = [startClosure];
  const processedSets = new Set();
  const stateMap = new Map(); // Mapa de "JSON de array" -> ID nuevo del DFA
  
  let stateCounter = 0;
  
  while (stateQueue.length > 0) {
    const currentSet = stateQueue.shift();
    const setKey = JSON.stringify(currentSet);
    
    if (processedSets.has(setKey)) continue;
    processedSets.add(setKey);
    
    // Crear el estado del DFA
    const newStateId = `q${stateCounter++}`;
    stateMap.set(setKey, newStateId);
    
    // Es de aceptación si algún estado original en el set es de aceptación
    const isAccepting = currentSet.some(id => {
      const s = states.find(st => st.id === id);
      return s && s.isAccepting;
    });

    // Nombre será la unión de los nombres originales, ej: {q0,q1}
    const names = currentSet.map(id => states.find(st => st.id === id)?.name).filter(Boolean);
    const name = names.length > 0 ? `{${names.join(',')}}` : '∅';

    dfaStates.push({
      id: newStateId,
      name: name,
      x: 100 + (stateCounter * 120) % 600, // Layout muy básico
      y: 100 + Math.floor(stateCounter / 5) * 120,
      isInitial: setKey === JSON.stringify(startClosure),
      isAccepting: isAccepting,
      originalSet: currentSet
    });

    // Calcular transiciones para cada símbolo del alfabeto
    for (const symbol of alphabet) {
      if (symbol === 'ε') continue;
      
      const nextSet = getNextStates(currentSet, symbol, transitions).sort();
      
      if (nextSet.length > 0) {
        stateQueue.push(nextSet);
        dfaTransitions.push({
          fromSetKey: setKey,
          toSetKey: JSON.stringify(nextSet),
          symbol: symbol
        });
      } else {
        // Estado trampa (opcional, para hacerlo completo)
        // Por simplicidad, no lo agregamos explícitamente a menos que sea estrictamente necesario.
      }
    }
  }

  // Ahora mapeamos las transiciones a los IDs reales del DFA
  const finalTransitions = [];
  let transitionCounter = 0;

  dfaTransitions.forEach(dt => {
    const fromId = stateMap.get(dt.fromSetKey);
    const toId = stateMap.get(dt.toSetKey);
    
    if (fromId && toId) {
      // Intentar combinar etiquetas si hay múltiples símbolos entre el mismo par
      const existing = finalTransitions.find(t => t.from === fromId && t.to === toId);
      if (existing) {
        existing.label += `, ${dt.symbol}`;
      } else {
        finalTransitions.push({
          id: `t${transitionCounter++}`,
          from: fromId,
          to: toId,
          label: dt.symbol
        });
      }
    }
  });

  return {
    states: dfaStates,
    transitions: finalTransitions,
    mode: 'select',
    selectedIds: [],
    pendingTransition: null,
    stateCounter: stateCounter,
    transitionCounter: transitionCounter,
    notes: state.notes || []
  };
}

export function minimizeDFA(state, alphabet) {
  const { states, transitions } = state;
  if (states.length === 0) return null;

  // 1. Eliminar estados inalcanzables (BFS desde inicial)
  const reachable = new Set();
  const initialStates = states.filter(s => s.isInitial).map(s => s.id);
  if (initialStates.length === 0) return null; // No hay estado inicial

  const queue = [...initialStates];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!reachable.has(current)) {
      reachable.add(current);
      // Buscar a dónde va usando transiciones cuyo origen sea 'current'
      const outgoing = transitions.filter(t => t.from === current);
      outgoing.forEach(t => {
        if (!reachable.has(t.to)) {
          queue.push(t.to);
        }
      });
    }
  }

  const reachableStates = states.filter(s => reachable.has(s.id));
  
  // 2. Partición inicial: Aceptación y No Aceptación
  const accept = reachableStates.filter(s => s.isAccepting).map(s => s.id);
  const nonAccept = reachableStates.filter(s => !s.isAccepting).map(s => s.id);
  
  let P = [];
  if (accept.length > 0) P.push(accept);
  if (nonAccept.length > 0) P.push(nonAccept);

  const getPartitionIndex = (stateId, partitions) => {
    return partitions.findIndex(p => p.includes(stateId));
  };

  const getTarget = (fromId, symbol) => {
    const t = transitions.find(t => t.from === fromId && labelMatchesSymbol(t.label, symbol));
    return t ? t.to : null;
  };

  // 3. Refinar particiones
  let changed = true;
  while (changed) {
    changed = false;
    const newP = [];
    
    for (const group of P) {
      if (group.length <= 1) {
        newP.push(group);
        continue;
      }
      
      const splits = new Map();
      
      for (const stateId of group) {
        const signature = alphabet.filter(a => a !== 'ε').map(sym => {
          const target = getTarget(stateId, sym);
          return target ? getPartitionIndex(target, P) : -1;
        }).join(',');
        
        if (!splits.has(signature)) splits.set(signature, []);
        splits.get(signature).push(stateId);
      }
      
      for (const splitGroup of splits.values()) {
        newP.push(splitGroup);
      }
      
      if (splits.size > 1) {
        changed = true;
      }
    }
    P = newP;
  }

  // 4. Reconstruir el nuevo AFD
  const newStates = [];
  const newTransitions = [];
  let stateCounter = 0;
  const idMap = new Map();
  
  P.forEach(group => {
    const newStateId = `qm${stateCounter++}`;
    group.forEach(id => idMap.set(id, newStateId));
    
    const originalStates = group.map(id => states.find(s => s.id === id));
    const isInitial = originalStates.some(s => s.isInitial);
    const isAccepting = originalStates.some(s => s.isAccepting);
    
    // Simplificar el nombre si es un solo estado
    const names = originalStates.map(s => s.name);
    const name = names.length > 1 ? `{${names.join(',')}}` : names[0];
    
    const avgX = originalStates.reduce((sum, s) => sum + s.x, 0) / group.length;
    const avgY = originalStates.reduce((sum, s) => sum + s.y, 0) / group.length;

    newStates.push({
      id: newStateId,
      name,
      x: avgX,
      y: avgY,
      isInitial,
      isAccepting
    });
  });

  let transCounter = 0;
  P.forEach(group => {
    const rep = group[0];
    const newFrom = idMap.get(rep);
    
    for (const sym of alphabet) {
      if (sym === 'ε') continue;
      const target = getTarget(rep, sym);
      if (target && idMap.has(target)) {
        const newTo = idMap.get(target);
        
        const existing = newTransitions.find(t => t.from === newFrom && t.to === newTo);
        if (existing) {
          const existingLabels = existing.label.split(',').map(s=>s.trim());
          if (!existingLabels.includes(sym)) {
            existing.label += `, ${sym}`;
          }
        } else {
          newTransitions.push({
            id: `tm${transCounter++}`,
            from: newFrom,
            to: newTo,
            label: sym,
            curvature: 0
          });
        }
      }
    }
  });

  return {
    states: newStates,
    transitions: newTransitions,
    mode: 'select',
    selectedIds: [],
    pendingTransition: null,
    stateCounter: stateCounter,
    transitionCounter: transCounter,
    notes: state.notes || []
  };
}
