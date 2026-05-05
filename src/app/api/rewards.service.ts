import { http } from './http';

export type RewardActivityType = 'routine' | 'scan' | 'article';

export interface RewardsUserStats {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  level: number;
  pointsToNextLevel: number;
  routinesCompleted: number;
  productsScanned: number;
  articlesRead: number;
}

export interface RewardsBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface RewardsReward {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'discount' | 'product' | 'content';
  image: string;
  claimed: boolean;
  claimedAt: string | null;
}

export interface RewardsPageData {
  userStats: RewardsUserStats;
  badges: RewardsBadge[];
  rewards: RewardsReward[];
}

export const rewardsService = {
  async getRewardsPageData(): Promise<RewardsPageData> {
    const response = await http.get('/rewards');
    return response.data;
  },

  async claimReward(rewardId: string) {
    const response = await http.post(`/rewards/claim/${rewardId}`);
    return response.data;
  },

  async recordActivity(type: RewardActivityType, count?: number) {
    const response = await http.post('/rewards/activity', { type, count });
    return response.data;
  },
};