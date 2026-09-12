import json
import subprocess
from pathlib import Path
from typing import Any, Literal

from .config import settings

Algorithm = Literal["kmp", "bmh", "rk", "all"]


class EngineError(RuntimeError):
    """Ridicată când executabilul C++ nu poate fi rulat sau returnează o eroare."""


def run_search(text: str, pattern: str, algorithm: Algorithm = "kmp") -> dict[str, Any]:
    """Apelează executabilul C++ search_engine, trimițându-i textul prin stdin.

    Textul și șablonul sunt deja normalizate (fără diacritice, minuscule) de
    către chemător (vezi search_index.normalize_for_search), astfel încât
    fiecare caracter corespunde exact unui octet — pozițiile returnate de
    motorul C++ coincid deci cu indicii din șirul Python original.

    Pentru algorithm="all" motorul returnează o listă cu cele trei rezultate;
    aici acceptăm doar un singur algoritm per apel, ca fiecare măsurătoare
    să fie clară și izolată.
    """
    engine_path = settings.engine_path
    if not Path(engine_path).is_file():
        raise EngineError(
            f"Executabilul motorului de căutare nu a fost găsit la {engine_path}. "
            "Compilează-l mai întâi: cd engine && make"
        )

    try:
        process = subprocess.run(
            [engine_path, algorithm, "-", pattern],
            input=text.encode("utf-8"),
            capture_output=True,
            timeout=30,
        )
    except subprocess.TimeoutExpired as error:
        raise EngineError("Motorul de căutare a durat prea mult și a fost întrerupt.") from error

    if process.returncode != 0:
        message = process.stderr.decode("utf-8", errors="ignore").strip()
        raise EngineError(message or "Motorul de căutare a returnat o eroare necunoscută.")

    return json.loads(process.stdout.decode("utf-8"))
