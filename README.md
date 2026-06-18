# Invenio 📦

Invenio is a production-ready, containerized **Inventory & Order Management System** built with a high-performance Python FastAPI backend, a responsive React frontend, and a persistent PostgreSQL database. The entire application is orchestrated using Docker and Docker Compose for seamless deployment and local development.

---

## 🚀 Key Features

### 📦 1. Product Management
*   Full CRUD control over the product catalog (create, retrieve, view details, update, delete).
*   Automatic enforcement of uniqueness on SKU/code identifiers.
*   Enforcement of non-negative product quantities and prices.

### 👥 2. Customer Management
*   Manage customer profiles (create, retrieve, view details, delete).
*   Automatic email uniqueness constraint validation.
*   Cascade delete: Removing a customer automatically cleans up their order history.

### 🛒 3. Order Management & Business Logic
*   Place orders with multiple line items, customer association, and quantity requirements.
*   **Automatic Inventory Adjustments:** Ordering a product automatically checks stock level sufficiency and decrements availability in a locked database transaction to prevent race conditions.
*   **Automatic Price Calculation:** The total order amount is computed automatically on the backend from actual product database records.
*   **Order Deletion / Restocking:** Deleting/canceling an order automatically restocks the ordered quantities back to the product inventory.

### 📊 4. Interactive Dashboard
*   Instant overview statistics: Total Products, Total Customers, and Total Orders.
*   **Critical Low-Stock Alerts:** Highlights products whose inventory is below a critical threshold (quantity < 10) so businesses can plan restocks proactively.

---

## 🛠️ Technology Stack

### Backend
*   **Runtime & Framework:** Python 3.11 & FastAPI
*   **Database ORM:** SQLAlchemy (for transaction management and schema modeling)
*   **Database:** PostgreSQL (production database)
*   **Validation:** Pydantic v2 (strict request validation and schema parsing)

### Frontend
*   **Framework:** React 19 & Vite (instant development builds and optimized packing)
*   **Icons:** React Icons (Feather Icon set)
*   **HTTP Client:** Axios (configured with environment baseURLs)
*   **Styling:** Tailwind CSS

### Containerization & Service Orchestration
*   **Docker:** Multi-stage production-hardened `dockerfile` configurations
*   **Docker Compose:** Orchestrates frontend, backend, and postgresql database services with health-checks.

---

## 💻 Local Setup & Installation

### Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.
*   *Alternatively, if running locally without Docker:* Python 3.11+, Node.js 18+, and PostgreSQL installed.

### Option 1: Running with Docker Compose (Recommended)

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/rishiofficial965-hub/ecommerce.git
    cd ecommerce
    ```

2.  **Configure Environment Variables:**
    Copy the sample environment file to the root directory or configure it as needed.
    ```bash
    cp .env.example .env
    ```

3.  **Launch the System:**
    Run Docker Compose. This will build the frontend and backend, pull PostgreSQL, configure database schemas automatically, and start all services.
    ```bash
    docker-compose up --build
    ```

4.  **Access the Application:**
    *   **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
    *   **Backend API Service:** [http://localhost:8000](http://localhost:8000)
    *   **API Interactive Documentation (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option 2: Running Locally (For Development)

#### 1. Start backend:
```bash
cd backend
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

#### 2. Start frontend:
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Integration Tests

The project includes a robust suite of backend integration tests validating the API router schemas, CRUD operations, database constraints (uniqueness, negative numbers), and transaction logic.

To execute the tests:
```bash
cd backend
# Run test suite with local virtual environment Python
.\.venv\Scripts\python.exe test_app.py
```

---

## 📡 API Endpoints Summary

### Products (`/api/products`)
*   `POST /products` - Register a new product.
*   `GET /products` - Retrieve all products (supports skip/limit pagination).
*   `GET /products/{id}` - Get product specs by ID.
*   `PUT /products/{id}` - Update product details (e.g. price, stock level).
*   `DELETE /products/{id}` - Remove product.

### Customers (`/api/customers`)
*   `POST /customers` - Create customer account.
*   `GET /customers` - Retrieve all registered customers.
*   `GET /customers/{id}` - Get customer profile details by ID.
*   `DELETE /customers/{id}` - Delete customer account.

### Orders (`/api/orders`)
*   `POST /orders` - Submit new order (reduces inventory, calculates total).
*   `GET /orders` - View all orders.
*   `GET /orders/{id}` - View order details (includes products list & subtotals).
*   `DELETE /orders/{id}` - Cancel/Delete order (automatically restocks items).
# ehtaraProject
