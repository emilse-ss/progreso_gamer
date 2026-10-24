import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarVideojuegos } from '../api/videojuegosApi';
import { AlertMessage } from '../components/ui/AlertMessage';
import { PageContainer } from '../components/ui/PageContainer';
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

  const filtrosActivos = plataforma !== '' || genero !== '' || estado !== '';

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
  }, [plataforma, genero, estado]);

  return (
    <PageContainer title="Videojuegos">
      <div className="d-flex justify-content-end mb-3">
        <Link className="btn btn-primary" to="/videojuegos/nuevo">
          Nuevo videojuego
        </Link>
      </div>

      <section aria-label="Filtros de videojuegos" className="card mb-4">
        <div className="card-body">
          <h2 className="h5 card-title">Filtrar videojuegos</h2>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label" htmlFor="filtro-plataforma">
                Plataforma
              </label>
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
            <div className="col-md-4">
              <label className="form-label" htmlFor="filtro-genero">
                Género
              </label>
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
            <div className="col-md-4">
              <label className="form-label" htmlFor="filtro-estado">
                Estado
              </label>
              <select
                className="form-select"
                id="filtro-estado"
                value={estado}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value === '' || isEnumValue(value, ESTADOS)) {
                    setEstado(value);
                  }
                }}
              >
                <option value="">Todos los estados</option>
                {ESTADOS.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {ETIQUETAS_ESTADO[opcion]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {loading && (
        <div className="d-flex align-items-center gap-2" role="status">
          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
          <span>Cargando videojuegos...</span>
        </div>
      )}

      {!loading && error && <AlertMessage variant="error">{error}</AlertMessage>}

      {!loading && !error && videojuegos.length === 0 && (
        <AlertMessage variant="empty">
          {filtrosActivos
            ? 'No hay videojuegos que coincidan con los filtros seleccionados.'
            : 'Aún no hay videojuegos registrados.'}
        </AlertMessage>
      )}

      {!loading && !error && videojuegos.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Plataforma</th>
                <th scope="col">Género</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {videojuegos.map((videojuego) => (
                <tr key={videojuego._id}>
                  <td>
                    <Link to={`/videojuegos/${encodeURIComponent(videojuego._id)}`}>
                      {videojuego.nombre}
                    </Link>
                  </td>
                  <td>{videojuego.plataforma ?? '—'}</td>
                  <td>
                    {videojuego.genero
                      ? ETIQUETAS_GENERO[videojuego.genero]
                      : '—'}
                  </td>
                  <td>
                    {videojuego.estado
                      ? ETIQUETAS_ESTADO[videojuego.estado]
                      : '—'}
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
