'use client';

import { motion } from 'framer-motion';
import { cn, EASE } from '@/lib/utils';

interface FeatureCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/** Bento-grid card with the standard hover lift + border brighten. */
export function FeatureCard({ children, className, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.14]',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
