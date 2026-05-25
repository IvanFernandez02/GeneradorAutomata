export function matchesSymbol(label, symbol) {
  if (label === symbol) return true;

  if (label.startsWith('[') && label.endsWith(']') && label.length >= 3) {
    const inner = label.slice(1, -1);
    const code = symbol.charCodeAt(0);
    const rangePattern = /([a-zA-Z0-9])-([a-zA-Z0-9])/g;
    let match;
    let hasRanges = false;
    while ((match = rangePattern.exec(inner)) !== null) {
      hasRanges = true;
      const start = match[1].charCodeAt(0);
      const end = match[2].charCodeAt(0);
      if (code >= Math.min(start, end) && code <= Math.max(start, end)) {
        return true;
      }
    }
    if (!hasRanges) {
      return symbol === inner;
    }
  }

  return false;
}

export function labelMatchesSymbol(labelText, symbol) {
  return labelText.split(',').map(s => s.trim()).some(l => matchesSymbol(l, symbol));
}

export function extractSymbols(labelText) {
  const symbols = new Set();
  labelText.split(',').forEach(s => {
    const part = s.trim();
    if (!part || part === 'ε') return;

    if (part.startsWith('[') && part.endsWith(']') && part.length >= 3) {
      const inner = part.slice(1, -1);
      const rangePattern = /([a-zA-Z0-9])-([a-zA-Z0-9])/g;
      let match;
      let hasRanges = false;
      while ((match = rangePattern.exec(inner)) !== null) {
        hasRanges = true;
        const start = match[1].charCodeAt(0);
        const end = match[2].charCodeAt(0);
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        for (let i = min; i <= max; i++) {
          symbols.add(String.fromCharCode(i));
        }
      }
      if (!hasRanges) {
        symbols.add(inner);
      }
    } else {
      symbols.add(part);
    }
  });
  return Array.from(symbols);
}
