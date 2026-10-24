import { useRef, type KeyboardEvent } from 'react';
import { Insignia } from './Insignia';

export interface PestanaOpcion {
  valor: string;
  etiqueta: string;
  contador?: number;
}

interface PestanasProps {
  opciones: PestanaOpcion[];
  valor: string;
  onChange: (valor: string) => void;
  etiqueta?: string;
  className?: string;
}

export function Pestanas({
  opciones,
  valor,
  onChange,
  etiqueta = 'Pestañas',
  className = '',
}: PestanasProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (opciones.length === 0) return;
    let targetIndex: number | null = null;
    if (event.key === 'ArrowRight') targetIndex = (index + 1) % opciones.length;
    if (event.key === 'ArrowLeft') {
      targetIndex = (index - 1 + opciones.length) % opciones.length;
    }
    if (event.key === 'Home') targetIndex = 0;
    if (event.key === 'End') targetIndex = opciones.length - 1;
    if (targetIndex === null) return;

    event.preventDefault();
    const next = opciones[targetIndex];
    if (!next) return;
    onChange(next.valor);
    tabRefs.current[targetIndex]?.focus();
  }

  return (
    <div
      aria-label={etiqueta}
      className={`ui-tabs ${className}`.trim()}
      role="tablist"
    >
      {opciones.map((opcion, index) => (
        <button
          aria-selected={valor === opcion.valor}
          className="ui-tabs__tab"
          id={`tab-${opcion.valor}`}
          key={opcion.valor}
          onClick={() => onChange(opcion.valor)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          ref={(element) => {
            tabRefs.current[index] = element;
          }}
          role="tab"
          tabIndex={valor === opcion.valor ? 0 : -1}
          type="button"
        >
          {opcion.etiqueta}
          {opcion.contador !== undefined && (
            <Insignia texto={String(opcion.contador)} tipo="contador" />
          )}
        </button>
      ))}
    </div>
  );
}
