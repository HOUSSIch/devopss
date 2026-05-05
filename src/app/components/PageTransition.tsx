import { motion, AnimatePresence } from "motion/react";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down" | "fade";
}

const variants = {
  left: {
    initial: { opacity: 0, x: -120, rotateY: -8, filter: "blur(8px)" },
    animate: { opacity: 1, x: 0, rotateY: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: 120, rotateY: 8, filter: "blur(8px)" },
  },
  right: {
    initial: { opacity: 0, x: 120, rotateY: 8, filter: "blur(8px)" },
    animate: { opacity: 1, x: 0, rotateY: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: -120, rotateY: -8, filter: "blur(8px)" },
  },
  up: {
    initial: { opacity: 0, y: 70, scale: 0.97, filter: "blur(7px)" },
    animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, y: -70, scale: 1.03, filter: "blur(7px)" },
  },
  down: {
    initial: { opacity: 0, y: -70, scale: 0.97, filter: "blur(7px)" },
    animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, y: 70, scale: 1.03, filter: "blur(7px)" },
  },
  fade: {
    initial: { opacity: 0, scale: 0.96, y: 24, filter: "blur(6px)" },
    animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 1.04, y: -20, filter: "blur(6px)" },
  },
};

export function PageTransition({ children, direction = "fade" }: PageTransitionProps) {
  const variant = variants[direction];

  return (
    <motion.div
      initial={variant.initial}
      animate={variant.animate}
      exit={variant.exit}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="w-full will-change-transform"
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}
