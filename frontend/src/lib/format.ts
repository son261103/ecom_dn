import type { Gender } from '@/lib/types';

export function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

export const GENDER_LABEL: Record<Gender, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  UNISEX: 'Unisex',
};

export const SIZES = ['S', 'M', 'L', 'XL'] as const;
export const COLORS = ['Đen', 'Trắng', 'Xám', 'Be'] as const;

/**
 * Màu hiển thị cho chấm màu trên product card. Dùng ô vuông trắng có viền
 * cho màu Trắng/Be để vẫn thấy rõ trên nền sáng.
 */
export const COLOR_SWATCH: Record<string, string> = {
  Đen: 'bg-zinc-900',
  Trắng: 'bg-white ring-1 ring-border',
  Xám: 'bg-zinc-400',
  Be: 'bg-[#e8dcc8]',
};

/** Màu swatch mặc định khi DB có màu ngoài danh sách trên. */
export const FALLBACK_SWATCH = 'bg-muted';