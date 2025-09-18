## Geometer – Extensión de Chrome (Hola Mundo)

Pequeña extensión MV3 con panel lateral que:
- Abre un side panel al pulsar el icono de la extensión.
- Permite analizar la página activa y:
  - Si el navegador soporta `window.ai.summarizer`, muestra un resumen local.
  - Si no, muestra un conteo de palabras y un preview del texto.

### Estructura
- `extension/manifest.json`: Manifest V3 (service worker + side panel).
- `extension/sw.js`: Abre el panel al hacer click en el icono.
- `extension/sidepanel.html` y `extension/sidepanel.js`: UI y lógica del panel.
- `extension/content.js`: Extrae texto legible de la página activa.

### Requisitos
- Chrome reciente (MV3 + Side Panel).
- Para resumen local (opcional): soporte de `window.ai.summarizer`.

### Cargar en Chrome (modo desarrollador)
1. Abre `chrome://extensions/`.
2. Activa «Developer mode».
3. Clic en «Load unpacked» y selecciona la carpeta `extension` en este repo.
4. Fija el icono si quieres y haz click en él para abrir el side panel.
5. Pulsa «Analyze page» en una pestaña `https://` con contenido de texto.

### Desarrollo
- Edita los archivos dentro de `extension/` y recarga la extensión desde `chrome://extensions/` con el botón de recarga.
- Para inspeccionar:
  - Panel lateral: clic derecho dentro del panel → «Inspect».
  - Service worker: en la tarjeta de la extensión → «Service worker» → «Inspect».

### Captura
![thumbnail](recursos/thumbnail.png)

### Licencia
MIT


