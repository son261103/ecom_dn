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

Các package còn lại đã ở bản mới nhất: NestJS 12, Next.js 16.3, React 19.3, Tailwind v4, shadcn/ui 4.21, ReUI, Vitest 5, oxlint, Prettier 3.

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
pnpm prisma db seed         # nạp 9 sản phẩm + 9 danh mục + 144 biến thể
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
| `pnpm dev` | frontend | Dev server |
| `pnpm build` | frontend | Production build |
| `pnpm lint` | frontend | ESLint |

## API

Tất cả route có prefix `/api`.

### Auth
| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| POST | `/auth/register` | – | Đăng ký, trả `accessToken` |
| POST | `/auth/login` | – | Đăng nhập, trả `accessToken` |
| GET | `/auth/me` | Bearer | Thông tin user hiện tại |

### Catalog
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

### Upload (yêu cầu Bearer token + role `ADMIN`)
| Method | Path | Mô tả |
| --- | --- | --- |
| GET | `/upload/status` | Kiểm tra đã cấu hình Cloudinary chưa |
| POST | `/upload/image` | Upload file (multipart `file`), tối đa 5MB |
| POST | `/upload/image-from-url` | Lấy ảnh từ URL rồi đẩy lên Cloudinary |
| DELETE | `/upload/:publicId` | Xoá ảnh trên Cloudinary |

Chỉ nhận `image/jpeg`, `image/png`, `image/webp`, `image/avif`. Giao diện quản lý ảnh: `/admin/images`.

## Ảnh: Cloudinary

Ảnh sản phẩm lưu trên Cloudinary và phân phối qua CDN `res.cloudinary.com`.

Điền credentials vào `backend/.env` (lấy ở **Cloudinary Dashboard → Settings → API Keys**):

```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

Ứng dụng vẫn khởi động bình thường khi thiếu credentials — `CloudinaryService.isConfigured` trả `false`, các endpoint upload trả lỗi 400 với hướng dẫn rõ ràng, và seed giữ nguyên URL ảnh Unsplash.

Sau khi điền key, chạy lại seed để đẩy toàn bộ ảnh mẫu lên CDN:

```bash
cd backend && pnpm prisma db seed
```

Seed dùng `public_id` dạng `{slug}-1` và `{slug}-2` với `overwrite: true`, nên chạy lại nhiều lần không tạo ảnh trùng.

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
├── auth/            register/login, JWT strategy, guard, DTO
├── products/        list (filter + phân trang), detail, featured
├── categories/      danh mục theo giới tính
├── orders/          tạo đơn trong transaction, lịch sử đơn
├── upload/          Cloudinary service + endpoint (chỉ ADMIN)
└── common/          decorator CurrentUser
```

Prisma 7 không còn `url` trong `schema.prisma` — connection string nằm ở `prisma.config.ts`, và client cần driver adapter:

```ts
new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
```

## Cấu trúc frontend

```
src/
├── app/
│   ├── page.tsx           trang chủ (hero Nam/Nữ + sản phẩm nổi bật)
│   ├── nam|nu|unisex|     route danh sách, dùng chung ProductListView
│   ├── featured/
│   ├── product/[slug]/    chi tiết + chọn màu/size
│   ├── cart/              giỏ hàng + checkout
│   ├── login|register/    auth
│   ├── account/           profile + lịch sử đơn
│   └── admin/images/      quản lý ảnh Cloudinary (chỉ ADMIN)
├── components/
│   ├── layout/            header, footer
│   ├── product/           card, list view, filters, purchase panel
│   ├── cart/              cart view, checkout form
│   ├── auth/, account/
│   ├── upload/            image uploader
│   └── providers/         CartProvider (giỏ hàng + session)
├── lib/
│   ├── api/              lớp API theo domain
│   │   ├── client.ts     fetch wrapper + ApiError (Authorization, JSON, error)
│   │   ├── shared.ts     API_URL, Gender, Role, Paginated
│   │   ├── auth.ts       authApi
│   │   ├── products.ts   productsApi, categoriesApi
│   │   ├── orders.ts     ordersApi
│   │   ├── upload.ts     uploadApi (Cloudinary)
│   │   ├── *.types.ts    type theo domain
│   │   └── index.ts      barrel export
│   ├── base-ui.tsx       helper `linkTo` cho Base UI
│   ├── format.ts         formatPrice, GENDER_LABEL
│   └── utils.ts          cn()
└── components/ui/         shadcn/ui + component từ ReUI registry
```

### Vì sao tách API theo domain

`lib/api.ts` ban đầu gộp mọi endpoint vào một file — mỗi thêm API mới là file dài thêm và mọi import phải chỉ vào cùng một chỗ. Nay mỗi domain nằm trong file riêng và `index.ts` re-export, nên call site vẫn ngắn:

```ts
import { productsApi, categoriesApi, type Product } from '@/lib/api';
```

Thêm endpoint mới chỉ cần sửa đúng file của domain đó, không đụng domain khác. `client.ts` giữ phần lặp lại (base URL, header Bearer, parse lỗi) ở một chỗ duy nhất.

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