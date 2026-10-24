interface SkeletonProps {
  cantidad?: number;
  variante?: 'texto' | 'bloque' | 'tarjeta' | 'resumen' | 'formulario' | 'detalle';
  className?: string;
}

export function Skeleton({
  cantidad = 1,
  variante = 'texto',
  className = '',
}: SkeletonProps) {
  return (
    <div
      aria-live="polite"
      className={`ui-skeleton-status ${className}`.trim()}
      role="status"
    >
      <span className="visually-hidden">Cargando...</span>
      <div aria-hidden="true" className={`ui-skeleton-layout ui-skeleton-layout--${variante}`}>
        {variante === 'tarjeta' &&
          Array.from({ length: Math.max(0, cantidad) }, (_, index) => (
            <div className="ui-skeleton-card" key={index}>
              <div className="ui-skeleton ui-skeleton--icon" />
              <div className="ui-skeleton-card__content">
                <div className="ui-skeleton ui-skeleton--title" />
                <div className="ui-skeleton ui-skeleton--text" />
                <div className="ui-skeleton ui-skeleton--text ui-skeleton--short" />
              </div>
            </div>
          ))}
        {variante === 'resumen' && (
          <div className="ui-skeleton-summary">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="ui-skeleton-summary__item" key={index}>
                <div className="ui-skeleton ui-skeleton--text" />
                <div className="ui-skeleton ui-skeleton--number" />
              </div>
            ))}
          </div>
        )}
        {variante === 'formulario' &&
          Array.from({ length: Math.max(1, cantidad) }, (_, index) => (
            <div className="ui-skeleton-form__field" key={index}>
              <div className="ui-skeleton ui-skeleton--label" />
              <div className="ui-skeleton ui-skeleton--input" />
            </div>
          ))}
        {variante === 'detalle' && (
          <>
            <div className="ui-skeleton-card">
              <div className="ui-skeleton-card__content">
                <div className="ui-skeleton ui-skeleton--title" />
                <div className="ui-skeleton ui-skeleton--text" />
              </div>
            </div>
            <div className="ui-skeleton-summary">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="ui-skeleton-summary__item" key={index}>
                  <div className="ui-skeleton ui-skeleton--text" />
                  <div className="ui-skeleton ui-skeleton--number" />
                </div>
              ))}
            </div>
            <div className="ui-skeleton-layout ui-skeleton-layout--tarjeta">
              {Array.from({ length: 2 }, (_, index) => (
                <div className="ui-skeleton-card" key={index}>
                  <div className="ui-skeleton ui-skeleton--icon" />
                  <div className="ui-skeleton-card__content">
                    <div className="ui-skeleton ui-skeleton--title" />
                    <div className="ui-skeleton ui-skeleton--text" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {(variante === 'texto' || variante === 'bloque') &&
          Array.from({ length: Math.max(0, cantidad) }, (_, index) => (
            <div
              className={`ui-skeleton ui-skeleton--${variante}`}
              key={index}
            />
          ))}
      </div>
    </div>
  );
}
