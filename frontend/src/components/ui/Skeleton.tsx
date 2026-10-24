interface SkeletonProps {
  cantidad?: number;
  variante?: 'texto' | 'bloque';
  className?: string;
}

export function Skeleton({
  cantidad = 1,
  variante = 'texto',
  className = '',
}: SkeletonProps) {
  return (
    <>
      {Array.from({ length: Math.max(0, cantidad) }, (_, index) => (
        <div
          aria-hidden="true"
          className={`ui-skeleton ui-skeleton--${variante} ${className}`.trim()}
          key={index}
        />
      ))}
    </>
  );
}
