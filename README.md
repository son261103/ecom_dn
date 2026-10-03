# DN Fashion — Web bán quần áo nam & nữ

Full-stack e-commerce với **NestJS** (API) + **Next.js** (UI), dùng **shadcn/ui** trên nền **ReUI** registry.

```
ecom_dn/
├── backend/     NestJS + Prisma 7 + PostgreSQL + JWT
└── frontend/    Next.js 16 + React 19 + Tailwind v4 + shadcn/ui + ReUI
```

## Phiên bản dependency

Mọi package đều ở bản `@latest` **trừ khi bị chặn bởi ecosystem**. Ba ngoại lệ này có lý do kỹ thuật cụ thể, sẽ bỏ hạn chế ngay khi thư viện nâng cấp:

| Package | Đang dùng | Mới nhất | Lý do |
| --- | --- | --- | --- |
| `prisma` / `@prisma/client` / `@prisma/adapter-pg` | 7.10.0 | 8.0.0-rc.19 | Bản `8.0.0-rc.19` trên tag `latest` **không phải Prisma ORM 8** mà là Prisma Developer Platform CLI: đã viết lại toàn bộ, không còn `prisma generate`, `migrate dev`, `validate`. `@prisma/client` và `@prisma/adapter-pg` cũng **chưa publish** bản 8 RC (chỉ có `8.1.0-dev.*`). |
| `typescript` (backend) | 6.0.3 | 7.0.2 | Nest CLI yêu cầu programmatic compiler API. TS 7.0 chỉ có executable `tsc`, API dự kiến có ở 7.1. Nest CLI báo lỗi tường minh và yêu cầu TS 6. |
| `eslint` (frontend) | 9.39.5 | 10.11.0 | `eslint-plugin-react` bản mới nhất (7.37.5) khai báo peer `eslint ^3…^9.7`, chưa hỗ trợ ESLint 10. Dùng ESLint 10 sẽ vỡ rule `react/display-name`. |

Frontend chạy **TypeScript 7.0.2** (bản native Go, nhanh hơn 8–12×) cho `tsc`, đồng thời cài API TS 6 song song để `typescript-eslint` chạy được:

```json
"devDependencies": {
  "@typescript/native": "npm:typescript@^7.0.2",
  "typescript": "npm:@typescript/typescript6@^6.0.2"
}
```

Cách này là alias chính thức từ [announcing-typescript-7-0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-60) — `npx tsc` dùng TS 7, còn linter import `typescript` sẽ nhận API của TS 6.

Các package còn lại đã ở bản mới nhất: NestJS 12, Next.js 16.3, React 19.3, Tailwind v4, shadcn/ui 4.21, ReUI, motion 13.5, Vitest 5, oxlint, Prettier 3.

## Phân tách Nam / Nữ

`Gender` enum lưu trên cả `Product` và `Category`, nên mọi truy vấn đều lọc được theo giới tính:

| Route frontend | Query API | Enum |
| --- | --- | --- |
| `/nam` | `GET /api/products?gender=MALE` | `MALE` |
| `/nu` | `GET /api/products?gender=FEMALE` | `FEMALE` |
| `/unisex` | `GET /api/products?gender=UNISEX` | `UNISEX` |
| `/featured` | `GET /api/products?featured=true` | — |

## Yêu cầu

- Node.js 20+ (đã test với 24)
- pnpm 10+

## Database: Aiven Cloud

Dự án dùng **Aiven Cloud PostgreSQL**. Lấy connection string ở **Aiven Console → Service → Connect → Connection parameters**, dạng:

```
postgresql://USER:PASSWORD@PROJECT-REF.aivencloud.com:PORT/defaultdbname?sslmode=require
```

`sslmode=require` là bắt buộc — Aiven chỉ nhận kết nối có mã hoá TLS.

Dán vào `backend/.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@PROJECT-REF.aivencloud.com:PORT/defaultdbname?sslmode=require"
```

Rồi tạo bảng và nạp dữ liệu:

```bash
cd backend
pnpm install
cp .env.example .env        # điền DATABASE_URL + JWT_SECRET
pnpm prisma migrate deploy  # áp dụng migration đã có sẵn
pnpm prisma db seed         # nạp 57 sản phẩm + 17 danh mục + 912 biến thể
pnpm start:dev              # http://localhost:3005/api
```

`PrismaService` giới hạn pool ở 5 kết nối (`max: 5`) để không vượt giới hạn của Aiven free tier.

### Chạy Postgres local (không dùng Aiven)

Khi phát triển offline có thể dùng container local:

```bash
docker run -d --name ecom_dn_pg \
  -e POSTGRES_USER=ecom \
  -e POSTGRES_PASSWORD=ecom \
  -e POSTGRES_DB=ecom_dn \
  -p 5433:5432 \
  postgres:18-alpine
```

Rồi đổi `DATABASE_URL` trong `backend/.env` thành:

```
DATABASE_URL="postgresql://ecom:ecom@localhost:5433/ecom_dn?schema=public"
```

Port 5433 vì container `postgres_container` của project khác đang chiếm 5432 trên máy này.

### 3. Frontend

```bash
cd frontend
pnpm install
pnpm dev                   # http://localhost:3000
```

## Scripts

| Lệnh | Thư mục | Mô tả |
| --- | --- | --- |
| `pnpm start:dev` | backend | Chạy API ở chế độ watch |
| `pnpm build` | backend | Build ra `dist/` |
| `pnpm prisma studio` | backend | Giao diện xem DB |
| `pnpm prisma db seed` | backend | Nạp lại dữ liệu mẫu |
| `pnpm tsx prisma/upload-storefront.ts` | backend | Đẩy ảnh hero/banner lên Cloudinary |
| `bash admin-api-test.sh` | backend | 83 kiểm thử API admin (cần backend đang chạy) |
| `pnpm dev` | frontend | Dev server |
| `pnpm build` | frontend | Production build |
| `pnpm lint` | frontend | ESLint |

## API

Tất cả route có prefix `/api`.

### Xác thực

**Auth bật mặc định toàn cục.** `JwtAuthGuard` được đăng ký bằng `APP_GUARD` trong `AuthModule`, nên controller mới tạo ra là đã có bảo vệ — không thể quên. Endpoint công khai phải khai báo tường minh bằng `@Public()`:

```ts
@Public()
@Controller('products')
export class ProductsController { ... }
```

Trạng thái hiện tại:

| Phạm vi | Auth |
| --- | --- |
| `/auth/register`, `/auth/login` | `@Public()` |
| `/products*`, `/categories` | `@Public()` (đặt ở cấp controller) |
| `/auth/me`, `/orders*` | Mặc định — cần Bearer token |
| `/api/admin/*` | Mặc định + `RolesGuard([Role.ADMIN])` |

Ma trận kiểm tra:

| Endpoint | Không token | Khách hàng | Admin |
| --- | --- | --- | --- |
| `GET /products`, `/categories` | 200 | 200 | 200 |
| `GET /auth/me` | 401 | 200 | 200 |
| `GET`/`POST /orders` | 401 | 200 | 200 |
| `GET /admin/upload/status` | 401 | 403 | 200 |

Token không hợp lệ (sai format, sai secret, thiếu scheme) đều trả 401 trên route protected và bị bỏ qua trên route `@Public()`.

### Auth
| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| POST | `/auth/register` | công khai | Đăng ký, trả `accessToken` |
| POST | `/auth/login` | công khai | Đăng nhập, trả `accessToken` |
| GET | `/auth/me` | Bearer | Thông tin user hiện tại |

### Catalog (công khai)
| Method | Path | Mô tả |
| --- | --- | --- |
| GET | `/products` | Phân trang, lọc theo `gender`, `category`, `search`, `featured` |
| GET | `/products/featured` | Sản phẩm nổi bật |
| GET | `/products/:slug` | Chi tiết sản phẩm kèm variants + images |
| GET | `/categories` | Danh mục, lọc theo `gender` |

### Orders (yêu cầu Bearer token)
| Method | Path | Mô tả |
| --- | --- | --- |
| POST | `/orders` | Tạo đơn, trừ kho trong transaction |
| GET | `/orders` | Đơn của user hiện tại |
| GET | `/orders/:id` | Chi tiết một đơn |

### Admin (yêu cầu Bearer token + role `ADMIN`)

Mọi route `/api/admin/*` nằm trong `AdminModule`. Auth đã bật global, nên controller chỉ thêm `RolesGuard([Role.ADMIN])` để giới hạn vai trò — token khách hàng nhận 403.

| Method | Path | Mô tả |
| --- | --- | --- |
| GET | `/admin/stats` | Số liệu dashboard: doanh thu, đơn theo trạng thái, tồn kho thấp |
| GET | `/admin/categories` | Danh sách + tìm kiếm + lọc theo giới tính |
| POST | `/admin/categories` | Tạo danh mục (slug tự sinh từ tên) |
| GET | `/admin/categories/:id` | Chi tiết một danh mục |
| PATCH | `/admin/categories/:id` | Sửa danh mục |
| DELETE | `/admin/categories/:id` | Xoá — chặn nếu còn sản phẩm |
| GET | `/admin/products` | Danh sách + lọc `gender`, `categoryId`, `isActive`, `isFeatured`, `search` |
| POST | `/admin/products` | Tạo sản phẩm kèm variants và images |
| GET | `/admin/products/:id` | Chi tiết kèm số lượt đặt của từng variant |
| PATCH | `/admin/products/:id` | Sửa; truyền `variants` sẽ thay cả bộ biến thể |
| PATCH | `/admin/products/variants/:variantId/stock` | Điều chỉnh tồn kho (`SET` / `INCREASE` / `DECREASE`) |
| DELETE | `/admin/products/:id` | Soft-delete nếu đã có trong đơn, xoá hẳn nếu chưa |
| GET | `/admin/orders` | Danh sách + lọc `status`, tìm theo mã đơn / tên / SĐT |
| GET | `/admin/orders/:id` | Chi tiết đơn kèm sản phẩm và khách hàng |
| GET | `/admin/orders/:id/transitions` | Các trạng thái đơn có thể chuyển tới |
| PATCH | `/admin/orders/:id/status` | Đổi trạng thái (huỷ sẽ trả lại tồn kho) |
| PATCH | `/admin/orders/:id` | Sửa thông tin giao hàng |
| DELETE | `/admin/orders/:id` | Xoá — chỉ khi đơn đã huỷ |
| GET | `/admin/users` | Danh sách + lọc `role`, tìm theo tên / email / SĐT |
| POST | `/admin/users` | Tạo tài khoản |
| GET | `/admin/users/:id` | Chi tiết kèm 20 đơn gần nhất |
| PATCH | `/admin/users/:id` | Sửa tên, SĐT, vai trò |
| PATCH | `/admin/users/:id/password` | Đặt lại mật khẩu |
| DELETE | `/admin/users/:id` | Xoá — chặn nếu có đơn, chặn tự xoá / hạ quyền mình |
| GET | `/admin/upload/status` | Kiểm tra đã cấu hình Cloudinary chưa |
| POST | `/admin/upload/image` | Upload file (multipart `file`), tối đa 5MB |
| POST | `/admin/upload/image-from-url` | Lấy ảnh từ URL rồi đẩy lên Cloudinary |
| DELETE | `/admin/upload/:publicId` | Xoá ảnh trên Cloudinary |

Giao diện quản trị ở `/admin`: tổng quan, sản phẩm, danh mục, đơn hàng, người dùng, ảnh.

**Quy tắc nghiệp vụ đáng chú ý**

- Sản phẩm từng xuất hiện trong đơn chỉ bị ẩn (soft delete), không xoá hẳn — để giữ lịch sử đơn.
- Biến thể đã có trong đơn không thể xoá; đặt tồn kho về 0 thay thế.
- Đơn chỉ chuyển trạng thái theo luồng hợp lệ: `PENDING → CONFIRMED → SHIPPING → DELIVERED`, huỷ được ở mọi bước trước khi giao. `DELIVERED` và `CANCELLED` là trạng thái cuối.
- Huỷ đơn hoàn lại tồn kho trong cùng transaction.
- Không thể hạ quyền, xoá chính mình, hoặc xoá quản trị viên cuối cùng.

Chỉ nhận ảnh `image/jpeg`, `image/png`, `image/webp`, `image/avif`.

## Ảnh: Cloudinary

Ảnh sản phẩm lưu trên Cloudinary và phân phối qua CDN `res.cloudinary.com`.

Điền credentials vào `backend/.env` (lấy ở **Cloudinary Dashboard → Settings → API Keys**):

```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

Ứng dụng vẫn khởi động bình thường khi thiếu credentials — `CloudinaryService.isConfigured` trả `false`, các endpoint upload trả lỗi 400 với hướng dẫn rõ ràng, và seed giữ nguyên URL ảnh Unsplash.

> **Lưu ý:** `CLOUDINARY_CLOUD_NAME` phải là tên cloud gốc trong dashboard (ví dụ
> `mediaflows`), **không** phải tên cloud kèm UUID. Cloud đang bị disable sẽ báo
> lỗi `Invalid cloud_name` hoặc `cloud_name is disabled` khi seed chạy — lúc đó
> ảnh vẫn lưu URL Unsplash và web vẫn chạy bình thường, chỉ là chưa qua CDN.

Sau khi điền key, chạy lại seed để đẩy toàn bộ ảnh mẫu lên CDN:

```bash
cd backend && pnpm prisma db seed
```

Seed dùng `public_id` dạng `category-{slug}` cho ảnh danh mục và `{slug}-1..3` cho
ảnh sản phẩm, với `overwrite: true`, nên chạy lại nhiều lần không tạo ảnh trùng.

Ảnh hero/banner của storefront không thuộc sản phẩm nào nên không nằm trong catalog.
Script riêng đẩy nhóm ảnh này lên CDN và in ra URL để thay trong component:

```bash
cd backend && pnpm tsx prisma/upload-storefront.ts
```

Nhờ vậy **không còn hotlink Unsplash ở đâu trong frontend** — chỉ còn placeholder
trong ô "Tảy ảnh từ URL" của trang quản lý ảnh.

### Catalog mẫu

Danh sách sản phẩm và danh mục nằm trong **`backend/prisma/catalog.ts`**, tách riêng
khỏi `seed.ts` để thêm/sửa mẫu không phải đụng vào logic upload.

Hiện có **57 sản phẩm / 17 danh mục / 912 biến thể**, mỗi sản phẩm 3 ảnh và đủ
4 màu × 4 size. Mọi photo id Unsplash trong catalog đều đã được kiểm tra HTTP 200
trước khi đưa vào — ảnh chết là nguyên nhân chính khiến trang chủ hiển thị trống.

Tài khoản admin để test giao diện upload:

```bash
# đổi role ADMIN cho một user đã có, hoặc tạo mới
docker exec -it ecom_dn_pg psql -U ecom -d ecom_dn \
  -c "UPDATE users SET role='ADMIN' WHERE email='you@example.com';"
```

## Cấu trúc backend

```
src/
├── prisma/          PrismaService (driver adapter @prisma/adapter-pg) + module
├── auth/            register/login, JWT strategy, DTO + đăng ký APP_GUARD
├── guards/          JwtAuthGuard (global), RolesGuard (theo role)
├── decorators/      @Public, @CurrentUser
├── products/        list (filter + phân trang), detail, featured
├── categories/      danh mục theo giới tính
├── orders/          tạo đơn trong transaction, lịch sử đơn
├── admin/           endpoint chỉ dành cho ADMIN → /api/admin/*
│   ├── stats/       số liệu dashboard
│   ├── categories/  CRUD danh mục
│   ├── products/    CRUD sản phẩm + variants + images
│   ├── orders/      duyệt / đổi trạng thái / xoá đơn
│   ├── users/       CRUD người dùng + đặt lại mật khẩu
│   ├── images/      Cloudinary service + controller
│   ├── shared.ts    paginate(), searchWhere()
│   ├── utils/       slugify() bỏ dấu tiếng Việt
│   └── admin.module.ts
```

**Quy ước auth:** route mới mặc định đã có bảo vệ. Muốn mở công khai thì thêm `@Public()`. Muốn giới hạn theo vai trò thì thêm `@UseGuards(new RolesGuard([Role.ADMIN]))` — không cần khai báo `JwtAuthGuard` vì nó đã chạy global.

Prisma 7 không còn `url` trong `schema.prisma` — connection string nằm ở `prisma.config.ts`, và client cần driver adapter:

```ts
new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
```

## Cấu trúc frontend

`src/app` chia bằng **route group** để cửa hàng và khu quản trị có layout riêng:

```
src/
├── app/
│   ├── layout.tsx            chỉ html/body + CartProvider + Toaster
│   ├── (storefront)/         cửa hàng: có header + footer
│   │   ├── layout.tsx
│   │   ├── page.tsx          trang chủ (hero Nam/Nữ + sản phẩm nổi bật)
│   │   ├── nam|nu|unisex|    danh sách, dùng chung ProductListView
│   │   ├── featured/
│   │   ├── product/[slug]/   chi tiết + chọn màu/size
│   │   ├── cart/             giỏ hàng + checkout
│   │   ├── login|register/   auth
│   │   └── account/          profile + lịch sử đơn
│   └── (admin)/admin/        quản trị: full-width, KHÔNG header/footer
│       ├── layout.tsx        → AdminShell
│       ├── page.tsx          tổng quan
│       ├── products/ categories/ orders/ users/ images/
├── components/
│   ├── layout/               header, footer, Section + SectionHeading
│   ├── home/                 hero, marquee, category-grid, product-rail,
│   │                         editorial-banner, stats-band, value-grid, faq, newsletter
│   ├── product/ cart/ auth/ account/
│   ├── providers/            CartProvider (giỏ hàng + session)
│   ├── motion/               motion primitives DÙNG CHUNG (admin + storefront)
│   │   ├── motion.tsx        Stagger, Reveal, HoverLift, PageTransition,
│   │   │                     Parallax, Marquee, EASE_OUT
│   │   ├── animated-number.tsx
│   │   └── index.ts          barrel
│   ├── admin/
│   │   ├── admin-shell.tsx   sidebar cố định + drawer mobile + scroll progress
│   │   ├── admin-dashboard.tsx
│   │   ├── admin-*-page.tsx  CRUD từng resource
│   │   ├── hooks.ts          useAdminResource / useAdminAction
│   │   └── ui.tsx            AdminHeader, AdminToolbar, AdminList, ConfirmButton
│   └── ui/                   shadcn/ui + component từ ReUI registry
└── lib/
    ├── api/              chỉ chứa code gọi API, theo domain
    │   ├── client.ts     fetch wrapper + ApiError + toQuery
    │   ├── config.ts     API_URL
    │   ├── auth.ts       authApi
    │   ├── products.ts   productsApi, categoriesApi
    │   ├── orders.ts     ordersApi
    │   ├── admin.ts      barrel của các module admin
    │   ├── admin-*.ts    adminCategories/products/orders/users/stats/images
    │   └── index.ts      barrel cho API công khai
    ├── types/            chỉ chứa model, theo domain
    │   ├── shared.ts     Gender, Role, Paginated
    │   ├── products.ts   Product, Category, ProductVariant, …
    │   ├── auth.ts       User, AuthResponse, payload
    │   ├── orders.ts     Order, OrderItem, OrderStatus
    │   ├── admin.ts      AdminStats, AdminProduct*, AdminOrder*, AdminUser*
    │   ├── upload.ts     UploadedImage
    │   └── index.ts      barrel export type
    ├── base-ui.tsx       helper `linkTo` cho Base UI
    ├── format.ts         formatPrice, GENDER_LABEL, COLOR_SWATCH
    └── utils.ts          cn()
```

### Vì sao dùng route group

App Router **không cho nested layout thoát khỏi layout cha**, nên admin từng bị bọc trong `SiteHeader` + `SiteFooter` của cửa hàng. Tách `(storefront)` và `(admin)` thành hai nhánh độc lập:

- `(storefront)/layout.tsx` — header + nội dung + footer
- `(admin)/admin/layout.tsx` — chỉ `AdminShell`, trải hết chiều ngang

Cả hai cùng kế thừa `app/layout.tsx` (chỉ có `<html>`, `<body>`, `CartProvider`), nên session và toast vẫn dùng chung.

## Motion & hiệu ứng scroll

Dùng [`motion`](https://motion.dev) — import từ `motion/react`, cùng cách ReUI dùng.

Toàn bộ primitive nằm ở **`components/motion/`** và được cả admin lẫn storefront
dùng chung. Trước đây chúng nằm trong `components/admin/motion.tsx`, nên storefront
không import được và phải viết `motion.*` thủ công.

```tsx
import { Stagger, StaggerItem, Reveal, HoverLift, Parallax, Marquee }
  from '@/components/motion';
```

| Hiệu ứng | Ở đâu |
| --- | --- |
| Scroll progress bar | Thanh 2px trên cùng của admin, scale theo tỉ lệ cuộn |
| Chuyển trang | `AnimatePresence` mời + trượt nhẹ theo `pathname` |
| Sidebar active | `layoutId` trượt pill nền giữa các mục |
| Drawer mobile | Trượt vào từ trái + overlay mờ dần |
| Stagger list | Card/bảng hiện lần lượt khi vào trang |
| Reveal on scroll | Khối dưới fold mờ dần khi cuộn tới (`once: true`) |
| Đếm số | `AnimatedNumber` chạy từ 0 tới giá trị thật |
| Parallax | Ảnh hero/editorial trôi chậm hơn khung hình khi cuộn |
| Marquee | Dải cam kết chạy ngang vô hạn |
| Hover đổi ảnh | Product card đổi sang ảnh thứ hai khi rê chuột |

Tất cả hiệu ứng đều tôn trọng `prefers-reduced-motion` — khi người dùng tắt animation,
mọi thứ hiện tại luôn (kiểm bằng `useReducedMotion()` trong từng primitive, cộng thêm
block `@media (prefers-reduced-motion: reduce)` trong `globals.css`).

Thêm hiệu ứng mới: dùng component trong `components/motion/` thay vì tự viết `motion.*` mỗi chỗ.

### Vì sao tách `api/` và `types/` riêng

Trước đó mỗi domain vừa có code vừa có model nằm cùng file (`auth.ts` + `auth.types.ts` xen kẽ), và `shared.ts` lại chứa cả hằng số `API_URL` lẫn type — đọc vào không biết đâu là gì. Nay:

- `lib/api/` — **chỉ code**: gọi endpoint, xử lý token
- `lib/types/` — **chỉ model**: mô tả hình dạng dữ liệu
- `api/config.ts` — hằng số cấu hình, tách riêng khỏi type

Import trông rõ ràng:

```ts
import { productsApi, categoriesApi } from '@/lib/api';   // code
import type { Product, Gender } from '@/lib/types';        // model
```

### Vì sao `adminApi` không nằm trong barrel

Endpoint admin được giữ riêng ở `@/lib/api/admin` và **cố ý không export** từ `lib/api/index.ts`:

```ts
import { adminApi } from '@/lib/api/admin';   // phải import tường minh
```

Nhờ vậy lướt tìm kiếm trong project sẽ cho thấy chính xác chỗ nào gọi API admin, và trang khách không vô tình gọi nhầm. Phía backend cũng tương ứng: mọi route admin nằm dưới `/api/admin/*` trong `AdminModule`.

Thêm endpoint mới chỉ cần sửa đúng file của domain đó, không đụng domain khác.

## Trang chủ

`app/(storefront)/page.tsx` là server component, gọi API song song bằng `Promise.all`.
Mỗi request có `.catch(() => fallback)` riêng nên API chết một phần không làm trang trắng.

11 section theo thứ tự:

1. **Hero** — copy + collage ảnh parallax, sản phẩm nổi bật nhúng vào góc
2. **Marquee** — dải cam kết chạy ngang
3. **Danh mục** — grid danh mục từ `GET /categories`, có số sản phẩm
4. **Sản phẩm nổi bật** — grid 4 cột từ `GET /products/featured`
5. **Mới về** — carousel Embla, kéo được bằng chuột
6. **Đồ unisex**
7. **Thời trang nam**
8. **Thời trang nữ**
9. **Banner editorial** — ảnh lớn có parallax
10. **Con số** — 4 số đếm dần, lấy từ `meta.total` của API
11. **Cam kết dịch vụ → FAQ → Newsletter**

### Vì sao section thống kê gọi 3 request `limit=1`

`GET /api/admin/stats` là admin-only, còn storefront không được gọi. Thay vì mở
endpoint mới, trang chủ đọc `meta.total` từ các request list có `limit: 1` —
nhẹ hơn tải cả danh sách về, và **con số luôn khớp với API thật**, không bịa
lượng khách hàng hay đơn hàng (seed không tạo user/order nên không có số đó để hiện).

Form newsletter hiện xác nhận ở client vì backend chưa có endpoint subscribe;
chỗ gọi request duy nhất khi có API là `handleSubmit` trong
`components/home/newsletter.tsx`.

## Ghi chú về shadcn/ui + ReUI

Frontend dùng **Base UI** làm primitive (không phải Radix), nên component không có `asChild` mà dùng `render`:

```tsx
<Button {...linkTo('/nam')}>Mua thời trang nam</Button>
```

`linkTo` bọc Next `<Link>` và bật `nativeButton={false}` để tránh cảnh báo semantics từ Base UI.

Registry ReUI đã được đăng ký trong `components.json`:

```json
"registries": { "@reui": "https://reui.io/r/{style}/{name}.json" }
```

Cài component miễn phí (prefix `c-`) bằng:

```bash
pnpm dlx shadcn@latest add @reui/c-carousel-3
```

Các block premium (`shop-hero-*`, `product-card-*`, `product-detail-*`) cần license key của ReUI. Thêm key vào `frontend/.env.local`:

```
REUI_LICENSE_KEY=your-key
```

rồi đổi entry registry thành dạng có header:

```json
"@reui": {
  "url": "https://reui.io/r/{style}/{name}.json",
  "headers": { "Authorization": "Bearer ${REUI_LICENSE_KEY}" }
}
```

## Biến môi trường

`backend/.env`

```
DATABASE_URL="postgresql://ecom:ecom@localhost:5433/ecom_dn?schema=public"
JWT_SECRET="thay-bang-chuoi-ngau-nhien-dai"
JWT_EXPIRES_IN="7d"
PORT=3005
```

`frontend/.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:3005/api
```