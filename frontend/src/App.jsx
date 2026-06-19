import { useAppState } from "./hooks/useAppState";
import Toast from "./components/common/Toast";
import Nav from "./components/common/Nav";
import Sidebar from "./components/common/Sidebar";
import Totalproduct from "./components/dashboard/Totalproduct";
import Totalcustomer from "./components/dashboard/Totalcustomer";
import Totalorder from "./components/dashboard/Totalorder";
import LowstockAlert from "./components/dashboard/LowstockAlert";
import AlertDetail from "./components/dashboard/AlertDetail";
import ProductToolbar from "./components/products/Toolbar";
import ProductTable from "./components/products/ProductTable";
import ProductModal from "./components/products/ProductModal";
import CustomerToolbar from "./components/customers/Toolbar";
import CustomerTable from "./components/customers/CustomerTable";
import CustomerModal from "./components/customers/CustomerModal";
import OrderToolbar from "./components/orders/Toolbar";
import OrderTable from "./components/orders/OrderTable";
import OrderModal from "./components/orders/OrderModal";
import OrderDetailsModal from "./components/orders/OrderDetailsModal";
import ConfirmationModal from "./components/common/ConfirmationModal";

const App = () => {
  const {
    activeTab,
    setActiveTab,
    products,
    customers,
    orders,
    loading,
    fetchData,
    productSearch,
    setProductSearch,
    customerSearch,
    setCustomerSearch,
    orderSearch,
    setOrderSearch,
    isProductModalOpen,
    setIsProductModalOpen,
    editingProduct,
    productForm,
    setProductForm,
    isCustomerModalOpen,
    setIsCustomerModalOpen,
    customerForm,
    setCustomerForm,
    isOrderModalOpen,
    setIsOrderModalOpen,
    orderForm,
    viewingOrder,
    setViewingOrder,
    toasts,
    setToasts,
    confirmation,
    setConfirmation,
    lowStockThreshold,
    lowStockProducts,
    filteredProducts,
    filteredCustomers,
    filteredOrders,
    handleOpenAddProduct,
    handleOpenEditProduct,
    handleProductSubmit,
    handleProductDelete,
    handleOpenAddCustomer,
    handleCustomerSubmit,
    handleCustomerDelete,
    handleOpenAddOrder,
    handleAddOrderLineItem,
    handleRemoveOrderLineItem,
    handleOrderLineChange,
    calculateLiveTotal,
    handleOrderSubmit,
    handleOrderDelete
  } = useAppState();

  return (
    <div className="flex min-h-screen bg-obsidian-bg text-zinc-100 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] rounded-full bg-accent-indigo/5 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] rounded-full bg-accent-violet/5 blur-[120px] pointer-events-none animate-pulse-slow"></div>

      {/* ─── TOAST NOTIFICATIONS ─────────────────────────────────────────── */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} setToasts={setToasts} />
        ))}
      </div>

      {/* ─── SIDEBAR NAVIGATION ──────────────────────────────────────────── */}
      <aside className="w-64 bg-obsidian-card/75 backdrop-blur-md border-r border-white/5 flex flex-col justify-between shrink-0 relative z-10">
        <div>
          {/* Logo Branding */}
          <Sidebar />

          {/* Nav Links */}
          <Nav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10">

        {/* Header */}
        <header className="h-20 bg-obsidian-bg/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-semibold uppercase tracking-wider text-xs">Modules</span>
            <span className="text-zinc-700">/</span>
            <span className="text-accent-indigo font-bold text-xs uppercase tracking-widest bg-accent-indigo/10 px-2.5 py-1 rounded-md border border-accent-indigo/15">
              {activeTab}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 border border-white/5 hover:border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? "Refreshing..." : "Sync Database"}
            </button>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <div className="p-8 flex-1 overflow-y-auto">

          {/* ───────────────── VIEW: DASHBOARD ───────────────── */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-slide-in">
              {/* Analytics widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Total Products */}
                <Totalproduct products={products} />

                {/* Total Customers */}
                <Totalcustomer customers={customers} />

                {/* Total Orders */}
                <Totalorder orders={orders} />

                {/* Low Stock Alerts */}
                <LowstockAlert lowStockProducts={lowStockProducts} lowStockThreshold={lowStockThreshold} />

              </div>

              {/* Low stock alerts detail table */}
              <AlertDetail lowStockProducts={lowStockProducts} lowStockThreshold={lowStockThreshold} />
            </div>
          )}

          {/* ───────────────── VIEW: PRODUCTS ───────────────── */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-fade-slide-in">

              {/* Toolbar */}
              <ProductToolbar
                productSearch={productSearch}
                setProductSearch={setProductSearch}
                handleOpenAddProduct={handleOpenAddProduct}
              />

              {/* Products Table */}
              <ProductTable
                products={filteredProducts}
                handleOpenEditProduct={handleOpenEditProduct}
                handleProductDelete={handleProductDelete}
              />
            </div>
          )}

          {/* ───────────────── VIEW: CUSTOMERS ───────────────── */}
          {activeTab === "customers" && (
            <div className="space-y-6 animate-fade-slide-in">

              {/* Toolbar */}
              <CustomerToolbar
                customerSearch={customerSearch}
                setCustomerSearch={setCustomerSearch}
                handleOpenAddCustomer={handleOpenAddCustomer}
              />

              {/* Customers Table */}
              <CustomerTable
                filteredCustomers={filteredCustomers}
                handleCustomerDelete={handleCustomerDelete}
              />
            </div>
          )}

          {/* ───────────────── VIEW: ORDERS ───────────────── */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-fade-slide-in">

              {/* Toolbar */}
              <OrderToolbar
                orderSearch={orderSearch}
                setOrderSearch={setOrderSearch}
                onCreateOrder={handleOpenAddOrder}
              />

              {/* Orders Table */}
              <OrderTable
                orders={filteredOrders}
                onView={setViewingOrder}
                onDelete={handleOrderDelete}
              />
            </div>
          )}

        </div>
      </main>

      {/* ─── MODAL: PRODUCT (ADD/EDIT) ────────────────────────────────────── */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        editingProduct={editingProduct}
        productForm={productForm}
        setProductForm={setProductForm}
        onSubmit={handleProductSubmit}
      />

      {/* ─── MODAL: CUSTOMER (ADD) ────────────────────────────────────────── */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerForm={customerForm}
        setCustomerForm={setCustomerForm}
        onSubmit={handleCustomerSubmit}
      />

      {/* ─── MODAL: CREATE ORDER ─────────────────────────────────────────── */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        orderForm={orderForm}
        customers={customers}
        products={products}
        handleAddOrderLineItem={handleAddOrderLineItem}
        handleRemoveOrderLineItem={handleRemoveOrderLineItem}
        handleOrderLineChange={handleOrderLineChange}
        calculateLiveTotal={calculateLiveTotal}
        onSubmit={handleOrderSubmit}
      />

      {/* ─── MODAL: ORDER DETAILS ────────────────────────────────────────── */}
      <OrderDetailsModal
        order={viewingOrder}
        onClose={() => setViewingOrder(null)}
      />

      {/* ─── MODAL: CONFIRMATION ─────────────────────────────────────────── */}
      <ConfirmationModal
        isOpen={confirmation !== null}
        message={confirmation?.message}
        onConfirm={confirmation?.onConfirm}
        onCancel={() => setConfirmation(null)}
      />

    </div>
  );
};

export default App;
