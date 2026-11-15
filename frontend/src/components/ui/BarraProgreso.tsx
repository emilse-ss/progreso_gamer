interface BarraProgresoProps {
  valor: number;
  etiqueta?: string;
  /** Texto legible del valor («3.5 h de 5 h»): se muestra y se expone como aria-valuetext. */
  textoValor?: string;
  className?: string;
}

export function BarraProgreso({
  valor,
  etiqueta = 'Progreso',
  textoValor,
  className = '',
}: BarraProgresoProps) {
  const porcentaje = Number.isFinite(valor)
    ? Math.min(100, Math.max(0, valor))
    : 0;

  return (
    <div
      aria-label={`${etiqueta}: ${porcentaje} %`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={porcentaje}
      aria-valuetext={textoValor}
      className={`ui-progress ${className}`.trim()}
      role="progressbar"
    >
      <div className="ui-progress__fill" style={{ width: `${porcentaje}%` }} />
      <span className="ui-progress__label">
        {textoValor ?? `${porcentaje} %`}
      </span>
    </div>
  );
}
