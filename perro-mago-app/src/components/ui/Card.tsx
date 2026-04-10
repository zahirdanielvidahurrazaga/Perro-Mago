import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  glow?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}

export function Card({ children, className, glass = false, glow = false, onClick, interactive = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-4',
        glass ? 'glass ghost-border' : 'bg-surface-container-high',
        glow && 'brand-glow',
        interactive && 'cursor-pointer transition-all duration-200 hover:ghost-border-active hover:brightness-105',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
