import { forwardRef, type HTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

type GlassVariant = 'default' | 'strong' | 'subtle' | 'bordered';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: GlassVariant;
  glow?: 'cyan' | 'coral' | 'amber' | 'mint' | 'lavender' | 'none';
  hoverLift?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles: Record<GlassVariant, string> = {
  default: 'glass-card rounded-2xl',
  strong: 'glass-strong rounded-2xl',
  subtle: 'bg-white/[0.02] rounded-2xl border border-white/[0.04]',
  bordered: 'glass-card rounded-2xl border-white/[0.08]',
};

const glowStyles: Record<string, string> = {
  cyan: 'glow-cyan',
  coral: 'glow-coral',
  amber: 'glow-amber',
  mint: 'glow-mint',
  lavender: 'glow-lavender',
  none: '',
};

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ variant = 'default', glow = 'none', hoverLift = false, padding = 'md', className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          variantStyles[variant],
          glowStyles[glow],
          paddingStyles[padding],
          hoverLift && 'transition-transform duration-300 hover:-translate-y-1',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;
