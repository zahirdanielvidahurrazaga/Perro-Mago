import { DATE_FILTERS } from '../../lib/constants';
import { useDateFilterStore } from '../../stores/useDateFilterStore';
import { cn } from '../../lib/utils';

export function DateFilter() {
  const activeFilter = useDateFilterStore((s) => s.activeFilter);
  const setFilter = useDateFilterStore((s) => s.setFilter);

  return (
    <div className="flex items-center gap-1 bg-surface-container-low rounded-xl p-1">
      {DATE_FILTERS.map((filter) => (
        <button
          key={filter.value}
          onClick={() => setFilter(filter.value)}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200',
            activeFilter === filter.value
              ? 'bg-primary text-on-primary'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
