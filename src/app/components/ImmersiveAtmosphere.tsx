import { useEffect } from "react";
import { motion } from "motion/react";

export function ImmersiveAtmosphere() {
  useEffect(() => {
    const root = document.documentElement;

    const onMouseMove = (event: MouseEvent) => {
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      root.style.setProperty("--parallax-x", x.toFixed(4));
      root.style.setProperty("--parallax-y", y.toFixed(4));
    };

    const onScroll = () => {
      const ratio = Math.min(window.scrollY / Math.max(document.body.scrollHeight, 1), 1);
      root.style.setProperty("--parallax-scroll", ratio.toFixed(4));
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="deepskyn-future-atmosphere" aria-hidden="true">
      <motion.span
        className="future-orb orb-a"
        animate={{ y: [0, -24, 0], x: [0, 10, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="future-orb orb-b"
        animate={{ y: [0, 18, 0], x: [0, -12, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="future-orb orb-c"
        animate={{ y: [0, -18, 0], x: [0, 14, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="future-grid" />
      <span className="future-particles" />
      <span className="future-wave" />
    </div>
  );
}
