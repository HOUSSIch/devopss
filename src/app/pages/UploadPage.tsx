import { useState, ChangeEvent, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";


import { Button } from "../components/Button";
import { GlassCard } from "../components/GlassCard";
import { ProgressIndicator } from "../components/ProgressIndicator";
import { PageTransition } from "../components/PageTransition";
import { ScannerCore } from "../components/ScannerCore";
import { ScannerActions } from "../components/ScannerActions";

import { motion, AnimatePresence } from "motion/react";
import { Upload, AlertCircle, X, Crown, Camera, Info } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { usePhotoLimit } from "../../hooks/useFeatureAccess";
import { toast } from "sonner";

const cameraCrystal = new URL("../../assets/hd_restoration_result_image.png", import.meta.url).href;

export function UploadPage() {
  const navigate = useNavigate();
  const { token, isAuthenticated, isInitialized, login, refreshNow } = useAuth();
  const { maxPhotos } = usePhotoLimit();

  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [isCentered, setIsCentered] = useState(false);
  const isLimitReached = files.length >= maxPhotos;

  const webcamRef = useRef<Webcam | null>(null);

  // 🔊 SOUND FIX (UNLOCK AFTER USER CLICK)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const initSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/beep.mp3");

      // unlock audio (browser requirement)
      audioRef.current
        .play()
        .then(() => {
          audioRef.current?.pause();
          if (audioRef.current) audioRef.current.currentTime = 0;
        })
        .catch(() => {});
    }
  };

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const previewUrls = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // 📂 Upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const incomingFiles = Array.from(e.target.files);
    const newFiles = incomingFiles.filter((file) => file.type.startsWith("image/"));
    const remainingSlots = maxPhotos - files.length;

    if (newFiles.length !== incomingFiles.length) {
      toast.error("Only image files are allowed");
    }

    if (remainingSlots === 0) {
      toast.error(`Max ${maxPhotos} images reached`);
      return;
    }

    setFiles((prev) => [...prev, ...newFiles.slice(0, remainingSlots)]);
  };

  // ❌ remove
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 📸 capture
  const capturePhoto = () => {
    if (files.length >= maxPhotos) {
      toast.error(`Max ${maxPhotos} images reached`);
      return;
    }

    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const byteString = atob(imageSrc.split(",")[1]);
    const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const file = new File([ab], "camera.jpg", { type: mimeString });

    setFiles((prev) => [...prev, file].slice(0, maxPhotos));
    setShowCamera(false);
  };

  // 🎯 simple center effect (visual only)
  useEffect(() => {
    if (!showCamera) return;

    const interval = setInterval(() => {
      const centered = Math.random() > 0.5;

      setIsCentered(centered);

      if (centered) {
        playSound();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [showCamera]);

  // 🚀 analyze
  const handleAnalyze = async () => {
    if (!files.length) return toast.error("Upload at least one photo");

    if (!isInitialized) return toast.error("Auth initializing...");
    if (!isAuthenticated) {
      login("/upload");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("image", files[0]);

    try {
      await refreshNow();

      const API = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";
      const res = await fetch(`${API}/ai/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Error");

      localStorage.setItem("skinAnalysisResult", JSON.stringify(data));
      navigate("/results");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageTransition direction="left">
      <div className="relative isolate min-h-screen overflow-hidden bg-[#f4edf9] dark:bg-[#1a0f2e] flex items-center justify-center p-4 pt-24 sm:p-6 sm:pt-20">
        {/* AI BACKGROUND LAYERS */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <motion.img
            src={cameraCrystal}
            alt=""
            aria-hidden="true"
            className="absolute right-[6%] top-[14%] w-[280px] sm:w-[340px] opacity-[0.28] blur-[0.4px]"
            style={{ filter: "drop-shadow(0 20px 42px rgba(165,103,255,0.28))" }}
            animate={{ y: [0, -22, 0], x: [0, -16, 0], rotate: [0, 1.8, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.img
            src={cameraCrystal}
            alt=""
            aria-hidden="true"
            className="absolute left-[5%] bottom-[8%] w-[190px] sm:w-[240px] opacity-[0.18] scale-x-[-1]"
            style={{ filter: "drop-shadow(0 14px 36px rgba(165,103,255,0.2))" }}
            animate={{ y: [0, 16, 0], x: [0, 12, 0], rotate: [0, -1.6, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(1200px 620px at 10% 10%, rgba(249,188,218,0.48), transparent 60%), radial-gradient(980px 560px at 90% 15%, rgba(196,145,255,0.42), transparent 58%), radial-gradient(820px 500px at 50% 92%, rgba(255,201,174,0.36), transparent 58%)",
            }}
          />

          <motion.div
            className="absolute -top-28 -left-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(252,197,223,0.62),rgba(252,197,223,0)_70%)] blur-3xl"
            animate={{ x: [0, 52, 0], y: [0, 30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-[22%] -right-28 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle_at_center,rgba(205,171,255,0.52),rgba(205,171,255,0)_70%)] blur-3xl"
            animate={{ x: [0, -42, 0], y: [0, -26, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-32 left-[24%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,199,173,0.48),rgba(255,199,173,0)_72%)] blur-3xl"
            animate={{ x: [0, 36, 0], y: [0, -32, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute -left-[35%] top-[-20%] h-[180%] w-[55%] rotate-[16deg] opacity-[0.3]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0), rgba(247,189,220,0.94), rgba(196,145,255,0.7), rgba(255,255,255,0))",
              filter: "blur(42px)",
            }}
            animate={{ x: ["0%", "280%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />

          {/* Floating AI particles */}
          <motion.div
            className="absolute left-[5%] top-[18%] h-36 w-36 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,218,236,0.98),rgba(255,218,236,0))] blur-2xl"
            animate={{ x: [0, 78, 0], y: [0, -52, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute right-[7%] top-[30%] h-32 w-32 rounded-full bg-[radial-gradient(circle_at_40%_35%,rgba(210,183,255,0.94),rgba(210,183,255,0))] blur-2xl"
            animate={{ x: [0, -64, 0], y: [0, 42, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute left-[16%] bottom-[11%] h-28 w-28 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,218,193,0.92),rgba(255,218,193,0))] blur-xl"
            animate={{ x: [0, 54, 0], y: [0, -34, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute right-[14%] bottom-[16%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(233,198,255,0.84),rgba(233,198,255,0))] blur-2xl"
            animate={{ x: [0, -58, 0], y: [0, -40, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          {["left-[10%] top-[12%]", "left-[84%] top-[16%]", "left-[78%] top-[72%]", "left-[20%] top-[70%]", "left-[64%] top-[26%]", "left-[35%] top-[82%]"]
            .map((position, index) => (
              <motion.span
                key={position}
                className={`absolute ${position} h-2.5 w-2.5 rounded-full bg-white/80 shadow-[0_0_18px_rgba(245,183,220,0.72)]`}
                animate={{ y: [0, -24, 0], x: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 4 + index * 0.5, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}

          <div
            className="absolute inset-0 opacity-[0.1] dark:opacity-[0.14]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(139,99,211,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(139,99,211,0.18) 1px, transparent 1px)",
              backgroundSize: "52px 52px",
            }}
          />

          <div
            className="absolute inset-0 opacity-[0.12] dark:opacity-[0.16]"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, rgba(139,99,211,0.35) 1px, transparent 1.2px)",
              backgroundSize: "30px 30px",
            }}
          />

          <motion.div
            className="absolute inset-0 opacity-[0.14] dark:opacity-[0.2]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(180deg, rgba(139,99,211,0.3) 0px, rgba(139,99,211,0.3) 1px, transparent 1px, transparent 10px)",
            }}
            animate={{ y: [0, 34, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative z-10 w-full max-w-6xl">
          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <ProgressIndicator currentStep={3} totalSteps={4} />
          </motion.div>

          {/* Main scanner interface */}
          <div className="flex flex-col items-center gap-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center space-y-3"
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 dark:text-white">
                AI Skin Scanner
              </h2>
              <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
                Upload up to {maxPhotos} clear photos for advanced AI analysis
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-[#ead9fb] shadow-[0_10px_24px_rgba(139,99,211,0.08)]">
                <Crown className="w-4 h-4 text-[#8b63d3]" />
                <span className="text-sm font-semibold">
                  {maxPhotos} Image{maxPhotos > 1 ? 's' : ''} Limit
                </span>
              </div>
            </motion.div>

            {/* Scanner Core Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full flex items-center justify-center"
              style={{ height: 400 }}
            >
              {/* Counter above scanner */}
              <motion.div
                className="absolute -top-16 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full border border-[#eddffb] bg-white/70 dark:bg-purple-900/20 backdrop-blur-xl shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    <strong className="text-[#8b63d3]">{files.length}</strong> / {maxPhotos} photos
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: maxPhotos }).map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index < files.length
                            ? "bg-[#8b63d3] scale-110"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Scanner Core */}
              <ScannerCore isScanning={uploading} />

              {/* Action Buttons */}
              <ScannerActions
                onCamera={() => {
                  if (isLimitReached) {
                    toast.error(`Max ${maxPhotos} images reached`);
                    return;
                  }
                  initSound();
                  setShowCamera(true);
                }}
                onUpload={() => {
                  if (!isLimitReached) {
                    // Trigger hidden file input
                    const fileInput = document.getElementById("file-input") as HTMLInputElement;
                    fileInput?.click();
                  }
                }}
                disabled={isLimitReached}
              />
            </motion.div>

            {/* Photo Preview Grid */}
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Selected Photos
                </p>
                <div className="flex justify-center">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-2xl">
                    <AnimatePresence>
                      {files.map((file, index) => (
                        <motion.div
                          key={`${file.name}-${index}`}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          className="relative group"
                        >
                          <motion.div
                            className="aspect-square rounded-2xl overflow-hidden border border-[#eddffb] bg-white/40 backdrop-blur-sm"
                            whileHover={{ scale: 1.08 }}
                          >
                            <img
                              src={previewUrls[index]}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.div>

                          <button
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                            aria-label="Remove photo"
                          >
                            <X size={14} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Analyze Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full max-w-md"
            >
              <motion.div
                whileHover={!uploading ? { scale: 1.02 } : {}}
                whileTap={!uploading ? { scale: 0.98 } : {}}
              >
                <Button
                  glow
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-[#8b63d3] via-[#c95785] to-[#e8a1c0] hover:from-[#7a5325] hover:via-[#b83f6f] hover:to-[#d68fb0]"
                  onClick={handleAnalyze}
                  disabled={uploading || files.length === 0}
                >
                  {uploading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block mr-2"
                    >
                      ◆
                    </motion.div>
                  ) : (
                    "↗"
                  )}
                  {uploading ? "Analyzing Your Skin..." : "Analyze My Skin"}
                </Button>
              </motion.div>
            </motion.div>

            {/* Tips Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full"
            >
              <GlassCard className="bg-white/75 border border-[#eddffb] dark:bg-purple-900/20 p-6 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#8b63d3] mt-1 flex-shrink-0" />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p className="mb-3 font-semibold">For best results, capture from multiple angles:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Front view (face forward)</li>
                        <li>Left side profile</li>
                        <li>Right side profile</li>
                      </ul>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Use natural lighting</li>
                        <li>Remove makeup if possible</li>
                        <li>Ensure photos are clear and focused</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Hidden file input */}
          <input
            id="file-input"
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {/* CAMERA MODAL - Enhanced UI */}
        {showCamera && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="relative w-[min(95vw,800px)]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                className="w-full rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
              />

              {/* 🎯 ENHANCED SCANNER OVAL GUIDE */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-3xl overflow-hidden">
                <div className="relative h-80 w-64 sm:h-96 sm:w-72">
                  {/* Main oval frame */}
                  <motion.div
                    className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${
                      isCentered
                        ? "border-emerald-300/90"
                        : "border-white/50"
                    }`}
                    style={{
                      boxShadow: isCentered
                        ? "0 0 50px rgba(52,211,153,0.6), inset 0 0 40px rgba(52,211,153,0.3)"
                        : "0 0 40px rgba(206,154,255,0.4), inset 0 0 30px rgba(245,183,220,0.25)",
                    }}
                    animate={{ scale: isCentered ? [1, 1.02, 1] : [1, 1.01, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Inner frame */}
                  <motion.div
                    className="absolute inset-1 rounded-full border border-[#eebee2]/80"
                    style={{
                      boxShadow: "0 0 30px rgba(195,140,255,0.35)",
                    }}
                    animate={{ opacity: [0.5, 0.9, 0.5] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Scanning line */}
                  <motion.div
                    className="absolute left-1/2 top-2 h-1 w-40 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-white/80 to-transparent"
                    animate={{ y: [0, 300, 0], opacity: [0.2, 0.9, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Corner markers */}
                  {[
                    "-left-2 top-8",
                    "-left-2 bottom-8",
                    "-right-2 top-8",
                    "-right-2 bottom-8",
                  ].map((position) => (
                    <motion.span
                      key={position}
                      className={`absolute ${position} h-2 w-2 rounded-full bg-white/95 shadow-[0_0_16px_rgba(255,255,255,0.9)]`}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ))}
                </div>
              </div>

              {/* Close button */}
              <motion.button
                onClick={() => setShowCamera(false)}
                className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/30 flex items-center justify-center transition-all backdrop-blur-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Close camera"
              >
                <X size={20} />
              </motion.button>

              {/* Action buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 mt-6 justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  onClick={capturePhoto}
                  className="sm:w-auto px-8 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  glow
                >
                  📷 Capture Photo
                </Button>
                <Button
                  onClick={() => setShowCamera(false)}
                  variant="secondary"
                  className="sm:w-auto px-8 h-12"
                >
                  Cancel
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

      </div>
    </PageTransition>
  );
}