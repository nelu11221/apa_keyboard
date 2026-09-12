import unicodedata
from bisect import bisect_right
from dataclasses import dataclass, field

from sqlalchemy.orm import Session

from . import models

_DIACRITIC_MAP = str.maketrans({
    "ă": "a", "Ă": "A",
    "â": "a", "Â": "A",
    "î": "i", "Î": "I",
    "ș": "s", "Ș": "S",
    "ş": "s", "Ş": "S",  # variantă cu virgulă, folosită de unele codificări vechi
    "ț": "t", "Ț": "T",
    "ţ": "t", "Ţ": "T",
})


def normalize_for_search(text: str) -> str:
    """Elimină diacriticele și pune totul pe minuscule, ca să potrivim
    "Mașină" cu "masina" sau "MASINA". În plus — și esențial pentru motorul
    C++ — rezultatul e mereu text ASCII simplu, deci fiecare caracter
    ocupă exact un octet: poziția pe care o găsește motorul de căutare (în
    octeți) coincide întotdeauna cu indicele din șirul Python (în caractere),
    fără nicio decalare cauzată de caracterele românești pe mai mulți octeți.
    """
    text = text.translate(_DIACRITIC_MAP)
    normalized = unicodedata.normalize("NFKD", text)
    without_accents = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    return without_accents.lower()


SEPARATOR = "\n"


@dataclass
class IndexedRecord:
    record_id: int
    start: int
    end: int  # exclusiv
    title: str
    snippet: str


@dataclass
class SearchCorpus:
    text: str
    records: list[IndexedRecord] = field(default_factory=list)
    _starts: list[int] = field(default_factory=list, init=False, repr=False)

    def __post_init__(self) -> None:
        self._starts = [record.start for record in self.records]

    def find_owner(self, position: int) -> IndexedRecord | None:
        index = bisect_right(self._starts, position) - 1
        if index < 0:
            return None
        record = self.records[index]
        if record.start <= position < record.end:
            return record
        return None


def _build_corpus(chunks: list[tuple[int, str, str, str]]) -> SearchCorpus:
    """chunks: listă de (record_id, text_căutabil_original, titlu, fragment_afișat)."""
    text_parts: list[str] = []
    records: list[IndexedRecord] = []
    cursor = 0

    for record_id, searchable_text, title, snippet in chunks:
        normalized_chunk = normalize_for_search(searchable_text)
        start = cursor
        end = start + len(normalized_chunk)
        records.append(IndexedRecord(record_id=record_id, start=start, end=end, title=title, snippet=snippet))
        text_parts.append(normalized_chunk)
        text_parts.append(SEPARATOR)
        cursor = end + len(SEPARATOR)

    return SearchCorpus(text="".join(text_parts), records=records)


def build_product_corpus(db: Session) -> SearchCorpus:
    products = db.query(models.Product).order_by(models.Product.id).all()
    chunks = [
        (product.id, product.searchable_text(), product.name, product.description[:140])
        for product in products
    ]
    return _build_corpus(chunks)


def build_order_corpus(db: Session) -> SearchCorpus:
    orders = db.query(models.Order).order_by(models.Order.id).all()
    chunks = [
        (
            order.id,
            order.searchable_text(),
            f"Comanda #{order.id} — {order.customer_name}",
            f"Status: {order.status} · total: {order.total_cents / 100:.2f} $",
        )
        for order in orders
    ]
    return _build_corpus(chunks)
