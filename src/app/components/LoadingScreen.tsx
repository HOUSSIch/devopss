import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 deepskyn-loader-shell flex items-center justify-center"
    >
      <motion.span
        className="deepskyn-loader-orb orb-1"
        animate={{ x: [0, 18, 0], y: [0, -20, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="deepskyn-loader-orb orb-2"
        animate={{ x: [0, -16, 0], y: [0, 18, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.16, 1],
            rotate: [0, 12, 0],
          }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-6"
        >
          <div className="deepskyn-loader-core">
            <Sparkles className="w-16 h-16 text-white mx-auto" />
          </div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-5xl text-white mb-2 premium-heading"
        >
          Deep<span className="text-[#f6c7dc]">Skyn</span>
        </motion.h1>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "220px" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="h-1.5 bg-white/30 mx-auto rounded-full overflow-hidden"
        >
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-full w-1/2 bg-white rounded-full"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
