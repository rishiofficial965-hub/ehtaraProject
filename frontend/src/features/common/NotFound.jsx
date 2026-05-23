import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-lacquered-licorice flex flex-col items-center justify-center px-6 text-center relative overflow-hidden font-sans">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center opacity-5" />


      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-lg"
      >
        {/* 404 */}
        <p className="text-[12rem] font-black text-white/5 leading-none tracking-tighter select-none absolute -top-16 left-1/2 -translate-x-1/2 w-full">
          404
        </p>

        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-copper-green mb-6">
            — Page Not Found
          </p>
          <h1 className="text-6xl md:text-8xl font-black text-albescent-white tracking-tighter leading-none mb-6 uppercase italic">
            LOST IN<br />
            <span className="text-playing-hooky">THE STREETS.</span>
          </h1>
          <p className="text-albescent-white/30 text-sm font-medium leading-relaxed mb-12 max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back to something real.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="group flex items-center gap-2 bg-albescent-white text-lacquered-licorice px-8 py-3.5 rounded-xl font-bold text-xs tracking-widest uppercase hover:bg-copper-green hover:text-albescent-white transition-all duration-300 shadow-md"
            >
              Back to Home
              <FaArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate(-1)}
              className="text-xs font-black tracking-widest uppercase text-albescent-white/25 hover:text-albescent-white transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </motion.div>

      {/* Snitch wordmark */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-20">
        <div className="w-7 h-7 bg-copper-green rounded-lg flex items-center justify-center">
          <span className="text-albescent-white font-black text-sm">S</span>
        </div>
        <span className="text-albescent-white font-black text-sm tracking-tighter uppercase italic">
          Snitch
        </span>
      </div>
    </div>
  );
};

export default NotFound;
