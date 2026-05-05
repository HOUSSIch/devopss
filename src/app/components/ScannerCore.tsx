import { motion } from "motion/react";

interface ScannerCoreProps {
  isScanning?: boolean;
}

/**
 * 3D animated orb for the scanner interface
 * - Glowing gradient (purple, pink, beige)
 * - Floating animation
 * - Breathing scale animation
 * - Soft glow effects
 */
export function ScannerCore({ isScanning = false }: ScannerCoreProps) {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      animate={isScanning ? { scale: 0.95 } : { scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Outer glow pulse */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(201, 87, 133, 0.35), rgba(255, 182, 193, 0.15), transparent)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main orb with floating animation */}
      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Outer layer - breathing scale */}
        <motion.div
          className="relative rounded-full overflow-hidden"
          style={{
            width: 280,
            height: 280,
            background: `
              radial-gradient(circle at 30% 30%,
                rgba(255, 255, 255, 0.95) 0%,
                rgba(242, 184, 205, 0.75) 30%,
                rgba(202, 157, 234, 0.65) 65%,
                rgba(243, 202, 170, 0.7) 100%
              )
            `,
            boxShadow: `
              0 0 60px rgba(201, 87, 133, 0.45),
              0 20px 60px rgba(201, 87, 133, 0.25),
              inset -20px -20px 50px rgba(0, 0, 0, 0.12),
              inset 20px 20px 50px rgba(255, 255, 255, 0.25)
            `,
            border: "1px solid rgba(255, 255, 255, 0.4)",
          }}
          animate={{
            scale: [0.97, 1.04, 0.97],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Top shine */}
          <div
            className="absolute top-6 left-1/4 w-32 h-32 rounded-full blur-2xl opacity-60"
            style={{
              background: "radial-gradient(circle, rgba(255, 255, 255, 0.95), transparent)",
            }}
          />

          {/* Rotating accent line */}
          <motion.div
            className="absolute left-1/2 top-0 h-1 w-56 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
            animate={{
              y: [0, 278, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Core highlight */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 100,
              height: 100,
              top: "20%",
              left: "20%",
              background:
                "radial-gradient(circle, rgba(255, 230, 200, 0.6), transparent)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>

      {/* Scan line animation */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          width: 280,
          height: 280,
        }}
      >
        <motion.div
          className="absolute left-1/2 top-0 h-px w-64 -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent"
          animate={{
            y: [0, 280, 0],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
