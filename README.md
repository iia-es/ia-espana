# Impacto laboral de la IA en España 

Visualización estática sobre empleo, salarios, educación, demanda y automatización por IA en España, construida con fuentes oficiales del INE y del SEPE.

La versión publicada en GitHub Pages despliega directamente el contenido del directorio `site/` y sus datos asociados.

## Desarrollo local

```bash
python3 -m http.server 8765
```

Después abre `http://127.0.0.1:8765/site/`.

## Despliegue

Cada push a `main` activa el workflow de GitHub Pages en `.github/workflows/deploy-pages.yml`, que publica el directorio `site/`.
