import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

interface Interactive3DOrbProps {
  imageUrl?: string;
}

export function Interactive3DOrb({ imageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop" }: Interactive3DOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [scrollY, setScrollY] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePos({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Draw face mesh overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 320;
    canvas.height = 320;

    // Draw animated face mesh grid
    const time = Date.now() / 1000;
    const rows = 8;
    const cols = 8;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines with wave effect
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + Math.sin(time) * 0.05})`;
    ctx.lineWidth = 1;

    for (let i = 0; i <= rows; i++) {
      ctx.beginPath();
      for (let j = 0; j <= cols; j++) {
        const x = (j / cols) * canvas.width;
        const y = (i / rows) * canvas.height + Math.sin(j * 0.5 + time) * 2;
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    for (let j = 0; j <= cols; j++) {
      ctx.beginPath();
      for (let i = 0; i <= rows; i++) {
        const x = (j / cols) * canvas.width + Math.sin(i * 0.5 + time) * 2;
        const y = (i / rows) * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Draw scanning points at intersections
    ctx.fillStyle = `rgba(201, 87, 133, ${0.4 + Math.sin(time * 2) * 0.3})`;
    for (let i = 0; i < rows; i += 2) {
      for (let j = 0; j < cols; j += 2) {
        const x = (j / cols) * canvas.width;
        const y = (i / rows) * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 2 + Math.sin(time + i + j) * 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Request next frame
    const animFrame = requestAnimationFrame(() => {});
    return () => cancelAnimationFrame(animFrame);
  }, []);

  // Calculate rotation based on mouse position
  const rotateX = (mousePos.y - 0.5) * 30;
  const rotateY = (mousePos.x - 0.5) * 30;
  const scrollRotate = (scrollY * 0.5) % 360;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] flex items-center justify-center"
      style={{ perspective: "1200px" }}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="absolute w-80 h-80 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(201, 87, 133, 0.4) 0%, rgba(201, 87, 133, 0) 70%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* 3D Orb Container */}
      <motion.div
        className="relative w-64 h-64 lg:w-80 lg:h-80"
        style={{
          transformStyle: "preserve-3d",
          rotateX: rotateX,
          rotateY: rotateY,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 60 }}
      >
        {/* Main Orb with Face Image */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden face-mesh-container"
          style={{
            boxShadow: `
              0 0 40px rgba(201, 87, 133, 0.6),
              inset -30px -30px 60px rgba(0, 0, 0, 0.1),
              inset 20px 20px 40px rgba(255, 255, 255, 0.3)
            `,
            backdropFilter: "blur(10px)",
          }}
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              `0 0 40px rgba(201, 87, 133, 0.6),
               inset -30px -30px 60px rgba(0, 0, 0, 0.1),
               inset 20px 20px 40px rgba(255, 255, 255, 0.3)`,
              `0 0 60px rgba(201, 87, 133, 0.8),
               inset -30px -30px 60px rgba(0, 0, 0, 0.15),
               inset 20px 20px 40px rgba(255, 255, 255, 0.4)`,
              `0 0 40px rgba(201, 87, 133, 0.6),
               inset -30px -30px 60px rgba(0, 0, 0, 0.1),
               inset 20px 20px 40px rgba(255, 255, 255, 0.3)`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Face Image */}
          <img
            src={imageUrl}
            alt="Face"
            className="face-mesh-image"
          />

          {/* Mesh Overlay Container */}
          <div className="face-mesh-overlay">
            {/* Mesh Canvas */}
            <canvas
              ref={canvasRef}
              className="face-mesh-canvas"
            />

            {/* Animated Grid */}
            <div className="face-mesh-grid" />

            {/* Scanning Line Effect */}
            <motion.div
              className="face-scanning-line"
              animate={{
                y: ["-100%", "100%"],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Glow Overlay */}
          <div className="face-glow-overlay" />
        </motion.div>

        {/* Rotating Ring */}
        <motion.div
          className="face-rotating-ring"
          style={{
            transformStyle: "preserve-3d",
          }}
          animate={{
            rotateZ: 360,
            rotateX: scrollRotate,
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Glowing Points */}
        {[0, 120, 240].map((angle, idx) => (
          <motion.div
            key={idx}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.9), rgba(201, 87, 133, 0.6))",
              boxShadow: "0 0 12px rgba(201, 87, 133, 0.8)",
              left: "50%",
              top: "50%",
              transformOrigin: "0 0",
              transform: `translate(-50%, -50%) rotateZ(${angle}deg) translateY(-140px)`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: idx * 0.4,
            }}
          />
        ))}

        {/* Floating Particles */}
        {[0, 1, 2, 3, 4].map((idx) => (
          <motion.span
            key={`particle-${idx}`}
            className="absolute w-1 h-1 rounded-full bg-white/60"
            style={{
              left: `${30 + idx * 15}%`,
              top: `${20 + idx * 12}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.sin(idx) * 10, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + idx * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      {/* Data Points Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Top-left data point */}
        <motion.div
          className="face-data-point top-1/4 left-1/4"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="face-data-point-core" />
          <p className="face-data-label">Hydration</p>
        </motion.div>

        {/* Bottom-right data point */}
        <motion.div
          className="face-data-point bottom-1/4 right-1/4"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.6 }}
        >
          <div className="face-data-point-core" />
          <p className="face-data-label">Elasticity</p>
        </motion.div>

        {/* Center analysis label */}
        {faceDetected && (
          <motion.div
            className="absolute bottom-12 left-1/2 transform -translate-x-1/2 px-3 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold text-white">AI Analysis Active</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
