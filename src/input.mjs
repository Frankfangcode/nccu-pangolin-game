export const acceptGameKey = target => target?.tagName === 'CANVAS';
const ACTIONS = ['up', 'down', 'left', 'right', 'curl', 'interact', 'restart', 'tap'];

export function emptyInput() {
  return Object.fromEntries(ACTIONS.map(action => [action, false]));
}

export function reduceInput(state, event) {
  if (event.type === 'blur') return emptyInput();
  if (!ACTIONS.includes(event.action)) return state;
  if (event.type === 'release' && ['interact', 'restart', 'tap'].includes(event.action)) return state;
  return { ...state, [event.action]: event.type === 'press' };
}

function keyAction(key) {
  const k = key.toLowerCase();
  if (k === 'arrowup' || k === 'w') return 'up';
  if (k === 'arrowdown' || k === 's') return 'down';
  if (k === 'arrowleft' || k === 'a') return 'left';
  if (k === 'arrowright' || k === 'd') return 'right';
  if (k === 'c' || k === 'shift') return 'curl';
  if (k === 'e' || k === ' ') return 'interact';
  if (k === 'r') return 'restart';
  return null;
}

export function controlAt(x, y, width, height) {
  const controls = [
    ['up', 94, height - 174],
    ['down', 94, height - 86],
    ['left', 50, height - 130],
    ['right', 138, height - 130],
    ['interact', width - 68, height - 176],
    ['curl', width - 68, height - 91],
  ];
  for (const [action, cx, cy] of controls) {
    if (Math.hypot(x - cx, y - cy) <= 36) return action;
  }
  return 'tap';
}

export function createInput(canvas) {
  let state = emptyInput();
  const keydown = event => {
    if(!acceptGameKey(event.target))return;
    const action = keyAction(event.key);
    if (!action) return;
    event.preventDefault();
    state = reduceInput(state, { type: 'press', action });
    state = reduceInput(state, { type: 'press', action: 'tap' });
  };
  const keyup = event => {
    const action = keyAction(event.key);
    if (!action) return;
    state = reduceInput(state, { type: 'release', action });
  };
  const focus = () => canvas.focus();
  const blur = () => { state = emptyInput(); };
  window.addEventListener('keydown', keydown);
  window.addEventListener('keyup', keyup);
  window.addEventListener('blur', blur);
  canvas.addEventListener('blur', blur);
  canvas.addEventListener('pointerdown', focus);



  return {
    read() {
      const result = { ...state };
      state.interact = false;
      state.restart = false;
      state.tap = false;
      return result;
    },
    destroy() {
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      window.removeEventListener('blur', blur);
      canvas.removeEventListener('blur', blur);
      canvas.removeEventListener('pointerdown', focus);
    },
  };
}
