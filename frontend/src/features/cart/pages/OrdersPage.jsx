import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hook/useCart";
import Nav from "../../products/components/Nav";
import Loader from "../../auth/components/Loader.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaBox,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaReceipt,
} from "react-icons/fa";

const statusConfig = {
  paid: {
    label: "Paid",
    icon: FaCheckCircle,
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
  },
  pending: {
    label: "Pending",
    icon: FaClock,
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
  },
  failed: {
    label: "Failed",
    icon: FaTimesCircle,
    bg: "bg-red-50",
    text: "text-red-500",
    border: "border-red-100",
  },
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const { handleGetMyOrders } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await handleGetMyOrders();
      if (res.success) setOrders(res.orders || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-desert-khaki/30 font-sans text-lacquered-licorice">
      <Nav />

      <main className="container mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-lacquered-licorice/40 hover:text-copper-green transition-colors mb-6 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold tracking-tight uppercase">
            My <span className="text-copper-green">Orders</span>
          </h1>
          <div className="h-px flex-1 bg-lacquered-licorice/10 ml-2" />
          <span className="text-[10px] font-bold bg-lacquered-licorice text-albescent-white px-3 py-1 rounded-full tracking-wider leading-none">
            {orders.length} ORDERS
          </span>
        </div>

        {/* Empty state */}
        {!loading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-lacquered-licorice/5 rounded-full flex items-center justify-center mb-6 border border-lacquered-licorice/10">
              <FaBox size={24} className="text-lacquered-licorice/30" />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">
              No Orders Yet
            </h2>
            <p className="text-lacquered-licorice/50 text-sm mb-6 max-w-xs">
              Once you make a purchase, your orders will appear here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="group flex items-center gap-2 bg-lacquered-licorice text-albescent-white px-8 py-3.5 rounded-xl font-bold tracking-wider text-xs hover:bg-copper-green transition-all duration-300"
            >
              SHOP NOW
              <FaArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Orders list */}
        {!loading && orders.length > 0 && (
          <AnimatePresence>
            <div className="space-y-4">
              {orders.map((order, i) => {
                const cfg = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = cfg.icon;
                const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-lacquered-licorice/10 overflow-hidden hover:border-copper-green/30 transition-all duration-300 shadow-sm"
                  >
                    {/* Order header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-lacquered-licorice/10">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-copper-green/10 rounded-xl flex items-center justify-center">
                          <FaReceipt size={14} className="text-copper-green" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-lacquered-licorice/30 mb-0.5">
                            Order ID
                          </p>
                          <p className="text-xs font-bold text-lacquered-licorice font-mono truncate max-w-[200px]">
                            {order.razorpay?.order_id || order._id}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-lacquered-licorice/30 mb-0.5">
                            Date
                          </p>
                          <p className="text-xs font-bold">{date}</p>
                        </div>
                        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg ${cfg.bg} ${cfg.border} border`}>
                          <StatusIcon size={10} className={cfg.text} />
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${cfg.text}`}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order items */}
                    {order.orderSnapshot && order.orderSnapshot.length > 0 && (
                      <div className="px-6 py-4 space-y-3">
                        {order.orderSnapshot.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            {item.image ? (
                              <div className="w-14 h-18 rounded-lg overflow-hidden bg-desert-khaki/20 border border-lacquered-licorice/5 shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-14 h-18 rounded-lg bg-desert-khaki/20 border border-lacquered-licorice/5 flex items-center justify-center shrink-0">
                                <FaBox size={16} className="text-lacquered-licorice/20" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm uppercase tracking-tight truncate">
                                {item.title}
                              </p>
                              <p className="text-[10px] text-lacquered-licorice/40 font-bold mt-0.5">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="font-bold text-sm text-copper-green shrink-0">
                              {item.price?.currency} {((item.price?.amount || 0) * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Order footer total */}
                    <div className="px-6 py-4 bg-desert-khaki/5 border-t border-lacquered-licorice/10 flex justify-between items-center">
                      <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-lacquered-licorice/40">
                        Total Paid
                      </p>
                      <p className="text-xl font-bold tracking-tight text-lacquered-licorice">
                        {order.price?.currency}{" "}
                        {Number(order.price?.amount || 0).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;
