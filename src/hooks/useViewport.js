import { useState, useCallback, useRef, useMemo } from 'react';

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 5;

export function useViewport() {
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const containerRef = useRef(null);

  const zoomAtPoint = useCallback((value, cx, cy, isDelta = false) => {
    setZoom(prev => {
      const next = isDelta ? prev + value : value;
      const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
      if (clamped === prev) return prev;
      const ratio = clamped / prev;
      setPanX(px => px * ratio + cx * (1 - ratio));
      setPanY(py => py * ratio + cy * (1 - ratio));
      return clamped;
    });
  }, []);

  const pan = useCallback((dx, dy) => {
    setPanX(px => px + dx);
    setPanY(py => py + dy);
  }, []);

  const resetView = useCallback((states, notes, containerWidth, containerHeight) => {
    if (!states || states.length === 0) {
      setZoom(1);
      setPanX(0);
      setPanY(0);
      return;
    }
    const padding = 60;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    states.forEach(s => {
      if (s.x < minX) minX = s.x;
      if (s.y < minY) minY = s.y;
      if (s.x > maxX) maxX = s.x;
      if (s.y > maxY) maxY = s.y;
    });
    (notes || []).forEach(n => {
      const nw = n.width || 150;
      const nh = n.height || 100;
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x + nw > maxX) maxX = n.x + nw;
      if (n.y + nh > maxY) maxY = n.y + nh;
    });
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    setZoom(1);
    setPanX(containerWidth / 2 - centerX);
    setPanY(containerHeight / 2 - centerY);
  }, []);

  const fitToContent = useCallback((states, notes, containerWidth, containerHeight) => {
    if (states.length === 0) return;
    const padding = 60;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    states.forEach(s => {
      if (s.x < minX) minX = s.x;
      if (s.y < minY) minY = s.y;
      if (s.x > maxX) maxX = s.x;
      if (s.y > maxY) maxY = s.y;
    });
    (notes || []).forEach(n => {
      const nw = n.width || 150;
      const nh = n.height || 100;
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x + nw > maxX) maxX = n.x + nw;
      if (n.y + nh > maxY) maxY = n.y + nh;
    });
    const contentW = maxX - minX + padding * 2;
    const contentH = maxY - minY + padding * 2;
    const scaleX = containerWidth / contentW;
    const scaleY = containerHeight / contentH;
    let newZoom = Math.min(scaleX, scaleY);
    newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    setZoom(newZoom);
    setPanX(containerWidth / 2 - centerX * newZoom);
    setPanY(containerHeight / 2 - centerY * newZoom);
  }, []);

  return useMemo(() => ({ zoom, panX, panY, pan, resetView, fitToContent, zoomAtPoint, containerRef }), [zoom, panX, panY, pan, resetView, fitToContent, zoomAtPoint, containerRef]);
}
