import { useState, useCallback } from 'react';
import { getEpsilonClosure, getNextStates, isAccepting } from '../utils/simulationEngine';

export function useSimulation(automataState) {
  const [active, setActive] = useState(false);
  const [inputString, setInputString] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentStates, setCurrentStates] = useState([]);
  const [result, setResult] = useState(null); // 'accepted' | 'rejected' | null

  const startSimulation = useCallback((input) => {
    const initialStates = automataState.states.filter(s => s.isInitial).map(s => s.id);
    if (initialStates.length === 0) {
      alert("Debes definir un estado inicial.");
      return;
    }

    const startSet = getEpsilonClosure(initialStates, automataState.transitions);
    
    setInputString(input);
    setCurrentIndex(-1);
    setCurrentStates(startSet);
    setResult(null);
    setActive(true);
    
    if (input.length === 0) {
      setResult(isAccepting(startSet, automataState.states) ? 'accepted' : 'rejected');
    }
  }, [automataState]);

  const stepForward = useCallback(() => {
    const nextToRead = currentIndex + 1;
    if (nextToRead >= inputString.length || result !== null) return;

    const symbol = inputString[nextToRead];
    const nextSet = getNextStates(currentStates, symbol, automataState.transitions);
    
    setCurrentStates(nextSet);
    setCurrentIndex(nextToRead);

    if (nextSet.length === 0) {
      setResult('rejected');
    } else if (nextToRead === inputString.length - 1) {
      setResult(isAccepting(nextSet, automataState.states) ? 'accepted' : 'rejected');
    }
  }, [currentIndex, inputString, currentStates, automataState, result]);

  const fastForward = useCallback(() => {
    let currentSet = [...currentStates];
    let idx = currentIndex + 1;
    
    while (idx < inputString.length && currentSet.length > 0) {
      const symbol = inputString[idx];
      currentSet = getNextStates(currentSet, symbol, automataState.transitions);
      idx++;
    }
    
    setCurrentStates(currentSet);
    setCurrentIndex(idx - 1);
    
    if (currentSet.length === 0) {
      setResult('rejected');
    } else {
      setResult(isAccepting(currentSet, automataState.states) ? 'accepted' : 'rejected');
    }
  }, [currentIndex, inputString, currentStates, automataState]);

  const stopSimulation = useCallback(() => {
    setActive(false);
    setCurrentStates([]);
    setResult(null);
    setCurrentIndex(-1);
  }, []);

  return {
    active,
    inputString,
    currentIndex,
    currentStates,
    result,
    startSimulation,
    stepForward,
    fastForward,
    stopSimulation
  };
}
