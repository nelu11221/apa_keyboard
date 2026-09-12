from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    tagline: Mapped[str] = mapped_column(String(200), default="")
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(100))  # keyboards | switches | keycaps | accessories
    price_cents: Mapped[int] = mapped_column(Integer)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    badge: Mapped[str] = mapped_column(String(40), default="")  # ex. "New", "Best seller"
    image_key: Mapped[str] = mapped_column(String(80), default="")  # cheie în web/src/images.js
    accent: Mapped[str] = mapped_column(String(20), default="orange")  # culoarea ilustrației placeholder
    specs: Mapped[str] = mapped_column(Text, default="")  # linii "Label: value" separate prin \n

    def searchable_text(self) -> str:
        return f"{self.name} {self.tagline} {self.description} {self.category} {self.specs}"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer_name: Mapped[str] = mapped_column(String(200))
    customer_email: Mapped[str] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending | paid
    stripe_session_id: Mapped[str | None] = mapped_column(String(200), nullable=True)
    total_cents: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)

    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")

    def searchable_text(self) -> str:
        product_names = " ".join(item.product_name_snapshot for item in self.items)
        return f"{self.customer_name} {self.customer_email} {self.status} {product_names}"


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    product_name_snapshot: Mapped[str] = mapped_column(String(200))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price_cents: Mapped[int] = mapped_column(Integer)

    order: Mapped["Order"] = relationship(back_populates="items")


class SearchLog(Base):
    """Fiecare căutare reală făcută din magazin sau din admin — materia primă
    pentru statisticile de utilizare a algoritmilor din panoul de admin."""

    __tablename__ = "search_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    query: Mapped[str] = mapped_column(String(200))
    algorithm: Mapped[str] = mapped_column(String(10))
    scope: Mapped[str] = mapped_column(String(20))
    text_length: Mapped[int] = mapped_column(Integer)
    match_count: Mapped[int] = mapped_column(Integer)
    time_us: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


class Setting(Base):
    __tablename__ = "settings"

    key: Mapped[str] = mapped_column(String(80), primary_key=True)
    value: Mapped[str] = mapped_column(String(200))
