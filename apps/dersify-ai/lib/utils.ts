import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Standard entrance ease — used by all fade-up animations. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Shared Framer Motion props for the fade-up entrance pattern. */
export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: EASE },
} as const;
