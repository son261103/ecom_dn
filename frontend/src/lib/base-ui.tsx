import Link from 'next/link';

/**
 * Base UI components replace Radix's `asChild` with a `render` prop.
 * `nativeButton={false}` is required because a Next `<Link>` renders an
 * `<a>`, and Base UI warns when a button-semantics component renders one.
 */
export function linkTo(href: string): {
  render: React.ReactElement;
  nativeButton: false;
} {
  return { render: <Link href={href} />, nativeButton: false };
}