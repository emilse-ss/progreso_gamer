import type { ReactNode } from 'react';

interface EncabezadoPanelProps {
  titulo: ReactNode;
  className?: string;
}

export function EncabezadoPanel({
  titulo,
  className = '',
}: EncabezadoPanelProps) {
  return (
    <header className={`ui-panel-heading ${className}`.trim()}>
      <h1 className="ui-panel-heading__title">{titulo}</h1>
    </header>
  );
}
