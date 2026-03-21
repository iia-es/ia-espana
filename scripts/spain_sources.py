from __future__ import annotations

import json
import re
import unicodedata
from html import unescape
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
RAW_DIR = ROOT / "raw"

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36"
)

SEPE_MAIN_URL = (
    "https://www.sepe.es/HomeSepe/que-es-observatorio/"
    "informacion-mt-por-ocupacion.html"
)
SEPE_RESULTS_URL = (
    "https://www.sepe.es/HomeSepe/que-es-observatorio/"
    "informacion-mt-por-ocupacion/main/04/content/resultados"
)

INE_TABLE_69953_HTML = "https://www.ine.es/jaxiT3/Tabla.htm?t=69953"
INE_TABLE_69953_API = "https://servicios.ine.es/wstempus/js/es/DATOS_TABLA/69953?tip=AM"
INE_TABLE_66244_HTML = "https://www.ine.es/jaxiT3/Tabla.htm?t=66244"
INE_TABLE_66244_API = "https://servicios.ine.es/wstempus/js/es/DATOS_TABLA/66244?tip=AM"
INE_TABLE_70672_HTML = "https://www.ine.es/jaxiT3/Tabla.htm?t=70672"
INE_TABLE_70672_API = "https://servicios.ine.es/wstempus/js/es/DATOS_TABLA/70672?tip=AM"
INE_TABLE_8757_HTML = "https://www.ine.es/jaxi/Tabla.htm?tpx=8757"


def build_request(url: str, data: bytes | None = None) -> Request:
    request = Request(url, data=data)
    request.add_header("User-Agent", USER_AGENT)
    request.add_header("Accept-Language", "es-ES,es;q=0.9,en;q=0.8")
    return request


def fetch_response(url: str, data: bytes | None = None) -> tuple[bytes, dict[str, str]]:
    with urlopen(build_request(url, data=data), timeout=60) as response:
        raw = response.read()
        headers = {key: value for key, value in response.headers.items()}
    return raw, headers


def response_charset(headers: dict[str, str]) -> str | None:
    content_type = headers.get("Content-Type", "")
    match = re.search(r"charset=([A-Za-z0-9._-]+)", content_type, re.I)
    if match:
        return match.group(1)
    return None


def decode_bytes(raw: bytes, charset: str | None = None) -> str:
    if raw.startswith(b"\xef\xbb\xbf"):
        return raw.decode("utf-8-sig")

    candidates: list[str] = []
    if charset:
        candidates.append(charset)
    candidates.extend(["utf-8", "iso-8859-15", "cp1252"])

    seen: set[str] = set()
    for encoding in candidates:
        normalized = encoding.lower()
        if normalized in seen:
            continue
        seen.add(normalized)
        try:
            return raw.decode(encoding)
        except UnicodeDecodeError:
            continue

    return raw.decode("utf-8", errors="replace")


def fetch_bytes(url: str, data: bytes | None = None) -> bytes:
    raw, _headers = fetch_response(url, data=data)
    return raw


def fetch_text(url: str, data: bytes | None = None) -> str:
    raw, headers = fetch_response(url, data=data)
    return decode_bytes(raw, response_charset(headers))


def fetch_json(url: str, data: bytes | None = None) -> Any:
    return json.loads(fetch_text(url, data=data))


def write_bytes(path: Path, raw: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(raw)


def download_to_path(url: str, path: Path, force: bool = False) -> Path:
    if path.exists() and not force:
        return path
    raw = fetch_bytes(url)
    write_bytes(path, raw)
    return path


def strip_tags(text: str) -> str:
    no_tags = re.sub(r"<[^>]+>", " ", text)
    return " ".join(unescape(no_tags).split())


def normalize_text(text: str) -> str:
    return " ".join(unescape(text).split())


def extract_select_options_by_label(html: str, label_pattern: str) -> list[str]:
    pattern = (
        r"<legend><label for=\"(?P<select_id>[^\"]+)\">"
        + label_pattern
        + r"</label></legend>.*?"
        r"<select[^>]*id=\"(?P=select_id)\"[^>]*>(?P<body>.*?)</select>"
    )
    match = re.search(pattern, html, re.S | re.I)
    if not match:
        raise ValueError(f"Could not find select for label pattern: {label_pattern}")

    body = match.group("body")
    options = re.findall(r"<option[^>]*>(.*?)</option>", body, re.S | re.I)
    return [strip_tags(option) for option in options]


def extract_period_years(html: str) -> list[int]:
    match = re.search(
        r"<select[^>]*id=\"periodo\"[^>]*>(?P<body>.*?)</select>", html, re.S | re.I
    )
    if not match:
        raise ValueError("Could not find period selector in INE HTML.")

    body = match.group("body")
    options = re.findall(r"<option[^>]*>(.*?)</option>", body, re.S | re.I)
    years: list[int] = []
    for option in options:
        text = strip_tags(option)
        if text.isdigit():
            years.append(int(text))
    return sorted(years)


def fetch_ine_table_json(table_id: int) -> Any:
    url = f"https://servicios.ine.es/wstempus/js/es/DATOS_TABLA/{table_id}?tip=AM"
    return fetch_json(url)


def ine_export_url(
    table_id: int,
    export_key: str,
    extension: str,
    *,
    is_px: bool = False,
) -> str:
    base = "https://www.ine.es/jaxi/files" if is_px else "https://www.ine.es/jaxiT3/files"
    table_segment = "tpx" if is_px else "t"
    return f"{base}/{table_segment}/es/{export_key}/{table_id}.{extension}"


def extract_sepe_catalog() -> dict[str, Any]:
    html = fetch_text(SEPE_MAIN_URL)
    match = re.search(r"var grangrupoList = (\{.*?\});", html, re.S)
    if not match:
        raise ValueError("Could not locate embedded SEPE catalog payload.")

    payload = json.loads(match.group(1))
    entries: list[dict[str, str]] = []
    groups_2d: dict[str, str] = {}

    for grand_group in payload["grupos"]:
        grand_id = str(grand_group["id"])
        grand_name = grand_group["displayName"]
        for subgroup in grand_group["grupoPrimario"]:
            subgroup_id = str(subgroup["id"])
            groups_2d[subgroup_id] = subgroup["displayName"]
            for occupation in subgroup["ocupaciones"]:
                entries.append(
                    {
                        "grand_group_id": grand_id,
                        "grand_group_name": grand_name,
                        "group_2d_id": subgroup_id,
                        "group_2d_name": subgroup["displayName"],
                        "occupation_4d_id": str(occupation["id"]),
                        "occupation_4d_name": occupation["displayName"],
                    }
                )

    return {
        "source_url": SEPE_MAIN_URL,
        "grand_group_count": len(payload["grupos"]),
        "group_2d_count": len(groups_2d),
        "occupation_4d_count": len(entries),
        "entries": entries,
    }


def fetch_sepe_report_index(cno_code: str, year: int, month: str = "") -> list[dict[str, str]]:
    def parse_rows(html: str) -> list[dict[str, str]]:
        row_pattern = re.compile(
            r"<tr>\s*<td>(?P<month>.*?)</td>\s*<td>(?P<year>.*?)</td>\s*"
            r"<td><a href=\"(?P<href>[^\"]+)\"",
            re.S | re.I,
        )

        parsed: list[dict[str, str]] = []
        for match in row_pattern.finditer(html):
            href = unescape(match.group("href"))
            if href.startswith("/"):
                href = "https://www.sepe.es" + href
            parsed.append(
                {
                    "month": strip_tags(match.group("month")),
                    "year": strip_tags(match.group("year")),
                    "url": href,
                }
            )
        return parsed

    def max_page(html: str) -> int:
        pages = [1]
        pages.extend(int(value) for value in re.findall(r"changePage\((\d+),", html))
        return max(pages)

    payload = urlencode(
        {
            "list-mode": "detail",
            "ocupacion-id": cno_code,
            "year-busc": str(year),
            "month-busc": month,
        }
    ).encode()
    first_html = fetch_text(SEPE_RESULTS_URL, data=payload)
    rows = parse_rows(first_html)

    for page in range(2, max_page(first_html) + 1):
        page_query = urlencode(
            {
                "list-mode": "detail",
                "ocupacion-id": cno_code,
                "year-busc": str(year),
                "page-pr": str(page),
            }
        )
        page_html = fetch_text(f"{SEPE_RESULTS_URL}?{page_query}")
        rows.extend(parse_rows(page_html))

    deduped: list[dict[str, str]] = []
    seen_urls: set[str] = set()
    for row in rows:
        url = row["url"]
        if url in seen_urls:
            continue
        seen_urls.add(url)
        deduped.append(row)
    return deduped


def latest_years_from_ine_payload(records: list[dict[str, Any]]) -> list[int]:
    years = set()
    for record in records:
        for item in record.get("Data", []):
            year = item.get("Anyo")
            if isinstance(year, int):
                years.add(year)
    return sorted(years)


def slugify(value: str) -> str:
    ascii_text = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    ascii_text = ascii_text.lower()
    ascii_text = re.sub(r"[^a-z0-9]+", "-", ascii_text)
    return ascii_text.strip("-")


def split_cno_label(label: str) -> tuple[str | None, str]:
    text = normalize_text(label)
    match = re.match(r"^(?P<code>\d{1,4})[.\s]+(?P<label>.+)$", text)
    if not match:
        return None, text
    return match.group("code"), match.group("label").strip()


def parse_spanish_number(
    text: str,
    *,
    allow_reliability_prefix: bool = False,
) -> dict[str, Any]:
    raw = normalize_text(text)
    if raw in {"", ".."}:
        return {"value": None, "low_reliability": False, "raw": raw}

    low_reliability = False
    sign = 1

    if allow_reliability_prefix and raw.startswith("-") and re.search(r"\d", raw[1:]):
        low_reliability = True
        raw = raw[1:].strip()
    elif raw.startswith("-"):
        sign = -1
        raw = raw[1:].strip()

    normalized = raw.replace(".", "").replace(",", ".").replace("%", "")
    value = float(normalized) * sign
    if value.is_integer():
        value = int(value)

    return {
        "value": value,
        "low_reliability": low_reliability,
        "raw": normalize_text(text),
    }


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")
