import { motion } from "motion/react";
import { Camera, Upload, LucideIcon } from "lucide-react";

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  position: "left" | "right";
}

/**
 * Floating action button positioned around the scanner core
 * - Glassmorphism design
 * - Glow effects on hover
 * - 3D lift animation
 */
export function ActionButton({ icon: Icon, label, onClick, disabled = false, position }: ActionButtonProps) {
  const isLeft = position === "left";
  const xOffset = isLeft ? -140 : 140;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        absolute top-1/2 -translate-y-1/2 
        w-24 h-24 rounded-full
        flex items-center justify-center flex-col gap-1
        backdrop-blur-xl border border-white/40
        bg-white/20 dark:bg-slate-900/30
        text-center
        transition-all duration-300
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-white/30 dark:hover:bg-slate-900/40 hover:border-white/60"
        }
        focus:outline-none focus:ring-2 focus:ring-[#c95785] focus:ring-offset-2
        dark:focus:ring-offset-[#1a0f2e]
        group
      `}
      style={{
        x: xOffset,
      }}
      initial={{ opacity: 0, scale: 0, x: isLeft ? -200 : 200 }}
      animate={{ opacity: 1, scale: 1, x: xOffset }}
      whileHover={disabled ? {} : { y: -8, scale: 1.1 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
    >
      {/* Glow background on hover */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#c95785] to-[#f1a9c2] opacity-0 group-hover:opacity-15 transition-opacity" />

      {/* Icon */}
      <Icon className="w-8 h-8 text-[#c95785] dark:text-[#e8a1c0] relative z-10" />

      {/* Label */}
      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 relative z-10 px-2 leading-tight">
        {label}
      </span>
    </motion.button>
  );
}

interface ScannerActionsProps {
  onCamera: () => void;
  onUpload: () => void;
  disabled?: boolean;
}

/**
 * Container for action buttons positioned around the scanner core
 */
export function ScannerActions({ onCamera, onUpload, disabled = false }: ScannerActionsProps) {
  return (
    <>
      <ActionButton
        icon={Camera}
        label="Use Camera"
        onClick={onCamera}
        disabled={disabled}
        position="left"
      />
      <ActionButton
        icon={Upload}
        label="Upload Files"
        onClick={onUpload}
        disabled={disabled}
        position="right"
      />
    </>
  );
}
