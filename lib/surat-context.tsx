"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  suratTemplates as initialSuratData,
  type SuratTemplate,
  type SuratCategory,
} from "@/lib/surat-templates";

// ============================================
// Types
// ============================================

interface SuratContextType {
  suratList: SuratTemplate[];
  addSurat: (surat: Omit<SuratTemplate, "id" | "slug">) => SuratTemplate;
  updateSurat: (id: string, surat: Partial<SuratTemplate>) => boolean;
  deleteSurat: (id: string) => boolean;
  getSuratById: (id: string) => SuratTemplate | undefined;
}

// ============================================
// Helper Functions
// ============================================

function generateSlug(name: string): string {
  return name
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

const SuratContext = createContext<SuratContextType | null>(null);

// ============================================
// Provider
// ============================================

interface SuratProviderProps {
  children: ReactNode;
}

export function SuratProvider({ children }: SuratProviderProps) {
  const [suratList, setSuratList] = useState<SuratTemplate[]>(initialSuratData);

  const addSurat = useCallback(
    (suratInput: Omit<SuratTemplate, "id" | "slug">): SuratTemplate => {
      const newSurat: SuratTemplate = {
        ...suratInput,
        id: generateId(),
        slug: generateSlug(suratInput.name),
      };
      setSuratList((prev) => [newSurat, ...prev]);
      return newSurat;
    },
    []
  );

  const updateSurat = useCallback(
    (id: string, updates: Partial<SuratTemplate>): boolean => {
      let found = false;
      setSuratList((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            found = true;
            const updated = { ...item, ...updates };
            // Update slug if name changed
            if (updates.name) {
              updated.slug = generateSlug(updates.name);
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

  const deleteSurat = useCallback((id: string): boolean => {
    let found = false;
    setSuratList((prev) => {
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

  const getSuratById = useCallback(
    (id: string): SuratTemplate | undefined => {
      return suratList.find((item) => item.id === id);
    },
    [suratList]
  );

  return (
    <SuratContext.Provider
      value={{ suratList, addSurat, updateSurat, deleteSurat, getSuratById }}
    >
      {children}
    </SuratContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useSurat() {
  const context = useContext(SuratContext);
  if (!context) {
    throw new Error("useSurat must be used within a SuratProvider");
  }
  return context;
}

// Re-export types for convenience
export type { SuratTemplate, SuratCategory };
