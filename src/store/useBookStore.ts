import { create } from 'zustand';
import type { MemorialBook, Message, Moment, UserInfo } from '@/types';
import {
  getBook,
  getBookList,
  saveBook,
  deleteBook as removeBook,
  getMessages,
  saveMessages,
  getMoments,
  saveMoments,
  getUserInfo,
  saveUserInfo,
} from '@/utils/storage';
import { generateId, generateAdminToken } from '@/utils/id';
import { initSampleData } from '@/mock/sampleData';

interface BookState {
  books: MemorialBook[];
  currentBook: MemorialBook | null;
  messages: Message[];
  moments: Moment[];
  userInfo: UserInfo | null;
  isAdmin: boolean;
  loading: boolean;

  loadBookList: () => void;
  loadBook: (id: string) => void;
  createBook: (data: Partial<MemorialBook>) => MemorialBook;
  updateBook: (data: Partial<MemorialBook>) => void;
  deleteBook: (id: string) => void;

  addMessage: (message: Omit<Message, 'id' | 'bookId' | 'likes' | 'likedBy' | 'thankYou' | 'isApproved' | 'createdAt'>) => void;
  likeMessage: (messageId: string, userName: string) => void;
  thankMessage: (messageId: string, thankText: string) => void;
  approveMessage: (messageId: string) => void;
  deleteMessage: (messageId: string) => void;

  addMoment: (moment: Omit<Moment, 'id' | 'bookId' | 'isSystemGenerated' | 'createdAt'>) => void;
  updateMoment: (momentId: string, data: Partial<Moment>) => void;
  deleteMoment: (momentId: string) => void;

  setUserInfo: (info: Partial<UserInfo>) => void;
  verifyAdmin: (token: string) => boolean;
  initWithSampleData: () => void;
}

export const useBookStore = create<BookState>((set, get) => ({
  books: [],
  currentBook: null,
  messages: [],
  moments: [],
  userInfo: null,
  isAdmin: false,
  loading: true,

  loadBookList: () => {
    const bookIds = getBookList();
    const books = bookIds
      .map((id) => getBook(id))
      .filter((b): b is MemorialBook => b !== null);
    set({ books });
  },

  loadBook: (id: string) => {
    const book = getBook(id);
    if (book) {
      const messages = getMessages(id).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const moments = getMoments(id).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const userInfo = getUserInfo();
      const isAdmin = userInfo?.lastBookId === id && book.adminToken
        ? localStorage.getItem(`admin-${id}`) === 'true'
        : false;

      set({
        currentBook: book,
        messages,
        moments,
        userInfo,
        isAdmin,
        loading: false,
      });

      if (userInfo) {
        saveUserInfo({ lastBookId: id });
      }
    }
  },

  createBook: (data) => {
    const id = generateId('book');
    const adminToken = generateAdminToken();
    const now = new Date().toISOString();

    const newBook: MemorialBook = {
      id,
      name: data.name || '',
      nickname: data.nickname || '',
      avatar: data.avatar || '',
      joinDate: data.joinDate || '',
      leaveDate: data.leaveDate || '',
      bio: data.bio || '',
      theme: data.theme || 'warm',
      background: data.background || '',
      password: data.password || '',
      needReview: data.needReview || false,
      adminToken,
      createdAt: now,
      updatedAt: now,
    };

    saveBook(newBook);
    saveMessages(id, []);
    saveMoments(id, []);

    localStorage.setItem(`admin-${id}`, 'true');
    saveUserInfo({ lastBookId: id });

    const books = get().books;
    set({
      books: [newBook, ...books],
      currentBook: newBook,
      messages: [],
      moments: [],
      isAdmin: true,
    });

    return newBook;
  },

  updateBook: (data) => {
    const { currentBook } = get();
    if (!currentBook) return;

    const updated = {
      ...currentBook,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    saveBook(updated);
    set({ currentBook: updated });
  },

  deleteBook: (id) => {
    removeBook(id);
    const books = get().books.filter((b) => b.id !== id);
    set({
      books,
      currentBook: get().currentBook?.id === id ? null : get().currentBook,
    });
  },

  addMessage: (message) => {
    const { currentBook, messages, userInfo } = get();
    if (!currentBook) return;

    const newMessage: Message = {
      id: generateId('msg'),
      bookId: currentBook.id,
      authorName: message.authorName,
      isAnonymous: message.isAnonymous,
      mood: message.mood,
      content: message.content,
      photo: message.photo,
      likes: 0,
      likedBy: [],
      thankYou: '',
      isApproved: !currentBook.needReview,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [newMessage, ...messages];
    saveMessages(currentBook.id, updatedMessages);
    set({ messages: updatedMessages });

    if (userInfo && !message.isAnonymous) {
      saveUserInfo({ name: message.authorName });
    }
  },

  likeMessage: (messageId, userName) => {
    const { currentBook, messages } = get();
    if (!currentBook) return;

    const updatedMessages = messages.map((msg) => {
      if (msg.id === messageId) {
        const hasLiked = msg.likedBy.includes(userName);
        return {
          ...msg,
          likes: hasLiked ? msg.likes - 1 : msg.likes + 1,
          likedBy: hasLiked
            ? msg.likedBy.filter((u) => u !== userName)
            : [...msg.likedBy, userName],
        };
      }
      return msg;
    });

    saveMessages(currentBook.id, updatedMessages);
    set({ messages: updatedMessages });
  },

  thankMessage: (messageId, thankText) => {
    const { currentBook, messages } = get();
    if (!currentBook || !get().isAdmin) return;

    const updatedMessages = messages.map((msg) =>
      msg.id === messageId ? { ...msg, thankYou: thankText } : msg
    );

    saveMessages(currentBook.id, updatedMessages);
    set({ messages: updatedMessages });
  },

  approveMessage: (messageId) => {
    const { currentBook, messages } = get();
    if (!currentBook || !get().isAdmin) return;

    const updatedMessages = messages.map((msg) =>
      msg.id === messageId ? { ...msg, isApproved: true } : msg
    );

    saveMessages(currentBook.id, updatedMessages);
    set({ messages: updatedMessages });
  },

  deleteMessage: (messageId) => {
    const { currentBook, messages } = get();
    if (!currentBook || !get().isAdmin) return;

    const updatedMessages = messages.filter((msg) => msg.id !== messageId);
    saveMessages(currentBook.id, updatedMessages);
    set({ messages: updatedMessages });
  },

  addMoment: (moment) => {
    const { currentBook, moments } = get();
    if (!currentBook) return;

    const newMoment: Moment = {
      id: generateId('mom'),
      bookId: currentBook.id,
      date: moment.date,
      title: moment.title,
      description: moment.description,
      type: moment.type,
      photos: moment.photos,
      isSystemGenerated: false,
      createdAt: new Date().toISOString(),
    };

    const updatedMoments = [...moments, newMoment].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    saveMoments(currentBook.id, updatedMoments);
    set({ moments: updatedMoments });
  },

  updateMoment: (momentId, data) => {
    const { currentBook, moments } = get();
    if (!currentBook) return;

    const updatedMoments = moments
      .map((m) => (m.id === momentId ? { ...m, ...data } : m))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    saveMoments(currentBook.id, updatedMoments);
    set({ moments: updatedMoments });
  },

  deleteMoment: (momentId) => {
    const { currentBook, moments } = get();
    if (!currentBook) return;

    const updatedMoments = moments.filter((m) => m.id !== momentId);
    saveMoments(currentBook.id, updatedMoments);
    set({ moments: updatedMoments });
  },

  setUserInfo: (info) => {
    const current = getUserInfo() || { name: '', lastBookId: '' };
    const updated = { ...current, ...info };
    saveUserInfo(updated);
    set({ userInfo: updated });
  },

  verifyAdmin: (token) => {
    const { currentBook } = get();
    if (!currentBook) return false;
    const isValid = token === currentBook.adminToken;
    if (isValid) {
      localStorage.setItem(`admin-${currentBook.id}`, 'true');
      set({ isAdmin: true });
    }
    return isValid;
  },

  initWithSampleData: () => {
    const { book, messages, moments } = initSampleData();
    saveBook(book);
    saveMessages(book.id, messages);
    saveMoments(book.id, moments);
    saveUserInfo({ lastBookId: book.id, name: '我' });
    localStorage.setItem(`admin-${book.id}`, 'true');

    set({
      books: [book],
      currentBook: book,
      messages: messages.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      moments: moments.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
      userInfo: { name: '我', lastBookId: book.id },
      isAdmin: true,
      loading: false,
    });
  },
}));
