export const CANVAS_MODES = {
  SELECT: 'select',
  ADD_STATE: 'add_state',
  ADD_TRANSITION: 'add_transition',
  DELETE: 'delete'
};

export const COLORS = {
  BACKGROUND: 'var(--bg-color, #1e1e24)',
  STATE_FILL: 'var(--state-fill, #2b2b36)',
  STATE_STROKE: 'var(--state-stroke, #6b7280)',
  STATE_TEXT: 'var(--text-color, #e5e7eb)',
  STATE_SELECTED: 'var(--primary-color, #3b82f6)',
  STATE_ACTIVE: 'var(--primary-color, #3b82f6)',
  STATE_ACCEPT_INNER: '#10b981', // green is fine in both modes
  TRANSITION_STROKE: 'var(--border-color, #9ca3af)',
  TRANSITION_TEXT: 'var(--text-color, #f3f4f6)',
  TRANSITION_SELECTED: 'var(--primary-color, #3b82f6)',
  GRID_LINE: 'var(--grid-line, #ffffff10)'
};

export const SIZES = {
  STATE_RADIUS: 25,
  STATE_ACCEPT_INNER_RADIUS: 20,
  ARROW_SIZE: 10,
  TRANSITION_CURVE_OFFSET: 30,
  LOOP_RADIUS: 20,
  FONT_SIZE_STATE: 16,
  FONT_SIZE_TRANSITION: 14
};
