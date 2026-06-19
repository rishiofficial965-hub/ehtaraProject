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
*   Cascade delete: Removing a customer automatically cleans up their order history and automatically restocks all products associated with their deleted orders.

### 🛒 3. Order Management & Business Logic
*   Place orders with multiple line items, customer association, and quantity requirements.
*   **Automatic Inventory Adjustments:** Ordering a product automatically checks stock level sufficiency and decrements availability in a locked database transaction to prevent race conditions.
*   **Automatic Price Calculation:** The total order amount is computed automatically on the backend from actual product database records.
*   **Order Deletion / Restocking:** Deleting/canceling an order automatically restocks the ordered quantities back to the product inventory.

### 📊 4. Interactive Dashboard
*   Instant overview statistics: Total Products, Total Customers, and Total Orders.
*   **Critical Low-Stock Alerts:** Highlights products whose inventory is below a critical threshold (quantity < 10) so businesses can plan restocks proactively.

### 🛡️ 5. Clean Confirmation UI & Better Error Handling
*   **Custom Confirmation Modals:** Replaced raw browser `window.confirm` dialogs with a modern glassmorphic confirmation popup for deletions and cancels.
*   **Descriptive Backend Exceptions**: General server errors, DB constraint errors, and Pydantic validation errors format and return plain-English messages directly to client alerts. Connection failures (`OperationalError`, `InterfaceError`) are intercepted to prevent credential exposure, and configuration constraints exit cleanly on container start if the `DATABASE_URL` environment variable is not supplied.

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

---

## 📐 Architecture & Modular File Structure

Both frontend and backend codebases have been fully refactored to use a highly cohesive, domain-driven architecture where similar modules and tasks are kept together.

### Frontend Modular Layout (`frontend/src/`)
State management and business operations are completely decoupled from layout presenters:
*   **`hooks/useAppState.js`**: Custom hook encapsulating all React state variables, search parameters, modal visibilities, notification triggers, and API side-effects.
*   **`components/common/`**: Nav layout, sidebar logo panels, toast popups, and the custom `<ConfirmationModal />`.
*   **`components/dashboard/`**: Total stats counters, threshold widgets, and stock exception lists.
*   **`components/products/`**: Product specs modals, search bars, and catalog tables.
*   **`components/customers/`**: Customer registers and profile lists.
*   **`components/orders/`**: Live invoice compiler modals, details inspector, and orders tracking logs.

### Backend Modular Layout (`backend/app/`)
Organized in domain subfolders to isolate logical components and prevent circular dependencies:
*   **`products/`**: Houses product SQLAlchemy models, validation schemas, database CRUD procedures, and product routes.
*   **`customers/`**: Houses customer SQLAlchemy models, validation schemas, database CRUD procedures, and customer routes.
*   **`orders/`**: Houses order and line item SQLAlchemy models, validation schemas, transaction-wrapped CRUD, and order routes.

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
.\.venv\Scripts\python test_app.py
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
