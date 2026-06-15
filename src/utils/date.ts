export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function formatDateCN(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
}

export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return formatDate(dateStr);
}

export function isPastDate(dateStr: string, compareDateStr?: string): boolean {
  const date = new Date(dateStr);
  const compare = compareDateStr ? new Date(compareDateStr) : new Date();
  date.setHours(0, 0, 0, 0);
  compare.setHours(0, 0, 0, 0);
  return date.getTime() <= compare.getTime();
}

export function getNextBirthday(birthdayStr: string, leaveDateStr: string): string {
  const today = new Date(leaveDateStr);
  const birthday = new Date(birthdayStr);
  const thisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());

  if (thisYear.getTime() <= today.getTime()) {
    thisYear.setFullYear(today.getFullYear() + 1);
  }

  return thisYear.toISOString().split('T')[0];
}

export function getNextAnniversary(joinDateStr: string, leaveDateStr: string): string {
  const today = new Date(leaveDateStr);
  const joinDate = new Date(joinDateStr);
  const thisYear = new Date(today.getFullYear(), joinDate.getMonth(), joinDate.getDate());

  if (thisYear.getTime() <= today.getTime()) {
    thisYear.setFullYear(today.getFullYear() + 1);
  }

  return thisYear.toISOString().split('T')[0];
}
