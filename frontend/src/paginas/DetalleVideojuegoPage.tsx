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
import type { EstadoVideojuego, Genero } from '../enums';
import { AlertMessage } from '../components/ui/AlertMessage';
import { BarraProgreso } from '../components/ui/BarraProgreso';
import { Boton } from '../components/ui/Boton';
import { CardItem } from '../components/ui/CardItem';
import { EtiquetaSeccion } from '../components/ui/EtiquetaSeccion';
import { Insignia } from '../components/ui/Insignia';
import { ModalConfirmacion } from '../components/ui/ModalConfirmacion';
import { PageContainer } from '../components/ui/PageContainer';
import { IconoCalendario, IconoMando, IconoReloj, IconoTrofeo } from '../components/ui/iconos';
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

const ETIQUETAS_ESTADO: Record<EstadoVideojuego, string> = {
  jugando: 'Jugando',
  pausado: 'Pausado',
  completado: 'Completado',
  abandonado: 'Abandonado',
};

const ETIQUETAS_GENERO: Record<Genero, string> = {
  accion: 'Acción',
  rol: 'Rol',
  estrategia: 'Estrategia',
  puzzle: 'Puzzle',
  deportes: 'Deportes',
  otro: 'Otro',
};

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
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
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

    setConfirmacionAbierta(false);
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

  const title = videojuego ? (
    <>
      <span>{videojuego.nombre}</span>
      <span
        className={`game-status game-status--${videojuego.estado ?? 'sin-estado'} detail-heading__status`}
      >
        {videojuego.estado
          ? ETIQUETAS_ESTADO[videojuego.estado]
          : 'Sin estado'}
      </span>
    </>
  ) : (
    'Detalle del videojuego'
  );

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
          <section aria-label="Datos del videojuego" className="detail-info">
            <div className="detail-info__meta">
              <span><IconoMando aria-hidden="true" /> {videojuego.plataforma ?? 'Plataforma sin especificar'}</span>
              <span>
                {videojuego.genero
                  ? ETIQUETAS_GENERO[videojuego.genero]
                  : 'Género sin especificar'}
              </span>
            </div>
            <div className="detail-actions">
              <Link
                className="ui-button ui-button--secondary"
                to={`/videojuegos/${encodeURIComponent(videojuego._id)}/editar`}
              >
                Editar
              </Link>
              <Link
                className="ui-button ui-button--primary"
                to={`/videojuegos/${encodeURIComponent(videojuego._id)}/partidas/nueva`}
              >
                Registrar partida
              </Link>
              <Boton
                disabled={eliminando}
                onClick={() => setConfirmacionAbierta(true)}
                variante="peligro"
              >
                {eliminando ? 'Eliminando...' : 'Eliminar'}
              </Boton>
            </div>
            {eliminarError && (
              <AlertMessage variant="error">{eliminarError}</AlertMessage>
            )}
          </section>

          <section aria-labelledby="logros-videojuego" className="detail-block">
            <header className="detail-block__header">
              <h2 className="detail-block__heading" id="logros-videojuego">
                <EtiquetaSeccion>Logros</EtiquetaSeccion>
              </h2>
              <Insignia
                className="achievement-count"
                texto={`${videojuego.logros.length}/50`}
                tipo="contador"
              />
            </header>
            {videojuego.logros.length >= 50 && (
              <AlertMessage variant="info">
                Este videojuego ya alcanzó el límite de 50 logros.
              </AlertMessage>
            )}
            {errorValidacionLogro && (
              <AlertMessage variant="error">{errorValidacionLogro}</AlertMessage>
            )}
            {errorLogro && (
              <AlertMessage variant="error">{errorLogro}</AlertMessage>
            )}
            {videojuego.logros.length === 0 ? (
              <AlertMessage variant="empty">
                Este videojuego aún no tiene logros.
              </AlertMessage>
            ) : (
              <div className="detail-card-list">
                {videojuego.logros.map((logro) => (
                  <CardItem
                    accion={
                      <div className="achievement-actions">
                        <Boton
                          aria-label={`Cambiar estado de ${logro.nombre}; actualmente ${logro.obtenido ? 'obtenido' : 'pendiente'}`}
                          disabled={
                            guardandoLogro || logroEnProcesoId !== null
                          }
                          onClick={() =>
                            void handleToggleLogro(logro._id, !logro.obtenido)
                          }
                          variante={logro.obtenido ? 'primario' : 'neutro'}
                        >
                          {logroEnProcesoId === logro._id
                            ? 'Guardando...'
                            : logro.obtenido
                              ? 'Obtenido'
                              : 'Pendiente'}
                        </Boton>
                        <Boton
                          aria-label={`Eliminar logro ${logro.nombre}`}
                          disabled={
                            guardandoLogro || logroEnProcesoId !== null
                          }
                          onClick={() => void handleDeleteLogro(logro._id)}
                          variante="peligro"
                        >
                          Eliminar
                        </Boton>
                      </div>
                    }
                    className="detail-item"
                    icono={<IconoTrofeo />}
                    key={logro._id}
                    titulo={logro.nombre}
                  />
                ))}
              </div>
            )}
            <form
              className="achievement-form"
              onSubmit={handleAddLogro}
              noValidate
            >
              <label htmlFor="nuevo-logro">Agregar logro</label>
              <div className="achievement-form__row">
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
                <Boton
                  disabled={
                    guardandoLogro ||
                    logroEnProcesoId !== null ||
                    videojuego.logros.length >= 50
                  }
                  type="submit"
                >
                  {guardandoLogro ? 'Guardando...' : 'Agregar'}
                </Boton>
              </div>
            </form>
          </section>
        </>
      )}

      <section aria-labelledby="resumen-videojuego" className="detail-block">
        <h2 className="detail-block__heading" id="resumen-videojuego">
          <EtiquetaSeccion>Resumen</EtiquetaSeccion>
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
            <dl className="summary-grid">
              <div className="summary-stat">
                <dt>Total de partidas</dt>
                <dd>{resumen.totalPartidas}</dd>
              </div>
              <div className="summary-stat">
                <dt>Horas totales</dt>
                <dd>{resumen.horasTotales}</dd>
              </div>
              <div className="summary-stat summary-stat--date">
                <dt>Última partida</dt>
                <dd>{formatDate(resumen.ultimaPartida)}</dd>
              </div>
              <div className="summary-stat summary-stat--progress">
                <dt>Avance actual</dt>
                <dd>{resumen.porcentajeAvanceActual} %</dd>
                <BarraProgreso
                  etiqueta="Avance actual"
                  valor={resumen.porcentajeAvanceActual}
                />
              </div>
            </dl>
          </>
        )}
      </section>

      <section aria-labelledby="partidas-videojuego" className="detail-block">
        <div className="detail-block__header">
          <h2 className="detail-block__heading" id="partidas-videojuego">
            <EtiquetaSeccion>Partidas</EtiquetaSeccion>
          </h2>
          {videojuego && (
            <Link
              className="ui-button ui-button--primary"
              to={`/videojuegos/${encodeURIComponent(videojuego._id)}/partidas/nueva`}
            >
              Registrar partida
            </Link>
          )}
        </div>
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
          <div className="detail-card-list">
            {partidas.map((partida) => (
              <CardItem
                className="detail-item"
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
                etiquetaProgreso="Avance de la partida"
                icono={<IconoMando />}
                key={partida._id}
                progreso={partida.porcentajeAvance}
                titulo="Sesión de juego"
              />
            ))}
          </div>
        )}
      </section>
      <ModalConfirmacion
        abierto={confirmacionAbierta}
        confirmando={eliminando}
        onCancelar={() => setConfirmacionAbierta(false)}
        onConfirmar={() => void handleDelete()}
        titulo="Eliminar videojuego"
      >
        ¿Eliminar &quot;{videojuego?.nombre}&quot;? También se borrarán todas
        sus partidas. Esta acción no se puede deshacer.
      </ModalConfirmacion>
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
