/* Handedness of a tetrahedron of four tracers.
   Rotations (drag) never change the sign of r1·(r2×r3); a reflection does,
   and passes through a coplanar configuration on the way. The parity-odd
   4PCF / trispectrum measures the excess of one handedness over the other. */
(function () {
  'use strict';

  const BASE = [[1.0, -0.25, -0.35], [-0.2, 1.0, -0.3], [0.15, 0.25, 1.0]];   // r1, r2, r3 from vertex 0

  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  function rot(yaw, pitch) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    return v => { const x = cy * v[0] + sy * v[2], z = -sy * v[0] + cy * v[2]; return [x, cp * v[1] - sp * z, sp * v[1] + cp * z]; };
  }

  function mount(root) {
    const canvas = root.querySelector('#tetra-canvas'), ctx = canvas.getContext('2d');
    const btnFlip = root.querySelector('[data-act="reflect"]'), btnReset = root.querySelector('[data-act="reset"]');
    const out = root.querySelector('#tetra-read');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let yaw = -0.6, pitch = -0.35, m = 1, target = 1, spin = !reduce, drag = null, colors, raf = 0, last = 0;

    function readColors() {
      const cs = getComputedStyle(document.documentElement), g = n => cs.getPropertyValue(n).trim();
      colors = { cool: g('--cool'), warm: g('--warm'), ink: g('--ink'), ink2: g('--ink-2'), muted: g('--muted'), surface: g('--surface'), paper: g('--paper') };
    }
    function size() { const r = canvas.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); canvas.width = Math.round(r.width * d); canvas.height = Math.round(r.height * d); draw(); }

    function points() {
      const vs = BASE.map(v => [m * v[0], v[1], v[2]]);
      const all = [[0, 0, 0], ...vs];
      const c = all.reduce((a, p) => [a[0] + p[0] / 4, a[1] + p[1] / 4, a[2] + p[2] / 4], [0, 0, 0]);
      return { local: all.map(p => sub(p, c)), triple: dot(vs[0], cross(vs[1], vs[2])) };
    }

    function draw() {
      if (!colors) readColors();
      const W = canvas.width, H = canvas.height, s = Math.min(W, H) * 0.42, R = rot(yaw, pitch);
      const { local, triple } = points(), t0 = dot(BASE[0], cross(BASE[1], BASE[2]));
      const hand = triple / Math.abs(t0);                       // +1 right-handed, -1 left-handed
      const P = local.map(p => { const q = R(p), f = 3.2 / (3.2 + q[2]); return { x: W / 2 + q[0] * s * f, y: H / 2 - q[1] * s * f, z: q[2], f }; });
      ctx.clearRect(0, 0, W, H);

      // faces, back to front, tinted by handedness
      const faces = [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]].map(f => ({ f, z: (P[f[0]].z + P[f[1]].z + P[f[2]].z) / 3 })).sort((a, b) => b.z - a.z);
      const tint = hand >= 0 ? colors.cool : colors.warm, a = Math.min(1, Math.abs(hand));
      faces.forEach(({ f }) => {
        ctx.beginPath(); ctx.moveTo(P[f[0]].x, P[f[0]].y); ctx.lineTo(P[f[1]].x, P[f[1]].y); ctx.lineTo(P[f[2]].x, P[f[2]].y); ctx.closePath();
        ctx.globalAlpha = 0.07 + 0.12 * a; ctx.fillStyle = tint; ctx.fill(); ctx.globalAlpha = 1;
      });
      // edges between the three outer points (thin), then the separation vectors r1..r3 (thick)
      ctx.lineCap = 'round';
      [[1, 2], [2, 3], [1, 3]].forEach(([i, j]) => { ctx.strokeStyle = colors.muted; ctx.lineWidth = W / 420; ctx.setLineDash([W / 140, W / 140]); ctx.beginPath(); ctx.moveTo(P[i].x, P[i].y); ctx.lineTo(P[j].x, P[j].y); ctx.stroke(); });
      ctx.setLineDash([]);
      [1, 2, 3].forEach(i => {
        const A = P[0], B = P[i], ang = Math.atan2(B.y - A.y, B.x - A.x), hl = W / 34;
        const ex = B.x - Math.cos(ang) * W / 60, ey = B.y - Math.sin(ang) * W / 60;
        ctx.strokeStyle = colors.ink; ctx.fillStyle = colors.ink; ctx.lineWidth = W / 200;
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ex + Math.cos(ang) * hl * 0.2, ey + Math.sin(ang) * hl * 0.2);
        ctx.lineTo(ex - Math.cos(ang - 0.42) * hl, ey - Math.sin(ang - 0.42) * hl);
        ctx.lineTo(ex - Math.cos(ang + 0.42) * hl, ey - Math.sin(ang + 0.42) * hl); ctx.closePath(); ctx.fill();
      });
      // vertices
      const order = P.map((p, i) => [p, i]).sort((a, b) => b[0].z - a[0].z);
      order.forEach(([p, i]) => {
        const r = W / 42 * p.f;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? colors.ink : colors.surface; ctx.fill();
        ctx.lineWidth = W / 260; ctx.strokeStyle = colors.ink; ctx.stroke();
        if (i) {
          ctx.fillStyle = colors.ink; ctx.font = `italic ${Math.round(W / 26)}px "Source Serif 4", Georgia, serif`;
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          const dx = p.x - P[0].x, dy = p.y - P[0].y, n = Math.hypot(dx, dy) || 1;
          ctx.fillText('r', p.x + dx / n * r * 2.2 - W / 70, p.y + dy / n * r * 2.2);
          ctx.font = `${Math.round(W / 40)}px "Source Serif 4", Georgia, serif`;
          ctx.fillText(String(i), p.x + dx / n * r * 2.2 - W / 70 + W / 48, p.y + dy / n * r * 2.2 + W / 70);
        }
      });
      const v = (hand).toFixed(2).replace('-', '−');
      const label = Math.abs(hand) < 0.03 ? 'Coplanar: no handedness' : hand > 0 ? 'Right-handed' : 'Left-handed';
      out.innerHTML = `<strong>${label}</strong><span>r₁ · (r₂ × r₃) = ${hand > 0 ? '+' : ''}${v}</span>`;
      out.dataset.hand = Math.abs(hand) < 0.03 ? '0' : hand > 0 ? '+' : '-';
    }

    function loop(now) {
      const dt = Math.min(48, now - (last || now)); last = now;
      let moving = false;
      if (spin && !drag) { yaw += dt * 0.00035; moving = true; }
      if (Math.abs(target - m) > 1e-3) {
        m += (target - m) * (reduce ? 1 : Math.min(1, dt * 0.006)); moving = true;
        if (Math.abs(target - m) <= 1e-3) m = target;
      }
      draw();
      raf = moving || drag ? requestAnimationFrame(loop) : 0;
    }
    const kick = () => { if (!raf) { last = 0; raf = requestAnimationFrame(loop); } };

    canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; canvas.setPointerCapture(e.pointerId); spin = false; kick(); });
    canvas.addEventListener('pointermove', e => {
      if (!drag) return;
      yaw = drag.yaw + (e.clientX - drag.x) * 0.01;
      pitch = Math.max(-1.4, Math.min(1.4, drag.pitch + (e.clientY - drag.y) * 0.01));
    });
    const end = () => { drag = null; };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('keydown', e => {
      const d = { ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, -0.15], ArrowDown: [0, 0.15] }[e.key];
      if (!d) return; e.preventDefault(); spin = false; yaw += d[0]; pitch = Math.max(-1.4, Math.min(1.4, pitch + d[1])); draw();
    });
    btnFlip.addEventListener('click', () => { target = -target; btnFlip.setAttribute('aria-pressed', String(target < 0)); kick(); });
    btnReset.addEventListener('click', () => { yaw = -0.6; pitch = -0.35; target = 1; btnFlip.setAttribute('aria-pressed', 'false'); spin = !reduce; kick(); });

    new ResizeObserver(size).observe(canvas);
    addEventListener('themechange', () => { readColors(); draw(); });
    readColors(); size(); kick();
  }

  window.Tetra = { mount };
})();
