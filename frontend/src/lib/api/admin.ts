import { request } from './client';
import type { UploadedImage } from '@/lib/types/upload';

/**
 * Admin-only endpoints. Every call requires a Bearer token belonging to a
 * user with role ADMIN — the backend rejects anything else with 403.
 */
export const adminApi = {
  images: {
    status(token: string) {
      return request<{ configured: boolean }>('/admin/upload/status', { token });
    },

    /** Content-Type stays unset so the browser can add the multipart boundary. */
    upload(file: File, token: string) {
      const form = new FormData();
      form.append('file', file);

      return request<UploadedImage>('/admin/upload/image', {
        method: 'POST',
        token,
        body: form,
        isFormData: true,
      });
    },

    uploadFromUrl(url: string, token: string) {
      return request<UploadedImage>('/admin/upload/image-from-url', {
        method: 'POST',
        token,
        body: JSON.stringify({ url }),
      });
    },

    remove(publicId: string, token: string) {
      return request<{ result: string }>(
        `/admin/upload/${encodeURIComponent(publicId)}`,
        { method: 'DELETE', token },
      );
    },
  },
};
