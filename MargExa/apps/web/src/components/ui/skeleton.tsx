import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string
  height?: string
}

export function Skeleton({ className, width, height, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', className)}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl p-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between mb-3">
        <Skeleton width="80px" height="10px" />
        <Skeleton width="16px" height="16px" className="rounded" />
      </div>
      <Skeleton width="120px" height="28px" className="mb-2" />
      <Skeleton width="64px" height="12px" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3 pr-3">
          <Skeleton height="12px" width={i === 0 ? '140px' : i === cols - 1 ? '40px' : '80px'} />
        </td>
      ))}
    </tr>
  )
}

export function ChartSkeleton({ height = '240px' }: { height?: string }) {
  return (
    <div
      className="skeleton rounded-xl w-full"
      style={{ height }}
      aria-label="Chargement du graphique..."
      role="status"
    />
  )
}
