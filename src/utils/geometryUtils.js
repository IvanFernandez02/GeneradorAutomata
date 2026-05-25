import { SIZES } from '../constants/automata';

// Distancia entre dos puntos
export const getDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

// Ángulo entre dos puntos en radianes
export const getAngle = (p1, p2) => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

// Calcula un punto de control para una curva Bézier cuadrática
export const getControlPoint = (p1, p2, offset = SIZES.TRANSITION_CURVE_OFFSET) => {
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const angle = getAngle(p1, p2);
  
  // Perpendicular angle
  const perpAngle = angle - Math.PI / 2;
  
  return {
    x: midX + Math.cos(perpAngle) * offset,
    y: midY + Math.sin(perpAngle) * offset
  };
};

// Punto en la circunferencia del estado destino (para que la flecha no quede dentro del círculo)
export const getPointOnCircle = (center, angle, radius = SIZES.STATE_RADIUS) => {
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius
  };
};

// Intersección de la curva con el círculo destino
export const getArrowTipPoint = (p1, p2, controlPoint, isCurve) => {
  if (!isCurve) {
    const angle = getAngle(p1, p2);
    // Para línea recta, la punta de la flecha está en el borde del círculo en dirección opuesta
    return getPointOnCircle(p2, angle + Math.PI, SIZES.STATE_RADIUS + 2);
  } else {
    // Para curva, aproximamos el ángulo de llegada usando el punto de control
    const angle = getAngle(controlPoint, p2);
    return getPointOnCircle(p2, angle + Math.PI, SIZES.STATE_RADIUS + 2);
  }
};

// Calcular path del self loop
export const getLoopPath = (state) => {
  const { x, y } = state;
  const r = SIZES.STATE_RADIUS;
  const loopR = SIZES.LOOP_RADIUS;
  
  // Dibujamos el loop arriba del estado
  const startAngle = -Math.PI * 0.75;
  const endAngle = -Math.PI * 0.25;
  
  const startX = x + Math.cos(startAngle) * r;
  const startY = y + Math.sin(startAngle) * r;
  const endX = x + Math.cos(endAngle) * r;
  const endY = y + Math.sin(endAngle) * r;
  
  // Puntos de control para la curva cúbica de Bezier que hace el loop
  const cp1x = startX - loopR * 1.5;
  const cp1y = startY - loopR * 3;
  const cp2x = endX + loopR * 1.5;
  const cp2y = endY - loopR * 3;
  
  return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
};

// Ángulo final de la curva de bezier para orientar la punta de flecha
export const getArrowAngle = (p1, p2, isCurve, isLoop) => {
  if (isLoop) {
    return Math.PI * 0.25; // Ángulo fijo para el final del loop
  }
  if (!isCurve) {
    return getAngle(p1, p2);
  }
  const cp = getControlPoint(p1, p2);
  return getAngle(cp, p2);
};
