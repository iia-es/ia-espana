from __future__ import annotations

from pathlib import Path

from spain_sources import DATA_DIR, extract_sepe_catalog, write_json


def main() -> None:
    payload = extract_sepe_catalog()
    output_path = DATA_DIR / "sepe_catalog_4d.json"
    write_json(output_path, payload)

    print(f"Wrote {output_path}")
    print(f"Grand groups: {payload['grand_group_count']}")
    print(f"2d groups: {payload['group_2d_count']}")
    print(f"4d occupations: {payload['occupation_4d_count']}")
    sample = payload["entries"][:5]
    for item in sample:
        print(
            f"  {item['occupation_4d_id']} "
            f"{item['occupation_4d_name']} "
            f"(2d {item['group_2d_id']})"
        )


if __name__ == "__main__":
    main()
