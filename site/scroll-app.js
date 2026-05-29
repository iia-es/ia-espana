/* ============================================================
   IIA · El futuro del trabajo y la IA en España
   Scroll engine + ranking renderers + scatter plot
   ============================================================ */

(function() {
  'use strict';

  const OCC = window.OCCUPATIONS;

  /* ---------- Utilities ---------- */
  const $  = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));
  const fmtMoney = (n) => n == null ? '—' : new Intl.NumberFormat('es-ES', {maximumFractionDigits: 0}).format(n) + ' €';
  const fmtJobs = (n) => {
    if (n == null) return '—';
    if (n >= 1e6) return (n/1e6).toFixed(1) + ' M';
    if (n >= 1e3) return (n/1e3).toFixed(0) + ' k';
    return String(n);
  };
  const fmtPct = (n) => n == null ? '—' : (n >= 0 ? '+' : '') + n.toFixed(1) + ' %';

  /* ---------- 1. Reveal observer (fade + slide in/out) ---------- */
  function setupRevealObserver() {
    const els = $$('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio > 0.05) {
          e.target.classList.add('in');
        }
      });
    }, { threshold: [0, 0.05, 0.2], rootMargin: '0px 0px -10% 0px' });
    els.forEach(el => io.observe(el));
  }

  /* ---------- 2. Chapter fade-in/out tied to scroll position ---------- */
  function setupChapterFadeOut() {
    const chapters = $$('.chapter');
    let raf = null;
    function update() {
      raf = null;
      const vh = window.innerHeight;
      const centerY = vh / 2;
      chapters.forEach(ch => {
        const rect = ch.getBoundingClientRect();
        const chCenter = rect.top + rect.height / 2;
        const dist = Math.abs(chCenter - centerY);
        // Maximum distance before we hit 0 opacity
        // — vh*0.8 means ~80% of viewport away from center = fully faded
        const fadeRange = vh * 0.85;
        const t = Math.max(0, Math.min(1, 1 - dist / fadeRange));
        // ease so the centered section is sharp and far ones drop quickly
        const eased = Math.pow(t, 1.4);
        // opacity 0.05 minimum so something is barely visible
        const opacity = 0.05 + 0.95 * eased;
        ch.style.setProperty('--chapter-opacity', opacity.toFixed(3));
        // Translate slightly so the leaving content drifts up and the entering drifts in from below
        const offset = (chCenter - centerY) * 0.06;  // subtle parallax
        ch.style.setProperty('--chapter-shift', `${-offset.toFixed(1)}px`);
        // Add classes for old behaviour (used by scroll cue)
        if (rect.bottom < vh * 0.25 && rect.top < 0) ch.classList.add('fade-out');
        else ch.classList.remove('fade-out');
      });
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(update);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ---------- 3. Side-rail + masthead nav active chapter ---------- */
  function setupRail() {
    const dots = $$('.rail-dot');
    const railBottom = $('#rail-bottom');
    const chapters = $$('.chapter');
    const navLinks = $$('.masthead-nav a');
    const masthead = $('.masthead');

    // Build bottom rail too
    chapters.forEach((_, i) => {
      const d = document.createElement('span');
      d.className = 'dot';
      d.dataset.chapter = String(i+1);
      railBottom.appendChild(d);
    });
    const bottomDots = $$('.dot', railBottom);

    const io = new IntersectionObserver((entries) => {
      let active = null;
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (!active || e.intersectionRatio > active.intersectionRatio) active = e;
        }
      });
      if (active) {
        const idx = active.target.dataset.chapter;
        dots.forEach(d => d.classList.toggle('active', d.dataset.chapter === idx));
        bottomDots.forEach(d => d.classList.toggle('active', d.dataset.chapter === idx));
        navLinks.forEach(a => a.classList.toggle('active', a.dataset.chapter === idx));
      }
    }, { threshold: [0.3, 0.6] });

    chapters.forEach(c => io.observe(c));

    // Add 'scrolled' class to masthead when not at top
    function onScroll() {
      if (window.scrollY > 24) masthead.classList.add('scrolled');
      else masthead.classList.remove('scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 4. Animated counter for big numbers ---------- */
  function setupCounters() {
    const els = $$('[data-count]');
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          observer.unobserve(e.target);
          const el = e.target;
          const target = parseFloat(el.dataset.count);
          const decimals = parseInt(el.dataset.decimals || '0', 10);
          const suffix = el.dataset.suffix || '';
          const duration = 1600;
          const start = performance.now();
          function step(now) {
            const t = Math.min(1, (now - start) / duration);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - t, 3);
            const val = target * eased;
            el.textContent = val.toFixed(decimals) + suffix;
            if (t < 1) requestAnimationFrame(step);
            else el.textContent = target.toFixed(decimals) + suffix;
          }
          requestAnimationFrame(step);
        }
      });
    }, { threshold: 0.5 });
    els.forEach(el => io.observe(el));
  }

  /* ---------- 5. Rankings ---------- */
  function renderRanking(targetId, items, maxScale, opts) {
    const mount = document.getElementById(targetId);
    if (!mount) return;
    opts = opts || {};
    mount.innerHTML = '';
    items.forEach((o, idx) => {
      const row = document.createElement('a');
      row.className = 'ranking-row';
      row.href = '#chapter-3';
      row.dataset.slug = o.slug;
      const pct = Math.min(100, (o.exposure / maxScale) * 100);
      row.innerHTML = `
        <span class="ranking-rank">${String(idx+1).padStart(2, '0')}</span>
        <div class="ranking-body">
          <div class="ranking-name" title="${o.title}">${o.title}</div>
          <div class="ranking-bar-wrap">
            <div class="ranking-bar"><div class="ranking-bar-fill" data-width="${pct}" style="--bar-delay:${idx*70}ms"></div></div>
          </div>
        </div>
        <span class="ranking-value">${o.exposure.toFixed(2)} / 10</span>
      `;
      mount.appendChild(row);

      row.addEventListener('click', (e) => {
        e.preventDefault();
        // Find full occupation record by code
        const full = (OCC.all || []).find(x => x.code === o.code) || o;
        showProfessionDetail(full);
      });
    });
  }

  function setupRankingBars() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const fills = $$('.ranking-bar-fill', e.target);
          fills.forEach(f => {
            f.style.width = f.dataset.width + '%';
          });
        } else {
          const fills = $$('.ranking-bar-fill', e.target);
          fills.forEach(f => f.style.width = '0%');
        }
      });
    }, { threshold: 0.2 });
    $$('.ranking-list').forEach(l => io.observe(l));
  }

  /* ---------- 6. Scatter plot ---------- */
  function setupScatter() {
    const canvas = document.getElementById('scatter');
    if (!canvas || !OCC) return;
    const points = OCC.scatter.slice().filter(p => p.exposure != null && p.pay);

    const minPay = 9000, maxPay = 75000;
    const minExp = 0.5, maxExp = 9.5;

    const tooltip = document.getElementById('scatter-tooltip');
    let activeDot = null;

    points.forEach((p, i) => {
      const xPct = ((p.exposure - minExp) / (maxExp - minExp)) * 86 + 8;   // 8% to 94%
      const yPct = 92 - ((p.pay - minPay) / (maxPay - minPay)) * 82;        // inverted
      const r = Math.max(5, Math.min(16, Math.sqrt(p.jobs / 4000)));

      // Color tier:
      //  - danger: high exposure (≥6) + high pay (≥30k) — coral
      //  - warm:   high exposure (≥6) but lower pay      — amber
      //  - safe:   low exposure (≤3)                     — teal
      //  - default: medium — muted teal/grey
      let cls = '';
      if (p.exposure >= 6 && p.pay >= 30000) cls = 'danger';
      else if (p.exposure >= 6) cls = 'warm';
      else if (p.exposure <= 3) cls = 'safe';

      const dot = document.createElement('div');
      dot.className = 'scatter-dot' + (cls ? ' ' + cls : '');
      dot.style.left = xPct + '%';
      dot.style.top  = yPct + '%';
      dot.style.width = r + 'px';
      dot.style.height = r + 'px';
      dot.style.margin = `-${r/2}px 0 0 -${r/2}px`;
      dot.style.setProperty('--dot-delay', (i * 12) + 'ms');

      dot.addEventListener('mouseenter', (e) => {
        activeDot = dot;
        tooltip.innerHTML = `
          <span class="tip-name">${p.title}</span>
          <span class="tip-meta">Exposición ${p.exposure.toFixed(1)} · Salario ${fmtMoney(p.pay)}</span>
        `;
        tooltip.style.left = xPct + '%';
        tooltip.style.top  = yPct + '%';
        tooltip.classList.add('show');
      });
      dot.addEventListener('mouseleave', () => {
        if (activeDot === dot) tooltip.classList.remove('show');
      });
      dot.addEventListener('click', () => {
        const full = (OCC.all || []).find(x => x.code === p.code);
        if (full) showProfessionDetail(full);
      });

      canvas.appendChild(dot);
    });

    // Reveal on scroll-in
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        canvas.classList.toggle('in', e.isIntersecting);
      });
    }, { threshold: 0.25 });
    io.observe(canvas);
  }

  /* ---------- 7. Search ---------- */
  function setupSearch() {
    const input = document.getElementById('search-input');
    const resultsBox = document.getElementById('search-results');
    const form = document.getElementById('search-form');
    if (!input || !OCC) return;

    // Use the full 62-occupation list now
    const all = OCC.all || [];

    function normalize(s) {
      return (s || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    // Build alias map for popular short names
    const ALIASES = {
      'programador': '27', 'programadora': '27', 'developer': '27', 'desarrollador': '27', 'software': '27',
      'abogado': '25', 'abogada': '25',
      'periodista': '29',
      'enfermera': '56', 'enfermero': '56', 'auxiliar de enfermeria': '56',
      'profesor': '22', 'profesora': '22', 'maestro': '22', 'maestra': '22', 'docente': '22',
      'administrativo': '43', 'administrativa': '43',
      'medico': '21', 'médico': '21', 'médica': '21', 'doctor': '21',
      'camarero': '51', 'camarera': '51',
      'electricista': '75',
      'mecanico': '74', 'mecánico': '74',
      'cocinero': '50', 'cocinera': '50', 'chef': '50',
      'arquitecto': '24', 'arquitecta': '24', 'ingeniero': '24', 'ingeniera': '24',
      'comercial': '35', 'vendedor': '52', 'vendedora': '52', 'dependiente': '52', 'dependienta': '52',
      'taxista': '83', 'conductor': '83', 'conductora': '83',
    };

    function search(q) {
      const qn = normalize(q.trim());
      if (!qn || qn.length < 2) return [];
      // Alias match first
      if (ALIASES[qn]) {
        const o = all.find(x => x.code === ALIASES[qn]);
        const others = all.filter(x => x.code !== ALIASES[qn] && normalize(x.title).includes(qn));
        return [o, ...others].filter(Boolean).slice(0, 6);
      }
      // Title substring
      const hits = all.filter(o => normalize(o.title).includes(qn) || normalize(o.fullTitle || '').includes(qn));
      return hits.slice(0, 6);
    }

    function render(results) {
      if (!results.length) { resultsBox.classList.remove('open'); resultsBox.innerHTML = ''; return; }
      resultsBox.innerHTML = results.map(o => {
        const cls = o.exposure >= 6 ? 'high' : (o.exposure <= 2.5 ? 'low' : '');
        return `
          <div class="search-result-row" data-code="${o.code}">
            <div>
              <div class="name">${o.title}</div>
              <div class="meta">${fmtJobs(o.jobs)} trabajadores · salario medio ${fmtMoney(o.pay)}</div>
            </div>
            <span class="exp-pill ${cls}">${o.exposure.toFixed(1)} / 10</span>
          </div>
        `;
      }).join('');
      resultsBox.classList.add('open');
      $$('.search-result-row', resultsBox).forEach(row => {
        row.addEventListener('click', () => {
          const code = row.dataset.code;
          const occ = all.find(o => o.code === code);
          if (occ) showProfessionDetail(occ);
          resultsBox.classList.remove('open');
        });
      });
    }

    input.addEventListener('input', (e) => {
      render(search(e.target.value));
    });

    // Pressing Enter / clicking the search button opens the top match
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const hits = search(input.value);
        if (hits.length) showProfessionDetail(hits[0]);
      });
    }

    $$('.search-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.dataset.suggest;
        input.value = q;
        const hits = search(q);
        // Open the top match directly — chips are pre-vetted shortcuts
        if (hits.length) showProfessionDetail(hits[0]);
      });
    });
  }

  function showProfessionDetail(o) {
    if (!o || !OCC) return;
    const overlay = document.getElementById('profession-overlay');
    const inner   = document.getElementById('profession-overlay-inner');
    if (!overlay || !inner) return;

    const all = OCC.all || [];

    // Helpers
    const expLevel = o.exposure >= 6.5 ? 'high' : o.exposure >= 3.5 ? 'med' : 'low';
    const expLabel = o.exposure >= 6.5 ? 'Exposición alta'
                    : o.exposure >= 3.5 ? 'Exposición moderada'
                    : 'Exposición baja';

    const outlookCls = o.outlook == null ? 'flat'
      : o.outlook >= 1 ? 'up' : o.outlook <= -1 ? 'down' : 'flat';
    const outlookArrow = outlookCls === 'up' ? '↗' : outlookCls === 'down' ? '↘' : '→';
    const outlookLabel = o.outlook == null ? '—'
      : o.outlook >= 4 ? 'Sube con fuerza'
      : o.outlook >= 0.5 ? 'Sube'
      : o.outlook >= -1 ? 'Estable'
      : o.outlook >= -4 ? 'Cae'
      : 'Cae con fuerza';

    // peers in same broad CNO category (first digit of code)
    const broad = (o.category || '').split('-')[0];
    const peers = all
      .filter(p => p.exposure != null)
      .filter(p => (p.category || '').split('-')[0] === broad)
      .sort((a, b) => b.exposure - a.exposure);

    // Best- and worst-exposure peers in same family + this one as "current"
    const peerExposureBars = peers.slice(0, 6).map(p => ({
      label: p.title,
      value: p.exposure,
      max: 10,
      suffix: ' / 10',
      current: p.code === o.code,
    }));

    // Comparison vs all 62 (national)
    const allWithExp = all.filter(p => p.exposure != null);
    const avgExp = allWithExp.reduce((s, p) => s + p.exposure, 0) / allWithExp.length;
    const allWithPay = all.filter(p => p.pay);
    const avgPay = allWithPay.reduce((s, p) => s + p.pay, 0) / allWithPay.length;
    const allWithOutlook = all.filter(p => p.outlook != null);
    const avgOutlook = allWithOutlook.reduce((s, p) => s + p.outlook, 0) / allWithOutlook.length;

    const nationalBars = [
      { label: 'Tu profesión', value: o.exposure, max: 10, suffix: ' / 10', current: true },
      { label: 'Media nacional', value: avgExp, max: 10, suffix: ' / 10', current: false },
    ];

    inner.innerHTML = `
      <button class="po-close" id="po-close" aria-label="Volver al inicio">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        Volver
      </button>

      <div class="po-eyebrow">
        <span class="po-code">CNO ${o.code}</span>
        <span>${expLabel}</span>
        ${o.exposure_confidence ? `<span>Confianza ${o.exposure_confidence.toFixed(1)} / 10</span>` : ''}
      </div>

      <h1 class="po-title">${o.title}</h1>
      <p class="po-subtitle">${o.fullTitle && o.fullTitle !== o.title ? o.fullTitle : ''}</p>

      <div class="po-gauge">
        <div class="po-gauge-left">
          <div class="gauge-label">Exposición a la IA</div>
          <div class="gauge-value">${o.exposure.toFixed(1)}<span class="gauge-suffix">/ 10</span></div>
          <span class="gauge-badge ${expLevel}">${expLabel}</span>
        </div>
        <div class="po-gauge-bar-wrap">
          <div class="po-gauge-bar">
            <div class="po-gauge-marker" id="po-marker"></div>
          </div>
          <div class="po-gauge-scale">
            <span>Baja · 0</span>
            <span>Moderada · 5</span>
            <span>Alta · 10</span>
          </div>
        </div>
      </div>

      <div class="po-metrics">
        <div class="po-metric">
          <div class="m-label">Trabajadores</div>
          <div class="m-value">${fmtJobs(o.jobs)}</div>
          <div class="m-detail"><strong>${(o.jobs || 0).toLocaleString('es-ES')}</strong> personas en España (${o.jobs_year || '—'})</div>
        </div>
        <div class="po-metric">
          <div class="m-label">Salario medio</div>
          <div class="m-value">${o.pay ? Math.round(o.pay/1000) + 'k' : '—'}<span class="m-suffix">€/año</span></div>
          <div class="m-detail">${o.pay ? `Bruto anual · INE ${o.pay_year || ''}` : 'No disponible para esta ocupación'}</div>
        </div>
        <div class="po-metric">
          <div class="m-label">Demanda laboral</div>
          <div class="m-value"><span class="po-trend ${outlookCls}">${outlookArrow} ${o.outlook == null ? '—' : (o.outlook >= 0 ? '+' : '') + o.outlook.toFixed(1) + '%'}</span></div>
          <div class="m-detail">${outlookLabel} · SEPE</div>
        </div>
      </div>

      <div class="po-context">
        <div class="po-context-card">
          <h4>Frente a la media nacional</h4>
          <div class="po-bar-list" data-bars='${JSON.stringify(nationalBars).replace(/'/g, '&#39;')}'></div>
        </div>
        <div class="po-context-card">
          <h4>Su familia ocupacional</h4>
          <div class="po-bar-list" data-bars='${JSON.stringify(peerExposureBars).replace(/'/g, '&#39;')}'></div>
        </div>
      </div>

      ${o.children_4d_count ? `
        <div class="po-children">
          <h3>Composición del grupo</h3>
          <p style="font-size: 14px; color: var(--color-muted); margin: 0 0 18px; max-width: 60ch;">
            Este grupo agrupa <strong style="color: var(--color-ink);">${o.children_4d_count}</strong> ocupaciones específicas (CNO de 4 dígitos).
            ${o.education ? `<br>Nivel educativo predominante: <em style="color: var(--color-ink); font-style: normal;">${o.education}</em>.` : ''}
          </p>
        </div>
      ` : ''}

      <div class="po-footer">
        <p>Exposición a la IA derivada con Gemini 3.1 Pro, agregada al nivel de grupo ocupacional CNO-2d y revisada por equipo. <em>Exposición no equivale a sustitución.</em></p>
        <p>Salarios: Encuesta de Estructura Salarial (INE). Demanda y tendencia: SEPE / Información del Mercado de Trabajo.</p>
      </div>
    `;

    // Render bars after innerHTML
    function renderBars(list, data) {
      list.innerHTML = data.map(b => {
        const pct = Math.min(100, (b.value / b.max) * 100);
        return `
          <div class="po-bar-row ${b.current ? 'current' : ''}">
            <span class="bar-label" title="${b.label}">${b.label}</span>
            <span class="bar-value">${b.value.toFixed(1)}${b.suffix || ''}</span>
            <div class="bar-track"><div class="bar-fill" data-w="${pct}"></div></div>
          </div>
        `;
      }).join('');
    }
    inner.querySelectorAll('.po-bar-list').forEach(list => {
      const bars = JSON.parse(list.dataset.bars);
      renderBars(list, bars);
    });

    // Open overlay
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('profession-open');
    overlay.scrollTop = 0;

    // Animate the bars + gauge marker
    requestAnimationFrame(() => {
      setTimeout(() => {
        inner.querySelectorAll('.bar-fill').forEach(f => {
          f.style.width = f.dataset.w + '%';
        });
        const marker = inner.querySelector('#po-marker');
        if (marker) marker.style.left = (o.exposure / 10 * 100) + '%';
      }, 60);
    });

    // Close handler
    const closeBtn = document.getElementById('po-close');
    if (closeBtn) closeBtn.addEventListener('click', closeProfession);
    // Esc to close
    document.addEventListener('keydown', escClose);
  }

  function escClose(e) {
    if (e.key === 'Escape') closeProfession();
  }
  function closeProfession() {
    const overlay = document.getElementById('profession-overlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('profession-open');
    document.removeEventListener('keydown', escClose);
  }

  /* ---------- 8. Tweaks: accent color + show rail + scroll style ---------- */
  function applyTweaks(t) {
    if (!t) return;
    const root = document.documentElement;
    if (t.accent) {
      root.style.setProperty('--color-primary', t.accent);
      // derive an active color (slightly darker)
      try {
        const hex = t.accent.replace('#','');
        const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
        const dr = Math.max(0, r - 26), dg = Math.max(0, g - 22), db = Math.max(0, b - 22);
        const dh = '#' + [dr,dg,db].map(x=>x.toString(16).padStart(2,'0')).join('');
        root.style.setProperty('--color-primary-active', dh);
      } catch(e){}
    }
    const rail = document.querySelector('.rail');
    if (rail) rail.style.display = (t.showRail === false) ? 'none' : '';
    if (t.scrollStyle === 'instant') {
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.classList.add('instant-scroll');
      document.body.classList.remove('no-fade-out');
    } else if (t.scrollStyle === 'no-fade-out') {
      document.documentElement.style.scrollBehavior = 'smooth';
      document.body.classList.add('no-fade-out');
      document.body.classList.remove('instant-scroll');
    } else {
      document.documentElement.style.scrollBehavior = 'smooth';
      document.body.classList.remove('no-fade-out');
      document.body.classList.remove('instant-scroll');
    }
  }

  // Expose so React tweaks panel can call back into this
  window.__iia = { applyTweaks, showProfessionDetail };

  /* ---------- INIT ---------- */
  function init() {
    setupRevealObserver();
    setupChapterFadeOut();
    setupRail();
    setupCounters();
    if (OCC) {
      // occupations.js may omit .all — fall back to scatter which has all 62 occupations
      if (!OCC.all) OCC.all = OCC.scatter || [];
      renderRanking('ranking-exposed', OCC.top10Exposed, 10);
      renderRanking('ranking-protected', OCC.top10Protected, 10);
      setupRankingBars();
      setupScatter();
      setupSearch();
    }
    // Apply tweaks from defaults
    applyTweaks(window.TWEAK_DEFAULTS || {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Override fade-out when body has no-fade-out class
  const style = document.createElement('style');
  style.textContent = `
    body.no-fade-out .chapter.fade-out .reveal {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
    body.no-fade-out .chapter-inner {
      opacity: 1 !important;
      transform: none !important;
    }
    body.instant-scroll .reveal,
    body.instant-scroll .chapter-inner {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }
  `;
  document.head.appendChild(style);

})();
