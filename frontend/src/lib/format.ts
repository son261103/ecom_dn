import type { Gender } from '@/lib/api';

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