(() => {
const { tl, el, add, scene, show, rnd, onSeek, end, stage } = K;
const PAPER = '#F5F2EA', INK = '#20242B', OR = '#F26A1B', CON = '#BFC2C4';
const W = 1200, HH = 630;
const cv = add(stage, el('<canvas id="cv" width="1200" height="630"></canvas>'));
const ctx = cv.getContext('2d');
// paper tooth, generated once from the seeded rnd
(() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const d = x.createImageData(256, 256);
  for (let i = 0; i < 256 * 256; i++) { const v = 222 + Math.floor(rnd() * 33); d.data[i * 4] = v; d.data[i * 4 + 1] = v; d.data[i * 4 + 2] = v - 4; d.data[i * 4 + 3] = 255; }
  x.putImageData(d, 0, 0); const p = add(stage, el('<div id="paper"></div>')); p.style.backgroundImage = `url(${c.toDataURL()})`; })();

const Hh = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7 + 7.3) * 43758.5453; return v - Math.floor(v); };
const C30 = 0.866, S30 = 0.5;
let cam = { ox: 600, oy: 500, S: 60, k: 0 };
const P = null;
const pr = (x, y, z) => [cam.ox + (x - y) * C30 * cam.S + cam.k * z * cam.S, cam.oy + (x + y) * S30 * cam.S - z * cam.S];
let lid = 0, BOIL = 0;
function hl(a, b, over = 3, w = 1.3, col = INK) {
  const id = ++lid; const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
  const j = (n) => (Hh(id, n + BOIL * 9) - 0.5);
  const o1 = over * (0.4 + Hh(id, 3)), o2 = over * (0.4 + Hh(id, 4));
  const x1 = a[0] - ux * o1 + j(1) * 1.1, y1 = a[1] - uy * o1 + j(2) * 1.1, x2 = b[0] + ux * o2 + j(5) * 1.1, y2 = b[1] + uy * o2 + j(6) * 1.1;
  const bow = j(7) * Math.min(3, L * 0.012);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1 + x2) / 2 - uy * bow, (y1 + y2) / 2 + ux * bow, x2, y2);
  ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.stroke();
}
function quad(pts, fill) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } }
function hatch(pts, gap = 7, col = INK, w = 0.8, ang = 1) {
  ctx.save(); quad(pts); ctx.clip();
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), h = y1 - y0;
  ctx.lineWidth = w; ctx.strokeStyle = col; ctx.beginPath();
  for (let x = x0 - h; x < x1 + h; x += gap) { ctx.moveTo(x, y1); ctx.lineTo(x + h * ang, y0); }
  ctx.stroke(); ctx.restore();
}
function outline(pts, over = 3, w = 1.3) { for (let i = 0; i < pts.length; i++) hl(pts[i], pts[(i + 1) % pts.length], over, w); }

// ---- the small hand-built structure
const BOX = [
  { x0: -1.7, x1: 1.7, y0: -1.7, y1: 1.7, z0: 0, z1: 0.28, f: CON, h: 0 },
  { x0: -1.1, x1: 1.1, y0: -1.1, y1: 1.1, z0: 0.28, z1: 2.1, f: PAPER, h: 1 },
  { x0: -0.95, x1: 0.45, y0: -0.4, y1: 1.0, z0: 2.1, z1: 3.25, f: CON, h: 0 },
  { x0: -0.45, x1: 0.6, y0: -0.6, y1: 0.45, z0: 3.25, z1: 4.05, f: PAPER, h: 1 },
];
function structure(shadow = true) {
  if (shadow) { const k = cam.k; cam.k = 0; hatch([pr(-1.7, 1.7, 0), pr(1.7, 1.7, 0), pr(-0.6, 4.6, 0), pr(-4.2, 4.2, 0), pr(-3.4, 1.9, 0)], 6, INK, 0.7, -1.6); cam.k = k; }
  BOX.forEach((b) => {
    const top = [pr(b.x0, b.y0, b.z1), pr(b.x1, b.y0, b.z1), pr(b.x1, b.y1, b.z1), pr(b.x0, b.y1, b.z1)];
    const rt = [pr(b.x1, b.y0, b.z0), pr(b.x1, b.y1, b.z0), pr(b.x1, b.y1, b.z1), pr(b.x1, b.y0, b.z1)];
    const lf = [pr(b.x0, b.y1, b.z0), pr(b.x1, b.y1, b.z0), pr(b.x1, b.y1, b.z1), pr(b.x0, b.y1, b.z1)];
    quad(top, b.f === CON ? '#CDD0D1' : PAPER); quad(rt, b.f); quad(lf, b.f);
    if (b.h) hatch(lf, 6, INK, 0.7); else hatch(lf, 9, INK, 0.6);
    outline(top, 4); outline(rt, 4); outline(lf, 4);
  });
  // door (left face of block 1) and window (right face)
  const d = [pr(-0.35, 1.1, 0.28), pr(0.3, 1.1, 0.28), pr(0.3, 1.1, 1.35), pr(-0.35, 1.1, 1.35)]; quad(d, INK);
  const wn = [pr(1.1, -0.5, 1.0), pr(1.1, 0.25, 1.0), pr(1.1, 0.25, 1.65), pr(1.1, -0.5, 1.65)]; quad(wn, PAPER); outline(wn, 2, 1.1);
  hl(pr(1.1, -0.125, 1.0), pr(1.1, -0.125, 1.65), 0, 1); hl(pr(1.1, -0.5, 1.325), pr(1.1, 0.25, 1.325), 0, 1);
  // roof
  const ap = pr(0.075, -0.075, 4.95), r1 = pr(0.6, -0.6, 4.05), r2 = pr(0.6, 0.45, 4.05), r3 = pr(-0.45, 0.45, 4.05);
  quad([r1, r2, ap], PAPER); quad([r3, r2, ap], CON); hatch([r3, r2, ap], 6, INK, 0.7);
  hl(r1, r2, 3); hl(r2, r3, 3); hl(r1, ap, 3); hl(r2, ap, 3); hl(r3, ap, 3);
  // pennant
  const f0 = pr(0.075, -0.075, 5.75);
  hl(ap, f0, 2, 1.5);
  ctx.beginPath(); ctx.moveTo(f0[0], f0[1]); ctx.lineTo(f0[0] + 0.62 * cam.S, f0[1] + 0.2 * cam.S); ctx.lineTo(f0[0], f0[1] + 0.42 * cam.S); ctx.closePath(); ctx.fillStyle = OR; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = INK; ctx.stroke();
}
function ground() {
  const g = [pr(-4.6, -4.6, 0), pr(4.6, -4.6, 0), pr(4.6, 4.6, 0), pr(-4.6, 4.6, 0)];
  ctx.setLineDash([10, 7]); ctx.lineWidth = 0.9; ctx.strokeStyle = INK; quad(g); ctx.stroke(); ctx.setLineDash([]);
  // corner ticks
  g.forEach((p) => { ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, 6.3); ctx.lineWidth = 1; ctx.stroke(); });
}
function tube(a, b, w) {
  ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineWidth = w + 2.2; ctx.strokeStyle = INK; ctx.stroke();
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
  ctx.beginPath(); ctx.moveTo(a[0] + dx / L * 1.2, a[1] + dy / L * 1.2); ctx.lineTo(b[0] - dx / L * 1.2, b[1] - dy / L * 1.2); ctx.lineWidth = w; ctx.strokeStyle = OR; ctx.stroke();
}
function clampAt(p, s) { ctx.fillStyle = PAPER; ctx.strokeStyle = INK; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.rect(p[0] - s, p[1] - s, 2 * s, 2 * s); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(p[0], p[1], s * 0.38, 0, 6.3); ctx.fillStyle = INK; ctx.fill(); }

// ---- scaffolding members
const M = []; const BEATS = [-0.4, -0.22, -0.08, 0.1, 0.3, 0.42, 0.65, 0.8, 0.95, 1.2, 1.32, 1.5, 1.72, 1.85, 2.0, 2.12, 2.25];
const snap = (t) => { let b = BEATS[0]; BEATS.forEach((x) => { if (x <= t) b = x; }); return b; };
const TOP = 6.5, LIFT = [1.45, 2.9, 4.35, 5.8];
const ringPts = (r, n) => { const o = []; const st = (2 * r) / n; for (let i = 0; i < n; i++) o.push([-r + i * st, -r]); for (let i = 0; i < n; i++) o.push([r, -r + i * st]); for (let i = 0; i < n; i++) o.push([r - i * st, r]); for (let i = 0; i < n; i++) o.push([-r, r - i * st]); return o; };
const inner = ringPts(2.3, 2), outer = ringPts(3.7, 3);
const mem = (type, a, b, tr) => M.push({ type, a, b, tr: snap(tr + (rnd() - 0.5) * 0.16), d: (a[0] + a[1] + b[0] + b[1]) / 2 + (a[2] + b[2]) * 0.001, r1: rnd(), r2: rnd(), r3: rnd() });
[inner, outer].forEach((ring, ri) => {
  ring.forEach((p, i) => {
    const q = ring[(i + 1) % ring.length];
    mem('std', [p[0], p[1], 0], [p[0], p[1], TOP - ri * 0.5 + (i % 2) * 0.3], (ri ? 1.65 : 2.05) + rnd() * 0.25);
    LIFT.forEach((z, li) => { mem('led', [p[0], p[1], z], [q[0], q[1], z], 1.45 - li * 0.33 + rnd() * 0.2 - (ri ? 0.1 : 0)); });
    if (ri && i % 2 === 0) LIFT.forEach((z, li) => { if ((li + i / 2) % 2 < 1) mem('dia', [p[0], p[1], z - 1.45], [q[0], q[1], z], -0.4 + rnd() * 0.85); });
  });
});
// transoms inner→outer at corners, and plank decks on the two near sides
[[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sy]) => LIFT.forEach((z, li) => mem('led', [2.3 * sx, 2.3 * sy, z], [3.7 * sx, 3.7 * sy, z], 1.2 - li * 0.3)));
[[1, 0], [3, 1], [0, 1], [2, 0]].forEach(([li, side], n) => {
  const z = LIFT[li] + 0.06; const pts = side ? [[2.35, -2.3, z], [3.65, -2.3, z], [3.65, 2.3, z], [2.35, 2.3, z]] : [[-2.3, 2.35, z], [2.3, 2.35, z], [2.3, 3.65, z], [-2.3, 3.65, z]];
  M.push({ type: 'plk', pts, a: pts[0], b: pts[2], tr: snap(0.2 + n * 0.22), d: (pts[0][0] + pts[0][1] + pts[2][0] + pts[2][1]) / 2 - 0.5, r1: rnd(), r2: rnd(), r3: rnd() });
});
M.sort((p, q) => p.d - q.d);

function drawMember(m, ts) {
  const a = pr(...m.a), b = pr(...m.b); const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const u = ts - m.tr; let ox = 0, oy = 0, rot = 0;
  if (u >= 0) {
    let dx = mx - 600, dy = my - 330; const L = Math.hypot(dx, dy) || 1; const ang = Math.atan2(dy / L, dx / L) + (m.r1 - 0.5) * 1.3;
    const sp = 1500 + m.r2 * 1300; ox = Math.cos(ang) * sp * u; oy = Math.sin(ang) * sp * u - 500 * u + 1500 * u * u * (m.type === 'std' ? -1 : 1) * 0.5;
    if (m.type === 'std') oy -= 1500 * u; rot = (m.r3 - 0.5) * 16 * u;
    if (Math.abs(ox) > 1900 || Math.abs(oy) > 1500) return;
  } else if (u > -0.16) rot = (Math.round(ts * 20) % 2 ? 1 : -1) * 0.035 * (m.type === 'std' ? 0.4 : 1);
  ctx.save(); ctx.translate(mx + ox, my + oy); ctx.rotate(rot); ctx.translate(-mx, -my);
  const w = Math.max(3.4, 0.082 * cam.S);
  if (m.type === 'plk') {
    const q = m.pts.map((p) => pr(...p)); quad(q, OR); ctx.lineWidth = 1.4; ctx.strokeStyle = INK; ctx.stroke();
    for (let i = 1; i < 4; i++) { const f = i / 4; ctx.beginPath(); ctx.moveTo(q[0][0] + (q[1][0] - q[0][0]) * f, q[0][1] + (q[1][1] - q[0][1]) * f); ctx.lineTo(q[3][0] + (q[2][0] - q[3][0]) * f, q[3][1] + (q[2][1] - q[3][1]) * f); ctx.lineWidth = 0.9; ctx.stroke(); }
  } else {
    tube(a, b, m.type === 'dia' ? w * 0.8 : w);
    if (m.type === 'led') {
      if (u >= 0) { ctx.restore(); ctx.save(); const g = u * (m.r2 + 0.6); ctx.translate(a[0] + ox * 0.55 + (m.r3 - 0.5) * 300 * u, a[1] + oy * 0.4 + 2600 * g * g - 500 * g); ctx.rotate(u * 26 * (m.r1 - 0.4)); clampAt([0, 0], w * 0.95); }
      else clampAt(a, w * 0.95);
    }
  }
  ctx.restore();
}
function sheet() { ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.strokeRect(16.5, 16.5, W - 33, HH - 33); }
const ease = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };

// ---- text layers
const sA = scene('sA'), sB = scene('sB'), sC = scene('sC'); show(sA, 0, 3); show(sB, 3, 6); show(sC, 6);
add(sA, el('<div class="tb"><i></i>What I’m building</div>'));
const qm = add(sB, el('<div class="qm">“</div>'));
const q = add(sB, el('<div class="q"><span>AI</span> <span>should</span> <span class="or">scaffold</span><br><span>thinking,</span> <span>not</span><br><span>surrender</span> <span>it.</span></div>'));
const an = add(sB, el('<div class="an">What kids build changes who they become.</div>'));
const qs = [...q.querySelectorAll('span')]; const QT = [3.12, 3.24, 3.48, 3.86, 3.98, 4.26, 4.38];
tl.set(qm, { opacity: 1 }, 3.05);
qs.forEach((s, i) => tl.set(s, { opacity: 1 }, QT[i]));
tl.set(an, { opacity: 1 }, 5.05);
const nm = add(sC, el('<div class="name"><div>Sunny</div><div>Patneedi</div></div>'));
const roles = add(sC, el('<div class="roles"><b>Founder of SayMake</b> · Human–AI learning systems ·<br>Open standards, agent infrastructure, and AI safety</div>'));
const belief = add(sC, el('<div class="belief">“AI should scaffold thinking, not surrender it.”</div>'));
tl.set(nm.children[0], { opacity: 1 }, 6.0); tl.set(nm.children[1], { opacity: 1 }, 6.14);
tl.set(roles, { opacity: 1 }, 6.42); tl.set(belief, { opacity: 1 }, 6.62);
// measure the word "scaffold" for the hand underline
gsap.set(sB, { visibility: 'visible' }); const wr = qs[2].getBoundingClientRect(); gsap.set(sB, { visibility: 'hidden' });

function pile(n, x, y0, len) { // poles laid down, stacked
  const w = Math.max(3.4, 0.082 * cam.S);
  for (let i = 0; i < n; i++) { const row = i < 4 ? 0 : i < 7 ? 1 : 2, c = row === 0 ? i : row === 1 ? i - 4 + 0.5 : i - 7 + 1; const xx = x + c * 0.2, z = 0.09 + row * 0.17, o = (Hh(i, 77) - 0.5) * 0.5; tube(pr(xx, y0 + o, z), pr(xx, y0 + len + o, z), w); const e = pr(xx, y0 + len + o, z); ctx.beginPath(); ctx.arc(e[0], e[1], w * 0.55, 0, 6.3); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = INK; ctx.stroke(); }
}

onSeek.push((t) => {
  ctx.clearRect(0, 0, W, HH); lid = 0; ctx.save(); ctx.beginPath(); ctx.rect(17, 17, W - 34, HH - 34); ctx.clip();
  if (t < 3) {
    const ts = Math.floor(t * 20 + 1e-6) / 20; BOIL = Math.floor(ts * 10) % 3;
    const z = ease(ts / 2.5); const S = 96 + (62 - 96) * z;
    let k = 0; if (ts > 2.2) { const u = ts - 2.2; k = 0.075 * Math.sin(u * 21) * Math.exp(-u * 4.2); }
    cam = { ox: 600, oy: 315 + 3.1 * 96 + (510 - 315 - 3.1 * 96) * z, S, k: 0 };
    ground();
    M.forEach((m) => { if (m.d <= 0) drawMember(m, ts); });
    cam.k = k; structure(); cam.k = 0;
    M.forEach((m) => { if (m.d > 0) drawMember(m, ts); });
  } else if (t < 6) {
    BOIL = Math.floor(t * 6) % 3;
    cam = { ox: 262, oy: 432, S: 58, k: 0 };
    ground(); structure(); pile(9, 2.2, 0.3, 3.1);
    // underline under "scaffold"
    const p = ease((t - 3.5) / 0.3); if (p > 0) { lid = 900; BOIL = 0; const y = wr.bottom - 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(wr.left - 4, y + 2); ctx.quadraticCurveTo(wr.left + wr.width * 0.5 * p, y - 3, wr.left + (wr.width + 6) * p, y + 1); ctx.lineWidth = 7; ctx.strokeStyle = OR; ctx.stroke(); }
    // leader to the second belief
    const l = ease((t - 4.7) / 0.32); if (l > 0) { const a = [528, 462], b = [486, 462], c = pr(1.1, 1.1, 1.75); ctx.lineWidth = 1.3; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(a[0], a[1]); const l1 = Math.min(1, l * 2.5), l2 = Math.max(0, (l - 0.4) / 0.6); ctx.lineTo(a[0] + (b[0] - a[0]) * l1, a[1]); if (l2 > 0) ctx.lineTo(b[0] + (c[0] - b[0]) * l2, b[1] + (c[1] - b[1]) * l2); ctx.stroke(); if (l2 >= 1) { ctx.beginPath(); ctx.arc(c[0], c[1], 4, 0, 6.3); ctx.fillStyle = INK; ctx.fill(); } }
  } else {
    const u = t - 6; BOIL = u < 0.8 ? Math.floor(t * 10) % 3 : 0;
    const us = Math.floor(u * 20 + 1e-6) / 20; const k = us < 0.75 ? 0.06 * Math.sin(us * 22) * Math.exp(-us * 5) : 0;
    cam = { ox: 946, oy: 486, S: 56, k: 0 };
    ctx.lineWidth = 1.2; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(52, 394.5); ctx.lineTo(700, 394.5); ctx.stroke();
    ctx.fillStyle = OR; ctx.fillRect(52, 380, 96, 9);
    cam.k = k; structure(); cam.k = 0; pile(7, 2.4, -1.9, 2.6);
  }
  ctx.restore(); sheet();
});
end();
})();
