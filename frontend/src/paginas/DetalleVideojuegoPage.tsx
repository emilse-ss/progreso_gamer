import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  actualizarLogro,
  agregarLogro,
  eliminarLogro,
  eliminarVideojuego,
  listarPartidasDeVideojuego,
  obtenerResumenVideojuego,
  obtenerVideojuego,
} from '../api/videojuegosApi';
import { AlertMessage } from '../components/ui/AlertMessage';
import { PageContainer } from '../components/ui/PageContainer';
import type {
  PartidaListado,
  Videojuego,
  VideojuegoResumenResponse,
} from '../types';

function formatDate(value: string | null): string {
  if (!value) {
    return 'Sin partidas registradas';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Fecha no disponible';
  }

  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function DetalleVideojuegoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videojuego, setVideojuego] = useState<Videojuego | null>(null);
  const [videojuegoLoading, setVideojuegoLoading] = useState(true);
  const [videojuegoError, setVideojuegoError] = useState<string | null>(null);
  const [resumen, setResumen] = useState<VideojuegoResumenResponse | null>(null);
  const [resumenLoading, setResumenLoading] = useState(true);
  const [resumenError, setResumenError] = useState<string | null>(null);
  const [partidas, setPartidas] = useState<PartidaListado[]>([]);
  const [partidasLoading, setPartidasLoading] = useState(true);
  const [partidasError, setPartidasError] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [eliminarError, setEliminarError] = useState<string | null>(null);
  const [nuevoLogroNombre, setNuevoLogroNombre] = useState('');
  const [errorLogro, setErrorLogro] = useState<string | null>(null);
  const [errorValidacionLogro, setErrorValidacionLogro] = useState<
    string | null
  >(null);
  const [guardandoLogro, setGuardandoLogro] = useState(false);
  const [logroEnProcesoId, setLogroEnProcesoId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setVideojuegoError('No se indicó el identificador del videojuego.');
      setVideojuegoLoading(false);
      return;
    }

    let cancelled = false;
    setVideojuegoLoading(true);
    setVideojuegoError(null);

    void obtenerVideojuego(id)
      .then((resultado) => {
        if (!cancelled) {
          setVideojuego(resultado);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setVideojuegoError(
            errorMessage(error, 'No se pudo cargar el videojuego.'),
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setVideojuegoLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) {
      setResumenError('No se indicó el identificador del videojuego.');
      setResumenLoading(false);
      return;
    }

    let cancelled = false;
    setResumenLoading(true);
    setResumenError(null);

    void obtenerResumenVideojuego(id)
      .then((resultado) => {
        if (!cancelled) {
          setResumen(resultado);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setResumenError(errorMessage(error, 'No se pudo cargar el resumen.'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setResumenLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) {
      setPartidasError('No se indicó el identificador del videojuego.');
      setPartidasLoading(false);
      return;
    }

    let cancelled = false;
    setPartidasLoading(true);
    setPartidasError(null);

    void listarPartidasDeVideojuego(id)
      .then((resultado) => {
        if (!cancelled) {
          setPartidas(resultado);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setPartidasError(
            errorMessage(error, 'No se pudieron cargar las partidas.'),
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPartidasLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDelete() {
    if (!id || !videojuego) {
      return;
    }

    const confirmed = window.confirm(
      `¿Eliminar "${videojuego.nombre}"? También se borrarán todas sus partidas. Esta acción no se puede deshacer.`,
    );
    if (!confirmed) {
      return;
    }

    setEliminando(true);
    setEliminarError(null);
    try {
      await eliminarVideojuego(id);
      navigate('/videojuegos', {
        state: { mensaje: 'Videojuego eliminado correctamente.' },
      });
    } catch (error: unknown) {
      setEliminarError(
        errorMessage(error, 'No se pudo eliminar el videojuego.'),
      );
    } finally {
      setEliminando(false);
    }
  }

  async function handleAddLogro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id || !videojuego || guardandoLogro || logroEnProcesoId) {
      return;
    }

    const nombre = nuevoLogroNombre.trim();
    if (!nombre) {
      setErrorValidacionLogro('El nombre del logro es obligatorio.');
      return;
    }
    if (videojuego.logros.length >= 50) {
      setErrorValidacionLogro('Un videojuego no puede tener más de 50 logros.');
      return;
    }

    setErrorValidacionLogro(null);
    setErrorLogro(null);
    setGuardandoLogro(true);
    try {
      const actualizado = await agregarLogro(id, { nombre });
      setVideojuego(actualizado);
      setNuevoLogroNombre('');
    } catch (error: unknown) {
      setErrorLogro(errorMessage(error, 'No se pudo agregar el logro.'));
    } finally {
      setGuardandoLogro(false);
    }
  }

  async function handleToggleLogro(logroId: string, obtenido: boolean) {
    if (!id || guardandoLogro || logroEnProcesoId) {
      return;
    }

    setErrorLogro(null);
    setErrorValidacionLogro(null);
    setLogroEnProcesoId(logroId);
    try {
      const actualizado = await actualizarLogro(id, logroId, { obtenido });
      setVideojuego(actualizado);
    } catch (error: unknown) {
      setErrorLogro(errorMessage(error, 'No se pudo actualizar el logro.'));
    } finally {
      setLogroEnProcesoId(null);
    }
  }

  async function handleDeleteLogro(logroId: string) {
    if (!id || guardandoLogro || logroEnProcesoId) {
      return;
    }

    setErrorLogro(null);
    setErrorValidacionLogro(null);
    setLogroEnProcesoId(logroId);
    try {
      const actualizado = await eliminarLogro(id, logroId);
      setVideojuego(actualizado);
    } catch (error: unknown) {
      setErrorLogro(errorMessage(error, 'No se pudo eliminar el logro.'));
    } finally {
      setLogroEnProcesoId(null);
    }
  }

  const title = videojuego?.nombre ?? 'Detalle del videojuego';

  return (
    <PageContainer title={title}>
      {videojuegoLoading && (
        <LoadingMessage message="Cargando videojuego..." />
      )}
      {!videojuegoLoading && videojuegoError && (
        <AlertMessage variant="error">{videojuegoError}</AlertMessage>
      )}

      {!videojuegoLoading && videojuego && (
        <>
          <section aria-labelledby="datos-videojuego" className="card mb-4">
            <div className="card-body">
              <h2 className="h5 card-title" id="datos-videojuego">
                Datos del videojuego
              </h2>
              <dl className="row mb-3">
                <dt className="col-sm-3">Plataforma</dt>
                <dd className="col-sm-9">{videojuego.plataforma ?? '—'}</dd>
                <dt className="col-sm-3">Género</dt>
                <dd className="col-sm-9">{videojuego.genero ?? '—'}</dd>
                <dt className="col-sm-3">Estado</dt>
                <dd className="col-sm-9">{videojuego.estado ?? '—'}</dd>
              </dl>
              <div className="d-flex flex-wrap gap-2">
                <Link
                  className="btn btn-outline-primary"
                  to={`/videojuegos/${encodeURIComponent(videojuego._id)}/editar`}
                >
                  Editar
                </Link>
                <Link
                  className="btn btn-primary"
                  to={`/videojuegos/${encodeURIComponent(videojuego._id)}/partidas/nueva`}
                >
                  Registrar partida
                </Link>
                <button
                  className="btn btn-outline-danger"
                  disabled={eliminando}
                  onClick={handleDelete}
                  type="button"
                >
                  {eliminando ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
              {eliminarError && (
                <div className="mt-3">
                  <AlertMessage variant="error">{eliminarError}</AlertMessage>
                </div>
              )}
            </div>
          </section>

          <section aria-labelledby="logros-videojuego" className="mb-4">
            <h2 className="h4" id="logros-videojuego">
              Logros
            </h2>
            {videojuego.logros.length >= 50 && (
              <AlertMessage variant="info">
                Este videojuego ya alcanzó el límite de 50 logros.
              </AlertMessage>
            )}
            {errorValidacionLogro && (
              <AlertMessage variant="error">
                {errorValidacionLogro}
              </AlertMessage>
            )}
            {errorLogro && (
              <AlertMessage variant="error">{errorLogro}</AlertMessage>
            )}
            {videojuego.logros.length === 0 ? (
              <AlertMessage variant="empty">
                Este videojuego aún no tiene logros.
              </AlertMessage>
            ) : (
              <ul className="list-group">
                {videojuego.logros.map((logro) => (
                  <li
                    className="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2"
                    key={logro._id}
                  >
                    <span>{logro.nombre}</span>
                    <div className="d-flex align-items-center gap-3">
                      <div className="form-check mb-0">
                        <input
                          checked={logro.obtenido}
                          className="form-check-input"
                          disabled={guardandoLogro || logroEnProcesoId !== null}
                          id={`logro-obtenido-${logro._id}`}
                          aria-label={`Marcar ${logro.nombre} como obtenido`}
                          onChange={(event) =>
                            void handleToggleLogro(
                              logro._id,
                              event.target.checked,
                            )
                          }
                          type="checkbox"
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`logro-obtenido-${logro._id}`}
                        >
                          Obtenido
                        </label>
                      </div>
                      <button
                        aria-label={`Eliminar logro ${logro.nombre}`}
                        className="btn btn-sm btn-outline-danger"
                        disabled={guardandoLogro || logroEnProcesoId !== null}
                        onClick={() => void handleDeleteLogro(logro._id)}
                        type="button"
                      >
                        {logroEnProcesoId === logro._id
                          ? 'Guardando...'
                          : 'Eliminar'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <form className="mt-3" onSubmit={handleAddLogro} noValidate>
              <label className="form-label" htmlFor="nuevo-logro">
                Agregar logro
              </label>
              <div className="input-group">
                <input
                  className="form-control"
                  disabled={
                    guardandoLogro ||
                    logroEnProcesoId !== null ||
                    videojuego.logros.length >= 50
                  }
                  id="nuevo-logro"
                  onChange={(event) => {
                    setNuevoLogroNombre(event.target.value);
                    setErrorValidacionLogro(null);
                  }}
                  placeholder="Nombre del logro"
                  type="text"
                  value={nuevoLogroNombre}
                />
                <button
                  className="btn btn-outline-primary"
                  disabled={
                    guardandoLogro ||
                    logroEnProcesoId !== null ||
                    videojuego.logros.length >= 50
                  }
                  type="submit"
                >
                  {guardandoLogro ? 'Guardando...' : 'Agregar'}
                </button>
              </div>
            </form>
          </section>
        </>
      )}

      <section aria-labelledby="resumen-videojuego" className="mb-4">
        <h2 className="h4" id="resumen-videojuego">
          Resumen
        </h2>
        {resumenLoading && <LoadingMessage message="Cargando resumen..." />}
        {!resumenLoading && resumenError && (
          <AlertMessage variant="error">{resumenError}</AlertMessage>
        )}
        {!resumenLoading && resumen && (
          <>
            {resumen.totalPartidas === 0 && (
              <AlertMessage variant="empty">
                Aún no hay partidas registradas para este videojuego.
              </AlertMessage>
            )}
            <dl className="row">
              <dt className="col-sm-4">Total de partidas</dt>
              <dd className="col-sm-8">{resumen.totalPartidas}</dd>
              <dt className="col-sm-4">Horas totales</dt>
              <dd className="col-sm-8">{resumen.horasTotales}</dd>
              <dt className="col-sm-4">Última partida</dt>
              <dd className="col-sm-8">
                {formatDate(resumen.ultimaPartida)}
              </dd>
              <dt className="col-sm-4">Avance actual</dt>
              <dd className="col-sm-8">
                {resumen.porcentajeAvanceActual}%
              </dd>
            </dl>
          </>
        )}
      </section>

      <section aria-labelledby="partidas-videojuego">
        <h2 className="h4" id="partidas-videojuego">
          Partidas
        </h2>
        {partidasLoading && <LoadingMessage message="Cargando partidas..." />}
        {!partidasLoading && partidasError && (
          <AlertMessage variant="error">{partidasError}</AlertMessage>
        )}
        {!partidasLoading && !partidasError && partidas.length === 0 && (
          <AlertMessage variant="empty">
            Este videojuego aún no tiene partidas.
          </AlertMessage>
        )}
        {!partidasLoading && !partidasError && partidas.length > 0 && (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Duración</th>
                  <th scope="col">Avance</th>
                  <th scope="col">Notas</th>
                </tr>
              </thead>
              <tbody>
                {partidas.map((partida) => (
                  <tr key={partida._id}>
                    <td>{formatDate(partida.fecha)}</td>
                    <td>{partida.duracionMinutos} min</td>
                    <td>
                      {partida.porcentajeAvance === undefined
                        ? '—'
                        : `${partida.porcentajeAvance}%`}
                    </td>
                    <td>{partida.notas || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageContainer>
  );
}

function LoadingMessage({ message }: { message: string }) {
  return (
    <div className="d-flex align-items-center gap-2 mb-3" role="status">
      <span className="spinner-border spinner-border-sm" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
