import type { ButtonHTMLAttributes } from 'react';

export type BotonVariante = 'primario' | 'neutro' | 'secundario' | 'peligro';
export type BotonTamaño = 'pequeno' | 'mediano' | 'grande';

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: BotonVariante;
  tamaño?: BotonTamaño;
}

const variantClasses: Record<BotonVariante, string> = {
  primario: 'ui-button--primary',
  neutro: 'ui-button--neutral',
  secundario: 'ui-button--secondary',
  peligro: 'ui-button--danger',
};

const sizeClasses: Record<BotonTamaño, string> = {
  pequeno: 'ui-button--small',
  mediano: '',
  grande: 'ui-button--large',
};

export function Boton({
  variante = 'primario',
  tamaño = 'mediano',
  className = '',
  type = 'button',
  ...props
}: BotonProps) {
  const classes = [
    'ui-button',
    variantClasses[variante],
    sizeClasses[tamaño],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <button className={classes} type={type} {...props} />;
}
