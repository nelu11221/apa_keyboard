from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name: str
    tagline: str
    description: str
    category: str
    price_cents: int
    stock: int
    badge: str
    image_key: str
    accent: str
    specs: str


class ProductIn(BaseModel):
    slug: str = Field(min_length=1, max_length=120)
    name: str = Field(min_length=1, max_length=200)
    tagline: str = ""
    description: str = ""
    category: str = Field(min_length=1)
    price_cents: int = Field(ge=0)
    stock: int = Field(ge=0)
    badge: str = ""
    image_key: str = ""
    accent: str = "orange"
    specs: str = ""


class CartItemIn(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)
    # Personalizare pentru tastaturi (fără cost suplimentar): slug-urile
    # produselor de switch-uri / keycaps alese; None = configurația standard.
    switches: str | None = None
    keycaps: str | None = None


class CheckoutRequest(BaseModel):
    customer_name: str
    customer_email: str
    items: list[CartItemIn]


class SearchResultItem(BaseModel):
    id: int
    type: str  # "product" | "order"
    title: str
    snippet: str


class SearchResponse(BaseModel):
    query: str
    algorithm: str
    scope: str
    time_us: float
    match_count: int
    results: list[SearchResultItem]


class BenchmarkPoint(BaseModel):
    algorithm: str
    text_length: int
    time_us: float


class BenchmarkResponse(BaseModel):
    pattern: str
    points: list[BenchmarkPoint]


class SettingsOut(BaseModel):
    search_algorithm: str


class SettingsIn(BaseModel):
    search_algorithm: str = Field(pattern="^(kmp|bmh|rk)$")


class SearchLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    query: str
    algorithm: str
    scope: str
    text_length: int
    match_count: int
    time_us: float
    created_at: datetime
