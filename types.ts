export type LevelType = 'seed' | 'sprout' | 'sapling' | 'tree';

export interface PointHistory {
  id: string;
  date: string; // ISO string
  change: number;
  reason: string;
  pointsAfter: number;
}

export interface RewardRedemption {
  id: string;
  date: string;
  rewardName: string;
  pointsSpent: number;
}

export interface Student {
  id: string;
  name: string;
  orderNumber?: number; // Added for ordering
  avatar: string | null;
  totalPoints: number;
  level: LevelType;
  pointHistory: PointHistory[];
  rewardsRedeemed: RewardRedemption[];
}

export interface LevelConfig {
  id: LevelType;
  name: string;
  icon: string;
  minPoints: number;
  maxPoints: number | null; // null for infinite
  color: string;
}

export interface RewardItem {
  id: string;
  icon: string;
  name: string;
  description: string;
  cost: number;
}

export const LEVELS: Record<LevelType, LevelConfig> = {
  seed: {
    id: 'seed',
    name: 'Hạt giống',
    icon: '🌰',
    minPoints: 0,
    maxPoints: 49,
    color: 'text-amber-700'
  },
  sprout: {
    id: 'sprout',
    name: 'Nảy mầm',
    icon: '🌱',
    minPoints: 50,
    maxPoints: 99,
    color: 'text-lime-500'
  },
  sapling: {
    id: 'sapling',
    name: 'Cây con',
    icon: '🌿',
    minPoints: 100,
    maxPoints: 199,
    color: 'text-green-500'
  },
  tree: {
    id: 'tree',
    name: 'Cây to',
    icon: '🌳',
    minPoints: 200,
    maxPoints: null,
    color: 'text-emerald-700'
  }
};

export const DEFAULT_REWARDS: RewardItem[] = [
  { id: 'r1', icon: '📝', name: 'Miễn 1 bài tập', description: 'Được miễn làm một bài tập về nhà tùy chọn', cost: 30 },
  { id: 'r2', icon: '🪑', name: 'Chọn chỗ ngồi', description: 'Được tự chọn chỗ ngồi trong 1 tuần', cost: 50 },
  { id: 'r3', icon: '✏️', name: '+5 điểm kiểm tra', description: 'Cộng điểm vào bài kiểm tra 15 phút', cost: 80 },
  { id: 'r4', icon: '👨‍🏫', name: 'Trợ giảng nhí', description: 'Được ngồi ghế GV và hỗ trợ lớp 1 tiết', cost: 100 },
  { id: 'r5', icon: '📚', name: 'Voucher sách', description: 'Voucher mua sách trị giá 50k', cost: 150 },
  { id: 'r6', icon: '🏆', name: 'Giải đặc biệt', description: 'Phần quà bí mật từ giáo viên', cost: 200 },
];