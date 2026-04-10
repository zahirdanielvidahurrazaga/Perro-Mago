import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <Loader2
      size={size}
      className={cn('animate-spin text-primary', className)}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <Spinner size={40} />
        <p className="text-on-surface-variant text-sm">Cargando...</p>
      </div>
    </div>
  );
}
