import { motion } from "motion/react";

interface ProgressVisualizationProps {
  selectedCount?: number;
  totalPhotos?: number;
}

export function ProgressVisualization({
  selectedCount = 0,
  totalPhotos = 0,
}: ProgressVisualizationProps) {
  return (
    <div className="relative w-full h-80 flex items-center justify-center">
      {/* Central Animated Core */}
      <motion.div
        className="relative w-64 h-64"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {/* Outer rings */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-orange-400/30"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-orange-500/40"
          animate={{ scale: [1.1, 1, 1.1] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div
          className="absolute inset-8 rounded-full border-2 border-orange-600/50"
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Central Glow */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="w-48 h-48 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 140, 100, 0.4), rgba(255, 180, 160, 0.1), transparent)",
          }}
        />
      </motion.div>

      {/* Inner Circle */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="w-32 h-32 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, #ff8a7a, #c95785, #e8a1c0, #ff8a7a)",
          }}
        />
      </motion.div>

      {/* Core Highlight */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 shadow-2xl shadow-orange-500/50" />
      </motion.div>

      {/* Stats Counter */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-24"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-center backdrop-blur-xl bg-white/10 dark:bg-slate-900/20 rounded-xl px-6 py-3 border border-orange-300/30 dark:border-orange-700/30">
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {selectedCount}
          </p>
          <p className="text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 font-semibold">
            Selected / {totalPhotos} Total
          </p>
        </div>
      </motion.div>

      {/* Orbiting Particles */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-orange-400/60"
          style={{
            left: "50%",
            top: "50%",
            margin: "-4px 0 0 -4px",
          }}
          animate={{
            x: [
              Math.cos((i * Math.PI * 2) / 3) * 100,
              Math.cos((i * Math.PI * 2) / 3 + 0.5) * 110,
              Math.cos((i * Math.PI * 2) / 3) * 100,
            ],
            y: [
              Math.sin((i * Math.PI * 2) / 3) * 100,
              Math.sin((i * Math.PI * 2) / 3 + 0.5) * 110,
              Math.sin((i * Math.PI * 2) / 3) * 100,
            ],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
