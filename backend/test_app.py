import os
import sys
from fastapi.testclient import TestClient

TEST_DB_FILE = "./test.db"

# Clean up test db file if it already exists from a crashed run
if os.path.exists(TEST_DB_FILE):
    try:
        os.remove(TEST_DB_FILE)
    except Exception as e:
        print(f"Warning: Could not remove old test db file: {e}")

# Set database URL to file-based SQLite for testing before importing anything
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_FILE}"

from app.main import app
from app.database import Base, engine
# Importing models registers them with the Base.metadata
from app.models import Product, Customer, Order, OrderItem

# Create tables in the app's SQLite database AFTER models are imported
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_product_management_and_business_rules():
    # 1. Create product (201 Created)
    prod_data = {
        "name": "Mechanical Keyboard",
        "sku": "KEY-MECH-87",
        "price": 89.99,
        "quantity": 10
    }
    response = client.post("/api/products", json=prod_data)
    assert response.status_code == 201
    prod_json = response.json()
    assert prod_json["name"] == prod_data["name"]
    assert prod_json["sku"] == prod_data["sku"]
    assert prod_json["price"] == prod_data["price"]
    assert prod_json["quantity"] == prod_data["quantity"]
    assert "id" in prod_json
    prod_id = prod_json["id"]

    # 2. Check SKU uniqueness (400 Bad Request)
    response = client.post("/api/products", json=prod_data)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

    # 3. Check negative price validation (422 Unprocessable Entity)
    bad_prod = {
        "name": "Broken Keyboard",
        "sku": "KEY-BROKEN",
        "price": -10.0,
        "quantity": 5
    }
    response = client.post("/api/products", json=bad_prod)
    assert response.status_code == 422

    # 4. Check negative quantity validation (422 Unprocessable Entity)
    bad_prod2 = {
        "name": "Ghost Keyboard",
        "sku": "KEY-GHOST",
        "price": 50.0,
        "quantity": -5
    }
    response = client.post("/api/products", json=bad_prod2)
    assert response.status_code == 422

    # 5. Retrieve all products
    response = client.get("/api/products")
    assert response.status_code == 200
    assert len(response.json()) >= 1

    # 6. Retrieve product by ID
    response = client.get(f"/api/products/{prod_id}")
    assert response.status_code == 200
    assert response.json()["sku"] == "KEY-MECH-87"

    # 7. Update product details
    update_data = {
        "price": 99.99,
        "quantity": 15
    }
    response = client.put(f"/api/products/{prod_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["price"] == 99.99
    assert response.json()["quantity"] == 15

def test_customer_management_and_business_rules():
    # 1. Create customer
    cust_data = {
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1-555-0199"
    }
    response = client.post("/api/customers", json=cust_data)
    assert response.status_code == 201
    cust_json = response.json()
    assert cust_json["full_name"] == cust_data["full_name"]
    assert cust_json["email"] == cust_data["email"]
    assert "id" in cust_json
    cust_id = cust_json["id"]

    # 2. Check unique email constraint (400 Bad Request)
    response = client.post("/api/customers", json=cust_data)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

    # 3. Retrieve all customers
    response = client.get("/api/customers")
    assert response.status_code == 200
    assert len(response.json()) >= 1

    # 4. Retrieve specific customer
    response = client.get(f"/api/customers/{cust_id}")
    assert response.status_code == 200
    assert response.json()["email"] == "john.doe@example.com"

def test_order_management_and_business_rules():
    # Setup test objects: Product with 5 stock, Customer
    # Create product
    response = client.post("/api/products", json={
        "name": "Wireless Mouse",
        "sku": "MS-WIRE-01",
        "price": 25.0,
        "quantity": 5
    })
    prod_json = response.json()
    prod_id = prod_json["id"]

    # Create customer
    response = client.post("/api/customers", json={
        "full_name": "Jane Smith",
        "email": "jane.smith@example.com",
        "phone": "+1-555-0200"
    })
    cust_json = response.json()
    cust_id = cust_json["id"]

    # 1. Try ordering more than available stock (400 Bad Request)
    order_data_invalid = {
        "customer_id": cust_id,
        "items": [
            {
                "product_id": prod_id,
                "quantity": 10 # 10 is greater than stock 5
            }
        ]
    }
    response = client.post("/api/orders", json=order_data_invalid)
    assert response.status_code == 400
    assert "Insufficient inventory" in response.json()["detail"]

    # 2. Order within stock limits (201 Created)
    order_data_valid = {
        "customer_id": cust_id,
        "items": [
            {
                "product_id": prod_id,
                "quantity": 2 # 2 is <= stock 5
            }
        ]
    }
    response = client.post("/api/orders", json=order_data_valid)
    assert response.status_code == 201
    order_json = response.json()
    assert order_json["customer_id"] == cust_id
    # Price calculated: 2 * 25.0 = 50.0
    assert order_json["total_amount"] == 50.0
    assert len(order_json["items"]) == 1
    assert order_json["items"][0]["quantity"] == 2
    order_id = order_json["id"]

    # 3. Verify stock got automatically reduced: 5 - 2 = 3
    response = client.get(f"/api/products/{prod_id}")
    assert response.status_code == 200
    assert response.json()["quantity"] == 3

    # 4. View orders
    response = client.get("/api/orders")
    assert response.status_code == 200
    assert len(response.json()) >= 1

    # 5. View specific order
    response = client.get(f"/api/orders/{order_id}")
    assert response.status_code == 200
    assert response.json()["total_amount"] == 50.0

    # 6. Cancel/Delete order (restocks products)
    response = client.delete(f"/api/orders/{order_id}")
    assert response.status_code == 200

    # 7. Verify stock was returned back: 3 + 2 = 5
    response = client.get(f"/api/products/{prod_id}")
    assert response.status_code == 200
    assert response.json()["quantity"] == 5

if __name__ == "__main__":
    print("Running integration tests...")
    
    tests = [
        test_root_endpoint,
        test_product_management_and_business_rules,
        test_customer_management_and_business_rules,
        test_order_management_and_business_rules
    ]
    
    success = True
    for test in tests:
        try:
            print(f"Running {test.__name__}...", end=" ")
            test()
            print("[PASSED]")
        except AssertionError as e:
            print("[FAILED]")
            print(e)
            success = False
        except Exception as e:
            print("[ERROR]")
            print(e)
            success = False
            
    # Cleanup database file
    if os.path.exists(TEST_DB_FILE):
        try:
            # Close engine connections to unlock the file
            engine.dispose()
            os.remove(TEST_DB_FILE)
        except Exception as e:
            print(f"Warning: Could not cleanup test db file: {e}")
            
    if success:
        print("\nAll integration tests passed successfully!")
        sys.exit(0)
    else:
        print("\nSome tests failed. Check logs above.")
        sys.exit(1)
