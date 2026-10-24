import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eliminarPartida, listarPartidas } from '../api/partidasApi';
import { AlertMessage } from '../components/ui/AlertMessage';
import { PageContainer } from '../components/ui/PageContainer';
import type { PartidaListado } from '../types';

export function ListaPartidasPage() {
  const [partidas, setPartidas] = useState<PartidaListado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void listarPartidas()
      .then((result) => {
        if (!cancelled) setPartidas(result);
      })
      .catch((caughtError: unknown) => {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'No se pudieron cargar las partidas.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(partida: PartidaListado) {
    const confirmed = window.confirm(
      `¿Eliminar la partida de ${partida.videojuego.nombre} del ${formatDate(partida.fecha)}?`,
    );
    if (!confirmed) return;

    setEliminandoId(partida._id);
    setErrorEliminar(null);
    try {
      await eliminarPartida(partida._id);
      setPartidas((current) =>
        current.filter((item) => item._id !== partida._id),
      );
    } catch (caughtError: unknown) {
      setErrorEliminar(
        caughtError instanceof Error
          ? caughtError.message
          : 'No se pudo eliminar la partida.',
      );
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <PageContainer title="Partidas">
      <div className="d-flex justify-content-end mb-3">
        <Link className="btn btn-primary" to="/partidas/nueva">
          Nueva partida
        </Link>
      </div>

      {errorEliminar && <AlertMessage variant="error">{errorEliminar}</AlertMessage>}
      {loading && (
        <div className="d-flex align-items-center gap-2" role="status">
          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
          <span>Cargando partidas...</span>
        </div>
      )}
      {!loading && error && <AlertMessage variant="error">{error}</AlertMessage>}
      {!loading && !error && partidas.length === 0 && (
        <AlertMessage variant="empty">
          Aún no hay partidas registradas.
        </AlertMessage>
      )}
      {!loading && !error && partidas.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th scope="col">Videojuego</th>
                <th scope="col">Fecha</th>
                <th scope="col">Duración</th>
                <th scope="col">Avance</th>
                <th scope="col">Notas</th>
                <th scope="col">
                  <span className="visually-hidden">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {partidas.map((partida) => (
                <tr key={partida._id}>
                  <td>
                    <Link
                      to={`/videojuegos/${encodeURIComponent(partida.videojuego._id)}`}
                    >
                      {partida.videojuego.nombre}
                    </Link>
                  </td>
                  <td>{formatDate(partida.fecha)}</td>
                  <td>{partida.duracionMinutos} min</td>
                  <td>
                    {partida.porcentajeAvance === undefined
                      ? '—'
                      : `${partida.porcentajeAvance}%`}
                  </td>
                  <td>{partida.notas || '—'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      disabled={eliminandoId === partida._id}
                      onClick={() => void handleDelete(partida)}
                      type="button"
                    >
                      {eliminandoId === partida._id
                        ? 'Eliminando...'
                        : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
