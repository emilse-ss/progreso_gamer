import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarVideojuegos } from '../api/videojuegosApi';
import { AlertMessage } from '../components/ui/AlertMessage';
import { Boton } from '../components/ui/Boton';
import { CardItem } from '../components/ui/CardItem';
import { Insignia } from '../components/ui/Insignia';
import { PageContainer } from '../components/ui/PageContainer';
import { Pestanas, type PestanaOpcion } from '../components/ui/Pestanas';
import { Skeleton } from '../components/ui/Skeleton';
import { IconoMando, IconoRayo } from '../components/ui/iconos';
import {
  ESTADOS,
  GENEROS,
  PLATAFORMAS,
  type EstadoVideojuego,
  type Genero,
  type Plataforma,
} from '../enums';
import type { Videojuego } from '../types';

function isEnumValue<T extends readonly string[]>(
  value: string,
  values: T,
): value is T[number] {
  return values.some((option) => option === value);
}

export function ListaVideojuegosPage() {
  const [plataforma, setPlataforma] = useState<Plataforma | ''>('');
  const [genero, setGenero] = useState<Genero | ''>('');
  const [estado, setEstado] = useState<EstadoVideojuego | ''>('');
  const [videojuegos, setVideojuegos] = useState<Videojuego[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reintento, setReintento] = useState(0);

  const filtrosActivos = plataforma !== '' || genero !== '' || estado !== '';
  const opcionesEstado: PestanaOpcion[] = [
    { valor: '', etiqueta: 'Todos' },
    ...ESTADOS.map((valor) => ({
      valor,
      etiqueta: ETIQUETAS_ESTADO[valor],
    })),
  ];

  useEffect(() => {
    let cancelled = false;

    async function cargarVideojuegos() {
      setLoading(true);
      setError(null);

      try {
        const resultado = await listarVideojuegos({
          ...(plataforma ? { plataforma } : {}),
          ...(genero ? { genero } : {}),
          ...(estado ? { estado } : {}),
        });
        if (!cancelled) {
          setVideojuegos(resultado);
        }
      } catch (caughtError: unknown) {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'No se pudieron cargar los videojuegos.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void cargarVideojuegos();

    return () => {
      cancelled = true;
    };
  }, [plataforma, genero, estado, reintento]);

  return (
    <PageContainer title="Videojuegos">
      <section aria-labelledby="games-hero-title" className="games-hero">
        <div aria-hidden="true" className="games-hero__rays">
          <IconoRayo />
          <IconoRayo />
          <IconoRayo />
        </div>
        <h2 className="games-hero__title" id="games-hero-title">
          Tu progreso, <span>tu</span> aventura
        </h2>
        <p className="games-hero__subtitle">Cada partida cuenta.</p>
      </section>

      <div className="games-toolbar">
        <Link className="ui-button ui-button--primary" to="/videojuegos/nuevo">
          <span aria-hidden="true" className="games-toolbar__plus">+</span>
          Nuevo videojuego
        </Link>
      </div>

      <section aria-label="Filtros de videojuegos" className="games-filters">
        <h2 className="games-filters__title">Filtrar videojuegos</h2>
        <div className="games-filter-selects">
          <div className="games-filter-field">
            <label htmlFor="filtro-plataforma">Plataforma</label>
            <select
              className="form-select"
              id="filtro-plataforma"
              value={plataforma}
              onChange={(event) => {
                const value = event.target.value;
                if (value === '' || isEnumValue(value, PLATAFORMAS)) {
                  setPlataforma(value);
                }
              }}
            >
              <option value="">Todas las plataformas</option>
              {PLATAFORMAS.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
          </div>
          <div className="games-filter-field">
            <label htmlFor="filtro-genero">Género</label>
            <select
              className="form-select"
              id="filtro-genero"
              value={genero}
              onChange={(event) => {
                const value = event.target.value;
                if (value === '' || isEnumValue(value, GENEROS)) {
                  setGenero(value);
                }
              }}
            >
              <option value="">Todos los géneros</option>
              {GENEROS_CON_ETIQUETA.map(({ valor, etiqueta }) => (
                <option key={valor} value={valor}>
                  {etiqueta}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="games-filter-state">
          <span className="games-filter-state__label">Estado</span>
          <Pestanas
            etiqueta="Filtrar por estado"
            opciones={opcionesEstado}
            onChange={(value) => {
              if (value === '' || isEnumValue(value, ESTADOS)) {
                setEstado(value);
              }
            }}
            valor={estado}
          />
        </div>
      </section>

      {loading && (
        <Skeleton cantidad={4} className="games-loading" variante="tarjeta" />
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

      {!loading && !error && videojuegos.length === 0 && (
        <AlertMessage variant="empty">
          <p>
            {filtrosActivos
              ? 'Ningún juego coincide con los filtros.'
              : 'Aún no tienes videojuegos. Registra tu primer juego.'}
          </p>
          <div className="ui-alert__actions">
            {filtrosActivos ? (
              <Boton
                onClick={() => {
                  setPlataforma('');
                  setGenero('');
                  setEstado('');
                }}
              >
                Limpiar filtros
              </Boton>
            ) : (
              <Link className="ui-button ui-button--primary" to="/videojuegos/nuevo">
                Nuevo videojuego
              </Link>
            )}
          </div>
        </AlertMessage>
      )}

      {!loading && !error && videojuegos.length > 0 && (
        <div aria-label="Videojuegos" className="games-grid">
          {videojuegos.map((videojuego) => (
            <CardItem
              accion={
                <Link
                  aria-label={`Ver detalles de ${videojuego.nombre}`}
                  className="ui-button ui-button--secondary games-card__link"
                  to={`/videojuegos/${encodeURIComponent(videojuego._id)}`}
                >
                  Ver
                </Link>
              }
              className="games-card"
              detalles={
                <>
                  <span>
                    {videojuego.plataforma ?? 'Plataforma sin especificar'}
                  </span>
                  <span>
                    {videojuego.genero
                      ? ETIQUETAS_GENERO[videojuego.genero]
                      : 'Género sin especificar'}
                  </span>
                  <span
                    className={`game-status game-status--${videojuego.estado ?? 'sin-estado'}`}
                  >
                    {videojuego.estado
                      ? ETIQUETAS_ESTADO[videojuego.estado]
                      : 'Sin estado'}
                  </span>
                </>
              }
              icono={<IconoMando />}
              insignia={
                videojuego.estado === 'completado' ? (
                  <Insignia texto="100 %" />
                ) : undefined
              }
              key={videojuego._id}
              titulo={
                <Link
                  className="games-card__title-link"
                  to={`/videojuegos/${encodeURIComponent(videojuego._id)}`}
                >
                  {videojuego.nombre}
                </Link>
              }
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

const ETIQUETAS_GENERO: Record<Genero, string> = {
  accion: 'Acción',
  rol: 'Rol',
  estrategia: 'Estrategia',
  puzzle: 'Puzzle',
  deportes: 'Deportes',
  otro: 'Otro',
};

const GENEROS_CON_ETIQUETA = GENEROS.map((valor) => ({
  valor,
  etiqueta: ETIQUETAS_GENERO[valor],
}));

const ETIQUETAS_ESTADO: Record<EstadoVideojuego, string> = {
  jugando: 'Jugando',
  pausado: 'Pausado',
  completado: 'Completado',
  abandonado: 'Abandonado',
};
