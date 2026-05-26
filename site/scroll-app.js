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
        document.querySelector('#chapter-3').scrollIntoView({behavior: 'smooth', block: 'start'});
        setTimeout(() => showProfessionDetail(o), 700);
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
      const r = Math.max(4, Math.min(14, Math.sqrt(p.jobs / 5000)));
      const danger = (p.exposure >= 6 && p.pay >= 30000);

      const dot = document.createElement('div');
      dot.className = 'scatter-dot' + (danger ? ' danger' : '');
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
    if (!input || !OCC) return;

    const allOcc = [
      ...OCC.top10Exposed,
      ...OCC.top10Protected,
      ...OCC.top10Growing,
      ...OCC.top10Declining,
      ...OCC.top10PayExp,
      ...OCC.scatter,
    ];
    // dedupe by code
    const map = new Map();
    allOcc.forEach(o => { if (!map.has(o.code)) map.set(o.code, o); });
    const all = Array.from(map.values());

    function normalize(s) {
      return (s || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function search(q) {
      q = normalize(q.trim());
      if (!q || q.length < 2) return [];
      return all
        .filter(o => normalize(o.title).includes(q))
        .slice(0, 6);
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
          showProfessionDetail(occ);
          resultsBox.classList.remove('open');
          input.value = occ.title.split(',')[0].slice(0, 40);
        });
      });
    }

    input.addEventListener('input', (e) => {
      render(search(e.target.value));
    });

    $$('.search-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.dataset.suggest;
        input.value = q;
        input.focus();
        render(search(q));
      });
    });
  }

  function showProfessionDetail(o) {
    if (!o) return;
    const mount = document.getElementById('profession-detail-mount');
    if (!mount) return;
    const expLabel = o.exposure >= 7 ? 'Alta' : o.exposure >= 4 ? 'Moderada' : 'Baja';
    const outlookLabel = o.outlook == null ? '—'
      : o.outlook >= 4 ? 'Sube con fuerza' : o.outlook >= 0.5 ? 'Sube' : o.outlook >= -1 ? 'Estable' : o.outlook >= -4 ? 'Cae' : 'Cae con fuerza';

    mount.innerHTML = `
      <div class="profession-detail" id="detail-${o.code}">
        <div class="pd-overline">Exposición a IA · ${expLabel.toLowerCase()}</div>
        <h3>${o.title}</h3>
        <div class="pd-grid">
          <div class="pd-cell">
            <div class="pd-label">Exposición IA</div>
            <div class="pd-value">${o.exposure.toFixed(1)}<span style="font-size: 1rem; color: var(--color-on-dark-soft);"> / 10</span></div>
            <div class="pd-suffix">${expLabel}</div>
          </div>
          <div class="pd-cell">
            <div class="pd-label">Salario medio</div>
            <div class="pd-value">${o.pay ? Math.round(o.pay/1000) + 'k' : '—'}<span style="font-size: 1rem; color: var(--color-on-dark-soft);">€</span></div>
            <div class="pd-suffix">${o.pay ? 'anual bruto' : 'no disponible'}</div>
          </div>
          <div class="pd-cell">
            <div class="pd-label">Demanda</div>
            <div class="pd-value">${o.outlook == null ? '—' : (o.outlook >= 0 ? '+' : '') + o.outlook.toFixed(1) + '%'}</div>
            <div class="pd-suffix">${outlookLabel}</div>
          </div>
        </div>
      </div>
    `;
    setTimeout(() => {
      const el = document.getElementById('detail-' + o.code);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
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
