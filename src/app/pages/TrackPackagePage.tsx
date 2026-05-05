import { useNavigate, useSearchParams } from "react-router-dom";
import { GlassCard } from "../components/GlassCard";
import { PageTransition } from "../components/PageTransition";
import { BackButton } from "../components/BackButton";
import { Button } from "../components/Button";
import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo } from "react";
import { Truck, Package, MapPin, Clock, Info } from "lucide-react";

interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  completed: boolean;
}

interface MapPoint {
  id: number;
  x: number;
  y: number;
  event: TrackingEvent;
  isActive: boolean;
}

// Map Visualization Component
function LiveMapTracking({ trackingEvents }: { trackingEvents: TrackingEvent[] }) {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const mapPoints: MapPoint[] = useMemo(() => {
    const points: MapPoint[] = [];
    const xSpacing = 1200 / (trackingEvents.length - 1 || 1);
    
    trackingEvents.forEach((event, index) => {
      const isActive = index === 0;
      points.push({
        id: index,
        x: index * xSpacing,
        y: 150 + Math.sin((index / trackingEvents.length) * Math.PI) * 80,
        event,
        isActive,
      });
    });

    return points;
  }, [trackingEvents]);

  // Generate SVG path
  const pathD = useMemo(() => {
    if (mapPoints.length === 0) return "";
    const points = mapPoints.map((p) => `${p.x},${p.y}`).join(" L ");
    return `M ${points}`;
  }, [mapPoints]);

  // Animate package along the path
  const totalDistance = useMemo(() => {
    if (mapPoints.length < 2) return 0;
    let distance = 0;
    for (let i = 1; i < mapPoints.length; i++) {
      const dx = mapPoints[i].x - mapPoints[i - 1].x;
      const dy = mapPoints[i].y - mapPoints[i - 1].y;
      distance += Math.sqrt(dx * dx + dy * dy);
    }
    return distance;
  }, [mapPoints]);

  const currentPoint = mapPoints[0];

  return (
    <div className="relative w-full">
      {/* Map Container */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-orange-200/40 dark:border-orange-700/30 bg-gradient-to-br from-[#fef3f0] via-[#fff8f5] to-[#ffe8dc] dark:from-[#2a1810] dark:via-[#3d2620] dark:to-[#2d1a10] p-8 md:p-12 backdrop-blur-md">
        {/* Background Map Grid */}
        <div className="absolute inset-0 opacity-[0.15] dark:opacity-[0.08] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <defs>
              <pattern id="mapGrid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="1200" height="400" fill="url(#mapGrid)" />
          </svg>
        </div>

        {/* Animated background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute w-96 h-96 rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(255, 138, 122, 0.25), transparent)",
              left: "5%",
              top: "-20%",
            }}
            animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-80 h-80 rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(242, 184, 160, 0.2), transparent)",
              right: "10%",
              bottom: "-15%",
            }}
            animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* SVG Canvas for Path and Nodes */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 400">
          {/* Glowing path */}
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(255, 138, 122)" stopOpacity="0.8" />
              <stop offset="50%" stopColor="rgb(255, 160, 130)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="rgb(242, 184, 160)" stopOpacity="0.4" />
            </linearGradient>
            <filter id="pathGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="nodeGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Path line */}
          <motion.path
            d={pathD}
            stroke="url(#pathGradient)"
            strokeWidth="3"
            fill="none"
            filter="url(#pathGlow)"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </svg>

        {/* Tracking Points */}
        <div className="relative w-full h-96 pointer-events-none">
          <AnimatePresence>
            {mapPoints.map((point, idx) => (
              <motion.div
                key={point.id}
                className="absolute"
                style={{
                  left: `calc(${(point.x / 1200) * 100}% + ${idx % 2 === 0 ? -12 : 12}px)`,
                  top: `calc(${(point.y / 400) * 100}% - 12px)`,
                  pointerEvents: "auto",
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.15, duration: 0.5 }}
              >
                {/* Node Container */}
                <motion.button
                  onClick={() => setSelectedPoint(point.id === selectedPoint ? null : point.id)}
                  onMouseEnter={() => setHoveredPoint(point.id)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="relative w-6 h-6 focus:outline-none transition-all"
                  whileHover={{ scale: 1.3 }}
                >
                  {/* Outer pulsing glow for active node */}
                  {point.isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-orange-400/40"
                      animate={{ scale: [1, 1.8, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* Node circle */}
                  <div
                    className={`absolute inset-0 rounded-full border-2 transition-all ${
                      point.isActive
                        ? "bg-gradient-to-br from-orange-400 to-orange-500 border-orange-300 shadow-lg shadow-orange-400/50"
                        : hoveredPoint === point.id
                        ? "bg-gradient-to-br from-pink-400 to-orange-400 border-pink-300 shadow-lg shadow-orange-300/40"
                        : "bg-gradient-to-br from-orange-300 to-orange-400 border-orange-200 shadow-md shadow-orange-300/30"
                    }`}
                  />

                  {/* Inner dot */}
                  <div className="absolute inset-1.5 rounded-full bg-white/90 dark:bg-orange-950" />
                </motion.button>

                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredPoint === point.id && (
                    <motion.div
                      className="absolute left-8 top-0 z-50 whitespace-nowrap pointer-events-none"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <div className="bg-gray-900 dark:bg-gray-950 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-orange-400/50">
                        <p className="font-semibold text-orange-400 mb-0.5">{point.event.status}</p>
                        <p className="text-gray-300">{point.event.location}</p>
                        <p className="text-gray-500 text-[10px] mt-1">{point.event.timestamp}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Moving Package Animation */}
        {currentPoint && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: `calc(${(currentPoint.x / 1200) * 100}%)`,
              top: `calc(${(currentPoint.y / 400) * 100}%)`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              filter: [
                "drop-shadow(0 0 8px rgba(255, 138, 122, 0.6))",
                "drop-shadow(0 0 16px rgba(255, 160, 130, 0.8))",
                "drop-shadow(0 0 8px rgba(255, 138, 122, 0.6))",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="flex items-center justify-center w-12 h-12 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Package className="w-8 h-8 text-orange-500 drop-shadow-lg" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Selected Point Details Card */}
      <AnimatePresence>
        {selectedPoint !== null && mapPoints[selectedPoint] && (
          <motion.div
            className="absolute top-4 right-4 z-30 pointer-events-auto"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
          >
            <GlassCard className="bg-gradient-to-br from-white/80 to-orange-50/60 dark:from-orange-900/50 dark:to-orange-800/30 border border-orange-300/60 dark:border-orange-600/40 p-4 backdrop-blur-xl shadow-xl">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-orange-600 dark:text-orange-400 mb-1">
                      Tracking Update
                    </p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {mapPoints[selectedPoint].event.status}
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setSelectedPoint(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    ✕
                  </motion.button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">{mapPoints[selectedPoint].event.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">{mapPoints[selectedPoint].event.timestamp}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TrackPackagePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trackingNumber = searchParams.get("tracking") || "1Z999AA10123456784";
  const orderId = searchParams.get("orderId") || "#12345";

  const trackingEvents: TrackingEvent[] = [
    {
      status: "Delivered",
      location: "New York, NY 10001",
      timestamp: "January 28, 2026 at 2:45 PM",
      completed: true,
    },
    {
      status: "Out for Delivery",
      location: "New York, NY",
      timestamp: "January 28, 2026 at 8:30 AM",
      completed: true,
    },
    {
      status: "Arrived at Local Facility",
      location: "New York Distribution Center",
      timestamp: "January 27, 2026 at 11:20 PM",
      completed: true,
    },
    {
      status: "In Transit",
      location: "Philadelphia, PA",
      timestamp: "January 27, 2026 at 3:15 PM",
      completed: true,
    },
    {
      status: "In Transit",
      location: "Baltimore, MD",
      timestamp: "January 26, 2026 at 9:45 AM",
      completed: true,
    },
    {
      status: "Package Received",
      location: "DeepSkyn Warehouse",
      timestamp: "January 25, 2026 at 4:30 PM",
      completed: true,
    },
    {
      status: "Order Processed",
      location: "DeepSkyn Fulfillment Center",
      timestamp: "January 25, 2026 at 10:00 AM",
      completed: true,
    },
  ];

  const currentStatus = trackingEvents[0];
  const estimatedDelivery = "Delivered on January 28, 2026";

  return (
    <PageTransition direction="fade">
      <div className="relative isolate min-h-screen overflow-hidden bg-gradient-to-br from-[#fff8f3] via-[#fff0eb] to-[#ffe8dc] dark:from-[#1a0f0c] dark:via-[#2d1a15] dark:to-[#241208] flex flex-col items-center justify-center p-6 py-12">
        {/* ATMOSPHERIC BACKGROUND */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {/* Animated gradient orbs */}
          <motion.div
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 138, 122, 0.35), rgba(255, 180, 160, 0.1), transparent)",
            }}
            animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(242, 184, 160, 0.3), rgba(255, 200, 180, 0.1), transparent)",
            }}
            animate={{ x: [0, -60, 0], y: [0, -50, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 -right-64 w-96 h-96 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 160, 130, 0.25), rgba(220, 120, 100, 0.05), transparent)",
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
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-orange-400/40"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
          ))}

          {/* Moving light streaks */}
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-1 bg-gradient-to-r from-transparent via-orange-300/30 to-transparent blur-md"
            animate={{ x: [-400, 400], opacity: [0, 0.5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="relative z-10 w-full max-w-7xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <BackButton />
          </motion.div>

          {/* Header - Floating Glass Panel */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/40 bg-white/70 dark:bg-slate-900/40 px-4 py-2 text-xs font-semibold tracking-wider text-orange-600 dark:text-orange-400 mb-4 backdrop-blur-md">
              <Package className="w-3.5 h-3.5" />
              LIVE MAP TRACKING
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-3 flex items-center justify-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Truck className="w-12 h-12 text-orange-500" />
              </motion.div>
              Track Your Package
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Order {orderId} • Tracking {trackingNumber}
            </p>
          </motion.div>

          {/* Current Status Floating Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute top-48 right-6 z-20 max-w-xs"
          >
            <GlassCard className="bg-gradient-to-br from-white/70 to-orange-100/40 dark:from-orange-900/40 dark:to-orange-800/20 border border-orange-300/60 dark:border-orange-600/40 p-6 backdrop-blur-xl shadow-2xl">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-widest font-bold text-orange-600 dark:text-orange-400">
                  Current Status
                </p>
                <motion.p
                  className="text-2xl font-bold text-orange-600 dark:text-orange-400"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {currentStatus.status}
                </motion.p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-700 dark:text-gray-300">{currentStatus.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-600 dark:text-gray-400 text-xs">{estimatedDelivery}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Live Map Tracking Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-full mb-12"
          >
            <LiveMapTracking trackingEvents={trackingEvents} />
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="w-full mb-8"
          >
            <GlassCard className="bg-white/60 dark:bg-slate-900/60 border border-orange-200/40 dark:border-orange-700/30 p-6 backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <Info className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <p className="font-semibold text-gray-800 dark:text-white">
                    Live Package Tracking
                  </p>
                  <p>
                    Watch your package move in real-time across our logistics network. Click on any checkpoint to view detailed information about each stop along the delivery route.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Action Buttons - Enhanced with Glow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="w-full flex flex-col sm:flex-row gap-4"
          >
            <motion.div
              className="flex-1"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                onClick={() => navigate(`/order-details/${orderId}`)}
                className="w-full h-12 text-base border-2 border-orange-300/60 hover:border-orange-400/80 hover:shadow-lg hover:shadow-orange-400/20 transition-all"
              >
                View Order Details
              </Button>
            </motion.div>
            <motion.div
              className="flex-1"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                glow
                onClick={() => navigate("/orders")}
                className="w-full h-12 text-base bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 hover:shadow-orange-600/40"
              >
                Back to Orders
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
