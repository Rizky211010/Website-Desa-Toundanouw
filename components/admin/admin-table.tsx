"use client";

import { ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: (item: T) => ReactNode;
  showActions?: boolean;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function AdminTable<T extends { id?: string | number }>({
  columns,
  data,
  searchPlaceholder = "Cari...",
  searchValue,
  onSearchChange,
  actions,
  showActions = true,
  emptyMessage = "Tidak ada data",
  pagination,
}: AdminTableProps<T>) {
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm overflow-hidden">
      {/* Search & Filter Bar */}
      {onSearchChange && (
        <div className="px-5 py-4 border-b border-slate-700 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-600 rounded-xl text-sm font-medium text-gray-300 hover:bg-slate-700 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700/50 border-b border-slate-700">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-5 py-3.5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider ${col.className || ""}`}
                >
                  {col.label}
                </th>
              ))}
              {showActions && (
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="px-5 py-12 text-center text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="hover:bg-slate-700/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={`px-5 py-4 text-sm text-gray-200 ${col.className || ""}`}
                    >
                      {col.render
                        ? col.render(item)
                        : String(item[col.key as keyof T] || "-")}
                    </td>
                  ))}
                  {showActions && (
                    <td className="px-5 py-4 text-right">
                      {actions ? (
                        actions(item)
                      ) : (
                        <DefaultActions />
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-5 py-4 border-t border-slate-700 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Halaman {pagination.currentPage} dari {pagination.totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.currentPage === 1}
              className="p-2 rounded-lg hover:bg-slate-700 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="p-2 rounded-lg hover:bg-slate-700 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-2 rounded-lg hover:bg-slate-700 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-2 rounded-lg hover:bg-slate-700 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DefaultActions() {
  return (
    <div className="flex items-center justify-end gap-1">
      <button className="p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-blue-400 transition-colors">
        <Eye className="w-4 h-4" />
      </button>
      <button className="p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-orange-400 transition-colors">
        <Edit className="w-4 h-4" />
      </button>
      <button className="p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-red-400 transition-colors">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// Action Buttons component for reuse
interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  variant?: "view" | "edit" | "delete";
}

export function ActionButton({ icon, label, onClick, variant = "view" }: ActionButtonProps) {
  const variantClasses = {
    view: "hover:bg-blue-900/30 hover:text-blue-400",
    edit: "hover:bg-orange-900/30 hover:text-orange-400",
    delete: "hover:bg-red-900/30 hover:text-red-400",
  };

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg text-gray-400 transition-colors ${variantClasses[variant]}`}
      title={label}
    >
      {icon}
    </button>
  );
}
