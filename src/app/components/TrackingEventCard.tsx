import { motion } from "motion/react";
import { MapPin, Clock, CheckCircle, Package } from "lucide-react";

interface TrackingEventCardProps {
  status: string;
  location: string;
  timestamp: string;
  completed: boolean;
  isLatest?: boolean;
  index: number;
}

/**
 * Individual tracking event card with 3D floating effect
 * - Glassmorphism design
 * - Glow on completed
 * - Hover tilt animation
 * - Staggered entrance
 */
export function TrackingEventCard({
  status,
  location,
  timestamp,
  completed,
  isLatest = false,
  index,
}: TrackingEventCardProps) {
  // Calculate position in circular arrangement (or use grid for alternative layout)
  const anglePerCard = (Math.PI * 2) / 8; // Assuming up to 8 cards
  const radius = 120;
  const angle = index * anglePerCard - Math.PI / 2;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      whileHover={{ scale: 1.05, y: -8 }}
    >
      <motion.div
        className={`
          relative p-5 rounded-2xl backdrop-blur-xl
          border transition-all
          ${
            completed
              ? "bg-white/30 border-orange-300/60 shadow-lg shadow-orange-200/30"
              : "bg-white/15 border-white/30"
          }
          ${isLatest ? "ring-2 ring-orange-400/50" : ""}
        `}
        animate={{
          boxShadow: completed
            ? [
                "0 0 20px rgba(255, 138, 122, 0.3)",
                "0 0 40px rgba(255, 138, 122, 0.5)",
                "0 0 20px rgba(255, 138, 122, 0.3)",
              ]
            : "none",
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-orange-300/40 to-transparent rounded-full" />

        <div className="space-y-2">
          {/* Status with icon */}
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                completed ? "bg-orange-500" : "bg-gray-400"
              }`}
            >
              {completed ? (
                <CheckCircle className="w-4 h-4 text-white" />
              ) : (
                <Package className="w-4 h-4 text-white" />
              )}
            </div>
            <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
              {status}
            </h4>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-orange-500" />
            <span>{location}</span>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Clock className="w-3.5 h-3.5 flex-shrink-0 text-orange-400" />
            <span>{timestamp}</span>
          </div>
        </div>

        {/* Corner accent */}
        {completed && (
          <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-orange-400/60" />
        )}
      </motion.div>
    </motion.div>
  );
}
