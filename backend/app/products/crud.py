from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from . import models, schemas

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    if get_product_by_sku(db, product.sku):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product SKU/code '{product.sku}' already exists."
        )
    
    db_product = models.Product(
        name=product.name,
        sku=product.sku,
        price=product.price,
        quantity=product.quantity
    )
    db.add(db_product)
    try:
        db.commit()
        db.refresh(db_product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database integrity error while creating product."
        )
    return db_product

def update_product(db: Session, product_id: int, product_update: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    update_data = product_update.model_dump(exclude_unset=True)
    if "sku" in update_data and update_data["sku"] != db_product.sku:
        if get_product_by_sku(db, update_data["sku"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product SKU/code '{update_data['sku']}' already exists."
            )
            
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    try:
        db.commit()
        db.refresh(db_product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database integrity check failed during update. Check quantity/price parameters."
        )
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    try:
        db.delete(db_product)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Database error while deleting product: {str(e)}"
        )
    return db_product
