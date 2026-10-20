// Close-up prank panels: the pangolin's claw reaches into frame, the player
// taps the target, a short reaction plays, then the prank counts as done.
const CLAW = `<g class="claw" aria-hidden="true">
 <path d="M10 6 C40 -4 92 30 120 72 L150 120 L70 150 L30 70 Z" fill="#9a6a43"/>
 <path d="M28 40 q14 -10 28 0 M44 62 q14 -10 28 0 M60 84 q14 -10 28 0 M48 30 q14 -10 28 0 M64 52 q14 -10 28 0 M80 74 q14 -10 28 0" stroke="#6e4a2e" stroke-width="5" fill="none" stroke-linecap="round"/>
 <path d="M14 10 l-26 -26 l8 30 Z M4 26 l-30 -12 l20 24 Z M24 0 l-14 -32 l-2 32 Z" fill="#fff1d2" stroke="#6e4a2e" stroke-width="2" stroke-linejoin="round"/>
</g>`;

export const SCENES = {
  hall: {
    target: { x: 200, y: 112 }, cta: '換上搞怪表情', hint: '點一下立牌上的臉',
    svg: `<rect width="400" height="260" fill="#c9714f"/>
 <g stroke="#a85a3c" stroke-width="3">${Array.from({ length: 9 }, (_, i) => `<line x1="0" x2="400" y1="${i * 30 + 15}" y2="${i * 30 + 15}"/>`).join('')}</g>
 <rect y="214" width="400" height="46" fill="#8fbf5a"/>
 <rect x="168" y="170" width="10" height="56" fill="#244638"/><rect x="222" y="170" width="10" height="56" fill="#244638"/>
 <rect x="128" y="40" width="144" height="140" rx="18" fill="#fff8e8" stroke="#244638" stroke-width="5"/>
 <text x="200" y="168" text-anchor="middle" font-size="15" font-weight="700" fill="#244638">四維堂 歡迎參觀</text>
 <g class="face plain"><circle cx="178" cy="98" r="7" fill="#244638"/><circle cx="222" cy="98" r="7" fill="#244638"/><line x1="182" x2="218" y1="130" y2="130" stroke="#244638" stroke-width="5" stroke-linecap="round"/></g>
 <g class="face silly"><path d="M170 98 q8 -10 16 0" stroke="#244638" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="222" cy="98" r="10" fill="#fff" stroke="#244638" stroke-width="4"/><circle cx="225" cy="100" r="5" fill="#244638"/><path d="M176 120 q24 30 48 0 Z" fill="#244638"/><path d="M196 132 q8 18 16 0 Z" fill="#e8738a"/></g>`,
  },
  library: {
    target: { x: 228, y: 150 }, cta: '按下紙青蛙箱', hint: '點一下箱子上的紅色按鈕',
    svg: `<rect width="400" height="260" fill="#efe3c6"/>
 <g>${Array.from({ length: 14 }, (_, i) => `<rect x="${12 + i * 27}" y="${20 + (i % 3) * 6}" width="22" height="${92 - (i % 3) * 6}" fill="${['#244638', '#b94d32', '#e9a24d', '#52664a'][i % 4]}" rx="3"/>`).join('')}</g>
 <rect x="0" y="112" width="400" height="10" fill="#8a6440"/>
 <rect y="196" width="400" height="64" fill="#d5c39c"/>
 <g class="frog"><path d="M170 150 l30 -34 l30 34 Z" fill="#6fbf4f" stroke="#2f6b33" stroke-width="3" stroke-linejoin="round"/><path d="M178 150 l22 -16 l22 16" fill="#8fd96a" stroke="#2f6b33" stroke-width="2"/><circle cx="190" cy="128" r="4" fill="#244638"/><circle cx="210" cy="128" r="4" fill="#244638"/></g>
 <path d="M140 150 h120 v62 h-120 Z" fill="#c79a5b" stroke="#8a6440" stroke-width="4"/>
 <path d="M140 150 l18 -18 h84 l18 18" fill="#d9ae70" stroke="#8a6440" stroke-width="4" stroke-linejoin="round"/>
 <text x="186" y="186" text-anchor="middle" font-size="13" font-weight="700" fill="#5d3f22">請勿按</text>
 <rect x="216" y="164" width="24" height="10" rx="3" fill="#7a1f12"/><circle class="button" cx="228" cy="164" r="11" fill="#d23f2c" stroke="#7a1f12" stroke-width="3"/>`,
  },
  field: {
    target: { x: 172, y: 182 }, cta: '把鴨子推上看台', hint: '點一下跑道上的鴨子布偶',
    svg: `<rect width="400" height="260" fill="#b94d32"/>
 <g fill="#c9c7bd">${Array.from({ length: 4 }, (_, i) => `<rect x="0" y="${i * 18}" width="400" height="14"/>`).join('')}</g>
 <rect y="74" width="400" height="8" fill="#244638"/>
 <g stroke="#fff8e8" stroke-width="4">${[120, 170, 220].map(y => `<line x1="0" x2="400" y1="${y}" y2="${y}"/>`).join('')}</g>
 <g class="duck"><ellipse cx="172" cy="190" rx="34" ry="24" fill="#f7cf3f" stroke="#a57b10" stroke-width="3"/><circle cx="196" cy="160" r="18" fill="#f7cf3f" stroke="#a57b10" stroke-width="3"/><path d="M210 158 l18 4 l-18 6 Z" fill="#e9862e"/><circle cx="200" cy="154" r="3.5" fill="#244638"/><path d="M150 186 q16 -14 30 0" stroke="#a57b10" stroke-width="3" fill="none"/></g>`,
  },
};

export function createCloseup(dialog) {
  const stage = dialog.querySelector('.closeup-stage');
  const title = dialog.querySelector('#closeup-title');
  const place = dialog.querySelector('#closeup-place');
  const hint = dialog.querySelector('#closeup-hint');
  const act = dialog.querySelector('#closeup-act');
  let phase = 'idle', onDone = null, timer = 0, prank = null;
  const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function perform() {
    if (phase === 'ready') {
      phase = 'reaching';
      stage.classList.add('reach');
      act.disabled = true;
      timer = setTimeout(() => {
        stage.classList.add('done');
        hint.textContent = prank.message ?? '搞怪成功！';
        act.textContent = '溜走 →';
        act.disabled = false;
        act.focus();
        phase = 'done';
      }, still() ? 0 : 520);
    } else if (phase === 'done') {
      dialog.close();
    }
  }
  stage.addEventListener('click', perform);
  act.addEventListener('click', perform);
  dialog.addEventListener('keydown', e => {
    if (e.repeat) return;
    if (e.key.toLowerCase() === 'e' || e.key === ' ') { e.preventDefault(); perform(); }
  });
  dialog.addEventListener('close', () => {
    clearTimeout(timer);
    const finished = phase === 'done';
    phase = 'idle';
    const done = onDone; onDone = null;
    done?.(finished);
  });

  return {
    dialog,
    open(p, callback) {
      const scene = SCENES[p.id];
      if (!scene) { callback(true); return; }
      prank = p; onDone = callback; phase = 'ready';
      stage.className = `closeup-stage scene-${p.id}`;
      stage.style.setProperty('--tx', `${scene.target.x}px`);
      stage.style.setProperty('--ty', `${scene.target.y}px`);
      stage.innerHTML = `<svg viewBox="0 0 400 260" role="img" aria-label="${p.title}特寫">${scene.svg}${CLAW}</svg>`;
      place.textContent = `${p.title} · 近距離`;
      title.textContent = p.action;
      hint.textContent = window.matchMedia('(pointer: fine)').matches ? `${scene.hint}，或按 E` : scene.hint;
      act.textContent = `伸出爪子 · ${scene.cta}`;
      act.disabled = false;
      dialog.showModal();
      act.focus();
    },
  };
}
