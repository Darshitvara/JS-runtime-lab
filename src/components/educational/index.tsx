import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface AnimatedDiagramProps {
  children: React.ReactNode;
  className?: string;
}

/** Wrapper that animates diagram content on mount */
export function AnimatedDiagram({ children, className }: AnimatedDiagramProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn('relative', className)}
    >
      {children}
    </motion.div>
  );
}

interface CodeExampleProps {
  code: string;
  title?: string;
  language?: string;
  className?: string;
}

/** Styled code block with monospace font and syntax-style coloring */
export function CodeExample({ code, title, className }: CodeExampleProps) {
  return (
    <div className={cn('rounded-xl overflow-hidden', className)}>
      {title && (
        <div className="bg-white/[0.06] border-b border-white/[0.06] px-4 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-coral/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-mint/60" />
          </div>
          <span className="text-xs text-white/40 font-mono ml-2">{title}</span>
        </div>
      )}
      <pre className="bg-white/[0.03] border border-white/[0.06] p-4 overflow-x-auto text-sm font-mono leading-relaxed text-white/80 rounded-b-xl">
        <code>{code}</code>
      </pre>
    </div>
  );
}

interface InteractiveDemoProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

/** Container for interactive mini-demos with title */
export function InteractiveDemo({ children, title, description, className }: InteractiveDemoProps) {
  return (
    <div className={cn('glass-card rounded-2xl overflow-hidden', className)}>
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white/90">{title}</h3>
        {description && <p className="text-xs text-white/40 mt-1">{description}</p>}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

interface SectionBlockProps {
  title: string;
  accent?: string;
  children: React.ReactNode;
  className?: string;
}

/** Reusable section block for educational content */
export function SectionBlock({ title, accent = 'gradient-text-cool', children, className }: SectionBlockProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className={cn('mb-16 sm:mb-20', className)}
    >
      <h2 className={`text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 ${accent}`}>{title}</h2>
      {children}
    </motion.section>
  );
}
