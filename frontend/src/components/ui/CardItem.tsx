import type { ReactNode } from 'react';
import { BarraProgreso } from './BarraProgreso';

interface CardItemProps {
  titulo: ReactNode;
  detalles?: ReactNode;
  icono?: ReactNode;
  accion?: ReactNode;
  progreso?: number;
  etiquetaProgreso?: string;
  insignia?: ReactNode;
  className?: string;
}

export function CardItem({
  titulo,
  detalles,
  icono,
  accion,
  progreso,
  etiquetaProgreso,
  insignia,
  className = '',
}: CardItemProps) {
  return (
    <article className={`ui-card-item ${className}`.trim()}>
      {icono && (
        <div aria-hidden="true" className="ui-card-item__icon">
          {icono}
        </div>
      )}
      <div className="ui-card-item__main">
        <h3 className="ui-card-item__title">{titulo}</h3>
        {detalles && <div className="ui-card-item__details">{detalles}</div>}
      </div>
      {accion && <div className="ui-card-item__action">{accion}</div>}
      {insignia && <div className="ui-card-item__badge">{insignia}</div>}
      {progreso !== undefined && (
        <div className="ui-card-item__progress">
          <BarraProgreso etiqueta={etiquetaProgreso} valor={progreso} />
        </div>
      )}
    </article>
  );
}
