export type MoodType = 'thanks' | 'sad' | 'bless' | 'happy' | 'miss' | 'cheer';
export type MomentType = 'join' | 'project' | 'team' | 'annual' | 'birthday' | 'daily' | 'other';
export type ThemeType = 'warm' | 'fresh' | 'simple' | 'custom';
export type LetterTimePreset = 'week' | 'month' | 'threeMonths' | 'halfYear' | 'year' | 'birthday' | 'anniversary' | 'custom';
export type LetterStatus = 'sealed' | 'unlocked' | 'read';
export type LetterRecipient = 'colleague' | 'self';

export interface MemorialBook {
  id: string;
  name: string;
  nickname: string;
  avatar: string;
  joinDate: string;
  leaveDate: string;
  bio: string;
  theme: ThemeType;
  background: string;
  password: string;
  needReview: boolean;
  adminToken: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  bookId: string;
  authorName: string;
  isAnonymous: boolean;
  mood: MoodType;
  content: string;
  photo: string;
  likes: number;
  likedBy: string[];
  thankYou: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Moment {
  id: string;
  bookId: string;
  date: string;
  title: string;
  description: string;
  type: MomentType;
  photos: string[];
  isSystemGenerated: boolean;
  createdAt: string;
}

export interface UserInfo {
  name: string;
  lastBookId: string;
}

export type TabType = 'home' | 'messages' | 'timeline' | 'farewell' | 'mailbox';
export type MailboxTabType = 'delivered' | 'pending';

export const MOOD_OPTIONS: { value: MoodType; label: string; emoji: string; color: string }[] = [
  { value: 'thanks', label: '感谢', emoji: '🙏', color: '#FF9A52' },
  { value: 'sad', label: '不舍', emoji: '😢', color: '#6B9FD5' },
  { value: 'bless', label: '祝福', emoji: '🎉', color: '#4ECDC4' },
  { value: 'happy', label: '开心', emoji: '😊', color: '#FFD93D' },
  { value: 'miss', label: '怀念', emoji: '💭', color: '#C780FA' },
  { value: 'cheer', label: '加油', emoji: '💪', color: '#FF6B6B' },
];

export const MOMENT_TYPE_OPTIONS: { value: MomentType; label: string; emoji: string }[] = [
  { value: 'join', label: '入职第一天', emoji: '🎊' },
  { value: 'project', label: '项目上线', emoji: '🚀' },
  { value: 'team', label: '团建活动', emoji: '🏕️' },
  { value: 'annual', label: '年会', emoji: '🎄' },
  { value: 'birthday', label: '生日庆祝', emoji: '🎂' },
  { value: 'daily', label: '日常趣事', emoji: '😄' },
  { value: 'other', label: '其他', emoji: '📌' },
];

export const THEME_OPTIONS: { value: ThemeType; label: string; gradient: string }[] = [
  { value: 'warm', label: '温暖橙', gradient: 'from-orange-400 to-rose-400' },
  { value: 'fresh', label: '清新绿', gradient: 'from-emerald-400 to-teal-400' },
  { value: 'simple', label: '简约白', gradient: 'from-gray-100 to-gray-200' },
];

export interface FutureLetter {
  id: string;
  bookId: string;
  authorName: string;
  isAnonymous: boolean;
  mood: MoodType;
  content: string;
  photo: string;
  recipient: LetterRecipient;
  deliveryDate: string;
  preset: LetterTimePreset;
  status: LetterStatus;
  isPrivate: boolean;
  unlockedAt: string;
  createdAt: string;
}

export const CARD_COLORS = [
  'bg-orange-50',
  'bg-rose-50',
  'bg-amber-50',
  'bg-emerald-50',
  'bg-sky-50',
  'bg-violet-50',
  'bg-pink-50',
  'bg-teal-50',
];

export const LETTER_TIME_PRESETS: { value: LetterTimePreset; label: string; days: number; emoji: string }[] = [
  { value: 'week', label: '离职后一周', days: 7, emoji: '📅' },
  { value: 'month', label: '离职后一个月', days: 30, emoji: '🌙' },
  { value: 'threeMonths', label: '离职后三个月', days: 90, emoji: '🌸' },
  { value: 'halfYear', label: '离职后半年', days: 180, emoji: '🍃' },
  { value: 'year', label: '离职后一年', days: 365, emoji: '🎄' },
  { value: 'birthday', label: 'TA的生日', days: -1, emoji: '🎂' },
  { value: 'anniversary', label: '入职纪念日', days: -1, emoji: '🎊' },
  { value: 'custom', label: '自定义日期', days: -1, emoji: '✨' },
];

export type WriteMode = 'message' | 'letter';

export const getMoodInfo = (mood: MoodType) => {
  return MOOD_OPTIONS.find(m => m.value === mood) || MOOD_OPTIONS[0];
};

export const getLetterPresetInfo = (preset: LetterTimePreset) => {
  return LETTER_TIME_PRESETS.find(p => p.value === preset) || LETTER_TIME_PRESETS[0];
};

export const getLetterStatusInfo = (status: LetterStatus) => {
  const statusMap = {
    sealed: { label: '封存中', color: '#94A3B8', icon: '🔒' },
    unlocked: { label: '已送达', color: '#22C55E', icon: '📬' },
    read: { label: '已阅读', color: '#64748B', icon: '✉️' },
  };
  return statusMap[status];
};

export const isLetterUnlocked = (letter: FutureLetter, today: Date = new Date()) => {
  const deliveryDate = new Date(letter.deliveryDate);
  deliveryDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return today >= deliveryDate;
};
