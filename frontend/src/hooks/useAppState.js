import { useState, useEffect } from "react";
import { productService, customerService, orderService } from "../services/api";

export const useAppState = () => {
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

  // Confirmation Modal State
  const [confirmation, setConfirmation] = useState(null); // { message, onConfirm }

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

  const handleProductDelete = (id) => {
    setConfirmation({
      message: "Are you sure you want to delete this product?",
      onConfirm: async () => {
        setConfirmation(null);
        try {
          await productService.delete(id);
          showToast("Product deleted successfully.");
          fetchData();
        } catch (err) {
          showToast(err.response?.data?.detail || "Failed to delete product.", "error");
        }
      }
    });
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

  const handleCustomerDelete = (id) => {
    setConfirmation({
      message: "Are you sure you want to remove this customer? This will also remove their associated orders.",
      onConfirm: async () => {
        setConfirmation(null);
        try {
          await customerService.delete(id);
          showToast("Customer deleted successfully.");
          fetchData();
        } catch (err) {
          showToast(err.response?.data?.detail || "Failed to delete customer.", "error");
        }
      }
    });
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
    if (index === null) {
      setOrderForm((prev) => ({ ...prev, [field]: value }));
    } else {
      const updated = [...orderForm.items];
      updated[index][field] = value;
      setOrderForm((prev) => ({ ...prev, items: updated }));
    }
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

  const handleOrderDelete = (id) => {
    setConfirmation({
      message: "Are you sure you want to cancel/delete this order? Items will be returned to stock.",
      onConfirm: async () => {
        setConfirmation(null);
        try {
          await orderService.delete(id);
          showToast("Order deleted. Items returned to inventory.");
          fetchData();
        } catch (err) {
          showToast(err.response?.data?.detail || "Failed to delete order.", "error");
        }
      }
    });
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

  return {
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
    setOrderForm,
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
  };
};
