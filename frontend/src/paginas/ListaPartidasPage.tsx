import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eliminarPartida, listarPartidas } from '../api/partidasApi';
import { AlertMessage } from '../components/ui/AlertMessage';
import { Boton } from '../components/ui/Boton';
import { CardItem } from '../components/ui/CardItem';
import { IconoCalendario, IconoMando, IconoReloj } from '../components/ui/iconos';
import { ModalConfirmacion } from '../components/ui/ModalConfirmacion';
import { PageContainer } from '../components/ui/PageContainer';
import { Skeleton } from '../components/ui/Skeleton';
import type { PartidaListado } from '../types';

export function ListaPartidasPage() {
  const [partidas, setPartidas] = useState<PartidaListado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [partidaPendienteEliminar, setPartidaPendienteEliminar] =
    useState<PartidaListado | null>(null);
  const [reintento, setReintento] = useState(0);

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
  }, [reintento]);

  async function handleDelete(partida: PartidaListado) {
    setPartidaPendienteEliminar(null);
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
      <div className="sessions-toolbar">
        <Link className="ui-button ui-button--primary" to="/partidas/nueva">
          Registrar partida
        </Link>
      </div>

      {errorEliminar && <AlertMessage variant="error">{errorEliminar}</AlertMessage>}
      {loading && (
        <Skeleton cantidad={4} className="sessions-loading" variante="tarjeta" />
      )}
      {!loading && error && (
        <AlertMessage variant="error">
          <p>{error}</p>
          <div className="ui-alert__actions">
            <Boton onClick={() => setReintento((count) => count + 1)}>
              Reintentar
            </Boton>
          </div>
        </AlertMessage>
      )}
      {!loading && !error && partidas.length === 0 && (
        <AlertMessage variant="empty">
          <p>Aún no tienes partidas. Registra la primera.</p>
          <div className="ui-alert__actions">
            <Link className="ui-button ui-button--primary" to="/partidas/nueva">
              Registrar la primera partida
            </Link>
          </div>
        </AlertMessage>
      )}
      {!loading && !error && partidas.length > 0 && (
        <div aria-label="Lista de partidas" className="sessions-list">
          {partidas.map((partida) => (
            <CardItem
              accion={
                <Boton
                  disabled={eliminandoId === partida._id}
                  onClick={() => setPartidaPendienteEliminar(partida)}
                  variante="peligro"
                >
                  {eliminandoId === partida._id ? 'Eliminando...' : 'Eliminar'}
                </Boton>
              }
              className="session-card"
              detalles={
                <>
                  <span>
                    <IconoCalendario aria-hidden="true" />
                    {formatDate(partida.fecha)}
                  </span>
                  <span>
                    <IconoReloj aria-hidden="true" />
                    {partida.duracionMinutos} min
                  </span>
                  {partida.notas && <span>{partida.notas}</span>}
                </>
              }
              etiquetaProgreso="Avance total"
              icono={<IconoMando />}
              key={partida._id}
              progreso={partida.porcentajeAvance}
              titulo={
                <Link
                  className="session-card__game-link"
                  to={`/videojuegos/${encodeURIComponent(partida.videojuego._id)}`}
                >
                  {partida.videojuego.nombre}
                </Link>
              }
            />
          ))}
        </div>
      )}
      <ModalConfirmacion
        abierto={partidaPendienteEliminar !== null}
        confirmando={partidaPendienteEliminar?._id === eliminandoId}
        onCancelar={() => setPartidaPendienteEliminar(null)}
        onConfirmar={() => {
          if (partidaPendienteEliminar) {
            void handleDelete(partidaPendienteEliminar);
          }
        }}
        titulo="Eliminar partida"
      >
        {partidaPendienteEliminar && (
          <>
            ¿Eliminar la partida de{' '}
            <strong>{partidaPendienteEliminar.videojuego.nombre}</strong> del{' '}
            {formatDate(partidaPendienteEliminar.fecha)}?
          </>
        )}
      </ModalConfirmacion>
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
