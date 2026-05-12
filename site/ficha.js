const PAGE_CONFIGS = {
  abogado: {
    kicker: "Ficha prioritaria V1 · Derecho",
    title: "¿Cómo cambia el trabajo de abogado con la IA?",
    deck: "Esta ficha combina datos agregados del grupo jurídico con señal específica del SEPE para la ocupación 2511 Abogados. La idea no es adivinar sustitución, sino localizar qué parte del trabajo cambia antes.",
    summary: [
      "La exposición publicada para el grupo 25 Profesionales en derecho es alta y encaja con un trabajo intensivo en documentación, búsqueda y redacción.",
      "La parte más resistente del oficio sigue concentrándose en estrategia, negociación, relación con cliente y responsabilidad final ante órganos administrativos o judiciales.",
      "El salario y el empleo publicados son de referencia de grupo; la señal específica de contratos, demandantes y tareas sale de la ocupación 2511 Abogados.",
    ],
    referenceGroups: ["25"],
    focusOccupations: ["2511"],
    interpretationNote: "Las listas siguientes son una síntesis editorial basada en tareas oficiales del SEPE y en la nota de exposición IA del repo. No son una predicción cerrada.",
    acceleratedTasks: [
      "Búsqueda inicial de jurisprudencia, normativa y precedentes para acotar un caso antes de la revisión humana.",
      "Redacción base de escritos, contratos, resúmenes y documentación repetitiva con plantillas supervisadas.",
      "Clasificación de pruebas, cronologías y extracción de hechos relevantes de expedientes largos.",
      "Preparación de borradores de due diligence, compliance o revisión documental a gran escala.",
    ],
    humanTasks: [
      "Estrategia procesal, interpretación fina del caso y definición de riesgos legales asumibles.",
      "Negociación con la otra parte, relación con el cliente y gestión de contexto sensible o ambiguo.",
      "Representación ante tribunales u órganos administrativos y asunción de responsabilidad profesional.",
      "Decidir cuándo un borrador automatizado es insuficiente, erróneo o jurídicamente peligroso.",
    ],
    learning: [
      "Trabajar con asistentes jurídicos de IA sin perder trazabilidad de fuentes y citas.",
      "Diseñar workflows de revisión documental y borradores con control humano obligatorio.",
      "Reforzar criterio, supervisión y validación final, no solo velocidad de producción.",
      "Aprender herramientas de búsqueda, resumen y comparación de textos con estándares de despacho o empresa.",
    ],
  },
  periodista: {
    kicker: "Ficha prioritaria V1 · Medios",
    title: "¿Cómo cambia el trabajo de periodista con la IA?",
    deck: "La ocupación 2922 Periodistas sí aparece con detalle propio en el repo. Esta ficha usa su señal específica de SEPE e IA, y la complementa con el grupo 29 como salario y empleo de referencia.",
    summary: [
      "La IA entra primero por monitorización, transcripción, redacción base y empaquetado de información repetitiva.",
      "La parte difícil de automatizar sigue siendo salir, entrevistar, contrastar, decidir qué importa y asumir criterio editorial.",
      "El salario y el empleo publicados son referencia del grupo cultural 29; la ocupación específica que da contratos, demandantes y tareas es 2922 Periodistas.",
    ],
    referenceGroups: ["29"],
    focusOccupations: ["2922"],
    interpretationNote: "La exposición alta aquí debe leerse como cambio fuerte de tareas digitales, no como desaparición automática del periodismo.",
    acceleratedTasks: [
      "Seguimiento de agenda, clipping, transcripción y resumen de ruedas de prensa, documentos y entrevistas.",
      "Redacción base de notas breves, entradillas, titulares alternativos y versiones para distintos canales.",
      "Agrupación de antecedentes, cronologías y extracción de citas o cifras de documentos largos.",
      "Adaptación rápida de piezas a formatos de newsletter, SEO, redes o alertas internas.",
    ],
    humanTasks: [
      "Encontrar historias, verificar testimonios y distinguir señal de ruido en contextos ambiguos.",
      "Entrevistar, repreguntar y detectar contradicciones o zonas opacas que una máquina no presencia.",
      "Asumir criterio editorial, responsabilidad reputacional y decisión final sobre qué se publica.",
      "Construir confianza con fuentes y lectores en temas sensibles o de alta incertidumbre.",
    ],
    learning: [
      "Usar IA para documentación y preparación sin delegar contraste ni edición final.",
      "Reforzar verificación, atribución de fuentes y disciplina de fact-checking.",
      "Aprender flujos de trabajo multimodales: transcripción, clipping, resumen y edición asistida.",
      "Desarrollar especialización temática, acceso a fuentes y criterio propio como activo diferencial.",
    ],
  },
  programador: {
    kicker: "Ficha prioritaria V1 · Software",
    title: "¿Cómo cambia el trabajo de programador con la IA?",
    deck: "En el repo, \"programador\" no vive en una sola casilla. Esta ficha combina dos ocupaciones cercanas: 2713 Analistas, programadores y diseñadores web y multimedia, y 3820 Programadores informáticos.",
    summary: [
      "Las dos señales específicas más cercanas a programador aparecen con exposición muy alta a la IA y reflejan un trabajo profundamente digital.",
      "Eso no implica el fin del oficio: desplaza valor desde escribir sintaxis manual hacia revisar, integrar, testear y entender producto.",
      "La referencia salarial se reparte entre dos grupos TIC distintos, así que aquí conviene leer la ficha como híbrida, no como una sola ocupación administrativa cerrada.",
    ],
    referenceGroups: ["27", "38"],
    focusOccupations: ["2713", "3820"],
    interpretationNote: "La exposición alta se explica por el encaje directo entre programación, documentación y herramientas generativas. El cuello de botella pasa a ser supervisión y fiabilidad.",
    acceleratedTasks: [
      "Generación de boilerplate, pruebas iniciales, documentación y refactors repetitivos.",
      "Búsqueda de errores, explicación de APIs y traducción entre lenguajes o frameworks.",
      "Prototipado rápido de componentes, scripts internos y utilidades de bajo riesgo.",
      "Producción de primeras versiones de consultas, integraciones y código auxiliar que luego se valida.",
    ],
    humanTasks: [
      "Definir arquitectura, límites del sistema y tradeoffs de rendimiento, seguridad o mantenibilidad.",
      "Entender producto, negocio y contexto técnico suficiente para saber qué no debe automatizarse.",
      "Validar que el código generado funciona en producción y no introduce deuda o fallos silenciosos.",
      "Orquestar dependencias, despliegues, observabilidad y responsabilidad técnica sobre sistemas reales.",
    ],
    learning: [
      "Trabajar con copilots y agentes de código con pruebas, evals y revisión rigurosa.",
      "Reforzar arquitectura, debugging, integración y capacidad de validar salidas automatizadas.",
      "Aprender a definir bien tareas, contexto y criterios de aceptación para delegar a herramientas de IA.",
      "Moverse más hacia producto, sistemas y supervisión que hacia mecanografía de código.",
    ],
  },
  administrativo: {
    kicker: "Ficha prioritaria V1 · Oficina",
    title: "¿Cómo cambia el trabajo administrativo con la IA?",
    deck: "Aquí sí conviene abrir dos cajones: administrativos sin atención al público (43/4309) y administrativos con atención al público (45/4500). Los dos salen expuestos, pero no por exactamente las mismas razones.",
    summary: [
      "El back office administrativo es uno de los bloques más expuestos del proyecto porque combina registro, clasificación y documentación repetitiva.",
      "La atención al público mantiene más fricción humana cuando hay excepciones, conflicto o necesidad de explicar un procedimiento en contexto.",
      "Las referencias de salario y empleo salen de los grupos 43 y 45; la señal específica de contratos, demandantes y tareas sale de 4309 y 4500.",
    ],
    referenceGroups: ["43", "45"],
    focusOccupations: ["4309", "4500"],
    interpretationNote: "Esta ficha no dice que la oficina desaparezca. Dice que cambia más deprisa que otros bloques porque gran parte de sus tareas ya son texto, formularios y reglas.",
    acceleratedTasks: [
      "Registro, clasificación, archivo y extracción de datos de documentos y formularios.",
      "Preparación de correspondencia ordinaria, resúmenes, respuestas base y documentación de soporte.",
      "Búsqueda interna de información, seguimiento de expedientes y resolución de consultas repetidas.",
      "Triado inicial de solicitudes y derivación automática según reglas o plantillas.",
    ],
    humanTasks: [
      "Gestión de casos excepcionales, incidencias y decisiones que salen del procedimiento estándar.",
      "Atención a personas cuando hay conflicto, vulnerabilidad o necesidad de explicar contexto.",
      "Coordinación con otros departamentos y cierre de procesos donde importa el criterio operativo.",
      "Responsabilidad final sobre calidad del dato, errores de tramitación y validación documental.",
    ],
    learning: [
      "Trabajar con herramientas de automatización documental y asistentes de workflow.",
      "Reforzar control de calidad, validación y gestión de excepciones.",
      "Aprender CRM, BPM, automatización de procesos y revisión de datos asistida por IA.",
      "Moverse desde ejecutar trámite base hacia supervisar proceso, cliente y excepciones.",
    ],
  },
  profesor: {
    kicker: "Ficha prioritaria V1 · Educación",
    title: "¿Cómo cambia el trabajo de profesor con la IA?",
    deck: "La palabra \"profesor\" agrupa varios contextos distintos en el repo. Esta ficha usa el grupo 22 como referencia general y abre tres ocupaciones con bastante peso: universidad, secundaria y primaria.",
    summary: [
      "La exposición agregada de la enseñanza es moderada y cambia mucho según el nivel educativo: primaria sale más protegida que secundaria o universidad.",
      "La IA ayuda más en preparación, corrección, apoyo y generación de materiales que en sostener una clase real o acompañar a un grupo concreto.",
      "La parte humana sigue estando en adaptación pedagógica, gestión del aula, evaluación con criterio y relación continuada con estudiantes y familias.",
    ],
    referenceGroups: ["22"],
    focusOccupations: ["2240", "2230", "2210"],
    interpretationNote: "En educación no basta con decir \"automatizable\". Aquí el cambio se reparte entre preparación previa, evaluación y soporte, no solo entre presencia o ausencia de IA.",
    acceleratedTasks: [
      "Preparación de materiales, ejercicios, rúbricas y adaptaciones iniciales de contenidos.",
      "Corrección preliminar, feedback base y generación de ejemplos o recursos complementarios.",
      "Organización de unidades, cronogramas y documentación de clase.",
      "Apoyo tutorial repetitivo y respuesta a preguntas frecuentes fuera del aula.",
    ],
    humanTasks: [
      "Sostener el aula, gestionar conducta, motivación y ritmos distintos dentro del mismo grupo.",
      "Detectar comprensión real, problemas emocionales o necesidades especiales que no salen en un prompt.",
      "Evaluar con criterio, contexto y responsabilidad docente, especialmente en tareas complejas.",
      "Acompañar a estudiantes y familias cuando la dificultad no es solo cognitiva sino humana o social.",
    ],
    learning: [
      "Diseñar tareas y evaluaciones robustas en un contexto donde el alumnado ya usa IA.",
      "Usar herramientas generativas para preparar mejor, no para vaciar de criterio la docencia.",
      "Reforzar tutorización, acompañamiento y adaptación individual como valor diferencial.",
      "Aprender a auditar trabajos asistidos por IA y a integrar esa realidad en la metodología.",
    ],
  },
  medico: {
    kicker: "Ficha prioritaria V1 · Salud",
    title: "¿Cómo cambia el trabajo médico con la IA?",
    deck: "Aquí sí hay más detalle del que parecía. El repo incluye 2111 Médicos de familia y 2112 Otros médicos especialistas, además del grupo 21 Profesionales de la salud como referencia salarial y de empleo.",
    summary: [
      "La exposición agregada del grupo sanitario es baja-moderada, pero dentro del detalle médico familia y especialistas sí muestran tareas reconfigurables por IA.",
      "La IA entra antes por documentación, apoyo al diagnóstico, cribado, búsqueda de evidencia y tareas de seguimiento estructurado.",
      "La exploración física, la relación clínica, los procedimientos y la responsabilidad final sobre decisiones médicas siguen siendo barreras fuertes.",
    ],
    referenceGroups: ["21"],
    focusOccupations: ["2111", "2112"],
    interpretationNote: "En medicina conviene distinguir entre apoyo a decisión y sustitución. Esta ficha solo respalda lo primero con los datos del repo.",
    acceleratedTasks: [
      "Documentación clínica, resumen de historia, codificación y apoyo a informes o derivaciones.",
      "Búsqueda rápida de evidencia, cribado inicial de síntomas y preparación de contextos para consulta.",
      "Priorización de casos y apoyo a decisiones repetitivas o protocolizadas bajo supervisión humana.",
      "Seguimiento estructurado de pacientes cuando el problema encaja en rutas clínicas conocidas.",
    ],
    humanTasks: [
      "Exploración física, interpretación clínica contextual y comunicación con paciente y familia.",
      "Decisiones con riesgo, incertidumbre o comorbilidad que no encajan en una plantilla limpia.",
      "Realización de procedimientos, coordinación asistencial y responsabilidad ética o legal final.",
      "Construcción de confianza, adherencia y relación clínica sostenida en el tiempo.",
    ],
    learning: [
      "Usar herramientas de documentación y apoyo clínico sin ceder juicio ni responsabilidad final.",
      "Reforzar lectura crítica de evidencia, validación y gobernanza del dato clínico.",
      "Aprender a integrar IA en consulta y seguimiento como capa de productividad, no como piloto automático.",
      "Distinguir entre automatización administrativa y decisión clínica propiamente dicha.",
    ],
  },
};

const pageRoot = document.getElementById("page");
const pageKey = window.FICHA_KEY;
const config = PAGE_CONFIGS[pageKey];
const ROOT_PUBLIC_URL = "https://iia-es.github.io/ia-espana/";
const NEWSLETTER_URL = "https://explicable.iia.es/";
const NEWSLETTER_SUBSCRIBE_ACTION = "https://explicable.iia.es/api/v1/free?nojs=true";

const nfInteger = new Intl.NumberFormat("es-ES");
const nfCurrency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function formatInteger(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return nfInteger.format(Math.round(value));
}

function formatCurrency(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return nfCurrency.format(value);
}

function formatPct(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return "—";
  const fixed = Number(value).toFixed(digits).replace(".", ",");
  return `${Number(value) > 0 ? "+" : ""}${fixed}%`;
}

function formatScore(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Number(value).toFixed(2).replace(".", ",")}/10`;
}

function sum(values) {
  return values.reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);
}

function unique(list) {
  return Array.from(new Set(list));
}

function groupLabel(row) {
  return `${row.id} ${row.short_label}`;
}

function basePath(path) {
  return `../${path}`;
}

function publicPageUrl() {
  return new URL(`${pageKey || ""}/`, ROOT_PUBLIC_URL).toString();
}

function publicKicker() {
  return String(config?.kicker || "")
    .split("·")
    .pop()
    .trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function newsletterSubscribePageUrl(nextUrl = publicPageUrl()) {
  const url = new URL("subscribe", NEWSLETTER_URL);
  url.searchParams.set("utm_source", `trabajo_iia_es_${pageKey || "ficha"}`);
  url.searchParams.set("simple", "true");
  url.searchParams.set("next", nextUrl);
  return url.toString();
}

function newsletterHiddenFieldsMarkup(contextUrl = publicPageUrl()) {
  const safeContextUrl = escapeHtml(contextUrl);
  const safeSubscribeUrl = escapeHtml(newsletterSubscribePageUrl(contextUrl));
  return `
    <input type="hidden" name="first_url" value="${safeContextUrl}">
    <input type="hidden" name="first_referrer" value="">
    <input type="hidden" name="current_url" value="${safeSubscribeUrl}">
    <input type="hidden" name="current_referrer" value="${safeContextUrl}">
    <input type="hidden" name="first_session_url" value="${safeContextUrl}">
    <input type="hidden" name="first_session_referrer" value="">
    <input type="hidden" name="referral_code" value="">
    <input type="hidden" name="source" value="subscribe_page">
    <input type="hidden" name="referring_pub_id" value="">
    <input type="hidden" name="additional_referring_pub_ids" value="">
  `;
}

function newsletterSignupMarkup({
  contextUrl = publicPageUrl(),
  inputId = `${pageKey}-newsletter-email`,
  helperText = "Email diario para estar al día de la IA.",
  buttonLabel = "Recibir 1 Minuto de IA",
  placeholder = "Tu correo electrónico",
} = {}) {
  return `
    <form class="newsletter-form" action="${NEWSLETTER_SUBSCRIBE_ACTION}" method="post">
      ${newsletterHiddenFieldsMarkup(contextUrl)}
      <p class="newsletter-helper"><strong>${escapeHtml(helperText)}</strong></p>
      <div class="newsletter-form-row">
        <input class="newsletter-input" id="${escapeHtml(inputId)}" name="email" type="email" placeholder="${escapeHtml(placeholder)}" autocomplete="email" required>
        <button class="newsletter-submit" type="submit">${escapeHtml(buttonLabel)}</button>
      </div>
      <p class="newsletter-note">Al enviar, se abre la suscripción oficial de Explicable para confirmar el alta.</p>
    </form>
  `;
}

function newsletterSectionMarkup({
  title,
  body,
  contextUrl = publicPageUrl(),
  inputId = `${pageKey}-newsletter-email`,
  helperText = "Email diario para seguir IA y trabajo sin ruido.",
  note = "La suscripción se completa en la página oficial de Explicable.",
} = {}) {
  return `
    <div class="newsletter-footer-card">
      <div class="newsletter-footer-copy">
        <span class="section-kicker">1 Minuto de IA</span>
        <h2>${escapeHtml(title)}</h2>
        <p>${body}</p>
      </div>
      <div class="newsletter-footer-aside">
        ${newsletterSignupMarkup({
          contextUrl,
          inputId,
          helperText,
        })}
        <div class="action-row">
          ${actionButton("Ver archivo", "https://explicable.iia.es/archive", false)}
        </div>
        <p class="small-note">${escapeHtml(note)}</p>
      </div>
    </div>
  `;
}

function actionButton(label, href, primary = false) {
  return `<a class="action ${primary ? "primary" : ""}" href="${href}">${label}</a>`;
}

function newsletterAudienceLabel() {
  return String(config?.title || "")
    .replace(/^¿Cómo cambia el trabajo\s+/i, "")
    .replace(/^de\s+/i, "")
    .replace(/\s+con la IA\?$/i, "")
    .trim()
    .toLowerCase();
}

function focusRange(rows) {
  const values = rows.map((row) => row.ai_exposure).filter(Number.isFinite);
  if (!values.length) return "—";
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? `${min}/10` : `${min}–${max}/10`;
}

function bindCopyButton() {
  const button = document.querySelector("[data-copy-url]");
  if (!button) return;
  button.addEventListener("click", async () => {
    const original = button.textContent;
    const url = publicPageUrl();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const helper = document.createElement("textarea");
        helper.value = url;
        helper.setAttribute("readonly", "");
        helper.style.position = "absolute";
        helper.style.left = "-9999px";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        helper.remove();
      }
      button.textContent = "Enlace copiado";
      window.setTimeout(() => {
        button.textContent = original;
      }, 1200);
    } catch (error) {
      console.error(error);
    }
  });
}

function renderPage(groupsMap, occupationsMap) {
  if (!config) {
    pageRoot.innerHTML = '<div class="error">No existe configuracion para esta ficha.</div>';
    return;
  }

  const groups = config.referenceGroups.map((code) => groupsMap.get(code)).filter(Boolean);
  const focusRows = config.focusOccupations.map((code) => occupationsMap.get(code)).filter(Boolean);

  if (!groups.length || !focusRows.length) {
    pageRoot.innerHTML = '<div class="error">No se encontraron todos los datos necesarios para esta ficha.</div>';
    return;
  }

  const totalContracts = sum(focusRows.map((row) => row.contracts));
  const totalDemandants = sum(focusRows.map((row) => row.demandants));
  const sepeLinks = unique(
    focusRows
      .filter((row) => row.url)
      .map((row) => JSON.stringify({
        url: row.url,
        label: `SEPE ${row.cno_4d} ${row.label}`,
      }))
  ).map((row) => JSON.parse(row));
  const publicUrl = publicPageUrl();

  pageRoot.innerHTML = `
    <div class="masthead">
      <div class="masthead-title">ia-espana <span>Instituto de Inteligencia Artificial</span></div>
      <div class="masthead-meta">${publicKicker()}</div>
    </div>

    <header class="hero">
      <span class="hero-kicker">${publicKicker()}</span>
      <h1 class="hero-title">${config.title}</h1>
      <p class="hero-deck">${config.deck}</p>
      <ul class="hero-summary">
        ${config.summary.map((item) => `<li>${item}</li>`).join("")}
      </ul>
      <div class="hero-actions">
        ${actionButton("Volver a la home", "../", false)}
        <button type="button" class="action" data-copy-url>Copiar enlace</button>
      </div>
    </header>

    <section class="section">
      <div class="section-head">
        <span class="section-kicker">Señal rápida</span>
        <h2>Qué números sí podemos defender en esta ficha</h2>
        <p>Estas cuatro tarjetas resumen el alcance de la página. Cuando la ficha combina varias ocupaciones específicas, los contratos y demandantes se suman solo sobre esas ocupaciones foco.</p>
      </div>
      <div class="kpi-grid">
        <article class="metric-card">
          <span class="metric-label">Ocupaciones foco</span>
          <span class="metric-value">${focusRows.length}</span>
          <span class="metric-detail">${focusRows.map((row) => row.cno_4d).join(" · ")}</span>
        </article>
        <article class="metric-card">
          <span class="metric-label">Contratos 2025</span>
          <span class="metric-value accent">${formatInteger(totalContracts)}</span>
          <span class="metric-detail">Suma de las ocupaciones específicas cubiertas por esta ficha.</span>
        </article>
        <article class="metric-card">
          <span class="metric-label">Demandantes 2025</span>
          <span class="metric-value cool">${formatInteger(totalDemandants)}</span>
          <span class="metric-detail">Señal SEPE útil para leer competencia o presión de entrada.</span>
        </article>
        <article class="metric-card">
          <span class="metric-label">Rango IA ocupaciones foco</span>
          <span class="metric-value">${focusRange(focusRows)}</span>
          <span class="metric-detail">Lectura por ocupación concreta, no predicción de sustitución.</span>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <span class="section-kicker">Referencia de grupo</span>
        <h2>Empleo, salario y exposición a nivel agregado</h2>
        <p>Cuando el INE publica empleo y salario, en este proyecto suelen venir agregados al grupo CNO-2d. Esos datos son útiles como contexto, pero no equivalen siempre a una especialidad exacta.</p>
      </div>
      <div class="reference-grid">
        ${groups.map((group) => `
          <article class="card">
            <span class="metric-label">${groupLabel(group)}</span>
            <span class="metric-value">${formatInteger(group.jobs_stock?.value)}</span>
            <span class="metric-detail">Empleo publicado por el INE para 2023.</span>
            <span class="metric-value accent" style="margin-top:14px;">${formatCurrency(group.pay?.mean_annual_gross)}</span>
            <span class="metric-detail">Salario bruto anual medio de referencia (${group.pay?.reference_year ?? "sin dato"}).</span>
            <span class="metric-value cool" style="margin-top:14px;">${formatScore(group.ai_exposure?.value)}</span>
            <span class="metric-detail">Exposición agregada a IA con confianza ${formatScore(group.ai_exposure?.confidence)}.</span>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <span class="section-kicker">Detalle ocupacional</span>
        <h2>Qué ocupa el centro de esta ficha</h2>
        <p>Estos bloques sí bajan al nivel de ocupación concreta del SEPE: contratos, demandantes, paro, ejemplos, tareas y explicación de la nota IA.</p>
      </div>
      <div class="focus-grid">
        ${focusRows.map((row) => `
          <article class="focus-card">
            <div>
              <span class="metric-label">${row.cno_4d}</span>
              <h3>${row.label}</h3>
            </div>
            <div class="focus-meta">
              <span class="pill strong">Grupo ${row.cno_2d}</span>
              <span class="pill">IA ${row.ai_exposure}/10</span>
              <span class="pill">Confianza ${row.ai_confidence}/10</span>
              <span class="pill">SEPE ${row.reference_year}</span>
            </div>
            <div class="focus-stats">
              <article class="focus-stat">
                <span class="label">Contratos</span>
                <span class="value">${formatInteger(row.contracts)}</span>
              </article>
              <article class="focus-stat">
                <span class="label">Cambio anual</span>
                <span class="value">${formatPct(row.contracts_yoy_pct, 2)}</span>
              </article>
              <article class="focus-stat">
                <span class="label">Demandantes</span>
                <span class="value">${formatInteger(row.demandants)}</span>
              </article>
              <article class="focus-stat">
                <span class="label">Paro registrado</span>
                <span class="value">${formatInteger(row.unemployed)}</span>
              </article>
            </div>
            ${row.ai_rationale ? `<p class="focus-rationale">${row.ai_rationale}</p>` : ""}
            <div class="cards-grid">
              <article class="card">
                <span class="metric-label">Ejemplos incluidos</span>
                <ul class="mini-list">
                  ${(row.included_examples || []).slice(0, 6).map((item) => `<li>${item}</li>`).join("") || "<li>Sin ejemplos publicados.</li>"}
                </ul>
              </article>
              <article class="card">
                <span class="metric-label">Tareas oficiales destacadas</span>
                <ul class="mini-list">
                  ${(row.tasks || []).slice(0, 5).map((item) => `<li>${item}</li>`).join("") || "<li>Sin tareas publicadas.</li>"}
                </ul>
              </article>
            </div>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <span class="section-kicker">Lectura editorial</span>
        <h2>Qué cambia antes, qué sigue siendo más humano y qué conviene aprender</h2>
        <p>${config.interpretationNote}</p>
      </div>
      <div class="ficha-tabs" role="tablist" aria-label="Lectura editorial">
        <button type="button" role="tab" id="tab-aceleradas" aria-controls="panel-aceleradas" aria-selected="true">Aceleradas</button>
        <button type="button" role="tab" id="tab-humanas" aria-controls="panel-humanas" aria-selected="false">Humanas</button>
        <button type="button" role="tab" id="tab-aprendizaje" aria-controls="panel-aprendizaje" aria-selected="false">Qué aprender</button>
      </div>
      <div id="panel-aceleradas" role="tabpanel" aria-labelledby="tab-aceleradas">
        <ul class="text-list">
          ${config.acceleratedTasks.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>
      <div id="panel-humanas" role="tabpanel" aria-labelledby="tab-humanas" hidden>
        <ul class="text-list">
          ${config.humanTasks.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>
      <div id="panel-aprendizaje" role="tabpanel" aria-labelledby="tab-aprendizaje" hidden>
        <ul class="text-list">
          ${config.learning.map((item) => `<li>${item}</li>`).join("")}
        </ul>
        <div class="action-row">
          ${actionButton("Abrir metodología", "../#metodologia", false)}
          ${actionButton("Abrir buscador principal", "../#buscar", false)}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <span class="section-kicker">Fuentes</span>
        <h2>Qué fuente sostiene cada capa de la ficha</h2>
        <p>Grupo agregado para empleo y salario, ocupación específica para contratos, demandantes, tareas y señal IA. Si falta una métrica a nivel exacto, aquí se deja visible en vez de inventarla.</p>
      </div>
      <div class="source-list">
        <a href="../#metodologia">Metodología general de ia-espana</a>
        <a href="../ocupaciones.csv" download>CSV descargable del proyecto</a>
        ${sepeLinks.map((entry) => `<a href="${entry.url}" target="_blank" rel="noreferrer">${entry.label}</a>`).join("")}
        <a href="https://github.com/antorsae/ia-espana" target="_blank" rel="noreferrer">Repositorio y pipeline</a>
      </div>
      <p class="footer-note">URL pública recomendada para compartir esta ficha: <a href="${publicUrl}">${publicUrl}</a></p>
    </section>

    <section class="section newsletter-footer-section">
      ${newsletterSectionMarkup({
        title: "Recíbelo por email si quieres seguir el cambio de cerca.",
        body: `Si trabajas como <strong>${escapeHtml(newsletterAudienceLabel())}</strong>, la pregunta útil no es solo qué puede automatizarse, sino qué cambia esta semana.`,
        contextUrl: publicUrl,
        inputId: `${pageKey}-footer-email`,
        helperText: "Email diario para seguir IA y trabajo sin ruido.",
        note: "La suscripción se completa en la página oficial de Explicable.",
      })}
    </section>
  `;

  bindCopyButton();
  bindFichaTabs();
}

function bindFichaTabs() {
  const tablist = pageRoot.querySelector('.ficha-tabs[role="tablist"]');
  if (!tablist) return;
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls"))).filter(Boolean);

  function activate(targetTab, { focus = true, updateHash = true } = {}) {
    tabs.forEach((tab) => {
      const isActive = tab === targetTab;
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });
    panels.forEach((panel) => {
      const isActive = panel.id === targetTab.getAttribute("aria-controls");
      if (isActive) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    });
    if (updateHash) {
      const anchor = ({
        "tab-aceleradas": "tareas-aceleradas",
        "tab-humanas": "tareas-humanas",
        "tab-aprendizaje": "tareas-aprendizaje",
      })[targetTab.id];
      if (anchor && window.history && window.history.replaceState) {
        window.history.replaceState(null, "", `#${anchor}`);
      }
    }
    if (focus) targetTab.focus({ preventScroll: true });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab, { focus: false }));
    tab.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        activate(tabs[(index + 1) % tabs.length]);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        activate(tabs[(index - 1 + tabs.length) % tabs.length]);
      } else if (event.key === "Home") {
        event.preventDefault();
        activate(tabs[0]);
      } else if (event.key === "End") {
        event.preventDefault();
        activate(tabs[tabs.length - 1]);
      }
    });
  });

  const hashToTabId = {
    "tareas-aceleradas": "tab-aceleradas",
    "tareas-humanas": "tab-humanas",
    "tareas-aprendizaje": "tab-aprendizaje",
  };
  const initialHash = (window.location.hash || "").replace(/^#/, "");
  const initialTabId = hashToTabId[initialHash];
  if (initialTabId) {
    const tab = tabs.find((t) => t.id === initialTabId);
    if (tab) activate(tab, { focus: false, updateHash: false });
  }
}

async function loadPage() {
  if (!pageRoot) return;
  if (!config) {
    pageRoot.innerHTML = '<div class="error">No existe configuracion para esta ficha.</div>';
    return;
  }

  pageRoot.innerHTML = '<div class="loading">Cargando datos de la ficha…</div>';

  try {
    const [groups, details] = await Promise.all([
      fetch(basePath("data-2d.json")).then((response) => response.json()),
      fetch(basePath("details-4d.json")).then((response) => response.json()),
    ]);

    const groupsMap = new Map(groups.map((row) => [row.id, row]));
    const occupationsMap = new Map(details.occupations.map((row) => [row.cno_4d, row]));
    renderPage(groupsMap, occupationsMap);
  } catch (error) {
    console.error(error);
    pageRoot.innerHTML = '<div class="error">No se pudo cargar la ficha. Sirve la carpeta <code>site/</code> con un servidor estatico y recarga la pagina.</div>';
  }
}

loadPage();
