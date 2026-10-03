import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Be_Vietnam_Pro } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/components/providers/cart-provider';
import './globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-be-vietnam-pro',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'DN Fashion — Thời trang nam & nữ',
    template: '%s | DN Fashion',
  },
  description:
    'Cửa hàng quần áo online dành cho nam và nữ. Áo thun, sơ mi, quần jean, váy và áo khoác chất lượng, giá tốt.',
};

/**
 * Only the document shell lives here. Each route group supplies its own
 * layout so the storefront can show a header and footer while the admin
 * panel renders edge to edge without them.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <CartProvider>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </CartProvider>
      </body>
    </html>
  );
}