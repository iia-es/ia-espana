# Spain Jobs Architecture

## Objetivo

Construir una version espanola de `karpathy/jobs` que sea lo mas equivalente posible
sin perder rigor en las fuentes.

Eso implica separar tres cosas:

1. la unidad oficial de analisis
2. las capas estadisticas oficiales
3. la capa opcional de scoring LLM

## Decision de unidad canonica

### V1 recomendada

Usar `CNO-11 a 2 digitos` como unidad canonica del treemap.

Motivo:

- INE si da empleo oficial por ocupacion a 2 digitos.
- INE si da cruce ocupacion x educacion a 2 digitos.
- INE si da salario rico a 2 digitos, aunque en una fuente mas antigua.
- La fusion entre fuentes es defendible.

### V2 de detalle

Usar `CNO-11 a 4 digitos` para drill-down y paginas de detalle.

Motivo:

- SEPE publica navegacion y fichas por ocupacion a 4 digitos.
- CNO-11 define funciones y ejemplos a ese nivel.
- Visualmente se parece mucho mas al producto de Karpathy.

### Lo que no recomiendo para V1

No usar 4 digitos como unidad estadistica principal desde el principio.

Motivo:

- empleo stock oficial no esta tan claro a 4 digitos
- salario oficial no esta claro a 4 digitos
- obligaria a imputaciones desde niveles superiores

## Diseño de producto

## V1

- treemap principal: CNO-11 2d
- area: ocupados INE
- color layers:
  - empleo / tendencia proxy
  - salario
  - educacion dominante
  - AI exposure
- click:
  - abre panel de detalle del 2d
  - muestra subocupaciones 4d relacionadas del catalogo SEPE
  - enlaces a fichas SEPE 4d

## V1.1

- mantener treemap 2d
- anadir pagina secundaria de exploracion 4d
- anadir bridge 2d -> 4d con reparto solo visual, no estadistico

## V2

- anadir outlook formal con Cedefop para Espana
- decidir si compensa un treemap 4d con metricas mixtas:
  - empleo estimado
  - salario heredado
  - detalle real SEPE

## Mapa de fuentes por campo

| Campo canonico | Fuente principal | Nivel | Observacion |
|---|---|---|---|
| `occupation_code` | INE CNO-11 / SEPE | 2d y 4d | codigo CNO |
| `occupation_label` | INE CNO-11 / SEPE | 2d y 4d | etiqueta oficial |
| `jobs_stock` | INE tabla 69953 | 2d | empleo oficial anual |
| `education_distribution` | INE tabla 69953 | 2d | cruce ocupacion x estudios |
| `pay_monthly_gross` | INE tabla 66244 | 1d | fuente mas actual, pero muy gruesa |
| `pay_mean_or_percentiles` | INE tabla 70672 | 2d | rica, pero antigua (2018) |
| `description` | INE CNO-11 notas | 4d | funciones, ejemplos, exclusiones |
| `detail_market_signal` | SEPE fichas ocupacion | 4d | contratos, demandantes, geografia |
| `trend_proxy` | SEPE fichas ocupacion | 4d | variacion anual/mensual |
| `forecast_outlook` | Cedefop | por verificar | mejor sustituto del BLS outlook |
| `ai_exposure` | LLM | 2d o 4d | capa no oficial |

## Schema canonico propuesto

```json
{
  "id": "27",
  "level": "cno_2d",
  "label": "Profesionales de las tecnologias de la informacion",
  "source_labels": [
    {
      "source_id": "ine_cno11",
      "label": "Profesionales de las tecnologias de la informacion"
    }
  ],
  "jobs_stock": {
    "value": 463755,
    "unit": "persons",
    "reference_year": 2023,
    "source_id": "ine_employment_69953"
  },
  "pay": {
    "value": 0,
    "unit": "eur_month_gross",
    "reference_year": 2018,
    "source_id": "ine_salary_70672",
    "quality": "official_but_old"
  },
  "education": {
    "distribution": [],
    "dominant_level": null,
    "reference_year": 2023,
    "source_id": "ine_employment_69953"
  },
  "trend_proxy": {
    "metric": "contracts_yoy",
    "value": null,
    "reference_period": null,
    "source_id": "sepe_occupation_pages",
    "quality": "proxy"
  },
  "forecast_outlook": {
    "metric": "employment_change_pct",
    "value": null,
    "horizon": "2035",
    "source_id": "cedefop_skills_forecast_2025",
    "quality": "official_eu"
  },
  "description": {
    "summary": null,
    "tasks": [],
    "included_examples": [],
    "excluded_examples": [],
    "source_id": "ine_cno11_notes"
  },
  "children_4d": [
    "2711",
    "2712"
  ],
  "source_trace": [
    "ine_employment_69953",
    "ine_salary_70672",
    "ine_cno11_notes",
    "sepe_occupation_pages"
  ]
}
```

## Bridge entre 2d y 4d

Necesitamos dos tablas puente:

1. `cno_2d_to_4d.json`
   - genera navegacion y drill-down
   - sale del catalogo SEPE incrustado en HTML/JS

2. `cno_4d_to_2d.json`
   - permite heredar metricas del padre 2d
   - se obtiene truncando los dos primeros digitos del codigo 4d

Regla:

- V1: las metricas oficiales viven en 2d
- V1 detalle: 4d hereda del padre 2d solo para visualizacion secundaria
- V2: solo bajar metricas a 4d si hay fuente oficial o metodologia explicita

## Artefactos de datos recomendados

### Fuentes crudas

- `raw/ine/69953.json`
- `raw/ine/66244.json`
- `raw/ine/70672.json`
- `raw/sepe/catalog_4d.html`
- `raw/sepe/reports/<year>/<cno4d>.html`
- `raw/cno11/cno11_notas.pdf`

### Intermedios

- `data/sepe_catalog_4d.json`
- `data/cno_bridge_2d_4d.json`
- `data/occupation_2d_jobs.json`
- `data/occupation_2d_education.json`
- `data/occupation_2d_pay.json`
- `data/occupation_4d_details.json`

### Finales

- `site_data_2d.json`
- `site_data_4d_detail.json`
- `ai_scores_2d.json` o `ai_scores_4d.json`

## Politica de campo oficial vs derivado

Cada campo debe marcarse como uno de:

- `official`
- `official_proxy`
- `derived`
- `llm`

Ejemplos:

- empleo INE: `official`
- salario 2018 INE en un panel 2026: `official`
- outlook con contratos SEPE YoY: `official_proxy`
- salario 4d heredado desde 2d: `derived`
- AI exposure: `llm`

Esto es importante para no presentar la version espanola como mas precisa de lo que es.

## Refresh recomendado

- SEPE:
  - refresco mensual para fichas ocupacionales
  - refresco anual para resumenes
- INE empleo:
  - refresco anual cuando se publique nuevo ano
- INE salario:
  - refresco anual para la serie moderna
  - la tabla 2018 es estable
- Cedefop:
  - refresco por edicion de forecast
- LLM:
  - refresco manual al cambiar prompt/modelo

## Arquitectura tecnica

## Ingestion

- `extract_sepe_catalog.py`
  - extrae catalogo 4d desde el HTML del Observatorio

- `probe_spain_sources.py`
  - valida disponibilidad y granularidad de fuentes clave

- futuro:
  - `fetch_ine_table.py --table-id 69953`
  - `fetch_sepe_report_links.py --cno 4412 --year 2025`
  - `parse_cno_notes.py`

## Normalizacion

- construir IDs canonicos por:
  - `cno_1d`
  - `cno_2d`
  - `cno_4d`
- normalizar etiquetas y anos
- guardar siempre:
  - valor
  - unidad
  - fuente
  - fecha de referencia
  - fecha de extraccion

## Frontend

### V1

- treemap 2d
- tooltip con:
  - ocupados
  - salario
  - educacion dominante
  - descripcion corta
  - enlace a subocupaciones 4d y fuente SEPE

### V2

- switch 2d / 4d
- panel lateral con:
  - descripcion CNO
  - indicadores SEPE
  - outlook Cedefop
  - rationale LLM

## Recomendacion final

La arquitectura mas solida es:

1. `2d` como capa estadistica principal
2. `4d` como capa de navegacion y detalle oficial
3. `Cedefop` solo cuando queramos una capa de outlook comparable al BLS

Es la opcion que mas se parece al producto de Karpathy sin inventarnos una precision
que las fuentes espanolas no dan hoy de forma integrada.
