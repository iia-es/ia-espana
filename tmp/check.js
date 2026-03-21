
const SHORT_CATEGORY_LABELS = {
  "0": "Militares",
  "1": "Directivos",
  "2": "Profesionales",
  "3": "Tecnicos",
  "4": "Oficina",
  "5": "Servicios",
  "6": "Agro",
  "7": "Oficios",
  "8": "Operarios",
  "9": "Elementales",
};

const AUTOMATION_BUCKETS = [
  { id: "very_low", range: "0-1", label: "Muy baja", color: "#3d6ea8" },
  { id: "low", range: "2-3", label: "Baja", color: "#60a6b0" },
  { id: "medium", range: "4-5", label: "Media", color: "#e1b64e" },
  { id: "high", range: "6-7", label: "Alta", color: "#d46d37" },
  { id: "very_high", range: "8-10", label: "Muy alta", color: "#a83a33" },
];

const EDUCATION_BUCKETS = [
  { id: "sin_estudios", label: "Sin estudios", color: "#b55a3a", match: [/sin estudios/i] },
  { id: "primaria", label: "Primaria", color: "#c9794b", match: [/educaci[oó]n primaria/i] },
  { id: "eso", label: "ESO", color: "#da9961", match: [/primera etapa de educaci[oó]n secundaria/i] },
  { id: "bachiller", label: "Bachillerato", color: "#e4b67e", match: [/orientaci[oó]n general/i] },
  { id: "fp_media", label: "FP media / postsec.", color: "#d9c78c", match: [/orientaci[oó]n profesional/i, /postsecundaria no superior/i] },
  { id: "fp_superior", label: "FP superior", color: "#9db88d", match: [/grado superior/i] },
  { id: "grado_corto", label: "Grado / diplomatura", color: "#6ea0a7", match: [/hasta 240 cr[eé]ditos/i, /diplomados universitarios/i] },
  { id: "grado_largo", label: "Grado largo / licenciatura", color: "#4e7f91", match: [/m[aá]s de 240 cr[eé]ditos/i, /licenciados/i] },
  { id: "master", label: "Master / especialidad", color: "#335b78", match: [/m[aá]steres/i, /especialidades en ciencias de la salud/i] },
  { id: "doctorado", label: "Doctorado", color: "#1c3d54", match: [/doctorado/i] },
];

const EDUCATION_BUCKET_SCORES = {
  sin_estudios: 0,
  primaria: 1,
  eso: 2,
  bachiller: 3,
  fp_media: 4,
  fp_superior: 5,
  grado_corto: 6,
  grado_largo: 7,
  master: 8,
  doctorado: 9,
};

const STATE = {
  compact: [],
  canonicalByCode: new Map(),
  detailsBy2d: new Map(),
  meta: null,
  occupations: [],
  colorMode: "exposure",
  search: "",
  selectedCode: null,
  selectedChildCode: null,
  tiles: [],
  groups: [],
  resizeTimer: null,
};

const nfInteger = new Intl.NumberFormat("es-ES");
const nfCompact = new Intl.NumberFormat("es-ES", { notation: "compact", maximumFractionDigits: 1 });
const nfCurrency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const nfCurrencyPrecise = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});
const nfPercent = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const treemapEl = document.getElementById("treemap");
const detailPanelEl = document.getElementById("detailPanel");
const headlineGridEl = document.getElementById("headlineGrid");
const rankingGridEl = document.getElementById("rankingGrid");
const legendEl = document.getElementById("legend");
const searchInputEl = document.getElementById("searchInput");
const mapHeadlineEl = document.getElementById("mapHeadline");
const coverageChipsEl = document.getElementById("coverageChips");
const footerNoteEl = document.getElementById("footerNote");
const tooltipEl = document.getElementById("tooltip");
const tooltipTitleEl = document.getElementById("tooltipTitle");
const tooltipGridEl = document.getElementById("tooltipGrid");

function formatCompact(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return nfCompact.format(value);
}

function formatInteger(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return nfInteger.format(Math.round(value));
}

function formatCurrency(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return nfCurrency.format(value);
}

function formatCurrencyPrecise(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return nfCurrencyPrecise.format(value);
}

function formatPct(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return "—";
  const fixed = Number(value).toFixed(digits).replace(".", ",");
  return `${Number(value) > 0 ? "+" : ""}${fixed}%`;
}

function formatExposure(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Number(value).toFixed(1).replace(".", ",")}/10`;
}

function friendlyModelName(model) {
  if (!model) return "un modelo de IA";
  if (model === "google/gemini-3.1-pro-preview") return "Gemini 3.1 Pro Preview";
  return model;
}

function salaryPercentileLabel(label) {
  const mapping = {
    p10: "10% cobra menos de",
    p25: "25% cobra menos de",
    p50: "La mitad cobra menos de",
    p75: "75% cobra menos de",
    p90: "90% cobra menos de",
  };
  return mapping[String(label || "").toLowerCase()] || String(label || "").toUpperCase();
}

function automationBucket(value) {
  if (value == null || Number.isNaN(value)) return null;
  if (value < 2) return AUTOMATION_BUCKETS[0];
  if (value < 4) return AUTOMATION_BUCKETS[1];
  if (value < 6) return AUTOMATION_BUCKETS[2];
  if (value < 8) return AUTOMATION_BUCKETS[3];
  return AUTOMATION_BUCKETS[4];
}

function automationColor(value, alpha = 0.94) {
  const bucket = automationBucket(value);
  if (!bucket) return "rgba(132, 132, 132, 0.44)";
  return rgbToCss(hexToRgb(bucket.color), alpha);
}

function automationLabel(value) {
  return automationBucket(value)?.label || "Sin dato";
}

function automationBadge(text, value, fallback = "Sin estimacion IA") {
  const bucket = automationBucket(value);
  if (!bucket) {
    return `<span class="badge">${fallback}</span>`;
  }
  return `
    <span
      class="badge automation-badge"
      style="background:${automationColor(value, 0.16)};border-color:${automationColor(value, 0.34)};color:${bucket.color}"
    >${text}</span>
  `;
}

function stripCodePrefix(label) {
  return String(label || "").replace(/^\d{1,4}\s+/, "");
}

function shortenTitle(label, max = 48) {
  const clean = stripCodePrefix(label).replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  if (clean.includes(";")) {
    const first = clean.split(";")[0].trim();
    if (first.length <= max) return first;
  }
  return clean.slice(0, Math.max(18, max - 1)).trim() + "…";
}

function educationBucket(label) {
  const text = String(label || "");
  return EDUCATION_BUCKETS.find((bucket) => bucket.match.some((rx) => rx.test(text))) || null;
}

function educationScoreValue(distribution, fallbackLabel) {
  const rows = Array.isArray(distribution) ? distribution : [];
  let weighted = 0;
  let total = 0;
  for (const row of rows) {
    const bucket = educationBucket(row.label);
    const share = Number(row.share);
    if (!bucket || Number.isNaN(share)) continue;
    weighted += (EDUCATION_BUCKET_SCORES[bucket.id] || 0) * share;
    total += share;
  }
  if (total > 0) return weighted / total;
  const fallbackBucket = educationBucket(fallbackLabel);
  return fallbackBucket ? EDUCATION_BUCKET_SCORES[fallbackBucket.id] || 0 : null;
}

function competitionRatioValue(demandants, contracts) {
  const d = Number(demandants);
  const c = Number(contracts);
  if (!Number.isFinite(d) || !Number.isFinite(c) || d <= 0 || c <= 0) return null;
  return d / c;
}

function competitionPer100(ratio) {
  if (ratio == null || Number.isNaN(ratio)) return "—";
  return `${Math.round(ratio * 100)} por cada 100 contratos`;
}

function shieldingLabel(value) {
  if (value == null || Number.isNaN(value)) return "Sin estimación";
  if (value < 2) return "Muy blindada";
  if (value < 4) return "Bastante blindada";
  if (value < 6) return "Intermedia";
  if (value < 8) return "Bastante expuesta";
  return "Muy expuesta";
}

function combinedStudyShieldScore(occupation) {
  if (occupation.educationScore == null || occupation.exposure == null) return null;
  const educationPart = occupation.educationScore / 9;
  const shieldPart = (10 - occupation.exposure) / 10;
  return educationPart * 0.55 + shieldPart * 0.45;
}

function combinedEasyVulnerableScore(occupation) {
  if (occupation.educationScore == null || occupation.exposure == null) return null;
  const lowEducationPart = 1 - (occupation.educationScore / 9);
  const exposurePart = occupation.exposure / 10;
  return lowEducationPart * 0.45 + exposurePart * 0.55;
}

function competitionShieldScore(occupation, maxCompetitionRatio) {
  if (occupation.competitionRatio == null || occupation.exposure == null || !maxCompetitionRatio) return null;
  const competitionPart = Math.min(occupation.competitionRatio / maxCompetitionRatio, 1);
  const shieldPart = (10 - occupation.exposure) / 10;
  return competitionPart * 0.62 + shieldPart * 0.38;
}

function educationLegendBuckets() {
  const used = new Map();
  for (const occupation of STATE.occupations) {
    const bucket = educationBucket(occupation.education);
    if (bucket) used.set(bucket.id, bucket);
  }
  return EDUCATION_BUCKETS.filter((bucket) => used.has(bucket.id));
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const size = clean.length === 3 ? 1 : 2;
  const values = [];
  for (let i = 0; i < clean.length; i += size) {
    const part = clean.slice(i, i + size);
    values.push(parseInt(size === 1 ? part + part : part, 16));
  }
  return values;
}

function rgbToCss(rgb, alpha = 1) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function interpolateColor(a, b, t) {
  const clamped = Math.max(0, Math.min(1, t));
  return [
    Math.round(a[0] + (b[0] - a[0]) * clamped),
    Math.round(a[1] + (b[1] - a[1]) * clamped),
    Math.round(a[2] + (b[2] - a[2]) * clamped),
  ];
}

function divergingColor(value, min, center, max, lowHex, midHex, highHex, alpha = 1) {
  if (value == null || Number.isNaN(value)) return "rgba(132, 132, 132, 0.44)";
  const low = hexToRgb(lowHex);
  const mid = hexToRgb(midHex);
  const high = hexToRgb(highHex);
  if (value <= center) {
    const t = (value - min) / (center - min || 1);
    return rgbToCss(interpolateColor(low, mid, t), alpha);
  }
  const t = (value - center) / (max - center || 1);
  return rgbToCss(interpolateColor(mid, high, t), alpha);
}

function sequentialColor(value, min, max, lowHex, highHex, alpha = 1) {
  if (value == null || Number.isNaN(value)) return "rgba(132, 132, 132, 0.44)";
  const low = hexToRgb(lowHex);
  const high = hexToRgb(highHex);
  const t = (value - min) / (max - min || 1);
  return rgbToCss(interpolateColor(low, high, t), alpha);
}

function luminanceFromCss(color) {
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) return 1;
  const parts = match[1].split(",").map((part) => Number(part.trim()));
  const [r, g, b] = parts;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function tileColor(occupation) {
  if (STATE.colorMode === "trend") {
    return divergingColor(occupation.outlook, -8, 0, 8, "#c2613c", "#f5ebd8", "#1f6a6c", 0.94);
  }
  if (STATE.colorMode === "pay") {
    const payMin = 12000;
    const payMax = 80000;
    const value = occupation.pay == null ? null : Math.log(Math.max(payMin, occupation.pay));
    return sequentialColor(
      value,
      Math.log(payMin),
      Math.log(payMax),
      "#eedfc5",
      "#18384b",
      0.94,
    );
  }
  if (STATE.colorMode === "demandants") {
    return sequentialColor(occupation.demandants, 0, 125000, "#f4eee0", "#ab5534", 0.94);
  }
  if (STATE.colorMode === "exposure") {
    return automationColor(occupation.exposure, 0.96);
  }
  const bucket = educationBucket(occupation.education);
  if (!bucket) return "rgba(132, 132, 132, 0.44)";
  const rgb = hexToRgb(bucket.color);
  return rgbToCss(rgb, 0.94);
}

function tileSubline(occupation) {
  if (STATE.colorMode === "trend") {
    return `${formatPct(occupation.outlook, 2)} frente a hace un año`;
  }
  if (STATE.colorMode === "pay") {
    return occupation.pay == null ? "Sin dato salarial" : `${formatCurrency(occupation.pay)} al año`;
  }
  if (STATE.colorMode === "demandants") {
    return `${formatCompact(occupation.demandants)} personas la buscan`;
  }
  if (STATE.colorMode === "exposure") {
    return occupation.exposure == null ? "Sin estimación" : `${automationLabel(occupation.exposure)} · ${formatExposure(occupation.exposure)}`;
  }
  const bucket = educationBucket(occupation.education);
  return bucket ? bucket.label : "Sin dato educativo";
}

function tooltipRows(occupation) {
  return [
    ["Personas trabajando", formatCompact(occupation.jobs)],
    ["Salario", occupation.pay == null ? "Sin dato disponible" : formatCurrency(occupation.pay)],
    ["Cambio en contratos", formatPct(occupation.outlook, 2)],
    ["Personas que buscan esta ocupación", formatCompact(occupation.demandants)],
    ["Automatizable por IA", formatExposure(occupation.exposure)],
  ];
}

function buildMergedOccupations() {
  const occupations = STATE.compact.map((row) => {
    const canonical = STATE.canonicalByCode.get(row.code);
    const trend = canonical?.trend_proxy || {};
    const pay = canonical?.pay || {};
    const education = canonical?.education || {};
    return {
      ...row,
      canonical,
      categoryCode: canonical?.major_group_code || row.category.split("-")[0],
      categoryLabel: canonical?.major_group_label || row.category,
      jobs: row.jobs ?? canonical?.jobs_stock?.value ?? null,
      pay: row.pay ?? pay.mean_annual_gross ?? null,
      payLowReliability: pay.mean_low_reliability || false,
      payProxyMonth: canonical?.pay_monthly_major_group_proxy?.value ?? null,
      payPercentiles: pay.percentiles_annual_gross || {},
      education: row.education ?? education.dominant_level ?? null,
      educationDistribution: education.distribution || [],
      outlook: row.outlook ?? trend.contracts_yoy_pct ?? null,
      demandants: trend.demandants ?? null,
      unemployed: trend.unemployed ?? null,
      contracts: trend.contracts ?? null,
      contractPersons: trend.contract_persons ?? null,
      demandantsYoy: trend.demandants_yoy_pct ?? null,
      exposure: row.exposure ?? canonical?.ai_exposure?.value ?? null,
      exposureConfidence: row.exposure_confidence ?? canonical?.ai_exposure?.confidence ?? null,
      exposureQuality: row.exposure_quality ?? canonical?.ai_exposure?.quality ?? null,
      exposureModel: row.exposure_model ?? canonical?.ai_exposure?.model ?? null,
      exposureChildren: canonical?.ai_exposure?.top_weighted_children || [],
      children4d: canonical?.children_4d || row.children_4d || [],
      details4d: STATE.detailsBy2d.get(row.code) || [],
      educationScore: educationScoreValue(education.distribution || [], row.education ?? education.dominant_level ?? null),
      competitionRatio: competitionRatioValue(trend.demandants, trend.contracts),
      salaryYear: row.pay_year ?? pay.reference_year ?? null,
      jobsYear: row.jobs_year ?? canonical?.jobs_stock?.reference_year ?? null,
      demandYear: trend.reference_year ?? null,
    };
  });

  occupations.sort((a, b) => (b.jobs || 0) - (a.jobs || 0));
  return occupations;
}

function squarify(items, x, y, w, h) {
  if (!items.length) return [];
  if (items.length === 1) return [{ ...items[0], rx: x, ry: y, rw: w, rh: h }];
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (!total) return [];

  const results = [];
  let remaining = items.slice();
  let cx = x;
  let cy = y;
  let cw = w;
  let ch = h;

  while (remaining.length > 0) {
    const remTotal = remaining.reduce((sum, item) => sum + item.value, 0);
    const vertical = cw >= ch;
    const side = vertical ? ch : cw;
    let row = [remaining[0]];
    let rowSum = remaining[0].value;

    for (let index = 1; index < remaining.length; index += 1) {
      const candidate = row.concat(remaining[index]);
      const candidateSum = rowSum + remaining[index].value;
      if (worstAspect(candidate, candidateSum, side, remTotal, vertical ? cw : ch) <
          worstAspect(row, rowSum, side, remTotal, vertical ? cw : ch)) {
        row = candidate;
        rowSum = candidateSum;
      } else {
        break;
      }
    }

    const rowFraction = rowSum / remTotal;
    const rowThickness = vertical ? cw * rowFraction : ch * rowFraction;
    let offset = 0;
    for (const item of row) {
      const itemFraction = item.value / rowSum;
      const itemLength = side * itemFraction;
      if (vertical) {
        results.push({ ...item, rx: cx, ry: cy + offset, rw: rowThickness, rh: itemLength });
      } else {
        results.push({ ...item, rx: cx + offset, ry: cy, rw: itemLength, rh: rowThickness });
      }
      offset += itemLength;
    }

    if (vertical) {
      cx += rowThickness;
      cw -= rowThickness;
    } else {
      cy += rowThickness;
      ch -= rowThickness;
    }
    remaining = remaining.slice(row.length);
  }

  return results;
}

function worstAspect(row, rowSum, side, totalArea, availableExtent) {
  const rowExtent = availableExtent * (rowSum / totalArea);
  if (rowExtent === 0) return Infinity;
  let worst = 0;
  for (const item of row) {
    const itemLength = side * (item.value / rowSum);
    if (!itemLength) continue;
    const aspect = Math.max(rowExtent / itemLength, itemLength / rowExtent);
    if (aspect > worst) worst = aspect;
  }
  return worst;
}

function buildLayout() {
  const width = treemapEl.clientWidth;
  const height = Math.max(620, Math.round(width * 0.74));
  treemapEl.style.height = `${height}px`;

  const outerGap = 12;
  const groupGap = 8;
  const tileGap = 6;
  const groupHeader = 30;

  const categories = Array.from(
    STATE.occupations.reduce((map, occupation) => {
      const key = occupation.categoryCode;
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: occupation.categoryLabel,
          value: 0,
          items: [],
        });
      }
      const bucket = map.get(key);
      bucket.value += occupation.jobs || 1;
      bucket.items.push({ ...occupation, value: occupation.jobs || 1 });
      return map;
    }, new Map()).values(),
  ).sort((a, b) => b.value - a.value);

  const groupRects = squarify(categories, outerGap, outerGap, width - outerGap * 2, height - outerGap * 2);
  return groupRects.map((groupRect) => {
    const innerWidth = Math.max(0, groupRect.rw - groupGap * 2);
    const innerHeight = Math.max(0, groupRect.rh - groupGap * 2 - groupHeader);
    const tiles = squarify(
      groupRect.items.sort((a, b) => (b.jobs || 0) - (a.jobs || 0)),
      groupGap,
      groupGap + groupHeader,
      innerWidth,
      innerHeight,
    ).map((tile) => ({
      ...tile,
      x: tile.rx,
      y: tile.ry,
      w: tile.rw,
      h: tile.rh,
    }));

    return {
      ...groupRect,
      label: SHORT_CATEGORY_LABELS[groupRect.key] || groupRect.label,
      tiles: tiles.map((tile) => ({
        ...tile,
        x: tile.x + tileGap / 2,
        y: tile.y + tileGap / 2,
        w: Math.max(0, tile.w - tileGap),
        h: Math.max(0, tile.h - tileGap),
      })),
    };
  });
}

function renderLegend() {
  legendEl.className = STATE.colorMode === "exposure" ? "legend exposure-legend" : "legend";

  if (STATE.colorMode === "exposure") {
    legendEl.innerHTML = `
      ${AUTOMATION_BUCKETS.map((bucket) => `
        <span class="legend-pill emphasis">
          <span class="legend-swatch" style="background:${bucket.color}"></span>
          ${bucket.range} · ${bucket.label}
        </span>
      `).join("")}
      <span class="legend-pill"><span class="legend-swatch" style="background:rgba(132,132,132,0.44)"></span>Sin dato</span>
      <span class="legend-caption">Azul = menos automatizable por IA. Rojo = más automatizable por IA.</span>
    `;
    return;
  }

  if (STATE.colorMode === "education") {
    const pills = educationLegendBuckets().map((bucket) => `
      <span class="legend-pill"><span class="legend-swatch" style="background:${bucket.color}"></span>${bucket.label}</span>
    `).join("");
    legendEl.innerHTML = pills;
    return;
  }

  const gradient = STATE.colorMode === "trend"
    ? "linear-gradient(90deg, #c2613c 0%, #f5ebd8 50%, #1f6a6c 100%)"
    : STATE.colorMode === "pay"
    ? "linear-gradient(90deg, #eedfc5 0%, #18384b 100%)"
    : STATE.colorMode === "exposure"
    ? "linear-gradient(90deg, #f1e5c9 0%, #5d245c 100%)"
    : "linear-gradient(90deg, #f4eee0 0%, #ab5534 100%)";

  const left = STATE.colorMode === "trend"
    ? "Cae"
    : STATE.colorMode === "pay"
    ? "Menor salario"
    : STATE.colorMode === "exposure"
    ? "Menor exposicion"
    : "Menos";
  const right = STATE.colorMode === "trend"
    ? "Sube"
    : STATE.colorMode === "pay"
    ? "Mayor salario"
    : STATE.colorMode === "exposure"
    ? "Mayor exposicion"
    : "Mas";

  legendEl.innerHTML = `
    <span class="legend-label">${left}</span>
    <span class="legend-gradient" style="background:${gradient}"></span>
    <span class="legend-label">${right}</span>
    <span class="legend-pill"><span class="legend-swatch" style="background:rgba(132,132,132,0.44)"></span>Sin dato</span>
  `;
}

function attachSelectionHandlers(root) {
  if (!root) return;
  root.querySelectorAll("[data-select-code]").forEach((node) => {
    node.addEventListener("click", () => setSelectedOccupation(node.getAttribute("data-select-code")));
  });
}

function renderEditorial() {
  const aiModel = friendlyModelName(STATE.occupations.find((occupation) => occupation.exposureModel)?.exposureModel);
  const exposureCandidates = STATE.occupations.filter((occupation) => occupation.jobs != null && occupation.exposure != null);
  const educationCandidates = exposureCandidates.filter((occupation) => occupation.educationScore != null);
  const competitionCandidates = STATE.occupations.filter((occupation) =>
    occupation.competitionRatio != null && (occupation.contracts || 0) >= 10000 && (occupation.demandants || 0) >= 1000
  );
  const competitionShieldCandidates = competitionCandidates.filter((occupation) => occupation.exposure != null);
  const maxCompetitionRatio = competitionShieldCandidates.length
    ? Math.max(...competitionShieldCandidates.map((occupation) => occupation.competitionRatio || 0), 1)
    : 1;
  const wellPaidShieldedCandidates = exposureCandidates.filter((occupation) => occupation.pay != null && occupation.exposure <= 4);

  const mostShielded = exposureCandidates
    .slice()
    .sort((a, b) => (a.exposure - b.exposure) || ((b.jobs || 0) - (a.jobs || 0)))[0];
  const mostExposed = exposureCandidates
    .slice()
    .sort((a, b) => (b.exposure - a.exposure) || ((b.jobs || 0) - (a.jobs || 0)))[0];
  const studyShielded = educationCandidates
    .slice()
    .sort((a, b) => (combinedStudyShieldScore(b) - combinedStudyShieldScore(a)) || ((b.jobs || 0) - (a.jobs || 0)))[0];
  const easyVulnerable = educationCandidates
    .slice()
    .sort((a, b) => (combinedEasyVulnerableScore(b) - combinedEasyVulnerableScore(a)) || ((b.jobs || 0) - (a.jobs || 0)))[0];

  const headlineCards = [
    mostShielded && {
      question: "La mas blindada a la IA ahora mismo",
      title: mostShielded.title,
      tag: shieldingLabel(mostShielded.exposure),
      value: `Automatizable por IA: ${formatExposure(mostShielded.exposure)}`,
      meta: `${formatCompact(mostShielded.jobs)} personas trabajando · estudios mas habituales: ${educationBucket(mostShielded.education)?.label || mostShielded.education || "sin dato"}.`,
      code: mostShielded.code,
      featured: true,
      accent: automationColor(mostShielded.exposure, 0.24),
    },
    mostExposed && {
      question: "La mas automatizable por IA",
      title: mostExposed.title,
      tag: shieldingLabel(mostExposed.exposure),
      value: `Automatizable por IA: ${formatExposure(mostExposed.exposure)}`,
      meta: `${formatCompact(mostExposed.jobs)} personas trabajando · salario medio ${mostExposed.pay == null ? "sin dato" : formatCurrency(mostExposed.pay)}.`,
      code: mostExposed.code,
      accent: automationColor(mostExposed.exposure, 0.24),
    },
    studyShielded && {
      question: "Pide mas estudios y esta mejor blindada",
      title: studyShielded.title,
      tag: "Estudios + blindaje",
      value: `${educationBucket(studyShielded.education)?.label || studyShielded.education || "Sin dato"} · ${formatExposure(studyShielded.exposure)}`,
      meta: `Cruce entre estudios habituales y blindaje frente a la IA. ${formatCompact(studyShielded.jobs)} personas trabajando.`,
      code: studyShielded.code,
      accent: automationColor(studyShielded.exposure, 0.2),
    },
    easyVulnerable && {
      question: "Pide menos estudios y esta mas expuesta",
      title: easyVulnerable.title,
      tag: "Menos barrera, mas riesgo",
      value: `${educationBucket(easyVulnerable.education)?.label || easyVulnerable.education || "Sin dato"} · ${formatExposure(easyVulnerable.exposure)}`,
      meta: `Cruce entre menor exigencia de estudios y mayor automatizacion. ${formatCompact(easyVulnerable.jobs)} personas trabajando.`,
      code: easyVulnerable.code,
      accent: automationColor(easyVulnerable.exposure, 0.22),
    },
  ].filter(Boolean);

  headlineGridEl.innerHTML = headlineCards.map((card) => `
    <button
      class="headline-card ${card.featured ? "featured" : ""} ${card.code === STATE.selectedCode ? "active" : ""}"
      data-select-code="${card.code}"
      style="--story-accent:${card.accent}"
    >
      <span class="headline-eyebrow">${card.question}</span>
      <span class="headline-tag">${card.tag}</span>
      <h3 class="headline-title">${card.title}</h3>
      <div class="headline-value">${card.value}</div>
      <p class="headline-meta">${card.meta}</p>
      <span class="headline-foot">Abrir ficha</span>
    </button>
  `).join("");

  const rankingCards = [
    {
      title: "Top 5 mas blindadas",
      note: "Las que salen con menor nota de automatizacion.",
      items: exposureCandidates
        .slice()
        .sort((a, b) => (a.exposure - b.exposure) || ((b.jobs || 0) - (a.jobs || 0)))
        .slice(0, 4)
        .map((occupation) => ({
          code: occupation.code,
          name: occupation.title,
          value: formatExposure(occupation.exposure),
          meta: `${shieldingLabel(occupation.exposure)} · ${formatCompact(occupation.jobs)} trabajando`,
        })),
    },
    {
      title: "Top 5 mas automatizables",
      note: "Las que salen con mayor nota de automatizacion.",
      items: exposureCandidates
        .slice()
        .sort((a, b) => (b.exposure - a.exposure) || ((b.jobs || 0) - (a.jobs || 0)))
        .slice(0, 4)
        .map((occupation) => ({
          code: occupation.code,
          name: occupation.title,
          value: formatExposure(occupation.exposure),
          meta: `${shieldingLabel(occupation.exposure)} · ${formatCompact(occupation.jobs)} trabajando`,
        })),
    },
    {
      title: "Donde cuesta entrar y ademas esta mejor blindada",
      note: "Cruza competencia para entrar con menor automatizacion por IA.",
      items: competitionShieldCandidates
        .slice()
        .sort((a, b) =>
          (competitionShieldScore(b, maxCompetitionRatio) - competitionShieldScore(a, maxCompetitionRatio)) ||
          ((b.competitionRatio || 0) - (a.competitionRatio || 0)) ||
          ((a.exposure || 10) - (b.exposure || 10))
        )
        .slice(0, 4)
        .map((occupation) => ({
          code: occupation.code,
          name: occupation.title,
          value: `${competitionPer100(occupation.competitionRatio)} · IA ${formatExposure(occupation.exposure)}`,
          meta: `${shieldingLabel(occupation.exposure)} · ${formatCompact(occupation.demandants)} personas lo buscan`,
        })),
    },
    {
      title: "Mejor pagadas entre las mas blindadas",
      note: "Salario alto con automatizacion baja o moderada.",
      items: wellPaidShieldedCandidates
        .slice()
        .sort((a, b) => (b.pay - a.pay) || (a.exposure - b.exposure))
        .slice(0, 4)
        .map((occupation) => ({
          code: occupation.code,
          name: occupation.title,
          value: formatCurrency(occupation.pay),
          meta: `Automatizable por IA: ${formatExposure(occupation.exposure)}`,
        })),
    },
  ];

  rankingGridEl.innerHTML = rankingCards.map((card) => `
    <section class="ranking-card">
      <h3>${card.title}</h3>
      <p>${card.note}</p>
      <div class="ranking-list">
        ${card.items.map((item, index) => `
          <button class="ranking-item ${item.code === STATE.selectedCode ? "active" : ""}" data-select-code="${item.code}">
            <span class="ranking-rank">${index + 1}</span>
            <span class="ranking-main">
              <span class="ranking-name">${item.name}</span>
              <span class="ranking-meta">${item.meta}</span>
            </span>
            <span class="ranking-value">${item.value}</span>
          </button>
        `).join("")}
      </div>
    </section>
  `).join("");

  attachSelectionHandlers(headlineGridEl);
  attachSelectionHandlers(rankingGridEl);

  coverageChipsEl.innerHTML = `
    <span class="chip">${STATE.meta.occupation_2d_count} grupos amplios</span>
    <span class="chip">${STATE.meta.occupation_4d_count} trabajos concretos</span>
    <span class="chip">IA estimada con ${aiModel}</span>
  `;

  footerNoteEl.innerHTML = `La vista Automatizable por IA es una estimacion hecha con ${aiModel} a partir de descripciones oficiales de trabajos concretos, y despues resumida en grupos mas amplios. Es orientativa: con otros criterios o con otro modelo se podria llegar a notas distintas.`;
}

function selectedOccupation() {
  return STATE.occupations.find((occupation) => occupation.code === STATE.selectedCode) || null;
}

function childDetailsFor(code) {
  const occupation = STATE.occupations.find((item) => item.code === code);
  if (!occupation) return [];
  return occupation.details4d.slice().sort((a, b) => (b.contracts || 0) - (a.contracts || 0));
}

function ensureSelectedChild() {
  const children = childDetailsFor(STATE.selectedCode);
  if (!children.length) {
    STATE.selectedChildCode = null;
    return;
  }
  const exists = children.some((child) => child.cno_4d === STATE.selectedChildCode);
  if (!exists) {
    STATE.selectedChildCode = children[0].cno_4d;
  }
}

function setSelectedOccupation(code) {
  STATE.selectedCode = code;
  ensureSelectedChild();
  renderEditorial();
  renderTreemap();
  renderDetailPanel();
}

function setSelectedChild(code) {
  STATE.selectedChildCode = code;
  renderDetailPanel();
}

function currentSearchMatcher(occupation) {
  const query = STATE.search.trim().toLowerCase();
  if (!query) return { matches: true, exact: false };
  const haystack = `${occupation.code} ${occupation.title} ${occupation.slug}`.toLowerCase();
  const matches = haystack.includes(query);
  const exact = occupation.code.toLowerCase() === query || occupation.slug.toLowerCase() === query;
  return { matches, exact };
}

function renderTreemap() {
  const groups = buildLayout();
  treemapEl.innerHTML = "";

  for (const group of groups) {
    const groupEl = document.createElement("div");
    groupEl.className = "group-frame";
    groupEl.style.left = `${group.rx}px`;
    groupEl.style.top = `${group.ry}px`;
    groupEl.style.width = `${group.rw}px`;
    groupEl.style.height = `${group.rh}px`;

    const labelEl = document.createElement("div");
    labelEl.className = "group-label";
    labelEl.textContent = group.label;
    groupEl.appendChild(labelEl);

    for (const tile of group.tiles) {
      const occupation = STATE.occupations.find((item) => item.code === tile.code);
      const matcher = currentSearchMatcher(occupation);
      const tileEl = document.createElement("button");
      tileEl.className = "tile";
      if (occupation.code === STATE.selectedCode) tileEl.classList.add("selected");
      if (STATE.search && !matcher.matches) tileEl.classList.add("dimmed");
      if (STATE.search && matcher.matches) tileEl.classList.add("matching");
      tileEl.style.left = `${tile.x}px`;
      tileEl.style.top = `${tile.y}px`;
      tileEl.style.width = `${Math.max(0, tile.w)}px`;
      tileEl.style.height = `${Math.max(0, tile.h)}px`;

      const background = tileColor(occupation);
      const darkText = luminanceFromCss(background) < 0.55;
      tileEl.style.background = background;
      tileEl.style.color = darkText ? "#fff9f3" : "#14212a";

      const width = tile.w;
      const height = tile.h;
      const titleMax = width > 200 && height > 110 ? 76 : width > 130 ? 50 : 26;
      const title = width < 92 || height < 58 ? occupation.code : shortenTitle(occupation.title, titleMax);
      const showSub = width > 110 && height > 76;
      const titleSize = Math.max(12, Math.min(24, Math.min(width / 7.5, height / 4.2)));

      tileEl.innerHTML = `
        <span class="tile-title" style="font-size:${titleSize}px">${title}</span>
        ${showSub ? `<span class="tile-sub">${tileSubline(occupation)}</span>` : ""}
      `;

      tileEl.addEventListener("mouseenter", (event) => showTooltip(occupation, event));
      tileEl.addEventListener("mousemove", (event) => moveTooltip(event));
      tileEl.addEventListener("mouseleave", hideTooltip);
      tileEl.addEventListener("click", () => setSelectedOccupation(occupation.code));
      groupEl.appendChild(tileEl);
    }

    treemapEl.appendChild(groupEl);
  }

  mapHeadlineEl.textContent = ({
    trend: "Tamano = personas trabajando en 2023. Color = mas o menos contratos que hace un ano.",
    pay: "Tamano = personas trabajando en 2023. Color = salario medio anual.",
    education: "Tamano = personas trabajando en 2023. Color = estudios mas habituales.",
    demandants: "Tamano = personas trabajando en 2023. Color = personas que buscan esta ocupacion.",
    exposure: "Tamano = personas trabajando en 2023. Color = cuanto puede automatizarse con IA.",
  })[STATE.colorMode];
}

function showTooltip(occupation, event) {
  tooltipTitleEl.textContent = `${occupation.code} · ${occupation.title}`;
  tooltipGridEl.innerHTML = tooltipRows(occupation)
    .map(([label, value]) => `<span class="label">${label}</span><span class="value">${value}</span>`)
    .join("");
  tooltipEl.classList.add("visible");
  tooltipEl.setAttribute("aria-hidden", "false");
  moveTooltip(event);
}

function moveTooltip(event) {
  const padding = 16;
  const width = 320;
  const rect = tooltipEl.getBoundingClientRect();
  let left = event.clientX + 18;
  let top = event.clientY - 12;
  if (left + width > window.innerWidth - padding) {
    left = event.clientX - width - 18;
  }
  if (top + rect.height > window.innerHeight - padding) {
    top = event.clientY - rect.height - 18;
  }
  if (top < padding) top = padding;
  tooltipEl.style.left = `${left}px`;
  tooltipEl.style.top = `${top}px`;
}

function hideTooltip() {
  tooltipEl.classList.remove("visible");
  tooltipEl.setAttribute("aria-hidden", "true");
}

function renderBarList(items, formatter, colorForItem) {
  if (!items.length) {
    return `<div class="empty">No hay datos disponibles para este bloque.</div>`;
  }
  const max = Math.max(...items.map((item) => item.value || 0), 1);
  return `
    <div class="bar-list">
      ${items.map((item) => {
        const width = ((item.value || 0) / max) * 100;
        return `
          <div class="bar-row">
            <div class="bar-meta">
              <span class="bar-label">${item.label}</span>
              <div class="bar-track"><div class="bar-fill" style="width:${width}%;background:${colorForItem(item)}"></div></div>
            </div>
            <span class="bar-value">${formatter(item)}</span>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderDetailPanel() {
  const occupation = selectedOccupation();
  if (!occupation) {
    detailPanelEl.innerHTML = `<div class="empty">No hay ocupacion seleccionada.</div>`;
    return;
  }

  ensureSelectedChild();
  const children = childDetailsFor(occupation.code);
  const selectedChild = children.find((child) => child.cno_4d === STATE.selectedChildCode) || null;
  const educationBars = (occupation.educationDistribution || [])
    .slice(0, 6)
    .map((item) => ({
      label: educationBucket(item.label)?.label || item.label,
      value: item.share || 0,
      rawValue: item.value,
      bucket: educationBucket(item.label),
    }));

  const percentileBars = Object.entries(occupation.payPercentiles || {})
    .map(([key, info]) => ({
      label: salaryPercentileLabel(key),
      value: info.value,
      lowReliability: info.low_reliability,
    }))
    .sort((a, b) => {
      const order = ["10% cobra menos de", "25% cobra menos de", "La mitad cobra menos de", "75% cobra menos de", "90% cobra menos de"];
      const pa = order.indexOf(a.label);
      const pb = order.indexOf(b.label);
      return pa - pb;
    });

  const salaryBadge = occupation.pay == null
    ? `<span class="badge">Sin salario publicado</span>`
    : `<span class="badge strong">Salario INE ${occupation.salaryYear}</span>`;
  const qualityBadge = occupation.payLowReliability
    ? `<span class="badge">Dato con poca muestra</span>`
    : "";
  const proxyBadge = occupation.pay == null && occupation.payProxyMonth != null
    ? `<span class="badge">Referencia aproximada: ${formatCurrency(occupation.payProxyMonth)} al mes en 2024</span>`
    : "";
  const aiBadge = automationBadge(
    `Automatizable por IA ${formatExposure(occupation.exposure)}`,
    occupation.exposure,
  );

  const sourcePills = `
    <div class="source-list">
      <a href="https://www.ine.es/jaxiT3/Tabla.htm?t=69953" target="_blank" rel="noreferrer">Fuente: empleo y estudios</a>
      <a href="https://www.ine.es/jaxiT3/Tabla.htm?t=70672" target="_blank" rel="noreferrer">Fuente: salarios</a>
      <a href="https://www.ine.es/jaxiT3/Tabla.htm?t=66244" target="_blank" rel="noreferrer">Fuente: salario de referencia</a>
      <a href="https://www.sepe.es/HomeSepe/que-es-observatorio/informacion-mt-por-ocupacion.html" target="_blank" rel="noreferrer">Fuente: ficha del SEPE</a>
      <span class="source-pill">Modelo IA · ${occupation.exposureModel ? friendlyModelName(occupation.exposureModel) : "sin estimacion"}</span>
    </div>
  `;

  detailPanelEl.innerHTML = `
    <section class="detail-header">
      <div class="detail-overline">
        <span>${occupation.code}</span>
        <span>·</span>
        <span>${SHORT_CATEGORY_LABELS[occupation.categoryCode] || occupation.categoryLabel}</span>
      </div>
      <h2 class="detail-title">${occupation.title}</h2>
      <div class="badge-row">
        <span class="badge strong">Tamano en el mapa: personas trabajando</span>
        ${salaryBadge}
        ${qualityBadge}
        ${proxyBadge}
        ${aiBadge}
      </div>
    </section>

    <section class="metric-grid">
      <article class="metric">
        <span class="eyebrow">Personas trabajando</span>
        <span class="number">${formatInteger(occupation.jobs)}</span>
        <span class="detail">Dato del INE ${occupation.jobsYear}</span>
      </article>
      <article class="metric">
        <span class="eyebrow">Salario medio al ano</span>
        <span class="number">${occupation.pay == null ? "—" : formatCurrency(occupation.pay)}</span>
        <span class="detail">${occupation.pay == null ? `No hay dato directo para este grupo.${occupation.payProxyMonth == null ? "" : ` Referencia aproximada: ${formatCurrency(occupation.payProxyMonth)} al mes en 2024.`}` : `Dato del INE ${occupation.salaryYear}`}</span>
      </article>
      <article class="metric">
        <span class="eyebrow">Contratos firmados</span>
        <span class="number">${formatInteger(occupation.contracts)}</span>
        <span class="detail">SEPE ${occupation.demandYear} · ${formatPct(occupation.outlook, 2)} frente a hace un ano</span>
      </article>
      <article class="metric">
        <span class="eyebrow">Personas que buscan esta ocupacion</span>
        <span class="number">${formatInteger(occupation.demandants)}</span>
        <span class="detail">SEPE ${occupation.demandYear} · ${formatPct(occupation.demandantsYoy, 2)} frente a hace un ano</span>
      </article>
      <article class="metric">
        <span class="eyebrow">Parados registrados</span>
        <span class="number">${formatInteger(occupation.unemployed)}</span>
        <span class="detail">Parte de quienes buscan esta ocupacion</span>
      </article>
      <article class="metric">
        <span class="eyebrow">Estudios mas habituales</span>
        <span class="number" style="font-size:1.05rem;line-height:1.25">${educationBucket(occupation.education)?.label || occupation.education || "—"}</span>
        <span class="detail">Nivel de estudios mas frecuente segun el INE</span>
      </article>
      <article class="metric">
        <span class="eyebrow">Automatizable por IA</span>
        <span class="number">${formatExposure(occupation.exposure)}</span>
        <span class="detail">${occupation.exposure == null ? "No hay estimacion disponible." : `Nivel ${automationLabel(occupation.exposure).toLowerCase()} · confianza ${occupation.exposureConfidence == null ? "—" : `${Number(occupation.exposureConfidence).toFixed(1).replace(".", ",")}/10`}`}</span>
      </article>
      <article class="metric">
        <span class="eyebrow">Como se calcula</span>
        <span class="number" style="font-size:1rem;line-height:1.25">${occupation.exposureModel ? friendlyModelName(occupation.exposureModel) : "—"}</span>
        <span class="detail">${occupation.exposureChildren?.length ? `Se resume a partir de ${occupation.exposureChildren.length} trabajos concretos con mas peso` : "Sin detalle adicional."}</span>
      </article>
    </section>

    <section class="section">
      <h3>Reparto por nivel de estudios</h3>
      ${renderBarList(
        educationBars,
        (item) => `${(item.value * 100).toFixed(1).replace(".", ",")}%`,
        (item) => item.bucket?.color || "#5f6d78",
      )}
    </section>

    <section class="section">
      <h3>Rango salarial</h3>
      ${occupation.pay == null
        ? `<div class="empty">No hay salario publicado para este grupo en la fuente del INE usada por esta web.</div>`
        : renderBarList(
            percentileBars,
            (item) => `${formatCurrency(item.value)}${item.lowReliability ? " · baja fiabilidad" : ""}`,
            (item) => item.lowReliability ? "#b45735" : "#1f6a6c",
          )}
    </section>

    <section class="section">
      <h3>Trabajos concretos que mas influyen en esta nota</h3>
      ${occupation.exposure == null
        ? `<div class="empty">Aun no hay estimacion de IA para este grupo.</div>`
        : renderBarList(
            (occupation.exposureChildren || []).map((item) => ({
              label: `${item.cno_4d} ${item.label}`,
              value: item.weight,
              exposure: item.exposure,
            })),
            (item) => `${automationLabel(item.exposure)} · ${formatExposure(item.exposure)}`,
            (item) => automationColor(item.exposure, 0.92),
          )}
    </section>

    ${selectedChild ? `
      <section class="child-detail">
        <h4>${selectedChild.cno_4d} · ${selectedChild.label}</h4>
        <div class="badge-row">
          <span class="badge strong">SEPE ${selectedChild.reference_year}</span>
          <span class="badge">Contratos: ${formatInteger(selectedChild.contracts)}</span>
          <span class="badge">Personas que buscan esta ocupacion: ${formatInteger(selectedChild.demandants)}</span>
          <span class="badge">Parados registrados: ${formatInteger(selectedChild.unemployed)}</span>
          ${automationBadge(
            `Automatizable ${formatExposure(selectedChild.ai_exposure)}`,
            selectedChild.ai_exposure,
            "Sin estimacion IA",
          )}
        </div>
        <div class="child-summary">${selectedChild.description_summary || "Sin resumen descriptivo."}</div>
        <div class="child-stats">
          <div class="child-stat">
            <span class="label">Cambio en contratos</span>
            <span class="value">${formatPct(selectedChild.contracts_yoy_pct, 2)}</span>
          </div>
          <div class="child-stat">
            <span class="label">Cambio en busquedas</span>
            <span class="value">${formatPct(selectedChild.demandants_yoy_pct, 2)}</span>
          </div>
          <div class="child-stat">
            <span class="label">Personas con contrato</span>
            <span class="value">${formatInteger(selectedChild.contract_persons)}</span>
          </div>
          <div class="child-stat">
            <span class="label">Confianza de la estimacion</span>
            <span class="value">${selectedChild.ai_confidence == null ? "—" : `${selectedChild.ai_confidence}/10`}</span>
          </div>
        </div>
        ${selectedChild.ai_rationale ? `
          <div class="section">
            <h3>Por que tiene esta nota</h3>
            <div class="child-summary">${selectedChild.ai_rationale}</div>
          </div>
        ` : ""}
        <div class="section">
          <h3>Tareas principales</h3>
          ${selectedChild.tasks?.length ? `
            <ul class="bullet-list">
              ${selectedChild.tasks.slice(0, 8).map((task) => `<li>${task}</li>`).join("")}
            </ul>
          ` : `<div class="empty">Sin listado de tareas para esta ocupacion.</div>`}
        </div>
        <div class="section">
          <h3>Ejemplos de puestos parecidos</h3>
          <div class="chip-row">
            ${(selectedChild.included_examples || []).slice(0, 6).map((item) => `<span class="chip">${item}</span>`).join("") || `<span class="chip">Sin ejemplos incluidos</span>`}
          </div>
          <div class="chip-row">
            ${(selectedChild.excluded_examples || []).slice(0, 4).map((item) => `<span class="chip">${item}</span>`).join("") || `<span class="chip">Sin exclusiones destacadas</span>`}
          </div>
        </div>
        <div class="child-actions">
          <a href="${selectedChild.url}" target="_blank" rel="noreferrer">Abrir ficha oficial del SEPE</a>
        </div>
      </section>
    ` : ""}

    <section class="section">
      <h3>Trabajos concretos dentro de este grupo (${children.length})</h3>
      <div class="child-list">
        ${children.map((child) => `
          <article class="child-card ${child.cno_4d === STATE.selectedChildCode ? "active" : ""}" data-child-code="${child.cno_4d}">
            <div class="child-title">${child.cno_4d} · ${child.label}</div>
            <div class="child-summary">${child.description_summary || "Sin resumen descriptivo."}</div>
            <div class="child-stats">
              <div class="child-stat">
                <span class="label">Contratos</span>
                <span class="value">${formatCompact(child.contracts)}</span>
              </div>
              <div class="child-stat">
                <span class="label">Cambio anual</span>
                <span class="value">${formatPct(child.contracts_yoy_pct, 2)}</span>
              </div>
              <div class="child-stat">
                <span class="label">Lo buscan</span>
                <span class="value">${formatCompact(child.demandants)}</span>
              </div>
              <div class="child-stat">
                <span class="label">Automatizable</span>
                <span class="value">${formatExposure(child.ai_exposure)}</span>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    </section>

    ${sourcePills}
  `;

  detailPanelEl.querySelectorAll("[data-child-code]").forEach((node) => {
    node.addEventListener("click", () => setSelectedChild(node.getAttribute("data-child-code")));
  });
}

async function loadData() {
  const [compact, canonical, details4d, meta] = await Promise.all([
    fetch("./data.json").then((response) => response.json()),
    fetch("./data-2d.json").then((response) => response.json()),
    fetch("./details-4d.json").then((response) => response.json()),
    fetch("./meta.json").then((response) => response.json()),
  ]);

  STATE.compact = compact;
  STATE.meta = meta;
  STATE.canonicalByCode = new Map(canonical.map((row) => [row.id, row]));
  STATE.detailsBy2d = details4d.occupations.reduce((map, row) => {
    if (!map.has(row.cno_2d)) map.set(row.cno_2d, []);
    map.get(row.cno_2d).push(row);
    return map;
  }, new Map());
  STATE.occupations = buildMergedOccupations();

  const defaultSelection = STATE.occupations
    .filter((occupation) => occupation.jobs != null && occupation.exposure != null)
    .sort((a, b) => (a.exposure - b.exposure) || ((b.jobs || 0) - (a.jobs || 0)))[0] || STATE.occupations[0];
  STATE.selectedCode = defaultSelection ? defaultSelection.code : null;
  ensureSelectedChild();
}

function updateSelectionFromSearch() {
  const query = STATE.search.trim().toLowerCase();
  if (!query) {
    renderTreemap();
    return;
  }
  const exact = STATE.occupations.find((occupation) => currentSearchMatcher(occupation).exact);
  const firstMatch = exact || STATE.occupations.find((occupation) => currentSearchMatcher(occupation).matches);
  if (firstMatch) {
    STATE.selectedCode = firstMatch.code;
    ensureSelectedChild();
  }
  renderEditorial();
  renderTreemap();
  renderDetailPanel();
}

function bindControls() {
  document.querySelectorAll("#modeSwitch button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("#modeSwitch button").forEach((node) => node.classList.remove("active"));
      button.classList.add("active");
      STATE.colorMode = button.dataset.mode;
      renderLegend();
      renderTreemap();
    });
  });

  searchInputEl.addEventListener("input", () => {
    STATE.search = searchInputEl.value;
    updateSelectionFromSearch();
  });

  window.addEventListener("resize", () => {
    window.clearTimeout(STATE.resizeTimer);
    STATE.resizeTimer = window.setTimeout(() => {
      renderTreemap();
    }, 80);
  });
}

function renderApp() {
  renderEditorial();
  renderLegend();
  renderTreemap();
  renderDetailPanel();
}

function attachError(message) {
  detailPanelEl.innerHTML = `<div class="empty">${message}</div>`;
  treemapEl.innerHTML = `<div class="empty" style="padding:20px">${message}</div>`;
}

loadData()
  .then(() => {
    bindControls();
    renderApp();
  })
  .catch((error) => {
    console.error(error);
    attachError("No se pudieron cargar los datos del visualizador. Sirve la carpeta `site/` con un servidor estatico y recarga la pagina.");
  });
