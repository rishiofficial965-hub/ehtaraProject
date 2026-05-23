import { useCart } from "../hook/useCart";
import Nav from "../../products/components/Nav";
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaShieldAlt, FaTruck, FaTag, FaCheck, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loader from "../../auth/components/Loader";
import { useToast } from "../../common/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { useRazorpay } from "react-razorpay";

const FREE_SHIPPING_THRESHOLD = 999;

const CartPage = () => {
  const navigate = useNavigate();
  const { error, isLoading, Razorpay } = useRazorpay();
  const { cart, loading, handleGetCart, handleUpdateQuantity, handleRemoveFromCart ,handleCreateOrder, handleVerifyPayment} = useCart();
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => {
    if (user) {
      handleGetCart();
    }
  }, [user]);
   const handlePayment = async () => {
    if(!cart) return;
    const res = await handleCreateOrder();
    if(!res.success){
      return;
    }
    const order = res.order;
    const options = {
      key: "rzp_test_ShNSkpxt3emQVJ",
      amount: order.amount, 
      currency: order.currency,
      name: "Snitch",
      description: "Test Transaction",
      order_id: order.id, 
      handler: async (response) => {
        const verifyRes = await handleVerifyPayment({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });

        if (verifyRes.success) {
          toast.success("Payment successful! Your order has been placed.");
          navigate("/");
        } else {
          toast.error(verifyRes.error || "Payment verification failed.");
        }
      },
      prefill: {
        name: user.fullname,
        email: user.email,
        contact: user.contact,
      },
      theme: { 
        color: "#F37254",
      },
    };

    const razorpayInstance = new Razorpay(options);
    razorpayInstance.open();
  }

  if (loading) return <Loader />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-desert-khaki/30 flex flex-col font-sans">
        <Nav />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 bg-lacquered-licorice/5 rounded-full flex items-center justify-center mb-6 border border-lacquered-licorice/10">
            <svg className="w-8 h-8 text-lacquered-licorice/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-lacquered-licorice mb-3 tracking-tight uppercase">
            Your Bag is Empty
          </h1>
          <p className="text-lacquered-licorice/50 mb-8 text-sm leading-relaxed">
            Discover our latest drops and find something that suits your style. 
            The street is waiting for you.
          </p>
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 bg-lacquered-licorice text-albescent-white px-8 py-3.5 rounded-xl font-bold tracking-wider text-xs hover:bg-copper-green transition-all duration-300"
          >
            DISCOVER NOW
            <FaArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-desert-khaki/30 font-sans text-lacquered-licorice">
      <Nav />
      <main className="container mx-auto max-w-6xl px-6 py-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-lacquered-licorice/40 hover:text-copper-green transition-colors mb-6 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Continue Shopping
        </button>

        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold tracking-tight uppercase">
            Shopping <span className="text-copper-green">Bag</span>
          </h1>
          <div className="h-px flex-1 bg-lacquered-licorice/10 ml-2"></div>
          <span className="text-[10px] font-bold bg-lacquered-licorice text-albescent-white px-3 py-1 rounded-full tracking-wider leading-none">
            {cart.totalItems || 0} ITEMS
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {cart.items.filter((item) => item.product != null).map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  key={`${item.product?._id}-${item.variant}`}
                  className="group relative flex flex-col sm:flex-row gap-5 p-5 bg-white rounded-2xl border border-lacquered-licorice/10 transition-all duration-300 hover:border-copper-green/30"
                >
                  {/* Image Column */}
                  <div className="w-24 h-32 bg-desert-khaki/10 rounded-xl overflow-hidden border border-lacquered-licorice/5 shrink-0">
                    <img
                      src={item.image}
                      alt={item.product?.title || "Product"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-copper-green mb-0.5">
                            {item.product?.brand || "Snitch"}
                          </p>
                          <h3 className="text-lg font-bold tracking-tight text-lacquered-licorice leading-snug">
                            {item.product?.title || "Product"}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart({ productId: item.product?._id, varientId: item.variant })}
                          className="p-2 rounded-xl bg-lacquered-licorice/5 text-lacquered-licorice/40 hover:bg-red-50 hover:text-red-500 transition-colors transform active:scale-95 cursor-pointer"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>

                      {/* Display Variant attributes */}
                      {(() => {
                        const currentVariant = item.product?.variants?.find(
                          (v) => (v._id || v.id)?.toString() === item.variant?.toString()
                        );
                        const attributes = currentVariant?.attributes;
                        return attributes && Object.keys(attributes).length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(attributes).map(([key, val]) => (
                              <span key={key} className="px-2 py-0.5 bg-desert-khaki/20 border border-lacquered-licorice/10 rounded text-[10px] font-bold text-lacquered-licorice/70 uppercase tracking-wider">
                                {key}: {val}
                              </span>
                            ))}
                          </div>
                        ) : null;
                      })()}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mt-4 border-t border-lacquered-licorice/5">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-lacquered-licorice/40 uppercase tracking-widest">QTY</span>
                        <div className="flex items-center bg-desert-khaki/10 rounded-xl border border-lacquered-licorice/10 p-0.5 w-fit">
                          <button
                            disabled={loading}
                            onClick={() => item.quantity > 1 && handleUpdateQuantity({ productId: item.product?._id, varientId: item.variant, quantity: item.quantity - 1 })}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm text-lacquered-licorice/50 hover:text-lacquered-licorice transition-all disabled:opacity-40"
                          >
                            <FaMinus size={8} />
                          </button>
                          <span className="text-xs font-black min-w-[2rem] text-center tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            disabled={loading}
                            onClick={() => handleUpdateQuantity({ productId: item.product?._id, varientId: item.variant, quantity: item.quantity + 1 })}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm text-lacquered-licorice/50 hover:text-lacquered-licorice transition-all disabled:opacity-40"
                          >
                            <FaPlus size={8} />
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-bold text-lacquered-licorice/40 uppercase tracking-widest">Subtotal</span>
                        <span className="text-xl font-extrabold tracking-tight tabular-nums text-lacquered-licorice">
                          {item.price?.currency || "INR"} {((item.price?.amount || 0) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-4">
            <div className="bg-lacquered-licorice text-albescent-white p-7 rounded-2xl border border-lacquered-licorice/20 relative overflow-hidden">
              <h2 className="text-xl font-bold uppercase tracking-tight border-b border-white/10 pb-4 mb-6">
                Order Details
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-white/50">Bag Total</span>
                  <span className="font-bold tabular-nums">INR {(cart.totalAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-white/50">Shipping</span>
                  <span className="text-xs font-bold text-copper-green tracking-wider italic">
                    <span className="line-through text-white/20 mr-1.5 font-bold">INR 99</span>FREE
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-white/50">Insurance</span>
                  <span className="text-[10px] font-bold text-white/40 tracking-wider">COMPLIMENTARY</span>
                </div>
                
                <div className="h-px bg-white/10 my-4" />
                
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-playing-hooky">Total Amount</span>
                  <div className="text-right">
                    <span className="text-2xl font-black tracking-tight block leading-none mb-1 tabular-nums">INR {(cart.totalAmount || 0).toLocaleString()}</span>
                    <span className="text-[9px] font-medium text-white/30 uppercase tracking-wider">inclusive of all taxes</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handlePayment}
                  className="w-full bg-copper-green text-albescent-white py-4 rounded-xl font-bold tracking-widest text-[11px] hover:bg-playing-hooky hover:text-lacquered-licorice transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 uppercase cursor-pointer"
                >
                  SECURE CHECKOUT
                  <FaArrowLeft className="rotate-180" />
                </button>
                <div className="flex items-center justify-center gap-6 pt-2 text-white/30">
                  <div className="flex items-center gap-1.5">
                    <FaShieldAlt size={10} />
                    <span className="text-[8px] font-bold uppercase tracking-wider">Secure</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaTruck size={10} />
                    <span className="text-[8px] font-bold uppercase tracking-wider">Tracked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="border border-lacquered-licorice/10 rounded-2xl bg-white overflow-hidden">
              <button
                onClick={() => setPromoOpen((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-lacquered-licorice/3 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FaTag size={12} className="text-copper-green" />
                  <div className="text-left">
                    <p className="text-xs font-bold uppercase tracking-wider">{promoApplied ? "Promo Applied 🎉" : "Apply Promo Code"}</p>
                    {promoApplied && <p className="text-[9px] text-copper-green font-bold mt-0.5">{promoCode} — 10% off</p>}
                  </div>
                </div>
                <FaChevronRight size={10} className={`text-lacquered-licorice/30 transition-transform duration-300 ${promoOpen ? "rotate-90" : ""}`} />
              </button>
              {promoOpen && (
                <div className="px-5 pb-5 flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter code..."
                    className="flex-1 bg-desert-khaki/20 border border-lacquered-licorice/10 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-copper-green"
                  />
                  <button
                    onClick={() => { if (promoCode === "SNITCH10") { setPromoApplied(true); setPromoOpen(false); } }}
                    className="bg-lacquered-licorice text-albescent-white px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-copper-green transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {promoApplied ? <FaCheck size={10} /> : null} Apply
                  </button>
                </div>
              )}
            </div>

            {/* Free shipping progress */}
            {(cart.totalAmount || 0) < FREE_SHIPPING_THRESHOLD && (
              <div className="bg-copper-green/5 border border-copper-green/10 rounded-2xl px-5 py-4">
                <p className="text-[9px] font-bold uppercase tracking-wider text-copper-green mb-2">
                  Add INR {(FREE_SHIPPING_THRESHOLD - (cart.totalAmount || 0)).toLocaleString()} more for free shipping
                </p>
                <div className="w-full h-1.5 bg-copper-green/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-copper-green rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, ((cart.totalAmount || 0) / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CartPage;
