import type { ReactNode } from 'react';

interface BarraGrupoProps {
  children: ReactNode;
  icono?: ReactNode;
  variante?: 'verde' | 'carbon';
  className?: string;
}

export function BarraGrupo({
  children,
  icono,
  variante = 'verde',
  className = '',
}: BarraGrupoProps) {
  const classes = [
    'ui-group-bar',
    variante === 'carbon' ? 'ui-group-bar--carbon' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {icono && <span aria-hidden="true">{icono}</span>}
      <span>{children}</span>
    </div>
  );
}
