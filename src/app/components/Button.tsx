import { motion, type HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary" | "outline";
  glow?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  glow = false,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "deepskyn-ui-button deepskyn-ui-button-sheen relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.985] font-semibold tracking-wide overflow-hidden";

  const variants = {
    primary:
      "bg-gradient-to-r from-[#e079aa] via-[#c08adf] to-[#f3b08f] border-transparent text-white shadow-[0_20px_38px_rgba(139,99,211,0.3)] hover:shadow-[0_28px_52px_rgba(139,99,211,0.4)]",
    secondary:
      "bg-white/78 text-[#7758c7] border-white/80 hover:bg-white hover:text-[#684db1]",
    outline:
      "border-white/85 text-[#7e61cf] bg-white/55 hover:bg-[#8b63d3] hover:text-white hover:border-transparent",
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${
        glow ? "glow-button" : ""
      } ${className}`}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.975, y: 1 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.button>
  );
}