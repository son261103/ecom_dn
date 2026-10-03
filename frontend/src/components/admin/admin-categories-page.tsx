'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { adminCategoriesApi } from '@/lib/api/admin';
import { GENDER_LABEL } from '@/lib/format';
import { useAdminAction, useAdminResource } from '@/components/admin/hooks';
import {
  AdminEmpty,
  AdminError,
  AdminHeader,
  AdminLoading,
  AdminToolbar,
  ConfirmButton,
} from '@/components/admin/ui';
import { EASE_OUT } from '@/components/admin/motion';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  AdminCategory,
  AdminCategoryPayload,
  Gender,
} from '@/lib/types';

const EMPTY_FORM: AdminCategoryPayload = {
  name: '',
  gender: 'MALE',
  sortOrder: 0,
};

export function AdminCategoriesPage() {
  const { run, pending } = useAdminAction();

  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | Gender>('all');
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<AdminCategoryPayload>(EMPTY_FORM);

  const { data, loading, error, reload } = useAdminResource(
    (token) =>
      adminCategoriesApi.list(token, {
        search: search || undefined,
        gender: genderFilter === 'all' ? undefined : genderFilter,
      }),
    [search, genderFilter],
  );

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditing(null);
    setCreating(true);
  }

  function openEdit(category: AdminCategory) {
    setForm({
      name: category.name,
      gender: category.gender,
      image: category.image ?? undefined,
      sortOrder: category.sortOrder,
    });
    setCreating(false);
    setEditing(category);
  }

  function closeDialog() {
    setCreating(false);
    setEditing(null);
  }

  async function handleSubmit() {
    const done = async () => {
      closeDialog();
      await reload();
    };

    if (editing) {
      await run((token) => adminCategoriesApi.update(token, editing.id, form), {
        success: 'Đã cập nhật danh mục',
        onDone: done,
      });
    } else {
      await run((token) => adminCategoriesApi.create(token, form), {
        success: 'Đã tạo danh mục',
        onDone: done,
      });
    }
  }

  async function handleDelete(category: AdminCategory) {
    await run((token) => adminCategoriesApi.remove(token, category.id), {
      success: 'Đã xoá danh mục',
      onDone: reload,
    });
  }

  const dialogOpen = creating || editing !== null;

  return (
    <div>
      <AdminHeader
        title="Danh mục"
        description={`${data?.meta.total ?? 0} danh mục`}
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Thêm danh mục
          </Button>
        }
      />

      <AdminToolbar className="mb-4 flex flex-wrap gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên…"
          className="max-w-xs"
        />
        <Select
          items={{ all: 'Mọi giới tính', MALE: 'Nam', FEMALE: 'Nữ', UNISEX: 'Unisex' }}
          value={genderFilter}
          onValueChange={(v) => setGenderFilter(v as 'all' | Gender)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="MALE">Nam</SelectItem>
            <SelectItem value="FEMALE">Nữ</SelectItem>
            <SelectItem value="UNISEX">Unisex</SelectItem>
          </SelectContent>
        </Select>
      </AdminToolbar>

      {loading && <AdminLoading />}
      {error && <AdminError message={error} />}

      {!loading && !error && (
        <Card className="overflow-hidden">
          {data && data.items.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Tên</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Giới tính</th>
                  <th className="px-4 py-3 font-medium">Thứ tự</th>
                  <th className="px-4 py-3 font-medium">Sản phẩm</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.items.map((category, index) => (
                  <motion.tr
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.35, ease: EASE_OUT }}
                    className="border-b transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {category.slug}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">
                        {GENDER_LABEL[category.gender]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {category.sortOrder}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {category._count.products}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Sửa"
                          onClick={() => openEdit(category)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <ConfirmButton
                          title="Xoá"
                          pending={pending}
                          onConfirm={() => handleDelete(category)}
                        >
                          <Trash2 className="size-4" />
                        </ConfirmButton>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4">
              <AdminEmpty
                message="Chưa có danh mục nào."
                action={
                  <Button onClick={openCreate}>
                    <Plus className="size-4" />
                    Thêm danh mục
                  </Button>
                }
              />
            </div>
          )}
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Sửa danh mục' : 'Thêm danh mục'}
            </DialogTitle>
            <DialogDescription>
              Slug được tạo tự động từ tên nếu không nhập.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên danh mục</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Áo khoác"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <Select
                value={form.gender}
                onValueChange={(v) =>
                  setForm({ ...form, gender: v as Gender })
                }
              >
                <SelectTrigger id="gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Nam</SelectItem>
                  <SelectItem value="FEMALE">Nữ</SelectItem>
                  <SelectItem value="UNISEX">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL ảnh (không bắt buộc)</Label>
              <Input
                id="image"
                value={form.image ?? ''}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://res.cloudinary.com/…"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
              <Input
                id="sortOrder"
                type="number"
                value={form.sortOrder ?? 0}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Huỷ
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={pending || form.name.trim().length < 2}
            >
              {editing ? 'Lưu thay đổi' : 'Tạo danh mục'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}