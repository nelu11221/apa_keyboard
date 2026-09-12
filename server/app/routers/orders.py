from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.get("")
def list_orders(db: Session = Depends(get_db)):
    orders = db.query(models.Order).order_by(models.Order.id.desc()).all()
    return [
        {
            "id": order.id,
            "customer_name": order.customer_name,
            "customer_email": order.customer_email,
            "status": order.status,
            "total_cents": order.total_cents,
            "created_at": order.created_at.isoformat(),
            "items": [
                {
                    "product_name": item.product_name_snapshot,
                    "quantity": item.quantity,
                    "unit_price_cents": item.unit_price_cents,
                }
                for item in order.items
            ],
        }
        for order in orders
    ]
