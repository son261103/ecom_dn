'use client';

import { useState } from 'react';
import { KeyRound, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { adminUsersApi } from '@/lib/api/admin';
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
import { useCart } from '@/components/providers/cart-context';
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
import type { AdminUserListItem, AdminUserPayload, Role } from '@/lib/types';

const EMPTY_FORM: AdminUserPayload = {
  email: '',
  password: '',
  fullName: '',
  phone: '',
  role: 'CUSTOMER',
};

export function AdminUsersPage() {
  const { user: currentUser } = useCart();
  const { run, pending } = useAdminAction();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<AdminUserPayload>(EMPTY_FORM);
  const [resetting, setResetting] = useState<AdminUserListItem | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const { data, loading, error, reload } = useAdminResource(
    (token) =>
      adminUsersApi.list(token, {
        search: search || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
      }),
    [search, roleFilter],
  );

  async function handleCreate() {
    await run((token) => adminUsersApi.create(token, form), {
      success: 'Đã tạo người dùng',
      onDone: async () => {
        setCreating(false);
        setForm(EMPTY_FORM);
        await reload();
      },
    });
  }

  async function handleToggleRole(target: AdminUserListItem) {
    const nextRole: Role =
      target.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';

    await run((token) => adminUsersApi.update(token, target.id, { role: nextRole }), {
      success: nextRole === 'ADMIN' ? 'Đã cấp quyền admin' : 'Đã hạ quyền',
      onDone: reload,
    });
  }

  async function handleDelete(target: AdminUserListItem) {
    await run((token) => adminUsersApi.remove(token, target.id), {
      success: 'Đã xoá người dùng',
      onDone: reload,
    });
  }

  async function handleResetPassword() {
    if (!resetting) return;

    await run((token) => adminUsersApi.resetPassword(token, resetting.id, newPassword), {
      success: 'Đã đặt lại mật khẩu',
      onDone: async () => {
        setResetting(null);
        setNewPassword('');
        await reload();
      },
    });
  }

  return (
    <div>
      <AdminHeader
        title="Người dùng"
        description={`${data?.meta.total ?? 0} tài khoản`}
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Thêm người dùng
          </Button>
        }
      />

      <AdminToolbar className="mb-4 flex flex-wrap gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, email, SĐT…"
          className="max-w-xs"
        />
        <Select
          items={{ all: 'Mọi vai trò', CUSTOMER: 'Khách hàng', ADMIN: 'Quản trị' }}
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as 'all' | Role)}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Mọi vai trò</SelectItem>
            <SelectItem value="CUSTOMER">Khách hàng</SelectItem>
            <SelectItem value="ADMIN">Quản trị</SelectItem>
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
                  <th className="px-4 py-3 font-medium">Người dùng</th>
                  <th className="px-4 py-3 font-medium">Vai trò</th>
                  <th className="px-4 py-3 font-medium">Đơn hàng</th>
                  <th className="px-4 py-3 font-medium">Ngày tạo</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.items.map((user, index) => {
                  const isSelf = user.id === currentUser?.id;

                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.35, ease: EASE_OUT }}
                      className="border-b transition-colors last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">
                          {user.fullName}
                          {isSelf && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (bạn)
                            </span>
                          )}
                        </p>
                        <p className="text-muted-foreground">{user.email}</p>
                        {user.phone && (
                          <p className="text-xs text-muted-foreground">
                            {user.phone}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            user.role === 'ADMIN' ? 'default' : 'secondary'
                          }
                        >
                          {user.role === 'ADMIN' ? 'Quản trị' : 'Khách hàng'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user._count.orders}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Đặt lại mật khẩu"
                            onClick={() => {
                              setResetting(user);
                              setNewPassword('');
                            }}
                          >
                            <KeyRound className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={
                              user.role === 'ADMIN'
                                ? 'Hạ quyền'
                                : 'Cấp quyền admin'
                            }
                            disabled={isSelf || pending}
                            onClick={() => handleToggleRole(user)}
                          >
                            <ShieldCheck className="size-4" />
                          </Button>
                          <ConfirmButton
                            pending={pending}
                            onConfirm={() => handleDelete(user)}
                            variant="ghost"
                          >
                            <Trash2 className="size-4" />
                          </ConfirmButton>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-4">
              <AdminEmpty message="Không có người dùng nào khớp bộ lọc." />
            </div>
          )}
        </Card>
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm người dùng</DialogTitle>
            <DialogDescription>
              Tạo tài khoản mới và đặt mật khẩu ban đầu.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="u-name">Họ và tên</Label>
              <Input
                id="u-name"
                value={form.fullName}
                onChange={(e) =>
                  setForm({ ...form, fullName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="u-email">Email</Label>
              <Input
                id="u-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="u-pass">Mật khẩu (tối thiểu 6 ký tự)</Label>
              <Input
                id="u-pass"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="u-phone">Số điện thoại</Label>
              <Input
                id="u-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="u-role">Vai trò</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as Role })}
              >
                <SelectTrigger id="u-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Khách hàng</SelectItem>
                  <SelectItem value="ADMIN">Quản trị</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>
              Huỷ
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                pending ||
                form.fullName.trim().length < 2 ||
                !form.email.includes('@') ||
                form.password.length < 6
              }
            >
              Tạo người dùng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={resetting !== null}
        onOpenChange={(open) => !open && setResetting(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
            <DialogDescription>
              Đặt mật khẩu mới cho {resetting?.email}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="r-pass">Mật khẩu mới</Label>
            <Input
              id="r-pass"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResetting(null)}>
              Huỷ
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={pending || newPassword.length < 6}
            >
              Đặt lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}