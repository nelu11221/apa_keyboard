from fastapi import FastAPI
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, SessionLocal, engine
from .routers import admin, benchmark, orders, products, search, stripe_payments
from .seed import seed_if_empty

Base.metadata.create_all(bind=engine)

# Pe Supabase, tabelele din schema `public` sunt expuse și prin API-ul lor
# automat (PostgREST, cu cheia anon). Activăm Row Level Security fără nicio
# politică: acel API nu mai poate citi/scrie nimic, iar backend-ul nostru,
# conectat ca proprietarul tabelelor, nu e afectat (proprietarul ocolește RLS).
if engine.dialect.name == "postgresql":
    with engine.begin() as connection:
        for table in Base.metadata.sorted_tables:
            connection.execute(text(f'ALTER TABLE "{table.name}" ENABLE ROW LEVEL SECURITY'))

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
    # `database` arată ce motor e folosit (sqlite local / postgresql pe Supabase)
    return {"status": "ok", "database": engine.dialect.name}
