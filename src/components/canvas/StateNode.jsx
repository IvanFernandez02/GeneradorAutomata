import React from 'react';
import { COLORS, SIZES } from '../../constants/automata';

export function StateNode({ 
  state, 
  isSelected, 
  isActive,
  onDoubleClick,
  onPointerDown,
  onPointerUp,
  onContextMenu
}) {
  const { x, y, name, isAccepting } = state;
  
  const fill = isActive ? COLORS.STATE_ACTIVE : COLORS.STATE_FILL;
  const stroke = isSelected ? COLORS.STATE_SELECTED : COLORS.STATE_STROKE;
  const strokeWidth = isSelected ? 3 : 2;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onDoubleClick={(e) => onDoubleClick(e, state.id)}
      onPointerDown={(e) => onPointerDown(e, state.id)}
      onPointerUp={(e) => onPointerUp(e, state.id)}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu && onContextMenu(e, state.id);
      }}
      style={{ cursor: 'pointer' }}
    >
      {/* Círculo base */}
      <circle
        r={SIZES.STATE_RADIUS}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      
      {/* Círculo interno si es de aceptación */}
      {isAccepting && (
        <circle
          r={SIZES.STATE_ACCEPT_INNER_RADIUS}
          fill="none"
          stroke={COLORS.STATE_ACCEPT_INNER}
          strokeWidth={2}
        />
      )}
      
      {/* Nombre del estado */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill={COLORS.STATE_TEXT}
        fontSize={SIZES.FONT_SIZE_STATE}
        pointerEvents="none"
        userSelect="none"
      >
        {name}
      </text>
    </g>
  );
}
