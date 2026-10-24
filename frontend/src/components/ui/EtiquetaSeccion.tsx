import type { ReactNode } from 'react';

interface EtiquetaSeccionProps {
  children: ReactNode;
  className?: string;
}

export function EtiquetaSeccion({
  children,
  className = '',
}: EtiquetaSeccionProps) {
  return (
    <span className={`ui-section-label ${className}`.trim()}>
      <span className="ui-section-label__content">{children}</span>
    </span>
  );
}
