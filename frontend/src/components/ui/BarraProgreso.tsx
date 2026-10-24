interface BarraProgresoProps {
  valor: number;
  etiqueta?: string;
  className?: string;
}

export function BarraProgreso({
  valor,
  etiqueta = 'Progreso',
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
      className={`ui-progress ${className}`.trim()}
      role="progressbar"
    >
      <div className="ui-progress__fill" style={{ width: `${porcentaje}%` }} />
      <span className="ui-progress__label">{porcentaje} %</span>
    </div>
  );
}
