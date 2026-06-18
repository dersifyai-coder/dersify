'use client';

import { motion } from 'framer-motion';
import { cn, EASE } from '@/lib/utils';

interface FeatureCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function FeatureCard({ children, className, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      className={cn('group relative overflow-hidden rounded-lg p-8', className)}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {children}
    </motion.div>
  );
}
