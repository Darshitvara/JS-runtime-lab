import { cn } from '../../lib/utils';

type BadgeVariant = 'cyan' | 'coral' | 'amber' | 'mint' | 'lavender' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  cyan: 'bg-cyan/10 text-cyan border-cyan/20',
  coral: 'bg-coral/10 text-coral border-coral/20',
  amber: 'bg-amber/10 text-amber border-amber/20',
  mint: 'bg-mint/10 text-mint border-mint/20',
  lavender: 'bg-lavender/10 text-lavender border-lavender/20',
  neutral: 'bg-white/5 text-white/60 border-white/10',
};

const dotColors: Record<BadgeVariant, string> = {
  cyan: 'bg-cyan',
  coral: 'bg-coral',
  amber: 'bg-amber',
  mint: 'bg-mint',
  lavender: 'bg-lavender',
  neutral: 'bg-white/40',
};

export default function Badge({ variant = 'neutral', children, dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
