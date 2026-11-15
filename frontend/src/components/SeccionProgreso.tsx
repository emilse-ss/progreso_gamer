import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarMetasDeVideojuego } from '../api/metasApi';
import { obtenerProgresoSemanal } from '../api/videojuegosApi';
import type { EstadoVideojuego } from '../enums';
import type { Meta, ProgresoSemanal } from '../types';
import { formatearRangoSemana } from '../utils/formatoFecha';
import { AlertMessage } from './ui/AlertMessage';
import { BarraProgreso } from './ui/BarraProgreso';
import { Boton } from './ui/Boton';
import { EtiquetaSeccion } from './ui/EtiquetaSeccion';
import { IconoTrofeo } from './ui/iconos';
import { Skeleton } from './ui/Skeleton';

interface SeccionProgresoProps {
  videojuegoId: string;
  estadoVideojuego?: EstadoVideojuego;
  /** Clave de recarga: cambia cuando cambian las partidas (DEBE-6). */
  versionPartidas?: number;
  /** Clave de recarga: cambia cuando cambian las metas (DEBE-7). */
  versionMetas: number;
  alCambiarMetas: () => void;
}

const ESTADOS_SIN_META: EstadoVideojuego[] = ['completado', 'abandonado'];

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

const dias = (n: number) => `${n} ${n === 1 ? 'día' : 'días'}`;

export function SeccionProgreso({
  videojuegoId,
  estadoVideojuego,
  versionPartidas = 0,
  versionMetas,
}: SeccionProgresoProps) {
  const [progreso, setProgreso] = useState<ProgresoSemanal | null>(null);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reintento, setReintento] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setCargando(true);
    setError(null);

    void Promise.all([
      obtenerProgresoSemanal(videojuegoId),
      listarMetasDeVideojuego(videojuegoId),
    ])
      .then(([progresoSemanal, metasDelJuego]) => {
        if (!cancelled) {
          setProgreso(progresoSemanal);
          setMetas(metasDelJuego);
        }
      })
      .catch((causa: unknown) => {
        if (!cancelled) {
          setError(
            errorMessage(causa, 'No se pudo cargar el progreso de la semana.'),
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCargando(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [videojuegoId, versionPartidas, versionMetas, reintento]);

  const metaActiva = metas.find((meta) => meta.activa);
  const juegoSinMetaPosible =
    estadoVideojuego !== undefined &&
    ESTADOS_SIN_META.includes(estadoVideojuego);

  return (
    <section aria-labelledby="progreso-semana" className="detail-block">
      <header className="detail-block__header">
        <h2 className="detail-block__heading" id="progreso-semana">
          <EtiquetaSeccion>Esta semana</EtiquetaSeccion>
        </h2>
        {progreso && (
          <span className="progress-week__rango">
            {formatearRangoSemana(progreso.semana.inicio, progreso.semana.fin)}
          </span>
        )}
      </header>

      {cargando && <Skeleton variante="resumen" />}

      {!cargando && error && (
        <AlertMessage variant="error">
          <p>No se pudo cargar el progreso de la semana. {error}</p>
          <div className="ui-alert__actions">
            <Boton onClick={() => setReintento((count) => count + 1)}>
              Reintentar
            </Boton>
          </div>
        </AlertMessage>
      )}

      {!cargando && !error && progreso && (
        <div className="progress-week">
          {progreso.meta === null &&
            (juegoSinMetaPosible ? (
              <AlertMessage variant="info">
                Este videojuego está {estadoVideojuego}: no puede tener una meta
                activa.
              </AlertMessage>
            ) : (
              <AlertMessage variant="empty">
                <p>
                  Este videojuego no tiene una meta activa. Fija una para seguir
                  tu semana.
                </p>
                <div className="ui-alert__actions">
                  <Link
                    className="ui-button ui-button--primary"
                    to={`/videojuegos/${encodeURIComponent(videojuegoId)}/meta/nueva`}
                  >
                    Crear meta
                  </Link>
                </div>
              </AlertMessage>
            ))}

          {progreso.horasSemana === 0 && progreso.diasJugadosSemana === 0 && (
            <AlertMessage variant="empty">
              Aún no juegas esta semana. Registra una partida para empezar.
            </AlertMessage>
          )}

          {progreso.meta !== null && (
            <div className="progress-week__barras">
              <div>
                <p className="progress-week__titulo-barra">
                  Horas de la semana
                </p>
                <BarraProgreso
                  etiqueta="Horas de la semana"
                  textoValor={`${progreso.horasSemana} h de ${progreso.meta.horasSemanales} h (${progreso.porcentajeHoras} %)`}
                  valor={progreso.porcentajeHoras ?? 0}
                />
              </div>
              <div>
                <p className="progress-week__titulo-barra">Días jugados</p>
                <BarraProgreso
                  etiqueta="Días jugados"
                  textoValor={`${progreso.diasJugadosSemana} de ${dias(progreso.meta.diasPorSemana)}`}
                  // Único valor derivado: el ancho visual de la barra (NO-DEBE-2).
                  valor={Math.min(
                    100,
                    Math.round(
                      (progreso.diasJugadosSemana /
                        progreso.meta.diasPorSemana) *
                        100,
                    ),
                  )}
                />
              </div>
              {progreso.metaCumplida ? (
                <AlertMessage variant="success">
                  ¡Meta de la semana cumplida!
                </AlertMessage>
              ) : (
                <p className="progress-week__cumplimiento">
                  Meta de la semana aún no cumplida.
                </p>
              )}
            </div>
          )}

          <dl className="summary-grid">
            {progreso.meta === null && (
              <>
                <div className="summary-stat">
                  <dt>Horas esta semana</dt>
                  <dd>{progreso.horasSemana} h</dd>
                </div>
                <div className="summary-stat">
                  <dt>Días jugados</dt>
                  <dd>{progreso.diasJugadosSemana}</dd>
                </div>
              </>
            )}
            <div className="summary-stat">
              <dt>Racha actual</dt>
              <dd>{dias(progreso.rachaActual)}</dd>
            </div>
            <div className="summary-stat">
              <dt>Mejor racha</dt>
              <dd>{dias(progreso.mejorRacha)}</dd>
            </div>
          </dl>

          {progreso.meta !== null && metaActiva && (
            <>
              <div>
                <h3 className="progress-week__subtitulo">Hitos</h3>
                {progreso.hitos.length === 0 ? (
                  <p className="progress-week__vacio">
                    Esta meta no tiene hitos.
                  </p>
                ) : (
                  <ul className="progress-week__hitos">
                    {progreso.hitos.map((hito) => (
                      <li
                        className={`progress-week__hito${hito.alcanzado ? ' progress-week__hito--alcanzado' : ''}`}
                        key={hito.porcentajeObjetivo}
                      >
                        <span>
                          {hito.descripcion}{' '}
                          <span className="progress-week__objetivo">
                            · objetivo {hito.porcentajeObjetivo} %
                          </span>
                        </span>
                        <span className="progress-week__hito-estado">
                          {hito.alcanzado && (
                            <IconoTrofeo className="ui-icon--small" />
                          )}
                          {hito.alcanzado ? 'Alcanzado' : 'Pendiente'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="detail-actions">
                <Link
                  className="ui-button ui-button--neutral"
                  to={`/metas/${encodeURIComponent(metaActiva._id)}/editar`}
                >
                  Editar meta
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
