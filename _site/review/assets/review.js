/* Living review — page logic. Data lives in ./data/*.json and ./content/**.md next to index.html. */
(function () {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parseDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const fmtDate = s => { if (!s) return '—'; const d = parseDate(s); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
  const today = () => { const n = new Date(); return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()); };
  const DAY = 864e5;

  const KIND = {
    revision: { label: 'Revision', note: 'the text of a section changed' },
    literature: { label: 'Literature', note: 'papers were added to a section' },
    site: { label: 'Site', note: 'layout or tooling' }
  };
  const STATUS = {
    written: { label: 'Written' },
    draft: { label: 'Draft' },
    outline: { label: 'Outline' },
    open: { label: 'Not covered yet' }
  };

  const S = { meta: null, matrix: null, log: null, refs: {}, cons: null, bodies: {}, shade: 'refs', kinds: new Set(Object.keys(KIND)), showAll: false, current: null, lastFocus: null, opener: null };

  /* ---------------- utilities ---------------- */
  async function getJSON(p) { const r = await fetch(p, { cache: 'no-cache' }); if (!r.ok) throw new Error(p + ': ' + r.status); return r.json(); }
  async function getText(p) { const r = await fetch(p, { cache: 'no-cache' }); if (!r.ok) throw new Error(p + ': ' + r.status); return r.text(); }

  const tip = $('#tip');
  function showTip(html, x, y) {
    tip.innerHTML = html; tip.hidden = false;
    const w = tip.offsetWidth, h = tip.offsetHeight;
    let L = x + 14, T = y - h - 12;
    if (L + w > innerWidth - 8) L = x - w - 14;
    if (T < 8) T = y + 16;
    tip.style.left = L + 'px'; tip.style.top = T + 'px';
  }
  function hideTip() { tip.hidden = true; }

  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2200); }

  function shortAuthors(a) {
    if (!a) return '';
    if (/et al\.|Collaboration/.test(a)) return a;
    const parts = a.split(/,|&/).map(s => s.trim()).filter(Boolean);
    return parts.length > 2 ? parts[0] + ' et al.' : parts.join(' & ');
  }
  const citeLabel = id => { const r = S.refs[id]; return r ? `${shortAuthors(r.authors)} ${r.year}` : id; };
  const cellKey = (r, c) => `${r}/${c}`;
  const cellLabel = key => { const [r, c] = key.split('/'); const R = S.matrix.rows.find(x => x.id === r), C = S.matrix.cols.find(x => x.id === c); return `${R ? R.label : r} × ${C ? C.short : c}`; };

  /* ---------------- markdown + math + citations ---------------- */
  function md(src, cited) {
    const math = [];
    let s = src.replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => { math.push([m, true]); return `@@M${math.length - 1}@@`; })
               .replace(/(^|[^\\$])\$([^$\n]+?)\$/g, (_, pre, m) => { math.push([m, false]); return `${pre}@@M${math.length - 1}@@`; });
    let html = window.marked ? marked.parse(s) : `<p>${esc(s)}</p>`;
    html = html.replace(/@@M(\d+)@@/g, (_, i) => {
      const [m, disp] = math[+i];
      try { return katex.renderToString(m, { displayMode: disp, throwOnError: false }); } catch (e) { return esc(m); }
    });
    html = html.replace(/\[((?:@[\w-]+;?\s*)+)\]/g, (_, list) => {
      const ids = list.split(';').map(x => x.trim().replace(/^@/, '')).filter(Boolean);
      ids.forEach(id => cited && cited.add(id));
      return '(' + ids.map(id => {
        const r = S.refs[id];
        const href = r && r.arxiv ? `https://arxiv.org/abs/${r.arxiv}` : '#';
        return `<a class="cite" data-ref="${esc(id)}" href="${href}" target="_blank" rel="noopener">${esc(citeLabel(id))}</a>`;
      }).join('; ') + ')';
    });
    return html;
  }
  const mdi = src => md(String(src)).trim().replace(/^<p>/, '').replace(/<\/p>$/, '');
  function wireCites(root) {
    $$('.cite', root).forEach(a => {
      const r = S.refs[a.dataset.ref];
      a.addEventListener('pointerenter', e => r && showTip(`<b>${esc(r.authors)} (${r.year})</b><br>${esc(r.title)}`, e.clientX, e.clientY));
      a.addEventListener('pointerleave', hideTip);
      a.addEventListener('click', e => {
        const li = root.closest('.reader') && $(`#ref-${CSS.escape(a.dataset.ref)}`);
        if (li && !e.metaKey && !e.ctrlKey) { e.preventDefault(); li.scrollIntoView({ block: 'nearest', behavior: reduce() ? 'auto' : 'smooth' }); li.classList.remove('ping'); void li.offsetWidth; li.classList.add('ping'); }
      });
    });
  }

  /* ---------------- hero facts + citation ---------------- */
  function renderFacts() {
    const cells = Object.values(S.matrix.cells), total = S.matrix.rows.length * S.matrix.cols.length;
    const covered = cells.filter(c => c.status !== 'open').length;
    $('#facts').innerHTML = [
      ['Version', S.meta.version],
      ['Last revised', fmtDate(S.meta.revised)],
      ['Sections', `${covered} of ${total} started`]
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
    $('#suggest-link').href = S.meta.suggest;
    $('#foot-meta').textContent = `Version ${S.meta.version}, revised ${fmtDate(S.meta.revised)}. Started ${fmtDate(S.meta.started)}.`;
  }
  function bibtex() {
    const y = S.meta.revised.slice(0, 4);
    return `@misc{${S.meta.bibkey},\n  author = {${S.meta.maintainer.split(' ').reverse().join(', ')}},\n  title  = {${S.meta.title}: ${S.meta.subtitle.toLowerCase()}},\n  year   = {${y}},\n  note   = {Version ${S.meta.version}, revised ${S.meta.revised}},\n  url    = {${location.origin}${location.pathname}}\n}`;
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (_) {} t.remove(); return ok; }
  }

  /* ---------------- change log ---------------- */
  function renderLegend() {
    $('#log-legend').innerHTML = Object.entries(KIND).map(([k, v]) =>
      `<button type="button" data-kind="${k}" aria-pressed="${S.kinds.has(k)}" title="${esc(v.note)}"><i class="glyph ${k}"></i>${v.label}</button>`).join('');
    $$('#log-legend button').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.kind;
      if (S.kinds.has(k) && S.kinds.size > 1) S.kinds.delete(k); else S.kinds.add(k);
      renderLegend(); renderTrack(); renderEntries();
    }));
  }
  function visibleEntries() { return S.log.entries.filter(e => S.kinds.has(e.kind)).sort((a, b) => b.date.localeCompare(a.date)); }

  function renderTrack() {
    const track = $('#track'), es = visibleEntries();
    const all = S.log.entries.map(e => parseDate(e.date).getTime());
    const t1 = Math.max(today(), ...all) + 12 * DAY, t0 = Math.min(...all) - 12 * DAY;
    const x = t => ((t - t0) / (t1 - t0)) * 100;
    let html = '';
    // month ticks, thinned to keep ≥ ~70px apart
    const w = track.clientWidth || 800, months = [];
    const d = new Date(t0); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + 1);
    for (; d.getTime() < t1; d.setUTCMonth(d.getUTCMonth() + 1)) months.push(d.getTime());
    const step = Math.max(1, Math.ceil(months.length / Math.max(1, Math.floor(w / 70))));
    months.forEach((t, i) => {
      if (i % step) return;
      const dd = new Date(t), lab = dd.getUTCMonth() === 0 || i === 0 ? `${MONTHS[dd.getUTCMonth()]} ${dd.getUTCFullYear()}` : MONTHS[dd.getUTCMonth()];
      html += `<div class="tick" style="left:${x(t)}%"><span>${lab}</span></div>`;
    });
    html += `<div class="tick today" style="left:${x(today())}%"><span>Today</span></div>`;
    const stack = {};
    es.forEach((e, i) => {
      const k = e.date; const n = stack[k] = (stack[k] ?? -1) + 1;
      html += `<button class="mark" type="button" data-i="${S.log.entries.indexOf(e)}" style="left:${x(parseDate(e.date).getTime())}%; top:${40 - n * 17}px" aria-label="${esc(fmtDate(e.date) + ': ' + e.title)}"><i class="glyph ${e.kind}"></i></button>`;
    });
    track.innerHTML = html;
    $$('.mark', track).forEach(m => {
      const e = S.log.entries[+m.dataset.i];
      m.addEventListener('pointerenter', ev => showTip(`<b>${esc(fmtDate(e.date))}</b> ${esc(KIND[e.kind].label)}<br>${esc(e.title)}`, ev.clientX, ev.clientY));
      m.addEventListener('pointerleave', hideTip);
      m.addEventListener('click', () => selectEntry(+m.dataset.i, true));
    });
  }

  function renderEntries() {
    const es = visibleEntries(), list = $('#entries'), LIMIT = 4;
    list.innerHTML = es.map((e, n) => {
      const i = S.log.entries.indexOf(e);
      const chips = (e.cells || []).map(k => `<button class="chip" type="button" data-cell="${k}">${esc(cellLabel(k))}</button>`)
        .concat((e.papers || []).map(p => `<a class="chip ref" href="https://arxiv.org/abs/${esc(S.refs[p]?.arxiv || '')}" target="_blank" rel="noopener">${esc(citeLabel(p))}</a>`)).join('');
      return `<li class="entry" id="entry-${i}" data-i="${i}" ${!S.showAll && n >= LIMIT ? 'hidden' : ''}>
        <div class="entry-date"><i class="glyph ${e.kind}" aria-hidden="true"></i><span>${esc(fmtDate(e.date))}${e.version ? `<br>v${esc(e.version)}` : ''}</span></div>
        <div><h3>${esc(e.title)}${e.sample ? '<span class="sample">sample entry</span>' : ''}</h3><p>${esc(e.body)}</p>${chips ? `<div class="chips">${chips}</div>` : ''}</div>
      </li>`;
    }).join('') + (es.length > LIMIT ? `<li><button class="more" type="button" id="more">${S.showAll ? 'Show fewer entries' : `Show all ${es.length} entries`}</button></li>` : '');
    $$('.chip[data-cell]', list).forEach(c => c.addEventListener('click', () => gotoCell(c.dataset.cell)));
    $('#more')?.addEventListener('click', () => { S.showAll = !S.showAll; renderEntries(); });
  }
  function selectEntry(i, scroll) {
    if (!S.showAll && $(`#entry-${i}`)?.hidden) { S.showAll = true; renderEntries(); }
    $$('.mark').forEach(m => m.setAttribute('aria-current', String(+m.dataset.i === i)));
    $$('.entry').forEach(li => li.classList.toggle('is-current', +li.dataset.i === i));
    if (scroll) $(`#entry-${i}`)?.scrollIntoView({ block: 'nearest', behavior: reduce() ? 'auto' : 'smooth' });
  }

  /* ---------------- atlas ---------------- */
  function recentCells() {
    const cut = today() - 30 * DAY, set = new Set();
    S.log.entries.forEach(e => { if (parseDate(e.date).getTime() >= cut) (e.cells || []).forEach(k => set.add(k)); });
    return set;
  }
  function alpha(cell) {
    if (cell.status === 'open') return 0;
    if (S.shade === 'refs') { const max = Math.max(1, ...Object.values(S.matrix.cells).map(c => c.refs.length)); return (0.04 + 0.30 * cell.refs.length / max).toFixed(3); }
    if (S.shade === 'recency') { if (!cell.updated) return 0; const days = (today() - parseDate(cell.updated).getTime()) / DAY; return Math.max(0.03, 0.34 * (1 - days / 180)).toFixed(3); }
    return 0;
  }
  function colPos(ci) { return ci === 0 ? 2 : ci + 3; }      // track 3 is the spacer between source and probes

  function renderAtlas() {
    const { rows, cols, cells } = S.matrix, grid = $('#atlas-grid'), fresh = recentCells();
    let h = `<div class="ax-group" style="--r:1;--c:2">Where it is generated</div><div class="ax-group" style="--r:1;--c:4 / span ${cols.length - 1}">Where it is observed</div>`;
    rows.forEach((r, ri) => { h += `<div class="ax-row" role="rowheader" data-row="${r.id}" style="--r:${ri + 3};--c:1"><strong>${esc(r.label)}</strong><span>${esc(r.blurb)}</span></div>`; });
    cols.forEach((c, ci) => {
      h += `<div class="ax-col" role="columnheader" data-col="${c.id}" style="--r:2;--c:${colPos(ci)}"><strong>${esc(c.short)}</strong><span>${esc(c.blurb)}</span></div>`;
      rows.forEach((r, ri) => {
        const k = cellKey(r.id, c.id), cell = cells[k] || { title: '', status: 'open', refs: [] }, st = STATUS[cell.status];
        h += `<button class="cell ${cell.status === 'open' ? 'open' : ''}" type="button" role="gridcell" data-cell="${k}" style="--r:${ri + 3};--c:${colPos(ci)};--a:${alpha(cell)}"
          aria-label="${esc(`${r.label}, ${c.label}: ${cell.title}. ${st.label}.`)}">
          ${fresh.has(k) ? '<i class="fresh" title="Revised in the last 30 days"></i>' : ''}
          <span class="rowtag">${esc(r.label)}</span>
          <span class="t">${esc(cell.title || 'Not covered yet')}</span>
          <span class="meta"><span class="st"><i class="st-dot ${cell.status}"></i>${st.label}</span>${cell.refs.length ? `<span>${cell.refs.length} ref${cell.refs.length > 1 ? 's' : ''}</span>` : ''}</span>
        </button>`;
      });
    });
    grid.innerHTML = h;
    grid.className = `atlas shade-${S.shade}`;
    $$('.cell', grid).forEach(b => {
      b.addEventListener('click', () => openCell(b.dataset.cell, b));
      b.addEventListener('pointerenter', () => hlAxes(b.dataset.cell, true));
      b.addEventListener('pointerleave', () => hlAxes(b.dataset.cell, false));
      b.addEventListener('focus', () => hlAxes(b.dataset.cell, true));
      b.addEventListener('blur', () => hlAxes(b.dataset.cell, false));
    });
    $('#atlas-key').innerHTML = `
      <span><i class="st-dot outline"></i>Outline</span><span><i class="st-dot draft"></i>Draft</span><span><i class="st-dot written"></i>Written</span>
      <span><i class="fresh-k"></i>Revised in the last 30 days</span>
      ${S.shade !== 'none' ? `<span><i class="ramp"></i>${S.shade === 'refs' ? 'More references' : 'More recently revised'}</span>` : ''}`;
  }
  function hlAxes(k, on) { const [r, c] = k.split('/'); $(`.ax-row[data-row="${r}"]`)?.classList.toggle('hl', on); $(`.ax-col[data-col="${c}"]`)?.classList.toggle('hl', on); }

  function renderOpen() {
    const items = [];
    Object.entries(S.matrix.cells).forEach(([k, c]) => (c.open || []).forEach(q => items.push([k, q])));
    $('#open-list').innerHTML = items.length ? items.map(([k, q]) => `<li><q>${mdi(q)}</q><button type="button" data-cell="${k}">${esc(cellLabel(k))}</button></li>`).join('')
      : '<li>No open problems recorded yet.</li>';
    $$('#open-list button').forEach(b => b.addEventListener('click', () => gotoCell(b.dataset.cell)));
  }

  function gotoCell(k) {
    const el = $(`.cell[data-cell="${CSS.escape(k)}"]`);
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: reduce() ? 'auto' : 'smooth' });
    setTimeout(() => openCell(k, el), reduce() ? 0 : 420);
  }

  /* ---------------- reader ---------------- */
  const root = $('#reader-root'), reader = $('#reader'), body = $('#reader-body');

  async function loadBody(k) {
    if (k in S.bodies) return S.bodies[k];
    try { S.bodies[k] = await getText(`content/cells/${k.replace('/', '-')}.md`); } catch (e) { S.bodies[k] = null; }
    return S.bodies[k];
  }

  function neighbours(k) {
    const [r, c] = k.split('/'), R = S.matrix.rows.map(x => x.id), C = S.matrix.cols.map(x => x.id);
    const ri = R.indexOf(r), ci = C.indexOf(c), at = (a, b) => (R[a] && C[b]) ? cellKey(R[a], C[b]) : null;
    return { up: at(ri - 1, ci), down: at(ri + 1, ci), left: at(ri, ci - 1), right: at(ri, ci + 1) };
  }

  async function fillReader(k) {
    const cell = S.matrix.cells[k] || { title: 'Not covered yet', status: 'open', refs: [], outline: [], open: [] };
    const [r, c] = k.split('/'), R = S.matrix.rows.find(x => x.id === r), C = S.matrix.cols.find(x => x.id === c);
    $('#reader-crumb').innerHTML = `<b>${esc(R.label)}</b><span class="x">×</span><b>${esc(C.label)}</b>`;
    $$('#minimap button').forEach(b => b.setAttribute('aria-current', String(b.dataset.cell === k)));

    const cited = new Set(cell.refs);
    let main = `<h2 class="r-title" id="reader-title">${esc(cell.title || 'Not covered yet')}</h2>
      <div class="r-meta"><span class="st"><i class="st-dot ${cell.status}"></i>${STATUS[cell.status].label}</span>
      ${cell.updated ? `<span>Revised ${esc(fmtDate(cell.updated))}</span>` : ''}${cell.refs.length ? `<span>${cell.refs.length} key reference${cell.refs.length > 1 ? "s" : ""}</span>` : ''}</div>`;
    let content = '';
    if (cell.body) {
      const src = await loadBody(k);
      content = src ? `<div class="prose">${md(src, cited)}</div>` : '<p class="error">This section’s text file could not be loaded.</p>';
    }
    if (!content && cell.outline && cell.outline.length) {
      content = `<div class="prose"><p>This section is planned with the outline below and has not been written yet.</p></div><ol class="r-outline">${cell.outline.map(o => `<li><span>${mdi(o)}</span></li>`).join('')}</ol>`;
    }
    if (!content) {
      content = `<div class="r-empty"><p>No section covers ${esc(R.label.toLowerCase())} for ${esc(C.label)} yet.</p><p>If you know work that belongs here, <a href="${esc(S.meta.suggest + encodeURIComponent(cellLabel(k)))}" target="_blank" rel="noopener">suggest it on GitHub</a>.</p></div>`;
    }
    const refs = [...cited].filter(id => S.refs[id]);
    const nb = neighbours(k), arrow = { up: '↑', left: '←', right: '→', down: '↓' };
    const touches = S.log.entries.filter(e => (e.cells || []).includes(k)).sort((a, b) => b.date.localeCompare(a.date));
    const side = `
      ${refs.length ? `<section><h4>References</h4><ol class="reflist">${refs.map(id => { const x = S.refs[id]; return `<li id="ref-${esc(id)}"><span class="ra">${esc(shortAuthors(x.authors))} (${x.year})</span>${x.verified ? '' : '<span class="unv" title="Not yet checked against the paper">unchecked</span>'}<span class="rt">${esc(x.title)}</span><a href="https://arxiv.org/abs/${esc(x.arxiv)}" target="_blank" rel="noopener">arXiv:${esc(x.arxiv)}</a></li>`; }).join('')}</ol></section>` : ''}
      ${(cell.open || []).length ? `<section><h4>Open questions</h4><ul class="reflist">${cell.open.map(q => `<li>${mdi(q)}</li>`).join('')}</ul></section>` : ''}
      ${touches.length ? `<section><h4>History</h4><ul class="reflist">${touches.map(e => `<li><span class="ra">${esc(fmtDate(e.date))}</span><span class="rt">${esc(e.title)}</span></li>`).join('')}</ul></section>` : ''}
      <section><h4>Neighbouring sections</h4><div class="nbrs">${['up', 'left', 'right', 'down'].map(d => {
        const t = nb[d]; return `<button type="button" data-go="${t || ''}" data-dir="${d}" ${t ? '' : 'disabled'}><small>${arrow[d]} ${t ? esc(cellLabel(t)) : ''}</small>${t ? esc(S.matrix.cells[t]?.title || 'Not covered yet') : ''}</button>`;
      }).join('')}</div></section>`;
    body.innerHTML = `<article class="r-main">${main}${content}</article><aside class="r-side">${side}</aside>`;
    $$('.nbrs button[data-go]', body).forEach(b => b.addEventListener('click', () => b.dataset.go && navigate(b.dataset.go, b.dataset.dir)));
    mountWidgets(body); wireCites(body);
    $('#reader-foot').innerHTML = `<span class="keys"><kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> move between sections, <kbd>Esc</kbd> closes</span><a href="${esc(S.meta.suggest + encodeURIComponent(cellLabel(k)))}" target="_blank" rel="noopener">Suggest an edit to this section</a>`;
  }

  function buildMinimap() {
    const mm = $('#minimap'); mm.style.setProperty('--cols', S.matrix.cols.length);
    mm.innerHTML = S.matrix.rows.map(r => S.matrix.cols.map(c => {
      const k = cellKey(r.id, c.id), cell = S.matrix.cells[k];
      return `<button type="button" data-cell="${k}" class="${cell && cell.status !== 'open' ? 'has' : ''}" aria-label="${esc(cellLabel(k))}" title="${esc(cellLabel(k) + (cell ? ': ' + cell.title : ''))}"></button>`;
    }).join('')).join('');
    $$('button', mm).forEach(b => b.addEventListener('click', () => {
      if (!S.current || b.dataset.cell === S.current) return;
      const [r0, c0] = S.current.split('/'), [r1, c1] = b.dataset.cell.split('/');
      const R = S.matrix.rows.map(x => x.id), C = S.matrix.cols.map(x => x.id);
      const dc = C.indexOf(c1) - C.indexOf(c0), dr = R.indexOf(r1) - R.indexOf(r0);
      navigate(b.dataset.cell, Math.abs(dc) >= Math.abs(dr) ? (dc > 0 ? 'right' : 'left') : (dr > 0 ? 'down' : 'up'));
    }));
  }

  function rectTransform(from, to) {
    return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`;
  }

  async function openCell(k, fromEl) {
    if (S.current) return navigate(k, 'right');
    S.current = k; S.lastFocus = document.activeElement; S.opener = fromEl;
    hideTip();
    await fillReader(k);
    root.hidden = false; document.body.style.overflow = 'hidden';
    history.replaceState(null, '', `#/${k}`);
    $('#reader-scroll').scrollTop = 0;
    const to = reader.getBoundingClientRect();
    if (fromEl && !reduce()) {
      const from = fromEl.getBoundingClientRect();
      reader.classList.add('morphing');
      reader.style.transition = 'none';
      reader.style.transform = rectTransform(from, to);
      reader.style.borderRadius = '10px';
      void reader.offsetWidth;
      reader.style.transition = 'transform .46s cubic-bezier(.2,.7,.1,1), border-radius .46s';
      reader.style.transform = 'none'; reader.style.borderRadius = '';
      root.classList.add('on');
      const done = () => { reader.classList.remove('morphing'); reader.removeEventListener('transitionend', done); };
      reader.addEventListener('transitionend', done);
      setTimeout(done, 600);
    } else { root.classList.add('on'); }
    $('.close', reader).focus({ preventScroll: true });
  }

  function closeReader() {
    if (!S.current) return;
    const el = $(`.cell[data-cell="${CSS.escape(S.current)}"]`);
    const finish = () => {
      root.hidden = true; root.classList.remove('on'); reader.classList.remove('morphing');
      reader.style.transition = reader.style.transform = reader.style.borderRadius = '';
      document.body.style.overflow = '';
      const f = el || S.lastFocus; f && f.focus({ preventScroll: true });
      if (el) { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
      S.current = null;
    };
    history.replaceState(null, '', location.pathname + location.search);
    const r = el && el.getBoundingClientRect();
    if (!reduce() && r && r.bottom > 0 && r.top < innerHeight) {
      const to = reader.getBoundingClientRect();
      reader.classList.add('morphing');
      reader.style.transition = 'transform .38s cubic-bezier(.4,0,.2,1), border-radius .38s';
      reader.style.transform = rectTransform(r, to); reader.style.borderRadius = '10px';
      root.classList.remove('on');
      setTimeout(finish, 390);
    } else { root.classList.remove('on'); setTimeout(finish, reduce() ? 0 : 200); }
  }

  async function navigate(k, dir) {
    if (!k || k === S.current) return;
    S.current = k;
    history.replaceState(null, '', `#/${k}`);
    await fillReader(k);
    $('#reader-scroll').scrollTop = 0;
    const cls = { right: 'slide-l', left: 'slide-r', down: 'slide-u', up: 'slide-d' }[dir] || 'slide-l';
    body.classList.remove('slide-l', 'slide-r', 'slide-u', 'slide-d'); void body.offsetWidth; body.classList.add(cls);
  }

  root.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeReader(); });
  document.addEventListener('keydown', e => {
    if (!S.current) return;
    if (e.key === 'Escape') { e.preventDefault(); closeReader(); return; }
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    if (map[e.key] && !e.target.closest('input, textarea, [role="tablist"], [role="radiogroup"]')) {
      const t = neighbours(S.current)[map[e.key]];
      if (t) { e.preventDefault(); navigate(t, map[e.key]); }
    }
    if (e.key === 'Tab') {   // keep focus inside the dialog
      const f = $$('button:not([disabled]), a[href]', reader).filter(x => x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------------- widgets ---------------- */
  function mountWidgets(scope) {
    $$('[data-widget]', scope).forEach(el => {
      if (el.dataset.mounted) return; el.dataset.mounted = '1';
      if (el.dataset.widget === 'review-strip') reviewStrip(el);
      if (el.dataset.widget === 'fnl-constraints') fnlChart(el);
    });
  }

  function reviewStrip(el) {
    const given = new Set(['chen2010', 'desjacques2010', 'renauxpetel2015']);
    const items = Object.entries(S.refs).filter(([, r]) => r && r.review).map(([id, r]) => ({ id, ...r }));
    items.push({ id: 'now', year: +S.meta.revised.slice(0, 4), authors: 'This review', title: 'Primordial non-Gaussianity: a living review', review: 'Living review' });
    items.sort((a, b) => a.year - b.year);
    const y0 = 2002, y1 = 2028, W = 680, L = 8, Rr = 8, base = 120;
    const X = y => L + (y - y0) / (y1 - y0) * (W - L - Rr);
    const lvl = {};
    let s = `<line class="axis" x1="${L}" x2="${W - Rr}" y1="${base}" y2="${base}"/>`;
    for (let y = 2005; y <= 2025; y += 5) s += `<g class="tk"><line x1="${X(y)}" x2="${X(y)}" y1="${base}" y2="${base + 5}"/><text x="${X(y)}" y="${base + 18}" text-anchor="middle">${y}</text></g>`;
    items.forEach(it => {
      const n = lvl[it.year] = (lvl[it.year] ?? -1) + 1, cx = X(it.year), cy = base - 12 - n * 20;
      const name = it.id === 'now' ? 'This review' : shortAuthors(it.authors).replace(/ & .*/, ' +').replace(' et al.', ' +');
      s += `<circle class="dot ${given.has(it.id) ? 'given' : ''} ${it.id === 'now' ? 'now' : ''}" data-id="${it.id}" cx="${cx}" cy="${cy}" r="6"/>
            <text class="lbl" x="${cx + 10}" y="${cy + 4}">${esc(name)}</text>`;
    });
    el.innerHTML = `<figure class="strip"><svg viewBox="0 0 ${W} ${base + 24}" role="img" aria-label="Timeline of review articles on primordial non-Gaussianity">${s}</svg>
      <figcaption>Review articles by year. Hollow markers are the three reviews this project starts from; hover a marker for the title.</figcaption></figure>`;
    $$('.dot', el).forEach(d => {
      const it = items.find(x => x.id === d.dataset.id);
      d.addEventListener('pointerenter', e => showTip(`<b>${esc(it.authors)} (${it.year})</b><br>${esc(it.title)}<br><span style="opacity:.7">${esc(it.review)}</span>`, e.clientX, e.clientY));
      d.addEventListener('pointerleave', hideTip);
      if (it.arxiv) d.addEventListener('click', () => window.open(`https://arxiv.org/abs/${it.arxiv}`, '_blank', 'noopener'));
    });
  }

  function fnlChart(el) {
    if (!S.cons) { el.innerHTML = '<p class="error">Constraint data could not be loaded.</p>'; return; }
    const P = S.cons.parameters, keys = Object.keys(P);
    let cur = keys[0];
    el.innerHTML = `<div class="viz"><div class="viz-top">
        <div class="seg" role="radiogroup" aria-label="Shape">${keys.map(k => `<button role="radio" data-p="${k}" aria-checked="${k === cur}">${window.katex ? katex.renderToString(P[k].tex) : esc(P[k].label)}</button>`).join('')}</div>
        <div class="viz-legend"><span><svg width="12" height="12"><circle cx="6" cy="6" r="4.5" class="cmb" style="fill:var(--cool)"/></svg>CMB</span><span><svg width="12" height="12"><rect x="1.5" y="1.5" width="9" height="9" rx="1.5" style="fill:var(--warm)"/></svg>LSS</span></div>
      </div><svg class="plot" viewBox="0 0 640 280" role="img"></svg>
      ${S.cons.demo ? '<p class="demo">Demo values for the layout review. Every number is checked against its paper before launch.</p>' : ''}
      <details><summary>Show as table</summary><table></table></details></div>`;
    const svg = $('svg.plot', el), table = $('table', el);
    function draw() {
      const pts = S.cons.points.filter(p => p.param === cur);
      const lo = p => p.low ?? p.value - p.minus, hi = p => p.high ?? p.value + p.plus;
      let ymin = Math.min(0, ...pts.map(lo)), ymax = Math.max(0, ...pts.map(hi));
      const pad = (ymax - ymin) * 0.08; ymin -= pad; ymax += pad;
      const ML = 46, MR = 14, MT = 10, MB = 28, W = 640, H = 280;
      const yrs = pts.map(p => p.year), x0 = Math.min(2006, ...yrs) - 1, x1 = Math.max(2026, ...yrs) + 1;
      const X = y => ML + (y - x0) / (x1 - x0) * (W - ML - MR), Y = v => MT + (ymax - v) / (ymax - ymin) * (H - MT - MB);
      const span = ymax - ymin, stepRaw = span / 5, mag = 10 ** Math.floor(Math.log10(stepRaw));
      const step = [1, 2, 5, 10].map(m => m * mag).find(s => s >= stepRaw);
      let s = '<g class="grid">';
      for (let v = Math.ceil(ymin / step) * step; v <= ymax; v += step) s += `<line x1="${ML}" x2="${W - MR}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${ML - 8}" y="${Y(v) + 4}" text-anchor="end">${String(+v.toFixed(6)).replace('-', '−')}</text>`;
      s += '</g><g class="xax">';
      for (let y = Math.ceil(x0 / 5) * 5; y <= x1; y += 5) s += `<text x="${X(y)}" y="${H - 8}" text-anchor="middle">${y}</text>`;
      s += `</g><line class="zero" x1="${ML}" x2="${W - MR}" y1="${Y(0)}" y2="${Y(0)}"/>`;
      pts.forEach((p, i) => {
        const cls = p.probe === 'LSS' ? 'lss' : 'cmb', x = X(p.year);
        s += `<line class="eb ${cls}" x1="${x}" x2="${x}" y1="${Y(lo(p))}" y2="${Y(hi(p))}"/>`;
        if (p.value != null) s += cls === 'lss' ? `<rect class="pt ${cls}" x="${x - 5}" y="${Y(p.value) - 5}" width="10" height="10" rx="1.5"/>` : `<circle class="pt ${cls}" cx="${x}" cy="${Y(p.value)}" r="5.5"/>`;
        else s += `<line class="eb ${cls}" x1="${x - 5}" x2="${x + 5}" y1="${Y(lo(p))}" y2="${Y(lo(p))}"/><line class="eb ${cls}" x1="${x - 5}" x2="${x + 5}" y1="${Y(hi(p))}" y2="${Y(hi(p))}"/>`;
        s += `<rect class="hit" data-i="${i}" x="${x - 12}" y="${Y(hi(p)) - 6}" width="24" height="${Y(lo(p)) - Y(hi(p)) + 12}"/>`;
      });
      svg.innerHTML = s;
      svg.setAttribute('aria-label', `${P[cur].label} constraints by year`);
      const fmt = v => String(v).replace('-', '−');
      const txt = p => p.value != null ? `${fmt(p.value)} ± ${p.plus === p.minus ? p.plus : `+${p.plus}/−${p.minus}`} (68%)` : `${fmt(p.low)} to ${fmt(p.high)}`;
      $$('.hit', svg).forEach(h => {
        const p = pts[+h.dataset.i];
        h.addEventListener('pointerenter', e => showTip(`<b>${esc(p.label)}</b><br>${esc(P[cur].label)} = ${esc(txt(p))}<br><span style="opacity:.7">${esc(citeLabel(p.ref))}</span>`, e.clientX, e.clientY));
        h.addEventListener('pointerleave', hideTip);
      });
      table.innerHTML = `<tr><th>Analysis</th><th>Year</th><th>Probe</th><th>Constraint</th></tr>` + pts.map(p => `<tr><td>${esc(p.label)}</td><td>${p.year}</td><td>${p.probe}</td><td>${esc(txt(p))}</td></tr>`).join('');
    }
    $$('[data-p]', el).forEach(b => b.addEventListener('click', () => { cur = b.dataset.p; $$('[data-p]', el).forEach(x => x.setAttribute('aria-checked', String(x === b))); draw(); }));
    draw();
  }

  /* ---------------- theme ---------------- */
  $('#theme-toggle').addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('review-theme', next); } catch (e) {}
    window.dispatchEvent(new Event('themechange'));
  });

  /* ---------------- boot ---------------- */
  async function boot() {
    window.Shapes && Shapes.mount($('.shape'));
    try {
      const [meta, matrix, log, refs, cons] = await Promise.all([
        getJSON('data/meta.json'), getJSON('data/matrix.json'), getJSON('data/timeline.json'), getJSON('data/references.json'), getJSON('data/constraints.json').catch(() => null)
      ]);
      Object.assign(S, { meta, matrix, log, refs, cons });
    } catch (e) {
      const msg = `<p class="error">The review data could not be loaded (${esc(e.message)}). If you opened this file directly, serve the site instead, e.g. <code>bundle exec jekyll serve</code> or <code>python3 -m http.server</code> from the site root.</p>`;
      $('#intro-body').innerHTML = msg; $('#atlas-grid').innerHTML = msg; return;
    }
    renderFacts(); renderLegend(); renderTrack(); renderEntries(); renderAtlas(); renderOpen(); buildMinimap();
    $('#cite-btn').addEventListener('click', async () => toast(await copy(bibtex()) ? 'BibTeX copied' : 'Copy failed: select the text manually'));
    $$('.seg [data-shade]').forEach(b => b.addEventListener('click', () => {
      S.shade = b.dataset.shade; $$('.seg [data-shade]').forEach(x => x.setAttribute('aria-checked', String(x === b))); renderAtlas();
    }));
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(renderTrack, 120); });

    try { const cited = new Set(); $('#intro-body').innerHTML = md(await getText('content/intro.md'), cited); mountWidgets($('#intro-body')); wireCites($('#intro-body')); }
    catch (e) { $('#intro-body').innerHTML = '<p class="error">The introduction could not be loaded.</p>'; }

    const m = location.hash.match(/^#\/(\w+\/\w+)$/);
    if (m && S.matrix.cells[m[1]]) { const el = $(`.cell[data-cell="${CSS.escape(m[1])}"]`); el.scrollIntoView({ block: 'center' }); openCell(m[1], el); }
  }
  boot();
})();
