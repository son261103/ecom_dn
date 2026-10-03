'use client';

import { useRef, type ReactNode } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * Shared motion primitives for the whole app — admin panel and storefront both
 * import from here. Every variant collapses to a plain fade when the visitor
 * prefers reduced motion, so nothing depends on animation to be usable.
 */
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1 },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0 },
};

/** Container that staggers its children on mount. */
export function Stagger({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.06, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** One item inside a Stagger group. */
export function StaggerItem({
  children,
  className,
  variants = fadeUp,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={reduced ? fadeIn : variants}
      transition={{ duration: 0.45, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/** Cross-fades children when the route changes. */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Reveals its children the first time they scroll into view. Used for long
 * admin pages so content below the fold is not just popped into existence.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.5, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Lifts a card slightly on hover; disabled under reduced motion. */
export function HoverLift({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Drifts its children against the scroll direction, so editorial images move
 * slower than the page. Collapses to a plain div under reduced motion.
 */
export function Parallax({
  children,
  className,
  offset = 60,
}: {
  children: ReactNode;
  className?: string;
  /** Maximum vertical travel in pixels across the element's scroll range. */
  offset?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  // `relative` là bắt buộc: <Image fill> neo theo parent có position, nếu
  // không có nó Next sẽ cảnh báo "invalid position: static".
  if (reduced) {
    return (
      <div ref={ref} className={cn('relative', className)}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <motion.div style={{ y }} className="relative h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Infinite scrolling text band. The track is duplicated once so the -50%
 * translate loops seamlessly; paused entirely under reduced motion.
 */
export function Marquee({
  children,
  className,
  duration = 32,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className={className}>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('group relative flex overflow-hidden', className)}
      style={
        { '--marquee-duration': `${duration}s` } as React.CSSProperties
      }
    >
      <div className="flex shrink-0 items-center gap-8 pr-8 group-hover:[animation-play-state:paused] motion-safe:animate-[marquee_var(--marquee-duration)_linear_infinite]">
        {children}
      </div>
      <div
        aria-hidden
        className="flex shrink-0 items-center gap-8 pr-8 group-hover:[animation-play-state:paused] motion-safe:animate-[marquee_var(--marquee-duration)_linear_infinite]"
      >
        {children}
      </div>
    </div>
  );
}

export { EASE_OUT };