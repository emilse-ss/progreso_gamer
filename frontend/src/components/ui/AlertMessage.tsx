import type { ReactNode } from 'react';

type AlertVariant = 'info' | 'error' | 'success' | 'empty';

interface AlertMessageProps {
  variant: AlertVariant;
  children: ReactNode;
}

const variantClasses: Record<AlertVariant, string> = {
  info: 'alert-info',
  error: 'alert-danger',
  success: 'alert-success',
  empty: 'alert-secondary',
};

export function AlertMessage({ variant, children }: AlertMessageProps) {
  return (
    <div
      className={`alert ${variantClasses[variant]}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      {children}
    </div>
  );
}
