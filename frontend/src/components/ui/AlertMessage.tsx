import type { ReactNode } from 'react';
import {
  IconoAdvertencia,
  IconoError,
  IconoExito,
  IconoInformacion,
} from './iconos';

export type AlertVariant = 'info' | 'error' | 'success' | 'empty' | 'warning';

interface AlertMessageProps {
  variant: AlertVariant;
  children: ReactNode;
}

const variantIcons: Record<AlertVariant, ReactNode> = {
  info: <IconoInformacion />,
  error: <IconoError />,
  success: <IconoExito />,
  empty: <IconoInformacion />,
  warning: <IconoAdvertencia />,
};

export function AlertMessage({ variant, children }: AlertMessageProps) {
  return (
    <div
      className={`ui-alert ui-alert--${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <div aria-hidden="true" className="ui-alert__stripe" />
      <div className="ui-alert__content">
        <span aria-hidden="true" className="ui-alert__icon">
          {variant === 'success' ? <IconoExito /> : variantIcons[variant]}
        </span>
        <div>{children}</div>
      </div>
    </div>
  );
}
