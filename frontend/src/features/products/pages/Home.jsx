import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProduct } from "../hooks/useProduct";
import { useCart } from "../../cart/hook/useCart";
import Nav from "../components/Nav";
import Loader from "../../auth/components/Loader.jsx";
import {
  FaShoppingBag,
  FaHeart,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaFire,
  FaStar,
  FaTag,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../common/Toast";

const PRODUCTS_PER_PAGE = 10;
const GENDERS = ["All", "Men", "Women", "Unisex", "Kids"];

const Home = () => {
  const { products, loading } = useSelector((state) => state.product);
  const user = useSelector((state) => state.auth.user);
  const { handleGetAllProducts } = useProduct();
  const { handleAddToCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const [searchParams] = useSearchParams();
  const [addingId, setAddingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeGender, setActiveGender] = useState("All");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  // Sync URL ?q= param into searchQuery
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchQuery(q);
    setCurrentPage(1);
    if (q) document.getElementById("trending-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [searchParams]);

  // Derive unique categories dynamically from products
  const categories = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];

  // Client-side filter + search
  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchGender = activeGender === "All" || p.gender === activeGender;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.title?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q);
    return matchCat && matchGender && matchSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const applyFilter = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (p) => {
    setCurrentPage(p);
    document.getElementById("trending-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleQuickAdd = async (e, product) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    const firstVariantId = product?.variants?.[0]?._id;
    if (!firstVariantId || !product) { toast.error("This product is currently unavailable."); return; }
    setAddingId(product._id);
    const res = await handleAddToCart({ productId: product._id, varientId: firstVariantId, quantity: 1 });
    setAddingId(null);
    if (res.success) toast.success(`${product.title} added to bag!`);
    else toast.error(res.error || "Could not add to bag.");
  };

  useEffect(() => { handleGetAllProducts(); }, []);
  useEffect(() => { if (user?.role === "seller") navigate("/seller/dashboard"); }, [user, navigate]);

  if (loading && products.length === 0) return <Loader />;

  return (
    <div className="min-h-screen bg-albescent-white flex flex-col font-sans">
      <Nav />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-lacquered-licorice min-h-[75vh] flex items-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center opacity-15" />
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-copper-green/25 to-transparent" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-playing-hooky/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
          <div className="animate-drop-bounce">
            <div className="flex items-center gap-2 mb-6">
              <FaFire className="text-orange-400" size={14} />
              <span className="text-[11px] font-black tracking-[0.3em] uppercase text-copper-green border border-copper-green/30 px-3 py-1 rounded-full">
                New Collection · SS 2026
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-albescent-white tracking-tighter leading-none mb-6">
              DRESS THE
              <br />
              <span className="text-playing-hooky italic">STREETS.</span>
            </h1>
            <p className="text-albescent-white/50 text-base max-w-md mb-10 font-medium leading-relaxed">
              Premium streetwear crafted for those who move with intent. Bold cuts, quality fabrics, and fits that do the talking.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => document.getElementById("trending-section")?.scrollIntoView({ behavior: "smooth" })}
                className="group flex items-center gap-3 bg-albescent-white text-lacquered-licorice px-8 py-4 rounded-full font-black text-xs tracking-widest uppercase hover:bg-copper-green hover:text-albescent-white transition-all duration-500 shadow-2xl"
              >
                Shop Now
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" size={12} />
              </button>
              <button
                onClick={() => navigate("/")}
                className="text-xs font-black tracking-widest uppercase text-albescent-white/40 hover:text-albescent-white transition-colors underline underline-offset-4"
              >
                View Lookbook
              </button>
            </div>
          </div>

          <div className="hidden lg:flex justify-end">
            <div className="relative">
              <div className="w-[380px] h-[520px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=600"
                  alt="Model"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lacquered-licorice/70 via-transparent to-transparent" />
              </div>
              <div className="absolute -left-8 top-1/3 bg-white rounded-2xl p-4 shadow-2xl flex items-center gap-3">
                <FaStar className="text-yellow-400" />
                <div>
                  <p className="text-[10px] font-black text-lacquered-licorice uppercase tracking-widest">Top Rated</p>
                  <p className="text-[9px] text-lacquered-licorice/40 font-medium">4.9 · 2.4k reviews</p>
                </div>
              </div>
              <div className="absolute -right-4 bottom-16 bg-copper-green rounded-2xl px-4 py-3 shadow-2xl">
                <p className="text-[9px] font-black text-albescent-white uppercase tracking-widest">New Drop</p>
                <p className="text-xs font-black text-albescent-white">SS '26 ✦</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search & Filter Bar ──────────────────────────────────────────── */}
      <section id="trending-section" className="scroll-mt-20 pt-16 pb-0 container mx-auto px-6 max-w-7xl">
        {/* Search input */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <FaSearch size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-lacquered-licorice/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { applyFilter(setSearchQuery, e.target.value); }}
              placeholder="Search by name, brand, category..."
              className="w-full bg-white border border-lacquered-licorice/10 rounded-full pl-10 pr-10 py-3 text-xs font-bold text-lacquered-licorice placeholder:text-lacquered-licorice/30 focus:outline-none focus:border-copper-green/40 focus:ring-2 focus:ring-copper-green/10 shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => applyFilter(setSearchQuery, "")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-lacquered-licorice/30 hover:text-lacquered-licorice transition-colors"
              >
                <FaTimes size={10} />
              </button>
            )}
          </div>

          {/* Gender pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {GENDERS.map((g) => (
              <button
                key={g}
                onClick={() => applyFilter(setActiveGender, g)}
                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 border ${
                  activeGender === g
                    ? "bg-lacquered-licorice text-albescent-white border-lacquered-licorice"
                    : "bg-white text-lacquered-licorice/50 border-lacquered-licorice/10 hover:border-lacquered-licorice/30"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Category pills */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap mb-10 overflow-x-auto scrollbar-hide pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => applyFilter(setActiveCategory, cat)}
                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 shrink-0 border ${
                  activeCategory === cat
                    ? "bg-copper-green text-albescent-white border-copper-green"
                    : "bg-white text-lacquered-licorice/50 border-lacquered-licorice/10 hover:border-copper-green/30 hover:text-copper-green"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Section heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-copper-green mb-3">— Collection</p>
            <h2 className="text-4xl font-black text-lacquered-licorice tracking-tighter italic uppercase">
              Trending <span className="text-copper-green">Now</span>
            </h2>
          </div>
          <p className="text-[11px] font-bold text-lacquered-licorice/30 uppercase tracking-widest">
            {filteredProducts.length} styles available
          </p>
        </div>

        {/* Empty search state */}
        {filteredProducts.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-2xl font-black uppercase italic tracking-tight mb-2">No Results Found</h3>
            <p className="text-lacquered-licorice/40 text-sm font-medium mb-6">
              No products match your current filters.
            </p>
            <button
              onClick={() => { applyFilter(setSearchQuery, ""); applyFilter(setActiveCategory, "All"); applyFilter(setActiveGender, "All"); }}
              className="text-[10px] font-black uppercase tracking-widest text-copper-green hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Product Grid */}
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-10">
          <AnimatePresence mode="popLayout">
            {paginatedProducts.map((product, i) => {
              const inStock = (product.variants?.[0]?.stock ?? product.stock) > 0;
              const isLowStock = (product.variants?.[0]?.stock ?? product.stock) <= 5 && inStock;
              const isNew = i < 3;
              const isBusy = addingId === product._id;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  key={product._id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/details/${product._id}`)}
                >
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-desert-khaki/20 mb-3.5 border border-lacquered-licorice/5">
                    <img
                      src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400"}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-lacquered-licorice/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {isNew && <span className="px-2 py-0.5 bg-copper-green text-albescent-white text-[8px] font-black tracking-widest uppercase rounded-full shadow-md">New</span>}
                      {isLowStock && <span className="px-2 py-0.5 bg-orange-500 text-white text-[8px] font-black tracking-widest uppercase rounded-full shadow-md">Low Stock</span>}
                      {!inStock && <span className="px-2 py-0.5 bg-lacquered-licorice/70 text-albescent-white text-[8px] font-black tracking-widest uppercase rounded-full">Sold Out</span>}
                    </div>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-lacquered-licorice/30 hover:text-red-400 hover:bg-white transition-all duration-300 shadow-md opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                    >
                      <FaHeart size={11} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <button
                        onClick={(e) => handleQuickAdd(e, product)}
                        disabled={!inStock || isBusy}
                        className="w-full bg-albescent-white/95 backdrop-blur-sm text-lacquered-licorice py-2.5 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-lacquered-licorice hover:text-albescent-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                      >
                        {isBusy ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <FaShoppingBag size={11} />}
                        {!inStock ? "Sold Out" : isBusy ? "Adding…" : "Quick Add"}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 px-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-lacquered-licorice/30 mb-0.5">
                          {product.brand || product.category || "Snitch"}
                        </p>
                        <h3 className="font-black text-sm text-lacquered-licorice tracking-tight line-clamp-1 uppercase group-hover:text-copper-green transition-colors duration-300">
                          {product.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-copper-green">
                        {product.price.currency} {product.price.amount.toLocaleString()}
                      </span>
                      {product.variants?.length > 0 && (
                        <span className="text-[8px] font-bold text-lacquered-licorice/25 uppercase tracking-widest">
                          {product.variants.length} variants
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-full border border-lacquered-licorice/10 flex items-center justify-center disabled:opacity-20 hover:bg-lacquered-licorice hover:text-albescent-white transition-all active:scale-90"
              >
                <FaChevronLeft size={11} />
              </button>
              <div className="flex items-center gap-1.5 px-5 py-2 bg-white rounded-full border border-lacquered-licorice/5 shadow-sm">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`h-2 rounded-full transition-all duration-500 ${currentPage === i + 1 ? "bg-copper-green w-6" : "bg-lacquered-licorice/10 w-2 hover:bg-lacquered-licorice/30"}`}
                  />
                ))}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-full border border-lacquered-licorice/10 flex items-center justify-center disabled:opacity-20 hover:bg-lacquered-licorice hover:text-albescent-white transition-all active:scale-90"
              >
                <FaChevronRight size={11} />
              </button>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-lacquered-licorice/25">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        )}
      </section>

      {/* ── Promo Banner ──────────────────────────────────────────────────── */}
      <section className="mx-6 my-16 rounded-[2.5rem] overflow-hidden bg-lacquered-licorice relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1400')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-10 md:px-16 py-14">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-copper-green mb-3">Limited Time</p>
            <h3 className="text-4xl md:text-5xl font-black text-albescent-white tracking-tighter leading-none">
              GET 10% OFF
              <br />
              <span className="text-playing-hooky italic">YOUR FIRST ORDER</span>
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <div className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-2xl px-5 py-3">
              <FaTag className="text-copper-green" size={14} />
              <span className="text-albescent-white font-black tracking-widest text-sm">SNITCH10</span>
            </div>
            <button
              onClick={() => document.getElementById("trending-section")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-copper-green text-albescent-white px-8 py-3.5 rounded-2xl font-black text-xs tracking-widest uppercase hover:brightness-110 transition-all shadow-lg active:scale-95"
            >
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-desert-khaki/30 border-y border-lacquered-licorice/5">
        <div className="container mx-auto px-6 text-center max-w-lg">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-copper-green mb-3">Stay in the loop</p>
          <h2 className="text-4xl font-black text-lacquered-licorice tracking-tighter mb-4 uppercase italic">Join the Club</h2>
          <p className="text-lacquered-licorice/50 mb-8 text-sm font-medium">
            Be the first to know about new drops, exclusive deals, and behind-the-scenes access.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-white px-5 py-3.5 rounded-full border border-lacquered-licorice/10 focus:outline-none focus:ring-2 focus:ring-copper-green/20 text-sm font-medium shadow-sm"
            />
            <button
              type="submit"
              className="bg-lacquered-licorice text-albescent-white px-7 py-3.5 rounded-full font-black tracking-widest text-xs uppercase hover:bg-copper-green transition-all shadow-lg active:scale-95"
            >
              Join
            </button>
          </form>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-16 bg-lacquered-licorice text-albescent-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-copper-green rounded-xl flex items-center justify-center font-black text-lg shadow-md">S</div>
                <h3 className="text-xl font-black tracking-tighter uppercase italic">Snitch</h3>
              </div>
              <p className="text-albescent-white/30 text-xs font-medium leading-relaxed">
                Elevating streetwear since 2026.<br />We don't follow trends — we set them.
              </p>
            </div>
            {[
              { title: "Shop", links: ["All Products", "Best Sellers", "New Arrivals", "Sale"] },
              { title: "Support", links: ["Help Center", "Shipping Policy", "Returns & Refunds", "Track Order"] },
              { title: "Company", links: ["About Us", "Careers", "Press", "Sustainability"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-black uppercase tracking-[0.2em] mb-6 text-[10px] text-playing-hooky">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l} className="text-xs font-bold text-albescent-white/40 hover:text-albescent-white transition-colors cursor-pointer">{l}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-[9px] font-black tracking-[0.4em] opacity-20 uppercase">
              © 2026 SNITCH CLOTHING PVT LTD. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
