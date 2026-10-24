import { Link } from 'react-router-dom';
import { PageContainer } from '../components/ui/PageContainer';

export function NotFoundPage() {
  return (
    <PageContainer title="Página no encontrada">
      <p>La dirección solicitada no existe.</p>
      <Link className="btn btn-primary" to="/videojuegos">
        Ir a videojuegos
      </Link>
    </PageContainer>
  );
}
