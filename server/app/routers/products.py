from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import case
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/products", tags=["products"])

# Ordinea categoriilor în catalog; în interiorul unei categorii, după id.
# Astfel un produs adăugat mai târziu apare lângă cele din categoria lui.
CATEGORY_ORDER = ["keyboards", "switches", "keycaps", "mice", "audio", "accessories"]
_category_rank = case(
    {name: index for index, name in enumerate(CATEGORY_ORDER)},
    value=models.Product.category,
    else_=len(CATEGORY_ORDER),
)


@router.get("", response_model=list[schemas.ProductOut])
def list_products(category: str | None = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Product)
    if category:
        query = query.filter(models.Product.category == category)
    return query.order_by(_category_rank, models.Product.id).all()


@router.get("/{slug}", response_model=schemas.ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.slug == slug).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
