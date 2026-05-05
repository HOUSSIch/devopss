import { useEffect, useMemo, useState } from 'react';
import { Trophy, Award, Flame, Star, Gift, Sparkles, TrendingUp, Lock, Check, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { PremiumFeatureLock } from '../components/PremiumFeatureLock';
import {
  rewardsService,
  type RewardsBadge,
  type RewardsPageData,
} from '../api/rewards.service';

const DEFAULT_USER_STATS: RewardsPageData['userStats'] = {
  currentStreak: 0,
  longestStreak: 0,
  totalPoints: 0,
  level: 1,
  pointsToNextLevel: 600,
  routinesCompleted: 0,
  productsScanned: 0,
  articlesRead: 0,
};

const getRarityColor = (rarity: RewardsBadge['rarity']) => {
  switch (rarity) {
    case 'common':
      return 'from-gray-400 to-gray-500';
    case 'rare':
      return 'from-[#6ba5d6] to-[#3ec3b4]';
    case 'epic':
      return 'from-[#cc5f57] to-[#f2b8a0]';
    case 'legendary':
      return 'from-[#e0a325] to-[#ff8a7a]';
    default:
      return 'from-gray-400 to-gray-500';
  }
};

const getRarityBorder = (rarity: RewardsBadge['rarity']) => {
  switch (rarity) {
    case 'common':
      return 'border-gray-300';
    case 'rare':
      return 'border-[#6ba5d6]';
    case 'epic':
      return 'border-[#cc5f57]';
    case 'legendary':
      return 'border-[#e0a325] shadow-[#f2d8a5]';
    default:
      return 'border-gray-300';
  }
};

const formatDate = (value: string | null) => {
  if (!value) return 'Recently unlocked';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently unlocked';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function RewardsPage() {
  const { token } = useAuth();
  const { hasAccess, tierName, requiredTierName } = useFeatureAccess("rewards");
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'rewards'>('overview');
  const [pageData, setPageData] = useState<RewardsPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimingRewardId, setClaimingRewardId] = useState<string | null>(null);

  const userStats = pageData?.userStats ?? DEFAULT_USER_STATS;
  const badges = pageData?.badges ?? [];
  const rewards = pageData?.rewards ?? [];

  const unlockedBadges = useMemo(
    () => badges.filter((badge) => badge.unlocked),
    [badges],
  );

  const levelProgress = userStats.level >= 10
    ? 100
    : Math.max(0, Math.min(100, ((600 - userStats.pointsToNextLevel) / 600) * 100));

  const daysUntilNextBadge = Math.max(0, 7 - (userStats.currentStreak % 7 || 7));

  const loadRewards = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await rewardsService.getRewardsPageData();
      setPageData(data);
    } catch (err: any) {
      console.error('Failed to load rewards data:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      if (!token) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setLoading(true);
        setError('');
      }

      try {
        const data = await rewardsService.getRewardsPageData();

        if (isMounted) {
          setPageData(data);
        }
      } catch (err: any) {
        console.error('Failed to load rewards data:', err);

        if (isMounted) {
          setError(err?.response?.data?.message || err?.message || 'Failed to load rewards data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (token) {
      run();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [token, hasAccess]);

  const claimReward = async (rewardId: string) => {
    setClaimingRewardId(rewardId);

    try {
      await rewardsService.claimReward(rewardId);
      await loadRewards();
    } catch (err: any) {
      console.error('Failed to claim reward:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to claim reward');
    } finally {
      setClaimingRewardId(null);
    }
  };

  // Check if user has access to this feature
  if (token && !hasAccess) {
    return (
      <PremiumFeatureLock
        featureName="Rewards Program"
        description="Earn points and badges by completing daily routines, scanning products, and reading articles. Redeem rewards for exclusive discounts and products."
        currentPlan={tierName}
        requiredPlan={requiredTierName}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdf8f3] via-[#fff7ef] to-[#ffece2] pt-24 pb-16 px-4 deepskyn-atmosphere">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/60 bg-white/80 p-10 text-center shadow-xl backdrop-blur-lg">
            <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-[#ff8a7a] border-t-transparent" />
            <h2 className="text-2xl font-bold text-gray-900">Loading your rewards</h2>
            <p className="mt-2 text-gray-600">Fetching your live points, badges, and rewards catalog.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !pageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdf8f3] via-[#fff7ef] to-[#ffece2] pt-24 pb-16 px-4 deepskyn-atmosphere">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-red-200 bg-white/85 p-10 text-center shadow-xl backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-gray-900">Rewards unavailable</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              type="button"
              onClick={loadRewards}
              className="mt-6 rounded-xl bg-gradient-to-r from-[#ff8a7a] to-[#f2b8a0] px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf8f3] via-[#fff7ef] to-[#ffece2] pt-24 pb-16 px-4 deepskyn-atmosphere">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#ff8a7a] to-[#f2b8a0] mb-4 shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Rewards & Achievements
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay consistent, earn rewards, and unlock exclusive benefits on your skincare journey.
          </p>
        </div>

        {error && pageData && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#ff8a7a] to-[#f2b8a0] text-white shadow-lg'
                : 'bg-white/70 text-gray-700 hover:bg-white/90 border border-white/50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
              activeTab === 'badges'
                ? 'bg-gradient-to-r from-[#ff8a7a] to-[#f2b8a0] text-white shadow-lg'
                : 'bg-white/70 text-gray-700 hover:bg-white/90 border border-white/50'
            }`}
          >
            Badges
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-4 rounded-xl font-semibold transition-all ${
              activeTab === 'rewards'
                ? 'bg-gradient-to-r from-[#ff8a7a] to-[#f2b8a0] text-white shadow-lg'
                : 'bg-white/70 text-gray-700 hover:bg-white/90 border border-white/50'
            }`}
          >
            Rewards Shop
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Streak */}
              <div className="backdrop-blur-lg bg-gradient-to-br from-[#ffd9c5]/60 to-[#ffb7a0]/60 rounded-3xl p-6 border border-[#f2b8a0]/70 shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Current Streak</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">{userStats.currentStreak}</span>
                      <span className="text-xl font-semibold text-gray-600">days</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                    <Flame className="w-8 h-8 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Keep it up! {daysUntilNextBadge} more day{daysUntilNextBadge === 1 ? '' : 's'} for the next badge.
                </p>
              </div>

              {/* Total Points */}
              <div className="backdrop-blur-lg bg-gradient-to-br from-[#ffe7d3]/70 to-[#ffd6cf]/70 rounded-3xl p-6 border border-[#f2b8a0]/70 shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Total Points</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">{userStats.totalPoints.toLocaleString()}</span>
                      <span className="text-xl font-semibold text-gray-600">pts</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff8a7a] to-[#f2b8a0] flex items-center justify-center shadow-lg">
                    <Star className="w-8 h-8 text-white fill-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">{userStats.pointsToNextLevel} points to Level {userStats.level + 1}</p>
              </div>

              {/* Level */}
              <div className="backdrop-blur-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-3xl p-6 border border-emerald-500/30 shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Current Level</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">{userStats.level}</span>
                      <span className="text-xl font-semibold text-gray-600">/ 10</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-xl p-8 border border-white/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-[#cc5f57]" />
                Your Activity
              </h2>
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#cc5f57] mb-2">
                    {userStats.routinesCompleted}
                  </div>
                  <div className="text-sm text-gray-600">Routines Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#cc5f57] mb-2">
                    {userStats.productsScanned}
                  </div>
                  <div className="text-sm text-gray-600">Products Scanned</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#cc5f57] mb-2">
                    {userStats.articlesRead}
                  </div>
                  <div className="text-sm text-gray-600">Articles Read</div>
                </div>
              </div>
            </div>

            {/* Recent Badges */}
            <div className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-xl p-8 border border-white/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-[#8b63d3]" />
                Recently Unlocked
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {unlockedBadges.slice(0, 4).map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-6 rounded-2xl border-2 ${getRarityBorder(badge.rarity)} bg-white shadow-lg text-center`}
                  >
                    <div className="text-5xl mb-3">{badge.icon}</div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm">{badge.name}</h3>
                    <p className="text-xs text-gray-600">{formatDate(badge.unlockedAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            {/* Progress Summary */}
            <div className="backdrop-blur-lg bg-white/80 rounded-2xl shadow-xl p-6 border border-white/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {unlockedBadges.length} / {badges.length} Badges Unlocked
                  </h3>
                  <p className="text-gray-600">Keep completing activities to unlock more rewards!</p>
                </div>
                <div className="text-5xl">🏅</div>
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-[#8b63d3] to-[#6b46b8] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${badges.length ? (unlockedBadges.length / badges.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`backdrop-blur-lg rounded-2xl p-6 border-2 shadow-lg text-center transition-all ${
                    badge.unlocked
                      ? `${getRarityBorder(badge.rarity)} bg-white hover:scale-105`
                      : 'border-gray-300 bg-gray-100/50 opacity-60'
                  }`}
                >
                  <div className="relative inline-block mb-4">
                    <div className="text-6xl">{badge.icon}</div>
                    {badge.unlocked && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center border-2 border-white">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {!badge.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{badge.name}</h3>
                  <p className="text-xs text-gray-600 mb-3">{badge.description}</p>
                  {badge.unlocked ? (
                    <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                      Unlocked
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold">
                      {badge.requirement}
                    </span>
                  )}
                  {badge.rarity && (
                    <div className={`mt-2 inline-block px-2 py-1 rounded-lg bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white text-xs font-bold uppercase`}>
                      {badge.rarity}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            {/* Points Balance */}
            <div className="backdrop-blur-lg bg-gradient-to-r from-[#ff8a7a] to-[#f2b8a0] rounded-3xl p-8 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 mb-2">Available Points</p>
                  <div className="text-5xl font-bold">{userStats.totalPoints.toLocaleString()}</div>
                </div>
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Gift className="w-10 h-10" />
                </div>
              </div>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => {
                const canAfford = userStats.totalPoints >= reward.points;
                return (
                  <div
                    key={reward.id}
                    className={`backdrop-blur-lg bg-white/80 rounded-2xl overflow-hidden shadow-lg border border-white/50 transition-all ${
                      canAfford ? 'hover:shadow-xl hover:scale-[1.02]' : 'opacity-60'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={reward.image}
                        alt={reward.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <div className="px-4 py-2 rounded-full bg-[#cc5f57] text-white font-bold shadow-lg flex items-center gap-1">
                          <Star className="w-4 h-4 fill-white" />
                          {reward.points}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 mb-2">{reward.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                      <button
                        onClick={() => claimReward(reward.id)}
                        disabled={!canAfford || reward.claimed || claimingRewardId === reward.id}
                        className={`w-full py-3 rounded-xl font-semibold transition-all ${
                          canAfford && !reward.claimed
                            ? 'bg-gradient-to-r from-[#ff8a7a] to-[#f2b8a0] text-white hover:shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {reward.claimed
                          ? 'Claimed'
                          : claimingRewardId === reward.id
                            ? 'Claiming...'
                            : canAfford
                              ? 'Claim Reward'
                              : 'Not Enough Points'}
                      </button>
                      {reward.claimedAt && (
                        <p className="mt-3 text-center text-xs text-gray-500">
                          Claimed on {formatDate(reward.claimedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info Card */}
            <div className="backdrop-blur-lg bg-gradient-to-br from-[#fff7ef] to-[#ffece2] rounded-2xl p-6 border border-[#f3d4b8]/70">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#ffe0cd] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#cc5f57]" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">How to Earn Points</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Complete your daily routine: 50 points</li>
                    <li>• Scan a product: 25 points</li>
                    <li>• Read an article: 15 points</li>
                    <li>• Maintain 7-day streak: 100 bonus points</li>
                    <li>• Unlock a badge: 200 points</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
