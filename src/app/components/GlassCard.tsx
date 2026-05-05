import { motion } from "motion/react";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = "", hover = false }: GlassCardProps) {
  return (
    <motion.div
      className={`glass-card deepskyn-surface-card deepskyn-float-card rounded-3xl p-8 v2-floating ${className}`}
      whileHover={
        hover
          ? {
              scale: 1.02,
              y: -6,
              boxShadow:
                "0 28px 56px rgba(217, 107, 149, 0.24), 0 16px 26px rgba(242, 155, 119, 0.18)",
            }
          : {}
      }
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
