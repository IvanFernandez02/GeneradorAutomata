import React from 'react';
import { COLORS, SIZES } from '../../constants/automata';

export function InitialArrow({ state }) {
  if (!state || !state.isInitial) return null;

  const { x, y } = state;
  const startX = x - SIZES.STATE_RADIUS - 40;
  const endX = x - SIZES.STATE_RADIUS;

  return (
    <g>
      <line
        x1={startX}
        y1={y}
        x2={endX}
        y2={y}
        stroke={COLORS.TRANSITION_STROKE}
        strokeWidth={2}
        markerEnd="url(#arrowhead)"
      />
    </g>
  );
}
