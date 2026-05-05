import { motion } from "motion/react";
import { Check } from "lucide-react";

interface ProgressPhotoCardProps {
  imageUrl: string;
  date: string;
  time: "morning" | "evening";
  notes: string;
  isSelected?: boolean;
  selectionIndex?: number;
  index: number;
  onClick: () => void;
}

export function ProgressPhotoCard({
  imageUrl,
  date,
  time,
  notes,
  isSelected = false,
  selectionIndex,
  index,
  onClick,
}: ProgressPhotoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: "easeOut",
      }}
      whileHover={{ scale: 1.05, y: -8 }}
      onClick={onClick}
      className={`relative cursor-pointer group transition-all duration-300 ${
        isSelected ? "ring-2 ring-orange-500" : ""
      }`}
    >
      {/* Card Container */}
      <div
        className={`bg-gradient-to-br from-white/80 to-orange-50/60 dark:from-slate-900/80 dark:to-orange-900/30 rounded-2xl overflow-hidden border transition-all duration-300 ${
          isSelected
            ? "border-orange-500/60 shadow-2xl shadow-orange-500/30"
            : "border-orange-200/40 dark:border-orange-700/30 shadow-lg"
        } backdrop-blur-xl`}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-gradient-to-br from-orange-200/30 to-pink-200/20">
          <img
            src={imageUrl}
            alt="Progress photo"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Time Badge */}
          <div
            className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition-all ${
              time === "morning"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                : "bg-gradient-to-r from-indigo-500 to-purple-600"
            }`}
          >
            {time}
          </div>

          {/* Selection Overlay */}
          {isSelected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-br from-orange-500/40 to-pink-600/30 flex items-center justify-center backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="w-12 h-12 rounded-full bg-white shadow-2xl flex items-center justify-center border-2 border-orange-500"
              >
                <span className="text-lg font-bold text-orange-600">
                  {selectionIndex}
                </span>
              </motion.div>
            </motion.div>
          )}

          {/* Hover Check Icon */}
          {!isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center backdrop-blur-sm"
            >
              <Check className="w-5 h-5 text-orange-500" />
            </motion.div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-gray-800 dark:text-white">
              {date}
            </p>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-pink-600 flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 italic">
            "{notes}"
          </p>

          {/* Glow Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            className="h-0.5 bg-gradient-to-r from-orange-500 to-pink-600 origin-left rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
