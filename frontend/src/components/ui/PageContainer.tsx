import type { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  children?: ReactNode;
}

export function PageContainer({ title, children }: PageContainerProps) {
  return (
    <div className="container py-4">
      <h1 className="mb-4">{title}</h1>
      {children}
    </div>
  );
}
