import type { ReactNode } from 'react';
import { EncabezadoPanel } from './EncabezadoPanel';

interface PageContainerProps {
  title: string;
  children?: ReactNode;
}

export function PageContainer({ title, children }: PageContainerProps) {
  return (
    <div className="page-panel">
      <EncabezadoPanel titulo={title} />
      <div className="page-panel__content">{children}</div>
    </div>
  );
}
