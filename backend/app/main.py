from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from .database import engine, Base
from .products.router import router as products_router
from .customers.router import router as customers_router
from .orders.router import router as orders_router

from fastapi.exceptions import RequestValidationError
import traceback

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
    # Log to server console
    traceback.print_exc()
    error_msg = str(exc.orig) if exc.orig else "Database validation error."
    
    # Format a cleaner message for end-users
    if "sku" in error_msg.lower():
        detail = "A product with this SKU/code already exists."
    elif "email" in error_msg.lower():
        detail = "A customer with this email address already exists."
    elif "foreign key" in error_msg.lower() or "violation" in error_msg.lower():
        detail = "Cannot perform this action: this record is referenced by other records (e.g., existing orders)."
    elif "quantity" in error_msg.lower() or "stock" in error_msg.lower():
        detail = "Inventory quantity cannot be negative."
    elif "price" in error_msg.lower():
        detail = "Price cannot be negative."
    else:
        detail = f"Database integrity check failed: {error_msg}"

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"success": False, "detail": detail}
    )

# Global Exception Handler for Pydantic input validation errors
@app.exception_handler(RequestValidationError)
def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        loc = error.get("loc", [])
        field = str(loc[-1]) if loc else "field"
        field_name = field.replace("_", " ").capitalize()
        msg = error.get("msg", "Invalid value")
        errors.append(f"{field_name}: {msg}")
    
    detail = "Input validation failed: " + "; ".join(errors)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"success": False, "detail": detail}
    )

# Catch-all Exception Handler for general unexpected server errors
@app.exception_handler(Exception)
def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "detail": f"An unexpected server error occurred: {str(exc)}"
        }
    )

# Include Routers
# Match standard path prefix requirements
app.include_router(products_router, prefix="/api")
app.include_router(customers_router, prefix="/api")
app.include_router(orders_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Inventory & Order Management API",
        "documentation": "/docs"
    }
