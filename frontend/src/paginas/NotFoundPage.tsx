import { Link } from 'react-router-dom';
import { AlertMessage } from '../components/ui/AlertMessage';
import { PageContainer } from '../components/ui/PageContainer';

export function NotFoundPage() {
  return (
    <PageContainer title="Página no encontrada">
      <AlertMessage variant="empty">
        <div className="not-found-message">
          <h2>No encontramos esta página</h2>
          <p>La dirección puede ser incorrecta o el contenido ya no existe.</p>
          <Link className="ui-button ui-button--primary" to="/videojuegos">
            Volver a mis juegos
          </Link>
        </div>
      </AlertMessage>
    </PageContainer>
  );
}
