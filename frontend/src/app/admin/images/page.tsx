import type { Metadata } from 'next';
import { ImageUploader } from '@/components/admin/image-uploader';

export const metadata: Metadata = { title: 'Quản lý ảnh' };

export default function AdminImagesPage() {
  return <ImageUploader />;
}
