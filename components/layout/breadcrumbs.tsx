import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex flex-wrap items-center gap-1 text-sm text-muted-foreground', className)}
    >
      {/* Home Link */}
      <Link
        href="/"
        className="flex items-center transition-colors hover:text-foreground"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>

      {/* Breadcrumb Items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-foreground whitespace-nowrap"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(isLast && 'font-medium text-foreground', 'break-words')}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
