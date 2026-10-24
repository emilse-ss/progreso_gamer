interface InsigniaProps {
  texto: string;
  tipo?: 'esquina' | 'contador';
  className?: string;
}

export function Insignia({
  texto,
  tipo = 'esquina',
  className = '',
}: InsigniaProps) {
  const classNames = [
    'ui-badge',
    tipo === 'contador' ? 'ui-badge--count' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span aria-label={tipo === 'contador' ? `Contador: ${texto}` : undefined} className={classNames}>
      {texto}
    </span>
  );
}
