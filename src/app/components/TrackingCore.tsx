import { motion } from "motion/react";
import { Truck } from "lucide-react";

interface TrackingCoreProps {
  isDelivered?: boolean;
}

/**
 * Central 3D animated tracking core
 * - Floating package/truck icon
 * - Glowing gradient (orange, pink)
 * - Rotating animation
 * - Light reflections
 */
export function TrackingCore({ isDelivered = false }: TrackingCoreProps) {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      animate={isDelivered ? { scale: 0.95 } : { scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Outer glow pulse */}
      <motion.div
        className="absolute w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 138, 122, 0.4), rgba(242, 184, 160, 0.2), transparent)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main core with floating animation */}
      <motion.div
        animate={{
          y: [0, -18, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Outer rotating layer */}
        <motion.div
          className="relative rounded-full overflow-hidden"
          style={{
            width: 240,
            height: 240,
            background: `
              radial-gradient(circle at 35% 35%,
                rgba(255, 255, 255, 0.95) 0%,
                rgba(242, 184, 160, 0.8) 25%,
                rgba(255, 138, 122, 0.7) 60%,
                rgba(220, 100, 80, 0.75) 100%
              )
            `,
            boxShadow: `
              0 0 60px rgba(255, 138, 122, 0.5),
              0 25px 50px rgba(255, 138, 122, 0.3),
              inset -15px -15px 40px rgba(0, 0, 0, 0.1),
              inset 15px 15px 40px rgba(255, 255, 255, 0.3)
            `,
            border: "1px solid rgba(255, 255, 255, 0.5)",
          }}
          animate={{
            scale: [0.97, 1.05, 0.97],
            rotate: [0, 360],
          }}
          transition={{
            scale: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          }}
        >
          {/* Top shine */}
          <div
            className="absolute top-6 left-1/4 w-28 h-28 rounded-full blur-2xl opacity-70"
            style={{
              background: "radial-gradient(circle, rgba(255, 255, 255, 0.9), transparent)",
            }}
          />

          {/* Icon container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, -360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Truck className="w-16 h-16 text-white drop-shadow-lg" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Orbiting rings */}
      <motion.div
        className="absolute inset-0 rounded-full border border-white/20 pointer-events-none"
        style={{
          width: 300,
          height: 300,
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border border-white/10 pointer-events-none"
        style={{
          width: 360,
          height: 360,
        }}
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      {/* Glowing particles */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 4,
            height: 4,
            background: "rgba(255, 255, 255, 0.8)",
            boxShadow: "0 0 12px rgba(255, 138, 122, 0.8)",
          }}
          animate={{
            x: [0, Math.cos((i * Math.PI * 2) / 3) * 200, 0],
            y: [0, Math.sin((i * Math.PI * 2) / 3) * 200, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </motion.div>
  );
}
