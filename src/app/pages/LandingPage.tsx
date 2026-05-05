import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import { Sparkles, Check, ArrowRight, Zap, Clock, Heart } from "lucide-react";
import { Button } from "../components/Button";
import { PageTransition } from "../components/PageTransition";
import { Interactive3DOrb } from "../components/Interactive3DOrb";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useLanguage } from "../contexts/LanguageContext";

const FACE_PORTRAIT_URL = "/src/assets/face-portrait.png";

export function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  return (
    <PageTransition direction="fade">
      <motion.div className="min-h-screen deepskyn-3d-page" ref={containerRef} style={{ opacity, scale }}>
        <span className="deepskyn-3d-shape one" aria-hidden="true" />
        <span className="deepskyn-3d-shape two" aria-hidden="true" />
        <span className="deepskyn-3d-shape three" aria-hidden="true" />

        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f9dbe6] via-[#f8f0fb] to-[#fff3eb] dark:from-[#2c2132] dark:via-[#241b2e] dark:to-[#241d32]">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#f1a9c2]/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ffd4bc]/30 rounded-full blur-3xl animate-pulse delay-75" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <div className="deepskyn-hero-shell px-6 py-12 lg:px-12">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-12"
              >
                <h1 className="text-5xl lg:text-6xl font-bold text-[#212437] mb-3 tracking-tight premium-heading">
                  DeepSkyn
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#c95785]" />
                  <p className="text-[#6b5864] text-sm tracking-wide uppercase">{t("landing.poweredByAi")}</p>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl lg:text-6xl font-bold text-[#1c2235] mb-6 leading-tight premium-heading"
              >
                {t("landing.heroTitleTop")}<br />
                <span className="text-[#b55f82]">{t("landing.heroTitleBottom")}</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg lg:text-xl text-[#5a5f73] mb-12 max-w-3xl mx-auto leading-relaxed"
              >
                {t("landing.heroSubtitle")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-wrap justify-center gap-8 mb-12"
              >
                <div className="deepskyn-feature-pill flex flex-col items-center gap-3 px-6 py-5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg">
                  <div className="deepskyn-icon-orb w-16 h-16 backdrop-blur-md flex items-center justify-center rounded-xl border border-white/30">
                    <Zap className="w-8 h-8 text-[#c95785]" />
                  </div>
                  <p className="text-[#344056] dark:text-gray-200 font-medium">{t("landing.smartAnalysis")}</p>
                </div>
                <div className="deepskyn-feature-pill flex flex-col items-center gap-3 px-6 py-5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg">
                  <div className="deepskyn-icon-orb w-16 h-16 backdrop-blur-md flex items-center justify-center rounded-xl border border-white/30">
                    <Clock className="w-8 h-8 text-[#c95785]" />
                  </div>
                  <p className="text-[#344056] dark:text-gray-200 font-medium">{t("landing.instantResults")}</p>
                </div>
                <div className="deepskyn-feature-pill flex flex-col items-center gap-3 px-6 py-5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg">
                  <div className="deepskyn-icon-orb w-16 h-16 backdrop-blur-md flex items-center justify-center rounded-xl border border-white/30">
                    <Heart className="w-8 h-8 text-[#c95785]" />
                  </div>
                  <p className="text-[#344056] dark:text-gray-200 font-medium">{t("landing.personalizedCare")}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <button
                  onClick={() => navigate("/questionnaire")}
                  className="deepskyn-neo-button group relative px-12 py-5 text-white text-lg font-semibold transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    {t("landing.getStarted")}
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </span>
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-14 lg:py-20">
          <div className="grid lg:grid-cols-[0.98fr_1fr] gap-10 lg:gap-8 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl">
              <div className="deepskyn-feature-pill mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-[#c95785]" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t("landing.leftBadge")}</span>
              </div>

              <h1 className="text-5xl lg:text-6xl mb-6 text-[#11142a] dark:text-white leading-tight premium-heading">
                {t("landing.leftTitleTop")}<br />
                <span className="text-[#c95785]">{t("landing.leftTitleBottom")}</span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
                {t("landing.leftDescription")}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Button glow onClick={() => navigate("/questionnaire")} className="deepskyn-neo-button px-8 py-3">
                  {t("landing.takeFreeQuiz")}
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")} className="deepskyn-surface-card px-8 py-3 border-white/70">
                  {t("landing.viewScience")}
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <ImageWithFallback src="https://images.unsplash.com/photo-1631885628966-a14af9faaa9b?w=100&h=100&fit=crop" alt="User" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                  <ImageWithFallback src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" alt="User" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                  <ImageWithFallback src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="User" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("landing.trustedBy")} <strong className="text-gray-900 dark:text-white">10,000+</strong> {t("landing.users")}
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[580px] min-h-[560px] lg:min-h-[610px]">
                <div className="deepskyn-hero-shell relative mx-auto w-[320px] sm:w-[360px] rounded-[22px] p-4 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <Interactive3DOrb imageUrl={FACE_PORTRAIT_URL} />
                </div>

                <div className="absolute top-6 right-4 deepskyn-chip-card">
                  <p className="deepskyn-chip-title">{t("landing.analysisCardTitle")}</p>
                  <p className="deepskyn-chip-value">{t("landing.analysisCardAccuracy")}</p>
                </div>

                <motion.div className="absolute top-[108px] left-[0px] sm:left-[-22px] deepskyn-chip-card" animate={{ y: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                  <p className="deepskyn-chip-value">{t("landing.moisture")}</p>
                  <div className="deepskyn-chip-bars" />
                </motion.div>

                <motion.div className="absolute top-[170px] right-[0px] sm:right-[-22px] deepskyn-chip-card" animate={{ y: [0, 5, 0] }} transition={{ duration: 4.6, repeat: Infinity }}>
                  <p className="deepskyn-chip-value">{t("landing.texture")}</p>
                  <div className="deepskyn-chip-bars" />
                </motion.div>

                <motion.div className="absolute top-[286px] right-[-10px] sm:right-[-24px] deepskyn-chip-card" animate={{ y: [0, -5, 0] }} transition={{ duration: 4.2, repeat: Infinity }}>
                  <p className="deepskyn-chip-value">{t("landing.blemishes")}</p>
                </motion.div>

                <motion.div className="absolute top-[356px] right-[0px] sm:right-[-16px] deepskyn-chip-card" animate={{ y: [0, 4, 0] }} transition={{ duration: 5, repeat: Infinity }}>
                  <p className="deepskyn-chip-value">{t("landing.sunDamage")}</p>
                  <div className="deepskyn-chip-bars" />
                </motion.div>

                <motion.div className="absolute top-[376px] left-[6px] sm:left-[-16px] deepskyn-chip-card" animate={{ y: [0, 3, 0] }} transition={{ duration: 4.4, repeat: Infinity }}>
                  <p className="deepskyn-chip-value">{t("landing.ageEstimation")}</p>
                </motion.div>

                <motion.div className="deepskyn-assistant absolute bottom-[128px] left-[2px] sm:left-[-30px]" animate={{ y: [0, -4, 0] }} transition={{ duration: 4.8, repeat: Infinity }}>
                  <div className="deepskyn-assistant-avatar">
                    <Sparkles className="w-4 h-4 text-[#b25593]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#785f86] dark:text-[#c4b4d6]">{t("landing.guideName")}</p>
                    <p className="text-xs font-semibold text-[#2f3449] dark:text-[#f1e7fb]">{t("landing.guidePrompt")}</p>
                  </div>
                </motion.div>

                <div className="deepskyn-surface-card absolute -bottom-2 sm:bottom-2 right-2 sm:right-0 w-[260px] sm:w-[285px] rounded-[20px] backdrop-blur-xl p-4">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="rounded-[14px] bg-gradient-to-br from-[#e9f0ff] to-[#f4ecff] border border-[#d8e4ff] p-3 h-[94px]">
                      <ImageWithFallback src="https://images.unsplash.com/photo-1598662972299-5408ddb8a3dc?w=300" alt="Skincare bottle" className="w-full h-full object-contain" />
                    </div>
                    <div className="rounded-[14px] bg-gradient-to-br from-[#e9f0ff] to-[#f4ecff] border border-[#d8e4ff] p-3 h-[94px]">
                      <ImageWithFallback src="https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=300" alt="Skincare cream" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-[#22263d]">{t("landing.skinTypeLabel")}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(201, 87, 133, 0.2)" }} className="glass-card deepskyn-surface-card rounded-2xl p-8 text-center backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-2xl transition-all">
              <motion.h3 className="text-4xl font-semibold text-[#c95785] mb-2 premium-heading" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>100+</motion.h3>
              <p className="text-gray-600 dark:text-gray-400">{t("landing.aiModels")}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(201, 87, 133, 0.2)" }} className="glass-card deepskyn-surface-card rounded-2xl p-8 text-center backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-2xl transition-all">
              <motion.h3 className="text-4xl font-semibold text-[#c95785] mb-2 premium-heading" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}>50+</motion.h3>
              <p className="text-gray-600 dark:text-gray-400">{t("landing.skinConditions")}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(201, 87, 133, 0.2)" }} className="glass-card deepskyn-surface-card rounded-2xl p-8 text-center backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-2xl transition-all">
              <motion.h3 className="text-4xl font-semibold text-[#c95785] mb-2 premium-heading" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}>99.8%</motion.h3>
              <p className="text-gray-600 dark:text-gray-400">{t("landing.accuracyRate")}</p>
            </motion.div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white mb-4">{t("landing.innovationTitle")}</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t("landing.innovationSubtitle")}</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="glass-card deepskyn-surface-card rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="relative h-64 bg-gradient-to-br from-gray-900 to-teal-900 overflow-hidden">
                <ImageWithFallback src="https://images.unsplash.com/photo-1654430343142-2d6157e69887?w=600" alt="AI Face Analysis" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t("landing.deepAnalysisTitle")}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t("landing.deepAnalysisDescription")}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="glass-card deepskyn-surface-card rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="relative h-64 bg-gradient-to-br from-orange-100 to-orange-200 overflow-hidden">
                <ImageWithFallback src="https://images.unsplash.com/photo-1651740896477-467ea46b4fe5?w=600" alt="Bespoke skincare products" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t("landing.bespokeRoutineTitle")}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t("landing.bespokeRoutineDescription")}</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="grid grid-cols-2 gap-6">
              <div className="deepskyn-surface-card rounded-3xl p-8 flex items-center justify-center h-64">
                <ImageWithFallback src="https://images.unsplash.com/photo-1677726050511-48866c4a64d9?w=400" alt="Skincare bottle" className="w-full h-full object-contain" />
              </div>
              <div className="deepskyn-surface-card rounded-3xl p-8 flex items-center justify-center h-64">
                <ImageWithFallback src="https://images.unsplash.com/photo-1594813591867-02e797aa4581?w=400" alt="Skincare jar" className="w-full h-full object-contain" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white mb-6">
                {t("landing.molecularTitleTop")}<br />
                {t("landing.molecularTitleBottom")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">{t("landing.molecularDescription")}</p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#c95785] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{t("landing.fragranceFree")}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#c95785] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{t("landing.scientificallyBacked")}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#c95785] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{t("landing.clinicallyProven")}</p>
                </div>
              </div>

              <button className="deepskyn-surface-card rounded-full px-5 py-2.5 flex items-center gap-2 text-[#c95785] dark:text-[#dfb6f6] hover:gap-4 transition-all duration-300 group">
                <span className="font-semibold uppercase tracking-wider text-sm">{t("landing.discoverIngredients")}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card deepskyn-hero-shell rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#d96b95]/15 to-[#f29b77]/5" />
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white mb-6">
                {t("landing.ctaTitleTop")}<br />
                {t("landing.ctaTitleBottom")}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">{t("landing.ctaSubtitle")}</p>
              <div className="max-w-xl mx-auto mb-6">
                <input
                  type="email"
                  className="deepskyn-neo-input px-5 py-3 text-sm sm:text-base"
                  placeholder={t("landing.emailPlaceholder")}
                  aria-label="Email address"
                />
              </div>
              <Button glow onClick={() => navigate("/questionnaire")} className="deepskyn-neo-button px-10 py-4 text-lg">
                {t("landing.finalCta")}
              </Button>
            </div>
          </motion.div>
        </section>
      </motion.div>
    </PageTransition>
  );
}
