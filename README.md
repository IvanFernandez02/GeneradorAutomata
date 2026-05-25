# Generador de Autómatas

Editor visual de autómatas finitos (AFD/AFN) construido con React. Permite diseñar, simular y transformar autómatas en el navegador.

## Características

- **Editor visual** — Dibuja estados y transiciones en un lienzo SVG interactivo. Arrastra estados, crea transiciones curvas, ajusta su curvatura.
- **Simulación de cadenas** — Evalúa cadenas paso a paso o al instante. Soporta transiciones epsilon y no determinismo.
- **Conversión AFN → AFD** — Convierte cualquier AFN a AFD equivalente usando construcción de subconjuntos. Modo tutorial paso a paso disponible.
- **Minimización de AFD** — Minimiza autómatas deterministas mediante refinamiento de particiones (Hopcroft-like).
- **Tabla de transiciones** — Generada automáticamente en el panel lateral.
- **Importar/Exportar** — JSON, JFLAP XML (.jff), SVG, PNG.
- **Zoom y desplazamiento** — Zoom con rueda (centrado en cursor), arrastre con botón medio.
- **Tema claro/oscuro** — Alternable desde la barra de herramientas.
- **Persistencia** — El estado se guarda automáticamente en localStorage.
- **Deshacer/Rehacer** — Historial completo (Ctrl+Z / Ctrl+Shift+Z).

## Tecnologías

- React 19
- Vite 8
- lucide-react (iconos)
- SVG nativo (sin librerías externas de canvas)

## Uso

```bash
npm install
npm run dev      # Servidor de desarrollo (http://localhost:5173)
npm run build    # Compilación para producción
npm run preview  # Vista previa de la compilación
npm run lint     # Linter
```

## Licencia

MIT
