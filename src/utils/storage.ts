import type { MemorialBook, Message, Moment, UserInfo, FutureLetter } from '@/types';

const STORAGE_PREFIX = 'gongshi-memorial-';
const KEY_BOOKS = `${STORAGE_PREFIX}books`;
const KEY_USER = `${STORAGE_PREFIX}user`;
const KEY_BOOK_PREFIX = `${STORAGE_PREFIX}book-`;
const KEY_MESSAGES_PREFIX = `${STORAGE_PREFIX}messages-`;
const KEY_MOMENTS_PREFIX = `${STORAGE_PREFIX}moments-`;
const KEY_LETTERS_PREFIX = `${STORAGE_PREFIX}letters-`;

function safeParse<T>(value: string | null, defaultValue: T): T {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

export function getBookList(): string[] {
  return safeParse<string[]>(localStorage.getItem(KEY_BOOKS), []);
}

export function saveBookList(ids: string[]): void {
  localStorage.setItem(KEY_BOOKS, JSON.stringify(ids));
}

export function getBook(id: string): MemorialBook | null {
  return safeParse<MemorialBook | null>(localStorage.getItem(`${KEY_BOOK_PREFIX}${id}`), null);
}

export function saveBook(book: MemorialBook): void {
  localStorage.setItem(`${KEY_BOOK_PREFIX}${book.id}`, JSON.stringify(book));
  const books = getBookList();
  if (!books.includes(book.id)) {
    books.unshift(book.id);
    saveBookList(books);
  }
}



export function getMessages(bookId: string): Message[] {
  return safeParse<Message[]>(localStorage.getItem(`${KEY_MESSAGES_PREFIX}${bookId}`), []);
}

export function saveMessages(bookId: string, messages: Message[]): void {
  localStorage.setItem(`${KEY_MESSAGES_PREFIX}${bookId}`, JSON.stringify(messages));
}

export function getMoments(bookId: string): Moment[] {
  return safeParse<Moment[]>(localStorage.getItem(`${KEY_MOMENTS_PREFIX}${bookId}`), []);
}

export function saveMoments(bookId: string, moments: Moment[]): void {
  localStorage.setItem(`${KEY_MOMENTS_PREFIX}${bookId}`, JSON.stringify(moments));
}

export function getUserInfo(): UserInfo | null {
  return safeParse<UserInfo | null>(localStorage.getItem(KEY_USER), null);
}

export function saveUserInfo(info: Partial<UserInfo>): void {
  const current = getUserInfo() || { name: '', lastBookId: '' };
  localStorage.setItem(KEY_USER, JSON.stringify({ ...current, ...info }));
}

export function clearAllData(): void {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX));
  keys.forEach((k) => localStorage.removeItem(k));
}

export function getStorageUsage(): { used: number; total: number } {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      const value = localStorage.getItem(key) || '';
      total += key.length + value.length;
    }
  }
  return {
    used: total,
    total: 5 * 1024 * 1024,
  };
}

export function getLetters(bookId: string): FutureLetter[] {
  return safeParse<FutureLetter[]>(localStorage.getItem(`${KEY_LETTERS_PREFIX}${bookId}`), []);
}

export function saveLetters(bookId: string, letters: FutureLetter[]): void {
  localStorage.setItem(`${KEY_LETTERS_PREFIX}${bookId}`, JSON.stringify(letters));
}

export function deleteBook(id: string): void {
  localStorage.removeItem(`${KEY_BOOK_PREFIX}${id}`);
  localStorage.removeItem(`${KEY_MESSAGES_PREFIX}${id}`);
  localStorage.removeItem(`${KEY_MOMENTS_PREFIX}${id}`);
  localStorage.removeItem(`${KEY_LETTERS_PREFIX}${id}`);
  const books = getBookList();
  const filtered = books.filter((b) => b !== id);
  saveBookList(filtered);
}
