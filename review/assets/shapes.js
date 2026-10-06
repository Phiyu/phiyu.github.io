/* Bispectrum shape triangle: S(1, x2, x3) for standard templates.
   Templates (up to normalisation), P ∝ k^-3:
     local  : Σ3 1/(ki^3 kj^3)
     equil  : -Σ3 1/(ki^3 kj^3) - 2/(k1k2k3)^2 + Σ6 1/(ki kj^2 kl^3)
     ortho  : -3Σ3 - 8/(k1k2k3)^2 + 3Σ6
     folded : Σ3 + 3/(k1k2k3)^2 - Σ6
   Shape function S = (k1 k2 k3)^2 B. */
(function () {
  'use strict';

  function parts(a, b, c) {
    const s3 = 1 / (a ** 3 * b ** 3) + 1 / (b ** 3 * c ** 3) + 1 / (a ** 3 * c ** 3);
    const p2 = 1 / (a * b * c) ** 2;
    const s6 = 1 / (a * b * b * c ** 3) + 1 / (a * c * c * b ** 3) + 1 / (b * a * a * c ** 3)
             + 1 / (b * c * c * a ** 3) + 1 / (c * a * a * b ** 3) + 1 / (c * b * b * a ** 3);
    return { s3, p2, s6, pre: (a * b * c) ** 2 };
  }
  const T = {
    local:  q => q.pre * q.s3,
    equil:  q => q.pre * (-q.s3 - 2 * q.p2 + q.s6),
    ortho:  q => q.pre * (-3 * q.s3 - 8 * q.p2 + 3 * q.s6),
    folded: q => q.pre * (q.s3 + 3 * q.p2 - q.s6)
  };
  const NAMES = { local: 'Local', equil: 'Equilateral', ortho: 'Orthogonal', folded: 'Folded' };

  const N = 180;               // value grid resolution
  const X2MIN = 0.5, EPS = 0.004;

  function grid(shape) {
    const f = T[shape], out = new Float32Array(N * N);
    let max = 0;
    for (let j = 0; j < N; j++) {
      const x3 = Math.max(EPS, 1 - (j + 0.5) / N);
      for (let i = 0; i < N; i++) {
        const x2 = X2MIN + (1 - X2MIN) * (i + 0.5) / N;
        const v = f(parts(1, x2, x3));
        out[j * N + i] = v;
        if (x3 <= x2 + 0.01 && x2 + x3 >= 0.99 && x3 > 0.12) max = Math.max(max, Math.abs(v));
      }
    }
    for (let k = 0; k < out.length; k++) out[k] = Math.max(-1, Math.min(1, out[k] / max));
    return { values: out, max };
  }

  function hex(c) {
    c = c.trim();
    if (c.startsWith('#')) {
      const n = parseInt(c.length === 4 ? c.slice(1).split('').map(x => x + x).join('') : c.slice(1), 16);
      return [n >> 16 & 255, n >> 8 & 255, n & 255];
    }
    const m = c.match(/\d+(\.\d+)?/g) || [0, 0, 0];
    return m.slice(0, 3).map(Number);
  }

  function mount(root) {
    const canvas = root.querySelector('#shape-canvas');
    const ctx = canvas.getContext('2d');
    const probe = root.querySelector('#shape-probe');
    const tabs = [...root.querySelectorAll('[data-shape]')];
    const off = document.createElement('canvas'); off.width = off.height = N;
    const octx = off.getContext('2d');
    const img = octx.createImageData(N, N);
    const cache = {};
    let cur = new Float32Array(N * N), shown = 'local', anim = 0, hover = null, colors;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      colors = { cool: hex(cs.getPropertyValue('--cool')), warm: hex(cs.getPropertyValue('--warm')), mid: hex(cs.getPropertyValue('--mid')), ink: cs.getPropertyValue('--ink').trim(), muted: cs.getPropertyValue('--muted').trim(), rule: cs.getPropertyValue('--rule').trim() };
    }
    function get(shape) { return cache[shape] || (cache[shape] = grid(shape)); }

    function size() {
      const r = canvas.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(r.width * d); canvas.height = Math.round(r.height * d);
      draw();
    }
    // canvas geometry: x2∈[0.5,1] → [pad, W-pad]; x3∈[0,1] → [H-pad, pad]
    function geom() { const W = canvas.width, H = canvas.height, p = W * 0.02, pr = W * 0.09; return { W, H, p, pr, sx: (W - p - pr) / (1 - X2MIN), sy: H - 2 * p }; }
    const toPx = (g, x2, x3) => [g.p + (x2 - X2MIN) * g.sx, g.H - g.p - x3 * g.sy];

    function paint(vals) {
      const d = img.data, { cool, warm, mid } = colors;
      for (let k = 0; k < vals.length; k++) {
        const v = vals[k], t = Math.pow(Math.abs(v), 0.85), c = v < 0 ? cool : warm;
        d[4 * k] = mid[0] + (c[0] - mid[0]) * t;
        d[4 * k + 1] = mid[1] + (c[1] - mid[1]) * t;
        d[4 * k + 2] = mid[2] + (c[2] - mid[2]) * t;
        d[4 * k + 3] = 255;
      }
      octx.putImageData(img, 0, 0);
    }

    function draw() {
      if (!colors) readColors();
      const g = geom();
      ctx.clearRect(0, 0, g.W, g.H);
      const A = toPx(g, 0.5, 0.5), B = toPx(g, 1, 1), C = toPx(g, 1, 0);
      ctx.save();
      ctx.beginPath(); ctx.moveTo(...A); ctx.lineTo(...B); ctx.lineTo(...C); ctx.closePath();
      ctx.clip();
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(off, g.p, g.p, g.W - g.p - g.pr, g.H - 2 * g.p);
      ctx.restore();
      ctx.lineWidth = Math.max(1, g.W / 400); ctx.strokeStyle = colors.ink; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(...A); ctx.lineTo(...B); ctx.lineTo(...C); ctx.closePath(); ctx.stroke();
      // ticks along the right edge (x3) and bottom edge (x2 + x3 = 1 diagonal has none)
      ctx.fillStyle = colors.muted; ctx.font = `${Math.round(g.W / 42)}px "IBM Plex Sans", sans-serif`;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      [0.25, 0.5, 0.75].forEach(v => { const [x, y] = toPx(g, 1, v); ctx.fillText(v.toFixed(2), x + g.W * 0.022, y); ctx.strokeStyle = colors.ink; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + g.W * 0.012, y); ctx.stroke(); });
      if (hover) {
        const [x, y] = toPx(g, hover.x2, hover.x3);
        ctx.beginPath(); ctx.arc(x, y, g.W / 90, 0, Math.PI * 2);
        ctx.lineWidth = g.W / 260; ctx.strokeStyle = '#fff'; ctx.stroke();
        ctx.lineWidth = g.W / 520; ctx.strokeStyle = colors.ink; ctx.stroke();
      }
    }

    function show(shape) {
      const target = get(shape).values, from = cur.slice();
      shown = shape;
      tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.shape === shape)));
      cancelAnimationFrame(anim);
      if (reduce) { cur = target.slice(); paint(cur); draw(); updateProbe(); return; }
      const t0 = performance.now(), dur = 520;
      const step = now => {
        const u = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - u, 3);
        for (let k = 0; k < cur.length; k++) cur[k] = from[k] + (target[k] - from[k]) * e;
        paint(cur); draw();
        if (u < 1) anim = requestAnimationFrame(step); else updateProbe();
      };
      anim = requestAnimationFrame(step);
    }

    function classify(x2, x3) {
      if (x3 < 0.12) return 'Squeezed';
      if (x2 > 0.9 && x3 > 0.9) return 'Equilateral';
      if (x2 + x3 < 1.08) return 'Flattened';
      if (Math.abs(x2 - x3) < 0.04) return 'Isosceles';
      return 'Scalene';
    }
    function updateProbe() {
      if (!hover) { probe.hidden = true; return; }
      const { x2, x3 } = hover;
      const cx = (1 + x3 * x3 - x2 * x2) / 2, cy = Math.sqrt(Math.max(0, x3 * x3 - cx * cx));
      const s = 0.6 / Math.max(0.6, cy);
      root.querySelector('#probe-tri').setAttribute('points', `0,${0.7} 1,${0.7} ${cx},${0.7 - cy * s}`);
      const v = T[shown](parts(1, x2, x3)) / get(shown).max;
      root.querySelector('#probe-name').textContent = classify(x2, x3) + ' triangle';
      root.querySelector('#probe-vals').textContent = `x₂ = ${x2.toFixed(2)}, x₃ = ${x3.toFixed(2)}, S = ${Math.abs(v) > 9.99 ? (v > 0 ? '>10' : '<−10') : v.toFixed(2).replace('-', '−')}`;
      probe.hidden = false;
      const stage = canvas.parentElement.getBoundingClientRect();
      const r = canvas.getBoundingClientRect(), g = geom();
      const [px, py] = toPx(g, x2, x3).map((v, i) => v / (i ? g.H : g.W) * (i ? r.height : r.width));
      const pw = probe.offsetWidth, ph = probe.offsetHeight;
      let left = px - pw - 18, top = py - ph - 14;
      if (left < 0) left = px + 18;
      if (top < 0) top = py + 14;
      probe.style.transform = `translate(${Math.min(left, stage.width - pw)}px, ${top}px)`;
    }

    function pointer(e) {
      const r = canvas.getBoundingClientRect(), g = geom();
      const X = (e.clientX - r.left) / r.width * g.W, Y = (e.clientY - r.top) / r.height * g.H;
      const x2 = X2MIN + (X - g.p) / g.sx, x3 = (g.H - g.p - Y) / g.sy;
      if (x3 > 0.005 && x3 <= x2 && x2 <= 1 && x2 + x3 >= 1) hover = { x2, x3 }; else hover = null;
      draw(); updateProbe();
    }
    canvas.addEventListener('pointermove', pointer);
    canvas.addEventListener('pointerdown', pointer);
    canvas.addEventListener('pointerleave', () => { hover = null; draw(); updateProbe(); });
    tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.shape)));
    root.querySelector('.shape-tabs').addEventListener('keydown', e => {
      const i = tabs.findIndex(t => t.dataset.shape === shown);
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); show(n.dataset.shape);
    });
    new ResizeObserver(size).observe(canvas);
    window.addEventListener('themechange', () => { readColors(); paint(cur); draw(); });

    readColors(); paint(cur); size();
    setTimeout(() => show('local'), 250);   // one orchestrated reveal: Gaussian → local
    return { show, names: NAMES };
  }

  window.Shapes = { mount, templates: T, parts };
})();
