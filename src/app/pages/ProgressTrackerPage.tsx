import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { PremiumFeatureLock } from '../components/PremiumFeatureLock';
import { PageTransition } from '../components/PageTransition';
import { BackButton } from '../components/BackButton';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { ProgressVisualization } from '../components/ProgressVisualization';
import { ProgressPhotoCard } from '../components/ProgressPhotoCard';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  Camera, TrendingUp, Calendar, Sun,
  Moon, Activity, Droplets, LayoutGrid, ArrowRightLeft, X,
  Zap, CheckCircle, ArrowRight
} from 'lucide-react';

export default function ProgressTrackerPage() {
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const token = auth?.token;
  const { hasAccess, tierName, requiredTierName } = useFeatureAccess("progress_tracker");

  // Check if user has access to this feature
  if (token && !hasAccess) {
    return (
      <PremiumFeatureLock
        featureName="Progress Tracker"
        description="Track your transformation with AI insights to see your skincare journey progress over time."
        currentPlan={tierName}
        requiredPlan={requiredTierName}
      />
    );
  }

  const [activeTab, setActiveTab] = useState<'timeline' | 'compare'>('timeline');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      console.log('auth =', auth);
      console.log('ProgressTracker token =', token);

      if (!token) {
        toast.error('You are not authenticated.');
        setIsLoading(false);
        return;
      }

      try {
        const API = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";
        const res = await axios.get(
          `${API}/users/progress-history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setPhotos(res.data || []);
      } catch (err: any) {
        console.error('Progress history error:', err?.response || err);

        if (err?.response?.status === 403) {
          toast.error('Access forbidden. Your token may be invalid or expired.');
        } else if (err?.response?.status === 401) {
          toast.error('You are not authenticated.');
        } else {
          toast.error('History could not be loaded.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [token, auth]);

  const toggleSelect = (id: string) => {
    if (selectedPhotos.includes(id)) {
      setSelectedPhotos((prev) => prev.filter((x) => x !== id));
    } else if (selectedPhotos.length < 2) {
      setSelectedPhotos((prev) => [...prev, id]);
    } else {
      toast.error('You can only compare 2 photos at a time.');
    }
  };

  const getComparisonData = () => {
    const selected = photos.filter((p) => selectedPhotos.includes(p.id));
    return selected.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff8f3] to-[#ffe8dc] dark:from-[#1a0f0c] dark:to-[#241208] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-orange-300/40 border-t-orange-500"
        />
      </div>
    );
  }

  const comparisonItems = getComparisonData();

  return (
    <PageTransition direction="fade">
      <div className="relative isolate min-h-screen overflow-hidden bg-gradient-to-br from-[#fff8f3] via-[#fff0eb] to-[#ffe8dc] dark:from-[#1a0f0c] dark:via-[#2d1a15] dark:to-[#241208] flex flex-col items-center justify-center p-6 py-12">
        {/* ATMOSPHERIC BACKGROUND */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {/* Animated gradient orbs */}
          <motion.div
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 138, 122, 0.35), rgba(255, 180, 160, 0.1), transparent)",
            }}
            animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(242, 184, 160, 0.3), rgba(255, 200, 180, 0.1), transparent)",
            }}
            animate={{ x: [0, -60, 0], y: [0, -50, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 -right-64 w-96 h-96 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 160, 130, 0.25), rgba(220, 120, 100, 0.05), transparent)",
            }}
            animate={{ x: [0, -100, 0], y: [0, 80, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(220, 100, 80, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(220, 100, 80, 0.3) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Floating particles */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-orange-400/40"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="relative z-10 w-full max-w-7xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <BackButton />
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/40 bg-white/70 dark:bg-slate-900/40 px-4 py-2 text-xs font-semibold tracking-wider text-orange-600 dark:text-orange-400 mb-4 backdrop-blur-md">
              <TrendingUp className="w-3.5 h-3.5" />
              SKINCARE PROGRESS TRACKING
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-3 flex items-center justify-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="w-12 h-12 text-orange-500" />
              </motion.div>
              Progress Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Track your transformation with AI insights
            </p>
          </motion.div>

          {/* Tab Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-4 mb-8 justify-center flex-wrap"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('timeline')}
              className={`px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
                activeTab === 'timeline'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40'
                  : 'bg-white/60 dark:bg-slate-900/60 text-gray-700 dark:text-gray-300 border border-orange-200/40 dark:border-orange-700/30 backdrop-blur-md'
              }`}
            >
              <LayoutGrid className="w-4 h-4 inline mr-2" />
              Timeline
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (selectedPhotos.length < 2) {
                  toast.error('Select 2 photos to compare');
                } else {
                  setActiveTab('compare');
                }
              }}
              className={`px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
                activeTab === 'compare'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40'
                  : 'bg-white/60 dark:bg-slate-900/60 text-gray-700 dark:text-gray-300 border border-orange-200/40 dark:border-orange-700/30 backdrop-blur-md'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 inline mr-2" />
              Compare
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/upload')}
              className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all border border-orange-400/50"
            >
              <Camera className="w-4 h-4 inline mr-2" />
              New Photo
            </motion.button>
          </motion.div>

          {/* Timeline View */}
          {activeTab === 'timeline' ? (
            <>
              {/* Health Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-12"
              >
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-orange-500" />
                  Health & Lifestyle
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { l: 'Avg Sleep', v: '7.5h', s: 'Optimal', i: Moon, c: 'text-purple-600', bg: 'from-purple-500/20 to-purple-600/10' },
                    { l: 'UV Exposure', v: '3/10', s: 'Moderate', i: Sun, c: 'text-orange-500', bg: 'from-orange-500/20 to-orange-600/10' },
                    { l: 'Daily Water', v: '8', s: 'Excellent', i: Droplets, c: 'text-blue-500', bg: 'from-blue-500/20 to-blue-600/10' },
                    { l: 'Stress Level', v: '4/10', s: 'Manageable', i: Zap, c: 'text-pink-500', bg: 'from-pink-500/20 to-pink-600/10' },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      whileHover={{ scale: 1.05, y: -4 }}
                    >
                      <GlassCard className={`bg-gradient-to-br ${stat.bg} border border-orange-200/40 dark:border-orange-700/30 p-6 text-center backdrop-blur-xl`}>
                        <div className="flex items-center justify-center mb-3">
                          <stat.i className={`${stat.c} w-8 h-8`} />
                        </div>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                          {stat.v}
                        </p>
                        <p className="text-xs uppercase tracking-wider font-bold text-gray-600 dark:text-gray-400 mb-2">
                          {stat.l}
                        </p>
                        <p className={`text-xs font-bold uppercase tracking-wider ${stat.c}`}>
                          {stat.s}
                        </p>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Progress Visualization */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-12 flex items-center justify-center"
              >
                <ProgressVisualization
                  selectedCount={selectedPhotos.length}
                  totalPhotos={photos.length}
                />
              </motion.div>

              {/* Photo Timeline Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-orange-500" />
                  Your Journey ({photos.length} photos)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {photos.map((photo, index) => (
                      <ProgressPhotoCard
                        key={photo.id}
                        imageUrl={photo.imageUrl}
                        date={photo.date}
                        time={photo.time}
                        notes={photo.notes}
                        isSelected={selectedPhotos.includes(photo.id)}
                        selectionIndex={
                          selectedPhotos.includes(photo.id)
                            ? selectedPhotos.indexOf(photo.id) + 1
                            : undefined
                        }
                        index={index}
                        onClick={() => toggleSelect(photo.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </>
          ) : (
            /* Comparison View */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <GlassCard className="bg-gradient-to-br from-white/80 to-orange-50/40 dark:from-slate-900/80 dark:to-orange-900/20 border border-orange-300/50 dark:border-orange-700/30 p-8 backdrop-blur-xl mb-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                      <CheckCircle className="w-8 h-8 text-orange-500" />
                    </motion.div>
                    Side-by-Side Analysis
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setActiveTab('timeline');
                      setSelectedPhotos([]);
                    }}
                    className="p-2 rounded-lg bg-white/50 dark:bg-slate-900/50 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                </div>

                {/* Comparison Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {comparisonItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: idx * 0.2 }}
                      className="space-y-4"
                    >
                      {/* Image */}
                      <div className="relative aspect-square rounded-2xl overflow-hidden border-4 border-orange-300/40 dark:border-orange-700/30 shadow-2xl shadow-orange-500/20">
                        <img
                          src={item.imageUrl}
                          alt="Comparison"
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute top-4 left-4 px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-xs text-white backdrop-blur-md ${
                          idx === 0
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                            : 'bg-gradient-to-r from-green-500 to-green-600'
                        }`}>
                          {idx === 0 ? 'Before' : 'After'}
                        </div>
                      </div>

                      {/* Details */}
                      <GlassCard className="bg-white/60 dark:bg-slate-900/60 border border-orange-200/40 dark:border-orange-700/30 p-4 backdrop-blur-xl">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg text-gray-800 dark:text-white">
                            {item.date}
                          </h4>
                          <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full backdrop-blur-md ${
                            item.time === 'morning'
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                              : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                          }`}>
                            {item.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                          "{item.notes}"
                        </p>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>

                {/* Progress Alert */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 dark:from-green-900/30 dark:to-emerald-900/20 border border-green-300/60 dark:border-green-700/40 rounded-xl p-6 flex items-center gap-4"
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg"
                  >
                    <CheckCircle className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h4 className="font-bold text-green-700 dark:text-green-400 text-lg">
                      Progress Detected! 🎉
                    </h4>
                    <p className="text-sm text-green-600 dark:text-green-400 opacity-90">
                      Visible improvement in hydration and skin texture since your first analysis.
                    </p>
                  </div>
                </motion.div>
              </GlassCard>
            </motion.div>
          )}

          {/* Action Buttons */}
          {activeTab === 'timeline' && selectedPhotos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-12 flex gap-4 justify-center flex-wrap"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={() => setSelectedPhotos([])}
                  className="h-12 px-6"
                >
                  Clear Selection
                </Button>
              </motion.div>
              {selectedPhotos.length === 2 && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    glow
                    onClick={() => setActiveTab('compare')}
                    className="h-12 px-8 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold"
                  >
                    Compare Selected Photos
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}