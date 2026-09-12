from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..engine_client import EngineError, run_search
from ..search_index import build_order_corpus, build_product_corpus, normalize_for_search
from ..seed import get_setting

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("", response_model=schemas.SearchResponse)
def search(
    q: str = Query(..., min_length=1, description="Termenul căutat"),
    algorithm: str | None = Query(None, pattern="^(kmp|bmh|rk)$"),
    scope: str = Query("products", pattern="^(products|orders)$"),
    db: Session = Depends(get_db),
):
    # Magazinul nu trimite algoritmul — folosește cel setat din admin.
    # Admin-ul îl trimite explicit când compară algoritmii.
    chosen_algorithm = algorithm or get_setting(db, "search_algorithm")

    corpus = build_product_corpus(db) if scope == "products" else build_order_corpus(db)
    normalized_pattern = normalize_for_search(q)

    if not corpus.text or not normalized_pattern:
        return schemas.SearchResponse(query=q, algorithm=chosen_algorithm, scope=scope, time_us=0.0, match_count=0, results=[])

    try:
        result = run_search(corpus.text, normalized_pattern, chosen_algorithm)
    except EngineError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error

    db.add(models.SearchLog(
        query=q[:200],
        algorithm=chosen_algorithm,
        scope=scope,
        text_length=result["text_length"],
        match_count=result["match_count"],
        time_us=result["time_us"],
    ))
    db.commit()

    seen_record_ids: set[int] = set()
    results: list[schemas.SearchResultItem] = []
    record_type = "product" if scope == "products" else "order"

    for position in result["matches"]:
        record = corpus.find_owner(position)
        if record is None or record.record_id in seen_record_ids:
            continue
        seen_record_ids.add(record.record_id)
        results.append(schemas.SearchResultItem(
            id=record.record_id, type=record_type, title=record.title, snippet=record.snippet,
        ))

    return schemas.SearchResponse(
        query=q,
        algorithm=chosen_algorithm,
        scope=scope,
        time_us=result["time_us"],
        match_count=result["match_count"],
        results=results,
    )
