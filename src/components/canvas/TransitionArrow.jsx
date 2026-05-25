import React from 'react';
import { COLORS, SIZES } from '../../constants/automata';
import { getControlPoint, getArrowTipPoint, getLoopPath } from '../../utils/geometryUtils';

export function TransitionArrow({ 
  transition, 
  fromState, 
  toState, 
  isSelected, 
  isBidirectional,
  onPointerDown,
  onCurveDragStart
}) {
  const isLoop = fromState.id === toState.id;
  
  const strokeColor = isSelected ? COLORS.TRANSITION_SELECTED : COLORS.TRANSITION_STROKE;
  const strokeWidth = isSelected ? 3 : 2;

  let pathData = '';
  let labelX = 0;
  let labelY = 0;
  let cpX = 0;
  let cpY = 0;
  let isCurve = false;

  if (isLoop) {
    pathData = getLoopPath(fromState);
    labelX = fromState.x;
    labelY = fromState.y - SIZES.STATE_RADIUS - SIZES.LOOP_RADIUS * 2 - 10;
  } else {
    const p1 = { x: fromState.x, y: fromState.y };
    const p2 = { x: toState.x, y: toState.y };
    
    // Si hay transición en ambas direcciones, o si la curvatura es distinta de cero
    isCurve = isBidirectional || (transition.curvature && transition.curvature !== 0);
    
    if (isCurve) {
      const baseOffset = isBidirectional ? SIZES.TRANSITION_CURVE_OFFSET : 0;
      const totalOffset = baseOffset + (transition.curvature || 0);
      
      const cp = getControlPoint(p1, p2, totalOffset);
      const tip = getArrowTipPoint(p1, p2, cp, true);
      
      // Ajustamos el inicio al borde del círculo origen
      const dx = cp.x - p1.x;
      const dy = cp.y - p1.y;
      const len = Math.sqrt(dx*dx + dy*dy);
      const startX = p1.x + (dx/len) * SIZES.STATE_RADIUS;
      const startY = p1.y + (dy/len) * SIZES.STATE_RADIUS;

      pathData = `M ${startX} ${startY} Q ${cp.x} ${cp.y} ${tip.x} ${tip.y}`;
      labelX = cp.x;
      labelY = cp.y - 20; // Movido 20px arriba del punto de control
      cpX = cp.x;
      cpY = cp.y;
    } else {
      // Línea recta
      const tip = getArrowTipPoint(p1, p2, null, false);
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx*dx + dy*dy);
      const startX = p1.x + (dx/len) * SIZES.STATE_RADIUS;
      const startY = p1.y + (dy/len) * SIZES.STATE_RADIUS;

      pathData = `M ${startX} ${startY} L ${tip.x} ${tip.y}`;
      labelX = (p1.x + p2.x) / 2;
      labelY = (p1.y + p2.y) / 2 - 10;
      cpX = (p1.x + p2.x) / 2;
      cpY = (p1.y + p2.y) / 2;
    }
  }

  return (
    <g>
      {/* Hitbox invisible más ancha para facilitar el click */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={15}
        style={{ cursor: 'pointer' }}
        onPointerDown={(e) => onPointerDown && onPointerDown(e, transition.id)}
      />
      
      {/* Línea visible */}
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        markerEnd={isSelected ? "url(#arrowhead-selected)" : "url(#arrowhead)"}
        style={{ cursor: 'pointer', pointerEvents: 'none' }}
      />
      
      {/* Punto de control para curvar la línea (visible solo cuando está seleccionado o hover) */}
      {!isLoop && isSelected && (
        <circle
          cx={cpX}
          cy={cpY}
          r={8}
          fill={COLORS.TRANSITION_SELECTED}
          style={{ cursor: 'grab' }}
          onPointerDown={onCurveDragStart}
        />
      )}

      {/* Etiqueta de la transición */}
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--text-color)"
        fontSize={SIZES.FONT_SIZE_TRANSITION}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onPointerDown={(e) => onPointerDown && onPointerDown(e, transition.id)}
      >
        {transition.label}
      </text>
    </g>
  );
}
