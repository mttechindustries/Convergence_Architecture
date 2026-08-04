#!/usr/bin/env python3
"""Validate the public Convergence Architecture data registry.

Uses only the Python standard library so it can run locally and in GitHub Actions.
"""

from __future__ import annotations

import csv
import json
import re
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def read_csv(name: str) -> list[dict[str, str]]:
    path = DATA / name
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def split_list(value: str) -> list[str]:
    return [item.strip() for item in (value or "").split(",") if item.strip()]


def fail(message: str, errors: list[str]) -> None:
    errors.append(message)


def check_unique(records: list[dict[str, str]], field: str, errors: list[str]) -> None:
    values = [record[field] for record in records]
    duplicates = [value for value, count in Counter(values).items() if count > 1]
    for value in duplicates:
        fail(f"duplicate {field}: {value}", errors)


def evidence_values(value: str) -> list[str]:
    return re.findall(r"E[0-7]", value or "")


def main() -> int:
    metadata = json.loads((DATA / "metadata.json").read_text(encoding="utf-8"))
    levels = json.loads((DATA / "evidence-levels.json").read_text(encoding="utf-8"))
    sources = read_csv("sources.csv")
    claims = read_csv("claims.csv")
    pathways = read_csv("pathways.csv")
    trunks = read_csv("trunks.csv")
    corrections = read_csv("corrections.csv")

    errors: list[str] = []
    warnings: list[str] = []

    check_unique(sources, "source_id", errors)
    check_unique(claims, "claim_id", errors)
    check_unique(pathways, "path_id", errors)
    check_unique(trunks, "trunk_id", errors)
    check_unique(corrections, "correction_id", errors)

    source_ids = {row["source_id"] for row in sources}
    claim_ids = {row["claim_id"] for row in claims}
    pathway_ids = {row["path_id"] for row in pathways}
    trunk_ids = {row["trunk_id"] for row in trunks}
    record_ids = source_ids | claim_ids | pathway_ids | trunk_ids
    level_ids = {item["id"] for item in levels}

    for source in sources:
        if source["access_status"] not in {"PUBLIC", "RESTRICTED"}:
            fail(f"{source['source_id']}: invalid access_status {source['access_status']}", errors)
        if not evidence_values(source["evidence_supported"]):
            fail(f"{source['source_id']}: missing evidence level", errors)
        for level in evidence_values(source["evidence_supported"]):
            if level not in level_ids:
                fail(f"{source['source_id']}: unknown evidence level {level}", errors)
        for trunk in split_list(source["trunk_ids"]):
            if trunk not in trunk_ids:
                fail(f"{source['source_id']}: missing trunk {trunk}", errors)
        if source["access_status"] == "PUBLIC" and not source["url"]:
            warnings.append(f"{source['source_id']}: public source has no URL")
        if source["url"].startswith("http"):
            parsed = urlparse(source["url"])
            if not parsed.netloc:
                fail(f"{source['source_id']}: malformed URL", errors)

    for claim in claims:
        if claim["visibility"] not in {"PUBLIC", "RESTRICTED"}:
            fail(f"{claim['claim_id']}: invalid visibility {claim['visibility']}", errors)
        for source_id in split_list(claim["supporting_sources"]):
            if source_id not in source_ids:
                fail(f"{claim['claim_id']}: missing source {source_id}", errors)
        for trunk in split_list(claim["trunk_ids"]):
            if trunk not in trunk_ids:
                fail(f"{claim['claim_id']}: missing trunk {trunk}", errors)
        for level in evidence_values(claim["evidence_state"]):
            if level not in level_ids:
                fail(f"{claim['claim_id']}: unknown evidence level {level}", errors)

    for pathway in pathways:
        if pathway["visibility"] not in {"PUBLIC", "RESTRICTED"}:
            fail(f"{pathway['path_id']}: invalid visibility {pathway['visibility']}", errors)
        for source_id in split_list(pathway["source_ids"]):
            if source_id not in source_ids:
                fail(f"{pathway['path_id']}: missing source {source_id}", errors)
        for field in ("source_trunk", "target_trunk"):
            for trunk in split_list(pathway[field]):
                if trunk not in trunk_ids:
                    fail(f"{pathway['path_id']}: missing trunk {trunk}", errors)
        if not re.fullmatch(r"R[0-7]", pathway["reachability"]):
            fail(f"{pathway['path_id']}: invalid reachability {pathway['reachability']}", errors)

    for correction in corrections:
        if correction["record_id"] not in record_ids:
            fail(f"{correction['correction_id']}: missing record {correction['record_id']}", errors)
        for source_id in split_list(correction["evidence_sources"]):
            if source_id not in source_ids:
                fail(f"{correction['correction_id']}: missing evidence source {source_id}", errors)

    expected = metadata["counts"]
    actual = {
        "sources_registered": len(sources),
        "sources_public": sum(row["access_status"] == "PUBLIC" for row in sources),
        "sources_restricted": sum(row["access_status"] == "RESTRICTED" for row in sources),
        "claims_registered": len(claims),
        "claims_public": sum(row["visibility"] == "PUBLIC" for row in claims),
        "claims_restricted": sum(row["visibility"] == "RESTRICTED" for row in claims),
        "pathways_registered": len(pathways),
        "pathways_public": sum(row["visibility"] == "PUBLIC" for row in pathways),
        "pathways_restricted": sum(row["visibility"] == "RESTRICTED" for row in pathways),
        "trunks": len(trunks),
    }
    for key, value in actual.items():
        if expected.get(key) != value:
            fail(f"metadata count mismatch for {key}: expected {expected.get(key)}, actual {value}", errors)

    if errors:
        print(f"FAIL: {len(errors)} validation error(s)")
        for error in errors:
            print(f"  - {error}")
        if warnings:
            print(f"WARN: {len(warnings)} warning(s)")
            for warning in warnings:
                print(f"  - {warning}")
        return 1

    print("PASS: public evidence registry is internally consistent")
    print(
        f"  sources={len(sources)} claims={len(claims)} "
        f"pathways={len(pathways)} trunks={len(trunks)} corrections={len(corrections)}"
    )
    if warnings:
        print(f"WARN: {len(warnings)} warning(s)")
        for warning in warnings:
            print(f"  - {warning}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
