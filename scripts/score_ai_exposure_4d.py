from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import os
import time
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent.parent
INPUT_FILE = ROOT / "data" / "occupation_4d_details_2025.json"
OUTPUT_FILE = ROOT / "data" / "ai_scores_4d.json"
API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "google/gemini-3.1-pro-preview"
DEFAULT_APP_URL = "https://github.com/antor/jobs-codex"
DEFAULT_APP_TITLE = "jobs-codex-spain-ai-scoring"

SYSTEM_PROMPT = """\
Eres un analista experto evaluando la exposicion de distintas ocupaciones a la IA.

Vas a recibir una ficha oficial de una ocupacion espanola CNO-11 a 4 digitos
basada en fuentes del SEPE y del INE. Debes puntuar su AI Exposure en una
escala entera de 0 a 10.

AI Exposure significa: cuanto puede reconfigurar la IA esta ocupacion en los
proximos anos, tanto por automatizacion directa de tareas como por aumentos de
productividad que reduzcan la necesidad de mano de obra por unidad de trabajo.

La senal principal es si el producto del trabajo es digital. Si la mayor parte
de la ocupacion consiste en escribir, analizar, programar, clasificar
informacion, generar contenido, disenar en software, comunicarse o coordinar
desde un ordenador, la exposicion tiende a ser alta. Si la ocupacion exige
presencia fisica, destreza manual, manipulacion de objetos, supervision en
entornos fisicos o interaccion humana presencial en tiempo real, la exposicion
tiende a ser menor.

Usa estas anclas:

- 0-1: exposicion minima. Trabajo casi totalmente fisico y presencial.
- 2-3: exposicion baja. IA ayuda en tareas perifericas, no en el nucleo.
- 4-5: exposicion media. Mezcla clara de trabajo fisico/interpersonal y trabajo informacional.
- 6-7: exposicion alta. Trabajo principalmente de conocimiento, con barreras humanas relevantes.
- 8-9: exposicion muy alta. Trabajo casi totalmente digital o informacional.
- 10: exposicion maxima. Procesamiento rutinario de informacion plenamente digital.

No puntues "si desaparece el empleo". Puntua "cuanto lo reconfigura la IA".
Una ocupacion puede tener exposicion alta y aun asi seguir creciendo.

Responde SOLO con un objeto JSON valido, sin markdown ni texto adicional, con
esta forma exacta:
{
  "exposure": <entero 0-10>,
  "confidence": <entero 0-10>,
  "rationale": "<2-4 frases claras y concretas>"
}
"""


def load_env(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        key = key.strip()
        value = value.strip().strip("\"'")
        os.environ.setdefault(key, value)


def load_input(path: Path) -> list[dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    return payload["occupations"]


def load_existing_scores(path: Path) -> dict[str, dict[str, Any]]:
    if not path.exists():
        return {}
    existing = json.loads(path.read_text(encoding="utf-8"))
    return {entry["cno_4d"]: entry for entry in existing}


def save_scores(path: Path, scores: dict[str, dict[str, Any]]) -> None:
    rows = [scores[key] for key in sorted(scores)]
    path.write_text(json.dumps(rows, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def build_user_prompt(occupation: dict[str, Any]) -> str:
    tasks = occupation.get("tasks") or []
    included = occupation.get("included_examples") or []
    excluded = occupation.get("excluded_examples") or []

    sections = [
        f"Ocupacion CNO-11: {occupation['cno_4d']} {occupation['label']}",
        f"Grupo 2d: {occupation['cno_2d']}",
        f"Resumen oficial: {occupation.get('description_summary') or 'Sin resumen.'}",
        "Tareas oficiales:",
        "\n".join(f"- {task}" for task in tasks) if tasks else "- Sin tareas listadas.",
        "Ejemplos incluidos:",
        "\n".join(f"- {item}" for item in included) if included else "- Sin ejemplos incluidos.",
        "Ocupaciones afines excluidas:",
        "\n".join(f"- {item}" for item in excluded) if excluded else "- Sin exclusiones listadas.",
        "Indicadores de mercado SEPE 2025:",
        f"- contratos: {occupation.get('contracts')}",
        f"- personas con contrato: {occupation.get('contract_persons')}",
        f"- demandantes: {occupation.get('demandants')}",
        f"- parados: {occupation.get('unemployed')}",
        f"- variacion interanual de contratos: {occupation.get('contracts_yoy_pct')}%",
        f"- variacion interanual de demandantes: {occupation.get('demandants_yoy_pct')}%",
    ]
    return "\n".join(sections)


def extract_json_object(text: str) -> dict[str, Any]:
    stripped = text.strip()
    if stripped.startswith("```"):
        lines = stripped.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        stripped = "\n".join(lines).strip()

    start = stripped.find("{")
    end = stripped.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError(f"Model did not return a JSON object: {stripped[:240]}")
    return json.loads(stripped[start:end + 1])


def normalize_result(
    occupation: dict[str, Any],
    result: dict[str, Any],
    model: str,
) -> dict[str, Any]:
    exposure = int(result["exposure"])
    confidence = int(result["confidence"])
    rationale_raw = result.get("rationale")
    if not isinstance(rationale_raw, str):
        raise ValueError("Missing or non-string rationale.")
    rationale = rationale_raw.strip()

    if exposure < 0 or exposure > 10:
        raise ValueError(f"Exposure out of range: {exposure}")
    if confidence < 0 or confidence > 10:
        raise ValueError(f"Confidence out of range: {confidence}")
    if not rationale:
        raise ValueError("Empty rationale.")

    return {
        "cno_4d": occupation["cno_4d"],
        "cno_2d": occupation["cno_2d"],
        "label": occupation["label"],
        "model": model,
        "source_id": "openrouter_llm",
        "quality": "llm",
        "exposure": exposure,
        "confidence": confidence,
        "rationale": rationale,
    }


def openrouter_chat(
    api_key: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float,
) -> dict[str, Any]:
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature,
    }

    request = Request(
        API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": os.environ.get("OPENROUTER_APP_URL", DEFAULT_APP_URL),
            "X-OpenRouter-Title": os.environ.get("OPENROUTER_APP_TITLE", DEFAULT_APP_TITLE),
        },
        method="POST",
    )
    with urlopen(request, timeout=180) as response:
        raw = response.read().decode("utf-8")
    return json.loads(raw)


def score_one(
    api_key: str,
    occupation: dict[str, Any],
    model: str,
    temperature: float,
    retries: int,
) -> dict[str, Any]:
    user_prompt = build_user_prompt(occupation)
    last_error: Exception | None = None

    for attempt in range(retries + 1):
        try:
            response = openrouter_chat(
                api_key=api_key,
                model=model,
                system_prompt=SYSTEM_PROMPT,
                user_prompt=user_prompt,
                temperature=temperature,
            )
            content = response["choices"][0]["message"]["content"]
            result = extract_json_object(content)
            return normalize_result(occupation, result, model)
        except (HTTPError, URLError, TimeoutError, ValueError, KeyError, json.JSONDecodeError) as exc:
            last_error = exc
            if attempt >= retries:
                break
            time.sleep(2 + attempt * 2)

    raise RuntimeError(f"Scoring failed for {occupation['cno_4d']}: {last_error}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--input", default=str(INPUT_FILE))
    parser.add_argument("--output", default=str(OUTPUT_FILE))
    parser.add_argument("--start", type=int, default=0)
    parser.add_argument("--end", type=int, default=None)
    parser.add_argument("--delay", type=float, default=0.4)
    parser.add_argument("--temperature", type=float, default=0.1)
    parser.add_argument("--retries", type=int, default=2)
    parser.add_argument("--workers", type=int, default=1)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--max-items", type=int, default=None)
    args = parser.parse_args()

    load_env(ROOT / ".env")
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise SystemExit("OPENROUTER_API_KEY not found in environment or .env")

    input_path = Path(args.input)
    output_path = Path(args.output)
    occupations = load_input(input_path)
    subset = occupations[args.start:args.end]
    if args.max_items is not None:
        subset = subset[:args.max_items]

    scores = {} if args.force else load_existing_scores(output_path)
    print(f"Scoring {len(subset)} occupations with {args.model}")
    print(f"Cached scores available: {len(scores)}")

    errors: list[str] = []
    completed = 0
    start_time = time.time()

    pending = [
        occupation
        for occupation in subset
        if args.force or occupation["cno_4d"] not in scores
    ]
    print(f"Pending this run: {len(pending)}")

    if args.workers <= 1:
        for index, occupation in enumerate(pending, start=1):
            code = occupation["cno_4d"]
            print(f"[{index}/{len(pending)}] {code} {occupation['label']}...", end=" ", flush=True)
            try:
                result = score_one(
                    api_key=api_key,
                    occupation=occupation,
                    model=args.model,
                    temperature=args.temperature,
                    retries=args.retries,
                )
                scores[code] = result
                completed += 1
                print(f"exposure={result['exposure']} confidence={result['confidence']}")
            except Exception as exc:
                errors.append(code)
                print(f"ERROR {exc}")

            save_scores(output_path, scores)
            if index < len(pending):
                time.sleep(args.delay)
    else:
        def worker(occupation: dict[str, Any]) -> dict[str, Any]:
            if args.delay:
                time.sleep(args.delay)
            return score_one(
                api_key=api_key,
                occupation=occupation,
                model=args.model,
                temperature=args.temperature,
                retries=args.retries,
            )

        with ThreadPoolExecutor(max_workers=args.workers) as executor:
            future_map = {
                executor.submit(worker, occupation): occupation
                for occupation in pending
            }
            for index, future in enumerate(as_completed(future_map), start=1):
                occupation = future_map[future]
                code = occupation["cno_4d"]
                try:
                    result = future.result()
                    scores[code] = result
                    completed += 1
                    print(
                        f"[{index}/{len(pending)}] {code} {occupation['label']}... "
                        f"exposure={result['exposure']} confidence={result['confidence']}",
                        flush=True,
                    )
                except Exception as exc:
                    errors.append(code)
                    print(f"[{index}/{len(pending)}] {code} {occupation['label']}... ERROR {exc}", flush=True)
                save_scores(output_path, scores)

    elapsed = time.time() - start_time
    print(f"\nDone in {elapsed:.1f}s")
    print(f"Saved scores: {len(scores)}")
    print(f"Newly scored this run: {completed}")
    if errors:
        print(f"Errors ({len(errors)}): {errors}")

    values = [entry["exposure"] for entry in scores.values() if "exposure" in entry]
    if values:
        average = sum(values) / len(values)
        print(f"Average exposure: {average:.2f}")


if __name__ == "__main__":
    main()
