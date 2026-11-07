from fastapi import APIRouter, HTTPException, Query

from app.core.resource_discovery import search_resources

router = APIRouter(
    prefix="/research-resources",
    tags=["Research Resource Intelligence"],
)


@router.get("/search")
async def search_research_resources(
    q: str = Query(..., min_length=2, max_length=300),
    limit: int = Query(100, ge=1, le=100),
):
    try:
        return await search_resources(q, limit)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Resource discovery failed: {str(exc)[:250]}",
        ) from exc
