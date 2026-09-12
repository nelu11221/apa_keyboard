from collections import defaultdict
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..seed import get_setting

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db)):
    """Cifrele din capul dashboard-ului + seriile pentru grafice."""
    orders = db.query(models.Order).all()
    paid_orders = [order for order in orders if order.status == "paid"]

    revenue_cents = sum(order.total_cents for order in paid_orders)
    average_order_cents = revenue_cents // len(paid_orders) if paid_orders else 0

    # Venit pe zi, ultimele 14 zile (zilele fără comenzi apar cu 0).
    today = datetime.now(timezone.utc).date()
    revenue_by_day = {today - timedelta(days=offset): 0 for offset in range(13, -1, -1)}
    orders_by_day = {day: 0 for day in revenue_by_day}
    for order in paid_orders:
        day = order.created_at.date()
        if day in revenue_by_day:
            revenue_by_day[day] += order.total_cents
            orders_by_day[day] += 1

    # Produse top după cantitatea vândută în comenzi plătite.
    sold_by_product: dict[str, dict] = defaultdict(lambda: {"quantity": 0, "revenue_cents": 0})
    for order in paid_orders:
        for item in order.items:
            entry = sold_by_product[item.product_name_snapshot]
            entry["quantity"] += item.quantity
            entry["revenue_cents"] += item.quantity * item.unit_price_cents
    top_products = sorted(
        ({"name": name, **stats} for name, stats in sold_by_product.items()),
        key=lambda entry: entry["quantity"],
        reverse=True,
    )[:5]

    # Statistici de căutare per algoritm (din jurnalul căutărilor reale).
    search_rows = (
        db.query(
            models.SearchLog.algorithm,
            func.count(models.SearchLog.id),
            func.avg(models.SearchLog.time_us),
        )
        .group_by(models.SearchLog.algorithm)
        .all()
    )
    search_by_algorithm = [
        {"algorithm": algorithm, "count": count, "avg_time_us": round(avg_time or 0.0, 2)}
        for algorithm, count, avg_time in search_rows
    ]

    low_stock = (
        db.query(models.Product)
        .filter(models.Product.stock <= 20)
        .order_by(models.Product.stock)
        .limit(5)
        .all()
    )

    return {
        "revenue_cents": revenue_cents,
        "orders_total": len(orders),
        "orders_paid": len(paid_orders),
        "orders_pending": len(orders) - len(paid_orders),
        "average_order_cents": average_order_cents,
        "products_total": db.query(models.Product).count(),
        "searches_total": db.query(models.SearchLog).count(),
        "revenue_by_day": [
            {"day": day.isoformat(), "revenue_cents": revenue_by_day[day], "orders": orders_by_day[day]}
            for day in revenue_by_day
        ],
        "top_products": top_products,
        "search_by_algorithm": search_by_algorithm,
        "low_stock": [schemas.ProductOut.model_validate(product).model_dump() for product in low_stock],
    }


@router.get("/search-logs", response_model=list[schemas.SearchLogOut])
def search_logs(limit: int = 50, db: Session = Depends(get_db)):
    return (
        db.query(models.SearchLog)
        .order_by(models.SearchLog.id.desc())
        .limit(min(limit, 500))
        .all()
    )


@router.get("/settings", response_model=schemas.SettingsOut)
def read_settings(db: Session = Depends(get_db)):
    return schemas.SettingsOut(search_algorithm=get_setting(db, "search_algorithm"))


@router.put("/settings", response_model=schemas.SettingsOut)
def update_settings(payload: schemas.SettingsIn, db: Session = Depends(get_db)):
    setting = db.get(models.Setting, "search_algorithm")
    if setting is None:
        setting = models.Setting(key="search_algorithm", value=payload.search_algorithm)
        db.add(setting)
    else:
        setting.value = payload.search_algorithm
    db.commit()
    return schemas.SettingsOut(search_algorithm=payload.search_algorithm)


# --- CRUD produse ---

@router.post("/products", response_model=schemas.ProductOut, status_code=201)
def create_product(payload: schemas.ProductIn, db: Session = Depends(get_db)):
    if db.query(models.Product).filter(models.Product.slug == payload.slug).first():
        raise HTTPException(status_code=409, detail="A product with this slug already exists")
    product = models.Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: int, payload: schemas.ProductIn, db: Session = Depends(get_db)):
    product = db.get(models.Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in payload.model_dump().items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(models.Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
