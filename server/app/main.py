from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, SessionLocal, engine
from .routers import admin, benchmark, orders, products, search, stripe_payments
from .seed import seed_if_empty

Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    seed_if_empty(db)

app = FastAPI(title="NEXA API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origin_regex=r"https://.*\.netlify\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(search.router)
app.include_router(stripe_payments.router)
app.include_router(benchmark.router)
app.include_router(orders.router)
app.include_router(admin.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
