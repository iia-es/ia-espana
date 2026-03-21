from __future__ import annotations

import csv
import io
import json
import re
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

from spain_sources import (
    DATA_DIR,
    RAW_DIR,
    download_to_path,
    extract_sepe_catalog,
    fetch_sepe_report_index,
    fetch_text,
    ine_export_url,
    normalize_text,
    parse_spanish_number,
    slugify,
    split_cno_label,
    strip_tags,
    write_json,
)


ROOT = Path(__file__).resolve().parent.parent
RAW_INE_DIR = RAW_DIR / "ine"
RAW_SEPE_INDEX_DIR = RAW_DIR / "sepe" / "indexes"
RAW_SEPE_REPORT_DIR = RAW_DIR / "sepe" / "reports"
SITE_DIR = ROOT / "site"
AI_SCORES_4D_PATH = DATA_DIR / "ai_scores_4d.json"

EMPLOYMENT_REFERENCE_YEAR = 2023
SALARY_REFERENCE_YEAR = 2018
MAJOR_GROUP_PAY_REFERENCE_YEAR = 2024
SEPE_REFERENCE_YEAR = 2025
MAX_SEPE_WORKERS = 6
EILU_04049_CSV_URL = "https://www.ine.es/jaxi/files/_px/es/csv_bd/t13/p100/2019/p01/l0/04049.csv_bd"
EILU_04049_HTML_URL = "https://www.ine.es/jaxi/Tabla.htm?L=0&file=04049.px&path=%2Ft13%2Fp100%2F2019%2Fp01%2F"

SPECIFIC_SALARY_SIGNAL_SPECS = [
    {
        "key": "medicina",
        "profession_label": "Médicos",
        "study_label": "Medicina",
        "aliases": ["medico", "medica", "medicos", "medicas", "medicina", "cirujano", "pediatra"],
        "occupation_codes_2d": ["21"],
        "child_codes_4d": ["2111", "2112"],
    },
    {
        "key": "enfermeria",
        "profession_label": "Enfermeros y matronos",
        "study_label": "Enfermería",
        "aliases": ["enfermero", "enfermera", "enfermeria", "matrona", "matronas"],
        "occupation_codes_2d": ["21"],
        "child_codes_4d": ["2121", "2122", "2123"],
    },
    {
        "key": "farmacia",
        "profession_label": "Farmacéuticos",
        "study_label": "Farmacia",
        "aliases": ["farmaceutico", "farmaceutica", "farmacia", "farmaceuticos", "farmaceuticas"],
        "occupation_codes_2d": ["21"],
        "child_codes_4d": ["2140"],
    },
    {
        "key": "odontologia",
        "profession_label": "Odontólogos",
        "study_label": "Odontología",
        "aliases": ["odontologo", "odontologa", "odontologia", "dentista", "dentistas"],
        "occupation_codes_2d": ["21"],
        "child_codes_4d": ["2151"],
    },
    {
        "key": "fisioterapia",
        "profession_label": "Fisioterapeutas",
        "study_label": "Fisioterapia",
        "aliases": ["fisioterapeuta", "fisioterapeutas", "fisioterapia"],
        "occupation_codes_2d": ["21"],
        "child_codes_4d": ["2152"],
    },
    {
        "key": "logopedia",
        "profession_label": "Logopedas",
        "study_label": "Logopedia",
        "aliases": ["logopeda", "logopedas", "logopedia"],
        "occupation_codes_2d": ["21"],
        "child_codes_4d": ["2154"],
    },
    {
        "key": "nutricion",
        "profession_label": "Nutricionistas y dietistas",
        "study_label": "Nutrición humana y dietética",
        "aliases": ["nutricionista", "nutricionistas", "dietista", "dietistas", "nutricion", "nutrición"],
        "occupation_codes_2d": ["21"],
        "child_codes_4d": ["2153"],
    },
    {
        "key": "optica",
        "profession_label": "Ópticos y optometristas",
        "study_label": "Óptica y optometría",
        "aliases": ["optico", "optica", "optometrista", "optometristas", "optometria", "optometría"],
        "occupation_codes_2d": ["21"],
        "child_codes_4d": ["2155"],
    },
    {
        "key": "terapia_ocupacional",
        "profession_label": "Terapeutas ocupacionales",
        "study_label": "Terapia ocupacional",
        "aliases": ["terapeuta ocupacional", "terapeutas ocupacionales", "terapia ocupacional"],
        "occupation_codes_2d": ["21"],
        "child_codes_4d": ["2156"],
    },
    {
        "key": "podologia",
        "profession_label": "Podólogos",
        "study_label": "Podología",
        "aliases": ["podologo", "podologa", "podologos", "podologas", "podologia", "podología"],
        "occupation_codes_2d": ["21"],
        "child_codes_4d": ["2157"],
    },
    {
        "key": "derecho",
        "profession_label": "Abogados",
        "study_label": "Derecho",
        "aliases": ["abogado", "abogada", "abogados", "abogadas", "derecho", "abogacia", "abogacía"],
        "occupation_codes_2d": ["25"],
        "child_codes_4d": ["2511"],
    },
    {
        "key": "informatica",
        "profession_label": "Programadores y desarrolladores",
        "study_label": "Informática",
        "aliases": [
            "programador",
            "programadora",
            "programadores",
            "programadoras",
            "desarrollador",
            "desarrolladora",
            "desarrolladores",
            "desarrolladoras",
            "software",
            "informatico",
            "informatica",
            "informática",
            "frontend",
            "backend",
            "fullstack",
            "devops",
        ],
        "occupation_codes_2d": ["27"],
        "child_codes_4d": ["2711", "2712", "2713", "2719", "2721", "2722", "2723", "2729"],
    },
    {
        "key": "psicologia",
        "profession_label": "Psicólogos",
        "study_label": "Psicología",
        "aliases": ["psicologo", "psicologa", "psicologos", "psicologas", "psicologia", "psicología"],
        "occupation_codes_2d": ["28"],
        "child_codes_4d": ["2823"],
    },
    {
        "key": "arquitectura",
        "profession_label": "Arquitectos",
        "study_label": "Arquitectura",
        "aliases": ["arquitecto", "arquitecta", "arquitectos", "arquitectas", "arquitectura"],
        "occupation_codes_2d": ["24"],
        "child_codes_4d": ["2451", "2452", "2481"],
    },
]

DERIVED_GROSS_ANNUAL_ASSUMPTIONS = {
    "pay_periods_per_year": 14,
    "employee_social_security_rate": 0.0635,
    "personal_allowance_eur": 5550.0,
    "employment_expense_deduction_eur": 2000.0,
    "irpf_brackets": [
        {"up_to": 12450.0, "rate": 0.19},
        {"up_to": 20200.0, "rate": 0.24},
        {"up_to": 35200.0, "rate": 0.30},
        {"up_to": 60000.0, "rate": 0.37},
        {"up_to": None, "rate": 0.45},
    ],
    "description": (
        "Estimación propia de esta web al convertir tramos netos mensuales del INE "
        "a una banda aproximada de salario bruto anual."
    ),
    "caveat": (
        "Supone un perfil estándar simplificado de asalariado en España, sin hijos, "
        "con 14 pagas y cotización general. No es un cálculo oficial ni personalizado."
    ),
}


def step(message: str) -> None:
    print(message, flush=True)


def decode_local_text(path: Path) -> str:
    raw = path.read_bytes()
    if raw.startswith(b"\xef\xbb\xbf"):
        return raw.decode("utf-8-sig")
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        return raw.decode("iso-8859-15")


def read_tsv_rows(path: Path) -> list[dict[str, str]]:
    text = decode_local_text(path)
    reader = csv.DictReader(io.StringIO(text), delimiter="\t")
    return [dict(row) for row in reader]


def read_eilu_rows(path: Path) -> list[dict[str, str]]:
    text = decode_local_text(path)
    reader = csv.DictReader(io.StringIO(text), delimiter="\t")
    return [dict(row) for row in reader]


def unique_source_trace(values: list[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for value in values:
        if not value or value in seen:
            continue
        seen.add(value)
        ordered.append(value)
    return ordered


def round_or_none(value: float | int | None, digits: int = 2) -> float | int | None:
    if value is None:
        return None
    return round(value, digits)


def ensure_ine_exports() -> dict[str, Path]:
    downloads = {
        "69953_csv": RAW_INE_DIR / "69953.csv",
        "69953_px": RAW_INE_DIR / "69953.px",
        "70672_csv": RAW_INE_DIR / "70672.csv",
        "70672_px": RAW_INE_DIR / "70672.px",
        "66244_csv": RAW_INE_DIR / "66244.csv",
        "66244_px": RAW_INE_DIR / "66244.px",
    }

    for key, path in downloads.items():
        if "69953" in key:
            table_id = 69953
        elif "70672" in key:
            table_id = 70672
        else:
            table_id = 66244

        if key.endswith("_csv"):
            url = ine_export_url(table_id, "csv_bd", "csv", is_px=False)
        else:
            url = ine_export_url(table_id, "px", "px", is_px=False)
        download_to_path(url, path)
    return downloads


def ensure_specific_salary_exports() -> dict[str, Path]:
    downloads = {
        "eilu_04049_csv": RAW_INE_DIR / "eilu_04049.csv",
    }
    download_to_path(EILU_04049_CSV_URL, downloads["eilu_04049_csv"])
    return downloads


def load_or_create_sepe_catalog() -> dict[str, Any]:
    catalog_path = DATA_DIR / "sepe_catalog_4d.json"
    if catalog_path.exists():
        return json.loads(catalog_path.read_text(encoding="utf-8"))
    catalog = extract_sepe_catalog()
    write_json(catalog_path, catalog)
    return catalog


def build_bridge(catalog: dict[str, Any]) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    grouped: dict[str, dict[str, Any]] = {}
    for row in catalog["entries"]:
        code_2d = row["group_2d_id"]
        _, label_2d = split_cno_label(row["group_2d_name"])
        _, label_4d = split_cno_label(row["occupation_4d_name"])
        group = grouped.setdefault(
            code_2d,
            {
                "cno_2d": code_2d,
                "label": label_2d,
                "label_full": normalize_text(row["group_2d_name"]),
                "grand_group_id": row["grand_group_id"],
                "grand_group_name": row["grand_group_name"],
                "children": [],
            },
        )
        group["children"].append(
            {
                "cno_4d": row["occupation_4d_id"],
                "label": label_4d,
                "label_full": normalize_text(row["occupation_4d_name"]),
            }
        )

    groups = []
    for code_2d in sorted(grouped):
        group = grouped[code_2d]
        group["children"] = sorted(group["children"], key=lambda item: item["cno_4d"])
        groups.append(group)

    bridge_payload = {
        "reference_year": SEPE_REFERENCE_YEAR,
        "source_id": "sepe_occupation_pages",
        "groups": groups,
    }
    return {group["cno_2d"]: group for group in groups}, bridge_payload["groups"]


def build_jobs_and_education(rows: list[dict[str, str]]) -> tuple[dict[str, Any], dict[str, Any]]:
    jobs: dict[str, Any] = {}
    education_counts: dict[str, dict[str, int]] = defaultdict(dict)

    for row in rows:
        if int(row["Periodo"]) != EMPLOYMENT_REFERENCE_YEAR:
            continue
        if normalize_text(row["Sexo"]) != "Total":
            continue
        if normalize_text(row["Situación profesional"]) != "Total":
            continue

        code, label = split_cno_label(row["Ocupación"])
        if not code or len(code) != 2:
            continue

        value = parse_spanish_number(row["Total"])["value"]
        if value is None:
            continue

        level = normalize_text(row["Nivel educativo"])
        if level == "Total":
            jobs[code] = {
                "cno_2d": code,
                "label": label,
                "label_full": normalize_text(row["Ocupación"]),
                "jobs_stock": int(value),
                "reference_year": EMPLOYMENT_REFERENCE_YEAR,
                "source_id": "ine_employment_69953",
                "quality": "official",
            }
        else:
            education_counts[code][level] = int(value)

    education: dict[str, Any] = {}
    for code, levels in education_counts.items():
        total = jobs.get(code, {}).get("jobs_stock")
        distribution = []
        for label, value in sorted(levels.items(), key=lambda item: (-item[1], item[0])):
            share = (value / total) if total else None
            distribution.append(
                {
                    "label": label,
                    "value": value,
                    "share": round_or_none(share, 6),
                }
            )
        education[code] = {
            "cno_2d": code,
            "reference_year": EMPLOYMENT_REFERENCE_YEAR,
            "source_id": "ine_employment_69953",
            "quality": "official",
            "dominant_level": distribution[0]["label"] if distribution else None,
            "distribution": distribution,
        }

    return jobs, education


def build_pay_70672(rows: list[dict[str, str]]) -> dict[str, Any]:
    pay: dict[str, Any] = {}

    for row in rows:
        if normalize_text(row["Sexo"]) != "Ambos sexos":
            continue
        if int(row["Periodo"]) != SALARY_REFERENCE_YEAR:
            continue

        code, label = split_cno_label(row["Grupos y subgrupos principales de la CNO-11"])
        if not code or len(code) != 2:
            continue

        parsed = parse_spanish_number(row["Total"], allow_reliability_prefix=True)
        metric = normalize_text(row["Media y percentiles"])
        entry = pay.setdefault(
            code,
            {
                "cno_2d": code,
                "label": label,
                "label_full": normalize_text(row["Grupos y subgrupos principales de la CNO-11"]),
                "reference_year": SALARY_REFERENCE_YEAR,
                "source_id": "ine_salary_70672",
                "quality": "official_but_old",
                "mean_annual_gross": None,
                "mean_low_reliability": False,
                "percentiles_annual_gross": {},
            },
        )

        if metric == "Media":
            entry["mean_annual_gross"] = parsed["value"]
            entry["mean_low_reliability"] = parsed["low_reliability"]
        elif metric.startswith("Percentil "):
            suffix = metric.split(" ", 1)[1]
            entry["percentiles_annual_gross"][f"p{suffix}"] = {
                "value": parsed["value"],
                "low_reliability": parsed["low_reliability"],
            }

    return pay


def build_major_group_pay_66244(rows: list[dict[str, str]]) -> dict[str, Any]:
    pay: dict[str, Any] = {}

    for row in rows:
        if normalize_text(row["Tipo de jornada"]) != "Total":
            continue
        if normalize_text(row["Decil"]) != "Total":
            continue
        if int(row["Periodo"]) != MAJOR_GROUP_PAY_REFERENCE_YEAR:
            continue

        code, label = split_cno_label(row["Ocupación"])
        if not code or len(code) != 1:
            continue

        parsed = parse_spanish_number(row["Total"])
        pay[code] = {
            "major_group_code": code,
            "label": label,
            "label_full": normalize_text(row["Ocupación"]),
            "reference_year": MAJOR_GROUP_PAY_REFERENCE_YEAR,
            "source_id": "ine_salary_66244",
            "quality": "official_proxy",
            "mean_monthly_gross": parsed["value"],
        }

    return pay


def salary_band_order(label: str) -> int:
    order = {
        "Menos de 700 euros": 0,
        "De 700 a 999 euros": 1,
        "De 1.000 a 1.499 euros": 2,
        "De 1.500 a 1.999 euros": 3,
        "De 2.000 a 2.499 euros": 4,
        "De 2.500 a 2.999 euros": 5,
        "De 3.000 euros en adelante": 6,
        "No consta": 99,
    }
    return order.get(label, 999)


def compute_median_band(distribution: list[dict[str, Any]]) -> str | None:
    eligible = [item for item in distribution if item["label"] != "No consta"]
    total = sum(item["value"] for item in eligible)
    if total <= 0:
        return None
    threshold = total / 2
    cumulative = 0
    for item in eligible:
        cumulative += item["value"]
        if cumulative >= threshold:
            return item["label"]
    return eligible[-1]["label"] if eligible else None


def annual_irpf_for_taxable_base(taxable_base: float) -> float:
    if taxable_base <= 0:
        return 0.0

    total = 0.0
    previous_limit = 0.0
    remaining = taxable_base
    for bracket in DERIVED_GROSS_ANNUAL_ASSUMPTIONS["irpf_brackets"]:
        upper = bracket["up_to"]
        rate = bracket["rate"]
        if upper is None:
            span = remaining
        else:
            span = min(remaining, upper - previous_limit)
        if span <= 0:
            if upper is not None:
                previous_limit = upper
            continue
        total += span * rate
        remaining -= span
        if upper is None or remaining <= 0:
            break
        previous_limit = upper
    return total


def net_monthly_from_gross_annual(gross_annual: float) -> float:
    social_security = (
        gross_annual * DERIVED_GROSS_ANNUAL_ASSUMPTIONS["employee_social_security_rate"]
    )
    taxable_base = max(
        0.0,
        gross_annual
        - social_security
        - DERIVED_GROSS_ANNUAL_ASSUMPTIONS["personal_allowance_eur"]
        - DERIVED_GROSS_ANNUAL_ASSUMPTIONS["employment_expense_deduction_eur"],
    )
    irpf = annual_irpf_for_taxable_base(taxable_base)
    net_annual = gross_annual - social_security - irpf
    return net_annual / DERIVED_GROSS_ANNUAL_ASSUMPTIONS["pay_periods_per_year"]


def gross_annual_for_target_net_monthly(target_net_monthly: float) -> float:
    low = 0.0
    high = 250000.0
    for _ in range(64):
        middle = (low + high) / 2
        if net_monthly_from_gross_annual(middle) < target_net_monthly:
            low = middle
        else:
            high = middle
    return high


def parse_eilu_net_band(label: str) -> tuple[float | None, float | None]:
    if label == "Menos de 700 euros":
        return 0.0, 700.0
    if label == "De 700 a 999 euros":
        return 700.0, 1000.0
    if label == "De 1.000 a 1.499 euros":
        return 1000.0, 1500.0
    if label == "De 1.500 a 1.999 euros":
        return 1500.0, 2000.0
    if label == "De 2.000 a 2.499 euros":
        return 2000.0, 2500.0
    if label == "De 2.500 a 2.999 euros":
        return 2500.0, 3000.0
    if label == "De 3.000 euros en adelante":
        return 3000.0, None
    return None, None


def derive_gross_annual_band_from_net_band(label: str) -> dict[str, Any] | None:
    low_monthly, high_monthly = parse_eilu_net_band(label)
    if low_monthly is None:
        return None

    gross_low = gross_annual_for_target_net_monthly(low_monthly)
    gross_high = (
        gross_annual_for_target_net_monthly(high_monthly)
        if high_monthly is not None
        else None
    )
    return {
        "source_net_band": label,
        "gross_annual_low": round_or_none(gross_low, 2),
        "gross_annual_high": round_or_none(gross_high, 2),
    }


def build_specific_salary_signals_from_eilu(rows: list[dict[str, str]]) -> dict[str, Any]:
    grouped: dict[str, dict[str, Any]] = {}
    gross_threshold_for_ge_2000 = gross_annual_for_target_net_monthly(2000.0)

    for row in rows:
        if normalize_text(row["Sexo"]) != "Ambos sexos":
            continue

        study_label = normalize_text(row["Titulación"])
        entry = grouped.setdefault(
            study_label,
            {
                "study_label": study_label,
                "total_working": None,
                "bands": {},
            },
        )

        label = normalize_text(row["Sueldo mensual neto en 2019"])
        value = parse_spanish_number(row["Total"])["value"]
        if value is None:
            continue

        if label == "Total trabajando":
            entry["total_working"] = int(value)
        else:
            entry["bands"][label] = int(value)

    entries: list[dict[str, Any]] = []
    for spec in SPECIFIC_SALARY_SIGNAL_SPECS:
        grouped_entry = grouped.get(spec["study_label"])
        if not grouped_entry or not grouped_entry["total_working"]:
            continue

        distribution = [
            {
                "label": label,
                "value": value,
                "share": round_or_none(value / grouped_entry["total_working"], 6),
            }
            for label, value in sorted(
                grouped_entry["bands"].items(),
                key=lambda item: (salary_band_order(item[0]), item[0]),
            )
        ]

        dominant_band = max(
            (item for item in distribution if item["label"] != "No consta"),
            key=lambda item: item["value"],
            default=None,
        )
        share_ge_2000 = sum(
            item["share"] or 0
            for item in distribution
            if item["label"]
            in {
                "De 2.000 a 2.499 euros",
                "De 2.500 a 2.999 euros",
                "De 3.000 euros en adelante",
            }
        )
        share_missing = next(
            (item["share"] for item in distribution if item["label"] == "No consta"),
            0,
        )
        dominant_gross_band = (
            derive_gross_annual_band_from_net_band(dominant_band["label"])
            if dominant_band
            else None
        )
        median_gross_band = derive_gross_annual_band_from_net_band(
            compute_median_band(distribution) or ""
        )

        entries.append(
            {
                "key": spec["key"],
                "profession_label": spec["profession_label"],
                "study_label": spec["study_label"],
                "aliases": sorted(set(spec["aliases"])),
                "occupation_codes_2d": spec["occupation_codes_2d"],
                "child_codes_4d": spec["child_codes_4d"],
                "metric_label": "Sueldo mensual neto en 2019",
                "reference_year": 2019,
                "cohort_label": "Graduados del curso 2013-2014",
                "total_working": grouped_entry["total_working"],
                "dominant_band": dominant_band["label"] if dominant_band else None,
                "dominant_band_share": (
                    dominant_band["share"] if dominant_band else None
                ),
                "median_band": compute_median_band(distribution),
                "dominant_gross_annual_band": dominant_gross_band,
                "median_gross_annual_band": median_gross_band,
                "share_ge_2000": round_or_none(share_ge_2000, 6),
                "share_ge_2000_gross_annual_threshold": round_or_none(
                    gross_threshold_for_ge_2000, 2
                ),
                "share_missing": round_or_none(share_missing, 6),
                "bands": distribution,
                "source": {
                    "id": "ine_eilu_04049",
                    "name": "INE · Encuesta de inserción laboral de titulados universitarios 2019",
                    "url": EILU_04049_HTML_URL,
                    "table_label": "Graduados universitarios según el sueldo mensual neto en 2019 por sexo y titulación",
                    "note": "Dato oficial por titulación, no salario actual exacto de la ocupación.",
                },
                "derivation": DERIVED_GROSS_ANNUAL_ASSUMPTIONS,
            }
        )

    return {
        "source_id": "ine_eilu_04049",
        "source_name": "INE · Encuesta de inserción laboral de titulados universitarios 2019",
        "source_url": EILU_04049_HTML_URL,
        "entries": sorted(entries, key=lambda item: item["profession_label"]),
    }


def load_ai_scores_4d(path: Path = AI_SCORES_4D_PATH) -> dict[str, dict[str, Any]]:
    if not path.exists():
        return {}
    rows = json.loads(path.read_text(encoding="utf-8"))
    return {row["cno_4d"]: row for row in rows}


def load_or_fetch_sepe_report_index(cno_4d: str, year: int) -> list[dict[str, str]]:
    path = RAW_SEPE_INDEX_DIR / str(year) / f"{cno_4d}.json"
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    rows = fetch_sepe_report_index(cno_4d, year)
    write_json(path, rows)
    return rows


def load_or_fetch_sepe_annual_html(cno_4d: str, year: int) -> tuple[str, str]:
    html_path = RAW_SEPE_REPORT_DIR / str(year) / f"{cno_4d}.html"
    index_rows = load_or_fetch_sepe_report_index(cno_4d, year)
    annual_row = next(
        (
            row
            for row in index_rows
            if normalize_text(row["month"]).lower().startswith("anual")
        ),
        None,
    )
    if annual_row is None:
        raise ValueError(f"No annual SEPE report found for {cno_4d} ({year})")

    if html_path.exists():
        return decode_local_text(html_path), annual_row["url"]

    html = fetch_text(annual_row["url"])
    html_path.parent.mkdir(parents=True, exist_ok=True)
    html_path.write_text(html, encoding="utf-8")
    return html, annual_row["url"]


def extract_list_after_label(block_html: str, label_pattern: str) -> list[str]:
    match = re.search(label_pattern + r".*?<ul>(?P<body>.*?)</ul>", block_html, re.S | re.I)
    if not match:
        return []
    items = re.findall(r"<li>(.*?)</li>", match.group("body"), re.S | re.I)
    return [strip_tags(item) for item in items if strip_tags(item)]


def parse_sepe_databanner(html: str, title: str) -> dict[str, Any]:
    pattern = re.compile(
        rf"<h4 class=\"se-databanner--title\">\s*{re.escape(title)}\s*</h4>\s*"
        r"<div class=\"se-databanner--content\">\s*"
        r"<div class=\"se-databanner--data\">\s*"
        r"<p class=\"se-databanner--figure\">\s*"
        r"<span class=\"se-databanner--digit\">\s*(?P<value_1>[\d.]+)\s*</span>\s*"
        r"<span class=\"se-databanner--txt\">\s*(?P<label_1>.*?)\s*</span>\s*"
        r"</p>\s*"
        r"<p class=\"se-databanner--figure\">\s*"
        r"<span class=\"se-databanner--digit\">\s*(?P<value_2>[\d.]+)\s*</span>\s*"
        r"<span class=\"se-databanner--txt\">\s*(?P<label_2>.*?)\s*</span>\s*"
        r"</p>\s*"
        r"</div>.*?"
        r"<div class=\"se-databanner--variation [^\"]+\">\s*(?P<variation>-?[\d,]+)%",
        re.S | re.I,
    )
    match = pattern.search(html)
    if not match:
        raise ValueError(f"Could not parse SEPE databanner: {title}")

    value_1 = parse_spanish_number(match.group("value_1"))["value"]
    value_2 = parse_spanish_number(match.group("value_2"))["value"]
    variation = parse_spanish_number(match.group("variation"))["value"]

    return {
        "label_1": strip_tags(match.group("label_1")),
        "label_2": strip_tags(match.group("label_2")),
        "value_1": value_1,
        "value_2": value_2,
        "variation_pct": variation,
    }


def parse_sepe_annual_report(
    cno_4d: str,
    fallback_label: str,
    year: int,
    url: str,
    html: str,
) -> dict[str, Any]:
    demand = parse_sepe_databanner(html, "Demandantes de empleo a 31 de diciembre")
    contracts = parse_sepe_databanner(
        html,
        "Contratos registrados a lo largo del año en esta ocupación",
    )

    start = html.find("Principales funciones según la CNO-11 del INE")
    end = html.find("Ocupaciones que comprende", start)
    functions_block = html[start:end] if start != -1 and end != -1 else ""

    summary_match = re.search(
        r"<div class=\"textoEnriquecido\">\s*<p>(?P<summary>.*?)</p>",
        functions_block,
        re.S | re.I,
    )
    summary = strip_tags(summary_match.group("summary")) if summary_match else None

    return {
        "cno_4d": cno_4d,
        "cno_2d": cno_4d[:2],
        "label": fallback_label,
        "reference_year": year,
        "source_id": "sepe_occupation_pages",
        "quality": "official_proxy",
        "url": url,
        "demandants": demand["value_1"],
        "unemployed": demand["value_2"],
        "demandants_yoy_pct": demand["variation_pct"],
        "contracts": contracts["value_1"],
        "contract_persons": contracts["value_2"],
        "contracts_yoy_pct": contracts["variation_pct"],
        "description_summary": summary,
        "tasks": extract_list_after_label(functions_block, r"Entre sus tareas se incluyen:"),
        "included_examples": extract_list_after_label(
            functions_block,
            r"Ejemplos de ocupaciones incluidas en este grupo primario",
        ),
        "excluded_examples": extract_list_after_label(
            functions_block,
            r"Ocupaciones afines no incluidas en este grupo primario",
        ),
    }


def build_sepe_4d_details(catalog_entries: list[dict[str, Any]], year: int) -> tuple[list[dict[str, Any]], list[str]]:
    results: dict[str, dict[str, Any]] = {}
    failures: list[str] = []

    def worker(entry: dict[str, Any]) -> dict[str, Any]:
        code = entry["occupation_4d_id"]
        _, label = split_cno_label(entry["occupation_4d_name"])
        html, url = load_or_fetch_sepe_annual_html(code, year)
        return parse_sepe_annual_report(code, label, year, url, html)

    with ThreadPoolExecutor(max_workers=MAX_SEPE_WORKERS) as executor:
        future_map = {executor.submit(worker, entry): entry["occupation_4d_id"] for entry in catalog_entries}
        completed = 0
        for future in as_completed(future_map):
            code = future_map[future]
            try:
                detail = future.result()
                results[code] = detail
            except Exception as exc:  # pragma: no cover - network/parsing fallback
                failures.append(f"{code}: {exc}")
            completed += 1
            if completed % 50 == 0 or completed == len(future_map):
                step(f"SEPE annual pages processed: {completed}/{len(future_map)}")

    details = [results[code] for code in sorted(results)]
    return details, failures


def aggregate_growth(entries: list[dict[str, Any]], current_key: str, pct_key: str) -> dict[str, Any]:
    current_total = 0.0
    matched_current_total = 0.0
    previous_total = 0.0
    matched_children = 0

    for entry in entries:
        current_value = entry.get(current_key)
        if current_value is not None:
            current_total += float(current_value)

        pct_value = entry.get(pct_key)
        if current_value is None or pct_value is None or pct_value <= -100:
            continue

        matched_current_total += float(current_value)
        previous_total += float(current_value) / (1 + (float(pct_value) / 100.0))
        matched_children += 1

    pct_aggregate = None
    if previous_total > 0:
        pct_aggregate = ((matched_current_total / previous_total) - 1) * 100.0

    if current_total.is_integer():
        current_total = int(current_total)

    return {
        "current_total": current_total,
        "yoy_pct": round_or_none(pct_aggregate, 2),
        "matched_children": matched_children,
        "total_children": len(entries),
    }


def aggregate_sepe_to_2d(details: list[dict[str, Any]]) -> dict[str, Any]:
    buckets: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for detail in details:
        buckets[detail["cno_2d"]].append(detail)

    aggregated: dict[str, Any] = {}
    for code_2d, entries in buckets.items():
        demand_growth = aggregate_growth(entries, "demandants", "demandants_yoy_pct")
        contract_growth = aggregate_growth(entries, "contracts", "contracts_yoy_pct")
        aggregated[code_2d] = {
            "cno_2d": code_2d,
            "reference_year": SEPE_REFERENCE_YEAR,
            "source_id": "sepe_occupation_pages",
            "quality": "official_proxy",
            "children_4d_covered": len(entries),
            "demandants": demand_growth["current_total"],
            "demandants_yoy_pct": demand_growth["yoy_pct"],
            "demandants_yoy_coverage": {
                "matched_children": demand_growth["matched_children"],
                "total_children": demand_growth["total_children"],
            },
            "unemployed": sum(entry["unemployed"] for entry in entries if entry["unemployed"] is not None),
            "contracts": contract_growth["current_total"],
            "contracts_yoy_pct": contract_growth["yoy_pct"],
            "contracts_yoy_coverage": {
                "matched_children": contract_growth["matched_children"],
                "total_children": contract_growth["total_children"],
            },
            "contract_persons": sum(
                entry["contract_persons"]
                for entry in entries
                if entry["contract_persons"] is not None
            ),
        }
    return aggregated


def merge_ai_scores_into_4d_details(
    details: list[dict[str, Any]],
    ai_scores_4d: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    merged: list[dict[str, Any]] = []
    for detail in details:
        ai = ai_scores_4d.get(detail["cno_4d"])
        merged.append(
            {
                **detail,
                "ai_exposure": ai["exposure"] if ai else None,
                "ai_confidence": ai["confidence"] if ai else None,
                "ai_rationale": ai["rationale"] if ai else None,
                "ai_model": ai["model"] if ai else None,
            }
        )
    return merged


def aggregate_ai_scores_to_2d(
    details_4d: list[dict[str, Any]],
    ai_scores_4d: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    buckets: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for detail in details_4d:
        ai = ai_scores_4d.get(detail["cno_4d"])
        if not ai:
            continue
        weight = detail.get("contracts") or detail.get("demandants") or 1
        buckets[detail["cno_2d"]].append(
            {
                "cno_4d": detail["cno_4d"],
                "label": detail["label"],
                "weight": float(weight),
                "exposure": float(ai["exposure"]),
                "confidence": float(ai["confidence"]),
                "model": ai["model"],
            }
        )

    aggregated: dict[str, Any] = {}
    for code_2d, rows in buckets.items():
        total_weight = sum(row["weight"] for row in rows) or float(len(rows))
        exposure = sum(row["exposure"] * row["weight"] for row in rows) / total_weight
        confidence = sum(row["confidence"] * row["weight"] for row in rows) / total_weight
        top_children = sorted(rows, key=lambda row: (-row["weight"], row["cno_4d"]))[:5]
        aggregated[code_2d] = {
            "cno_2d": code_2d,
            "source_id": "openrouter_llm",
            "quality": "llm_derived_from_4d",
            "weight_metric": "contracts_2025_fallback_demandants_2025",
            "children_scored": len(rows),
            "value": round(exposure, 2),
            "confidence": round(confidence, 2),
            "model": top_children[0]["model"] if top_children else None,
            "top_weighted_children": [
                {
                    "cno_4d": row["cno_4d"],
                    "label": row["label"],
                    "weight": int(row["weight"]) if float(row["weight"]).is_integer() else round(row["weight"], 2),
                    "exposure": row["exposure"],
                }
                for row in top_children
            ],
        }
    return aggregated


def describe_trend_proxy(value: float | int | None) -> str | None:
    if value is None:
        return None
    if value <= -5:
        return "Cae con fuerza"
    if value <= -1.5:
        return "Cae"
    if value < 1.5:
        return "Estable"
    if value < 5:
        return "Sube"
    return "Sube con fuerza"


def build_site_payloads(
    bridge_map: dict[str, Any],
    jobs: dict[str, Any],
    education: dict[str, Any],
    pay_2d: dict[str, Any],
    pay_major_group: dict[str, Any],
    trend_2d: dict[str, Any],
    ai_2d: dict[str, Any],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    canonical: list[dict[str, Any]] = []
    compact: list[dict[str, Any]] = []

    all_codes = sorted(bridge_map)
    for code in all_codes:
        group = bridge_map[code]
        jobs_info = jobs.get(code)
        education_info = education.get(code)
        pay_info = pay_2d.get(code)
        major_proxy = pay_major_group.get(group["grand_group_id"])
        trend_info = trend_2d.get(code)
        ai_info = ai_2d.get(code)
        children_4d = [child["cno_4d"] for child in group["children"]]

        label_short = (
            jobs_info["label"]
            if jobs_info
            else pay_info["label"]
            if pay_info
            else group["label"]
        )
        label_full = (
            jobs_info["label_full"]
            if jobs_info
            else pay_info["label_full"]
            if pay_info
            else group["label_full"]
        )
        slug = slugify(f"{code}-{label_short}")

        canonical_entry = {
            "id": code,
            "level": "cno_2d",
            "label": label_full,
            "short_label": label_short,
            "slug": slug,
            "major_group_code": group["grand_group_id"],
            "major_group_label": group["grand_group_name"],
            "jobs_stock": (
                {
                    "value": jobs_info["jobs_stock"],
                    "unit": "persons",
                    "reference_year": jobs_info["reference_year"],
                    "source_id": jobs_info["source_id"],
                    "quality": jobs_info["quality"],
                }
                if jobs_info
                else None
            ),
            "pay": (
                {
                    "mean_annual_gross": pay_info["mean_annual_gross"],
                    "mean_low_reliability": pay_info["mean_low_reliability"],
                    "percentiles_annual_gross": pay_info["percentiles_annual_gross"],
                    "unit": "eur_year_gross",
                    "reference_year": pay_info["reference_year"],
                    "source_id": pay_info["source_id"],
                    "quality": pay_info["quality"],
                }
                if pay_info
                else None
            ),
            "pay_monthly_major_group_proxy": (
                {
                    "value": major_proxy["mean_monthly_gross"],
                    "unit": "eur_month_gross",
                    "reference_year": major_proxy["reference_year"],
                    "source_id": major_proxy["source_id"],
                    "quality": major_proxy["quality"],
                }
                if major_proxy
                else None
            ),
            "education": education_info,
            "trend_proxy": trend_info,
            "ai_exposure": (
                {
                    "value": ai_info["value"],
                    "confidence": ai_info["confidence"],
                    "scale": "0_to_10",
                    "source_id": ai_info["source_id"],
                    "quality": ai_info["quality"],
                    "weight_metric": ai_info["weight_metric"],
                    "children_scored": ai_info["children_scored"],
                    "model": ai_info["model"],
                    "top_weighted_children": ai_info["top_weighted_children"],
                }
                if ai_info
                else None
            ),
            "children_4d": children_4d,
            "source_trace": unique_source_trace(
                [
                    jobs_info["source_id"] if jobs_info else "",
                    pay_info["source_id"] if pay_info else "",
                    major_proxy["source_id"] if major_proxy else "",
                    trend_info["source_id"] if trend_info else "",
                    ai_info["source_id"] if ai_info else "",
                    "sepe_occupation_pages",
                ]
            ),
        }
        canonical.append(canonical_entry)

        compact.append(
            {
                "title": label_short,
                "code": code,
                "slug": slug,
                "category": f"{group['grand_group_id']}-{slugify(group['grand_group_name'])}",
                "pay": pay_info["mean_annual_gross"] if pay_info else None,
                "pay_year": pay_info["reference_year"] if pay_info else None,
                "pay_quality": (
                    "official_low_sample"
                    if pay_info and pay_info["mean_low_reliability"]
                    else pay_info["quality"]
                    if pay_info
                    else None
                ),
                "jobs": jobs_info["jobs_stock"] if jobs_info else None,
                "jobs_year": jobs_info["reference_year"] if jobs_info else None,
                "outlook": trend_info["contracts_yoy_pct"] if trend_info else None,
                "outlook_desc": (
                    describe_trend_proxy(trend_info["contracts_yoy_pct"])
                    if trend_info
                    else None
                ),
                "outlook_quality": trend_info["quality"] if trend_info else None,
                "education": education_info["dominant_level"] if education_info else None,
                "education_year": education_info["reference_year"] if education_info else None,
                "exposure": ai_info["value"] if ai_info else None,
                "exposure_confidence": ai_info["confidence"] if ai_info else None,
                "exposure_quality": ai_info["quality"] if ai_info else None,
                "exposure_model": ai_info["model"] if ai_info else None,
                "children_4d_count": len(children_4d),
                "children_4d": children_4d,
                "url": "",
            }
        )

    return canonical, compact


def main() -> None:
    step("Downloading official INE exports...")
    ine_paths = ensure_ine_exports()
    specific_salary_paths = ensure_specific_salary_exports()

    step("Loading SEPE catalog...")
    sepe_catalog = load_or_create_sepe_catalog()
    bridge_map, bridge_groups = build_bridge(sepe_catalog)

    step("Parsing INE employment and education table 69953...")
    jobs_2d, education_2d = build_jobs_and_education(read_tsv_rows(ine_paths["69953_csv"]))

    step("Parsing INE salary table 70672...")
    pay_2d = build_pay_70672(read_tsv_rows(ine_paths["70672_csv"]))

    step("Parsing INE major-group salary table 66244...")
    pay_major_group = build_major_group_pay_66244(read_tsv_rows(ine_paths["66244_csv"]))

    step("Parsing INE EILU salary-by-degree table 04049...")
    specific_salary_signals = build_specific_salary_signals_from_eilu(
        read_eilu_rows(specific_salary_paths["eilu_04049_csv"])
    )

    step("Fetching and parsing annual SEPE occupation pages...")
    sepe_4d_details, sepe_failures = build_sepe_4d_details(
        sepe_catalog["entries"],
        SEPE_REFERENCE_YEAR,
    )

    step("Aggregating SEPE signals from 4d to 2d...")
    trend_2d = aggregate_sepe_to_2d(sepe_4d_details)

    step("Loading optional AI exposure scores...")
    ai_scores_4d = load_ai_scores_4d()
    ai_2d = aggregate_ai_scores_to_2d(sepe_4d_details, ai_scores_4d)
    sepe_4d_details_enriched = merge_ai_scores_into_4d_details(sepe_4d_details, ai_scores_4d)

    step("Building final datasets...")
    canonical_site_data, compact_site_data = build_site_payloads(
        bridge_map,
        jobs_2d,
        education_2d,
        pay_2d,
        pay_major_group,
        trend_2d,
        ai_2d,
    )

    write_json(
        DATA_DIR / "cno_bridge_2d_4d.json",
        {
            "source_id": "sepe_occupation_pages",
            "reference_year": SEPE_REFERENCE_YEAR,
            "groups": bridge_groups,
        },
    )
    write_json(DATA_DIR / "occupation_2d_jobs.json", {"occupations": list(jobs_2d.values())})
    write_json(
        DATA_DIR / "occupation_2d_education.json",
        {"occupations": [education_2d[code] for code in sorted(education_2d)]},
    )
    write_json(
        DATA_DIR / "occupation_2d_pay.json",
        {
            "source_primary": "ine_salary_70672",
            "source_proxy": "ine_salary_66244",
            "occupations": [pay_2d[code] for code in sorted(pay_2d)],
            "major_group_proxy": [pay_major_group[code] for code in sorted(pay_major_group)],
        },
    )
    write_json(
        DATA_DIR / f"occupation_4d_details_{SEPE_REFERENCE_YEAR}.json",
        {"occupations": sepe_4d_details_enriched, "failures": sepe_failures},
    )
    write_json(
        DATA_DIR / f"occupation_2d_trend_proxy_{SEPE_REFERENCE_YEAR}.json",
        {"occupations": [trend_2d[code] for code in sorted(trend_2d)]},
    )
    write_json(DATA_DIR / "specific_salary_signals.json", specific_salary_signals)
    if ai_scores_4d:
        write_json(
            DATA_DIR / "ai_scores_2d.json",
            {"occupations": [ai_2d[code] for code in sorted(ai_2d)]},
        )
    write_json(DATA_DIR / "site_data_2d.json", canonical_site_data)

    SITE_DIR.mkdir(parents=True, exist_ok=True)
    (SITE_DIR / "data.json").write_text(
        json.dumps(compact_site_data, ensure_ascii=True, indent=2) + "\n",
        encoding="utf-8",
    )
    (SITE_DIR / "data-2d.json").write_text(
        json.dumps(canonical_site_data, ensure_ascii=True, indent=2) + "\n",
        encoding="utf-8",
    )
    (SITE_DIR / "details-4d.json").write_text(
        json.dumps(
            {"occupations": sepe_4d_details_enriched, "failures": sepe_failures},
            ensure_ascii=True,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    (SITE_DIR / "specific-salary-signals.json").write_text(
        json.dumps(specific_salary_signals, ensure_ascii=True, indent=2) + "\n",
        encoding="utf-8",
    )

    build_summary = {
        "employment_reference_year": EMPLOYMENT_REFERENCE_YEAR,
        "salary_reference_year": SALARY_REFERENCE_YEAR,
        "major_group_salary_reference_year": MAJOR_GROUP_PAY_REFERENCE_YEAR,
        "sepe_reference_year": SEPE_REFERENCE_YEAR,
        "occupation_2d_count": len(canonical_site_data),
        "occupation_4d_count": len(sepe_4d_details_enriched),
        "sepe_failure_count": len(sepe_failures),
        "ai_scores_4d_count": len(ai_scores_4d),
        "ai_scores_2d_count": len(ai_2d),
        "specific_salary_signal_count": len(specific_salary_signals["entries"]),
    }
    write_json(DATA_DIR / "build_summary_v1.json", build_summary)
    (SITE_DIR / "meta.json").write_text(
        json.dumps(build_summary, ensure_ascii=True, indent=2) + "\n",
        encoding="utf-8",
    )

    step("Done.")
    print(json.dumps(build_summary, indent=2, ensure_ascii=True))


if __name__ == "__main__":
    main()
