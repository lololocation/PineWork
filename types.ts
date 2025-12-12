
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  deleted?: boolean; // 软删除标记
  isPinned?: boolean; // 新增：置顶标记
}

export type Language = 'en' | 'zh';
export type ThemeColor = 'pine' | 'ocean' | 'sunset' | 'lavender' | 'graphite';

export interface PurchasingItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
}

export interface UserSettings {
  monthlySalary: number;
  workingDaysPerMonth: number;
  workingHoursPerDay: number; // Contract hours used for rate calculation
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  lunchStartTime: string; // "12:00"
  lunchEndTime: string; // "13:30"
  mentalVictoryMode: boolean; // If true, lunch break counts as making money
  currencySymbol: string;
  userName: string;
  backgroundImage?: string; // URL or empty for default
  themeMode: 'light' | 'dark' | 'auto';
  themeColor: ThemeColor;
  language: Language;
  purchasingTargetId: string; // ID of the selected item

  // New customization fields
  purchasingItems: PurchasingItem[];
  pomodoroDuration: number; // minutes
  customQuote: string; // Custom text for report footer
  payday: number; // Day of month (1-31)

  // Visual Toggles
  showTree: boolean;
  showParticles: boolean;
}

export interface FocusStats {
  date: string; // YYYY-MM-DD to reset daily
  minutes: number;
}

// 新增：每日额外奖金统计
export interface BonusStats {
  date: string; // YYYY-MM-DD
  amount: number; // 当日累计手动添加的金额
}

export interface AppData {
  settings: UserSettings;
  tasks: Task[];
  focusStats: FocusStats;
  bonusStats?: BonusStats; // 新增字段
}

export const DEFAULT_PURCHASING_ITEMS: PurchasingItem[] = [
  { id: 'coffee', name: 'Coffee', price: 15, emoji: '☕' },
  { id: 'milktea', name: 'Milk Tea', price: 20, emoji: '🧋' },
  { id: 'meal', name: 'KFC', price: 50, emoji: '🍗' },
  { id: 'game', name: 'Game', price: 300, emoji: '🎮' },
];

export const DEFAULT_SETTINGS: UserSettings = {
  monthlySalary: 10000,
  workingDaysPerMonth: 22,
  workingHoursPerDay: 8,
  startTime: "09:00",
  endTime: "18:00",
  lunchStartTime: "12:00",
  lunchEndTime: "13:30",
  mentalVictoryMode: false,
  currencySymbol: "¥",
  userName: "打工人",
  themeMode: 'light',
  themeColor: 'pine',
  language: 'zh',
  purchasingTargetId: 'coffee',
  purchasingItems: DEFAULT_PURCHASING_ITEMS,
  pomodoroDuration: 25,
  customQuote: "",
  payday: 10, // Default payday
  showTree: true,
  showParticles: true
};
