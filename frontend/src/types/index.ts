// File: src/types/index.ts (hoặc src/types.ts)

// 1. Định nghĩa chuẩn cấu trúc dữ liệu của 1 cảnh báo
export interface AlertItem {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  title: string;
  description?: string;
  location?: string;
  timestamp?: string;
  status: "new" | "acknowledged" | "resolved";
  // Bạn có thể thêm các trường khác nếu code cũ đang có
}

// 2. Định nghĩa chuẩn các mức độ cảnh báo (Màu sắc, nhãn)
export const ALERT_LEVELS = {
  1: { label: "Low", color: "bg-green-500", text: "text-green-500" },
  2: { label: "Medium", color: "bg-blue-500", text: "text-blue-500" },
  3: { label: "High", color: "bg-yellow-500", text: "text-yellow-500" },
  4: { label: "Critical", color: "bg-orange-500", text: "text-orange-500" },
  5: { label: "Emergency", color: "bg-red-500", text: "text-red-500" },
} as const;