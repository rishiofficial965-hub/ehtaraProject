import React, { useState, useEffect } from "react";
import { 
  FiBox, 
  FiUsers, 
  FiShoppingCart, 
  FiPlus, 
  FiTrash2, 
  FiEdit2, 
  FiEye, 
  FiAlertTriangle, 
  FiX, 
  FiCheck, 
  FiInfo, 
  FiTrendingUp, 
  FiSearch
} from "react-icons/fi";
import { productService, customerService, orderService } from "./services/api";

const App = () => {
  // Navigation State: 'dashboard' | 'products' | 'customers' | 'orders'
  const [activeTab, setActiveTab] = useState("dashboard");

  // Data States
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search States
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");

  // Modals States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: "", sku: "", price: "", quantity: "" });

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({ full_name: "", email: "", phone: "" });

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customer_id: "",
    items: [{ product_id: "", quantity: 1 }]
  });

  const [viewingOrder, setViewingOrder] = useState(null);

  // Toast Notification State
  const [toasts, setToasts] = useState([]);

  // Fetch all data helper
  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, oRes] = await Promise.all([
        productService.getAll(),
        customerService.getAll(),
        orderService.getAll()
      ]);
      setProducts(pRes);
      setCustomers(cRes);
      setOrders(oRes);
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to load database records.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toast trigger
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // --- PRODUCT HANDLERS ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: "", sku: "", price: "", quantity: "" });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.sku || productForm.price === "" || productForm.quantity === "") {
      showToast("Please fill all fields.", "error");
      return;
    }
    const priceNum = parseFloat(productForm.price);
    const qtyNum = parseInt(productForm.quantity);
    if (isNaN(priceNum) || priceNum < 0) {
      showToast("Price must be a positive number.", "error");
      return;
    }
    if (isNaN(qtyNum) || qtyNum < 0) {
      showToast("Quantity must be a positive integer.", "error");
      return;
    }

    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, {
          name: productForm.name,
          sku: productForm.sku,
          price: priceNum,
          quantity: qtyNum
        });
        showToast("Product updated successfully.");
      } else {
        await productService.create({
          name: productForm.name,
          sku: productForm.sku,
          price: priceNum,
          quantity: qtyNum
        });
        showToast("Product created successfully.");
      }
      setIsProductModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || "Error saving product.", "error");
    }
  };

  const handleProductDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await productService.delete(id);
      showToast("Product deleted successfully.");
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to delete product.", "error");
    }
  };

  // --- CUSTOMER HANDLERS ---
  const handleOpenAddCustomer = () => {
    setCustomerForm({ full_name: "", email: "", phone: "" });
    setIsCustomerModalOpen(true);
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!customerForm.full_name || !customerForm.email || !customerForm.phone) {
      showToast("Please fill all fields.", "error");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerForm.email)) {
      showToast("Invalid email address format.", "error");
      return;
    }

    try {
      await customerService.create(customerForm);
      showToast("Customer created successfully.");
      setIsCustomerModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || "Error saving customer.", "error");
    }
  };

  const handleCustomerDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this customer? This will also remove their associated orders.")) return;
    try {
      await customerService.delete(id);
      showToast("Customer deleted successfully.");
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to delete customer.", "error");
    }
  };

  // --- ORDER HANDLERS ---
  const handleOpenAddOrder = () => {
    if (customers.length === 0) {
      showToast("Please add at least one customer first.", "error");
      return;
    }
    if (products.length === 0) {
      showToast("Please add at least one product first.", "error");
      return;
    }
    setOrderForm({
      customer_id: customers[0].id.toString(),
      items: [{ product_id: products[0].id.toString(), quantity: 1 }]
    });
    setIsOrderModalOpen(true);
  };

  const handleAddOrderLineItem = () => {
    setOrderForm((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: products[0].id.toString(), quantity: 1 }]
    }));
  };

  const handleRemoveOrderLineItem = (index) => {
    if (orderForm.items.length === 1) return;
    setOrderForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleOrderLineChange = (index, field, value) => {
    const updated = [...orderForm.items];
    updated[index][field] = value;
    setOrderForm((prev) => ({ ...prev, items: updated }));
  };

  const calculateLiveTotal = () => {
    let sum = 0;
    orderForm.items.forEach((item) => {
      const prod = products.find((p) => p.id.toString() === item.product_id);
      const qty = parseInt(item.quantity) || 0;
      if (prod) {
        sum += prod.price * qty;
      }
    });
    return sum.toFixed(2);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    if (!orderForm.customer_id) {
      showToast("Please select a customer.", "error");
      return;
    }

    const payloadItems = [];
    for (const item of orderForm.items) {
      if (!item.product_id) {
        showToast("Please select a product.", "error");
        return;
      }
      const qty = parseInt(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        showToast("Order quantities must be greater than 0.", "error");
        return;
      }
      payloadItems.push({
        product_id: parseInt(item.product_id),
        quantity: qty
      });
    }

    try {
      await orderService.create({
        customer_id: parseInt(orderForm.customer_id),
        items: payloadItems
      });
      showToast("Order placed successfully!");
      setIsOrderModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to submit order.", "error");
    }
  };

  const handleOrderDelete = async (id) => {
    if (!window.confirm("Are you sure you want to cancel/delete this order? Items will be returned to stock.")) return;
    try {
      await orderService.delete(id);
      showToast("Order deleted. Items returned to inventory.");
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to delete order.", "error");
    }
  };

  // Calculations
  const lowStockThreshold = 10;
  const lowStockProducts = products.filter((p) => p.quantity < lowStockThreshold);

  // Filters
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) => {
    const custName = o.customer_name || "";
    const orderIdStr = o.id.toString();
    const query = orderSearch.toLowerCase();
    return custName.toLowerCase().includes(query) || orderIdStr.includes(query);
  });

  return (
    <div className="flex min-h-screen bg-obsidian-bg text-zinc-100 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] rounded-full bg-accent-indigo/5 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] rounded-full bg-accent-violet/5 blur-[120px] pointer-events-none animate-pulse-slow"></div>

      {/* ─── TOAST NOTIFICATIONS ─────────────────────────────────────────── */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 ${
              toast.type === "error"
                ? "bg-accent-rose/10 border-accent-rose/20 text-accent-rose shadow-accent-rose/5"
                : "bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald shadow-accent-emerald/5"
            }`}
          >
            {toast.type === "error" ? (
              <FiAlertTriangle className="text-accent-rose animate-bounce" />
            ) : (
              <FiCheck className="text-accent-emerald" />
            )}
            <span className="text-sm font-semibold">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-2 hover:opacity-75 transition-opacity"
            >
              <FiX />
            </button>
          </div>
        ))}
      </div>

      {/* ─── SIDEBAR NAVIGATION ──────────────────────────────────────────── */}
      <aside className="w-64 bg-obsidian-card/75 backdrop-blur-md border-r border-white/5 flex flex-col justify-between shrink-0 relative z-10">
        <div>
          {/* Logo Branding */}
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="bg-gradient-to-tr from-accent-indigo to-accent-violet p-2.5 rounded-xl text-white shadow-lg shadow-accent-indigo/25">
              <FiTrendingUp className="text-xl" />
            </div>
            <div>
              <h1 className="font-display font-black text-lg tracking-wider bg-gradient-to-r from-zinc-100 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
                INVENIO
              </h1>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Control Center</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5">
            {[
              { id: "dashboard", label: "Dashboard", icon: FiTrendingUp },
              { id: "products", label: "Products Catalog", icon: FiBox },
              { id: "customers", label: "Customers", icon: FiUsers },
              { id: "orders", label: "Orders Tracking", icon: FiShoppingCart }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative group ${
                    isActive
                      ? "text-accent-indigo bg-accent-indigo/10 border border-accent-indigo/15"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-accent-indigo to-accent-violet rounded-r-full" />
                  )}
                  <Icon
                    className={`text-lg transition-transform group-hover:scale-110 ${
                      isActive ? "text-accent-indigo" : "text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Database Status Indicator */}
        <div className="p-4 border-t border-white/5">
          <div className="bg-white/5 border border-white/5 p-3.5 rounded-xl flex items-center gap-3">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                loading ? "bg-accent-amber animate-ping" : "bg-accent-emerald shadow-md shadow-accent-emerald/50"
              }`}
            ></span>
            <div>
              <p className="text-xs font-bold text-zinc-300">System Connected</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">PostgreSQL Online</p>
            </div>
          </div>
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
                <div className="glass-panel glass-panel-glow p-6 rounded-2xl relative overflow-hidden group hover:border-accent-indigo/20 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-indigo/5 rounded-full blur-2xl group-hover:bg-accent-indigo/10 transition-all duration-300"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Products</p>
                      <h3 className="text-4xl font-display font-extrabold mt-2 text-zinc-100 tracking-tight">{products.length}</h3>
                    </div>
                    <div className="bg-gradient-to-tr from-accent-indigo/10 to-accent-violet/10 text-accent-indigo border border-accent-indigo/20 p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110">
                      <FiBox className="text-xl" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-4">Unique SKU items</p>
                </div>

                {/* Total Customers */}
                <div className="glass-panel glass-panel-glow p-6 rounded-2xl relative overflow-hidden group hover:border-accent-indigo/20 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-indigo/5 rounded-full blur-2xl group-hover:bg-accent-indigo/10 transition-all duration-300"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Customers</p>
                      <h3 className="text-4xl font-display font-extrabold mt-2 text-zinc-100 tracking-tight">{customers.length}</h3>
                    </div>
                    <div className="bg-gradient-to-tr from-accent-indigo/10 to-accent-violet/10 text-accent-indigo border border-accent-indigo/20 p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110">
                      <FiUsers className="text-xl" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-4">Registered Profiles</p>
                </div>

                {/* Total Orders */}
                <div className="glass-panel glass-panel-glow p-6 rounded-2xl relative overflow-hidden group hover:border-accent-indigo/20 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-indigo/5 rounded-full blur-2xl group-hover:bg-accent-indigo/10 transition-all duration-300"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Orders</p>
                      <h3 className="text-4xl font-display font-extrabold mt-2 text-zinc-100 tracking-tight">{orders.length}</h3>
                    </div>
                    <div className="bg-gradient-to-tr from-accent-indigo/10 to-accent-violet/10 text-accent-indigo border border-accent-indigo/20 p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110">
                      <FiShoppingCart className="text-xl" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-4">Transactions Logged</p>
                </div>

                {/* Low Stock Alerts */}
                <div
                  className={`glass-panel p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 ${
                    lowStockProducts.length > 0
                      ? "border-accent-rose/30 hover:border-accent-rose/50"
                      : "glass-panel-glow hover:border-accent-indigo/20"
                  }`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-rose/5 rounded-full blur-2xl group-hover:bg-accent-rose/10 transition-all duration-300"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Low Stock Items</p>
                      <h3
                        className={`text-4xl font-display font-extrabold mt-2 tracking-tight ${
                          lowStockProducts.length > 0 ? "text-accent-rose animate-pulse" : "text-zinc-100"
                        }`}
                      >
                        {lowStockProducts.length}
                      </h3>
                    </div>
                    <div
                      className={`p-3.5 rounded-xl border transition-all duration-300 group-hover:scale-110 ${
                        lowStockProducts.length > 0
                          ? "bg-accent-rose/10 text-accent-rose border-accent-rose/25"
                          : "bg-gradient-to-tr from-accent-indigo/10 to-accent-violet/10 text-accent-indigo border border-accent-indigo/20"
                      }`}
                    >
                      <FiAlertTriangle className="text-xl" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-4">
                    Inventory Alert Level &lt; {lowStockThreshold}
                  </p>
                </div>

              </div>

              {/* Low stock alerts detail table */}
              <div className="glass-panel p-6 rounded-2xl">
                <div className="flex items-center gap-2.5 mb-6">
                  <FiAlertTriangle className="text-accent-rose text-xl" />
                  <h4 className="font-display font-bold text-zinc-200">Critical Stock Exceptions</h4>
                </div>
                {lowStockProducts.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 border border-dashed border-white/5 rounded-xl">
                    <p className="text-sm">All products have sufficient stock levels.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                          <th className="pb-3 pr-4 font-display">Product Name</th>
                          <th className="pb-3 px-4 font-display">SKU / Code</th>
                          <th className="pb-3 px-4 font-display text-right">Price</th>
                          <th className="pb-3 px-4 font-display text-right">In Stock</th>
                          <th className="pb-3 pl-4 text-right font-display">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {lowStockProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-white/5 transition-colors duration-150">
                            <td className="py-3.5 pr-4 font-bold text-zinc-200">{p.name}</td>
                            <td className="py-3.5 px-4 font-mono text-xs text-zinc-400">{p.sku}</td>
                            <td className="py-3.5 px-4 text-right text-zinc-300 font-semibold">${p.price.toFixed(2)}</td>
                            <td className="py-3.5 px-4 text-right text-accent-rose font-bold">{p.quantity} units</td>
                            <td className="py-3.5 pl-4 text-right">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-accent-rose/10 text-accent-rose border border-accent-rose/15 uppercase tracking-wide">
                                {p.quantity === 0 ? "Out of Stock" : "Restock Needed"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ───────────────── VIEW: PRODUCTS ───────────────── */}
          {activeTab === "products" && (
            <div className="space-y-6 animate-fade-slide-in">

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
                    <FiSearch />
                  </span>
                  <input
                    type="text"
                    placeholder="Search catalog by name/SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo transition-all font-semibold"
                  />
                </div>
                <button
                  onClick={handleOpenAddProduct}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-accent-indigo to-accent-violet hover:scale-[1.02] active:scale-[0.98] text-white px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-accent-indigo/15"
                >
                  <FiPlus className="stroke-[3]" /> Add Product
                </button>
              </div>

              {/* Products Table */}
              <div className="glass-panel border-white/5 rounded-2xl overflow-hidden">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16 text-zinc-500">
                    <FiBox className="text-5xl mx-auto mb-4 opacity-30 text-accent-indigo animate-pulse" />
                    <p className="text-sm font-bold text-zinc-300">No products found</p>
                    <p className="text-xs text-zinc-500 mt-1">Register a product to start building your catalog.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                          <th className="py-4 px-6 font-display">Product Name</th>
                          <th className="py-4 px-6 font-display">SKU / Code</th>
                          <th className="py-4 px-6 text-right font-display">Price</th>
                          <th className="py-4 px-6 text-right font-display">Quantity</th>
                          <th className="py-4 px-6 text-center font-display">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-white/5 transition-colors duration-150">
                            <td className="py-4 px-6 font-bold text-zinc-200">{p.name}</td>
                            <td className="py-4 px-6 font-mono text-xs text-zinc-400 font-semibold">{p.sku}</td>
                            <td className="py-4 px-6 text-right text-zinc-200 font-semibold">${p.price.toFixed(2)}</td>
                            <td className={`py-4 px-6 text-right font-extrabold ${p.quantity < 10 ? "text-accent-rose" : "text-zinc-300"}`}>
                              {p.quantity}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="p-2 hover:bg-accent-indigo/10 text-accent-indigo rounded-xl transition-all hover:scale-110"
                                  title="Edit Product"
                                >
                                  <FiEdit2 />
                                </button>
                                <button
                                  onClick={() => handleProductDelete(p.id)}
                                  className="p-2 hover:bg-accent-rose/10 text-accent-rose rounded-xl transition-all hover:scale-110"
                                  title="Delete Product"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ───────────────── VIEW: CUSTOMERS ───────────────── */}
          {activeTab === "customers" && (
            <div className="space-y-6 animate-fade-slide-in">

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
                    <FiSearch />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo transition-all font-semibold"
                  />
                </div>
                <button
                  onClick={handleOpenAddCustomer}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-accent-indigo to-accent-violet hover:scale-[1.02] active:scale-[0.98] text-white px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-accent-indigo/15"
                >
                  <FiPlus className="stroke-[3]" /> Add New Customer
                </button>
              </div>

              {/* Customers Table */}
              <div className="glass-panel border-white/5 rounded-2xl overflow-hidden">
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-16 text-zinc-500">
                    <FiUsers className="text-5xl mx-auto mb-4 opacity-30 text-accent-indigo animate-pulse" />
                    <p className="text-sm font-bold text-zinc-300">No customers found</p>
                    <p className="text-xs text-zinc-500 mt-1">Register a customer to begin processing orders.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                          <th className="py-4 px-6 font-display">Customer Name</th>
                          <th className="py-4 px-6 font-display">Email Address</th>
                          <th className="py-4 px-6 font-display">Phone Number</th>
                          <th className="py-4 px-6 text-center font-display">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {filteredCustomers.map((c) => (
                          <tr key={c.id} className="hover:bg-white/5 transition-colors duration-150">
                            <td className="py-4 px-6 font-bold text-zinc-200">{c.full_name}</td>
                            <td className="py-4 px-6 text-zinc-300 font-mono text-xs font-semibold">{c.email}</td>
                            <td className="py-4 px-6 text-zinc-300 font-semibold">{c.phone}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={() => handleCustomerDelete(c.id)}
                                  className="p-2 hover:bg-accent-rose/10 text-accent-rose rounded-xl transition-all hover:scale-110"
                                  title="Delete Customer"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ───────────────── VIEW: ORDERS ───────────────── */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-fade-slide-in">

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
                    <FiSearch />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by ID or customer..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo transition-all font-semibold"
                  />
                </div>
                <button
                  onClick={handleOpenAddOrder}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-accent-indigo to-accent-violet hover:scale-[1.02] active:scale-[0.98] text-white px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-accent-indigo/15"
                >
                  <FiPlus className="stroke-[3]" /> Create Order
                </button>
              </div>

              {/* Orders Table */}
              <div className="glass-panel border-white/5 rounded-2xl overflow-hidden">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16 text-zinc-500">
                    <FiShoppingCart className="text-5xl mx-auto mb-4 opacity-30 text-accent-indigo animate-pulse" />
                    <p className="text-sm font-bold text-zinc-300">No orders found</p>
                    <p className="text-xs text-zinc-500 mt-1">Place an order to start tracking stock reduction.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                          <th className="py-4 px-6 font-display">Order ID</th>
                          <th className="py-4 px-6 font-display">Customer</th>
                          <th className="py-4 px-6 font-display">Date</th>
                          <th className="py-4 px-6 text-right font-display">Total Amount</th>
                          <th className="py-4 px-6 text-center font-display">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {filteredOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-white/5 transition-colors duration-150">
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-accent-violet/10 text-accent-violet border border-accent-violet/15">
                                #ORD-{o.id}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-bold text-zinc-200">{o.customer_name}</td>
                            <td className="py-4 px-6 text-zinc-400 font-semibold">
                              {new Date(o.created_at).toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-right text-accent-emerald font-extrabold">
                              ${o.total_amount.toFixed(2)}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setViewingOrder(o)}
                                  className="p-2 hover:bg-accent-indigo/10 text-accent-indigo rounded-xl transition-all hover:scale-110"
                                  title="View Details"
                                >
                                  <FiEye />
                                </button>
                                <button
                                  onClick={() => handleOrderDelete(o.id)}
                                  className="p-2 hover:bg-accent-rose/10 text-accent-rose rounded-xl transition-all hover:scale-110"
                                  title="Cancel Order"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ─── MODAL: PRODUCT (ADD/EDIT) ────────────────────────────────────── */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-obsidian-bg/85 backdrop-blur-md z-40 flex items-center justify-center p-4">
          <div className="glass-panel glass-panel-glow w-full max-w-md shadow-2xl p-6 rounded-2xl relative animate-fade-slide-in">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <FiX className="text-xl" />
            </button>
            <h2 className="text-lg font-display font-bold text-zinc-100 mb-6">
              {editingProduct ? "Edit Product Specifications" : "Register New Product"}
            </h2>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-display">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Leather Executive Chair"
                  className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-display">
                  SKU / Code
                </label>
                <input
                  type="text"
                  required
                  disabled={editingProduct !== null}
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  placeholder="e.g. FURN-CH-002"
                  className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo disabled:opacity-40 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-mono font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-display">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="129.99"
                    className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-display">
                    Stock Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.quantity}
                    onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                    placeholder="50"
                    className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-semibold"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-zinc-300 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-accent-indigo to-accent-violet text-white rounded-xl text-sm font-bold shadow-lg shadow-accent-indigo/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Save Specs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CUSTOMER (ADD) ────────────────────────────────────────── */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-obsidian-bg/85 backdrop-blur-md z-40 flex items-center justify-center p-4">
          <div className="glass-panel glass-panel-glow w-full max-w-md shadow-2xl p-6 rounded-2xl relative animate-fade-slide-in">
            <button
              onClick={() => setIsCustomerModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <FiX className="text-xl" />
            </button>
            <h2 className="text-lg font-display font-bold text-zinc-100 mb-6">Register New Customer</h2>
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-display">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customerForm.full_name}
                  onChange={(e) => setCustomerForm({ ...customerForm, full_name: e.target.value })}
                  placeholder="e.g. Alice Smith"
                  className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-display">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  placeholder="alice@domain.com"
                  className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-display">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-semibold"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-zinc-300 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-accent-indigo to-accent-violet text-white rounded-xl text-sm font-bold shadow-lg shadow-accent-indigo/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Register Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE ORDER ─────────────────────────────────────────── */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-obsidian-bg/85 backdrop-blur-md z-40 flex items-center justify-center p-4">
          <div className="glass-panel glass-panel-glow w-full max-w-2xl shadow-2xl p-6 rounded-2xl relative max-h-[90vh] flex flex-col animate-fade-slide-in">
            <button
              onClick={() => setIsOrderModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <FiX className="text-xl" />
            </button>

            <h2 className="text-lg font-display font-bold text-zinc-100 mb-6 shrink-0">Compile New Order</h2>

            <form onSubmit={handleOrderSubmit} className="flex-1 flex flex-col min-h-0 space-y-5">

              {/* Customer Selector */}
              <div className="shrink-0">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 font-display">
                  Target Customer
                </label>
                <select
                  value={orderForm.customer_id}
                  onChange={(e) => setOrderForm({ ...orderForm, customer_id: e.target.value })}
                  className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none transition-all font-semibold"
                >
                  {customers.map((c) => (
                    <option key={c.id} className="bg-obsidian-panel text-zinc-200" value={c.id}>
                      {c.full_name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Section */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-display">Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddOrderLineItem}
                    className="flex items-center gap-1.5 text-xs text-accent-indigo hover:text-accent-indigo/80 font-bold transition-all"
                  >
                    <FiPlus /> Add Item Row
                  </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                  {orderForm.items.map((line, index) => {
                    const selectedProduct = products.find((p) => p.id.toString() === line.product_id);
                    return (
                      <div key={index} className="flex gap-4 items-end bg-black/20 border border-white/5 p-4 rounded-xl">
                        <div className="flex-1">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-display">
                            Product
                          </label>
                          <select
                            value={line.product_id}
                            onChange={(e) => handleOrderLineChange(index, "product_id", e.target.value)}
                            className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none transition-all font-semibold"
                          >
                            {products.map((p) => (
                              <option key={p.id} className="bg-obsidian-panel text-zinc-200" value={p.id}>
                                {p.name} - ${p.price.toFixed(2)} ({p.quantity} in stock)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-display">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={line.quantity}
                            onChange={(e) => handleOrderLineChange(index, "quantity", e.target.value)}
                            className="w-full bg-black/40 border border-white/5 focus:border-accent-indigo focus:ring-1 focus:ring-accent-indigo rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none transition-all font-semibold"
                          />
                        </div>
                        <div className="w-24 text-right shrink-0">
                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-display">Subtotal</p>
                          <p className="text-xs font-bold text-zinc-300">
                            ${((selectedProduct?.price || 0) * (parseInt(line.quantity) || 0)).toFixed(2)}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={orderForm.items.length === 1}
                          onClick={() => handleRemoveOrderLineItem(index)}
                          className="p-2 hover:bg-white/5 text-accent-rose disabled:opacity-30 rounded-xl transition-all mb-0.5"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary and Actions */}
              <div className="shrink-0 border-t border-white/5 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-display">Estimated Total</p>
                  <p className="text-2xl font-display font-extrabold text-accent-emerald">${calculateLiveTotal()}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOrderModalOpen(false)}
                    className="px-4 py-2 bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-zinc-300 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-accent-indigo to-accent-violet text-white rounded-xl text-sm font-bold shadow-lg shadow-accent-indigo/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Submit Order
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ORDER DETAILS ────────────────────────────────────────── */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-obsidian-bg/85 backdrop-blur-md z-40 flex items-center justify-center p-4">
          <div className="glass-panel glass-panel-glow w-full max-w-xl shadow-2xl p-6 rounded-2xl relative animate-fade-slide-in">
            <button
              onClick={() => setViewingOrder(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <FiX className="text-xl" />
            </button>

            <h2 className="text-lg font-display font-bold text-zinc-100 mb-2">Order Details</h2>
            <p className="text-xs font-mono text-accent-violet mb-6 font-bold bg-accent-violet/10 border border-accent-violet/15 px-2 py-0.5 rounded-lg inline-block">
              #ORD-{viewingOrder.id}
            </p>

            <div className="grid grid-cols-2 gap-4 bg-white/5 border border-white/5 p-4 rounded-xl mb-6 text-xs">
              <div>
                <p className="font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-display">Customer</p>
                <p className="font-bold text-zinc-200 text-sm">{viewingOrder.customer_name}</p>
              </div>
              <div>
                <p className="font-bold text-zinc-500 uppercase tracking-widest mb-1.5 font-display">Order Date</p>
                <p className="font-bold text-zinc-200 text-sm">{new Date(viewingOrder.created_at).toLocaleString()}</p>
              </div>
            </div>

            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 font-display">Purchased Items</h4>
            <div className="border border-white/5 rounded-xl overflow-hidden max-h-60 overflow-y-auto scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-4 font-display">Product Name (SKU)</th>
                    <th className="py-2.5 px-4 text-right font-display">Unit Price</th>
                    <th className="py-2.5 px-4 text-right font-display">Qty</th>
                    <th className="py-2.5 px-4 text-right font-display">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {viewingOrder.items.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-zinc-200">
                        {item.product_name || `Product ID ${item.product_id}`}
                        {item.product_sku && (
                          <span className="block text-[10px] font-mono text-zinc-500 mt-0.5 font-semibold">
                            {item.product_sku}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">${(item.product_price || 0).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-bold text-zinc-100">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-zinc-200 font-extrabold">
                        ${((item.product_price || 0) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-6 border-t border-white/5 pt-4">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-display">Total Charge</p>
                <p className="text-2xl font-display font-extrabold text-accent-emerald">
                  ${viewingOrder.total_amount.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="px-5 py-2.5 bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-zinc-200 rounded-xl text-xs font-bold tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default App;
