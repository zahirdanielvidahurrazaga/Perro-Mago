import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'warning' | 'danger' | 'success';
  pulse?: boolean;
  className?: string;
}

export function Badge({ children, variant = 'default', pulse = false, className }: BadgeProps) {
  const variants = {
    default: 'bg-surface-container-highest text-on-surface-variant',
    warning: 'bg-amber-900/40 text-warning',
    danger: 'bg-red-900/40 text-error',
    success: 'bg-emerald-900/40 text-success',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full',
        variants[variant],
        pulse && 'animate-pulse-alert',
        className
      )}
    >
      {children}
    </span>
  );
}
