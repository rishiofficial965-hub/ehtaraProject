from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from .database import engine, Base
from .routers import products, customers, orders

# Automatically create tables on startup if they don't exist
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database table creation skipped (Database connection offline): {e}")

app = FastAPI(
    title="Inventory & Order Management API",
    description="Production-Ready Containerized Inventory & Order Management System API",
    version="1.0.0"
)

# CORS setup
# Allows development from localhost (e.g. Vite dev server) as well as Docker Compose networking
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler for database integrity/constraint issues (like duplicate unique keys)
@app.exception_handler(IntegrityError)
def db_integrity_exception_handler(request: Request, exc: IntegrityError):
    # Determine error messages for specific constraints
    error_msg = str(exc.orig) if exc.orig else "Database validation error."
    
    # Format a cleaner message for end-users
    if "sku" in error_msg.lower():
        detail = "A product with this SKU/code already exists."
    elif "email" in error_msg.lower():
        detail = "A customer with this email address already exists."
    elif "quantity" in error_msg.lower() or "stock" in error_msg.lower():
        detail = "Inventory quantity cannot be negative."
    elif "price" in error_msg.lower():
        detail = "Price cannot be negative."
    else:
        detail = "Integrity check failed: " + error_msg

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"success": False, "detail": detail}
    )

# Include Routers
# Match standard path prefix requirements
app.include_router(products.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(orders.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Inventory & Order Management API",
        "documentation": "/docs"
    }
