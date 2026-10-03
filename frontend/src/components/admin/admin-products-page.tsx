'use client';

import { useMemo, useState } from 'react';
import { Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  adminCategoriesApi,
  adminProductsApi,
  type StockMode,
} from '@/lib/api/admin';
import { formatPrice, GENDER_LABEL } from '@/lib/format';
import { useAdminAction, useAdminResource } from '@/components/admin/hooks';
import {
  AdminEmpty,
  AdminError,
  AdminHeader,
  AdminLoading,
  ConfirmButton,
} from '@/components/admin/ui';
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
import { Textarea } from '@/components/ui/textarea';
import type {
  AdminProductListItem,
  AdminProductPayload,
  Gender,
  VariantInput,
} from '@/lib/types';

/** Base UI shows the raw value in the trigger unless `items` maps it to a label. */
const GENDER_FILTER_ITEMS = {
  all: 'Mọi giới tính',
  MALE: 'Nam',
  FEMALE: 'Nữ',
  UNISEX: 'Unisex',
};

const STATUS_FILTER_ITEMS = {
  all: 'Mọi trạng thái',
  true: 'Đang bán',
  false: 'Đã ẩn',
};

const EMPTY: AdminProductPayload = {
  name: '',
  description: '',
  brand: '',
  gender: 'MALE',
  basePrice: 0,
  thumbnail: '',
  categoryId: '',
  isFeatured: false,
  isActive: true,
  variants: [],
  images: [],
};

export function AdminProductsPage() {
  const { run, pending } = useAdminAction();

  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | Gender>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>(
    'all',
  );
  const [editing, setEditing] = useState<AdminProductListItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<AdminProductPayload>(EMPTY);

  const { data, loading, error, reload } = useAdminResource(
    (token) =>
      adminProductsApi.list(token, {
        search: search || undefined,
        gender: genderFilter === 'all' ? undefined : genderFilter,
        isActive: statusFilter === 'all' ? undefined : statusFilter,
      }),
    [search, genderFilter, statusFilter],
  );

  const { data: categoryData } = useAdminResource(
    (token) => adminCategoriesApi.list(token),
    [],
  );

  const categories = useMemo(
    () => categoryData?.items ?? [],
    [categoryData],
  );

  function openCreate() {
    setForm({ ...EMPTY, categoryId: categories[0]?.id ?? '' });
    setEditing(null);
    setCreating(true);
  }

  function openEdit(product: AdminProductListItem) {
    setForm({
      name: product.name,
      description: product.description,
      brand: product.brand,
      gender: product.gender,
      basePrice: product.basePrice,
      thumbnail: product.thumbnail,
      categoryId: product.category.id,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      variants: [],
      images: [],
    });
    setCreating(false);
    setEditing(product);
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

    // Empty variant/image arrays on edit mean "leave the existing rows alone".
    const payload: AdminProductPayload = {
      ...form,
      variants: form.variants?.length ? form.variants : undefined,
      images: form.images?.length ? form.images : undefined,
    };

    if (editing) {
      await run((token) => adminProductsApi.update(token, editing.id, payload), {
        success: 'Đã cập nhật sản phẩm',
        onDone: done,
      });
    } else {
      await run((token) => adminProductsApi.create(token, payload), {
        success: 'Đã tạo sản phẩm',
        onDone: done,
      });
    }
  }

  async function handleDelete(product: AdminProductListItem) {
    const result = await run(
      (token) => adminProductsApi.remove(token, product.id),
      { onDone: reload },
    );
    if (result?.message) {
      // Soft delete: the product stays for order history but leaves the catalog.
      alert(result.message);
    }
  }

  async function handleStock(
    variantId: string,
    quantity: number,
    mode: StockMode,
  ) {
    await run((token) => adminProductsApi.adjustStock(token, variantId, quantity, mode), {
      onDone: reload,
    });
  }

  const dialogOpen = creating || editing !== null;
  const canSubmit =
    form.name.trim().length >= 2 &&
    form.description.trim().length >= 10 &&
    form.brand.trim().length >= 2 &&
    form.basePrice > 0 &&
    form.thumbnail.trim().length > 0 &&
    form.categoryId !== '';

  return (
    <div>
      <AdminHeader
        title="Sản phẩm"
        description={`${data?.meta.total ?? 0} sản phẩm`}
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Thêm sản phẩm
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, thương hiệu…"
          className="max-w-xs"
        />
        <Select
          items={GENDER_FILTER_ITEMS}
          value={genderFilter}
          onValueChange={(v) => setGenderFilter(v as 'all' | Gender)}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="MALE">Nam</SelectItem>
            <SelectItem value="FEMALE">Nữ</SelectItem>
            <SelectItem value="UNISEX">Unisex</SelectItem>
          </SelectContent>
        </Select>
        <Select
          items={STATUS_FILTER_ITEMS}
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as 'all' | 'true' | 'false')}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Mọi trạng thái</SelectItem>
            <SelectItem value="true">Đang bán</SelectItem>
            <SelectItem value="false">Đã ẩn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && <AdminLoading />}
      {error && <AdminError message={error} />}

      {!loading && !error && (
        <div className="space-y-3">
          {data && data.items.length > 0 ? (
            data.items.map((product) => (
              <Card key={product.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{product.name}</p>
                      <Badge variant="secondary">
                        {GENDER_LABEL[product.gender]}
                      </Badge>
                      {product.isFeatured && <Badge>Nổi bật</Badge>}
                      {!product.isActive && (
                        <Badge variant="outline">Đã ẩn</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {product.brand} · {product.category.name} ·{' '}
                      {formatPrice(product.basePrice)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {product.variants.length} biến thể ·{' '}
                      {product._count.orderItems} lượt đặt
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Sửa"
                      onClick={() => openEdit(product)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <ConfirmButton
                      title="Xoá"
                      pending={pending}
                      onConfirm={() => handleDelete(product)}
                    >
                      <Trash2 className="size-4" />
                    </ConfirmButton>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
                  {product.variants.map((variant) => (
                    <StockControl
                      key={variant.id}
                      label={`${variant.color} / ${variant.size}`}
                      stock={variant.stock}
                      pending={pending}
                      onAdjust={(mode, qty) =>
                        handleStock(variant.id, qty, mode)
                      }
                    />
                  ))}
                </div>
              </Card>
            ))
          ) : (
            <AdminEmpty
              message="Không có sản phẩm nào khớp bộ lọc."
              action={
                <Button onClick={openCreate}>
                  <Plus className="size-4" />
                  Thêm sản phẩm
                </Button>
              }
            />
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Để trống phần biến thể và ảnh để giữ nguyên dữ liệu cũ.'
                : 'Biến thể và ảnh có thể thêm sau nếu muốn.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="p-name">Tên sản phẩm</Label>
              <Input
                id="p-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-desc">Mô tả (tối thiểu 10 ký tự)</Label>
              <Textarea
                id="p-desc"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-brand">Thương hiệu</Label>
                <Input
                  id="p-brand"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-price">Giá (VND)</Label>
                <Input
                  id="p-price"
                  type="number"
                  value={form.basePrice}
                  onChange={(e) =>
                    setForm({ ...form, basePrice: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-gender">Giới tính</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => setForm({ ...form, gender: v as Gender })}
                >
                  <SelectTrigger id="p-gender">
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
                <Label htmlFor="p-category">Danh mục</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => v && setForm({ ...form, categoryId: v })}
                >
                  <SelectTrigger id="p-category">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({GENDER_LABEL[category.gender]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-thumb">URL ảnh chính</Label>
              <Input
                id="p-thumb"
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                placeholder="https://res.cloudinary.com/…"
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isFeatured ?? false}
                  onChange={(e) =>
                    setForm({ ...form, isFeatured: e.target.checked })
                  }
                />
                Sản phẩm nổi bật
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive ?? true}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                Đang bán
              </label>
            </div>

            <VariantEditor
              variants={form.variants ?? []}
              onChange={(variants) => setForm({ ...form, variants })}
            />

            <ImageEditor
              images={form.images ?? []}
              onChange={(images) => setForm({ ...form, images })}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Huỷ
            </Button>
            <Button onClick={handleSubmit} disabled={pending || !canSubmit}>
              {editing ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StockControl({
  label,
  stock,
  pending,
  onAdjust,
}: {
  label: string;
  stock: number;
  pending: boolean;
  onAdjust: (mode: StockMode, quantity: number) => void;
}) {
  const [delta, setDelta] = useState(1);

  return (
    <div className="flex items-center gap-1.5 rounded-lg border px-2 py-1">
      <span className="text-xs font-medium">{label}</span>
      <span
        className={`text-xs font-semibold tabular-nums ${stock <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}
      >
        {stock}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="size-6"
        disabled={pending}
        onClick={() => onAdjust('DECREASE', delta)}
      >
        <Minus className="size-3" />
      </Button>
      <Input
        type="number"
        min={1}
        value={delta}
        onChange={(e) => setDelta(Math.max(1, Number(e.target.value)))}
        className="h-6 w-12 px-1 text-xs"
      />
      <Button
        variant="ghost"
        size="icon"
        className="size-6"
        disabled={pending}
        onClick={() => onAdjust('INCREASE', delta)}
      >
        <Plus className="size-3" />
      </Button>
    </div>
  );
}

function VariantEditor({
  variants,
  onChange,
}: {
  variants: VariantInput[];
  onChange: (variants: VariantInput[]) => void;
}) {
  function update(index: number, patch: Partial<VariantInput>) {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <Label>Biến thể (màu / size / tồn kho)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([...variants, { color: '', size: '', stock: 0 }])
          }
        >
          <Plus className="size-3" />
          Thêm
        </Button>
      </div>

      {variants.length === 0 ? (
        <p className="text-xs text-muted-foreground">Chưa có biến thể nào.</p>
      ) : (
        variants.map((variant, index) => (
          <div key={index} className="grid grid-cols-12 gap-2">
            <Input
              className="col-span-4"
              placeholder="Màu"
              value={variant.color}
              onChange={(e) => update(index, { color: e.target.value })}
            />
            <Input
              className="col-span-3"
              placeholder="Size"
              value={variant.size}
              onChange={(e) => update(index, { size: e.target.value })}
            />
            <Input
              className="col-span-3"
              type="number"
              placeholder="Tồn"
              value={variant.stock ?? 0}
              onChange={(e) =>
                update(index, { stock: Math.max(0, Number(e.target.value)) })
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange(variants.filter((_, i) => i !== index))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}

function ImageEditor({
  images,
  onChange,
}: {
  images: { url: string }[];
  onChange: (images: { url: string }[]) => void;
}) {
  const [url, setUrl] = useState('');

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <Label>Ảnh phụ</Label>
      <div className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://res.cloudinary.com/…"
        />
        <Button
          type="button"
          variant="outline"
          disabled={!url.trim()}
          onClick={() => {
            onChange([...images, { url: url.trim() }]);
            setUrl('');
          }}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {images.length > 0 && (
        <ul className="space-y-1">
          {images.map((image, index) => (
            <li
              key={index}
              className="flex items-center justify-between gap-2 rounded border px-2 py-1 text-xs"
            >
              <span className="truncate">{image.url}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={() =>
                  onChange(images.filter((_, i) => i !== index))
                }
              >
                <Trash2 className="size-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}