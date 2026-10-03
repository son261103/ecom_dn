import Link from 'next/link';

const FOOTER_LINKS = [
  {
    title: 'Mua sắm',
    links: [
      { href: '/nam', label: 'Thời trang nam' },
      { href: '/nu', label: 'Thời trang nữ' },
      { href: '/featured', label: 'Sản phẩm nổi bật' },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { href: '/cart', label: 'Giỏ hàng' },
      { href: '/account', label: 'Tài khoản' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                DN
              </span>
              DN Fashion
            </Link>
            <p className="text-sm text-muted-foreground">
              Cửa hàng quần áo online dành cho nam và nữ, đổi trả dễ dàng 30
              ngày.
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-sm font-semibold">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 border-t pt-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} DN Fashion. Đồ chuẩn bị vì bạn.
        </p>
      </div>
    </footer>
  );
}