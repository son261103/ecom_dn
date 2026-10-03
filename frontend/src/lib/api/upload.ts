import { request } from './client';
import type { UploadedImage } from './upload.types';

export const uploadApi = {
  status(token: string) {
    return request<{ configured: boolean }>('/upload/status', { token });
  },

  image(file: File, token: string) {
    const form = new FormData();
    form.append('file', file);

    // Content-Type stays unset so the browser can add the multipart boundary.
    return request<UploadedImage>('/upload/image', {
      method: 'POST',
      token,
      body: form,
      isFormData: true,
    });
  },

  fromUrl(url: string, token: string) {
    return request<UploadedImage>('/upload/image-from-url', {
      method: 'POST',
      token,
      body: JSON.stringify({ url }),
    });
  },

  remove(publicId: string, token: string) {
    return request<{ result: string }>(
      `/upload/${encodeURIComponent(publicId)}`,
      { method: 'DELETE', token },
    );
  },
};