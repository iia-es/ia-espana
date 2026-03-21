# karpathy/jobs and Spain-equivalent research

## 1. What `karpathy/jobs` actually is

This is not a job-board crawler. It is an occupation-level labor-market visualizer.

- Unit of analysis: 342 US occupations.
- Area metric: total employment (`jobs`).
- Color layers:
  - BLS outlook (`outlook`)
  - median pay (`pay`)
  - entry education (`education`)
  - LLM-generated AI exposure (`exposure`)
- Frontend: static treemap in `site/index.html`.

Core pipeline:

1. `scrape.py`
   - Reads `occupations.json`.
   - Uses Playwright with non-headless Chromium because BLS blocks bots.
   - Stores raw BLS HTML in `html/<slug>.html`.

2. `process.py` + `parse_detail.py`
   - Converts each raw BLS page into clean Markdown.
   - Extracts title, canonical source URL, quick facts, most section text, pay chart data, and employment projections table.
   - Explicitly skips some BLS tabs such as state/area links, similar occupations, and contacts.

3. `make_csv.py`
   - Re-parses raw HTML and extracts structured fields:
     - SOC code
     - annual/hourly median pay
     - entry education
     - work experience
     - training
     - number of jobs
     - projected employment
     - outlook percent and description

4. `score.py`
   - Sends each Markdown occupation profile to OpenRouter.
   - Default model: `google/gemini-3-flash-preview`.
   - Returns JSON with `exposure` 0-10 and a short rationale.

5. `build_site_data.py`
   - Merges `occupations.csv` + `scores.json` into `site/data.json`.

6. `make_prompt.py`
   - Builds `prompt.md`, a large LLM-friendly summary of all occupations and scores.

## 2. Original data sources in Karpathy repo

Official source:

- US Bureau of Labor Statistics Occupational Outlook Handbook (OOH)
  - Occupation descriptions
  - job duties
  - work environment
  - education / work experience / training
  - median pay
  - number of jobs
  - 2024-34 projections

Evidence observed in repo:

- Sample BLS HTML pages in `html/` show:
  - `Last Modified Date: Thursday, August 28, 2025`
  - `Job Outlook, 2024-34`
  - `Employment Change, 2024-34`
- `occupations.csv` includes BLS URLs for every occupation.
- `site/data.json` contains 342 records.
- Total represented jobs in the shipped dataset: `143,066,500`.

Secondary/non-official source:

- OpenRouter API for LLM scoring, producing `scores.json`.

## 3. Assessment of Karpathy source design

### Strengths

- Very strong official backbone: one coherent public source covers the whole product.
- Stable schema across occupations.
- Good product fit:
  - one page per occupation
  - rich descriptive text
  - structured pay/employment/outlook
  - easy citation back to official source
- Clear separation between:
  - official descriptive/statistical data
  - subjective LLM scoring layer

### Weaknesses / caveats

- AI exposure is not official and is not reproducible without an API key and the same model behavior.
- Scraping is browser-based and brittle because BLS bot protection forces Playwright.
- `parse_occupations.py` is stale relative to current `occupations.json` schema:
  - script writes only `title` and `url`
  - committed `occupations.json` contains `title`, `url`, `category`, `slug`
- README refers to `pages/`, but `pages/` is not committed in the current repo.
- `score.py` has no schema validator beyond `json.loads`, so malformed model output would break runs.
- Visual outcome depends heavily on occupation taxonomy quality in BLS OOH.

### Important product insight

The killer advantage in the US version is not the treemap or the LLM prompt.
It is the existence of one official occupation handbook that already unifies:

- descriptions
- training/education
- pay
- employment size
- forward outlook

Spain does not appear to have a single official source with all of those fields together.

## 4. Best official source landscape in Spain

## A. SEPE Observatorio de las Ocupaciones

Main page:

- `https://www.sepe.es/HomeSepe/que-es-observatorio/informacion-mt-por-ocupacion.html`

What it gives:

- Quantitative labor-market information for the 502 primary groups of CNO-11.
- Monthly and annual pages by occupation.
- Search page embeds the full 502-occupation CNO catalog directly in HTML/JS.
- Historical pages since 2010.

Important evidence:

- The page states it provides quantitative information for the `502 grupos primarios` of CNO-11.
- Embedded JS (`ocupaciones.js`) posts to:
  - `/HomeSepe/que-es-observatorio/informacion-mt-por-ocupacion/main/04/content/resultados`
- That endpoint returns deterministic links for annual and monthly occupation pages.
- Example annual page for `4412 Recepcionistas (excepto de hoteles)` includes:
  - annual contracts
  - annual jobseekers / unemployed demandants
  - sex and age breakdowns
  - geography
  - 10-year trend charts
  - top CNAE sectors in contracting
  - occupation functions
  - included CO-SISPE 8-digit occupations

Strengths:

- Fully official Spanish source.
- Closest thing to a public occupation-page system at scale.
- Covers all 502 primary CNO groups.
- Has descriptive text plus current market signal.
- HTML structure is machine-readable enough for scraping.

Weaknesses:

- It does not provide total employed persons by occupation in the same sense as BLS OOH.
- It focuses on contracts, demandants, and labor intermediation, not complete stock employment.
- It does not provide official salary data on these pages.
- Its "outlook" is implicit via trend and variation, not a formal medium-term forecast like BLS.

## B. INE CNO-11 explanatory notes

Source:

- `https://www.ine.es/daco/daco42/clasificaciones/cno11_notas.pdf`

What it gives:

- Official textual definition of occupations in CNO-11.
- Tasks for each primary group.
- Included occupations.
- Related occupations excluded from the group.

Example confirmed in the PDF:

- `4412 Recepcionistas (excepto de hoteles)` includes the same task description surfaced by SEPE.

Strengths:

- Best official source for occupation definitions and tasks.
- Covers the whole classification, not a selected subset.

Weaknesses:

- No pay.
- No employment counts.
- No forward outlook.
- PDF parsing is doable but less convenient than structured HTML.

## C. INE occupation employment data

Example table:

- `https://www.ine.es/jaxiT3/Tabla.htm?t=69953`

API:

- `https://servicios.ine.es/wstempus/js/es/DATOS_TABLA/69953?tip=AM`

What it gives:

- Occupied population by occupation `2d`, education level, and professional status.
- Annual official data.
- Machine-readable JSON API.

Observed properties:

- Occupation granularity on this table is `2d`.
- Total values available for 2021, 2022, 2023.
- Table exposes 63 occupation values including total and "No consta".

Strengths:

- Official employment stock, which is the right analogue for treemap area.
- Official education cross-tab by occupation.
- Direct JSON API is excellent.

Weaknesses:

- Granularity is 2-digit occupation groups, not 4-digit / 502 occupations.
- Latest public year on the queried table is 2023, not fully current monthly stock.

## D. INE salaries of the main job

Current salary table:

- `https://www.ine.es/jaxiT3/Tabla.htm?t=66244`
- API: `https://servicios.ine.es/wstempus/js/es/DATOS_TABLA/66244?tip=AM`

What it gives:

- Monthly gross salary of the main job.
- Annual series.
- Occupation breakdown.

Observed limitation:

- The current table only exposes major occupation groups:
  - 1 Directores y gerentes
  - 2 Tecnicos y profesionales cientificos e intelectuales
  - ...
  - 9 Ocupaciones elementales
  - 0 Ocupaciones militares
- So this is 1-digit major-group salary, not 2-digit or 4-digit.

Older richer salary source:

- 2018 structure-of-earnings table:
  - `https://www.ine.es/jaxiT3/Tabla.htm?t=70672`
  - API: `https://servicios.ine.es/wstempus/js/es/DATOS_TABLA/70672?tip=AM`

What it gives:

- Mean and percentiles by groups and subgroups of CNO-11.
- Includes many 2-digit subgroups like `27 Profesionales de las tecnologias de la informacion`.

Strengths:

- Official salary source.
- JSON API.
- The 2018 table is much more occupation-rich than the current salary table.

Weaknesses:

- Tradeoff:
  - current source is newer but coarse
  - richer source is older

## E. Cedefop Skills Forecast for Spain

Dataset page:

- `https://www.cedefop.europa.eu/en/datasets/dataset-skills-forecast`

Main tool page:

- `https://www.cedefop.europa.eu/en/data-datasets/cedefop-skills-forecast`

What it gives:

- Official EU-agency forecasts for employment by sector, occupation, and qualification.
- Cross-country comparable projections up to `2035`.
- Country reports for member states including Spain.

Observed properties:

- Dataset states projections by sector, occupation and education.
- Full spreadsheet requires a request form.
- License is `CC BY 4.0`.
- Online tool exists and country-specific reports exist.

Strengths:

- This is the cleanest official forecast-style replacement for the BLS outlook layer.
- It is explicitly prospective, unlike SEPE trend pages.

Weaknesses:

- Not a Spanish national source; it is EU official rather than Spain official.
- Full data access is less frictionless than INE API or SEPE HTML.
- Need to verify exact occupation granularity in the obtained spreadsheet before committing architecture around it.

## 5. Best possible Spain-equivalent architectures

## Option 1: Best "Spanish-official-first" build

Recommended if the top priority is "official Spanish sources" even with some compromises.

Unit of analysis:

- CNO-11 2-digit occupation groups from INE

Source mix:

- Description / tasks:
  - INE CNO-11 notes PDF
  - optionally enrich with SEPE occupation pages
- Area (`jobs`):
  - INE occupation employment table (`69953` or related INE occupation tables)
- Education:
  - INE occupation x education cross-tab
  - derive dominant level or distribution
- Salary:
  - INE salaries of the main job
  - if staying fully current: 1-digit pay only
  - if accepting older richer salary detail: 2018 EES 2-digit subgroups
- Outlook:
  - SEPE annual change in contracts and/or demandants as an official trend proxy

Pros:

- Strongly Spanish and official.
- APIs are available for key INE layers.
- No dependence on private or third-party labor platforms.

Cons:

- Not as elegant as BLS OOH because the variables come from different systems.
- Outlook becomes a trend proxy, not a formal forecast.
- 2-digit granularity is materially coarser than Karpathy's 342 occupations.

## Option 2: Closest product equivalent

Recommended if the priority is "make something as equivalent as possible to karpathy/jobs".

Unit of analysis:

- 2-digit or 4-digit CNO occupation groups depending source harmonization

Source mix:

- Description / tasks:
  - INE CNO-11 notes
- Current market detail:
  - SEPE occupation pages
- Area:
  - INE occupation employment
- Education:
  - INE occupation x education
- Pay:
  - INE salary tables
- Outlook:
  - Cedefop forecast for Spain

Pros:

- Much closer to BLS logic:
  - stock employment
  - pay
  - education
  - forward-looking outlook
- Still official, though not all Spanish-national.

Cons:

- Mixed source governance: Spain + EU.
- Some forecast data may require manual acquisition via form.

## Option 3: Most detailed occupation pages

Unit of analysis:

- SEPE / CNO 4-digit primary groups (502 occupations)

Source mix:

- Description / tasks:
  - SEPE pages / INE CNO notes
- Trend:
  - SEPE annual and monthly metrics
- Salary:
  - imputed from parent INE 2-digit or 1-digit occupation groups
- Area:
  - imputed from higher-level INE occupation counts or estimated shares

Pros:

- Most visually similar to Karpathy in occupation count and per-occupation pages.
- Great for occupational browsing.

Cons:

- Requires derived estimates for employment stock and/or salary.
- Much weaker statistical purity than the US version.

## 6. Practical recommendation

If the goal is to ship a solid Spain version fast without compromising official-source credibility:

- Phase 1:
  - Use `2-digit CNO` as the official canonical unit.
  - Build treemap area from INE employment.
  - Build education from INE occupation x education.
  - Build pay from INE salary table.
  - Use CNO notes for descriptions.
  - Use SEPE as the per-occupation detail layer and trend layer.

- Phase 2:
  - Add Cedefop occupation forecast for a real outlook layer.
  - Optionally project the 2-digit data down to 4-digit SEPE/CNO pages if we want more tiles.

This is the most defensible route because it keeps the statistical core official and reproducible.

## 7. Main mismatch versus the US project

The US project rests on a single integrated handbook.
Spain requires source composition.

The hardest gaps are:

- no single official handbook with all fields in one place
- no obvious Spanish-national occupation forecast equivalent to BLS OOH projections
- salary granularity is weaker than occupation granularity

## 8. Working conclusion

The Spanish equivalent is feasible.

Best official base:

- INE for occupation employment, education, and salary APIs
- INE CNO-11 notes for occupation definitions
- SEPE Observatorio for per-occupation pages, current labor-market signals, and 502-occupation browseability
- Cedefop for true outlook forecasts, if EU-official is acceptable

Most realistic first build:

- a treemap on `CNO-11 2-digit` occupations
- Spanish official sources only for area, education, descriptions, and trend
- optional EU-official forecast layer added after the first version
