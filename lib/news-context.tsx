"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { newsData as initialNewsData, type NewsItem, type NewsCategory } from "@/lib/news";

// ============================================
// Types
// ============================================

interface NewsContextType {
  newsList: NewsItem[];
  addNews: (news: Omit<NewsItem, "id" | "slug">) => NewsItem;
  updateNews: (id: string, news: Partial<NewsItem>) => boolean;
  deleteNews: (id: string) => boolean;
  getNewsById: (id: string) => NewsItem | undefined;
}

// ============================================
// Helper Functions
// ============================================

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================================
// Context
// ============================================

const NewsContext = createContext<NewsContextType | null>(null);

// ============================================
// Provider
// ============================================

interface NewsProviderProps {
  children: ReactNode;
}

export function NewsProvider({ children }: NewsProviderProps) {
  const [newsList, setNewsList] = useState<NewsItem[]>(initialNewsData);

  const addNews = useCallback(
    (newsInput: Omit<NewsItem, "id" | "slug">): NewsItem => {
      const newNews: NewsItem = {
        ...newsInput,
        id: generateId(),
        slug: generateSlug(newsInput.title),
      };
      setNewsList((prev) => [newNews, ...prev]);
      return newNews;
    },
    []
  );

  const updateNews = useCallback(
    (id: string, updates: Partial<NewsItem>): boolean => {
      let found = false;
      setNewsList((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            found = true;
            const updated = { ...item, ...updates };
            // Update slug if title changed
            if (updates.title) {
              updated.slug = generateSlug(updates.title);
            }
            return updated;
          }
          return item;
        })
      );
      return found;
    },
    []
  );

  const deleteNews = useCallback((id: string): boolean => {
    let found = false;
    setNewsList((prev) => {
      const filtered = prev.filter((item) => {
        if (item.id === id) {
          found = true;
          return false;
        }
        return true;
      });
      return filtered;
    });
    return found;
  }, []);

  const getNewsById = useCallback(
    (id: string): NewsItem | undefined => {
      return newsList.find((item) => item.id === id);
    },
    [newsList]
  );

  return (
    <NewsContext.Provider
      value={{ newsList, addNews, updateNews, deleteNews, getNewsById }}
    >
      {children}
    </NewsContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useNews() {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error("useNews must be used within a NewsProvider");
  }
  return context;
}

// Re-export types for convenience
export type { NewsItem, NewsCategory };
