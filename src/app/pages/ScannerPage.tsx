import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Scan,
  Camera,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Sparkles,
  Layers,
  Clock,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useFeatureAccess } from "../../hooks/useFeatureAccess";
import { PremiumFeatureLock } from "../components/PremiumFeatureLock";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "../components/GlassCard";

interface ScannedProduct {
  barcode: string;
  name: string;
  brand: string;
  image: string;
  compatibility: "excellent" | "good" | "caution" | "avoid";
  compatibilityScore: number;
  ingredients: {
    name: string;
    status: "beneficial" | "neutral" | "problematic";
    description: string;
  }[];
  layeringOrder: number;
  conflictsWith: string[];
  recommendations: string[];
}

export default function ScannerPage() {
  const navigate = useNavigate();
  const { token, refreshNow, isAuthenticated, login } = useAuth();
  const { hasAccess, tierName, requiredTierName } = useFeatureAccess("scanner");

  // Check if user has access to this feature
  if (isAuthenticated && !hasAccess) {
    return (
      <PremiumFeatureLock
        featureName="Ingredient Scanner"
        description="Scan any skincare product to instantly check compatibility with your skin type and routine."
        currentPlan={tierName}
        requiredPlan={requiredTierName}
      />
    );
  }

  const [scanning, setScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const analyzeProduct = async (query: string) => {
    if (!query.trim()) return;

    try {
      setScanning(true);
      setErrorMessage("");

      await refreshNow();

      const API = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";
      const response = await fetch(`${API}/scanner/analyze-product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : data?.error || "Failed to analyze product",
        );
      }

      setScannedProduct(data);
    } catch (error: any) {
      console.error("Scanner text error:", error);
      setErrorMessage(error?.message || "Failed to analyze product");
    } finally {
      setScanning(false);
    }
  };

  const analyzeProductImage = async (file: File) => {
    try {
      setScanning(true);
      setErrorMessage("");

      await refreshNow();

      const formData = new FormData();
      formData.append("image", file);

      const API = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";
      const response = await fetch(`${API}/scanner/analyze-product-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : data?.error || "Failed to analyze product image",
        );
      }

      setScannedProduct(data);
    } catch (error: any) {
      console.error("Scanner image error:", error);
      setErrorMessage(error?.message || "Failed to analyze product image");
    } finally {
      setScanning(false);
    }
  };

  const handleManualSearch = () => {
    if (!searchQuery.trim()) return;
    analyzeProduct(searchQuery);
    setSearchQuery("");
  };

  const handleCameraFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await analyzeProductImage(file);
    e.target.value = "";
  };

  const handleGalleryFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await analyzeProductImage(file);
    e.target.value = "";
  };

  const getCompatibilityColor = (compatibility: string) => {
    switch (compatibility) {
      case "excellent":
        return "from-green-400 to-emerald-500";
      case "good":
        return "from-blue-400 to-cyan-500";
      case "caution":
        return "from-amber-400 to-orange-500";
      case "avoid":
        return "from-red-400 to-rose-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getCompatibilityIcon = (compatibility: string) => {
    switch (compatibility) {
      case "excellent":
      case "good":
        return <CheckCircle className="w-6 h-6" />;
      case "caution":
        return <AlertTriangle className="w-6 h-6" />;
      case "avoid":
        return <X className="w-6 h-6" />;
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  const getIngredientColor = (status: string) => {
    switch (status) {
      case "beneficial":
        return "bg-green-100 text-green-800 border-green-200";
      case "neutral":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "problematic":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-[#fff8f3] via-[#fff0eb] to-[#ffe8dc] dark:from-[#1a0f0c] dark:via-[#2d1a15] dark:to-[#241208] flex items-center justify-center p-4 overflow-hidden"
      >
        {/* Background particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-purple-400/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <GlassCard className="relative z-10 bg-gradient-to-br from-orange-900/40 to-pink-900/40 border border-orange-500/30 p-8 text-center max-w-lg w-full">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 mb-4 shadow-lg shadow-orange-500/50"
          >
            <Scan className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-3">AI Scan Lab</h2>
          <p className="text-orange-100 mb-6">
            Unlock the power of intelligent product analysis by logging in with your skin profile.
          </p>
          <button
            onClick={() => login("/scanner")}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300"
          >
            Enter Lab
          </button>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#fff8f3] via-[#fff0eb] to-[#ffe8dc] dark:from-[#1a0f0c] dark:via-[#2d1a15] dark:to-[#241208]">
      {/* ATMOSPHERIC BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(255, 138, 122, 0.3), rgba(236, 72, 153, 0.1), transparent)",
          }}
          animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.2), rgba(255, 138, 122, 0.1), transparent)",
          }}
          animate={{ x: [0, -60, 0], y: [0, -50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 -right-64 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.15), rgba(255, 160, 130, 0.05), transparent)",
          }}
          animate={{ x: [0, -100, 0], y: [0, 80, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(220, 100, 80, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(220, 100, 80, 0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating particles */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-orange-400/40"
            style={{
              left: `${20 + i * 10}%`,
              top: `${20 + i * 12}%`,
            }}
            animate={{
              y: [0, -60, 0],
              opacity: [0.1, 0.6, 0.1],
            }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Light streaks */}
        <motion.div
          className="absolute top-1/4 left-0 w-96 h-1 bg-gradient-to-r from-transparent via-orange-300/20 to-transparent blur-md"
          animate={{ x: [-400, 800], opacity: [0, 0.5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-0 w-96 h-1 bg-gradient-to-r from-transparent via-pink-400/20 to-transparent blur-md"
          animate={{ x: [400, -800], opacity: [0, 0.5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 1 }}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCameraFileChange}
        />

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleGalleryFileChange}
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 mb-4 shadow-lg shadow-orange-500/40"
          >
            <Scan className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-3">
            AI Scan Lab
          </h1>
          <p className="text-orange-700 dark:text-orange-300 text-lg max-w-2xl mx-auto">
            Intelligent product analysis powered by advanced AI
          </p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 max-w-md mx-auto w-full"
            >
              <GlassCard className="bg-red-100/80 dark:bg-red-500/20 border border-red-300 dark:border-red-400/50 p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <span className="text-red-700 dark:text-red-200">{errorMessage}</span>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {!scannedProduct ? (
          <>
            {/* AI SCAN CORE - Central Orb */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              className="relative w-64 h-64 mx-auto mb-12"
            >
              {/* Outer pulsing ring */}
              {scanning && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-orange-400/40"
                    animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-pink-400/40"
                    animate={{ scale: [1, 1.5, 1], opacity: [0, 0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                  />
                </>
              )}

              {/* Scanning lines */}
              {scanning && (
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 256 256">
                  {[...Array(6)].map((_, i) => (
                    <motion.line
                      key={i}
                      x1="128"
                      y1="0"
                      x2="128"
                      y2="256"
                      stroke="rgba(255, 138, 122, 0.3)"
                      strokeWidth="1"
                      animate={{
                        strokeOpacity: [0.1, 0.6, 0.1],
                        x1: [128 + Math.cos((i / 6) * Math.PI * 2) * 60, 128],
                        x2: [128 + Math.cos((i / 6) * Math.PI * 2) * 60, 128],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: (i / 6) * 0.3,
                      }}
                    />
                  ))}
                </svg>
              )}

              {/* Main Orb */}
              <motion.div
                animate={{
                  y: scanning ? [0, -10, 0] : [0, -5, 0],
                  scale: scanning ? [1, 1.08, 1] : [1, 1.05, 1],
                }}
                transition={{
                  duration: scanning ? 1 : 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-orange-500 shadow-2xl shadow-orange-400/40 flex items-center justify-center overflow-hidden"
              >
                {/* Orb shine */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent" />

                {/* Content inside orb */}
                {scanning ? (
                  <div className="flex flex-col items-center gap-3 text-white z-10">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Scan className="w-12 h-12" />
                    </motion.div>
                    <p className="text-lg font-semibold text-center">Analyzing...</p>
                  </div>
                ) : (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-white z-10"
                  >
                    <Sparkles className="w-12 h-12" />
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Action Buttons around the orb */}
            <motion.div
              className="relative w-96 h-96 mx-auto mb-12"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Camera Button - Left */}
              <motion.button
                onClick={() => !scanning && cameraInputRef.current?.click()}
                disabled={scanning}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
              >
                <GlassCard className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400/40 to-orange-500/40 border border-orange-400/70 dark:border-orange-400/50 flex items-center justify-center shadow-lg shadow-orange-400/30 hover:shadow-orange-400/50 transition-all">
                  <Camera className="w-8 h-8 text-orange-700 dark:text-orange-400" />
                </GlassCard>
                <p className="text-sm text-orange-700 dark:text-orange-300 text-center mt-2 whitespace-nowrap font-medium">Camera</p>
              </motion.button>

              {/* Upload Button - Right */}
              <motion.button
                onClick={() => !scanning && galleryInputRef.current?.click()}
                disabled={scanning}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
              >
                <GlassCard className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400/40 to-pink-500/40 border border-pink-400/70 dark:border-pink-400/50 flex items-center justify-center shadow-lg shadow-pink-400/30 hover:shadow-pink-400/50 transition-all">
                  <ImageIcon className="w-8 h-8 text-pink-700 dark:text-pink-400" />
                </GlassCard>
                <p className="text-sm text-pink-700 dark:text-pink-300 text-center mt-2 whitespace-nowrap font-medium">Upload</p>
              </motion.button>

              {/* Search Button - Bottom */}
              <motion.button
                onClick={() => setSearchQuery("")}
                disabled={scanning}
                className="absolute left-1/2 bottom-0 -translate-x-1/2 z-20"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
              >
                <GlassCard className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400/40 to-cyan-500/40 border border-cyan-400/70 dark:border-cyan-400/50 flex items-center justify-center shadow-lg shadow-cyan-400/30 hover:shadow-cyan-400/50 transition-all">
                  <Search className="w-8 h-8 text-cyan-700 dark:text-cyan-400" />
                </GlassCard>
                <p className="text-sm text-cyan-700 dark:text-cyan-300 text-center mt-2 whitespace-nowrap font-medium">Search</p>
              </motion.button>
            </motion.div>

            {/* Manual Search Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full max-w-2xl mx-auto mb-12"
            >
              <GlassCard className="bg-white/60 dark:bg-slate-900/60 border border-orange-200/40 dark:border-orange-700/30 p-6 backdrop-blur-xl">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Manual Search</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                    placeholder="Enter product name or barcode..."
                    className="flex-1 px-4 py-3 rounded-xl bg-white/80 dark:bg-gray-900/40 border border-orange-300/40 dark:border-orange-500/40 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-orange-400/80 focus:ring-2 focus:ring-orange-500/30 outline-none transition-all"
                  />
                  <motion.button
                    onClick={handleManualSearch}
                    disabled={scanning}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 transition-all"
                  >
                    Analyze
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>

            {/* Example Scans */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full max-w-3xl mx-auto"
            >
              <h3 className="text-center text-lg font-semibold text-gray-800 dark:text-white mb-6">Try Sample Analyses</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: "Vitamin C Brightening Serum", status: "excellent" },
                  { name: "Retinol Night Treatment", status: "caution" },
                  { name: "Heavy Mineral Oil Cream", status: "avoid" },
                ].map((example, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => analyzeProduct(example.name)}
                    disabled={scanning}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="disabled:opacity-50"
                  >
                    <GlassCard className="bg-white/70 dark:bg-slate-900/50 border border-orange-200/40 dark:border-orange-700/30 p-4 hover:border-orange-400/80 dark:hover:border-orange-500/60 transition-all">
                      <div className="flex items-center gap-3">
                        {example.status === "excellent" && (
                          <div className="w-10 h-10 rounded-full bg-green-500/30 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                        {example.status === "caution" && (
                          <div className="w-10 h-10 rounded-full bg-amber-500/30 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                          </div>
                        )}
                        {example.status === "avoid" && (
                          <div className="w-10 h-10 rounded-full bg-red-500/30 flex items-center justify-center">
                            <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                          </div>
                        )}
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">{example.name}</span>
                      </div>
                    </GlassCard>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        ) : (
          /* Results Display - Floating Panels */
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="max-w-7xl mx-auto w-full"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Analysis Complete</h2>
              <p className="text-orange-700 dark:text-orange-300">Product scan results</p>
            </motion.div>

            {/* Product Image Panel - Top */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center mb-12"
            >
              <GlassCard className="bg-white/70 dark:bg-slate-900/60 border border-orange-200/40 dark:border-orange-700/30 p-6 w-fit">
                <img
                  src={
                    scannedProduct.image ||
                    "https://via.placeholder.com/300x300/8b63d3/ffffff?text=Product"
                  }
                  alt={scannedProduct.name}
                  className="w-40 h-40 rounded-2xl object-cover shadow-lg"
                />
              </GlassCard>
            </motion.div>

            {/* Product Info Panel - Center Top */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mb-8"
            >
              <GlassCard className="bg-white/70 dark:bg-slate-900/60 border border-orange-200/40 dark:border-orange-700/30 p-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{scannedProduct.name}</h3>
                <p className="text-orange-700 dark:text-orange-300">{scannedProduct.brand}</p>
              </GlassCard>
            </motion.div>

            {/* Main Grid - Compatibility Score & Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Compatibility Score - Left */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <GlassCard className={`bg-gradient-to-br ${
                  scannedProduct.compatibility === "excellent"
                    ? "from-green-500/20 to-emerald-600/20 border-green-500/40"
                    : scannedProduct.compatibility === "good"
                    ? "from-blue-500/20 to-cyan-600/20 border-blue-500/40"
                    : scannedProduct.compatibility === "caution"
                    ? "from-amber-500/20 to-orange-600/20 border-amber-500/40"
                    : "from-red-500/20 to-rose-600/20 border-red-500/40"
                } border p-8 flex flex-col items-center justify-center h-full`}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="mb-4"
                  >
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg ${
                      scannedProduct.compatibility === "excellent"
                        ? "bg-gradient-to-r from-green-400 to-emerald-500"
                        : scannedProduct.compatibility === "good"
                        ? "bg-gradient-to-r from-blue-400 to-cyan-500"
                        : scannedProduct.compatibility === "caution"
                        ? "bg-gradient-to-r from-amber-400 to-orange-500"
                        : "bg-gradient-to-r from-red-400 to-rose-500"
                    }`}>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white">{scannedProduct.compatibilityScore}%</div>
                        <div className="text-xs text-white/80 mt-1">MATCH</div>
                      </div>
                    </div>
                  </motion.div>
                  <p className="text-white font-semibold capitalize text-center mt-4">{scannedProduct.compatibility}</p>
                </GlassCard>
              </motion.div>

              {/* Ingredients - Center */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.35 }}
              >
                <GlassCard className="bg-white/70 dark:bg-slate-900/60 border border-orange-200/40 dark:border-orange-700/30 p-6 h-full">
                  <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    Key Ingredients
                  </h4>
                  <div className="space-y-3">
                    {scannedProduct.ingredients.slice(0, 4).map((ingredient, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                          ingredient.status === "beneficial"
                            ? "bg-green-100 dark:bg-green-500/20 border-green-300 dark:border-green-400/50 text-green-700 dark:text-green-300"
                            : ingredient.status === "neutral"
                              ? "bg-blue-100 dark:bg-blue-500/20 border-blue-300 dark:border-blue-400/50 text-blue-700 dark:text-blue-300"
                              : "bg-red-100 dark:bg-red-500/20 border-red-300 dark:border-red-400/50 text-red-700 dark:text-red-300"
                        }`}
                      >
                        {ingredient.name}
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              {/* Layering Order - Right */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <GlassCard className="bg-gradient-to-br from-cyan-100/70 to-blue-100/70 dark:from-cyan-900/40 dark:to-blue-900/40 border border-cyan-300/40 dark:border-cyan-500/40 p-6 h-full flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-cyan-200/70 dark:bg-cyan-500/20 border border-cyan-400/50 dark:border-cyan-400/50 flex items-center justify-center">
                      <Layers className="w-6 h-6 text-cyan-700 dark:text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs text-cyan-700 dark:text-cyan-300 uppercase tracking-wider">Layering</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        {scannedProduct.layeringOrder === 0 ? "Not Recommended" : `Step ${scannedProduct.layeringOrder}`}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-cyan-700 dark:text-cyan-300">Position in your skincare routine</p>
                </GlassCard>
              </motion.div>
            </div>

            {/* Full Ingredients Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mb-8"
            >
              <GlassCard className="bg-white/70 dark:bg-slate-900/60 border border-orange-200/40 dark:border-orange-700/30 p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Full Ingredient Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scannedProduct.ingredients.map((ingredient, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + (index * 0.08) }}
                      className={`p-4 rounded-lg border ${
                        ingredient.status === "beneficial"
                          ? "bg-green-100/70 dark:bg-green-500/10 border-green-300 dark:border-green-400/40"
                          : ingredient.status === "neutral"
                            ? "bg-blue-100/70 dark:bg-blue-500/10 border-blue-300 dark:border-blue-400/40"
                            : "bg-red-100/70 dark:bg-red-500/10 border-red-300 dark:border-red-400/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className={`font-semibold ${
                          ingredient.status === "beneficial"
                            ? "text-green-700 dark:text-green-300"
                            : ingredient.status === "neutral"
                              ? "text-blue-700 dark:text-blue-300"
                              : "text-red-700 dark:text-red-300"
                        }`}>
                          {ingredient.name}
                        </p>
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          ingredient.status === "beneficial"
                            ? "bg-green-200 dark:bg-green-500/30 text-green-800 dark:text-green-200"
                            : ingredient.status === "neutral"
                              ? "bg-blue-200 dark:bg-blue-500/30 text-blue-800 dark:text-blue-200"
                              : "bg-red-200 dark:bg-red-500/30 text-red-800 dark:text-red-200"
                        }`}>
                          {ingredient.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{ingredient.description}</p>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Conflicts Warning */}
            {scannedProduct.conflictsWith.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-8"
              >
                <GlassCard className="bg-red-100/70 dark:bg-red-900/30 border border-red-300/60 dark:border-red-500/40 p-6">
                  <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Product Conflicts
                  </h3>
                  <p className="text-red-700 dark:text-red-200 text-sm mb-4">Do not use this product with:</p>
                  <div className="flex flex-wrap gap-2">
                    {scannedProduct.conflictsWith.map((conflict, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.6 + (index * 0.1) }}
                        className="px-3 py-2 rounded-lg bg-red-200/70 dark:bg-red-500/20 border border-red-300 dark:border-red-400/40 text-red-700 dark:text-red-200 text-sm font-medium"
                      >
                        {conflict}
                      </motion.span>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Usage Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="mb-12"
            >
              <GlassCard className="bg-white/70 dark:bg-slate-900/60 border border-orange-200/40 dark:border-orange-700/30 p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  Usage Recommendations
                </h3>
                <div className="space-y-3">
                  {scannedProduct.recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.65 + (index * 0.1) }}
                      className="flex gap-4 items-start"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 flex-1 pt-1">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto"
            >
              <motion.button
                onClick={() => setScannedProduct(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
              >
                Scan Another Product
              </motion.button>
              <motion.button
                onClick={() => navigate("/routine")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-6 py-4 rounded-xl border-2 border-orange-400/60 dark:border-orange-500/60 text-orange-700 dark:text-orange-300 font-semibold hover:bg-orange-500/10 transition-all"
              >
                View My Routine
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}