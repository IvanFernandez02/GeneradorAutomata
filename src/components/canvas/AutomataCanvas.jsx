import React, { useRef, useEffect } from 'react';
import { COLORS } from '../../constants/automata';
import { StateNode } from './StateNode';
import { TransitionArrow } from './TransitionArrow';
import { InitialArrow } from './InitialArrow';

const ZOOM_STEP = 0.12;

export function AutomataCanvas({ 
  state, 
  interactions,
  simulation,
  viewport,
  width = '100%',
  height = '100%' 
}) {
  const {
    handleCanvasDoubleClick,
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp,
    handleStateDoubleClick,
    handleStatePointerDown,
    handleStatePointerUp,
    mousePos,
    selectionBox,
  } = interactions;

  const svgRef = useRef(null);
  const { zoom, panX, panY, pan, containerRef } = viewport;
  const isPanning = useRef(false);
  const lastPanPos = useRef(null);

  const isBidirectional = (t1) => {
    return state.transitions.some(t2 => t2.from === t1.to && t2.to === t1.from);
  };

  useEffect(() => {
    containerRef.current = svgRef.current?.parentElement || null;
  }, [containerRef]);

  const zoomAtPointRef = useRef(viewport.zoomAtPoint);
  zoomAtPointRef.current = viewport.zoomAtPoint;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      zoomAtPointRef.current(delta, mx, my, true);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, []);

  const handlePointerDown = (e) => {
    if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      isPanning.current = true;
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      return;
    }
    handleCanvasPointerDown(e);
  };

  const handlePointerMove = (e) => {
    if (isPanning.current) {
      const dx = e.clientX - lastPanPos.current.x;
      const dy = e.clientY - lastPanPos.current.y;
      pan(dx, dy);
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      return;
    }
    handleCanvasPointerMove(e);
  };

  const handlePointerUp = (e) => {
    if (isPanning.current) {
      isPanning.current = false;
      lastPanPos.current = null;
      return;
    }
    handleCanvasPointerUp(e);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <svg
        id="automata-canvas"
        ref={svgRef}
        width={width}
        height={height}
        style={{ backgroundColor: COLORS.BACKGROUND, touchAction: 'none', display: 'block', cursor: isPanning.current ? 'grabbing' : 'default' }}
        onDoubleClick={handleCanvasDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.TRANSITION_STROKE} />
          </marker>
          <marker id="arrowhead-selected" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.TRANSITION_SELECTED} />
          </marker>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={COLORS.GRID_LINE} strokeWidth="1" />
          </pattern>
        </defs>

        <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
          <rect id="bg-grid" x={-5000} y={-5000} width={10000} height={10000} fill="url(#grid)" />

          {state.transitions.map(t => (
            <TransitionArrow
              key={t.id}
              transition={t}
              fromState={state.states.find(s => s.id === t.from)}
              toState={state.states.find(s => s.id === t.to)}
              isSelected={state.selectedIds.includes(t.id)}
              isBidirectional={isBidirectional(t)}
              onPointerDown={(e, id) => {
                e.stopPropagation();
                interactions.setEditingLabel(null);
                handleStatePointerDown(e, id);
              }}
              onCurveDragStart={(e) => {
                e.stopPropagation();
                interactions.setDraggedCurvature({
                  id: t.id,
                  fromState: state.states.find(s => s.id === t.from),
                  toState: state.states.find(s => s.id === t.to),
                  isBidirectional: isBidirectional(t)
                });
              }}
            />
          ))}

          {state.pendingTransition && (
            <line
              x1={state.states.find(s => s.id === state.pendingTransition.fromId)?.x || 0}
              y1={state.states.find(s => s.id === state.pendingTransition.fromId)?.y || 0}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke={COLORS.TRANSITION_STROKE}
              strokeWidth={2 / zoom}
              strokeDasharray="5,5"
              markerEnd="url(#arrowhead)"
              pointerEvents="none"
            />
          )}

          {selectionBox && (
            <rect
              x={Math.min(selectionBox.startX, selectionBox.currentX)}
              y={Math.min(selectionBox.startY, selectionBox.currentY)}
              width={Math.abs(selectionBox.currentX - selectionBox.startX)}
              height={Math.abs(selectionBox.currentY - selectionBox.startY)}
              fill={`${COLORS.TRANSITION_SELECTED}33`}
              stroke={COLORS.TRANSITION_SELECTED}
              strokeWidth={1 / zoom}
              strokeDasharray="4,4"
              pointerEvents="none"
            />
          )}

          {state.states.filter(s => s.isInitial).map(s => (
            <InitialArrow key={`init-${s.id}`} state={s} />
          ))}

          {state.states.map(s => (
            <StateNode
              key={s.id}
              state={s}
              isSelected={state.selectedIds.includes(s.id)}
              isActive={simulation?.active && simulation.currentStates.includes(s.id)}
              onDoubleClick={handleStateDoubleClick}
              onPointerDown={handleStatePointerDown}
              onPointerUp={handleStatePointerUp}
              onContextMenu={(e) => {
                interactions.setEditingLabel({
                  type: 'state',
                  id: s.id,
                  x: s.x,
                  y: s.y + 40,
                  initialValue: s.name
                });
              }}
            />
          ))}

          {(state.notes || []).map(n => {
            const isSelected = state.selectedIds.includes(n.id);
            const nw = n.width || 150;
            const nh = n.height || 100;
            const handles = isSelected ? [
              { dir: 'nw', x: 0, y: 0, cursor: 'nwse-resize' },
              { dir: 'n', x: nw/2 - 4, y: 0, cursor: 'ns-resize' },
              { dir: 'ne', x: nw - 8, y: 0, cursor: 'nesw-resize' },
              { dir: 'w', x: 0, y: nh/2 - 4, cursor: 'ew-resize' },
              { dir: 'e', x: nw - 8, y: nh/2 - 4, cursor: 'ew-resize' },
              { dir: 'sw', x: 0, y: nh - 8, cursor: 'nesw-resize' },
              { dir: 's', x: nw/2 - 4, y: nh - 8, cursor: 'ns-resize' },
              { dir: 'se', x: nw - 8, y: nh - 8, cursor: 'nwse-resize' },
            ] : [];

            return (
              <g key={n.id}>
                <foreignObject
                  x={n.x}
                  y={n.y}
                  width={nw}
                  height={nh}
                  style={{ overflow: 'visible' }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    interactions.setEditingLabel(null);
                    interactions.handleStatePointerDown(e, n.id);
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'var(--surface-color)',
                    border: `1px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    pointerEvents: 'auto'
                  }}>
                    <div 
                      style={{ height: '12px', background: 'var(--border-color)', borderTopLeftRadius: '3px', borderTopRightRadius: '3px', cursor: 'move', flexShrink: 0 }}
                    />
                    <textarea
                      value={n.text}
                      onChange={(e) => interactions.handleNoteChange(n.id, e.target.value)}
                      style={{
                        width: '100%',
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-color)',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        resize: 'none',
                        outline: 'none',
                        padding: '4px',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Escribe una nota..."
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </foreignObject>

                {handles.map(h => (
                  <rect
                    key={h.dir}
                    x={n.x + h.x}
                    y={n.y + h.y}
                    width={8}
                    height={8}
                    fill="var(--surface-color)"
                    stroke="var(--primary-color)"
                    strokeWidth={1}
                    style={{ cursor: h.cursor }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      interactions.setDraggedNoteResize({
                        id: n.id,
                        direction: h.dir,
                        initialRect: { x: n.x, y: n.y, w: nw, h: nh },
                        startMouse: { x: e.clientX, y: e.clientY }
                      });
                    }}
                  />
                ))}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
