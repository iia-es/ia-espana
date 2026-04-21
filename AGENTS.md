# AGENTS

## Qué es este proyecto

`ia-espana` es una web estática sobre el impacto laboral de la IA en España. Combina datos oficiales del INE y del SEPE con puntuaciones de exposición a IA para explicar, de forma visual y entendible, qué profesiones están más expuestas, cómo se relacionan con salario, demanda y educación, y qué cambia para trabajadores, medios y lectores.

Hoy no debe entenderse solo como una visualización de datos. La dirección del proyecto es convertirlo en una propiedad editorial publicada como `trabajo.iia.es`: compartible, citable por periodistas y radios, y útil para convertir visitantes en suscriptores de `1 Minuto de IA`.

## Documentos que mandan

### 1. `PLAN.md`

Es el documento principal de producto, posicionamiento y narrativa. Si vas a tomar decisiones sobre copy, estructura, prioridades editoriales, SEO, compartición, marca, prensa o CTAs, este archivo es la referencia base.

Ideas clave que salen de `PLAN.md`:

- El producto debe pasar de "herramienta interesante" a "análisis citable".
- La home debe tener dos capas: pública/viral y periodística.
- La acción principal para visitante general es suscribirse a `1 Minuto de IA`.
- La acción principal para periodistas es citar, descargar material o contactar.
- La metodología debe ser visible y defender cualquier titular.
- "Exposición a IA" no significa automáticamente "sustitución".

### 2. `MVP-CHECKLIST.md`

Es el documento de ejecución del MVP. Define qué entra en V1, qué no entra y en qué orden recortar si falta tiempo. Si dudas entre una mejora interesante y una tarea necesaria para lanzar, manda este archivo.

Entregables V1 obligatorios:

- home editorial en `trabajo.iia.es`
- buscador principal
- bloque "La noticia en 5 datos"
- caja de suscripción a `1 Minuto de IA`
- sección "Para periodistas"
- metodología visible
- 6 fichas prioritarias
- botones de compartir
- OG básicos

Reglas operativas heredadas del checklist:

- no inventar nada
- etiquetar cualquier heurística o estimación
- si una pieza no llega con calidad, se recorta
- si hay conflicto entre feature y claridad editorial, gana claridad editorial

### 3. `README.md`

Contiene el contexto técnico mínimo: desarrollo local y despliegue. La publicación actual sale desde `site/` mediante GitHub Pages.

## Norte del producto

Cuando trabajes en este repo, optimiza para esto:

- credibilidad editorial
- claridad para el lector en menos de 5 segundos
- facilidad de cita para prensa
- compartición por URL limpia y social cards
- conversión a newsletter

No optimices primero para:

- features vistosas sin impacto editorial
- complejidad técnica innecesaria
- automatizaciones que no entren en MVP
- visualizaciones que oculten la metodología o compliquen el mensaje

## Estructura del repo

- `site/`: versión publicada de la web estática. GitHub Pages despliega este directorio.
- `data/`: datasets procesados que alimentan la web.
- `scripts/`: pipeline y utilidades para construir datasets y extraer fuentes.
- `raw/`: descargas y materias primas de fuentes oficiales.
- `docs/`: material auxiliar del proyecto.
- `PLAN.md`: visión de producto/editorial.
- `MVP-CHECKLIST.md`: scope y definición de lanzamiento.

## Cómo trabajar aquí

Antes de tocar copy, UX, estructura o prioridades:

1. Lee `PLAN.md`.
2. Valida en `MVP-CHECKLIST.md` si la pieza entra en V1.
3. Comprueba si el cambio mejora una de estas tres cosas: cita, compartición o conversión.

Antes de publicar claims o visualizaciones:

- confirma que se sostienen con datos del repo
- deja visible la metodología o el contexto necesario
- marca explícitamente cualquier cálculo propio o estimación
- evita lenguaje alarmista que confunda exposición con sustitución

## Decisiones por defecto

Si hay ambigüedad, asume estas prioridades:

1. `PLAN.md` define la dirección.
2. `MVP-CHECKLIST.md` define el alcance real del lanzamiento.
3. La implementación técnica debe servir a esa narrativa, no al revés.

## Nota técnica

La web actual es una implementación estática. Salvo que haya una razón clara, prioriza cambios simples en `site/` y en los JSON de `data/` antes que introducir nueva infraestructura.
