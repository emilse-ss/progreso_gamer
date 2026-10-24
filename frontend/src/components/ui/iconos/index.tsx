import { useId, type ReactNode, type SVGProps } from 'react';

export interface IconoProps extends Omit<SVGProps<SVGSVGElement>, 'title'> {
  titulo?: string;
}

interface IconoBaseProps extends IconoProps {
  children: ReactNode;
}

function IconoBase({ titulo, children, className = '', ...props }: IconoBaseProps) {
  const titleId = useId();
  const classes = ['ui-icon', className].filter(Boolean).join(' ');

  return (
    <svg
      aria-hidden={titulo ? undefined : true}
      aria-labelledby={titulo ? titleId : undefined}
      className={classes}
      fill="none"
      role={titulo ? 'img' : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="var(--ancho-trazo-icono)"
      viewBox="0 0 24 24"
      {...props}
    >
      {titulo && <title id={titleId}>{titulo}</title>}
      {children}
    </svg>
  );
}

export function IconoMando(props: IconoProps) {
  return (
    <IconoBase {...props}>
      <path d="M6 8h12a4 4 0 0 1 3.8 5.3l-1 3a2 2 0 0 1-3.2 1l-2.2-1.8h-4.8l-2.2 1.8a2 2 0 0 1-3.2-1l-1-3A4 4 0 0 1 6 8Z" />
      <path d="M8 11v4m-2-2h4m6-1h.01M18 14h.01" />
    </IconoBase>
  );
}

export function IconoEstrella(props: IconoProps) {
  return (
    <IconoBase {...props}>
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    </IconoBase>
  );
}

export function IconoRayo(props: IconoProps) {
  return (
    <IconoBase {...props}>
      <path d="M13 2 4 13h7l-1 9 10-12h-7l1-8Z" />
    </IconoBase>
  );
}

export function IconoChispa(props: IconoProps) {
  return (
    <IconoBase {...props}>
      <path d="M12 2v5m0 10v5M2 12h5m10 0h5M5 5l3.5 3.5m7 7L19 19m0-14-3.5 3.5m-7 7L5 19" />
      <circle cx="12" cy="12" r="3" />
    </IconoBase>
  );
}

export function IconoTrofeo(props: IconoProps) {
  return (
    <IconoBase {...props}>
      <path d="M8 21h8m-4-4v4m-5-18h10v5a5 5 0 0 1-10 0V3Zm0 3H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4" />
    </IconoBase>
  );
}

export function IconoReloj(props: IconoProps) {
  return (
    <IconoBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </IconoBase>
  );
}

export function IconoCalendario(props: IconoProps) {
  return (
    <IconoBase {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18m-13 4h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </IconoBase>
  );
}

export function IconoInformacion(props: IconoProps) {
  return (
    <IconoBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5m0-8h.01" />
    </IconoBase>
  );
}

export function IconoAdvertencia(props: IconoProps) {
  return (
    <IconoBase {...props}>
      <path d="M10.3 4.3 2.8 17.2A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.8L13.7 4.3a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4m0 3h.01" />
    </IconoBase>
  );
}

export function IconoExito(props: IconoProps) {
  return (
    <IconoBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </IconoBase>
  );
}

export function IconoError(props: IconoProps) {
  return (
    <IconoBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6m0-6-6 6" />
    </IconoBase>
  );
}

export function IconoLupa(props: IconoProps) {
  return (
    <IconoBase {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </IconoBase>
  );
}

export function IconoPapelera(props: IconoProps) {
  return (
    <IconoBase {...props}>
      <path d="M4 7h16m-10 4v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" />
    </IconoBase>
  );
}

export function IconoLapiz(props: IconoProps) {
  return (
    <IconoBase {...props}>
      <path d="m4 16.5-.8 4.3 4.3-.8L20 7.5 16.5 4 4 16.5Z" />
      <path d="m14.5 6 3.5 3.5" />
    </IconoBase>
  );
}

export function IconoLibro(props: IconoProps) {
  return (
    <IconoBase {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" />
      <path d="M4 17a2.5 2.5 0 0 1 2.5-2.5H20M8 7h8m-8 3h8" />
    </IconoBase>
  );
}

export function IconoMas(props: IconoProps) {
  return (
    <IconoBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8m-4-4h8" />
    </IconoBase>
  );
}

export function IconoFlecha(props: IconoProps) {
  return (
    <IconoBase {...props}>
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </IconoBase>
  );
}
