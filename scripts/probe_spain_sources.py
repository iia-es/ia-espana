from __future__ import annotations

import json

from spain_sources import (
    DATA_DIR,
    INE_TABLE_66244_HTML,
    INE_TABLE_69953_HTML,
    INE_TABLE_70672_HTML,
    extract_period_years,
    extract_select_options_by_label,
    extract_sepe_catalog,
    fetch_sepe_report_index,
    fetch_text,
    write_json,
)


def step(message: str) -> None:
    print(message, flush=True)


def main() -> None:
    sepe_catalog_path = DATA_DIR / "sepe_catalog_4d.json"
    if sepe_catalog_path.exists():
        step("Loading cached SEPE catalog...")
        sepe_catalog = json.loads(sepe_catalog_path.read_text(encoding="utf-8"))
    else:
        step("Fetching SEPE catalog...")
        sepe_catalog = extract_sepe_catalog()
    step("Fetching SEPE report index example...")
    sepe_4412_2025 = fetch_sepe_report_index("4412", 2025)

    step("Fetching INE 69953 HTML...")
    ine_69953_html = fetch_text(INE_TABLE_69953_HTML)
    step("Fetching INE 66244 HTML...")
    ine_66244_html = fetch_text(INE_TABLE_66244_HTML)
    step("Fetching INE 70672 HTML...")
    ine_70672_html = fetch_text(INE_TABLE_70672_HTML)

    step("Parsing option lists...")
    ine_69953_options = extract_select_options_by_label(
        ine_69953_html, r"[^<]*Ocupaci[^<]*"
    )
    ine_66244_options = extract_select_options_by_label(
        ine_66244_html, r"[^<]*Ocupaci[^<]*"
    )
    ine_70672_options = extract_select_options_by_label(
        ine_70672_html, r"Grupos y subgrupos principales de la CNO-11"
    )

    summary = {
        "sepe": {
            "catalog_4d_count": sepe_catalog["occupation_4d_count"],
            "catalog_2d_count": sepe_catalog["group_2d_count"],
            "report_index_example": {
                "cno_4d": "4412",
                "year": 2025,
                "report_count": len(sepe_4412_2025),
                "reports": sepe_4412_2025[:6],
            },
        },
        "ine_employment_69953": {
            "available_years_in_html": extract_period_years(ine_69953_html),
            "occupation_option_count": len(ine_69953_options),
            "occupation_option_sample": ine_69953_options[:10],
        },
        "ine_salary_66244": {
            "available_years_in_html": extract_period_years(ine_66244_html),
            "occupation_option_count": len(ine_66244_options),
            "occupation_option_sample": ine_66244_options[:12],
        },
        "ine_salary_70672": {
            "available_years_in_html": [2018],
            "occupation_option_count": len(ine_70672_options),
            "occupation_option_sample": ine_70672_options[:20],
        },
    }

    step("Writing JSON outputs...")
    write_json(DATA_DIR / "source_probe_summary.json", summary)
    write_json(DATA_DIR / "sample_sepe_4412_reports_2025.json", sepe_4412_2025)

    print("Wrote data/source_probe_summary.json")
    print("Wrote data/sample_sepe_4412_reports_2025.json")
    print(f"SEPE 4d occupations: {sepe_catalog['occupation_4d_count']}")
    print(f"INE 69953 years: {summary['ine_employment_69953']['available_years_in_html']}")
    print(f"INE 66244 years: {summary['ine_salary_66244']['available_years_in_html']}")
    print(f"INE 70672 years: {summary['ine_salary_70672']['available_years_in_html']}")


if __name__ == "__main__":
    main()
