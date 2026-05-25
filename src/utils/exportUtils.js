// src/utils/exportUtils.js

function triggerDownload(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 1. Export as JSON
export function exportJSON(state) {
  const data = JSON.stringify({
    states: state.states,
    transitions: state.transitions,
    stateCounter: state.stateCounter,
    transitionCounter: state.transitionCounter
  }, null, 2);
  
  triggerDownload(data, 'automata.json', 'application/json');
}

// 2. Export as JFLAP (.jff)
export function exportJFLAP(state) {
  let xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?><!--Created by React Automata Generator-->\n<structure>\n\t<type>fa</type>\n\t<automaton>\n\t\t<!--The list of states.-->\n`;
  
  // Mapping our string IDs (e.g. "q0") to JFLAP numeric IDs
  const idMap = new Map();
  let numId = 0;
  
  state.states.forEach(s => {
    const currentId = numId++;
    idMap.set(s.id, currentId);
    
    xml += `\t\t<state id="${currentId}" name="${s.name}">\n`;
    xml += `\t\t\t<x>${s.x}</x>\n`;
    xml += `\t\t\t<y>${s.y}</y>\n`;
    if (s.isInitial) xml += `\t\t\t<initial/>\n`;
    if (s.isAccepting) xml += `\t\t\t<final/>\n`;
    xml += `\t\t</state>\n`;
  });
  
  xml += `\t\t<!--The list of transitions.-->\n`;
  
  state.transitions.forEach(t => {
    const fromId = idMap.get(t.from);
    const toId = idMap.get(t.to);
    const symbols = t.label.split(',').map(s => s.trim());
    
    symbols.forEach(sym => {
      xml += `\t\t<transition>\n`;
      xml += `\t\t\t<from>${fromId}</from>\n`;
      xml += `\t\t\t<to>${toId}</to>\n`;
      // JFLAP uses empty <read/> for epsilon
      if (sym === 'ε' || sym === '') {
        xml += `\t\t\t<read/>\n`;
      } else {
        xml += `\t\t\t<read>${sym}</read>\n`;
      }
      xml += `\t\t</transition>\n`;
    });
  });
  
  xml += `\t</automaton>\n</structure>`;
  
  triggerDownload(xml, 'automata.jff', 'application/xml');
}

// 3. Export as SVG/PNG
export function exportImage(svgElement, isPNG = false) {
  if (!svgElement) return;
  
  // 1. Temporarily hide the background grid to get the exact bounding box of the automata
  const bgGrid = svgElement.querySelector('#bg-grid');
  if (bgGrid) bgGrid.style.display = 'none';
  
  const bbox = svgElement.getBBox();
  
  // Restore background
  if (bgGrid) bgGrid.style.display = 'block';

  // 2. Clone the SVG to not modify the real DOM
  const clone = svgElement.cloneNode(true);
  
  // Calculate new dimensions with padding
  const padding = 50;
  let newWidth = bbox.width + padding * 2;
  let newHeight = bbox.height + padding * 2;
  let bX = bbox.x;
  let bY = bbox.y;

  // Fallback in case of empty canvas
  if (!isFinite(newWidth) || newWidth <= padding * 2) {
    newWidth = 800;
    newHeight = 600;
    bX = 0;
    bY = 0;
  }
  
  // Apply new viewBox to crop exactly around the content
  clone.setAttribute('viewBox', `${bX - padding} ${bY - padding} ${newWidth} ${newHeight}`);
  clone.setAttribute('width', newWidth);
  clone.setAttribute('height', newHeight);
  
  // Adjust background grid to cover the new viewBox
  const cloneBg = clone.querySelector('#bg-grid');
  if (cloneBg) {
    cloneBg.setAttribute('x', bX - padding);
    cloneBg.setAttribute('y', bY - padding);
    cloneBg.setAttribute('width', newWidth);
    cloneBg.setAttribute('height', newHeight);
  }

  // Resolve CSS variables by injecting computed values into the clone
  const rootStyle = getComputedStyle(document.documentElement);
  const cssVarNames = [
    '--bg-color', '--surface-color', '--text-color', '--border-color',
    '--primary-color', '--icon-color', '--grid-line', '--state-fill', '--state-stroke'
  ];
  const cssVarDeclarations = cssVarNames
    .map(name => `${name}: ${rootStyle.getPropertyValue(name).trim()}`)
    .join(';\n');
  const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  styleEl.textContent = `:root {\n${cssVarDeclarations}\n}`;
  clone.insertBefore(styleEl, clone.firstChild);

  // Serialize the modified SVG
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(clone);
  
  // Add namespaces if missing
  if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
  const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
  
  if (!isPNG) {
    // Just download SVG
    const a = document.createElement('a');
    a.href = url;
    a.download = 'automata.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    // Draw SVG on Canvas to export as PNG
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = function() {
      ctx.fillStyle = '#1e1e24';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'automata.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.src = url;
  }
}

// 4. Import from JFLAP (.jff)
export function parseJFLAP(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  
  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("Error parseando el archivo JFLAP XML");
  }

  const states = [];
  const transitions = [];
  let stateCounter = 0;
  let transitionCounter = 0;
  
  const stateNodes = xmlDoc.getElementsByTagName("state");
  for (let i = 0; i < stateNodes.length; i++) {
    const node = stateNodes[i];
    const idStr = node.getAttribute("id");
    const name = node.getAttribute("name");
    
    const xNode = node.getElementsByTagName("x")[0];
    const yNode = node.getElementsByTagName("y")[0];
    const initialNode = node.getElementsByTagName("initial")[0];
    const finalNode = node.getElementsByTagName("final")[0];
    
    states.push({
      id: idStr, // JFLAP uses numeric strings natively e.g. "0", "1"
      name: name || `q${idStr}`,
      x: xNode ? parseFloat(xNode.textContent) : 100,
      y: yNode ? parseFloat(yNode.textContent) : 100,
      isInitial: !!initialNode,
      isAccepting: !!finalNode
    });
    
    const numericId = parseInt(idStr, 10);
    if (!isNaN(numericId) && numericId >= stateCounter) {
      stateCounter = numericId + 1;
    }
  }
  
  const transNodes = xmlDoc.getElementsByTagName("transition");
  // We need to group transitions by from/to
  const transMap = new Map();
  
  for (let i = 0; i < transNodes.length; i++) {
    const node = transNodes[i];
    const fromNode = node.getElementsByTagName("from")[0];
    const toNode = node.getElementsByTagName("to")[0];
    const readNode = node.getElementsByTagName("read")[0];
    
    if (fromNode && toNode) {
      const from = fromNode.textContent;
      const to = toNode.textContent;
      const read = (readNode && readNode.textContent) ? readNode.textContent : 'ε';
      
      const key = `${from}-${to}`;
      if (transMap.has(key)) {
        transMap.get(key).push(read);
      } else {
        transMap.set(key, [read]);
      }
    }
  }
  
  for (const [key, labels] of transMap.entries()) {
    const [from, to] = key.split('-');
    transitions.push({
      id: `t${transitionCounter++}`,
      from,
      to,
      label: labels.join(', ')
    });
  }

  return {
    states,
    transitions,
    mode: 'select',
    selectedIds: [],
    pendingTransition: null,
    stateCounter,
    transitionCounter
  };
}
