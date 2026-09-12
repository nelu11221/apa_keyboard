import json

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import settings
from ..database import get_db

router = APIRouter(prefix="/api", tags=["payments"])

stripe.api_key = settings.stripe_secret_key


@router.post("/checkout")
def create_checkout_session(payload: schemas.CheckoutRequest, db: Session = Depends(get_db)):
    if not settings.stripe_secret_key:
        raise HTTPException(
            status_code=500,
            detail="STRIPE_SECRET_KEY nu este configurat. Adaugă-l în server/.env (vezi .env.example).",
        )
    if not payload.items:
        raise HTTPException(status_code=400, detail="Coșul este gol.")

    product_ids = [item.product_id for item in payload.items]
    products_by_id = {
        product.id: product
        for product in db.query(models.Product).filter(models.Product.id.in_(product_ids)).all()
    }

    missing_ids = [pid for pid in product_ids if pid not in products_by_id]
    if missing_ids:
        raise HTTPException(status_code=404, detail=f"Produse inexistente: {missing_ids}")

    out_of_stock = [
        products_by_id[item.product_id].name
        for item in payload.items
        if products_by_id[item.product_id].stock < item.quantity
    ]
    if out_of_stock:
        raise HTTPException(status_code=409, detail=f"Not enough stock for: {', '.join(out_of_stock)}")

    total_cents = sum(products_by_id[item.product_id].price_cents * item.quantity for item in payload.items)

    order = models.Order(
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        status="pending",
        total_cents=total_cents,
    )
    db.add(order)
    db.flush()  # ca order.id să fie disponibil pentru order items, înainte de commit

    # Numele opțiunilor alese (switch-uri / keycaps) intră în numele
    # articolului din comandă și din Stripe, ca să apară pe factură.
    option_slugs = {slug for item in payload.items for slug in (item.switches, item.keycaps) if slug}
    option_names = {
        product.slug: product.name
        for product in db.query(models.Product).filter(models.Product.slug.in_(option_slugs)).all()
    } if option_slugs else {}

    line_items = []
    for item in payload.items:
        product = products_by_id[item.product_id]
        chosen = [option_names.get(slug) for slug in (item.switches, item.keycaps) if slug and option_names.get(slug)]
        item_name = f"{product.name} ({' · '.join(chosen)})" if chosen else product.name
        db.add(models.OrderItem(
            order_id=order.id,
            product_id=product.id,
            product_name_snapshot=item_name,
            quantity=item.quantity,
            unit_price_cents=product.price_cents,
        ))
        line_items.append({
            "price_data": {
                "currency": "usd",
                "product_data": {"name": item_name},
                "unit_amount": product.price_cents,
            },
            "quantity": item.quantity,
        })
    db.commit()

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=line_items,
            customer_email=payload.customer_email,
            success_url=f"{settings.frontend_url}/success?order_id={order.id}",
            cancel_url=f"{settings.frontend_url}/cart",
            metadata={"order_id": str(order.id)},
        )
    except stripe.error.StripeError as error:
        raise HTTPException(status_code=502, detail=f"Stripe a refuzat cererea: {error.user_message or str(error)}") from error

    order.stripe_session_id = session.id
    db.commit()

    return {"checkout_url": session.url, "order_id": order.id}


@router.post("/stripe/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    signature = request.headers.get("stripe-signature", "")

    try:
        if settings.stripe_webhook_secret:
            event = stripe.Webhook.construct_event(payload, signature, settings.stripe_webhook_secret)
        else:
            # Doar pentru dezvoltare locală rapidă, fără secret de webhook
            # configurat încă — NU se folosește niciodată așa în producție.
            event = json.loads(payload)
    except (ValueError, stripe.error.SignatureVerificationError) as error:
        raise HTTPException(status_code=400, detail=f"Webhook Stripe invalid: {error}") from error

    if event["type"] == "checkout.session.completed":
        session_data = event["data"]["object"]
        order_id_raw = session_data.get("metadata", {}).get("order_id")
        if order_id_raw is not None:
            order = db.get(models.Order, int(order_id_raw))
            if order is not None and order.status != "paid":
                order.status = "paid"
                for item in order.items:
                    product = db.get(models.Product, item.product_id)
                    if product is not None:
                        product.stock = max(0, product.stock - item.quantity)
                db.commit()

    return {"received": True}
