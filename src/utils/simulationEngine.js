import { labelMatchesSymbol } from './labelUtils';

// Obtiene la clausura epsilon de un conjunto de estados
export function getEpsilonClosure(stateIds, transitions) {
  const closure = new Set(stateIds);
  const stack = [...stateIds];

  while (stack.length > 0) {
    const currentState = stack.pop();
    
    // Buscar transiciones epsilon desde este estado
    const epsilonTransitions = transitions.filter(
      t => t.from === currentState && t.label.split(',').map(s=>s.trim()).includes('ε')
    );

    epsilonTransitions.forEach(t => {
      if (!closure.has(t.to)) {
        closure.add(t.to);
        stack.push(t.to);
      }
    });
  }

  return Array.from(closure);
}

// Obtiene los siguientes estados dados los estados actuales y un símbolo
export function getNextStates(currentStates, symbol, transitions) {
  const nextStates = new Set();

  currentStates.forEach(stateId => {
    // Buscar transiciones que coincidan con el símbolo
    const validTransitions = transitions.filter(t => {
      if (t.from !== stateId) return false;
      return labelMatchesSymbol(t.label, symbol);
    });

    validTransitions.forEach(t => {
      nextStates.add(t.to);
    });
  });

  // La clausura epsilon de los siguientes estados
  return getEpsilonClosure(Array.from(nextStates), transitions);
}

export function isAccepting(currentStates, states) {
  return currentStates.some(stateId => {
    const stateObj = states.find(s => s.id === stateId);
    return stateObj && stateObj.isAccepting;
  });
}

// Ejecuta la cadena completa instantáneamente y devuelve el resultado ('accepted' o 'rejected')
export function quickEvaluateString(inputString, state) {
  const { states, transitions } = state;
  const initialStates = states.filter(s => s.isInitial).map(s => s.id);
  
  if (initialStates.length === 0) return 'rejected';

  let currentStates = getEpsilonClosure(initialStates, transitions);

  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];
    currentStates = getNextStates(currentStates, char, transitions);
    
    // Si en algún punto nos quedamos sin estados posibles, se rechaza
    if (currentStates.length === 0) {
      return 'rejected';
    }
  }

  return isAccepting(currentStates, states) ? 'accepted' : 'rejected';
}
