import random
import statistics
import string

from fastapi import APIRouter, Depends, Query

from .. import schemas
from ..auth import require_admin
from ..engine_client import run_search

router = APIRouter(prefix="/api/benchmark", tags=["benchmark"], dependencies=[Depends(require_admin)])

_TEXT_SIZES = [1_000, 5_000, 20_000, 50_000, 100_000, 300_000, 600_000, 1_000_000]


def _generate_text(length: int, alphabet: str, seed: int) -> str:
    rng = random.Random(seed)
    return "".join(rng.choice(alphabet) for _ in range(length))


@router.get("", response_model=schemas.BenchmarkResponse)
def run_benchmark(
    pattern: str = Query("algoritm", min_length=1, max_length=50),
    alphabet: str = Query("natural", pattern="^(natural|mic)$"),
    repeats: int = Query(3, ge=1, le=10),
):
    """Generează texte sintetice de dimensiuni crescătoare, rulează fiecare
    din cei trei algoritmi de mai multe ori pe fiecare dimensiune, și
    returnează media timpului de execuție — datele brute pentru graficele
    comparative din raport și din panoul de admin.
    """
    alphabet_chars = "ab" if alphabet == "mic" else string.ascii_lowercase + " "

    points: list[schemas.BenchmarkPoint] = []
    for size in _TEXT_SIZES:
        text = _generate_text(size, alphabet_chars, seed=size)

        # Garantăm cel puțin o potrivire reală, ca toți algoritmii să facă
        # verificări efective, nu doar respingeri rapide pe tot textul.
        insert_at = size // 2
        text = text[:insert_at] + pattern + text[insert_at + len(pattern):]

        for algorithm in ("kmp", "bmh", "rk"):
            timings_us = [run_search(text, pattern, algorithm)["time_us"] for _ in range(repeats)]
            points.append(schemas.BenchmarkPoint(
                algorithm=algorithm,
                text_length=size,
                time_us=statistics.mean(timings_us),
            ))

    return schemas.BenchmarkResponse(pattern=pattern, points=points)
