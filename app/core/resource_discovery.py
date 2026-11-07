import asyncio
import re
from typing import Any

import httpx


TIMEOUT = httpx.Timeout(12.0, connect=5.0)


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        return ", ".join(
            clean_text(item.get("display_name", item) if isinstance(item, dict) else item)
            for item in value[:8]
        )
    return str(value).strip()


def quality_assessment(item: dict) -> dict:
    """Transparent metadata-based score, not an official quality rating."""
    checks = []
    points = 0

    rules = [
        ("Has a usable source URL", bool(item.get("url")), 15),
        ("Has a description or abstract", bool(item.get("description")) and not item.get("description", "").lower().startswith(("abstract indexed by openalex", "no description provided.")), 20),
        ("Has a provider identifier", bool(item.get("identifier")), 15),
        ("Has a clearly stated license", bool(item.get("license")) and item.get("license", "").lower() not in {"not verified", "unknown", "none"}, 15),
        ("Has creator or author information", bool(item.get("authors")), 10),
        ("Has documentation or a repository README", bool(item.get("documentation")), 15),
        ("Has a usage or citation metric", item.get("usage_count") is not None, 10),
    ]

    for label, passed, weight in rules:
        checks.append({"criterion": label, "passed": bool(passed), "weight": weight})
        if passed:
            points += weight

    return {
        "score": points,
        "maximum": 100,
        "label": (
            "Strong metadata coverage" if points >= 75
            else "Moderate metadata coverage" if points >= 45
            else "Limited metadata coverage"
        ),
        "checks": checks,
        "limitation": (
            "This score measures metadata completeness, not scientific correctness, "
            "peer-review quality, reproducibility, or trustworthiness."
        ),
    }


def normalize(
    *,
    title: str,
    resource_type: str,
    provider: str,
    url: str = "",
    description: str = "",
    identifier: str = "",
    authors: Any = None,
    license_name: str = "",
    documentation: str = "",
    access_status: str = "Unknown",
    usage_count: int | None = None,
    published_date: str = "",
) -> dict:
    item = {
        "title": clean_text(title) or "Untitled resource",
        "type": resource_type,
        "provider": provider,
        "url": clean_text(url),
        "description": clean_text(description)[:1800],
        "identifier": clean_text(identifier),
        "authors": clean_text(authors),
        "license": clean_text(license_name) or "Not verified",
        "documentation": clean_text(documentation),
        "access_status": access_status,
        "usage_count": usage_count,
        "published_date": clean_text(published_date),
    }
    item["quality"] = quality_assessment(item)
    return item


async def fetch_json(
    client: httpx.AsyncClient,
    provider: str,
    url: str,
    params: dict | None = None,
    headers: dict | None = None,
) -> tuple[str, Any]:
    try:
        response = await client.get(
            url,
            params=params,
            headers=headers,
            timeout=TIMEOUT,
        )
        response.raise_for_status()
        return provider, response.json()
    except Exception as exc:
        return provider, {"_error": str(exc)[:300]}


def access_from_license(license_value: Any) -> str:
    value = clean_text(license_value).lower()
    if value and value not in {"unknown", "not verified", "none"}:
        return "License stated; verify terms"
    return "Unknown"


async def search_resources(query: str, limit: int = 8) -> dict:
    query = query.strip()
    if not query:
        return {
            "query": query,
            "results": [],
            "providers": [],
            "message": "Enter a research topic to search.",
        }

    limit = max(1, min(limit, 100))
    headers = {
        "User-Agent": "ResearchResourceIntelligence/1.0 (academic project)"
    }

    async with httpx.AsyncClient(
        headers=headers,
        follow_redirects=True,
    ) as client:
        requests = [
            fetch_json(
                client, "OpenAlex",
                "https://api.openalex.org/works",
                {"search": query, "per-page": limit},
            ),
            fetch_json(
                client, "Crossref",
                "https://api.crossref.org/works",
                {"query": query, "rows": limit},
            ),
            fetch_json(
                client, "GitHub",
                "https://api.github.com/search/repositories",
                {"q": query, "sort": "stars", "order": "desc", "per_page": limit},
                {"Accept": "application/vnd.github+json"},
            ),
            fetch_json(
                client, "Zenodo",
                "https://zenodo.org/api/records",
                {"q": query, "size": min(limit, 25)},
            ),
            fetch_json(
                client, "Hugging Face",
                "https://huggingface.co/api/datasets",
                {"search": query, "limit": limit},
            ),
        ]

        responses = await asyncio.gather(*requests)

    results = []
    provider_status = []

    for provider, data in responses:
        failed = isinstance(data, dict) and "_error" in data
        provider_status.append({
            "provider": provider,
            "status": "unavailable" if failed else "responded",
            **({"detail": data["_error"]} if failed else {}),
        })
        if failed:
            continue

        # OpenAlex research papers
        if provider == "OpenAlex":
            for record in data.get("results", []):
                authors = [
                    authorship.get("author", {}).get("display_name", "")
                    for authorship in record.get("authorships", [])[:8]
                ]
                doi = record.get("doi") or ""
                location = record.get("primary_location") or {}
                landing = location.get("landing_page_url") or ""
                oa = record.get("open_access") or {}
                results.append(normalize(
                    title=record.get("title"),
                    resource_type="paper",
                    provider=provider,
                    url=landing or doi or record.get("id", ""),
                    description=record.get("abstract_inverted_index") and
                        "Abstract indexed by OpenAlex; open the source for the full abstract."
                        or "",
                    identifier=doi or record.get("id", ""),
                    authors=authors,
                    license_name="Open access reported" if oa.get("is_oa") else "",
                    access_status="Open access reported" if oa.get("is_oa") else "Access not confirmed",
                    usage_count=record.get("cited_by_count"),
                    published_date=str(record.get("publication_date") or ""),
                ))

        # Crossref research papers
        elif provider == "Crossref":
            for record in data.get("message", {}).get("items", []):
                title = (record.get("title") or [""])[0]
                doi = record.get("DOI", "")
                authors = [
                    " ".join(filter(None, [a.get("given"), a.get("family")]))
                    for a in record.get("author", [])[:8]
                ]
                date_parts = (
                    record.get("published", {}).get("date-parts")
                    or record.get("created", {}).get("date-parts")
                    or [[]]
                )
                date = "-".join(map(str, date_parts[0])) if date_parts and date_parts[0] else ""
                results.append(normalize(
                    title=title,
                    resource_type="paper",
                    provider=provider,
                    url=f"https://doi.org/{doi}" if doi else record.get("URL", ""),
                    description=(record.get("abstract") or "")[:1800],
                    identifier=doi,
                    authors=authors,
                    access_status="Access not confirmed",
                    usage_count=record.get("is-referenced-by-count"),
                    published_date=date,
                ))

        # GitHub repositories
        elif provider == "GitHub":
            for record in data.get("items", []):
                license_info = record.get("license") or {}
                results.append(normalize(
                    title=record.get("full_name"),
                    resource_type="code",
                    provider=provider,
                    url=record.get("html_url", ""),
                    description=record.get("description", ""),
                    identifier=record.get("html_url", ""),
                    authors=record.get("owner", {}).get("login", ""),
                    license_name=license_info.get("spdx_id") or "",
                    documentation="README available" if record.get("has_readme") else "",
                    access_status="Public repository; check license before reuse",
                    usage_count=record.get("stargazers_count"),
                    published_date=record.get("pushed_at", ""),
                ))

        # Zenodo records and research datasets
        elif provider == "Zenodo":
            hits = data.get("hits", {}).get("hits", [])
            for record in hits:
                metadata = record.get("metadata") or {}
                creators = [
                    creator.get("name", "")
                    for creator in metadata.get("creators", [])[:8]
                ]
                files = record.get("files") or []
                license_info = metadata.get("license") or {}
                license_name = (
                    license_info.get("id", "")
                    if isinstance(license_info, dict)
                    else license_info
                )
                resource_type = (
                    "dataset"
                    if "dataset" in clean_text(metadata.get("resource_type", {})).lower()
                    else "research resource"
                )
                results.append(normalize(
                    title=metadata.get("title"),
                    resource_type=resource_type,
                    provider=provider,
                    url=(
                        (record.get("links") or {}).get("html")
                        or (
                            "https://doi.org/" + str(metadata.get("doi")).strip()
                            if metadata.get("doi")
                            else ""
                        )
                        or (
                            "https://zenodo.org/records/" + str(record.get("id"))
                            if record.get("id")
                            else ""
                        )
                    ),
                    description=metadata.get("description", ""),
                    identifier=metadata.get("doi") or record.get("id", ""),
                    authors=creators,
                    license_name=license_name,
                    documentation="Files listed" if files else "",
                    access_status="Record found; verify file access and license",
                    usage_count=record.get("stats", {}).get("views"),
                    published_date=metadata.get("publication_date", ""),
                ))

        # Hugging Face datasets
        elif provider == "Hugging Face":
            for record in data if isinstance(data, list) else []:
                dataset_id = record.get("id", "")
                results.append(normalize(
                    title=dataset_id,
                    resource_type="dataset",
                    provider=provider,
                    url=f"https://huggingface.co/datasets/{dataset_id}",
                    description=record.get("description", ""),
                    identifier=dataset_id,
                    authors=record.get("author", ""),
                    license_name=(record.get("cardData") or {}).get("license", ""),
                    documentation="Dataset page; inspect its dataset card",
                    access_status="Dataset page found; verify access restrictions",
                    usage_count=record.get("downloads"),
                    published_date=record.get("lastModified", ""),
                ))

    # Remove duplicate papers, usually returned by both OpenAlex and Crossref.
    unique = {}
    for item in results:
        key = (
            item["type"],
            re.sub(r"[^a-z0-9]", "", item["identifier"].lower())
            or re.sub(r"[^a-z0-9]", "", item["title"].lower()),
        )
        if key not in unique:
            unique[key] = item

    final_results = list(unique.values())
    final_results.sort(
        key=lambda item: (
            item["quality"]["score"],
            item.get("usage_count") or 0,
        ),
        reverse=True,
    )

    return {
        "query": query,
        "count": len(final_results),
        "results": final_results,
        "providers": provider_status,
        "notice": (
            "Search results depend on provider availability and indexing. "
            "Scores measure metadata coverage only; they are not endorsements."
        ),
    }
