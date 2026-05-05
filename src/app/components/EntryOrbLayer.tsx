import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LayoutDashboard, Scan, User, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type EntryItem = {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
};

const ENTRY_SEEN_KEY = "deepskyn-entry-seen";

const menuItems: EntryItem[] = [
  { label: "Scan Face", path: "/scanner", icon: Scan },
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", path: "/profile", icon: User },
  { label: "Analysis", path: "/results", icon: Sparkles },
];

const positions = [
  "-top-20 left-1/2 -translate-x-1/2",
  "top-1/2 -right-24 -translate-y-1/2",
  "-bottom-20 left-1/2 -translate-x-1/2",
  "top-1/2 -left-24 -translate-y-1/2",
];

export function EntryOrbLayer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const shouldRun = useMemo(() => {
    return location.pathname === "/";
  }, [location.pathname]);

  useEffect(() => {
    if (!shouldRun) {
      setVisible(false);
      return;
    }

    const seen = window.sessionStorage.getItem(ENTRY_SEEN_KEY);
    setVisible(!seen);
  }, [shouldRun]);

  const handleReveal = () => {
    setMenuOpen(true);
  };

  const handleNavigate = (path: string) => {
    window.sessionStorage.setItem(ENTRY_SEEN_KEY, "1");
    setVisible(false);
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          aria-label="Entry menu"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,244,238,0.88),rgba(248,238,255,0.92),rgba(249,236,246,0.96))] backdrop-blur-md" />

          <motion.div
            className="absolute w-[320px] h-[320px] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(217, 107, 149, 0.30) 0%, rgba(192, 138, 223, 0.24) 42%, rgba(242, 198, 168, 0) 74%)",
            }}
            animate={{
              scale: [1, 1.12, 1],
              opacity: [0.6, 0.9, 0.6],
            }}
            transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative flex items-center justify-center">
            {Array.from({ length: 18 }).map((_, idx) => {
              const angle = (idx / 18) * Math.PI * 2;
              const radius = 130 + (idx % 3) * 18;
              const left = Math.cos(angle) * radius;
              const top = Math.sin(angle) * radius;

              return (
                <motion.span
                  key={`entry-p-${idx}`}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    left,
                    top,
                    background:
                      idx % 2 === 0 ? "rgba(217, 107, 149, 0.55)" : "rgba(189, 140, 222, 0.48)",
                    boxShadow:
                      idx % 2 === 0
                        ? "0 0 10px rgba(217, 107, 149, 0.35)"
                        : "0 0 10px rgba(189, 140, 222, 0.32)",
                  }}
                  animate={{ y: [0, -8, 0], opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2.8 + idx * 0.05, repeat: Infinity, ease: "easeInOut", delay: idx * 0.03 }}
                />
              );
            })}

            <motion.button
              type="button"
              onClick={handleReveal}
              className="relative w-52 h-52 rounded-full border border-white/70 shadow-[0_26px_64px_rgba(192,122,158,0.3)] backdrop-blur-xl focus:outline-none"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.88) 0%, rgba(242, 184, 205, 0.65) 44%, rgba(202, 157, 234, 0.58) 72%, rgba(243, 202, 170, 0.55) 100%)",
              }}
              initial={{ y: 8, scale: 0.95 }}
              animate={{ y: [0, -8, 0], scale: [1, 1.04, 1] }}
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
              aria-label="Open entry menu"
            >
              <span className="absolute inset-[8px] rounded-full border border-white/55 bg-white/12" />
              <span className="absolute inset-[14px] rounded-full border border-white/45" />
              <span className="relative z-10 text-[13px] uppercase tracking-[0.26em] font-bold text-[#5f4559]">Enter</span>
            </motion.button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  {menuItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.label}
                        type="button"
                        onClick={() => handleNavigate(item.path)}
                        className={`absolute ${positions[idx]} min-w-[132px] px-4 py-3 rounded-2xl border border-white/65 bg-white/38 backdrop-blur-xl shadow-[0_18px_36px_rgba(188,112,145,0.22)] text-[#493847] font-semibold text-sm flex items-center justify-center gap-2`}
                        initial={{ opacity: 0, scale: 0.8, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.86, y: 6 }}
                        transition={{ duration: 0.35, delay: idx * 0.07, ease: "easeOut" }}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </motion.button>
                    );
                  })}
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
