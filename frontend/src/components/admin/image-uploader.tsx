'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useCart } from '@/components/providers/cart-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { adminApi } from '@/lib/api/admin';
import type { UploadedImage } from '@/lib/types/upload';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE = 5 * 1024 * 1024;

export function ImageUploader() {
  const { token, user } = useCart();
  const inputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<UploadedImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState('');

  if (!token || !user) return null;

  if (user.role !== 'ADMIN') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Không có quyền truy cập</h1>
        <p className="mt-2 text-muted-foreground">
          Trang này chỉ dành cho quản trị viên.
        </p>
      </div>
    );
  }

  async function handleFile(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      toast.error(`Định dạng không hỗ trợ: ${file.type}`);
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('Ảnh vượt quá 5MB');
      return;
    }

    setBusy(true);
    try {
      const uploaded = await adminApi.images.upload(file, token as string);
      setResults((current) => [uploaded, ...current]);
      toast.success('Tải ảnh lên thành công');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Không tải được ảnh',
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleRemoteUpload() {
    if (!remoteUrl.trim()) return;

    setBusy(true);
    try {
      const uploaded = await adminApi.images.uploadFromUrl(remoteUrl.trim(), token as string);
      setResults((current) => [uploaded, ...current]);
      setRemoteUrl('');
      toast.success('Đã lấy ảnh từ URL');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Không lấy được ảnh',
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(publicId: string) {
    try {
      await adminApi.images.remove(publicId, token as string);
      setResults((current) => current.filter((r) => r.publicId !== publicId));
      toast.success('Đã xoá ảnh trên Cloudinary');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Không xoá được ảnh',
      );
    }
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    toast.success('Đã copy URL');
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Quản lý ảnh</h1>
      <p className="mt-2 text-muted-foreground">
        Ảnh được lưu trên Cloudinary và phân phối qua CDN.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Card className="space-y-3 p-6">
          <h2 className="font-semibold">Tải từ máy</h2>
          <p className="text-sm text-muted-foreground">
            JPEG, PNG, WebP hoặc AVIF. Tối đa 5MB.
          </p>
          <Input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </Card>

        <Card className="space-y-3 p-6">
          <h2 className="font-semibold">Tải từ URL</h2>
          <p className="text-sm text-muted-foreground">
            Dùng để chuyển ảnh cũ sang Cloudinary.
          </p>
          <div className="space-y-2">
            <Label htmlFor="remoteUrl" className="sr-only">
              URL ảnh
            </Label>
            <Input
              id="remoteUrl"
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={remoteUrl}
              disabled={busy}
              onChange={(event) => setRemoteUrl(event.target.value)}
            />
            <Button
              className="w-full"
              disabled={busy || !remoteUrl.trim()}
              onClick={handleRemoteUpload}
            >
              {busy ? 'Đang xử lý...' : 'Tải lên'}
            </Button>
          </div>
        </Card>
      </div>

      {results.length > 0 && (
        <>
          <Separator className="my-8" />
          <h2 className="mb-4 font-semibold">
            Đã tải lên ({results.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((image) => (
              <Card key={image.publicId} className="overflow-hidden">
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={image.secureUrl}
                    alt={image.publicId}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2 p-4">
                  <p className="truncate text-xs text-muted-foreground">
                    {image.publicId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {image.width}×{image.height} · {image.format} ·{' '}
                    {(image.bytes / 1024).toFixed(0)}KB
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => copyUrl(image.secureUrl)}
                    >
                      Copy URL
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(image.publicId)}
                    >
                      Xoá
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}