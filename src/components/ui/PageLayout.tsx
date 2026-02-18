import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  padded?: boolean;
}

const maxWidthStyles: Record<string, string> = {
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
  '2xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

export default function PageLayout({
  children,
  className,
  maxWidth = '7xl',
  padded = true,
}: PageLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'mx-auto w-full',
        maxWidthStyles[maxWidth],
        padded && 'px-4 sm:px-6 lg:px-8 py-12 sm:py-16',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
