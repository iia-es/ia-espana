# Plan

## Diagnóstico rápido

La página tiene un gran punto de partida: toca una ansiedad masiva —"¿qué va a pasar con mi trabajo?"— y la resuelve con un gesto muy compartible: **buscar tu oficio**. En lo que aparece indexable, la página se presenta como "Impacto laboral de la IA en España", con buscador de profesión, gráfico de trabajos, metodología y fuentes INE/SEPE/exposición IA. También tiene anclas para compartir `#titulares`, `#buscar` o `#figura`. ([antorsae.github.io][1])

El problema es que, para medios, ahora parece más **una herramienta interesante** que **una noticia citable**. Falta una capa editorial con titulares cerrados, cifras destacadas, "qué ha cambiado", portavoces, gráficos descargables y conclusiones listas para ser citadas. Además, en el texto indexable no aparece una llamada clara a suscribirse a la newsletter ni una conexión fuerte con el Instituto de Inteligencia Artificial; y el BibTeX visible contiene un placeholder `https://ia-espana.example`, detalle pequeño pero dañino para credibilidad si lo ve un periodista. ([antorsae.github.io][1])

La oportunidad es real porque el eje **IA + empleo + España** ya está funcionando en medios. Cadena SER ha tratado el impacto laboral y la automatización en formato radio, La Razón publicó una pieza sobre la caída de oferta para programadores en España, y El País cubrió el informe de la OCDE sobre exposición regional a IA generativa. ([Cadena SER][2])

---

# 1. Reposicionar la página: de "herramienta" a propiedad editorial noticiosa

Yo la convertiría en:

**El futuro del trabajo y la IA en España**

Subtítulo posible:

**Busca tu profesión y consulta el ranking de exposición a la IA, salario, demanda laboral y evolución del empleo con datos oficiales del INE y SEPE.**

La página debe tener dos capas:

- **Capa pública/viral:** "Busca tu oficio", resultado personalizado, tarjeta para compartir.
- **Capa periodística:** titulares, rankings, gráficos, metodología, nota de prensa, portavoces, descarga de datos.

Y debe tener dos acciones principales según el tipo de usuario:

- **Visitante general:** suscribirse a **1 Minuto de IA**.
- **Periodista o medio:** citar el dato, descargar material o contactar con prensa.

Ahora mismo el contenido habla de "lo que cuentan los datos" y de "explora el gráfico de trabajos", pero no veo un bloque fuerte tipo "la noticia de hoy es...". ([antorsae.github.io][1])

---

# 2. Cambios de contenido para que sea noticia

## 2.1. Añadir un bloque superior: "La noticia en 5 datos"

Antes del buscador, pondría un bloque de titulares con cifras generadas a partir de vuestro dataset. No inventaría cifras; las calcularía y las mostraría de forma actualizable.

Ejemplo de formato:

**La IA golpea primero a los trabajos de oficina, pero no siempre a los peor pagados**

1. **X millones de trabajadores** están en ocupaciones con exposición alta a IA.
2. **Las profesiones mejor pagadas y más expuestas** son: X, Y, Z.
3. **Los trabajos más protegidos** combinan presencia física, trato humano o responsabilidad manual.
4. **Las ocupaciones con más competencia laboral** no siempre son las más automatizables.
5. **Programadores, administrativos, periodistas, abogados y profesores** son los oficios más buscados por los lectores.

Esto transforma la página en "referenciable". Un periodista no quiere decir "hay una herramienta"; quiere decir "un análisis del Instituto de Inteligencia Artificial concluye que...".

## 2.2. Crear rankings con titulares periodísticos

La página debería tener secciones fijas como estas:

**Los 20 trabajos más expuestos a la IA en España**  
**Los 20 trabajos más protegidos frente a la IA**  
**Los empleos con salario alto y exposición alta**  
**Los empleos con mucha competencia y baja protección**  
**Los empleos donde la IA puede aumentar productividad, no destruir empleo**  
**Los trabajos donde formarse en IA tiene más retorno**  
**Los sectores que deberían empezar a reciclar talento ya**

El gráfico actual de "Pagado y expuesto — el cuadrante incómodo" es una idea potente, pero conviene convertirlo en noticia: "Las profesiones de salario medio-alto que más deberían prepararse para la IA". ([antorsae.github.io][1])

## 2.3. Crear una ficha individual por profesión

No basta con que el buscador abra una ficha dentro de la misma página. Cada profesión debería tener URL propia indexable y compartible:

- `https://trabajo.iia.es/programador`
- `https://trabajo.iia.es/administrativo`
- `https://trabajo.iia.es/medico`
- `https://trabajo.iia.es/periodista`
- `https://trabajo.iia.es/profesor`
- `https://trabajo.iia.es/abogado`

Cada ficha debería tener:

**Título SEO:**  
"¿Está mi trabajo en riesgo por la IA? Programadores en España: exposición, salario y demanda"

**Resumen de 3 líneas:**  
"Los programadores tienen una exposición X/10 a la IA. Su salario medio es X. La demanda laboral ha subido/bajado X en el último año. La clave no es desaparecer, sino cambiar de tareas."

**Bloques fijos:**

- Qué tareas puede automatizar la IA.
- Qué tareas siguen siendo humanas.
- Qué habilidades debería aprender esta profesión.
- Qué noticias de IA debe seguir.
- CTA: "Recibe cada mañana 1 Minuto de IA para entender cómo cambia tu trabajo."

Esto generaría tráfico long-tail brutal para búsquedas como "la IA reemplazará a los abogados", "trabajos seguros inteligencia artificial", "ia programadores españa", "profesiones amenazadas por chatgpt", etc.

## 2.4. Añadir "exposición no significa sustitución"

Es clave para credibilidad. La página ya dice que la parte de IA es orientativa y no predictiva. ([antorsae.github.io][1]) Pero debería explicarlo arriba, no solo en metodología.

Propuesta:

**Importante:** una profesión expuesta a la IA no es necesariamente una profesión que vaya a desaparecer. Significa que muchas de sus tareas pueden cambiar. En algunos casos la IA sustituirá tareas; en otros aumentará productividad, salario o demanda de perfiles híbridos.

Esto reduce alarmismo y aumenta posibilidad de cita por medios serios.

## 2.5. Añadir contexto con fuentes externas

La página debe decir: "Nuestro análisis se suma a un debate internacional". Por ejemplo, El País ya citó datos de la OCDE según los cuales el 27,4% de los empleos en España están expuestos a IA generativa, por encima de la media citada en esa pieza, aunque el riesgo de automatización alto sería menor que en otros países. ([El País][3])

También podéis contrastar vuestro enfoque con informes españoles sobre adopción y productividad. Cotec/ISEAK, por ejemplo, estima con datos de empresas españolas que las compañías que usan al menos una tecnología de IA presentan niveles de productividad laboral superiores frente a las que no la usan, aunque con matices metodológicos.

Eso permite posicionar la página no como "ranking sensacionalista", sino como "recurso práctico para trabajadores y empresas".

---

# 3. Hacerla mucho más compartible

## 3.1. Tarjeta personalizada por profesión

Después de buscar, el usuario debería poder compartir una imagen tipo:

**Mi profesión ante la IA**  
Periodista  
Exposición IA: 8,1/10  
Salario medio: XX €  
Demanda laboral: sube/baja X%  
Ver ficha completa: trabajo.iia.es/periodista

Botones:

- Compartir por WhatsApp
- Compartir en LinkedIn
- Compartir en X
- Copiar enlace
- Descargar imagen

WhatsApp es crítico para España. LinkedIn es crítico para profesionales. X es útil para periodistas, tecnólogos y políticos.

## 3.2. Open Graph dinámico

Cada ficha debe generar su propia imagen social.

No debería verse siempre la misma miniatura al compartir. Debe verse algo así:

**¿Está tu trabajo expuesto a la IA?**  
Administrativos: exposición 8,4/10  
Datos INE + SEPE + El futuro del trabajo y la IA en España  
Instituto de Inteligencia Artificial

Esto aumenta CTR en redes y grupos.

## 3.3. Enlaces profundos y slugs humanos

Ahora se sugieren anclas como `#titulares`, `#buscar` o `#figura`. ([antorsae.github.io][1]) Bien, pero insuficiente.

Usaría:

- `https://trabajo.iia.es/ranking-trabajos-mas-expuestos-ia`
- `https://trabajo.iia.es/trabajos-protegidos-ia`
- `https://trabajo.iia.es/salario-exposicion-ia`
- `https://trabajo.iia.es/metodologia`
- `https://trabajo.iia.es/prensa`
- `https://trabajo.iia.es/programador`
- `https://trabajo.iia.es/periodista`
- `https://trabajo.iia.es/administrativo`

## 3.4. Botón "cita este dato"

Cada ranking y gráfico debe tener:

- **Copiar titular**
- **Copiar dato**
- **Copiar cita para prensa**
- **Descargar gráfico en PNG**
- **Descargar CSV**

Ejemplo:

> Según "El futuro del trabajo y la IA en España", del Instituto de Inteligencia Artificial, las ocupaciones de [familia] combinan exposición alta a IA y salario superior a la media nacional.

Esto facilita que periodistas y bloggers lo usen.

## 3.5. Modo "embed" para medios

Ofrecer un iframe:

"Inserta el buscador de profesiones en tu artículo."

Los medios digitales aman herramientas embebibles si no rompen su página. Puede generar backlinks y tráfico de referencia.

---

# 4. Convertirla en material para prensa y radio

## 4.1. Crear una sala de prensa dentro de la página

Sección fija:

**Para periodistas**

Incluiría:

- Nota de prensa descargable.
- Resumen de metodología en 10 líneas.
- CSV completo.
- Gráficos en PNG/SVG.
- 3 titulares sugeridos.
- 3 cortes de audio de 20 segundos.
- Fotos y bio de portavoces.
- Contacto directo: email + teléfono + disponibilidad.

El Instituto ya tiene activos de credibilidad: en su web se posiciona como entidad que ayuda a profesionales y empresas a aplicar IA con resultados medibles, dice estar activo desde 2019, y muestra +1200 alumnos y +40 ponentes. ([Instituto de Inteligencia Artificial][4]) Eso debe aparecer en el press kit, no escondido en otra web.

## 4.2. Titulares listos para medios

Ejemplos de notas de prensa:

**Titular 1:**  
"Los trabajos de oficina concentran la mayor exposición a la IA en España, según 'El futuro del trabajo y la IA en España'"

**Titular 2:**  
"Los empleos mejor pagados no son inmunes: el cuadrante incómodo de la IA en España"

**Titular 3:**  
"Ni programadores ni periodistas están condenados, pero sí obligados a cambiar de tareas"

**Titular 4:**  
"La IA no amenaza igual a Madrid que a la España rural: el nuevo mapa del riesgo laboral"

Este último solo si añadís corte territorial. Es muy potente porque El País ya trató diferencias regionales de exposición a IA en España a partir de la OCDE. ([El País][3])

## 4.3. Dar a radio un guion simple

Para radio, el ángulo debe ser humano:

"Entra, busca tu oficio y en diez segundos sabes qué tareas cambiarán con la IA."

Corte de portavoz:

> "No estamos diciendo que la IA vaya a destruir una profesión entera. Estamos midiendo cuántas tareas de cada ocupación pueden cambiar. La pregunta importante no es si tu trabajo desaparece, sino qué parte de tu trabajo tendrás que aprender a hacer de otra manera."

Eso es mucho más radiofónico que hablar de CNO-2d.

## 4.4. Ofrecer exclusivas por vertical

No mandaría la misma nota a todos. Prepararía versiones:

- Economía: salarios, productividad, ocupación.
- Tecnología: tareas automatizables, modelos generativos.
- Educación: qué estudiar para no quedarse atrás.
- Sociedad: impacto en clase media, jóvenes y mayores de 50.
- RRHH: reskilling y formación interna.
- Radio local: ranking por comunidad autónoma o provincia, si añadís datos territoriales.

---

# 5. Contenidos nuevos que añadiría

## 5.1. Mapa por comunidades autónomas

Aunque la fuente principal actual parezca ocupacional, merece la pena añadir capa territorial si técnicamente es posible.

Piezas posibles:

- "Madrid y Cataluña concentran más empleos expuestos por peso de oficinas y servicios profesionales."
- "Canarias y Baleares tienen exposición distinta por peso de hostelería y turismo."
- "Comunidades industriales: menos exposición generativa, más automatización física."

No lo publicaría sin datos sólidos, pero el ángulo regional es el que más multiplica menciones en prensa local.

## 5.2. Sección "qué estudiar si tu profesión está expuesta"

Esta sección convierte tráfico en newsletter.

Para cada profesión:

- Herramientas IA útiles.
- Habilidades humanas difíciles de automatizar.
- Habilidades técnicas mínimas.
- Riesgos reales.
- Plan de 30 días.
- Newsletter recomendada: Explicable / 1 Minuto de IA.

## 5.3. "El semáforo de tareas"

En vez de decir solo "profesión X expuesta", bajar a tareas:

- Verde: difícil de automatizar.
- Ámbar: aumentada por IA.
- Rojo: fácilmente automatizable.

Ejemplo para periodistas:

- Rojo: resumir notas de prensa, transcribir, titulares básicos.
- Ámbar: documentación, búsqueda de contexto, edición.
- Verde: fuentes, criterio editorial, investigación, presencia, entrevistas.

Esto se comparte mucho más que una puntuación abstracta.

## 5.4. Comparador de profesiones

"Compara tu trabajo con el de tu pareja, tu jefe o tu hijo."

Ejemplo:

- Administrativo vs enfermera.
- Programador vs electricista.
- Profesor vs periodista.
- Abogado vs médico.

Es muy viral y genera sesiones largas.

## 5.5. Actualización mensual

La página no debería ser un lanzamiento único. Debe ser un producto editorial recurrente:

**Barómetro mensual IA y empleo en España**

Cada mes:

1. 1 dato nuevo.
2. 1 gráfico nuevo.
3. 1 profesión destacada.
4. 1 entrevista breve.
5. 1 llamada a la newsletter.

Esto da excusa para volver a salir en prensa.

---

# 6. SEO: cómo capturar tráfico masivo en España

## 6.1. Atacar búsquedas de miedo y utilidad

Crear páginas para estas intenciones:

- "trabajos que desaparecerán por la IA"
- "trabajos seguros frente a la IA"
- "la IA me quitará el trabajo"
- "profesiones con más futuro inteligencia artificial"
- "qué estudiar con inteligencia artificial"
- "empleos más afectados por ChatGPT"
- "impacto IA empleo España"
- "trabajos automatizables España"
- "IA administrativos"
- "IA abogados"
- "IA programadores"
- "IA profesores"
- "IA periodistas"

La home debe ser más institucional, pero las páginas de profesión deben ser agresivamente SEO.

## 6.2. Programmatic SEO con control editorial

Con 62 grupos ocupacionales podéis generar 62 páginas buenas. Pero no deben ser páginas finas generadas automáticamente. Cada una debe tener:

- Texto único.
- Tareas concretas.
- Datos.
- Gráfico.
- FAQ.
- CTA newsletter.
- Fecha de actualización.
- Autor/revisor.

## 6.3. Schema.org

Añadiría:

- `Dataset` para el conjunto de datos.
- `NewsArticle` para la nota principal.
- `FAQPage` para preguntas frecuentes.
- `Organization` para Instituto de Inteligencia Artificial.
- `Person` para portavoces.
- `BreadcrumbList`.
- `SoftwareApplication` solo para la herramienta, no como foco principal.

## 6.4. Migrar o canonizar a dominio propio

La URL actual está en GitHub Pages. Para autoridad de marca y newsletter, movería el proyecto a:

- `https://trabajo.iia.es/`

Y usaría URLs de contenido como:

- `https://trabajo.iia.es/ranking-trabajos-mas-expuestos-ia`
- `https://trabajo.iia.es/trabajos-protegidos-ia`
- `https://trabajo.iia.es/salario-exposicion-ia`
- `https://trabajo.iia.es/periodista`
- `https://trabajo.iia.es/programador`

Para V1, la opción correcta es:

- Sitio **estático**
- Servido desde **GitHub Pages**
- Publicado bajo **`trabajo.iia.es`** mediante `CNAME`

Puede mantenerse GitHub como hosting, pero el dominio público debería ser de IIA. Si se deja en `antorsae.github.io`, el tráfico y backlinks fortalecen más a GitHub/usuario personal que al Instituto. `trabajo.iia.es` además encaja con el ecosistema ya existente de marca y producto del IIA.

---

# 7. Conversión a newsletter

El objetivo final no es solo tráfico: es suscripción diaria. Ahora la conexión debe ser mucho más directa.

El Instituto ya tiene Explicable, definida como newsletter sobre noticias de IA con impacto en negocios, y en Substack aparece una sección "1 Minuto de IA" con publicaciones recientes y promesa de "lo esencial de la IA, cada día". ([Instituto de Inteligencia Artificial][4])

## 7.0. La acción principal del visitante general

Para cualquier visitante que no sea periodista, la acción principal de la página debe ser **suscribirse a 1 Minuto de IA**.

Eso no debería resolverse con un simple enlace perdido en el footer ni con un CTA genérico. Debería resolverse con una **cajita integrada** y bien diseñada dentro de la experiencia principal de `trabajo.iia.es`, visible, contextual y coherente con el contenido que el usuario acaba de consultar.

La integración ideal:

- Una caja de suscripción visible en el primer scroll o cerca del bloque principal de hallazgos.
- Una segunda caja integrada justo después del resultado al buscar una profesión.
- Una versión adaptada al contexto: "Recibe cada mañana 1 Minuto de IA para entender cómo cambia tu trabajo".
- Integración limpia con la identidad del IIA y con `Explicable`, sin parecer un pop-up agresivo ni una pieza ajena al producto.

Para V1, la implementación más simple es:

- Usar el **embed oficial de suscripción de Substack** para `Explicable / 1 Minuto de IA`.
- Insertarlo dentro de una caja propia del diseño de `trabajo.iia.es`.
- Si el embed oficial limita demasiado el diseño, usar una caja visual propia con CTA a la página oficial de suscripción como fallback.

La prioridad aquí no es sofisticación técnica, sino **fricción mínima** y una integración visual suficiente.

La regla de producto debería ser esta:

- **Si el usuario entra por curiosidad o utilidad, la página debe llevarlo de forma natural a suscribirse.**
- **Si el usuario entra como periodista, la página debe llevarlo de forma natural a citar, descargar o contactar.**

## 7.1. CTA principal contextual

No pondría solo "suscríbete". Pondría:

**Recibe cada mañana 1 Minuto de IA**  
Las noticias de inteligencia artificial que pueden afectar a tu trabajo, explicadas sin humo.

Campo email + botón:

**Quiero entender cómo cambia mi trabajo**

## 7.2. Lead magnet

Ofrecer:

**Descarga el informe completo "IA y empleo en España 2026"**

A cambio de email.

Ese PDF debe tener 8-12 páginas, no 80. Debe incluir rankings, gráficos y metodología.

## 7.3. Suscripción después de buscar oficio

Cuando alguien busca su profesión, el CTA debe cambiar:

"¿Quieres recibir alertas cuando publiquemos noticias que afecten a periodistas/programadores/abogados?"

Formulario:

- Email
- Profesión
- Sector opcional

Esto permite segmentar la newsletter en el futuro.

## 7.4. Secuencia de bienvenida

- Día 0: resultado de tu profesión + mejores recursos.
- Día 1: "5 formas de leer noticias de IA sin caer en hype."
- Día 3: "Qué tareas automatiza la IA y cuáles no."
- Día 5: invitación a compartir la herramienta.

## 7.5. Prueba social

Incluir en la página:

- "Explicable, la newsletter del Instituto de Inteligencia Artificial."
- "Publicada por Miguel A. Román."
- "De lunes a viernes: 1 Minuto de IA."
- "Instituto de Inteligencia Artificial: desde 2019, +1200 alumnos."

La web de IIA ya comunica parte de esto, pero hay que llevarlo a `trabajo.iia.es`. ([Instituto de Inteligencia Artificial][4])

---

# 8. Publicidad y distribución

## 8.1. Lanzamiento PR en tres oleadas

**Oleada 1: exclusiva**  
Dar a un medio grande un titular con datos inéditos. Ideal: economía, tecnología o radio nacional.

**Oleada 2: prensa regional**  
Enviar versiones por comunidad autónoma. "Los empleos más expuestos a la IA en Andalucía / Madrid / Comunidad Valenciana..."

**Oleada 3: verticales profesionales**  
Colegios de abogados, asociaciones de periodistas, colegios de médicos, sindicatos, asociaciones de autónomos, escuelas de negocio, comunidades tech.

## 8.2. LinkedIn

LinkedIn debería ser el canal orgánico principal para conversión de calidad.

Piezas:

- Carrusel: "Los 10 trabajos más expuestos a la IA en España."
- Carrusel: "Exposición no es sustitución."
- Post de Andrés/Miguel/Aurelia: "He buscado mi profesión y esto sale."
- Encuesta: "¿Crees que tu trabajo está más o menos expuesto que la media?"
- Documento descargable: informe PDF.

El IIA tiene visibilidad en LinkedIn; una publicación indexada muestra 12.107 seguidores en la página de Instituto de Inteligencia Artificial, lo que es una base inicial útil para distribución. ([LinkedIn][5])

## 8.3. X/Twitter

Usaría hilos con gráficos:

"Acabamos de cruzar datos de INE, SEPE y exposición a IA para 62 grupos ocupacionales. Estos son los 7 hallazgos más incómodos."

Cada tuit con un gráfico compartible y enlace con UTM.

## 8.4. YouTube Shorts, Reels y TikTok

Formato:

- "¿La IA va a quitarle el trabajo a los administrativos?"
- "3 trabajos que están más protegidos de lo que crees."
- "Un programador, un abogado y un electricista entran en el buscador..."

El canal de YouTube del IIA aparece con una base relevante de suscriptores en resultados públicos, así que hay activo audiovisual que aprovechar. ([YouTube][6])

## 8.5. Newsletter swaps

Buscar intercambios con newsletters de negocio, tecnología, empleo y productividad. El espacio de newsletters de IA en español ya está competido; directorios especializados listan varias newsletters con decenas de miles de lectores, así que la diferenciación debe ser "IA + empleo + España + datos oficiales", no "otra newsletter de IA". ([OhMyNewst][7])

## 8.6. Paid media

Campañas pequeñas pero muy segmentadas:

**Google Search:**

- "la IA me quitará el trabajo"
- "trabajos seguros IA"
- "profesiones futuro IA"
- "IA empleo España"

**LinkedIn Ads:**

- RRHH, formación, directivos, consultores, abogados, marketing, tecnología.

**Meta/TikTok:**

- Creatividades por profesión: "Administrativo: mira cómo afecta la IA a tu trabajo."

**Retargeting:**

- Usuarios que buscaron una profesión pero no se suscribieron.

## 8.7. Menéame, Reddit, Forocoches, grupos WhatsApp/Telegram

La herramienta tiene potencial "mira qué sale para mi trabajo". En Menéame funcionaría mejor si el titular no parece marketing:

"Un análisis cruza INE, SEPE y exposición a IA para ver qué profesiones españolas están más afectadas."

La comunidad penalizará mucho si parece captación de leads. Primero valor, después newsletter.

---

# 9. Decisiones cerradas para V1

## 9.1. Objetivo del lanzamiento

En V1 no hay que intentar resolverlo todo. Hay que lanzar algo que pueda:

- circular
- ser citado
- convertir parte del interés en suscripción

KPIs principales de lanzamiento:

1. **Compartidos** de la página y de las fichas.
2. **Menciones en medios** o referencias de periodistas, radios, newsletters y creadores muy on-topic.

KPI secundario:

- **Suscripciones a 1 Minuto de IA** desde `trabajo.iia.es`

La acción principal del visitante general sigue siendo suscribirse, pero para evaluar si el lanzamiento ha ganado tracción pública, lo primero que hay que mirar es si la gente lo comparte y si los medios lo citan.

## 9.2. Alcance real de V1

Como el proyecto entero debe ejecutarse en **1 semana**, hay que recortar.

V1 debería incluir solo:

- Home editorial en `trabajo.iia.es`
- Buscador / herramienta principal
- Bloque "La noticia en 5 datos"
- Caja integrada de suscripción a **1 Minuto de IA**
- Sección "Para periodistas"
- Metodología clara
- 6 fichas prioritarias, no 62 ni 10 si compromete calidad

Las 6 fichas recomendadas para V1:

- Programador
- Administrativo
- Periodista
- Abogado
- Profesor
- Médico

Todo lo demás pasa a fase posterior si pone en riesgo la calidad o el plazo.

## 9.3. Lo que se aplaza a fases posteriores

No debería entrar en V1:

- Analítica avanzada y atribución fina
- Corte territorial
- Comparador de profesiones
- 62 fichas completas
- Automatizaciones complejas
- Widgets embebibles para medios

Si hay que recortar más, se recorta antes funcionalidad secundaria que claridad editorial.

## 9.4. Regla metodológica de V1

La regla es simple:

- **No inventar nada**
- **Todo lo que sea inferencia o estimación debe estar explicado**
- **Todo titular debe poder sostenerse con la metodología visible**

Si hay elementos derivados por IA, por modelo o por heurística, deben aparecer etiquetados como tal. Lo importante no es esconder la parte estimada, sino explicarla bien y no mezclarla con datos oficiales como si fueran lo mismo.

## 9.5. Outreach de V1

Con dos personas de marketing, el mejor sistema no es automatizar a ciegas. Es un flujo **agentizado pero con supervisión humana fuerte**.

Modelo recomendado:

- Una persona se encarga de medios generalistas y economía.
- Otra persona se encarga de tecnología, educación, empleo, RRHH y creadores muy especializados.
- Un agente puede preparar listas, resúmenes de medio, contexto del periodista y borradores de pitch.
- El envío final y la revisión deben ser humanos.

Regla:

- Nada de blasting masivo.
- Pocos contactos, muy bien elegidos y muy alineados con el ángulo.

---

# 10. Posicionamiento actual del Instituto de Inteligencia Artificial

## Fortalezas

El IIA se posiciona públicamente alrededor de **futuro del trabajo, formación, consultoría y divulgación**. Su home dice que ayuda a profesionales y empresas a identificar oportunidades, aplicar IA y generar resultados medibles, y conecta con Explicable, Software 2.0 y webinars. ([Instituto de Inteligencia Artificial][4])

Los fundadores aportan autoridad: Aurelia Bustos aparece como doctora en IA, oncóloga e ingeniera; Miguel A. Román como doctor en IA y perfil tecnológico; Andrés Torrubia como emprendedor y experto reconocido en Kaggle según la propia web. ([Instituto de Inteligencia Artificial][8]) Además, FECYT recoge que Aurelia Bustos es cofundadora de MedBravo y del IIA, y la Universidad de Alicante destaca premios y reconocimientos relacionados con su trabajo en IA y salud. ([Científicas e innovadoras][9])

IIAConf también refuerza el territorio "futuro del trabajo": se presenta como evento sobre IA generativa, agentes, robótica, impacto humano, con más de 300 asistentes del mundo tech, empresarial y académico. ([IIA CONF][10])

## Debilidades

El nombre "Instituto de Inteligencia Artificial" es genérico y compite semánticamente con entidades como el Instituto de Investigación en Inteligencia Artificial del CSIC y otros proyectos con nombres similares. ([IIIA][11])

Además, algunos directorios empresariales públicos muestran fichas de "Instituto de Inteligencia Artificial SL" con CNAE "Peluquerías y barberías". Si esa clasificación es incorrecta o heredada, conviene corregirla donde sea posible, porque choca con la autoridad de marca en IA. ([Cinco Días][12])

La tercera debilidad es que la página analizada no capitaliza suficiente la marca IIA. El autor visible en el BibTeX es "Observatorio IA España", pero no se ve una atribución fuerte al Instituto ni un CTA a Explicable en el contenido indexable. ([antorsae.github.io][1])

## Recomendación de posicionamiento

Crear una submarca editorial clara:

**El futuro del trabajo y la IA en España**  
por el **Instituto de Inteligencia Artificial**

Claim:

**Datos, análisis y noticias sobre cómo la inteligencia artificial transforma el trabajo en España.**

Así el IIA pasa de "empresa de formación" a "fuente recurrente para entender IA y empleo". Eso genera autoridad, leads y demanda para cursos sin vender cursos de forma directa.

---

# 11. Ideas concretas de campañas

## Campaña 1: "Busca tu oficio"

Mensaje:

**La IA no afecta igual a un abogado, a una enfermera o a un electricista. Busca tu oficio y descubre qué tareas cambiarán.**

Canales: WhatsApp, LinkedIn, X, medios generalistas.

Objetivo: viralidad y tráfico.

## Campaña 2: "El cuadrante incómodo"

Mensaje:

**Los trabajos bien pagados también están expuestos a la IA.**

Canales: prensa económica, LinkedIn, newsletters de negocio.

Objetivo: backlinks y autoridad.

## Campaña 3: "Profesiones protegidas"

Mensaje:

**No todo lo digital tiene futuro ni todo lo manual está condenado: los trabajos más resistentes a la IA en España.**

Canales: radio, prensa generalista, TikTok/Reels.

Objetivo: alcance masivo.

## Campaña 4: "IA y empleo en tu comunidad"

Mensaje:

**Qué profesiones están más expuestas a la IA en Madrid, Cataluña, Andalucía, Comunidad Valenciana...**

Canales: prensa regional.

Objetivo: multiplicar cobertura local.

## Campaña 5: "1 Minuto de IA para tu trabajo"

Mensaje:

**Cada mañana, una noticia de IA explicada desde el punto de vista de cómo afecta a tu empleo, tu empresa o tu sector.**

Canales: página, Substack, LinkedIn, retargeting.

Objetivo: suscripciones.

---

# 12. Prioridades de implementación

## Esta semana

- Corregir BibTeX y placeholder.
- Añadir marca IIA y CTA visible a Explicable.
- Diseñar e implementar una caja de suscripción bien integrada a **1 Minuto de IA** en el hero y en las fichas/resultados.
- Añadir bloque "La noticia en 5 datos".
- Añadir botones WhatsApp, LinkedIn, X y copiar enlace.
- Crear gráfico descargable del "cuadrante incómodo".
- Añadir "Para periodistas" con email, metodología y 3 titulares.
- Cambiar `title` / `meta description` para SEO.

## Ejecución de 1 semana

### Día 1: arquitectura y decisiones

- Configurar `trabajo.iia.es` con `CNAME` sobre GitHub Pages.
- Cerrar arquitectura estática final.
- Cerrar lista de 6 fichas prioritarias.
- Cerrar claims permitidos y metodología visible.

### Día 2: home y conversión

- Montar hero editorial.
- Añadir bloque "La noticia en 5 datos".
- Integrar caja principal de suscripción a **1 Minuto de IA**.
- Añadir caja secundaria tras la búsqueda o el resultado de profesión.

### Día 3: compartición y SEO básico

- Añadir botones de compartir.
- Añadir slugs finales.
- Corregir `title`, `meta description`, OG básicos y URLs compartibles.
- Corregir BibTeX y enlaces de credibilidad.

### Día 4: páginas y metodología

- Publicar la metodología clara.
- Publicar la sección "Para periodistas".
- Sacar las 6 fichas prioritarias.

### Día 5: activos de prensa y distribución

- Preparar nota de prensa y 3 titulares.
- Exportar gráficos descargables.
- Preparar listado de medios y creadores on-topic.
- Dejar plantillas de outreach revisadas por humano.

### Día 6-7: lanzamiento y ajuste

- Lanzar la página.
- Ejecutar outreach manual asistido.
- Publicar en LinkedIn y X.
- Ajustar copy, CTA y jerarquía visual según feedback inicial.

## Próximas 3-4 semanas

- Ampliar de 6 a 10 fichas SEO para profesiones populares: programador, administrativo, profesor, periodista, abogado, médico, enfermera, camarero, electricista, comercial.
- Crear imágenes OG dinámicas.
- Crear PDF "Informe IA y empleo en España 2026".
- Preparar nota de prensa.
- Lanzar campaña LinkedIn + X.
- Configurar eventos de analítica: búsqueda, profesión, scroll, share, descarga, suscripción.

## Próximos 2-3 meses

- Crear las 62 fichas ocupacionales.
- Añadir comparador de profesiones.
- Añadir cortes regionales si los datos lo permiten.
- Publicar barómetro mensual.
- Ofrecer widgets embebibles a medios.
- Crear acuerdos con newsletters, podcasts, universidades y colegios profesionales.

---

# 13. La tesis estratégica

La página no debería vender "una herramienta". Debería vender esta idea:

**El Instituto de Inteligencia Artificial mide, con datos oficiales, cómo cambia el trabajo en España por la IA. Y cada día te explica qué significa en Explicable.**

Eso une tráfico masivo, autoridad mediática y conversión a newsletter. El contenido noticioso atrae a prensa; el buscador atrae a usuarios; las fichas por profesión capturan SEO; y la newsletter convierte la ansiedad puntual en relación diaria.

---

[1]: https://antorsae.github.io/ia-espana/ "Impacto laboral de la IA en España"
[2]: https://cadenaser.com/nacional/2026/04/15/nino-becerra-alerta-sobre-la-ia-si-el-96-de-la-inversion-no-ha-tenido-retorno-es-muy-gordo-cadena-ser/ "Niño Becerra alerta sobre la IA: \"Si el 96% de la inversión no ha tenido retorno, es muy gordo\" | Economía y negocios | Cadena SER"
[3]: https://elpais.com/economia/2024-11-28/los-empleos-en-espana-estan-mas-expuestos-a-la-inteligencia-artificial-pero-son-menos-automatizables.html "Los empleos en España están más expuestos a la inteligencia artificial, pero son menos automatizables | Economía | EL PAÍS"
[4]: https://iia.es/ "Inicio - Instituto de Inteligencia Artificial"
[5]: https://es.linkedin.com/posts/institutoia_iiaconf2025-activity-7338241688311685122-F-65?utm_source=chatgpt.com "#iiaconf2025 | Instituto de Inteligencia Artificial"
[6]: https://www.youtube.com/c/InstitutodeInteligenciaArtificial?utm_source=chatgpt.com "Instituto de Inteligencia Artificial"
[7]: https://www.ohmynewst.com/newsletters/inteligencia-artificial?utm_source=chatgpt.com "Las mejores Newsletters de Inteligencia Artificial en español"
[8]: https://iia.es/sobre-nosotros/ "Sobre nosotros - Instituto de Inteligencia Artificial"
[9]: https://cientificasinnovadoras.fecyt.es/cientificas/aurelia-bustos-moreno?utm_source=chatgpt.com "Aurelia Bustos Moreno - Científicas e innovadoras - FECYT"
[10]: https://iiaconf.es/ "Home - IIA CONF"
[11]: https://www.iiia.csic.es/es/?utm_source=chatgpt.com "Instituto de Investigación en Inteligencia Artificial"
[12]: https://cincodias.elpais.com/directorio-empresas/empresa/8948857/instituto-de-inteligencia-artificial?utm_source=chatgpt.com "INSTITUTO DE INTELIGENCIA ARTIFICIAL SL - Cinco Días"
