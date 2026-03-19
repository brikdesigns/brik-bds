import { generateRamp, isValidHex, normalizeHex, STOPS, type ColorRamp } from './color-engine';

// ─── State ────────────────────────────────────────────────────────────────────

let currentRamp: ColorRamp | null = null;
let showCmyk = false;

// ─── DOM references ───────────────────────────────────────────────────────────

const hexInput = document.getElementById('hex-input') as HTMLInputElement;
const nameInput = document.getElementById('name-input') as HTMLInputElement;
const colorPreview = document.getElementById('color-preview') as HTMLDivElement;
const swatchGrid = document.getElementById('swatch-grid') as HTMLDivElement;
const createBtn = document.getElementById('create-btn') as HTMLButtonElement;
const toggleCmyk = document.getElementById('toggle-cmyk') as HTMLButtonElement;
const statusMsg = document.getElementById('status-msg') as HTMLDivElement;
const errorMsg = document.getElementById('error-msg') as HTMLDivElement;

// ─── Color generation ─────────────────────────────────────────────────────────

function update() {
  const rawHex = hexInput.value.trim();
  statusMsg.textContent = '';
  errorMsg.textContent = '';

  if (!rawHex || rawHex === '#') {
    clearSwatches();
    return;
  }

  if (!isValidHex(rawHex)) {
    errorMsg.textContent = 'Enter a valid hex code (e.g. #4665F5)';
    clearSwatches();
    return;
  }

  const hex = normalizeHex(rawHex);
  colorPreview.style.backgroundColor = hex;

  currentRamp = generateRamp(nameInput.value.trim() || 'color', hex);
  if (currentRamp) renderSwatches(currentRamp);
}

function clearSwatches() {
  currentRamp = null;
  swatchGrid.innerHTML = '';
  createBtn.disabled = true;
  colorPreview.style.backgroundColor = 'transparent';
}

function renderSwatches(ramp: ColorRamp) {
  swatchGrid.innerHTML = '';

  ramp.stops.forEach((stop) => {
    const isBase = stop.stop === 500;
    const row = document.createElement('div');
    row.className = 'swatch-row' + (isBase ? ' swatch-row--base' : '');

    // Determine readable text color (black or white) based on lightness
    const isLight = parseInt(stop.hex.slice(1, 3), 16) * 0.299
      + parseInt(stop.hex.slice(3, 5), 16) * 0.587
      + parseInt(stop.hex.slice(5, 7), 16) * 0.114 > 128;
    const textColor = isLight ? '#1a1a1a' : '#ffffff';

    row.innerHTML = `
      <div class="swatch" style="background-color:${stop.hex}; color:${textColor}">
        <span class="swatch__stop">${stop.stop}</span>
        ${isBase ? '<span class="swatch__dot">●</span>' : ''}
      </div>
      <div class="swatch__info">
        <span class="swatch__hex">${stop.hex.toUpperCase()}</span>
        ${showCmyk
          ? `<span class="swatch__cmyk">C${stop.cmyk.c} M${stop.cmyk.m} Y${stop.cmyk.y} K${stop.cmyk.k}</span>`
          : `<span class="swatch__rgb">rgb(${stop.rgb.r}, ${stop.rgb.g}, ${stop.rgb.b})</span>`
        }
      </div>
    `;

    swatchGrid.appendChild(row);
  });

  createBtn.disabled = false;
  createBtn.textContent = `Create ${STOPS.length} variables → Primitives`;
}

// ─── Event listeners ──────────────────────────────────────────────────────────

hexInput.addEventListener('input', update);
hexInput.addEventListener('blur', () => {
  const raw = hexInput.value.trim();
  if (!raw) return;
  const withHash = raw.startsWith('#') ? raw : '#' + raw;
  if (isValidHex(withHash)) {
    hexInput.value = normalizeHex(withHash);
  }
  update();
});

nameInput.addEventListener('input', () => {
  if (currentRamp) {
    currentRamp.name = nameInput.value.trim() || 'color';
    renderSwatches(currentRamp);
  }
});

toggleCmyk.addEventListener('click', () => {
  showCmyk = !showCmyk;
  toggleCmyk.textContent = showCmyk ? 'Show RGB' : 'Show CMYK';
  if (currentRamp) renderSwatches(currentRamp);
});

createBtn.addEventListener('click', () => {
  if (!currentRamp) return;

  const colorName = nameInput.value.trim() || 'color';
  createBtn.disabled = true;
  createBtn.textContent = 'Creating…';

  parent.postMessage(
    {
      pluginMessage: {
        type: 'create-variables',
        colorName,
        stops: currentRamp.stops.map((s) => ({
          stop: s.stop,
          hex: s.hex,
          rgb: s.rgb,
        })),
      },
    },
    '*'
  );
});

// Run on load in case the field is pre-populated
update();

// ─── Messages from plugin main thread ────────────────────────────────────────

window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  if (!msg) return;

  if (msg.type === 'success') {
    const parts: string[] = [];
    if (msg.created > 0) parts.push(`${msg.created} created`);
    if (msg.updated > 0) parts.push(`${msg.updated} updated`);
    statusMsg.textContent = `✓ color/${msg.colorName}/ — ${parts.join(', ')} in Primitives`;
    createBtn.disabled = false;
    createBtn.textContent = `Create ${STOPS.length} variables → Primitives`;
  }

  if (msg.type === 'error') {
    errorMsg.textContent = `Error: ${msg.message}`;
    createBtn.disabled = false;
    createBtn.textContent = `Create ${STOPS.length} variables → Primitives`;
  }
};
