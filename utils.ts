import { Student, LEVELS, LevelType } from './types';

export const determineLevel = (points: number): LevelType => {
  if (points >= 200) return 'tree';
  if (points >= 100) return 'sapling';
  if (points >= 50) return 'sprout';
  return 'seed';
};

export const getNextLevel = (currentLevel: LevelType): LevelType | null => {
  if (currentLevel === 'seed') return 'sprout';
  if (currentLevel === 'sprout') return 'sapling';
  if (currentLevel === 'sapling') return 'tree';
  return null;
};

export const calculateProgress = (points: number, level: LevelType) => {
  const config = LEVELS[level];
  if (config.maxPoints === null) {
    // Max level: return 100% and 0 points needed to ensure consistent return type
    return {
      percent: 100,
      pointsNeeded: 0
    };
  }

  const range = config.maxPoints - config.minPoints + 1;
  const currentInRange = points - config.minPoints;
  const percent = Math.min(100, Math.max(0, (currentInRange / range) * 100));
  
  return {
    percent,
    pointsNeeded: config.maxPoints + 1 - points
  };
};

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const generateUUID = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};