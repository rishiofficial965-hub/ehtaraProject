from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from . import models, schemas
from app.products.models import Product
from app.customers.models import Customer

def get_order(db: Session, order_id: int):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        return None
    
    order.customer_name = order.customer.full_name if order.customer else "Unknown Customer"
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            item.product_name = product.name
            item.product_sku = product.sku
            item.product_price = product.price
            
    return order

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    orders = db.query(models.Order).offset(skip).limit(limit).all()
    for o in orders:
        o.customer_name = o.customer.full_name if o.customer else "Unknown Customer"
        for item in o.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                item.product_name = product.name
                item.product_sku = product.sku
                item.product_price = product.price
    return orders

def create_order(db: Session, order_create: schemas.OrderCreate):
    # Check if customer exists
    customer = db.query(Customer).filter(Customer.id == order_create.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {order_create.customer_id} does not exist."
        )
        
    total_amount = 0.0
    order_items_to_create = []
    
    for item in order_create.items:
        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} does not exist."
            )
            
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient inventory for product '{product.name}' (SKU: {product.sku}). Available: {product.quantity}, Requested: {item.quantity}."
            )
            
        product.quantity -= item.quantity
        total_amount += product.price * item.quantity
        
        db_order_item = models.OrderItem(
            product_id=item.product_id,
            quantity=item.quantity
        )
        order_items_to_create.append(db_order_item)
        
    db_order = models.Order(
        customer_id=order_create.customer_id,
        total_amount=total_amount
    )
    db.add(db_order)
    
    try:
        db.flush()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving order parameters: {str(e)}"
        )
        
    for item in order_items_to_create:
        item.order_id = db_order.id
        db.add(item)
        
    try:
        db.commit()
        db.refresh(db_order)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to commit order transaction: {str(e)}"
        )
        
    return get_order(db, db_order.id)

def delete_order(db: Session, order_id: int):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    for item in db_order.items:
        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if product:
            product.quantity += item.quantity
            
    db.delete(db_order)
    db.commit()
    return db_order
